// lib/auth/onboarding-gate.ts
// ============================================================================
// CANONICAL ONBOARDING GATE - SINGLE SOURCE OF TRUTH
// ============================================================================
// This is the ONLY place that decides onboarding routing.
// NO redirects anywhere else. NO useEffect redirects. NO redirects in pages.
//
// CRITICAL: We do NOT trust boolean flags (mentor_onboarding_completed, etc.)
// because they are unreliable due to past migrations, RLS behavior, and
// silent update failures. Instead, we DERIVE completion from actual fields.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { supabaseAdmin } from "@/lib/supabase/admin"

// Profile fields needed for routing decisions
interface OnboardingProfile {
    role: string | null
    // Student fields
    learning_goal: string | null
    motivation_type: string | null
    current_skill_level: string | null
    time_commitment: string | null
    institution: string | null
    full_name: string | null
    // Mentor fields
    mentor_expertise: string[] | null
    mentor_experience_level: string | null
    mentor_availability: string | null
}

// Result of the onboarding gate check
export interface OnboardingGateResult {
    redirectTo: string | null
    user: { id: string } | null
    profile: OnboardingProfile | null
    debug: {
        isStudentComplete: boolean
        isMentorComplete: boolean
    }
}

/**
 * DERIVED COMPLETION - The only source of truth
 * DO NOT use boolean flags like mentor_onboarding_completed
 */
function isStudentOnboardingComplete(profile: OnboardingProfile | null): boolean {
    if (!profile) return false
    if (profile.role !== "student") return false

    // Student is complete if they have filled core required fields
    return (
        !!profile.full_name &&
        !!profile.motivation_type &&
        !!profile.current_skill_level &&
        !!profile.time_commitment &&
        !!profile.institution
    )
}

function isMentorOnboardingComplete(profile: OnboardingProfile | null): boolean {
    if (!profile) return false
    if (profile.role !== "mentor") return false

    // Mentor is complete if they have all required mentor fields
    return (
        Array.isArray(profile.mentor_expertise) &&
        profile.mentor_expertise.length > 0 &&
        !!profile.mentor_experience_level &&
        !!profile.mentor_availability
    )
}

/**
 * Determines where a user should be redirected based on their onboarding state.
 * DERIVED from actual profile fields, NOT boolean flags.
 *
 * @param currentPath - The current URL path (to prevent self-redirects)
 * @returns The path to redirect to, or null if no redirect needed
 */
export async function getOnboardingRedirect(
    currentPath: string
): Promise<string | null> {
    const result = await checkOnboardingGate(currentPath)
    return result.redirectTo
}

/**
 * Full onboarding gate check with all data and debug info.
 *
 * @param currentPath - The current URL path (to prevent self-redirects)
 * @returns Object containing redirectTo, user, profile, and debug info
 */
export async function checkOnboardingGate(
    currentPath: string
): Promise<OnboardingGateResult> {
    const supabase = await createSupabaseServerClient()

    // Step 1: Check if user is authenticated
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return {
            redirectTo: shouldRedirect(currentPath, "/auth") ? "/auth" : null,
            user: null,
            profile: null,
            debug: { isStudentComplete: false, isMentorComplete: false },
        }
    }

    // Step 2: Fetch profile using SERVICE ROLE client (bypasses RLS)
    // User ID comes from authenticated session, but profile data comes from admin client
    // This ensures we always get the latest data regardless of RLS policies
    const { data: profile, error: profileError } = await supabaseAdmin
        .from("profiles")
        .select(`
      role,
      full_name,
      institution,
      motivation_type,
      current_skill_level,
      time_commitment,
      learning_goal,
      mentor_expertise,
      mentor_experience_level,
      mentor_availability
    `)
        .eq("id", user.id)
        .single()

    // Only log actual errors with meaningful content
    if (profileError && Object.keys(profileError).length > 0 && profileError.code !== "PGRST116") {
        console.error(`[onboarding-gate] Profile fetch error:`, profileError)
    }

    // Step 3: DERIVE completion from fields
    const isStudentComplete = isStudentOnboardingComplete(profile as OnboardingProfile | null)
    const isMentorComplete = isMentorOnboardingComplete(profile as OnboardingProfile | null)


    // Step 4: Determine target path based on DERIVED completion
    const targetPath = determineTargetPath(
        profile as OnboardingProfile | null,
        currentPath,
        isStudentComplete,
        isMentorComplete
    )

    return {
        redirectTo: targetPath,
        user: { id: user.id },
        profile: profile as OnboardingProfile | null,
        debug: { isStudentComplete, isMentorComplete },
    }
}

/**
 * Core routing logic - determines where user should be.
 * Uses DERIVED completion, NOT boolean flags.
 */
function determineTargetPath(
    profile: OnboardingProfile | null,
    currentPath: string,
    isStudentComplete: boolean,
    isMentorComplete: boolean
): string | null {
    // No profile = new user, needs onboarding
    if (!profile) {
        return shouldRedirect(currentPath, "/onboarding") ? "/onboarding" : null
    }

    const role = profile.role

    // No role selected = needs to start onboarding
    if (!role) {
        return shouldRedirect(currentPath, "/onboarding") ? "/onboarding" : null
    }

    // MENTOR FLOW
    if (role === "mentor") {
        if (!isMentorComplete) {
            // Mentor needs to complete onboarding
            return shouldRedirect(currentPath, "/mentor-onboarding")
                ? "/mentor-onboarding"
                : null
        }
        // Mentor is complete - redirect away from onboarding pages
        if (isOnboardingPath(currentPath)) {
            return "/mentor-dashboard"
        }
        return null
    }

    // STUDENT FLOW
    if (role === "student") {
        if (!isStudentComplete) {
            // Student needs to complete onboarding
            return shouldRedirect(currentPath, "/onboarding") ? "/onboarding" : null
        }
        // Student is complete - redirect away from onboarding pages
        if (isOnboardingPath(currentPath)) {
            return "/dashboard"
        }
        return null
    }

    // Unknown role - default to onboarding
    return shouldRedirect(currentPath, "/onboarding") ? "/onboarding" : null
}

/**
 * LOOP-PROOF: Check if we should redirect, preventing self-redirects.
 */
function shouldRedirect(currentPath: string, targetPath: string): boolean {
    // Normalize paths by removing trailing slashes
    const normalizedCurrent = currentPath.replace(/\/$/, "") || "/"
    const normalizedTarget = targetPath.replace(/\/$/, "") || "/"

    // CRITICAL: Don't redirect if already on target path
    if (normalizedCurrent === normalizedTarget) {
        return false
    }

    return true
}

/**
 * Check if current path is an onboarding-related path.
 */
function isOnboardingPath(path: string): boolean {
    const normalizedPath = path.replace(/\/$/, "") || "/"
    return (
        normalizedPath === "/onboarding" ||
        normalizedPath.startsWith("/onboarding/") ||
        normalizedPath === "/mentor-onboarding" ||
        normalizedPath.startsWith("/mentor-onboarding/")
    )
}

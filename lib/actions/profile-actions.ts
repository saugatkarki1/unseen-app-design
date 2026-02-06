"use server"

// lib/actions/profile-actions.ts
// ============================================================================
// PROFILE SERVER ACTIONS
// ============================================================================
// Server-side actions for updating user profiles.
// Uses admin client to bypass RLS.
// ============================================================================

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"

import { supabaseAdmin } from "@/lib/supabase/admin"
import { inferSkillDomain, type SkillDomain } from "@/lib/skill-domain"
import type { Profile, ProfileUpdate, OnboardingResponse } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

export interface UpdateSkillDomainResult {
    success: boolean
    domain?: SkillDomain
    error?: string
}

// ============================================================================
// UPDATE SKILL DOMAIN FROM ONBOARDING RESPONSES
// ============================================================================

/**
 * Reads the user's onboarding responses and infers their skill domain.
 * Updates the profiles table with the inferred skill domain.
 *
 * @param userId - The user's ID
 * @returns Result with success status and inferred domain
 */
export async function updateProfileSkillDomain(userId: string): Promise<UpdateSkillDomainResult> {
    try {
        // Fetch the learning_direction from onboarding_responses
        const { data: responses } = await supabaseAdmin
            .from("onboarding_responses")
            .select("response_value")
            .eq("user_id", userId)
            .eq("step_key", "learning_direction")
            .single()

        // Also check the profile's learning_direction field as fallback
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("learning_direction, learning_goal")
            .eq("id", userId)
            .single()

        // Determine the text to analyze
        let learningText: string | null = null

        // Cast to ensure type safety
        const typedResponses = responses as Pick<OnboardingResponse, "response_value"> | null
        const typedProfile = profile as Pick<Profile, "learning_direction" | "learning_goal"> | null

        if (typedResponses?.response_value) {
            learningText = typedResponses.response_value
        } else if (typedProfile?.learning_direction) {
            learningText = typedProfile.learning_direction
        } else if (typedProfile?.learning_goal) {
            // Legacy field fallback
            learningText = typedProfile.learning_goal
        }

        // Infer the skill domain
        const inferredDomain = inferSkillDomain(learningText)

        // Update the profile with the inferred domain
        const updatePayload: ProfileUpdate = {
            inferred_skill_domain: inferredDomain,
            updated_at: new Date().toISOString(),
        }

        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update(updatePayload)
            .eq("id", userId)

        if (updateError) {
            console.error("[updateProfileSkillDomain] Update error:", updateError)
            return { success: false, error: "Failed to update skill domain" }
        }

        console.log(`[updateProfileSkillDomain] Set domain to '${inferredDomain}' for user ${userId}`)
        return { success: true, domain: inferredDomain }
    } catch (err) {
        console.error("[updateProfileSkillDomain] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

/**
 * Fill any missing profile fields from onboarding responses.
 * This ensures profile data is complete after onboarding.
 *
 * @param userId - The user's ID
 */
export async function fillMissingProfileFields(userId: string): Promise<void> {
    try {
        // Fetch all onboarding responses for this user
        const { data: responses } = await supabaseAdmin
            .from("onboarding_responses")
            .select("step_key, question_key, response_value")
            .eq("user_id", userId)

        // Cast responses
        const typedResponses = responses as Pick<OnboardingResponse, "step_key" | "question_key" | "response_value">[] | null

        if (!typedResponses || typedResponses.length === 0) {
            return
        }

        // Fetch current profile
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("full_name, preferred_name, bio, avatar_url, institution")
            .eq("id", userId)
            .single()

        // Cast profile
        const typedProfile = profile as Pick<Profile, "full_name" | "preferred_name" | "bio" | "avatar_url" | "institution"> | null

        if (!typedProfile) {
            return
        }

        // Build update object for missing fields
        const updates: ProfileUpdate = {}

        for (const response of typedResponses) {
            const value = response.response_value

            // Map response keys to profile fields
            if (response.step_key === "full_name" && !typedProfile.full_name) {
                updates.full_name = value
            }
            if (response.question_key === "preferred_name" && !typedProfile.preferred_name) {
                updates.preferred_name = value
            }
            if (response.question_key === "bio" && !typedProfile.bio) {
                updates.bio = value
            }
            if (response.step_key === "institution" && !typedProfile.institution) {
                updates.institution = value
            }
        }

        // Only update if there are fields to fill
        if (Object.keys(updates).length > 0) {
            updates.updated_at = new Date().toISOString()

            await supabaseAdmin
                .from("profiles")
                .update(updates as ProfileUpdate)
                .eq("id", userId)

            console.log(`[fillMissingProfileFields] Filled ${Object.keys(updates).length - 1} fields for user ${userId}`)
        }
    } catch (err) {
        console.error("[fillMissingProfileFields] Error:", err)
        // Non-critical, don't throw
    }
}

// ============================================================================
// GET CURRENT USER SKILL DOMAIN
// ============================================================================

/**
 * Get the current authenticated user's skill domain.
 * Returns 'General' as fallback if not set.
 */
export async function getProfileSkillDomain(): Promise<SkillDomain> {
    try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("sb-access-token")?.value
        const refreshToken = cookieStore.get("sb-refresh-token")?.value

        if (!accessToken || !refreshToken) {
            return "General"
        }

        const supabase = createClient(
            env.client.NEXT_PUBLIC_SUPABASE_URL,
            env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
            {
                auth: {
                    persistSession: false,
                    autoRefreshToken: false,
                },
            }
        )

        await supabase.auth.setSession({
            access_token: accessToken,
            refresh_token: refreshToken,
        })

        const { data: { user } } = await supabase.auth.getUser()
        if (!user) {
            return "General"
        }

        // Fetch skill domain from profile
        const { data: profile } = await supabaseAdmin
            .from("profiles")
            .select("inferred_skill_domain")
            .eq("id", user.id)
            .single()

        const typedProfile = profile as { inferred_skill_domain: string | null } | null

        if (typedProfile?.inferred_skill_domain) {
            return typedProfile.inferred_skill_domain as SkillDomain
        }

        return "General"
    } catch (err) {
        console.error("[getProfileSkillDomain] Error:", err)
        return "General"
    }
}


// lib/retroactive-onboarding.ts
// ============================================================================
// RETROACTIVE ONBOARDING
// ============================================================================
// Handles old users who haven't completed onboarding.
// Infers skill domain from existing profile data and completes onboarding.
// ============================================================================

import { supabaseAdmin } from "@/lib/supabase/admin"
import { inferSkillDomainWithConfidence } from "@/lib/skill-domain"
import type { Profile } from "@/lib/supabase/types"

/**
 * Result of retroactive onboarding process.
 */
export interface RetroactiveOnboardingResult {
    userId: string
    status: "completed" | "needs_input" | "skipped" | "error"
    domain?: string
    confidence?: string
    error?: string
}

/**
 * Process a single user for retroactive onboarding.
 * If learning_direction exists, infer domain and complete onboarding.
 * If missing, mark as needing user input.
 */
export async function processRetroactiveUser(userId: string): Promise<RetroactiveOnboardingResult> {
    try {
        // Fetch existing profile data
        const { data: profile, error } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

        if (error || !profile) {
            return { userId, status: "error", error: "Profile not found" }
        }

        // Cast to typed profile
        const typedProfile = profile as Profile

        // Already completed - skip
        if (typedProfile.onboarding_completed) {
            return { userId, status: "skipped" }
        }

        // Check for learning direction or learning goal
        const learningText = typedProfile.learning_direction || typedProfile.learning_goal

        if (!learningText || learningText.trim().length === 0) {
            // Needs user input
            return { userId, status: "needs_input" }
        }

        // Infer skill domain
        const inference = inferSkillDomainWithConfidence(learningText)

        // Extract preferred_name from full_name if not set
        let preferredName = typedProfile.preferred_name
        if (!preferredName && typedProfile.full_name) {
            preferredName = typedProfile.full_name.split(" ")[0]
        }

        // Update profile with inferred domain and complete onboarding
        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update({
                inferred_skill_domain: inference.domain,
                preferred_name: preferredName || null,
                onboarding_completed: true,
                onboarding_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

        if (updateError) {
            return { userId, status: "error", error: updateError.message }
        }

        console.log(`[retroactive] Completed onboarding for ${userId}: ${inference.domain} (${inference.confidence})`)

        return {
            userId,
            status: "completed",
            domain: inference.domain,
            confidence: inference.confidence,
        }
    } catch (err) {
        console.error(`[retroactive] Error for ${userId}:`, err)
        return { userId, status: "error", error: String(err) }
    }
}

/**
 * Process all users who need retroactive onboarding.
 * Returns summary of results.
 */
export async function processAllRetroactiveUsers(): Promise<{
    total: number
    completed: number
    needsInput: number
    skipped: number
    errors: number
    results: RetroactiveOnboardingResult[]
}> {
    // Fetch all users without completed onboarding
    const { data: users, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .or("onboarding_completed.is.null,onboarding_completed.eq.false")

    if (error || !users) {
        console.error("[retroactive] Failed to fetch users:", error)
        return { total: 0, completed: 0, needsInput: 0, skipped: 0, errors: 1, results: [] }
    }

    const results: RetroactiveOnboardingResult[] = []
    let completed = 0
    let needsInput = 0
    let skipped = 0
    let errors = 0

    for (const user of users) {
        const result = await processRetroactiveUser(user.id)
        results.push(result)

        switch (result.status) {
            case "completed":
                completed++
                break
            case "needs_input":
                needsInput++
                break
            case "skipped":
                skipped++
                break
            case "error":
                errors++
                break
        }
    }

    console.log(`[retroactive] Processed ${users.length} users: ${completed} completed, ${needsInput} need input, ${skipped} skipped, ${errors} errors`)

    return {
        total: users.length,
        completed,
        needsInput,
        skipped,
        errors,
        results,
    }
}

/**
 * Get list of users who need to complete onboarding manually.
 */
export async function getUsersNeedingOnboarding(): Promise<{ id: string; email: string | null; full_name: string | null }[]> {
    const { data, error } = await supabaseAdmin
        .from("profiles")
        .select("id, email, full_name")
        .or("onboarding_completed.is.null,onboarding_completed.eq.false")
        .is("learning_direction", null)

    if (error) {
        console.error("[retroactive] Failed to fetch users needing onboarding:", error)
        return []
    }

    return (data || []) as { id: string; email: string | null; full_name: string | null }[]
}

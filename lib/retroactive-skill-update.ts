// lib/retroactive-skill-update.ts
// ============================================================================
// RETROACTIVE SKILL LEVEL UPDATE SCRIPT
// ============================================================================
// Processes existing users who have learning data but missing classifier fields.
// Run with: npx tsx lib/retroactive-skill-update.ts
// ============================================================================

import { supabaseAdmin } from "@/lib/supabase/admin"
import { classifyIntent } from "@/lib/intent-classifier"
import { adaptIntentToSkillDomain } from "@/lib/skill-domain"
import { analyzeOnboardingInput } from "@/lib/skill-level-classifier"
import type { Profile, ProfileUpdate } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

interface RetroveUserReport {
    user_id: string
    status: "updated" | "skipped" | "error"
    fields_updated: string[]
    error_message?: string
}

// ============================================================================
// MAIN PROCESSING FUNCTION
// ============================================================================

/**
 * Find and process users with missing skill-level-classifier fields.
 */
export async function runRetroactiveSkillUpdate(): Promise<RetroveUserReport[]> {
    console.log("[retroactive-skill] Starting retroactive skill update...")

    // Fetch users with learning data but missing classifier fields
    const { data: users, error } = await supabaseAdmin
        .from("profiles")
        .select("id, learning_goal, learning_direction, inferred_skill_domain, inferred_skill_level, normalized_learning_goal")
        .or("inferred_skill_level.is.null,normalized_learning_goal.is.null")

    if (error) {
        console.error("[retroactive-skill] Failed to fetch users:", error)
        return []
    }

    if (!users || users.length === 0) {
        console.log("[retroactive-skill] No users need processing.")
        return []
    }

    // Cast users to Profile type for proper typing
    const typedUsers = users as Profile[]

    const filteredUsers = typedUsers.filter(
        (u) => u.learning_goal || u.learning_direction
    )

    console.log(`[retroactive-skill] Found ${filteredUsers.length} users needing processing`)

    const reports: RetroveUserReport[] = []
    let updatedCount = 0
    let skippedCount = 0
    let errorCount = 0

    for (const user of filteredUsers) {
        try {
            // Get learning text from available sources
            const learningText = user.learning_direction || user.learning_goal

            if (!learningText || learningText.trim().length === 0) {
                reports.push({
                    user_id: user.id,
                    status: "skipped",
                    fields_updated: [],
                })
                skippedCount++
                continue
            }

            // Run intent classifier to get skill direction
            const intentResult = classifyIntent(learningText)
            const skillDomain = adaptIntentToSkillDomain(intentResult)

            // Run skill-level-classifier
            const analysisResult = analyzeOnboardingInput({
                user_input: learningText,
                skill_direction: intentResult.detected_domain || "Other",
            })

            // Build update payload - use ProfileUpdate for proper typing with cast
            const updatePayload: Partial<ProfileUpdate> = {}
            const fieldsUpdated: string[] = []

            // Only update if not already set
            if (!user.inferred_skill_level) {
                updatePayload.inferred_skill_level = analysisResult.skill_level
                fieldsUpdated.push("inferred_skill_level")
            }

            if (!user.normalized_learning_goal && analysisResult.learning_goal) {
                updatePayload.normalized_learning_goal = analysisResult.learning_goal
                fieldsUpdated.push("normalized_learning_goal")
            }

            // Update clarification flags
            if (analysisResult.needs_clarification) {
                updatePayload.onboarding_needs_clarification = true
                updatePayload.onboarding_clarification_question = analysisResult.clarification_question
            }

            // Update inferred_skill_domain if not set
            if (!user.inferred_skill_domain) {
                updatePayload.inferred_skill_domain = skillDomain
                fieldsUpdated.push("inferred_skill_domain")
            }

            // Skip if nothing to update
            if (Object.keys(updatePayload).length === 0) {
                reports.push({
                    user_id: user.id,
                    status: "skipped",
                    fields_updated: [],
                })
                skippedCount++
                continue
            }

            // Persist changes
            updatePayload.updated_at = new Date().toISOString()

            const { error: updateError } = await supabaseAdmin
                .from("profiles")
                .update(updatePayload as unknown as ProfileUpdate)
                .eq("id", user.id)

            if (updateError) {
                console.error(`[retroactive-skill] Update failed for ${user.id}:`, updateError)
                reports.push({
                    user_id: user.id,
                    status: "error",
                    fields_updated: [],
                    error_message: updateError.message,
                })
                errorCount++
                continue
            }

            console.log(`[retroactive-skill] Updated ${user.id}: ${fieldsUpdated.join(", ")}`)
            reports.push({
                user_id: user.id,
                status: "updated",
                fields_updated: fieldsUpdated,
            })
            updatedCount++
        } catch (err) {
            console.error(`[retroactive-skill] Error processing ${user.id}:`, err)
            reports.push({
                user_id: user.id,
                status: "error",
                fields_updated: [],
                error_message: err instanceof Error ? err.message : "Unknown error",
            })
            errorCount++
        }
    }

    console.log("\n" + "=".repeat(60))
    console.log("RETROACTIVE SKILL UPDATE COMPLETE")
    console.log("=".repeat(60))
    console.log(`Updated: ${updatedCount}`)
    console.log(`Skipped: ${skippedCount}`)
    console.log(`Errors: ${errorCount}`)
    console.log(`Total: ${filteredUsers.length}`)
    console.log("=".repeat(60))

    return reports
}

// ============================================================================
// CLI EXECUTION
// ============================================================================

// Run when executed directly
runRetroactiveSkillUpdate()
    .then((reports) => {
        // Print JSON summary
        console.log("\nJSON Report:")
        console.log(JSON.stringify(reports, null, 2))
        process.exit(0)
    })
    .catch((err) => {
        console.error("Fatal error:", err)
        process.exit(1)
    })

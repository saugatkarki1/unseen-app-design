// lib/re-onboarding-automation.ts
// ============================================================================
// RE-ONBOARDING AUTOMATION ENGINE
// ============================================================================
// Automates re-onboarding for existing users with incomplete onboarding.
// Fills missing required fields, runs intent classification, and marks complete.
// ============================================================================

import { supabaseAdmin } from "@/lib/supabase/admin"
import { classifyIntent } from "@/lib/intent-classifier"
import { adaptIntentToSkillDomain } from "@/lib/skill-domain"
import { analyzeOnboardingInput } from "@/lib/skill-level-classifier"
import { assignMentorForUser } from "@/lib/mentor-assignment"
import { generateCurriculumForUser } from "@/lib/curriculum-recommendation"
import type { Profile, ProfileUpdate, OnboardingResponse } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

/**
 * JSON report format for each user processed.
 */
export interface ReOnboardingReport {
    user_id: string
    filled_fields: string[]
    status: "completed" | "skipped"
}

/**
 * Audit log entry for tracking filled fields.
 */
interface AuditLogEntry {
    user_id: string
    field: string
    source: string
    value: string
}

// ============================================================================
// FIELD FILLING STRATEGIES
// ============================================================================

/**
 * Extract a usable name from email address.
 * e.g., "john.doe@example.com" → "John Doe"
 */
function extractNameFromEmail(email: string | null): string | null {
    if (!email) return null

    const localPart = email.split("@")[0]
    if (!localPart) return null

    // Replace dots, underscores, numbers with spaces and capitalize
    const name = localPart
        .replace(/[._-]/g, " ")
        .replace(/\d+/g, "")
        .trim()
        .split(" ")
        .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
        .join(" ")

    return name.length >= 2 ? name : null
}

/**
 * Attempt to fill missing full_name from available data sources.
 */
function inferFullName(profile: Profile): { value: string; source: string } | null {
    // Priority 1: Use preferred_name if available
    if (profile.preferred_name && profile.preferred_name.trim().length >= 2) {
        return { value: profile.preferred_name.trim(), source: "preferred_name" }
    }

    // Priority 2: Extract from email
    const emailName = extractNameFromEmail(profile.email)
    if (emailName) {
        return { value: emailName, source: "email" }
    }

    return null
}

/**
 * Attempt to fill missing learning_direction from available data sources.
 */
function inferLearningDirection(
    profile: Profile,
    onboardingResponses: Pick<OnboardingResponse, "step_key" | "response_value">[]
): { value: string; source: string } | null {
    // Priority 1: Check onboarding_responses for learning_direction
    const learningResponse = onboardingResponses.find(
        (r) => r.step_key === "learning_direction" && r.response_value?.trim()
    )
    if (learningResponse) {
        return { value: learningResponse.response_value.trim(), source: "onboarding_responses" }
    }

    // Priority 2: Use legacy learning_goal field
    if (profile.learning_goal && profile.learning_goal.trim().length > 0) {
        return { value: profile.learning_goal.trim(), source: "learning_goal" }
    }

    return null
}

// ============================================================================
// CORE AUTOMATION LOGIC
// ============================================================================

/**
 * Process a single user for re-onboarding.
 * Fills missing fields and marks onboarding as complete.
 */
export async function processUserReOnboarding(userId: string): Promise<ReOnboardingReport> {
    const auditLog: AuditLogEntry[] = []
    const filledFields: string[] = []

    try {
        // Fetch profile
        const { data: profile, error: profileError } = await supabaseAdmin
            .from("profiles")
            .select("*")
            .eq("id", userId)
            .single()

        if (profileError || !profile) {
            console.error(`[re-onboard] Profile not found for ${userId}`)
            return { user_id: userId, filled_fields: [], status: "skipped" }
        }

        const typedProfile = profile as Profile

        // Skip if already completed
        if (typedProfile.onboarding_completed) {
            return { user_id: userId, filled_fields: [], status: "skipped" }
        }

        // Fetch onboarding responses
        const { data: responses } = await supabaseAdmin
            .from("onboarding_responses")
            .select("step_key, response_value")
            .eq("user_id", userId)

        const typedResponses = (responses || []) as Pick<OnboardingResponse, "step_key" | "response_value">[]

        // Build update payload
        const updatePayload: Partial<Profile> = {}

        // ----------------------------------------------------------------
        // STEP 1: Fill full_name if missing
        // ----------------------------------------------------------------
        if (!typedProfile.full_name || typedProfile.full_name.trim().length === 0) {
            const inferred = inferFullName(typedProfile)
            if (inferred) {
                updatePayload.full_name = inferred.value
                filledFields.push("full_name")
                auditLog.push({
                    user_id: userId,
                    field: "full_name",
                    source: inferred.source,
                    value: inferred.value,
                })
            }
        }

        // ----------------------------------------------------------------
        // STEP 2: Fill role if missing (default to "student")
        // ----------------------------------------------------------------
        if (!typedProfile.role || !["student", "mentor"].includes(typedProfile.role)) {
            updatePayload.role = "student"
            updatePayload.role_selected = true
            filledFields.push("role")
            auditLog.push({
                user_id: userId,
                field: "role",
                source: "default",
                value: "student",
            })
        }

        // ----------------------------------------------------------------
        // STEP 3: Fill learning_direction and run intent classifier
        // ----------------------------------------------------------------
        let learningText = typedProfile.learning_direction

        if (!learningText || learningText.trim().length === 0) {
            const inferred = inferLearningDirection(typedProfile, typedResponses)
            if (inferred) {
                learningText = inferred.value
                updatePayload.learning_direction = inferred.value
                filledFields.push("learning_direction")
                auditLog.push({
                    user_id: userId,
                    field: "learning_direction",
                    source: inferred.source,
                    value: inferred.value,
                })
            }
        }

        // Run intent classifier on learning_direction (existing or newly filled)
        if (learningText && learningText.trim().length > 0) {
            const intentResult = classifyIntent(learningText)
            const skillDomain = adaptIntentToSkillDomain(intentResult)

            // Only update inferred_skill_domain if not already set
            if (!typedProfile.inferred_skill_domain) {
                updatePayload.inferred_skill_domain = skillDomain
                filledFields.push("inferred_skill_domain")
                auditLog.push({
                    user_id: userId,
                    field: "inferred_skill_domain",
                    source: "intent_classifier",
                    value: skillDomain,
                })
            }

            // Also populate skill_domain for curriculum matching (SQL uses skill_domain)
            if (!(typedProfile as Record<string, unknown>).skill_domain) {
                (updatePayload as Record<string, unknown>).skill_domain = skillDomain
                filledFields.push("skill_domain")
                auditLog.push({
                    user_id: userId,
                    field: "skill_domain",
                    source: "intent_classifier",
                    value: skillDomain,
                })
            }

            // ----------------------------------------------------------------
            // STEP 3.5: Run skill-level-classifier for inferred_skill_level and normalized_learning_goal
            // ----------------------------------------------------------------
            const analysisResult = analyzeOnboardingInput({
                user_input: learningText,
                skill_direction: intentResult.detected_domain || "Other",
            })

            // Only update inferred_skill_level if not already set
            if (!(typedProfile as Record<string, unknown>).inferred_skill_level) {
                (updatePayload as Record<string, unknown>).inferred_skill_level = analysisResult.skill_level
                filledFields.push("inferred_skill_level")
                auditLog.push({
                    user_id: userId,
                    field: "inferred_skill_level",
                    source: "skill_level_classifier",
                    value: analysisResult.skill_level,
                })
            }

            // Only update normalized_learning_goal if not already set
            if (!(typedProfile as Record<string, unknown>).normalized_learning_goal && analysisResult.learning_goal) {
                (updatePayload as Record<string, unknown>).normalized_learning_goal = analysisResult.learning_goal
                filledFields.push("normalized_learning_goal")
                auditLog.push({
                    user_id: userId,
                    field: "normalized_learning_goal",
                    source: "skill_level_classifier",
                    value: analysisResult.learning_goal,
                })
            }

            // Update clarification flags if needed
            if (analysisResult.needs_clarification) {
                (updatePayload as Record<string, unknown>).onboarding_needs_clarification = true;
                (updatePayload as Record<string, unknown>).onboarding_clarification_question = analysisResult.clarification_question
            }
        }

        // ----------------------------------------------------------------
        // STEP 4: Check if all required fields are now populated
        // ----------------------------------------------------------------
        const finalFullName = updatePayload.full_name || typedProfile.full_name
        const finalRole = updatePayload.role || typedProfile.role
        const finalLearningDirection = updatePayload.learning_direction || typedProfile.learning_direction

        // All 3 required fields must be populated to complete onboarding
        if (
            finalFullName && finalFullName.trim().length > 0 &&
            finalRole && ["student", "mentor"].includes(finalRole) &&
            finalLearningDirection && finalLearningDirection.trim().length > 0
        ) {
            updatePayload.onboarding_completed = true
            updatePayload.onboarding_completed_at = new Date().toISOString()
        } else {
            // Cannot complete - missing required fields
            console.warn(`[re-onboard] User ${userId} still missing required fields:`, {
                full_name: !finalFullName,
                role: !finalRole,
                learning_direction: !finalLearningDirection,
            })
            return { user_id: userId, filled_fields: filledFields, status: "skipped" }
        }

        // ----------------------------------------------------------------
        // STEP 5: Persist changes
        // ----------------------------------------------------------------
        updatePayload.updated_at = new Date().toISOString()

        const { error: updateError } = await supabaseAdmin
            .from("profiles")
            .update(updatePayload as unknown as ProfileUpdate)
            .eq("id", userId)

        if (updateError) {
            console.error(`[re-onboard] Update failed for ${userId}:`, updateError)
            return { user_id: userId, filled_fields: [], status: "skipped" }
        }

        // ----------------------------------------------------------------
        // STEP 6: Assign mentor and curriculum for newly completed users
        // ----------------------------------------------------------------
        if (updatePayload.onboarding_completed) {
            try {
                const mentorResult = await assignMentorForUser(userId)
                if (mentorResult) {
                    filledFields.push("mentor_assignment")
                    auditLog.push({
                        user_id: userId,
                        field: "mentor_assignment",
                        source: "mentor_assignment",
                        value: mentorResult.mentor.name,
                    })
                    console.log(`[re-onboard] Assigned mentor ${mentorResult.mentor.name} to ${userId}`)
                }
            } catch (err) {
                console.warn(`[re-onboard] Failed to assign mentor for ${userId}:`, err)
            }

            try {
                const curriculumResult = await generateCurriculumForUser(userId)
                if (curriculumResult && curriculumResult.items.length > 0) {
                    filledFields.push("curriculum_generated")
                    auditLog.push({
                        user_id: userId,
                        field: "curriculum_generated",
                        source: "curriculum_recommendation",
                        value: `${curriculumResult.items.length} items`,
                    })
                    console.log(`[re-onboard] Generated ${curriculumResult.items.length} curriculum items for ${userId}`)
                }
            } catch (err) {
                console.warn(`[re-onboard] Failed to generate curriculum for ${userId}:`, err)
            }
        }

        // Log audit entries
        for (const entry of auditLog) {
            console.log(
                `[re-onboard AUDIT] user=${entry.user_id} field=${entry.field} source=${entry.source} value="${entry.value}"`
            )
        }

        console.log(`[re-onboard] Completed for ${userId}: filled ${filledFields.length} fields`)

        return {
            user_id: userId,
            filled_fields: filledFields,
            status: "completed",
        }
    } catch (err) {
        console.error(`[re-onboard] Error for ${userId}:`, err)
        return { user_id: userId, filled_fields: [], status: "skipped" }
    }
}

/**
 * Run re-onboarding automation for all incomplete users.
 * Returns JSON array of reports.
 */
export async function runReOnboardingAutomation(): Promise<ReOnboardingReport[]> {
    console.log("[re-onboard] Starting automation run...")

    // Fetch all users with incomplete onboarding
    const { data: users, error } = await supabaseAdmin
        .from("profiles")
        .select("id")
        .or("onboarding_completed.is.null,onboarding_completed.eq.false")

    if (error || !users) {
        console.error("[re-onboard] Failed to fetch users:", error)
        return []
    }

    // Cast users to proper type
    const typedUsers = users as { id: string }[]

    console.log(`[re-onboard] Found ${typedUsers.length} users with incomplete onboarding`)

    const reports: ReOnboardingReport[] = []
    let completedCount = 0
    let skippedCount = 0

    for (const user of typedUsers) {
        const report = await processUserReOnboarding(user.id)
        reports.push(report)

        if (report.status === "completed") {
            completedCount++
        } else {
            skippedCount++
        }
    }

    console.log(
        `[re-onboard] Automation complete: ${completedCount} completed, ${skippedCount} skipped out of ${typedUsers.length} total`
    )

    return reports
}

/**
 * Get a summary of the automation results.
 */
export function summarizeReports(reports: ReOnboardingReport[]): {
    total: number
    completed: number
    skipped: number
    fieldsFilled: Record<string, number>
} {
    const fieldsFilled: Record<string, number> = {}

    let completed = 0
    let skipped = 0

    for (const report of reports) {
        if (report.status === "completed") {
            completed++
        } else {
            skipped++
        }

        for (const field of report.filled_fields) {
            fieldsFilled[field] = (fieldsFilled[field] || 0) + 1
        }
    }

    return {
        total: reports.length,
        completed,
        skipped,
        fieldsFilled,
    }
}

// ============================================================================
// RETROACTIVE FIX FOR EXISTING USERS
// ============================================================================

import { retroactivelyAssignMentors, type RetroactiveAssignmentReport } from "@/lib/mentor-assignment"
import { retroactivelyGenerateCurriculum, type RetroactiveCurriculumReport } from "@/lib/curriculum-recommendation"

/**
 * Complete report for retroactive fix operation.
 */
export interface RetroactiveFixReport {
    onboarding: {
        total: number
        completed: number
        skipped: number
        fieldsFilled: Record<string, number>
    }
    mentorAssignment: RetroactiveAssignmentReport
    curriculumGeneration: RetroactiveCurriculumReport
    timestamp: string
}

/**
 * Run complete retroactive fix for all existing users.
 * 
 * This function:
 * 1. Runs re-onboarding automation to fill missing profile fields
 * 2. Retroactively assigns mentors to users without one
 * 3. Generates curriculum for users without assignments
 * 
 * Safe to run multiple times - only processes users missing data.
 */
export async function runRetroactiveFix(): Promise<RetroactiveFixReport> {
    console.log("[retroactive-fix] Starting complete retroactive fix...")

    // Step 1: Run re-onboarding to fill missing fields
    console.log("[retroactive-fix] Step 1: Running re-onboarding automation...")
    const onboardingReports = await runReOnboardingAutomation()
    const onboardingSummary = summarizeReports(onboardingReports)

    // Step 2: Retroactively assign mentors
    console.log("[retroactive-fix] Step 2: Running retroactive mentor assignment...")
    const mentorReport = await retroactivelyAssignMentors()

    // Step 3: Retroactively generate curriculum
    console.log("[retroactive-fix] Step 3: Running retroactive curriculum generation...")
    const curriculumReport = await retroactivelyGenerateCurriculum()

    const report: RetroactiveFixReport = {
        onboarding: onboardingSummary,
        mentorAssignment: mentorReport,
        curriculumGeneration: curriculumReport,
        timestamp: new Date().toISOString(),
    }

    console.log("[retroactive-fix] Complete!", JSON.stringify(report, null, 2))

    return report
}

"use server"

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import { supabaseAdmin } from "@/lib/supabase/admin"
import { classifyIntent } from "@/lib/intent-classifier"
import { adaptIntentToSkillDomain } from "@/lib/skill-domain"
import { analyzeOnboardingInput } from "@/lib/skill-level-classifier"
import type { SkillLevel, TimeCommitment, MotivationType, UserRole } from "@/lib/supabase/types"

// ============================================================================
// PHASE 1: ONBOARDING SERVER ACTIONS
// ============================================================================
// Multi-step onboarding with incremental response saving.
// Responses are saved to onboarding_responses table.
// Profile is updated progressively as steps complete.
// ============================================================================

export type OnboardingStep =
    | "full_name"
    | "institution"
    | "learning_direction"
    | "skill_level"
    | "time_commitment"
    | "motivation"
    | "role"

export interface SaveResponseInput {
    stepKey: OnboardingStep
    questionKey: string
    responseValue: string
    responseMetadata?: Record<string, unknown>
}

export interface SaveResponseResult {
    success: boolean
    error?: string
}

export interface CompleteOnboardingResult {
    success: boolean
    error?: string
}

export interface OnboardingProgress {
    completedSteps: OnboardingStep[]
    currentStep: OnboardingStep | null
    responses: Record<string, string>
}

// ============================================================================
// AUTHENTICATION HELPER
// ============================================================================

async function getCurrentUserId(): Promise<string | null> {
    try {
        const cookieStore = await cookies()
        const accessToken = cookieStore.get("sb-access-token")?.value
        const refreshToken = cookieStore.get("sb-refresh-token")?.value

        if (!accessToken || !refreshToken) {
            return null
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
        return user?.id || null
    } catch {
        return null
    }
}

// ============================================================================
// SAVE INDIVIDUAL RESPONSE
// ============================================================================

export async function saveOnboardingResponse(
    input: SaveResponseInput
): Promise<SaveResponseResult> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { success: false, error: "Not authenticated" }
        }

        // Validate input
        if (!input.responseValue.trim()) {
            return { success: false, error: "Response cannot be empty" }
        }

        // CRITICAL FOR ROLE: Update profiles.role FIRST, before onboarding_responses
        // This ensures routing logic (which depends ONLY on profiles.role) works correctly
        const profileUpdate = getProfileUpdateForStep(input.stepKey, input.responseValue.trim())
        if (profileUpdate) {
            const { error: profileError } = await supabaseAdmin
                .from("profiles")
                .upsert(
                    {
                        id: userId,
                        ...profileUpdate,
                        updated_at: new Date().toISOString(),
                    },
                    { onConflict: "id" }
                )

            if (profileError) {
                console.error("[saveOnboardingResponse] Profile update error:", profileError)
                // For role step, profile update is MANDATORY - fail if it fails
                if (input.stepKey === "role") {
                    return { success: false, error: "Failed to update profile role" }
                }
                // For other steps, continue (non-critical)
            } else if (input.stepKey === "role") {
                // Explicit confirmation that profiles.role was updated
                console.log(`[saveOnboardingResponse] ✅ profiles.role updated to "${input.responseValue.trim()}" for user ${userId}`)
            }
        }

        // Save to onboarding_responses table as secondary log
        const { error: responseError } = await supabaseAdmin
            .from("onboarding_responses")
            .upsert(
                {
                    user_id: userId,
                    step_key: input.stepKey,
                    question_key: input.questionKey,
                    response_value: input.responseValue.trim(),
                    response_metadata: input.responseMetadata || {},
                    submitted_at: new Date().toISOString(),
                },
                {
                    onConflict: "user_id,step_key,question_key",
                }
            )

        if (responseError) {
            console.error("[saveOnboardingResponse] Error saving to onboarding_responses:", responseError)
            // onboarding_responses is secondary - don't fail if it fails
        }

        console.log(`[saveOnboardingResponse] Saved ${input.stepKey} for user ${userId}`)
        return { success: true }
    } catch (err) {
        console.error("[saveOnboardingResponse] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

// ============================================================================
// GET PROFILE UPDATE FOR STEP
// ============================================================================

function getProfileUpdateForStep(
    stepKey: OnboardingStep,
    value: string
): Record<string, unknown> | null {
    switch (stepKey) {
        case "full_name":
            return { full_name: value }
        case "institution":
            return { institution: value }
        case "learning_direction": {
            // Run skill-level-classifier to extract skill level and normalize goal
            // We need skill_direction from intent classifier first
            const intentResult = classifyIntent(value)
            const skillDomain = adaptIntentToSkillDomain(intentResult)
            const analysisResult = analyzeOnboardingInput({
                user_input: value,
                skill_direction: intentResult.detected_domain || "Other",
            })

            return {
                learning_direction: value,
                learning_goal: value, // Legacy field
                inferred_skill_level: analysisResult.skill_level,
                normalized_learning_goal: analysisResult.learning_goal,
                onboarding_needs_clarification: analysisResult.needs_clarification,
                onboarding_clarification_question: analysisResult.clarification_question,
                inferred_skill_domain: skillDomain,
            }
        }
        case "skill_level":
            if (["beginner", "intermediate", "advanced"].includes(value)) {
                return { current_skill_level: value as SkillLevel }
            }
            return null
        case "time_commitment":
            if (["casual", "regular", "intensive"].includes(value)) {
                return { time_commitment: value as TimeCommitment }
            }
            return null
        case "motivation":
            if (["career", "curiosity", "project", "other"].includes(value)) {
                return { motivation_type: value as MotivationType }
            }
            return null
        case "role":
            if (["student", "mentor"].includes(value)) {
                return {
                    role: value as UserRole,
                    role_selected: true
                }
            }
            return null
        default:
            return null
    }
}

// ============================================================================
// GET ONBOARDING PROGRESS
// ============================================================================

export async function getOnboardingProgress(): Promise<OnboardingProgress | null> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return null
        }

        // Fetch all responses for this user
        const { data: responses, error } = await supabaseAdmin
            .from("onboarding_responses")
            .select("step_key, question_key, response_value")
            .eq("user_id", userId)
            .order("submitted_at", { ascending: true })

        if (error) {
            console.error("[getOnboardingProgress] Error:", error)
            return null
        }

        const completedSteps: OnboardingStep[] = []
        const responseMap: Record<string, string> = {}

        const stepOrder: OnboardingStep[] = [
            "full_name",
            "institution",
            "learning_direction",
            "skill_level",
            "time_commitment",
            "motivation",
            "role",
        ]

        responses?.forEach((r) => {
            responseMap[r.step_key] = r.response_value
            if (stepOrder.includes(r.step_key as OnboardingStep)) {
                completedSteps.push(r.step_key as OnboardingStep)
            }
        })

        // Find the next incomplete step
        let currentStep: OnboardingStep | null = null
        for (const step of stepOrder) {
            if (!completedSteps.includes(step)) {
                currentStep = step
                break
            }
        }

        return {
            completedSteps: [...new Set(completedSteps)], // Remove duplicates
            currentStep,
            responses: responseMap,
        }
    } catch (err) {
        console.error("[getOnboardingProgress] Unexpected error:", err)
        return null
    }
}

// ============================================================================
// COMPLETE ONBOARDING
// ============================================================================

export async function completeOnboarding(): Promise<CompleteOnboardingResult> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { success: false, error: "Not authenticated" }
        }

        // Check that required steps are completed
        const progress = await getOnboardingProgress()
        if (!progress) {
            return { success: false, error: "Could not fetch progress" }
        }

        // Determine role to check correct required steps
        const userRole = progress.responses["role"] as UserRole | undefined

        // Base required steps for all users
        let requiredSteps: OnboardingStep[] = ["full_name", "role", "institution"]

        // Students have additional required steps
        if (userRole === "student") {
            requiredSteps = [
                "full_name",
                "role",
                "institution",
                "learning_direction",
                "skill_level",
                "time_commitment",
                "motivation",
            ]
        }

        const missingRequired = requiredSteps.filter(
            (step) => !progress.completedSteps.includes(step)
        )

        if (missingRequired.length > 0) {
            return {
                success: false,
                error: `Missing required steps: ${missingRequired.join(", ")}`
            }
        }

        // Mark onboarding as complete
        const { error } = await supabaseAdmin
            .from("profiles")
            .upsert(
                {
                    id: userId,
                    onboarding_completed: true,
                    onboarding_completed_at: new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                },
                { onConflict: "id" }
            )

        if (error) {
            console.error("[completeOnboarding] Error:", error)
            return { success: false, error: "Failed to complete onboarding" }
        }

        // Infer skill domain from learning goal using intent classifier
        const learningGoal = progress.responses["learning_direction"] || progress.responses["learning_goal"]
        if (learningGoal) {
            const classification = classifyIntent(learningGoal)
            const skillDomain = adaptIntentToSkillDomain(classification)

            // Update profile with inferred skill domain
            await supabaseAdmin
                .from("profiles")
                .update({
                    inferred_skill_domain: skillDomain,
                    updated_at: new Date().toISOString(),
                })
                .eq("id", userId)

            console.log(`[completeOnboarding] Inferred skill domain: ${skillDomain} (confidence: ${classification.confidence})`)
        }

        // Fill any missing profile fields from responses
        const { fillMissingProfileFields } = await import("@/lib/actions/profile-actions")
        await fillMissingProfileFields(userId)

        console.log(`[completeOnboarding] Completed for user ${userId}`)
        return { success: true }
    } catch (err) {
        console.error("[completeOnboarding] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

// ============================================================================
// LEGACY COMPATIBILITY - saveOnboardingAction
// ============================================================================

export type OnboardingRole = "student" | "mentor"

export interface SaveOnboardingInput {
    fullName: string
    role: OnboardingRole
    learningGoal?: string
}

export interface SaveOnboardingResult {
    success: boolean
    error?: string
    hint?: string
}

// ============================================================================
// GET USER ROLE
// ============================================================================

/**
 * Get the current user's role from their profile.
 * Used to check if they should be redirected to mentor-specific onboarding.
 */
export async function getUserRole(): Promise<{ role: UserRole | null; onboarding_completed: boolean }> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { role: null, onboarding_completed: false }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile, error } = await (supabaseAdmin as any)
            .from("profiles")
            .select("role, onboarding_completed")
            .eq("id", userId)
            .single()

        if (error || !profile) {
            return { role: null, onboarding_completed: false }
        }

        return {
            role: (profile.role as UserRole | null),
            onboarding_completed: (profile.onboarding_completed as boolean | null) ?? false
        }
    } catch {
        return { role: null, onboarding_completed: false }
    }
}

// ============================================================================
// LEGACY COMPATIBILITY - saveOnboardingAction
// ============================================================================

/**
 * Legacy server action for backwards compatibility.
 * Saves all onboarding data at once (old flow).
 */
export async function saveOnboardingAction(
    input: SaveOnboardingInput
): Promise<SaveOnboardingResult> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { success: false, error: "Not authenticated" }
        }

        // Save responses individually
        await saveOnboardingResponse({
            stepKey: "full_name",
            questionKey: "full_name",
            responseValue: input.fullName,
        })

        await saveOnboardingResponse({
            stepKey: "role",
            questionKey: "role",
            responseValue: input.role,
        })

        if (input.learningGoal) {
            await saveOnboardingResponse({
                stepKey: "learning_direction",
                questionKey: "learning_goal",
                responseValue: input.learningGoal,
            })
        }

        // Complete onboarding
        const result = await completeOnboarding()
        return result
    } catch (err) {
        console.error("[saveOnboardingAction] Error:", err)
        return { success: false, error: "Failed to save onboarding data" }
    }
}

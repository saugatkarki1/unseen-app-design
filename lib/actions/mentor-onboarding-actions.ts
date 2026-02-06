"use server"

// lib/actions/mentor-onboarding-actions.ts
// ============================================================================
// MENTOR ONBOARDING SERVER ACTIONS
// ============================================================================
// Server actions for mentor onboarding - collecting expertise, experience,
// availability, and motivation before granting mentor dashboard access.
// ============================================================================

import { cookies } from "next/headers"
import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import { supabaseAdmin } from "@/lib/supabase/admin"
import type {
    MentorProfile,
    MentorOnboardingStatus,
    MentorExperienceLevel,
    MentorAvailability,
} from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

export type MentorOnboardingField =
    | "full_name"
    | "institution"
    | "mentor_expertise"
    | "mentor_experience_level"
    | "mentor_availability"
    | "mentor_motivation"

export interface SaveMentorFieldResult {
    success: boolean
    error?: string
}

export interface CompleteMentorOnboardingResult {
    success: boolean
    error?: string
    mentorId?: string
}

// Valid expertise options
export const MENTOR_EXPERTISE_OPTIONS = [
    "Web Development",
    "Mobile Development",
    "Data Science",
    "Game Development",
    "Backend Engineering",
    "UI/UX Design",
    "DevOps",
    "Cybersecurity",
] as const

// Valid experience levels
export const MENTOR_EXPERIENCE_LEVELS: MentorExperienceLevel[] = [
    "beginner",
    "intermediate",
    "advanced",
]

// Valid availability options
export const MENTOR_AVAILABILITY_OPTIONS: MentorAvailability[] = [
    "casual",
    "regular",
    "fulltime",
]

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
// SAVE INDIVIDUAL FIELD
// ============================================================================

export async function saveMentorOnboardingField(
    field: MentorOnboardingField,
    value: string | string[]
): Promise<SaveMentorFieldResult> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { success: false, error: "Not authenticated" }
        }

        // Validate the field value
        const validatedValue = validateFieldValue(field, value)
        if (validatedValue.error) {
            return { success: false, error: validatedValue.error }
        }

        // Build update object based on field
        const update: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        switch (field) {
            case "full_name":
                update.full_name = validatedValue.value
                break
            case "institution":
                update.institution = validatedValue.value || null
                break
            case "mentor_expertise":
                update.mentor_expertise = validatedValue.value
                break
            case "mentor_experience_level":
                update.mentor_experience_level = validatedValue.value
                break
            case "mentor_availability":
                update.mentor_availability = validatedValue.value
                break
            case "mentor_motivation":
                update.mentor_motivation = validatedValue.value || null
                break
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error } = await (supabaseAdmin
            .from("profiles") as any)
            .update(update)
            .eq("id", userId)

        if (error) {
            console.error("[saveMentorOnboardingField] Error:", error)
            return { success: false, error: "Failed to save field" }
        }

        console.log(`[saveMentorOnboardingField] Saved ${field} for user ${userId}`)
        return { success: true }
    } catch (err) {
        console.error("[saveMentorOnboardingField] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

// ============================================================================
// FIELD VALIDATION
// ============================================================================

function validateFieldValue(
    field: MentorOnboardingField,
    value: string | string[]
): { value: string | string[] | null; error?: string } {
    switch (field) {
        case "full_name":
            if (typeof value !== "string" || value.trim().length < 2) {
                return { value: null, error: "Full name must be at least 2 characters" }
            }
            return { value: value.trim() }

        case "institution":
            if (typeof value !== "string") {
                return { value: null, error: "Institution must be a string" }
            }
            return { value: value.trim() }

        case "mentor_expertise":
            if (!Array.isArray(value)) {
                return { value: null, error: "Expertise must be an array" }
            }
            if (value.length === 0) {
                return { value: null, error: "Please select at least one area of expertise" }
            }
            // Validate each expertise value
            const validExpertise = value.filter((v) =>
                MENTOR_EXPERTISE_OPTIONS.includes(v as typeof MENTOR_EXPERTISE_OPTIONS[number])
            )
            if (validExpertise.length === 0) {
                return { value: null, error: "Invalid expertise selection" }
            }
            return { value: validExpertise }

        case "mentor_experience_level":
            if (typeof value !== "string") {
                return { value: null, error: "Experience level must be a string" }
            }
            if (!MENTOR_EXPERIENCE_LEVELS.includes(value as MentorExperienceLevel)) {
                return { value: null, error: "Invalid experience level" }
            }
            return { value: value }

        case "mentor_availability":
            if (typeof value !== "string") {
                return { value: null, error: "Availability must be a string" }
            }
            if (!MENTOR_AVAILABILITY_OPTIONS.includes(value as MentorAvailability)) {
                return { value: null, error: "Invalid availability selection" }
            }
            return { value: value }

        case "mentor_motivation":
            if (typeof value !== "string") {
                return { value: null, error: "Motivation must be a string" }
            }
            return { value: value.trim() }

        default:
            return { value: null, error: "Unknown field" }
    }
}

// ============================================================================
// GET MENTOR ONBOARDING STATUS
// ============================================================================

export async function getMentorOnboardingStatus(): Promise<MentorOnboardingStatus> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return {
                isComplete: false,
                completedAt: null,
                missingFields: [],
                profile: null,
            }
        }

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: profile, error } = await (supabaseAdmin
            .from("profiles") as any)
            .select(`
                id,
                email,
                username,
                full_name,
                institution,
                mentor_expertise,
                mentor_experience_level,
                mentor_availability,
                mentor_motivation,
                mentor_onboarding_completed,
                mentor_onboarding_completed_at
            `)
            .eq("id", userId)
            .single()

        if (error || !profile) {
            return {
                isComplete: false,
                completedAt: null,
                missingFields: [],
                profile: null,
            }
        }

        // Check for missing required fields
        const missingFields: string[] = []

        if (!profile.full_name || profile.full_name.trim().length === 0) {
            missingFields.push("full_name")
        }
        if (!profile.mentor_expertise || profile.mentor_expertise.length === 0) {
            missingFields.push("mentor_expertise")
        }
        if (!profile.mentor_experience_level) {
            missingFields.push("mentor_experience_level")
        }
        if (!profile.mentor_availability) {
            missingFields.push("mentor_availability")
        }

        return {
            isComplete: profile.mentor_onboarding_completed === true,
            completedAt: profile.mentor_onboarding_completed_at,
            missingFields,
            profile: {
                id: profile.id,
                email: profile.email,
                username: profile.username,
                full_name: profile.full_name,
                institution: profile.institution,
                mentor_expertise: profile.mentor_expertise || [],
                mentor_experience_level: profile.mentor_experience_level as MentorExperienceLevel | null,
                mentor_availability: profile.mentor_availability as MentorAvailability | null,
                mentor_motivation: profile.mentor_motivation,
                mentor_onboarding_completed: profile.mentor_onboarding_completed ?? false,
                mentor_onboarding_completed_at: profile.mentor_onboarding_completed_at,
            },
        }
    } catch (err) {
        console.error("[getMentorOnboardingStatus] Unexpected error:", err)
        return {
            isComplete: false,
            completedAt: null,
            missingFields: [],
            profile: null,
        }
    }
}

// ============================================================================
// COMPLETE MENTOR ONBOARDING
// ============================================================================

export async function completeMentorOnboarding(): Promise<CompleteMentorOnboardingResult> {
    try {
        const userId = await getCurrentUserId()
        if (!userId) {
            return { success: false, error: "Not authenticated" }
        }

        // Get current status to validate
        const status = await getMentorOnboardingStatus()

        if (status.missingFields.length > 0) {
            return {
                success: false,
                error: `Missing required fields: ${status.missingFields.join(", ")}`,
            }
        }

        if (!status.profile) {
            return { success: false, error: "Profile not found" }
        }

        // Mark mentor onboarding as complete
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { error: profileError } = await (supabaseAdmin
            .from("profiles") as any)
            .update({
                mentor_onboarding_completed: true,
                mentor_onboarding_completed_at: new Date().toISOString(),
                updated_at: new Date().toISOString(),
            })
            .eq("id", userId)

        if (profileError) {
            console.error("[completeMentorOnboarding] Profile update error:", profileError)
            return { success: false, error: "Failed to complete onboarding" }
        }

        // Create or update mentor record in mentors table
        const mentorResult = await createOrUpdateMentor(userId, status.profile)

        if (!mentorResult.success) {
            console.error("[completeMentorOnboarding] Mentor record error:", mentorResult.error)
            // Don't fail - onboarding is complete, mentor record can be fixed later
        }

        console.log(`[completeMentorOnboarding] Completed for user ${userId}`)
        return {
            success: true,
            mentorId: mentorResult.mentorId,
        }
    } catch (err) {
        console.error("[completeMentorOnboarding] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

// ============================================================================
// CREATE OR UPDATE MENTOR RECORD
// ============================================================================

async function createOrUpdateMentor(
    userId: string,
    profile: Partial<MentorProfile>
): Promise<{ success: boolean; mentorId?: string; error?: string }> {
    try {
        // Check if mentor record exists
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: existingMentor } = await (supabaseAdmin
            .from("mentors") as any)
            .select("id")
            .eq("user_id", userId)
            .single()

        const mentorData = {
            user_id: userId,
            name: profile.full_name || "Mentor",
            specializations: profile.mentor_expertise || [],
            is_active: true,
            updated_at: new Date().toISOString(),
        }

        if (existingMentor) {
            // Update existing mentor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error } = await (supabaseAdmin
                .from("mentors") as any)
                .update(mentorData)
                .eq("id", (existingMentor as any).id)

            if (error) {
                return { success: false, error: error.message }
            }
            return { success: true, mentorId: (existingMentor as any).id }
        } else {
            // Insert new mentor
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data, error } = await (supabaseAdmin
                .from("mentors") as any)
                .insert({
                    ...mentorData,
                    created_at: new Date().toISOString(),
                })
                .select("id")
                .single()

            if (error) {
                return { success: false, error: error.message }
            }
            return { success: true, mentorId: (data as any)?.id }
        }
    } catch (err) {
        console.error("[createOrUpdateMentor] Error:", err)
        return { success: false, error: "Failed to create mentor record" }
    }
}

// ============================================================================
// RETROACTIVE MENTOR ONBOARDING
// ============================================================================

/**
 * Retroactively mark existing mentors (in mentors table) as having completed
 * mentor onboarding. This copies their specializations to mentor_expertise.
 */
export async function runRetroactiveMentorOnboarding(): Promise<{
    success: boolean
    processed: number
    error?: string
}> {
    try {
        // Get all active mentors
        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        const { data: mentors, error: mentorsError } = await (supabaseAdmin
            .from("mentors") as any)
            .select("id, user_id, name, specializations, created_at")
            .eq("is_active", true)

        if (mentorsError || !mentors) {
            return { success: false, processed: 0, error: "Failed to fetch mentors" }
        }

        let processed = 0

        // eslint-disable-next-line @typescript-eslint/no-explicit-any
        for (const mentor of mentors as any[]) {
            if (!mentor.user_id) continue

            // Check if already onboarded
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { data: profile } = await (supabaseAdmin
                .from("profiles") as any)
                .select("mentor_onboarding_completed")
                .eq("id", mentor.user_id)
                .single()

            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            if ((profile as any)?.mentor_onboarding_completed) {
                continue // Already onboarded
            }

            // Backfill mentor onboarding fields
            // eslint-disable-next-line @typescript-eslint/no-explicit-any
            const { error: updateError } = await (supabaseAdmin
                .from("profiles") as any)
                .update({
                    mentor_expertise: mentor.specializations || [],
                    mentor_onboarding_completed: true,
                    mentor_onboarding_completed_at: mentor.created_at || new Date().toISOString(),
                    updated_at: new Date().toISOString(),
                })
                .eq("id", mentor.user_id)

            if (!updateError) {
                processed++
            }
        }

        console.log(`[runRetroactiveMentorOnboarding] Processed ${processed} mentors`)
        return { success: true, processed }
    } catch (err) {
        console.error("[runRetroactiveMentorOnboarding] Error:", err)
        return { success: false, processed: 0, error: "An unexpected error occurred" }
    }
}

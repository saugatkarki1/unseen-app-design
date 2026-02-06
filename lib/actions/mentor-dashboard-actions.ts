"use server"

// lib/actions/mentor-dashboard-actions.ts
// ============================================================================
// MENTOR DASHBOARD SERVER ACTIONS
// ============================================================================
// Server actions for mentor dashboard - viewing assigned learners and notes.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import type { MentorLearnerView } from "@/lib/supabase/types"
import {
    getMentorForUser,
    getMentorAssignedLearners,
    getLearnerCurriculumStatus,
    getMentorNotes,
    upsertMentorNote,
} from "@/lib/supabase/table-helpers"

// ============================================================================
// TYPES
// ============================================================================

export interface MentorDashboardData {
    isMentor: boolean
    mentorId: string | null
    mentorName: string | null
    learners: MentorLearnerView[]
    totalLearners: number
}

// ============================================================================
// MENTOR DASHBOARD ACTIONS
// ============================================================================

/**
 * Get the current user's mentor dashboard data.
 * Returns learners with their profiles, curriculum status, and notes.
 */
export async function getMentorDashboardData(): Promise<MentorDashboardData> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            isMentor: false,
            mentorId: null,
            mentorName: null,
            learners: [],
            totalLearners: 0,
        }
    }

    // Check if current user is a mentor
    const mentor = await getMentorForUser(supabase, user.id)

    if (!mentor) {
        return {
            isMentor: false,
            mentorId: null,
            mentorName: null,
            learners: [],
            totalLearners: 0,
        }
    }

    // Get assigned learners
    const assignedLearners = await getMentorAssignedLearners(supabase, mentor.id)

    // Get mentor notes for all learners
    const notesMap = await getMentorNotes(supabase, mentor.id)

    // Build learner views with curriculum status
    const learnerViews: MentorLearnerView[] = await Promise.all(
        assignedLearners.map(async (learner) => {
            const curriculumStatus = await getLearnerCurriculumStatus(supabase, learner.id)
            const notes = notesMap.get(learner.id)

            return {
                id: learner.id,
                full_name: learner.full_name,
                email: learner.email,
                avatar_url: learner.avatar_url,
                skill_domain: learner.skill_domain,
                inferred_skill_level: learner.inferred_skill_level,
                learning_goal: learner.learning_goal,
                onboarding_completed: learner.onboarding_completed,
                onboarding_completed_at: learner.onboarding_completed_at,
                last_activity_at: learner.last_activity_at,
                curriculum_started: curriculumStatus.started,
                curriculum_count: curriculumStatus.count,
                note: notes?.note ?? null,
                next_focus: notes?.next_focus ?? null,
            }
        })
    )

    return {
        isMentor: true,
        mentorId: mentor.id,
        mentorName: mentor.name,
        learners: learnerViews,
        totalLearners: learnerViews.length,
    }
}

/**
 * Add or update a note for a specific learner.
 */
export async function addMentorNote(
    learnerId: string,
    note: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Not authenticated" }
    }

    // Get mentor record
    const mentor = await getMentorForUser(supabase, user.id)
    if (!mentor) {
        return { success: false, error: "Not a mentor" }
    }

    // Get existing note to preserve next_focus
    const existingNotes = await getMentorNotes(supabase, mentor.id)
    const existing = existingNotes.get(learnerId)

    const success = await upsertMentorNote(
        supabase,
        mentor.id,
        learnerId,
        note,
        existing?.next_focus ?? null
    )

    if (success) {
        revalidatePath("/mentor-dashboard")
    }

    return { success, error: success ? undefined : "Failed to save note" }
}

/**
 * Set the "next focus" guidance for a learner.
 */
export async function setLearnerNextFocus(
    learnerId: string,
    nextFocus: string
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Not authenticated" }
    }

    // Get mentor record
    const mentor = await getMentorForUser(supabase, user.id)
    if (!mentor) {
        return { success: false, error: "Not a mentor" }
    }

    // Get existing note to preserve note content
    const existingNotes = await getMentorNotes(supabase, mentor.id)
    const existing = existingNotes.get(learnerId)

    const success = await upsertMentorNote(
        supabase,
        mentor.id,
        learnerId,
        existing?.note ?? null,
        nextFocus
    )

    if (success) {
        revalidatePath("/mentor-dashboard")
    }

    return { success, error: success ? undefined : "Failed to save focus" }
}

/**
 * Update both note and next focus at once.
 */
export async function updateMentorNoteAndFocus(
    learnerId: string,
    note: string | null,
    nextFocus: string | null
): Promise<{ success: boolean; error?: string }> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { success: false, error: "Not authenticated" }
    }

    // Get mentor record
    const mentor = await getMentorForUser(supabase, user.id)
    if (!mentor) {
        return { success: false, error: "Not a mentor" }
    }

    const success = await upsertMentorNote(
        supabase,
        mentor.id,
        learnerId,
        note,
        nextFocus
    )

    if (success) {
        revalidatePath("/mentor-dashboard")
    }

    return { success, error: success ? undefined : "Failed to save changes" }
}

/**
 * Check if current user is a mentor.
 */
export async function checkIsMentor(): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const mentor = await getMentorForUser(supabase, user.id)
    return mentor !== null
}

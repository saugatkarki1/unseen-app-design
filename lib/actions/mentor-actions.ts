"use server"

// lib/actions/mentor-actions.ts
// ============================================================================
// MENTOR & CURRICULUM SERVER ACTIONS
// ============================================================================
// Server actions for mentor and curriculum operations.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"
import {
    assignMentorForUser,
    getUserMentor as getMentorInternal,
    hasAssignedMentor,
} from "@/lib/mentor-assignment"
import {
    generateCurriculumForUser,
    getUserCurriculum as getCurriculumInternal,
    getNextCurriculumItem,
    getCurriculumProgress,
    markCurriculumComplete,
    startCurriculumItem,
} from "@/lib/curriculum-recommendation"
import type { Mentor, CurriculumItem } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

export interface MentorWithAssignment {
    mentor: Mentor
    assignedAt: string | null
    assignmentReason: string | null
}

export interface CurriculumItemWithStatus {
    item: CurriculumItem
    status: "assigned" | "in_progress" | "completed"
    assignedAt: string | null
    startedAt: string | null
    completedAt: string | null
}

export interface LearningDashboardData {
    mentor: MentorWithAssignment | null
    curriculum: CurriculumItemWithStatus[]
    nextItem: CurriculumItem | null
    progress: {
        total: number
        completed: number
        inProgress: number
        percentComplete: number
    }
}

// ============================================================================
// MENTOR ACTIONS
// ============================================================================

/**
 * Get the current user's assigned mentor.
 */
export async function getUserMentor(): Promise<MentorWithAssignment | null> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from("user_mentor")
        .select(`
            assigned_at,
            assignment_reason,
            mentors (*)
        `)
        .eq("user_id", user.id)
        .single()

    if (error || !data) {
        return null
    }

    // Handle the nested mentor data with explicit type cast
    const typedData = data as unknown as {
        assigned_at: string | null
        assignment_reason: string | null
        mentors: Mentor
    }

    return {
        mentor: typedData.mentors,
        assignedAt: typedData.assigned_at,
        assignmentReason: typedData.assignment_reason,
    }
}

/**
 * Assign a mentor to the current user.
 * Returns the assigned mentor or null if failed.
 */
export async function assignMentorToCurrentUser(): Promise<MentorWithAssignment | null> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    // Check if already has mentor
    const existing = await getUserMentor()
    if (existing) {
        return existing
    }

    // Assign a new mentor
    const result = await assignMentorForUser(user.id)
    if (!result) {
        return null
    }

    revalidatePath("/dashboard")

    return {
        mentor: result.mentor,
        assignedAt: new Date().toISOString(),
        assignmentReason: result.assignmentReason,
    }
}

/**
 * Check if current user has an assigned mentor.
 */
export async function currentUserHasMentor(): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    return hasAssignedMentor(user.id)
}

// ============================================================================
// CURRICULUM ACTIONS
// ============================================================================

/**
 * Get the current user's curriculum with status.
 */
export async function getUserCurriculum(): Promise<CurriculumItemWithStatus[]> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    const curriculum = await getCurriculumInternal(user.id)

    return curriculum.map(item => ({
        item: item.curriculum_item,
        status: item.status,
        assignedAt: item.assigned_at,
        startedAt: item.started_at,
        completedAt: item.completed_at,
    }))
}

/**
 * Generate curriculum for the current user.
 */
export async function generateUserCurriculum(): Promise<CurriculumItemWithStatus[]> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return []
    }

    await generateCurriculumForUser(user.id)
    revalidatePath("/dashboard")

    return getUserCurriculum()
}

/**
 * Get next curriculum item for current user.
 */
export async function getNextUserCurriculumItem(): Promise<CurriculumItem | null> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    return getNextCurriculumItem(user.id)
}

/**
 * Get curriculum progress for current user.
 */
export async function getUserCurriculumProgress(): Promise<{
    total: number
    completed: number
    inProgress: number
    percentComplete: number
}> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return { total: 0, completed: 0, inProgress: 0, percentComplete: 0 }
    }

    return getCurriculumProgress(user.id)
}

/**
 * Mark a curriculum item as complete.
 */
export async function completeCurriculumItem(itemId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const success = await markCurriculumComplete(user.id, itemId)
    if (success) {
        revalidatePath("/dashboard")
    }
    return success
}

/**
 * Start a curriculum item.
 */
export async function startCurriculumItemAction(itemId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return false
    }

    const success = await startCurriculumItem(user.id, itemId)
    if (success) {
        revalidatePath("/dashboard")
    }
    return success
}

// ============================================================================
// COMBINED DASHBOARD DATA
// ============================================================================

/**
 * Get all learning dashboard data in one call.
 */
export async function getLearningDashboardData(): Promise<LearningDashboardData> {
    const [mentor, curriculum, nextItem, progress] = await Promise.all([
        getUserMentor(),
        getUserCurriculum(),
        getNextUserCurriculumItem(),
        getUserCurriculumProgress(),
    ])

    return {
        mentor,
        curriculum,
        nextItem,
        progress,
    }
}

/**
 * Initialize learning for a new user.
 * Assigns mentor and generates curriculum.
 */
export async function initializeLearning(): Promise<LearningDashboardData> {
    const supabase = await createSupabaseServerClient()
    const { data: { user } } = await supabase.auth.getUser()

    if (!user) {
        return {
            mentor: null,
            curriculum: [],
            nextItem: null,
            progress: { total: 0, completed: 0, inProgress: 0, percentComplete: 0 },
        }
    }

    // Assign mentor if not already assigned
    const hasMentor = await hasAssignedMentor(user.id)
    if (!hasMentor) {
        await assignMentorForUser(user.id)
    }

    // Generate curriculum if not already generated
    const existingCurriculum = await getCurriculumInternal(user.id)
    if (existingCurriculum.length === 0) {
        await generateCurriculumForUser(user.id)
    }

    revalidatePath("/dashboard")

    return getLearningDashboardData()
}

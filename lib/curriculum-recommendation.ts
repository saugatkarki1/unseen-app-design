// lib/curriculum-recommendation.ts
// ============================================================================
// CURRICULUM RECOMMENDATION ENGINE
// ============================================================================
// Generates personalized curriculum recommendations based on user profile.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { CurriculumItem, UserCurriculumInsert } from "@/lib/supabase/types"
import {
    getCurriculumItemsByDomain,
    getUserCurriculumWithItems,
    getUserCurriculumItemIds,
    insertUserCurriculum,
    updateUserCurriculumStatus,
    getProfileForAssignment,
    getProfilesForRetroactive,
    type ProfileForAssignment,
} from "@/lib/supabase/table-helpers"

// ============================================================================
// TYPES
// ============================================================================

export interface CurriculumRecommendation {
    items: CurriculumItem[]
    totalEstimatedMinutes: number
    completedCount: number
    inProgressCount: number
}

export interface UserCurriculumWithItem {
    id: string
    curriculum_item_id: string
    status: "assigned" | "in_progress" | "completed"
    assigned_at: string | null
    started_at: string | null
    completed_at: string | null
    curriculum_item: CurriculumItem
}

export interface RetroactiveCurriculumReport {
    processed: number
    assigned: number
    skipped: number
    errors: string[]
}

// ============================================================================
// TIME COMMITMENT MAPPING
// ============================================================================

/**
 * Number of curriculum items to assign based on time commitment.
 */
const ITEM_LIMITS: Record<string, number> = {
    casual: 3,
    regular: 5,
    intensive: 8,
}

/**
 * Get the item limit for a time commitment level.
 */
function getItemLimit(timeCommitment: string | null): number {
    return ITEM_LIMITS[timeCommitment || "regular"] || 5
}

// ============================================================================
// CURRICULUM GENERATION
// ============================================================================

/**
 * Generate curriculum recommendations for a user based on their profile.
 */
export async function generateCurriculumForUser(
    userId: string
): Promise<CurriculumRecommendation | null> {
    const supabase = await createSupabaseServerClient()

    // Fetch user profile using helper
    const profile = await getProfileForAssignment(supabase, userId)

    if (!profile) {
        console.error("[curriculum-recommendation] Error fetching profile")
        return null
    }

    const domain = profile.inferred_skill_domain || "General"
    const itemLimit = getItemLimit(profile.time_commitment)

    // Fetch curriculum items for the user's domain using helper
    let items = await getCurriculumItemsByDomain(supabase, domain)

    // If no items for domain, fall back to General
    if (items.length === 0) {
        items = await getCurriculumItemsByDomain(supabase, "General")
    }

    // Order by difficulty (Beginner first, then Intermediate, then Advanced)
    const difficultyOrder: Record<string, number> = { Beginner: 0, Intermediate: 1, Advanced: 2 }
    items.sort((a, b) => {
        const orderA = difficultyOrder[a.difficulty] ?? 1
        const orderB = difficultyOrder[b.difficulty] ?? 1
        return orderA - orderB || a.display_order - b.display_order
    })

    // Limit items based on time commitment
    const recommendedItems = items.slice(0, itemLimit)

    // Check existing assignments using helper
    const existingIds = new Set(await getUserCurriculumItemIds(supabase, userId))

    // Create assignments for new items only
    const newItems = recommendedItems.filter(item => !existingIds.has(item.id))

    if (newItems.length > 0) {
        const assignments: UserCurriculumInsert[] = newItems.map(item => ({
            user_id: userId,
            curriculum_item_id: item.id,
            status: "assigned" as const,
        }))

        await insertUserCurriculum(supabase, assignments)
    }

    const totalMinutes = recommendedItems.reduce((sum, item) => sum + item.estimated_minutes, 0)

    return {
        items: recommendedItems,
        totalEstimatedMinutes: totalMinutes,
        completedCount: 0,
        inProgressCount: 0,
    }
}

// ============================================================================
// CURRICULUM RETRIEVAL
// ============================================================================

/**
 * Get user's curriculum with completion status.
 */
export async function getUserCurriculum(
    userId: string
): Promise<UserCurriculumWithItem[]> {
    const supabase = await createSupabaseServerClient()
    const items = await getUserCurriculumWithItems(supabase, userId)

    return items.map(row => ({
        id: row.id,
        curriculum_item_id: row.curriculum_item_id,
        status: row.status,
        assigned_at: row.assigned_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        curriculum_item: row.curriculum_item,
    }))
}

/**
 * Get the next recommended curriculum item (first non-completed item).
 */
export async function getNextCurriculumItem(
    userId: string
): Promise<CurriculumItem | null> {
    const items = await getUserCurriculum(userId)

    // Find first in_progress or assigned item
    const inProgress = items.find(item => item.status === "in_progress")
    if (inProgress) {
        return inProgress.curriculum_item
    }

    const nextAssigned = items.find(item => item.status === "assigned")
    return nextAssigned?.curriculum_item || null
}

/**
 * Get curriculum progress stats.
 */
export async function getCurriculumProgress(userId: string): Promise<{
    total: number
    completed: number
    inProgress: number
    percentComplete: number
}> {
    const items = await getUserCurriculum(userId)

    const total = items.length
    const completed = items.filter(item => item.status === "completed").length
    const inProgress = items.filter(item => item.status === "in_progress").length
    const percentComplete = total > 0 ? Math.round((completed / total) * 100) : 0

    return { total, completed, inProgress, percentComplete }
}

// ============================================================================
// CURRICULUM UPDATES
// ============================================================================

/**
 * Update curriculum item status.
 */
export async function updateCurriculumStatus(
    userId: string,
    curriculumItemId: string,
    status: "assigned" | "in_progress" | "completed"
): Promise<boolean> {
    const supabase = await createSupabaseServerClient()

    const update: Record<string, unknown> = { status }

    if (status === "in_progress") {
        update.started_at = new Date().toISOString()
    } else if (status === "completed") {
        update.completed_at = new Date().toISOString()
    }

    return updateUserCurriculumStatus(supabase, userId, curriculumItemId, update)
}

/**
 * Mark a curriculum item as complete.
 */
export async function markCurriculumComplete(
    userId: string,
    curriculumItemId: string
): Promise<boolean> {
    return updateCurriculumStatus(userId, curriculumItemId, "completed")
}

/**
 * Start a curriculum item.
 */
export async function startCurriculumItem(
    userId: string,
    curriculumItemId: string
): Promise<boolean> {
    return updateCurriculumStatus(userId, curriculumItemId, "in_progress")
}

// ============================================================================
// RETROACTIVE CURRICULUM GENERATION
// ============================================================================

/**
 * Generate curriculum for all users without assignments.
 */
export async function retroactivelyGenerateCurriculum(): Promise<RetroactiveCurriculumReport> {
    const supabase = await createSupabaseServerClient()

    const report: RetroactiveCurriculumReport = {
        processed: 0,
        assigned: 0,
        skipped: 0,
        errors: [],
    }

    // Get profiles with completed onboarding
    const profiles = await getProfilesForRetroactive(supabase)

    // Filter to users without any curriculum items
    for (const user of profiles) {
        report.processed++

        // Check if user already has curriculum
        const existingIds = await getUserCurriculumItemIds(supabase, user.id)

        if (existingIds.length > 0) {
            report.skipped++
            continue
        }

        try {
            const result = await generateCurriculumForUser(user.id)
            if (result && result.items.length > 0) {
                report.assigned++
                console.log(`[retroactive-curriculum] Generated ${result.items.length} items for user ${user.id}`)
            } else {
                report.skipped++
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err)
            report.errors.push(`User ${user.id}: ${error}`)
        }
    }

    console.log(`[retroactive-curriculum] Complete: ${report.assigned}/${report.processed} generated`)
    return report
}

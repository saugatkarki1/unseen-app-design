// lib/supabase/table-helpers.ts
// ============================================================================
// SUPABASE TABLE HELPERS
// ============================================================================
// Type-safe helpers for accessing new tables before types are auto-generated.
// These helpers provide proper typing until the SQL migration is run and
// types are regenerated.
// ============================================================================

import { SupabaseClient } from "@supabase/supabase-js"
import type {
    Mentor,
    MentorInsert,
    MentorUpdate,
    UserMentor,
    UserMentorInsert,
    UserMentorUpdate,
    CurriculumItem,
    CurriculumItemInsert,
    CurriculumItemUpdate,
    UserCurriculum,
    UserCurriculumInsert,
    UserCurriculumUpdate,
} from "@/lib/supabase/types"

// ============================================================================
// TYPE DEFINITIONS
// ============================================================================

/**
 * Profile fields needed for mentor/curriculum assignment.
 * These are fields we know exist in the profiles table.
 */
export interface ProfileForAssignment {
    id: string
    inferred_skill_domain: string | null
    motivation_type: string | null
    current_skill_level: string | null
    time_commitment: string | null
    onboarding_completed: boolean
}

// ============================================================================
// MENTOR TABLE HELPERS
// ============================================================================

/**
 * Get all active mentors.
 */
export async function getMentors(supabase: SupabaseClient): Promise<Mentor[]> {
    const { data, error } = await supabase
        .from("mentors")
        .select("*")
        .eq("is_active", true)

    if (error || !data) {
        console.error("[table-helpers] Error fetching mentors:", error)
        return []
    }

    return data as unknown as Mentor[]
}

/**
 * Insert a mentor.
 */
export async function insertMentor(
    supabase: SupabaseClient,
    mentor: MentorInsert
): Promise<Mentor | null> {
    const { data, error } = await supabase
        .from("mentors")
        .insert(mentor)
        .select()
        .single()

    if (error) {
        console.error("[table-helpers] Error inserting mentor:", error)
        return null
    }

    return data as unknown as Mentor
}

// ============================================================================
// USER_MENTOR TABLE HELPERS
// ============================================================================

/**
 * Get user's mentor assignment.
 */
export async function getUserMentorAssignment(
    supabase: SupabaseClient,
    userId: string
): Promise<{ assignment: UserMentor; mentor: Mentor } | null> {
    const { data, error } = await supabase
        .from("user_mentor")
        .select(`
            id,
            user_id,
            mentor_id,
            assigned_at,
            assignment_reason,
            mentors (*)
        `)
        .eq("user_id", userId)
        .single()

    if (error || !data) {
        return null
    }

    const typedData = data as unknown as UserMentor & { mentors: Mentor }

    return {
        assignment: {
            id: typedData.id,
            user_id: typedData.user_id,
            mentor_id: typedData.mentor_id,
            assigned_at: typedData.assigned_at,
            assignment_reason: typedData.assignment_reason,
        },
        mentor: typedData.mentors,
    }
}

/**
 * Upsert user mentor assignment.
 */
export async function upsertUserMentor(
    supabase: SupabaseClient,
    assignment: UserMentorInsert
): Promise<boolean> {
    const { error } = await supabase
        .from("user_mentor")
        .upsert(assignment as unknown as Record<string, unknown>, { onConflict: "user_id" })

    if (error) {
        console.error("[table-helpers] Error upserting user_mentor:", error)
        return false
    }

    return true
}

/**
 * Check if user has mentor.
 */
export async function checkHasMentor(
    supabase: SupabaseClient,
    userId: string
): Promise<boolean> {
    const { data, error } = await supabase
        .from("user_mentor")
        .select("id")
        .eq("user_id", userId)
        .maybeSingle()

    return !error && data !== null
}

// ============================================================================
// CURRICULUM_ITEMS TABLE HELPERS
// ============================================================================

/**
 * Get curriculum items by domain.
 */
export async function getCurriculumItemsByDomain(
    supabase: SupabaseClient,
    domain: string
): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
        .from("curriculum_items")
        .select("*")
        .eq("skill_domain", domain)
        .eq("is_active", true)
        .order("display_order", { ascending: true })

    if (error || !data) {
        console.error("[table-helpers] Error fetching curriculum items:", error)
        return []
    }

    return data as unknown as CurriculumItem[]
}

/**
 * Insert curriculum items.
 */
export async function insertCurriculumItems(
    supabase: SupabaseClient,
    items: CurriculumItemInsert[]
): Promise<CurriculumItem[]> {
    const { data, error } = await supabase
        .from("curriculum_items")
        .insert(items as unknown as Record<string, unknown>[])
        .select()

    if (error) {
        console.error("[table-helpers] Error inserting curriculum items:", error)
        return []
    }

    return data as unknown as CurriculumItem[]
}

// ============================================================================
// USER_CURRICULUM TABLE HELPERS
// ============================================================================

/**
 * Get user's curriculum with items.
 */
export async function getUserCurriculumWithItems(
    supabase: SupabaseClient,
    userId: string
): Promise<Array<UserCurriculum & { curriculum_item: CurriculumItem }>> {
    const { data, error } = await supabase
        .from("user_curriculum")
        .select(`
            id,
            user_id,
            curriculum_item_id,
            status,
            assigned_at,
            started_at,
            completed_at,
            curriculum_items (*)
        `)
        .eq("user_id", userId)
        .order("assigned_at", { ascending: true })

    if (error || !data) {
        console.error("[table-helpers] Error fetching user curriculum:", error)
        return []
    }

    return (data as unknown as Array<UserCurriculum & { curriculum_items: CurriculumItem }>).map(row => ({
        id: row.id,
        user_id: row.user_id,
        curriculum_item_id: row.curriculum_item_id,
        status: row.status,
        assigned_at: row.assigned_at,
        started_at: row.started_at,
        completed_at: row.completed_at,
        curriculum_item: row.curriculum_items,
    }))
}

/**
 * Get existing curriculum item IDs for a user.
 */
export async function getUserCurriculumItemIds(
    supabase: SupabaseClient,
    userId: string
): Promise<string[]> {
    const { data, error } = await supabase
        .from("user_curriculum")
        .select("curriculum_item_id")
        .eq("user_id", userId)

    if (error || !data) {
        return []
    }

    return (data as unknown as Array<{ curriculum_item_id: string }>).map(d => d.curriculum_item_id)
}

/**
 * Insert user curriculum items.
 */
export async function insertUserCurriculum(
    supabase: SupabaseClient,
    items: UserCurriculumInsert[]
): Promise<boolean> {
    const { error } = await supabase
        .from("user_curriculum")
        .insert(items as unknown as Record<string, unknown>[])

    if (error) {
        console.error("[table-helpers] Error inserting user curriculum:", error)
        return false
    }

    return true
}

/**
 * Update user curriculum status.
 */
export async function updateUserCurriculumStatus(
    supabase: SupabaseClient,
    userId: string,
    curriculumItemId: string,
    update: Partial<UserCurriculumUpdate>
): Promise<boolean> {
    const { error } = await supabase
        .from("user_curriculum")
        .update(update as unknown as Record<string, unknown>)
        .eq("user_id", userId)
        .eq("curriculum_item_id", curriculumItemId)

    if (error) {
        console.error("[table-helpers] Error updating user curriculum:", error)
        return false
    }

    return true
}

// ============================================================================
// PROFILE HELPERS
// ============================================================================

/**
 * Get profile for assignment.
 */
export async function getProfileForAssignment(
    supabase: SupabaseClient,
    userId: string
): Promise<ProfileForAssignment | null> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, inferred_skill_domain, motivation_type, current_skill_level, time_commitment, onboarding_completed")
        .eq("id", userId)
        .single()

    if (error || !data) {
        return null
    }

    return data as unknown as ProfileForAssignment
}

/**
 * Get all profiles with completed onboarding for retroactive processing.
 */
export async function getProfilesForRetroactive(
    supabase: SupabaseClient
): Promise<ProfileForAssignment[]> {
    const { data, error } = await supabase
        .from("profiles")
        .select("id, inferred_skill_domain, motivation_type, current_skill_level, time_commitment, onboarding_completed")
        .eq("onboarding_completed", true)

    if (error || !data) {
        console.error("[table-helpers] Error fetching profiles:", error)
        return []
    }

    return data as unknown as ProfileForAssignment[]
}

// ============================================================================
// MENTOR DASHBOARD HELPERS
// ============================================================================

/**
 * Get mentor record for current user.
 */
export async function getMentorForUser(
    supabase: SupabaseClient,
    userId: string
): Promise<{ id: string; name: string; specializations: string[] } | null> {
    const { data, error } = await supabase
        .from("mentors")
        .select("id, name, specializations")
        .eq("user_id", userId)
        .eq("is_active", true)
        .single()

    if (error || !data) {
        return null
    }

    return data as { id: string; name: string; specializations: string[] }
}

/**
 * Get assigned learners for a mentor with full profile data.
 */
export async function getMentorAssignedLearners(
    supabase: SupabaseClient,
    mentorId: string
): Promise<Array<{
    id: string
    full_name: string | null
    email: string | null
    avatar_url: string | null
    skill_domain: string | null
    inferred_skill_level: string | null
    learning_goal: string | null
    onboarding_completed: boolean
    onboarding_completed_at: string | null
    last_activity_at: string | null
    assigned_at: string | null
}>> {
    // Get user IDs assigned to this mentor
    const { data: assignments, error: assignError } = await supabase
        .from("user_mentor")
        .select("user_id, assigned_at")
        .eq("mentor_id", mentorId)

    if (assignError || !assignments || assignments.length === 0) {
        return []
    }

    const userIds = assignments.map(a => a.user_id)
    const assignmentMap = new Map(assignments.map(a => [a.user_id, a.assigned_at]))

    // Get profile data for these users
    const { data: profiles, error: profileError } = await supabase
        .from("profiles")
        .select(`
            id,
            full_name,
            email,
            avatar_url,
            skill_domain,
            inferred_skill_level,
            learning_goal,
            onboarding_completed,
            onboarding_completed_at,
            last_activity_at
        `)
        .in("id", userIds)
        .order("onboarding_completed_at", { ascending: false, nullsFirst: false })

    if (profileError || !profiles) {
        console.error("[table-helpers] Error fetching learner profiles:", profileError)
        return []
    }

    return profiles.map(p => ({
        ...p,
        onboarding_completed: p.onboarding_completed ?? false,
        assigned_at: assignmentMap.get(p.id) ?? null
    })) as Array<{
        id: string
        full_name: string | null
        email: string | null
        avatar_url: string | null
        skill_domain: string | null
        inferred_skill_level: string | null
        learning_goal: string | null
        onboarding_completed: boolean
        onboarding_completed_at: string | null
        last_activity_at: string | null
        assigned_at: string | null
    }>
}

/**
 * Get curriculum status for a learner (for mentor dashboard).
 */
export async function getLearnerCurriculumStatus(
    supabase: SupabaseClient,
    learnerId: string
): Promise<{ started: boolean; count: number; inProgress: number; completed: number }> {
    const { data, error } = await supabase
        .from("user_curriculum")
        .select("status")
        .eq("user_id", learnerId)

    if (error || !data) {
        return { started: false, count: 0, inProgress: 0, completed: 0 }
    }

    const inProgress = data.filter(d => d.status === "in_progress").length
    const completed = data.filter(d => d.status === "completed").length
    const started = inProgress > 0 || completed > 0

    return {
        started,
        count: data.length,
        inProgress,
        completed
    }
}

/**
 * Get mentor notes for assigned learners.
 */
export async function getMentorNotes(
    supabase: SupabaseClient,
    mentorId: string
): Promise<Map<string, { note: string | null; next_focus: string | null }>> {
    const { data, error } = await supabase
        .from("mentor_notes")
        .select("learner_id, note, next_focus")
        .eq("mentor_id", mentorId)

    const notesMap = new Map<string, { note: string | null; next_focus: string | null }>()

    if (error || !data) {
        return notesMap
    }

    for (const row of data) {
        notesMap.set(row.learner_id, {
            note: row.note,
            next_focus: row.next_focus
        })
    }

    return notesMap
}

/**
 * Upsert a mentor note for a learner.
 */
export async function upsertMentorNote(
    supabase: SupabaseClient,
    mentorId: string,
    learnerId: string,
    note: string | null,
    nextFocus: string | null
): Promise<boolean> {
    const { error } = await supabase
        .from("mentor_notes")
        .upsert({
            mentor_id: mentorId,
            learner_id: learnerId,
            note,
            next_focus: nextFocus,
            updated_at: new Date().toISOString()
        }, { onConflict: "mentor_id,learner_id" })

    if (error) {
        console.error("[table-helpers] Error upserting mentor note:", error)
        return false
    }

    return true
}


// lib/mentor-assignment.ts
// ============================================================================
// MENTOR ASSIGNMENT ENGINE
// ============================================================================
// Matches users with mentors based on skill domain, level, and motivation.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import type { Mentor, UserMentorInsert } from "@/lib/supabase/types"
import {
    getMentors,
    getProfileForAssignment,
    getUserMentorAssignment,
    upsertUserMentor,
    checkHasMentor,
    getProfilesForRetroactive,
    type ProfileForAssignment,
} from "@/lib/supabase/table-helpers"

// ============================================================================
// TYPES
// ============================================================================

export interface MentorAssignmentResult {
    mentorId: string
    mentor: Mentor
    assignmentReason: string
    score: number
}

export interface RetroactiveAssignmentReport {
    processed: number
    assigned: number
    skipped: number
    errors: string[]
}

// ============================================================================
// DOMAIN MAPPING
// ============================================================================

/**
 * Maps inferred_skill_domain values to mentor specializations.
 * This handles slight naming differences between systems.
 */
const DOMAIN_TO_SPECIALIZATION: Record<string, string[]> = {
    "Web Development": ["Web Development", "Full Stack Development"],
    "Full Stack Development": ["Full Stack Development", "Web Development", "Backend Engineering"],
    "Mobile Development": ["Mobile Development"],
    "Backend Engineering": ["Backend Engineering", "Full Stack Development"],
    "Data Science": ["Data Science"],
    "Game Development": ["Game Development"],
    "UI/UX & Design": ["UI/UX & Design"],
    "DevOps & Cloud": ["DevOps & Cloud"],
    "Cybersecurity": ["Cybersecurity"],
    "Computer Science Fundamentals": ["Computer Science Fundamentals"],
    "Business & Startups": ["Business & Startups"],
    "General": ["General", "Web Development"], // Fallback to general or web
}

/**
 * Motivation type weights for mentor matching.
 */
const MOTIVATION_WEIGHTS: Record<string, string[]> = {
    career: ["Business & Startups", "Backend Engineering", "Full Stack Development"],
    project: ["Web Development", "Mobile Development", "Game Development"],
    curiosity: ["Computer Science Fundamentals", "Data Science", "General"],
    other: [],
}

// ============================================================================
// MENTOR SCORING
// ============================================================================

/**
 * Calculate a mentor's match score for a user profile.
 */
function calculateMentorScore(
    mentor: Mentor,
    userDomain: string | null,
    userMotivation: string | null
): { score: number; reasons: string[] } {
    let score = 0
    const reasons: string[] = []

    const targetSpecializations = DOMAIN_TO_SPECIALIZATION[userDomain || "General"] || ["General"]

    // Primary match: Specialization matches user's skill domain
    const hasSpecializationMatch = targetSpecializations.some(spec =>
        mentor.specializations.includes(spec)
    )
    if (hasSpecializationMatch) {
        score += 10
        reasons.push(`Specializes in ${userDomain || "General"}`)
    }

    // Secondary match: Direct domain match
    if (mentor.specializations.includes(userDomain || "")) {
        score += 5
        reasons.push(`Direct domain match`)
    }

    // Motivation alignment bonus
    if (userMotivation && MOTIVATION_WEIGHTS[userMotivation]) {
        const motivationDomains = MOTIVATION_WEIGHTS[userMotivation]
        const hasMotivationMatch = motivationDomains.some(domain =>
            mentor.specializations.includes(domain)
        )
        if (hasMotivationMatch) {
            score += 3
            reasons.push(`Aligns with ${userMotivation} motivation`)
        }
    }

    // Multi-specialization bonus (versatile mentors)
    if (mentor.specializations.length >= 2) {
        score += 1
        reasons.push("Versatile mentor")
    }

    return { score, reasons }
}

// ============================================================================
// MENTOR ASSIGNMENT
// ============================================================================

/**
 * Find and assign the best mentor for a user.
 * Returns the assigned mentor or null if no suitable mentor found.
 */
export async function assignMentorForUser(
    userId: string
): Promise<MentorAssignmentResult | null> {
    const supabase = await createSupabaseServerClient()

    // Fetch user profile using helper
    const profile = await getProfileForAssignment(supabase, userId)

    if (!profile) {
        console.error("[mentor-assignment] Error fetching profile")
        return null
    }

    // Fetch all active mentors using helper
    const mentors = await getMentors(supabase)

    if (!mentors || mentors.length === 0) {
        console.error("[mentor-assignment] No mentors available")
        return null
    }

    // Score each mentor
    const scoredMentors = mentors.map(mentor => {
        const { score, reasons } = calculateMentorScore(
            mentor,
            profile.inferred_skill_domain,
            profile.motivation_type
        )
        return { mentor, score, reasons }
    })

    // Sort by score descending
    scoredMentors.sort((a, b) => b.score - a.score)

    const bestMatch = scoredMentors[0]
    if (!bestMatch || bestMatch.score === 0) {
        // Fallback to any mentor if no good match
        const fallback = mentors.find(m => m.specializations.includes("General")) || mentors[0]
        return {
            mentorId: fallback.id,
            mentor: fallback,
            assignmentReason: "Default mentor assignment",
            score: 0,
        }
    }

    // Create the assignment using helper
    const assignment: UserMentorInsert = {
        user_id: userId,
        mentor_id: bestMatch.mentor.id,
        assignment_reason: bestMatch.reasons.join("; "),
    }

    const success = await upsertUserMentor(supabase, assignment)

    if (!success) {
        console.error("[mentor-assignment] Error assigning mentor")
        return null
    }

    return {
        mentorId: bestMatch.mentor.id,
        mentor: bestMatch.mentor,
        assignmentReason: bestMatch.reasons.join("; "),
        score: bestMatch.score,
    }
}

/**
 * Get the assigned mentor for a user.
 */
export async function getUserMentor(userId: string): Promise<Mentor | null> {
    const supabase = await createSupabaseServerClient()
    const result = await getUserMentorAssignment(supabase, userId)
    return result?.mentor || null
}

/**
 * Check if a user has a mentor assigned.
 */
export async function hasAssignedMentor(userId: string): Promise<boolean> {
    const supabase = await createSupabaseServerClient()
    return checkHasMentor(supabase, userId)
}

// ============================================================================
// RETROACTIVE ASSIGNMENT
// ============================================================================

/**
 * Retroactively assign mentors to all users without assignments.
 */
export async function retroactivelyAssignMentors(): Promise<RetroactiveAssignmentReport> {
    const supabase = await createSupabaseServerClient()

    const report: RetroactiveAssignmentReport = {
        processed: 0,
        assigned: 0,
        skipped: 0,
        errors: [],
    }

    // Get all profiles with completed onboarding
    const profiles = await getProfilesForRetroactive(supabase)

    // Filter to users without mentor assignments
    const usersWithoutMentors: ProfileForAssignment[] = []
    for (const profile of profiles) {
        const hasMentor = await checkHasMentor(supabase, profile.id)
        if (!hasMentor) {
            usersWithoutMentors.push(profile)
        }
    }

    console.log(`[retroactive-mentor] Found ${usersWithoutMentors.length} users without mentors`)

    for (const user of usersWithoutMentors) {
        report.processed++

        try {
            const result = await assignMentorForUser(user.id)
            if (result) {
                report.assigned++
                console.log(`[retroactive-mentor] Assigned ${result.mentor.name} to user ${user.id}`)
            } else {
                report.skipped++
            }
        } catch (err) {
            const error = err instanceof Error ? err.message : String(err)
            report.errors.push(`User ${user.id}: ${error}`)
        }
    }

    console.log(`[retroactive-mentor] Complete: ${report.assigned}/${report.processed} assigned`)
    return report
}

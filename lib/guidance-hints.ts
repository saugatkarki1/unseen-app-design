/**
 * Guidance System - Pattern-based observational hints
 * 
 * Rules:
 * - Pattern-based, observational, quiet
 * - Allowed: "You tend to...", "Previous sessions..."
 * - Forbidden: "Do this", "Recommended", "Start"
 * - NEVER appears: on entry, before intent, before focus
 */

import type { FocusSession, Reflection } from "@/lib/store"

interface GuidanceContext {
    focusHistory: FocusSession[]
    reflections: Reflection[]
    activeIntent: { declaration: string } | null
    activeFocusSession: FocusSession | null
}

/**
 * Get a guidance hint based on user patterns.
 * Returns null if no pattern is detected or if conditions aren't met.
 */
export function getGuidanceHint(context: GuidanceContext): string | null {
    const { focusHistory, reflections, activeIntent, activeFocusSession } = context

    // NEVER show guidance on entry (no intent)
    if (!activeIntent) {
        return null
    }

    // NEVER show guidance before focus (intent declared but no history)
    if (focusHistory.length === 0) {
        return null
    }

    // Don't show during active focus
    if (activeFocusSession) {
        return null
    }

    // Pattern detection (observational only)

    // Count abandonment rate
    const recentSessions = focusHistory.slice(0, 10)
    const abandonedCount = recentSessions.filter(s => s.outcome === "abandoned").length
    const abandonRate = abandonedCount / recentSessions.length

    if (abandonRate >= 0.5 && recentSessions.length >= 3) {
        return "You tend to abandon sessions more often than you complete them."
    }

    // Check for short sessions (abandoned quickly)
    const shortAbandons = recentSessions.filter(s => {
        if (s.outcome !== "abandoned" || !s.endedAt) return false
        const duration = new Date(s.endedAt).getTime() - new Date(s.startedAt).getTime()
        return duration < 10 * 60 * 1000 // Less than 10 minutes
    })

    if (shortAbandons.length >= 2) {
        return "Previous sessions ended within 10 minutes."
    }

    // Check for patterns in reflections
    const recentReflections = reflections.slice(0, 5)
    const scopePatterns = recentReflections.filter(r =>
        r.mistakePattern.toLowerCase().includes("scope") ||
        r.mistakePattern.toLowerCase().includes("too much") ||
        r.mistakePattern.toLowerCase().includes("too big")
    )

    if (scopePatterns.length >= 2) {
        return "Scope has appeared in multiple reflections."
    }

    // Check for distraction patterns
    const distractionPatterns = recentReflections.filter(r =>
        r.mistakePattern.toLowerCase().includes("distract") ||
        r.mistakePattern.toLowerCase().includes("focus") ||
        r.mistakePattern.toLowerCase().includes("lost track")
    )

    if (distractionPatterns.length >= 2) {
        return "Distraction patterns have appeared in your reflections."
    }

    // Positive pattern - completed sessions
    const completedRecently = recentSessions.filter(s => s.outcome === "finished").length
    if (completedRecently >= 3 && abandonRate < 0.3) {
        return "Your recent completion rate shows consistency."
    }

    return null
}

/**
 * Check if guidance should be shown at all.
 * Ensures guidance NEVER appears prematurely.
 */
export function shouldShowGuidance(context: GuidanceContext): boolean {
    // Never on entry
    if (!context.activeIntent) return false

    // Never before any focus history exists
    if (context.focusHistory.length === 0) return false

    // Never during active focus
    if (context.activeFocusSession) return false

    return true
}

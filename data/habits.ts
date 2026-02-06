// data/habits.ts
// ============================================================================
// HABITS DATA MODULE
// ============================================================================
// Types and placeholder data for habit tracking functionality.
// ============================================================================

export type HabitCategory = "study" | "work" | "project" | "ritual"

export interface Habit {
    id: string
    title: string
    description: string
    category: HabitCategory
    auraReward: number
    locked: boolean
    prerequisites: string[]
}

// Default empty exports for components that import this module
export const habits: Habit[] = []
export const habitCategories: HabitCategory[] = ["study", "work", "project", "ritual"]

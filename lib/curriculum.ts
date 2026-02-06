// lib/curriculum.ts
// ============================================================================
// CURRICULUM UTILITIES
// ============================================================================
// Functions for accessing and filtering curriculum content by skill domain.
// ============================================================================

import { phases } from "@/data/curriculum"
import type { Phase, SkillCapsule, Project } from "@/data/curriculum"
import type { SkillDomain } from "@/lib/skill-domain"

// ============================================================================
// DOMAIN TO CURRICULUM MAPPING
// ============================================================================

/**
 * Maps skill domains to the phases they have access to.
 * Currently, most content is Web Development focused,
 * so we map related domains to existing phases.
 */
const DOMAIN_PHASE_MAP: Record<SkillDomain, string[]> = {
    "Web Development": ["phase-1", "phase-2", "phase-3", "phase-4", "phase-5", "phase-6"],
    "Full Stack Development": ["phase-1", "phase-2", "phase-3", "phase-4", "phase-5", "phase-6"],
    "Mobile Development": ["phase-1", "phase-2"], // Limited to React basics that transfer
    "Backend Engineering": ["phase-1", "phase-2"], // Environment setup and basics
    "Data Science": ["phase-1"], // Environment setup only
    "Game Development": ["phase-1"], // Environment setup only
    "UI/UX & Design": ["phase-1", "phase-2"], // Basic web knowledge helps with design
    "DevOps & Cloud": ["phase-1"], // Environment setup only
    "Cybersecurity": ["phase-1"], // Environment setup only
    "Computer Science Fundamentals": ["phase-1", "phase-2"], // Core concepts
    "Business & Startups": ["phase-1"], // Environment setup only
    "General": ["phase-1", "phase-2", "phase-3"], // Beginner-friendly content
}

/**
 * Default tasks/exercises for domains without dedicated content.
 * These are generic learning tasks that benefit all learners.
 */
const FALLBACK_TASKS = [
    {
        id: "explore-fundamentals",
        title: "Explore Programming Fundamentals",
        description: "Start with understanding variables, functions, and control flow.",
        difficulty: "beginner" as const,
    },
    {
        id: "setup-environment",
        title: "Set Up Your Development Environment",
        description: "Install the necessary tools to start coding.",
        difficulty: "beginner" as const,
    },
    {
        id: "first-project",
        title: "Build Your First Project",
        description: "Create a simple project to apply what you've learned.",
        difficulty: "beginner" as const,
    },
]

// ============================================================================
// CURRICULUM ACCESS FUNCTIONS
// ============================================================================

/**
 * Get all phases available for a given skill domain.
 */
export function getPhasesByDomain(domain: SkillDomain): Phase[] {
    const phaseIds = DOMAIN_PHASE_MAP[domain] || DOMAIN_PHASE_MAP["General"]
    return phases.filter((phase) => phaseIds.includes(phase.id))
}

/**
 * Get all capsules (lessons) for a given skill domain.
 */
export function getCapsulesByDomain(domain: SkillDomain): SkillCapsule[] {
    const phases = getPhasesByDomain(domain)
    return phases.flatMap((phase) => phase.capsules)
}

/**
 * Get all projects for a given skill domain.
 */
export function getProjectsByDomain(domain: SkillDomain): Project[] {
    const phases = getPhasesByDomain(domain)
    return phases.flatMap((phase) => phase.projects)
}

/**
 * Get recommended beginner tasks for a skill domain.
 * Returns first N capsules that are beginner-level.
 */
export function getRecommendedTasks(domain: SkillDomain, limit: number = 5): SkillCapsule[] {
    const capsules = getCapsulesByDomain(domain)

    // Filter for beginner capsules and sort by order
    const beginnerCapsules = capsules
        .filter((capsule) => capsule.difficulty === "beginner")
        .sort((a, b) => a.order - b.order)

    return beginnerCapsules.slice(0, limit)
}

/**
 * Get the next recommended capsule for a user.
 * For now, returns the first beginner capsule.
 * In the future, this could track user progress.
 */
export function getNextRecommendedCapsule(domain: SkillDomain): SkillCapsule | null {
    const capsules = getRecommendedTasks(domain, 1)
    return capsules[0] || null
}

/**
 * Check if a domain has dedicated curriculum content.
 */
export function hasDedicatedContent(domain: SkillDomain): boolean {
    return domain === "Web Development" || domain === "Full Stack Development"
}

/**
 * Get domain-specific description for the dashboard.
 */
export function getDomainLearningMessage(domain: SkillDomain): string {
    const messages: Record<SkillDomain, string> = {
        "Web Development": "Build modern websites with React, Tailwind, and more.",
        "Full Stack Development": "Master frontend, backend, and database technologies.",
        "Mobile Development": "The fundamentals here transfer to mobile development frameworks.",
        "Backend Engineering": "Build robust APIs and server-side applications.",
        "Data Science": "Start with environment setup. Data Science content coming soon.",
        "Game Development": "Start with environment setup. Game Dev content coming soon.",
        "UI/UX & Design": "Learn web fundamentals to complement your design skills.",
        "DevOps & Cloud": "Start with environment setup. DevOps content coming soon.",
        "Cybersecurity": "Start with environment setup. Security content coming soon.",
        "Computer Science Fundamentals": "Build a strong foundation in algorithms and data structures.",
        "Business & Startups": "Learn to build products and launch your own startup.",
        "General": "Explore various programming concepts to find your path.",
    }

    return messages[domain]
}

/**
 * Get fallback tasks for domains without content.
 */
export function getFallbackTasks() {
    return FALLBACK_TASKS
}

// ============================================================================
// PROGRESS TRACKING (Placeholder for future implementation)
// ============================================================================

/**
 * Check if a capsule is completed by a user.
 * Placeholder - would need to integrate with user progress storage.
 */
export function isCapsuleCompleted(_capsuleId: string, _userId: string): boolean {
    // Progress tracking requires integration with user progress storage
    return false
}

/**
 * Get user's progress percentage for a domain.
 * Placeholder - would need to integrate with user progress storage.
 */
export function getDomainProgress(_domain: SkillDomain, _userId: string): number {
    // Progress tracking requires integration with user progress storage
    return 0
}

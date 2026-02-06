// lib/skill-level-classifier.ts
// ============================================================================
// ONBOARDING INTELLIGENCE ENGINE
// ============================================================================
// Deterministic classifier for skill level and learning goal extraction.
// Returns STRICT JSON only. No teaching. No roadmaps. No side effects.
// ============================================================================

import { type SkillDirection } from "./intent-classifier"

// ============================================================================
// TYPES
// ============================================================================

/**
 * Fixed list of allowed skill levels.
 */
export type SkillLevel = "Beginner" | "Intermediate" | "Advanced"

/**
 * Input for the onboarding intelligence engine.
 */
export interface OnboardingIntelligenceInput {
    user_input: string
    skill_direction: SkillDirection
}

/**
 * Strict JSON output format for onboarding intelligence.
 */
export interface OnboardingIntelligenceResult {
    raw_input: string
    skill_direction: SkillDirection
    skill_level: SkillLevel
    learning_goal: string
    needs_clarification: boolean
    clarification_question: string | null
}

// ============================================================================
// SKILL LEVEL KEYWORDS
// ============================================================================

/**
 * Keywords indicating Beginner skill level.
 */
const BEGINNER_KEYWORDS = [
    "learn from scratch",
    "from scratch",
    "learn the basics",
    "beginner",
    "newbie",
    "new to",
    "just starting",
    "starting out",
    "first time",
    "never done",
    "no experience",
    "want to learn",
    "complete beginner",
    "absolute beginner",
    "getting started",
    "start learning",
    "interested in learning",
    "i'm new",
    "im new",
    "don't know",
    "dont know",
]

/**
 * Keywords indicating Intermediate skill level.
 */
const INTERMEDIATE_KEYWORDS = [
    "improve",
    "already know",
    "know the basics",
    "some experience",
    "familiar with",
    "work on",
    "get better",
    "level up",
    "enhance",
    "expand",
    "built some",
    "made some",
    "few projects",
    "small projects",
    "understand basics",
    "comfortable with",
]

/**
 * Keywords indicating Advanced skill level.
 */
const ADVANCED_KEYWORDS = [
    "master",
    "advanced",
    "expert",
    "deep understanding",
    "deep dive",
    "professional",
    "years of experience",
    "senior",
    "complex",
    "architecture",
    "optimize",
    "scale",
    "production-level",
    "production level",
    "enterprise",
    "proficient",
]

// ============================================================================
// FILLER PHRASES TO STRIP
// ============================================================================

/**
 * Filler phrases to remove when extracting learning goal.
 * Ordered by specificity (longer phrases first).
 */
const FILLER_PHRASES = [
    "i would really like to",
    "i would like to",
    "i really want to",
    "i want to learn how to",
    "i want to learn to",
    "i want to learn",
    "i want to",
    "i'd like to",
    "i am interested in",
    "i'm interested in",
    "im interested in",
    "my goal is to",
    "my goal is",
    "i am looking to",
    "i'm looking to",
    "im looking to",
    "looking to",
    "hoping to",
    "i hope to",
    "planning to",
    "i plan to",
]

// ============================================================================
// CLASSIFIER LOGIC
// ============================================================================

/**
 * Infer skill level from user input.
 */
function inferSkillLevel(input: string): SkillLevel {
    const normalized = input.toLowerCase()

    // Check Advanced first (most specific)
    for (const keyword of ADVANCED_KEYWORDS) {
        if (normalized.includes(keyword)) {
            return "Advanced"
        }
    }

    // Check Intermediate
    for (const keyword of INTERMEDIATE_KEYWORDS) {
        if (normalized.includes(keyword)) {
            return "Intermediate"
        }
    }

    // Check Beginner keywords explicitly
    for (const keyword of BEGINNER_KEYWORDS) {
        if (normalized.includes(keyword)) {
            return "Beginner"
        }
    }

    // Default to Beginner for ambiguous cases
    return "Beginner"
}

/**
 * Extract concise learning goal from user input.
 * Returns goal capped at 12 words.
 */
function extractLearningGoal(input: string): string {
    if (!input || input.trim().length === 0) {
        return ""
    }

    let goal = input.trim()

    // Remove filler phrases (case-insensitive)
    const lowerGoal = goal.toLowerCase()
    for (const filler of FILLER_PHRASES) {
        if (lowerGoal.startsWith(filler)) {
            goal = goal.slice(filler.length).trim()
            break // Only remove the first matching filler
        }
    }

    // Remove leading "to " if present after filler removal
    if (goal.toLowerCase().startsWith("to ")) {
        goal = goal.slice(3)
    }

    // Capitalize first letter
    if (goal.length > 0) {
        goal = goal.charAt(0).toUpperCase() + goal.slice(1)
    }

    // Cap at 12 words
    const words = goal.split(/\s+/).filter(Boolean)
    if (words.length > 12) {
        goal = words.slice(0, 12).join(" ")
    }

    return goal
}

/**
 * Check if input is too vague to extract meaningful information.
 */
function isVagueInput(input: string): boolean {
    if (!input || input.trim().length === 0) {
        return true
    }

    const normalized = input.toLowerCase().trim()

    // Very short input (less than 2 meaningful words)
    const words = normalized.split(/\s+/).filter((w) => w.length > 2)
    if (words.length < 2) {
        return true
    }

    // Exploratory/uncertain phrases
    const vaguePatterns = [
        "not sure",
        "not certain",
        "just exploring",
        "don't know",
        "dont know",
        "no idea",
        "unsure",
        "haven't decided",
        "havent decided",
        "figuring out",
        "trying to decide",
        "no clue",
        "anything",
        "whatever",
        "something",
    ]

    for (const pattern of vaguePatterns) {
        if (normalized.includes(pattern)) {
            return true
        }
    }

    return false
}

/**
 * Generate contextual clarification question based on skill direction.
 */
function getClarificationQuestion(skillDirection: SkillDirection): string {
    const questions: Record<SkillDirection, string> = {
        "Web Development": "What type of web projects do you want to build first?",
        "Mobile App Development": "What kind of mobile app do you want to create?",
        "Backend Engineering": "What type of backend systems interest you most?",
        "Data Science & AI": "What data science or AI problems do you want to solve?",
        Cybersecurity: "Which area of security do you want to focus on?",
        "UI/UX Design": "What type of designs do you want to create?",
        "Game Development": "What kind of games do you want to build?",
        "DevOps & Cloud": "Which cloud platform or DevOps practice interests you?",
        "Computer Science Fundamentals": "Which CS topic do you want to master first?",
        "Business & Startups": "What type of business or startup idea are you pursuing?",
        Other: "Which type of projects do you want to build first?",
    }

    return questions[skillDirection] || "Which type of projects do you want to build first?"
}

// ============================================================================
// MAIN FUNCTION
// ============================================================================

/**
 * Analyze onboarding input to extract skill level and learning goal.
 * Returns STRICT JSON ONLY.
 *
 * @param input - OnboardingIntelligenceInput with user_input and skill_direction
 * @returns OnboardingIntelligenceResult
 */
export function analyzeOnboardingInput(input: OnboardingIntelligenceInput): OnboardingIntelligenceResult {
    const { user_input, skill_direction } = input

    // Handle empty input
    if (!user_input || user_input.trim().length === 0) {
        return {
            raw_input: user_input || "",
            skill_direction,
            skill_level: "Beginner",
            learning_goal: "",
            needs_clarification: true,
            clarification_question: getClarificationQuestion(skill_direction),
        }
    }

    const trimmedInput = user_input.trim()

    // Check for vague/exploratory input
    if (isVagueInput(trimmedInput)) {
        return {
            raw_input: trimmedInput,
            skill_direction,
            skill_level: "Beginner",
            learning_goal: "",
            needs_clarification: true,
            clarification_question: getClarificationQuestion(skill_direction),
        }
    }

    // Infer skill level
    const skillLevel = inferSkillLevel(trimmedInput)

    // Extract learning goal
    const learningGoal = extractLearningGoal(trimmedInput)

    return {
        raw_input: trimmedInput,
        skill_direction,
        skill_level: skillLevel,
        learning_goal: learningGoal,
        needs_clarification: false,
        clarification_question: null,
    }
}

// ============================================================================
// UTILITY EXPORTS
// ============================================================================

/**
 * Get all allowed skill levels.
 */
export function getAllSkillLevels(): SkillLevel[] {
    return ["Beginner", "Intermediate", "Advanced"]
}

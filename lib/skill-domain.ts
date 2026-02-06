// lib/skill-domain.ts
// ============================================================================
// SKILL DOMAIN INFERENCE ENGINE
// ============================================================================
// Analyzes user's learning direction to infer their primary skill domain.
// Uses keyword matching with weighted scoring for accurate classification.
// Includes confidence tracking and logging for unmatched responses.
// ============================================================================

/**
 * Supported skill domains for personalization (12 total).
 * 'General' is the fallback for unclear or unfocused learning goals.
 */
export type SkillDomain =
    | "Web Development"
    | "Full Stack Development"
    | "Mobile Development"
    | "Backend Engineering"
    | "Data Science"
    | "Game Development"
    | "UI/UX & Design"
    | "DevOps & Cloud"
    | "Cybersecurity"
    | "Computer Science Fundamentals"
    | "Business & Startups"
    | "General"

/**
 * Confidence level for domain inference.
 */
export type DomainConfidence = "high" | "medium" | "low"

/**
 * Result of skill domain inference with confidence.
 */
export interface InferenceResult {
    domain: SkillDomain
    confidence: DomainConfidence
    score: number
    alternativeDomains: { domain: SkillDomain; score: number }[]
}

/**
 * Keywords mapped to each skill domain with optional weight.
 * Higher weight = stronger signal for that domain.
 */
const DOMAIN_KEYWORDS: Record<Exclude<SkillDomain, "General">, { keywords: string[]; weight?: number }[]> = {
    "Web Development": [
        { keywords: ["html", "css", "javascript", "js", "react", "vue", "angular", "svelte"], weight: 2 },
        { keywords: ["frontend", "front-end", "front end", "web dev", "web development"], weight: 3 },
        { keywords: ["tailwind", "bootstrap", "sass", "scss", "webpack", "vite"], weight: 1.5 },
        { keywords: ["dom", "responsive", "website", "web page"], weight: 1 },
    ],
    "Full Stack Development": [
        { keywords: ["full stack", "fullstack", "full-stack"], weight: 5 },
        { keywords: ["mern", "mean", "lamp", "next.js", "nextjs", "nuxt"], weight: 3 },
        { keywords: ["backend", "back-end", "back end", "frontend", "front-end"], weight: 1.5 },
        { keywords: ["node", "nodejs", "express", "api", "rest", "graphql"], weight: 2 },
        { keywords: ["database", "mongodb", "postgres", "mysql", "sql", "prisma", "supabase"], weight: 2 },
    ],
    "Mobile Development": [
        { keywords: ["mobile", "ios", "android", "app development"], weight: 3 },
        { keywords: ["flutter", "react native", "reactnative", "swift", "kotlin", "dart"], weight: 4 },
        { keywords: ["xcode", "android studio", "mobile app", "native app"], weight: 2 },
    ],
    "Backend Engineering": [
        { keywords: ["backend", "back-end", "back end", "server-side", "server side"], weight: 4 },
        { keywords: ["api", "rest", "graphql", "microservices", "authentication", "auth"], weight: 3 },
        { keywords: ["express", "fastapi", "django", "spring", "rails", "laravel", "nest"], weight: 3 },
        { keywords: ["database", "mongodb", "postgres", "mysql", "redis"], weight: 2 },
    ],
    "Data Science": [
        { keywords: ["data science", "machine learning", "ml", "ai", "artificial intelligence"], weight: 4 },
        { keywords: ["python", "pandas", "numpy", "tensorflow", "pytorch", "keras"], weight: 2 },
        { keywords: ["data analysis", "data analyst", "statistics", "visualization"], weight: 3 },
        { keywords: ["deep learning", "neural network", "nlp", "computer vision"], weight: 3 },
        { keywords: ["jupyter", "notebook", "scikit", "sklearn", "matplotlib"], weight: 2 },
    ],
    "Game Development": [
        { keywords: ["game dev", "game development", "gamedev"], weight: 5 },
        { keywords: ["unity", "unreal", "godot", "game engine"], weight: 4 },
        { keywords: ["c#", "csharp", "c++", "cpp", "blueprint"], weight: 1 },
        { keywords: ["3d", "2d game", "game design", "game programming", "vr", "ar", "vr/ar"], weight: 2 },
    ],
    "UI/UX & Design": [
        { keywords: ["ui/ux", "ui ux", "uiux", "ux design", "ui design", "user experience", "user interface"], weight: 5 },
        { keywords: ["figma", "sketch", "adobe xd", "xd", "photoshop", "illustrator", "canva"], weight: 4 },
        { keywords: ["prototyping", "wireframe", "mockup", "design thinking", "user research"], weight: 3 },
        { keywords: ["graphic design", "visual design", "interaction design", "product design"], weight: 3 },
        { keywords: ["design system", "typography", "color theory", "branding"], weight: 2 },
    ],
    "DevOps & Cloud": [
        { keywords: ["devops", "dev ops", "cicd", "ci/cd", "infrastructure"], weight: 4 },
        { keywords: ["aws", "azure", "gcp", "google cloud", "cloud computing"], weight: 3 },
        { keywords: ["docker", "kubernetes", "k8s", "containerization"], weight: 3 },
        { keywords: ["terraform", "ansible", "jenkins", "github actions"], weight: 3 },
        { keywords: ["linux", "bash", "shell", "scripting", "automation"], weight: 1.5 },
    ],
    "Cybersecurity": [
        { keywords: ["cybersecurity", "cyber security", "security", "infosec"], weight: 4 },
        { keywords: ["ethical hacking", "penetration testing", "pentest", "hacking"], weight: 4 },
        { keywords: ["network security", "cryptography", "encryption"], weight: 3 },
        { keywords: ["vulnerable", "exploit", "ctf", "kali", "burp"], weight: 2 },
    ],
    "Computer Science Fundamentals": [
        { keywords: ["computer science", "cs fundamentals", "algorithms", "data structures"], weight: 4 },
        { keywords: ["dsa", "leetcode", "competitive programming", "problem solving"], weight: 3 },
        { keywords: ["big o", "complexity", "recursion", "sorting", "graphs", "trees"], weight: 2 },
        { keywords: ["operating systems", "networking", "compilers", "theory"], weight: 2 },
    ],
    "Business & Startups": [
        { keywords: ["startup", "startups", "saas", "entrepreneur", "entrepreneurship"], weight: 4 },
        { keywords: ["funding", "venture capital", "vc", "pitch", "mvp"], weight: 3 },
        { keywords: ["product management", "product manager", "business model", "growth"], weight: 2 },
        { keywords: ["marketing", "sales", "revenue", "monetization"], weight: 1.5 },
    ],
}

/**
 * Phrases that indicate uncertainty or no clear direction.
 */
const UNCERTAINTY_PHRASES = [
    "i don't know",
    "not sure",
    "no idea",
    "anything",
    "everything",
    "explore",
    "just learning",
    "beginner",
    "new to coding",
    "new to programming",
    "just starting",
]

/**
 * In-memory log for unmatched responses (for debugging/analytics).
 */
const unmatchedResponses: { input: string; timestamp: Date }[] = []

/**
 * Infer the user's skill domain with confidence level.
 * Uses weighted keyword matching to find the best match.
 *
 * @param learningDirection - The user's freeform text about what they want to learn
 * @returns InferenceResult with domain, confidence, and alternatives
 */
export function inferSkillDomainWithConfidence(learningDirection: string | null | undefined): InferenceResult {
    // Handle empty or null input
    if (!learningDirection || learningDirection.trim().length === 0) {
        return {
            domain: "General",
            confidence: "low",
            score: 0,
            alternativeDomains: [],
        }
    }

    const input = learningDirection.toLowerCase().trim()

    // Check for uncertainty phrases first
    let uncertaintyScore = 0
    for (const phrase of UNCERTAINTY_PHRASES) {
        if (input.includes(phrase)) {
            uncertaintyScore += 1
        }
    }

    // If high uncertainty, return General with low confidence
    if (uncertaintyScore >= 2 || (uncertaintyScore >= 1 && input.length < 30)) {
        logUnmatchedResponse(input)
        return {
            domain: "General",
            confidence: "low",
            score: 0,
            alternativeDomains: [],
        }
    }

    // Calculate scores for each domain
    const domainScores: { domain: SkillDomain; score: number }[] = []

    for (const [domain, keywordGroups] of Object.entries(DOMAIN_KEYWORDS)) {
        let score = 0

        for (const group of keywordGroups) {
            const weight = group.weight || 1

            for (const keyword of group.keywords) {
                // Use word boundary matching for more accuracy
                const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
                if (regex.test(input)) {
                    score += weight
                }
            }
        }

        if (score > 0) {
            domainScores.push({ domain: domain as SkillDomain, score })
        }
    }

    // Sort by score descending
    domainScores.sort((a, b) => b.score - a.score)

    // Determine result
    const minScoreThreshold = 2
    const highConfidenceThreshold = 6
    const mediumConfidenceThreshold = 3

    if (domainScores.length === 0 || domainScores[0].score < minScoreThreshold) {
        logUnmatchedResponse(input)
        return {
            domain: "General",
            confidence: "low",
            score: 0,
            alternativeDomains: [],
        }
    }

    const bestMatch = domainScores[0]
    let confidence: DomainConfidence = "low"

    if (bestMatch.score >= highConfidenceThreshold) {
        confidence = "high"
    } else if (bestMatch.score >= mediumConfidenceThreshold) {
        confidence = "medium"
    }

    // Handle tie-breaking: Full Stack vs Web Development
    let finalDomain = bestMatch.domain
    if (
        finalDomain === "Web Development" &&
        domainScores.some((d) => d.domain === "Full Stack Development" && d.score >= minScoreThreshold)
    ) {
        const backendKeywords = ["backend", "back-end", "database", "api", "server", "node", "express"]
        const hasBackendSignal = backendKeywords.some((kw) => input.includes(kw))
        if (hasBackendSignal) {
            finalDomain = "Full Stack Development"
        }
    }

    // Handle tie-breaking: UI/UX vs Web Development
    if (
        finalDomain === "Web Development" &&
        domainScores.some((d) => d.domain === "UI/UX & Design" && d.score >= bestMatch.score)
    ) {
        const designKeywords = ["figma", "design", "prototype", "photoshop", "ux", "ui/ux"]
        const hasDesignSignal = designKeywords.some((kw) => input.includes(kw))
        if (hasDesignSignal) {
            finalDomain = "UI/UX & Design"
        }
    }

    return {
        domain: finalDomain,
        confidence,
        score: bestMatch.score,
        alternativeDomains: domainScores.slice(1, 4),
    }
}

/**
 * Simple inference function (backwards compatible).
 * @param learningDirection - The user's freeform text
 * @returns The inferred SkillDomain only
 */
export function inferSkillDomain(learningDirection: string | null | undefined): SkillDomain {
    return inferSkillDomainWithConfidence(learningDirection).domain
}

/**
 * Log unmatched responses for analysis.
 */
function logUnmatchedResponse(input: string): void {
    unmatchedResponses.push({ input, timestamp: new Date() })
    console.log(`[skill-domain] Unmatched response logged: "${input.substring(0, 50)}..."`)
}

/**
 * Get logged unmatched responses (for admin/analytics).
 */
export function getUnmatchedResponses(): { input: string; timestamp: Date }[] {
    return [...unmatchedResponses]
}

/**
 * Get a friendly description of the skill domain for display purposes.
 */
export function getSkillDomainDescription(domain: SkillDomain): string {
    const descriptions: Record<SkillDomain, string> = {
        "Web Development": "Building modern websites and web applications with HTML, CSS, and JavaScript.",
        "Full Stack Development": "End-to-end development covering both frontend and backend technologies.",
        "Mobile Development": "Creating native and cross-platform mobile applications.",
        "Backend Engineering": "Building server-side APIs, databases, and system architecture.",
        "Data Science": "Analyzing data, building ML models, and deriving insights.",
        "Game Development": "Designing and programming interactive games and experiences.",
        "UI/UX & Design": "Crafting beautiful user interfaces and seamless user experiences.",
        "DevOps & Cloud": "Infrastructure, automation, and cloud platform management.",
        "Cybersecurity": "Protecting systems and networks from security threats.",
        "Computer Science Fundamentals": "Core CS concepts: algorithms, data structures, and problem solving.",
        "Business & Startups": "Building products, entrepreneurship, and startup fundamentals.",
        "General": "Exploring various programming concepts and finding your path.",
    }

    return descriptions[domain]
}

/**
 * Get the list of all available skill domains.
 */
export function getAllSkillDomains(): SkillDomain[] {
    return [
        "Web Development",
        "Full Stack Development",
        "Mobile Development",
        "Backend Engineering",
        "Data Science",
        "Game Development",
        "UI/UX & Design",
        "DevOps & Cloud",
        "Cybersecurity",
        "Computer Science Fundamentals",
        "Business & Startups",
        "General",
    ]
}

// ============================================================================
// ADAPTER: INTENT CLASSIFIER -> SKILL DOMAIN
// ============================================================================

import type { SkillDirection, IntentClassificationResult } from "@/lib/intent-classifier"

/**
 * Map SkillDirection (from intent-classifier) to SkillDomain (legacy system).
 * Provides backward compatibility for existing flows.
 */
const DIRECTION_TO_DOMAIN: Record<SkillDirection, SkillDomain> = {
    "Web Development": "Web Development",
    "Mobile App Development": "Mobile Development",
    "Backend Engineering": "Backend Engineering",
    "Data Science & AI": "Data Science",
    "Cybersecurity": "Cybersecurity",
    "UI/UX Design": "UI/UX & Design",
    "Game Development": "Game Development",
    "DevOps & Cloud": "DevOps & Cloud",
    "Computer Science Fundamentals": "Computer Science Fundamentals",
    "Business & Startups": "Business & Startups",
    "Other": "General",
}

/**
 * Convert IntentClassificationResult to SkillDomain for legacy flows.
 * Returns 'General' if no domain detected or needs clarification.
 */
export function adaptIntentToSkillDomain(result: IntentClassificationResult): SkillDomain {
    if (!result.detected_domain || result.needs_clarification) {
        return "General"
    }
    return DIRECTION_TO_DOMAIN[result.detected_domain]
}

/**
 * Convert SkillDirection to SkillDomain directly.
 */
export function skillDirectionToSkillDomain(direction: SkillDirection): SkillDomain {
    return DIRECTION_TO_DOMAIN[direction]
}

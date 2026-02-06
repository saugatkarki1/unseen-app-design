// lib/intent-classifier.ts
// ============================================================================
// ONBOARDING INTENT CLASSIFIER
// ============================================================================
// Deterministic classifier for user learning intent.
// Returns STRICT JSON only. No teaching. No roadmaps. No side effects.
// ============================================================================

/**
 * Fixed list of allowed skill directions.
 * DO NOT invent new domains.
 */
export type SkillDirection =
    | "Web Development"
    | "Mobile App Development"
    | "Backend Engineering"
    | "Data Science & AI"
    | "Cybersecurity"
    | "UI/UX Design"
    | "Game Development"
    | "DevOps & Cloud"
    | "Computer Science Fundamentals"
    | "Business & Startups"
    | "Other"

/**
 * Confidence level for classification.
 */
export type ClassificationConfidence = "high" | "medium" | "low"

/**
 * Strict JSON output format for intent classification.
 */
export interface IntentClassificationResult {
    raw_input: string
    detected_domain: SkillDirection | null
    confidence: ClassificationConfidence
    needs_clarification: boolean
    clarification_question: string | null
}

// ============================================================================
// KEYWORD MAPPINGS
// ============================================================================

/**
 * Keywords mapped to each skill direction with weights.
 */
const DIRECTION_KEYWORDS: Record<Exclude<SkillDirection, "Other">, { keywords: string[]; weight: number }[]> = {
    "Web Development": [
        { keywords: ["html", "css", "javascript", "js", "react", "vue", "angular", "svelte", "browser"], weight: 2 },
        { keywords: ["frontend", "front-end", "front end", "web dev", "web development", "web developer"], weight: 3 },
        { keywords: ["tailwind", "bootstrap", "sass", "scss", "webpack", "vite"], weight: 1.5 },
        { keywords: ["dom", "responsive", "website", "web page", "web design"], weight: 1 },
    ],
    "Mobile App Development": [
        { keywords: ["mobile", "ios", "android", "app development", "mobile app"], weight: 3 },
        { keywords: ["flutter", "react native", "reactnative", "swift", "kotlin", "dart"], weight: 4 },
        { keywords: ["xcode", "android studio", "native app", "cross-platform"], weight: 2 },
    ],
    "Backend Engineering": [
        { keywords: ["backend", "back-end", "back end", "server-side", "server side"], weight: 4 },
        { keywords: ["api", "rest", "graphql", "microservices", "authentication", "auth"], weight: 3 },
        { keywords: ["express", "fastapi", "django", "spring", "rails", "laravel", "nest"], weight: 3 },
        { keywords: ["database", "mongodb", "postgres", "mysql", "sql", "redis", "prisma"], weight: 2 },
    ],
    "Data Science & AI": [
        { keywords: ["data science", "machine learning", "ml", "ai", "artificial intelligence"], weight: 4 },
        { keywords: ["pandas", "numpy", "tensorflow", "pytorch", "keras", "scikit"], weight: 3 },
        { keywords: ["data analysis", "data analyst", "statistics", "visualization"], weight: 3 },
        { keywords: ["deep learning", "neural network", "nlp", "computer vision", "llm"], weight: 3 },
        { keywords: ["jupyter", "notebook", "matplotlib", "data engineering"], weight: 2 },
    ],
    "Cybersecurity": [
        { keywords: ["cybersecurity", "cyber security", "security", "infosec"], weight: 4 },
        { keywords: ["ethical hacking", "penetration testing", "pentest", "hacking"], weight: 4 },
        { keywords: ["network security", "cryptography", "encryption"], weight: 3 },
        { keywords: ["vulnerability", "exploit", "ctf", "kali", "burp", "oscp"], weight: 2 },
    ],
    "UI/UX Design": [
        { keywords: ["ui/ux", "ui ux", "uiux", "ux design", "ui design", "user experience", "user interface"], weight: 5 },
        { keywords: ["figma", "sketch", "adobe xd", "xd", "photoshop", "illustrator"], weight: 4 },
        { keywords: ["prototyping", "wireframe", "mockup", "design thinking", "user research"], weight: 3 },
        { keywords: ["graphic design", "visual design", "interaction design", "product design"], weight: 3 },
        { keywords: ["design system", "typography", "color theory", "branding"], weight: 2 },
    ],
    "Game Development": [
        { keywords: ["game dev", "game development", "gamedev", "game programming"], weight: 5 },
        { keywords: ["unity", "unreal", "godot", "game engine"], weight: 4 },
        { keywords: ["3d", "2d game", "game design", "vr", "ar", "vr/ar"], weight: 2 },
    ],
    "DevOps & Cloud": [
        { keywords: ["devops", "dev ops", "cicd", "ci/cd", "infrastructure"], weight: 4 },
        { keywords: ["aws", "azure", "gcp", "google cloud", "cloud computing", "cloud"], weight: 3 },
        { keywords: ["docker", "kubernetes", "k8s", "containerization"], weight: 3 },
        { keywords: ["terraform", "ansible", "jenkins", "github actions"], weight: 3 },
        { keywords: ["linux", "bash", "shell", "automation", "sre"], weight: 1.5 },
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

// ============================================================================
// AMBIGUOUS SINGLE KEYWORDS
// ============================================================================

/**
 * Keywords that MUST trigger clarification when used alone.
 * NO GUESSING. NO HEURISTICS.
 */
const AMBIGUOUS_KEYWORDS: Record<string, { question: string; contexts: string[] }> = {
    java: {
        question: "Do you want to use Java for backend development or Android apps?",
        contexts: ["backend", "android", "mobile", "server", "spring"],
    },
    python: {
        question: "Do you want to use Python for backend, data science, or automation?",
        contexts: ["backend", "data", "ai", "ml", "automation", "scripting", "web"],
    },
    node: {
        question: "Do you want to use Node.js for backend APIs or full-stack development?",
        contexts: ["backend", "api", "fullstack", "full-stack", "server"],
    },
    nodejs: {
        question: "Do you want to use Node.js for backend APIs or full-stack development?",
        contexts: ["backend", "api", "fullstack", "full-stack", "server"],
    },
    "c++": {
        question: "Do you want to learn C++ for game development, systems programming, or competitive programming?",
        contexts: ["game", "systems", "competitive", "embedded", "performance"],
    },
    cpp: {
        question: "Do you want to learn C++ for game development, systems programming, or competitive programming?",
        contexts: ["game", "systems", "competitive", "embedded", "performance"],
    },
    "c#": {
        question: "Do you want to use C# for game development with Unity or backend/.NET development?",
        contexts: ["game", "unity", "backend", ".net", "dotnet"],
    },
    csharp: {
        question: "Do you want to use C# for game development with Unity or backend/.NET development?",
        contexts: ["game", "unity", "backend", ".net", "dotnet"],
    },
    rust: {
        question: "Do you want to learn Rust for systems programming, backend, or blockchain development?",
        contexts: ["systems", "backend", "blockchain", "web3", "performance"],
    },
    go: {
        question: "Do you want to use Go for backend APIs or DevOps/cloud tooling?",
        contexts: ["backend", "api", "devops", "cloud", "microservices"],
    },
    golang: {
        question: "Do you want to use Go for backend APIs or DevOps/cloud tooling?",
        contexts: ["backend", "api", "devops", "cloud", "microservices"],
    },
    sql: {
        question: "Do you want to learn SQL for backend development or data analysis?",
        contexts: ["backend", "data", "analytics", "database"],
    },
    typescript: {
        question: "Do you want to use TypeScript for frontend, backend, or full-stack development?",
        contexts: ["frontend", "backend", "fullstack", "full-stack", "web"],
    },
    ts: {
        question: "Do you want to use TypeScript for frontend, backend, or full-stack development?",
        contexts: ["frontend", "backend", "fullstack", "full-stack", "web"],
    },
}

/**
 * Phrases that indicate exploratory/uncertain intent.
 * Must return null domain with clarification.
 */
const EXPLORATORY_PHRASES = [
    "not sure",
    "not certain",
    "just exploring",
    "exploring",
    "don't know",
    "no idea",
    "unsure",
    "haven't decided",
    "figuring out",
    "trying to decide",
]

/**
 * Check if input indicates exploratory/uncertain intent.
 */
function checkExploratoryIntent(input: string): IntentClassificationResult | null {
    const normalized = input.toLowerCase().trim()

    // Check for exploratory phrases
    const hasExploratory = EXPLORATORY_PHRASES.some((phrase) => normalized.includes(phrase))

    if (hasExploratory) {
        return {
            raw_input: input,
            detected_domain: null,
            confidence: "low",
            needs_clarification: true,
            clarification_question: "What area of technology interests you most?",
        }
    }

    return null
}

// ============================================================================
// CLASSIFIER LOGIC
// ============================================================================

/**
 * Check if input is a single ambiguous keyword that needs clarification.
 */
function checkAmbiguousSingleKeyword(input: string): IntentClassificationResult | null {
    const normalized = input.toLowerCase().trim()
    const words = normalized.split(/\s+/)

    // Only trigger for single word or "I want to learn X" patterns
    const singleWord = words.length === 1 ? words[0] : null
    const learnPattern = normalized.match(/^(?:i want to learn|learn|i want|want to learn)\s+(\w+)$/i)
    const targetWord = singleWord || (learnPattern ? learnPattern[1].toLowerCase() : null)

    if (!targetWord) {
        return null
    }

    const ambiguous = AMBIGUOUS_KEYWORDS[targetWord]
    if (ambiguous) {
        // Check if any context words are present that disambiguate
        const hasContext = ambiguous.contexts.some((ctx) => normalized.includes(ctx))

        if (!hasContext) {
            return {
                raw_input: input,
                detected_domain: null,
                confidence: "low",
                needs_clarification: true,
                clarification_question: ambiguous.question,
            }
        }
    }

    return null
}

/**
 * Calculate score for a single domain based on keyword matches.
 */
function calculateDomainScore(input: string, keywordGroups: { keywords: string[]; weight: number }[]): number {
    let score = 0
    const normalizedInput = input.toLowerCase()

    for (const group of keywordGroups) {
        for (const keyword of group.keywords) {
            // Word boundary matching
            const regex = new RegExp(`\\b${keyword.replace(/[.*+?^${}()|[\]\\]/g, "\\$&")}\\b`, "i")
            if (regex.test(normalizedInput)) {
                score += group.weight
            }
        }
    }

    return score
}

/**
 * Classify user intent from free-text input.
 * Returns STRICT JSON ONLY.
 *
 * @param userInput - Raw user input text
 * @returns IntentClassificationResult
 */
export function classifyIntent(userInput: string): IntentClassificationResult {
    // Handle empty input
    if (!userInput || userInput.trim().length === 0) {
        return {
            raw_input: userInput || "",
            detected_domain: null,
            confidence: "low",
            needs_clarification: true,
            clarification_question: "What would you like to learn?",
        }
    }

    const input = userInput.trim()

    // Check for exploratory intent FIRST
    const exploratoryResult = checkExploratoryIntent(input)
    if (exploratoryResult) {
        return exploratoryResult
    }

    // Check for ambiguous single keywords
    const ambiguousResult = checkAmbiguousSingleKeyword(input)
    if (ambiguousResult) {
        return ambiguousResult
    }

    // Calculate scores for all domains
    const scores: { domain: SkillDirection; score: number }[] = []

    for (const [domain, keywordGroups] of Object.entries(DIRECTION_KEYWORDS)) {
        const score = calculateDomainScore(input, keywordGroups)
        if (score > 0) {
            scores.push({ domain: domain as SkillDirection, score })
        }
    }

    // Sort by score descending
    scores.sort((a, b) => b.score - a.score)

    // Thresholds
    const MIN_SCORE = 2
    const HIGH_CONFIDENCE_THRESHOLD = 6
    const MEDIUM_CONFIDENCE_THRESHOLD = 3

    // No matches above threshold → "Other" domain (per spec: needs_clarification = false)
    if (scores.length === 0 || scores[0].score < MIN_SCORE) {
        return {
            raw_input: input,
            detected_domain: "Other",
            confidence: "low",
            needs_clarification: false,
            clarification_question: null,
        }
    }

    const bestMatch = scores[0]
    let confidence: ClassificationConfidence = "low"

    if (bestMatch.score >= HIGH_CONFIDENCE_THRESHOLD) {
        confidence = "high"
    } else if (bestMatch.score >= MEDIUM_CONFIDENCE_THRESHOLD) {
        confidence = "medium"
    }

    // Check for competing domains (close scores = ambiguity)
    if (scores.length >= 2 && scores[1].score >= MIN_SCORE) {
        const scoreDiff = bestMatch.score - scores[1].score
        if (scoreDiff < 2) {
            // Very close scores - ask for clarification
            return {
                raw_input: input,
                detected_domain: null,
                confidence: "low",
                needs_clarification: true,
                clarification_question: `Are you more interested in ${bestMatch.domain} or ${scores[1].domain}?`,
            }
        }
    }

    return {
        raw_input: input,
        detected_domain: bestMatch.domain,
        confidence,
        needs_clarification: false,
        clarification_question: null,
    }
}

// ============================================================================
// LIST OF ALL SKILL DIRECTIONS
// ============================================================================

/**
 * Get all allowed skill directions.
 */
export function getAllSkillDirections(): SkillDirection[] {
    return [
        "Web Development",
        "Mobile App Development",
        "Backend Engineering",
        "Data Science & AI",
        "Cybersecurity",
        "UI/UX Design",
        "Game Development",
        "DevOps & Cloud",
        "Computer Science Fundamentals",
        "Business & Startups",
        "Other",
    ]
}

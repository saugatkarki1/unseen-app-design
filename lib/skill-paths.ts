// lib/skill-paths.ts
// ============================================================================
// DEFAULT LEARNING PATHS BY SKILL DOMAIN
// ============================================================================
// Defines the recommended learning sequence for each skill domain.
// Used for personalized dashboard and progress tracking.
// ============================================================================

import type { SkillDomain } from "./skill-domain"

/**
 * Individual step in a learning path.
 */
export interface PathStep {
    id: string
    title: string
    description: string
    estimatedHours: number
    order: number
}

/**
 * Complete learning path for a skill domain.
 */
export interface SkillPath {
    domain: SkillDomain
    title: string
    description: string
    totalEstimatedHours: number
    steps: PathStep[]
}

/**
 * Default learning paths for all skill domains.
 */
export const SKILL_PATHS: Record<Exclude<SkillDomain, "General">, SkillPath> = {
    "Web Development": {
        domain: "Web Development",
        title: "Web Development Fundamentals",
        description: "Master the building blocks of modern websites",
        totalEstimatedHours: 80,
        steps: [
            { id: "html", title: "HTML Fundamentals", description: "Structure web pages with semantic HTML", estimatedHours: 10, order: 1 },
            { id: "css", title: "CSS & Styling", description: "Style your pages with CSS and modern techniques", estimatedHours: 15, order: 2 },
            { id: "js", title: "JavaScript Essentials", description: "Add interactivity with JavaScript", estimatedHours: 20, order: 3 },
            { id: "react", title: "React Basics", description: "Build dynamic UIs with React", estimatedHours: 15, order: 4 },
            { id: "tailwind", title: "Tailwind CSS", description: "Rapid UI development with utility-first CSS", estimatedHours: 8, order: 5 },
            { id: "project", title: "Web Development Project", description: "Build a complete responsive website", estimatedHours: 12, order: 6 },
        ],
    },
    "Full Stack Development": {
        domain: "Full Stack Development",
        title: "Full Stack Mastery",
        description: "End-to-end web application development",
        totalEstimatedHours: 120,
        steps: [
            { id: "frontend", title: "Frontend Foundations", description: "HTML, CSS, JavaScript, and React", estimatedHours: 25, order: 1 },
            { id: "backend", title: "Backend Development", description: "Node.js, Express, and API design", estimatedHours: 25, order: 2 },
            { id: "database", title: "Database Design", description: "SQL, PostgreSQL, and data modeling", estimatedHours: 20, order: 3 },
            { id: "auth", title: "Authentication & Security", description: "User auth, JWT, and security best practices", estimatedHours: 15, order: 4 },
            { id: "deploy", title: "Deployment", description: "Deploy to Vercel, AWS, or similar", estimatedHours: 10, order: 5 },
            { id: "capstone", title: "Full Stack Capstone", description: "Build a production-ready full stack app", estimatedHours: 25, order: 6 },
        ],
    },
    "Mobile Development": {
        domain: "Mobile Development",
        title: "Mobile App Development",
        description: "Create native and cross-platform mobile apps",
        totalEstimatedHours: 90,
        steps: [
            { id: "dart", title: "Dart/Flutter Basics", description: "Learn Dart programming and Flutter widgets", estimatedHours: 20, order: 1 },
            { id: "ui", title: "Mobile UI Design", description: "Build beautiful mobile interfaces", estimatedHours: 15, order: 2 },
            { id: "state", title: "State Management", description: "Manage app state with Provider/Riverpod", estimatedHours: 15, order: 3 },
            { id: "backend", title: "Backend Integration", description: "Connect to APIs and databases", estimatedHours: 15, order: 4 },
            { id: "publish", title: "App Store Publishing", description: "Prepare and publish to app stores", estimatedHours: 10, order: 5 },
            { id: "project", title: "Mobile App Project", description: "Build and publish a complete mobile app", estimatedHours: 15, order: 6 },
        ],
    },
    "Data Science": {
        domain: "Data Science",
        title: "Data Science Fundamentals",
        description: "Analyze data and build machine learning models",
        totalEstimatedHours: 100,
        steps: [
            { id: "python", title: "Python for Data Science", description: "Python basics for data analysis", estimatedHours: 15, order: 1 },
            { id: "pandas", title: "Pandas & NumPy", description: "Data manipulation and numerical computing", estimatedHours: 20, order: 2 },
            { id: "viz", title: "Data Visualization", description: "Create insights with Matplotlib and Seaborn", estimatedHours: 15, order: 3 },
            { id: "ml", title: "Machine Learning Basics", description: "Introduction to ML with scikit-learn", estimatedHours: 25, order: 4 },
            { id: "deep", title: "Deep Learning Intro", description: "Neural networks with TensorFlow/PyTorch", estimatedHours: 15, order: 5 },
            { id: "project", title: "Data Science Project", description: "Complete an end-to-end ML project", estimatedHours: 10, order: 6 },
        ],
    },
    "Game Development": {
        domain: "Game Development",
        title: "Game Development Journey",
        description: "Design and build interactive games",
        totalEstimatedHours: 100,
        steps: [
            { id: "unity", title: "Unity Fundamentals", description: "Learn Unity engine basics", estimatedHours: 20, order: 1 },
            { id: "csharp", title: "C# for Games", description: "Game programming with C#", estimatedHours: 20, order: 2 },
            { id: "physics", title: "Game Physics", description: "Collision, movement, and physics systems", estimatedHours: 15, order: 3 },
            { id: "design", title: "Level Design", description: "Create engaging game levels", estimatedHours: 15, order: 4 },
            { id: "audio", title: "Audio & Polish", description: "Add sound, effects, and polish", estimatedHours: 10, order: 5 },
            { id: "project", title: "Mini Game Project", description: "Build and publish a complete game", estimatedHours: 20, order: 6 },
        ],
    },
    "UI/UX & Design": {
        domain: "UI/UX & Design",
        title: "UI/UX Design Mastery",
        description: "Create beautiful and user-centered designs",
        totalEstimatedHours: 70,
        steps: [
            { id: "principles", title: "Design Principles", description: "Color, typography, and visual hierarchy", estimatedHours: 10, order: 1 },
            { id: "figma", title: "Figma Mastery", description: "Design and prototype in Figma", estimatedHours: 15, order: 2 },
            { id: "ux", title: "UX Research", description: "User research and persona creation", estimatedHours: 12, order: 3 },
            { id: "wireframe", title: "Wireframing", description: "Create wireframes and user flows", estimatedHours: 10, order: 4 },
            { id: "prototype", title: "Prototyping", description: "Build interactive prototypes", estimatedHours: 10, order: 5 },
            { id: "project", title: "Design Portfolio", description: "Complete a design case study", estimatedHours: 13, order: 6 },
        ],
    },
    "DevOps & Cloud": {
        domain: "DevOps & Cloud",
        title: "DevOps & Cloud Engineering",
        description: "Infrastructure, automation, and cloud platforms",
        totalEstimatedHours: 90,
        steps: [
            { id: "linux", title: "Linux & Shell", description: "Command line and shell scripting", estimatedHours: 12, order: 1 },
            { id: "docker", title: "Docker & Containers", description: "Containerization fundamentals", estimatedHours: 15, order: 2 },
            { id: "cicd", title: "CI/CD Pipelines", description: "Automation with GitHub Actions/Jenkins", estimatedHours: 15, order: 3 },
            { id: "aws", title: "Cloud Platforms", description: "AWS/Azure/GCP fundamentals", estimatedHours: 20, order: 4 },
            { id: "k8s", title: "Kubernetes", description: "Container orchestration", estimatedHours: 15, order: 5 },
            { id: "project", title: "DevOps Project", description: "Deploy a complete infrastructure", estimatedHours: 13, order: 6 },
        ],
    },
    "Cybersecurity": {
        domain: "Cybersecurity",
        title: "Cybersecurity Fundamentals",
        description: "Protect systems and networks from threats",
        totalEstimatedHours: 80,
        steps: [
            { id: "basics", title: "Security Foundations", description: "Core security concepts and principles", estimatedHours: 12, order: 1 },
            { id: "network", title: "Network Security", description: "Firewalls, IDS, and network protection", estimatedHours: 15, order: 2 },
            { id: "crypto", title: "Cryptography", description: "Encryption and secure communications", estimatedHours: 12, order: 3 },
            { id: "web", title: "Web Security", description: "OWASP Top 10 and web vulnerabilities", estimatedHours: 15, order: 4 },
            { id: "pentest", title: "Penetration Testing", description: "Ethical hacking techniques", estimatedHours: 15, order: 5 },
            { id: "project", title: "Security Audit", description: "Conduct a security assessment", estimatedHours: 11, order: 6 },
        ],
    },
    "Backend Engineering": {
        domain: "Backend Engineering",
        title: "Backend Engineering Mastery",
        description: "Build robust server-side applications and APIs",
        totalEstimatedHours: 90,
        steps: [
            { id: "node", title: "Node.js Fundamentals", description: "Server-side JavaScript with Node.js", estimatedHours: 15, order: 1 },
            { id: "api", title: "RESTful API Design", description: "Design and build REST APIs", estimatedHours: 15, order: 2 },
            { id: "database", title: "Database Design", description: "SQL, PostgreSQL, and data modeling", estimatedHours: 20, order: 3 },
            { id: "auth", title: "Authentication & Security", description: "JWT, OAuth, and security best practices", estimatedHours: 15, order: 4 },
            { id: "scale", title: "Scaling & Performance", description: "Caching, queues, and performance optimization", estimatedHours: 15, order: 5 },
            { id: "project", title: "Backend Project", description: "Build a production-ready API service", estimatedHours: 10, order: 6 },
        ],
    },
    "Computer Science Fundamentals": {
        domain: "Computer Science Fundamentals",
        title: "Computer Science Foundations",
        description: "Core CS concepts for any programming career",
        totalEstimatedHours: 80,
        steps: [
            { id: "logic", title: "Programming Logic", description: "Variables, control flow, and functions", estimatedHours: 12, order: 1 },
            { id: "ds", title: "Data Structures", description: "Arrays, lists, trees, and graphs", estimatedHours: 18, order: 2 },
            { id: "algo", title: "Algorithms", description: "Sorting, searching, and complexity analysis", estimatedHours: 18, order: 3 },
            { id: "oop", title: "OOP Principles", description: "Object-oriented programming concepts", estimatedHours: 12, order: 4 },
            { id: "system", title: "System Design Basics", description: "Introduction to system architecture", estimatedHours: 10, order: 5 },
            { id: "project", title: "CS Practice Project", description: "Solve algorithmic challenges", estimatedHours: 10, order: 6 },
        ],
    },
    "Business & Startups": {
        domain: "Business & Startups",
        title: "Tech Entrepreneurship",
        description: "Build and launch your own tech product",
        totalEstimatedHours: 60,
        steps: [
            { id: "idea", title: "Idea Validation", description: "Validate your business idea", estimatedHours: 8, order: 1 },
            { id: "mvp", title: "Building an MVP", description: "Create a minimum viable product", estimatedHours: 15, order: 2 },
            { id: "market", title: "Go-to-Market Strategy", description: "Marketing and user acquisition", estimatedHours: 10, order: 3 },
            { id: "metrics", title: "Product Metrics", description: "Track and analyze key metrics", estimatedHours: 8, order: 4 },
            { id: "pitch", title: "Pitching & Fundraising", description: "Prepare pitch decks and fundraise", estimatedHours: 10, order: 5 },
            { id: "launch", title: "Product Launch", description: "Launch and iterate on feedback", estimatedHours: 9, order: 6 },
        ],
    },
}

/**
 * Get the learning path for a skill domain.
 */
export function getSkillPath(domain: SkillDomain): SkillPath | null {
    if (domain === "General") {
        return null
    }
    return SKILL_PATHS[domain] || null
}

/**
 * Get the default beginner path for General domain users.
 * Returns a curated selection from multiple domains.
 */
export function getGeneralBeginnerPath(): SkillPath {
    return {
        domain: "General",
        title: "Explore Programming",
        description: "Discover different areas and find your passion",
        totalEstimatedHours: 50,
        steps: [
            { id: "intro", title: "Programming Fundamentals", description: "Variables, loops, and functions", estimatedHours: 10, order: 1 },
            { id: "web-taste", title: "Web Dev Taster", description: "Try HTML, CSS, and JavaScript", estimatedHours: 10, order: 2 },
            { id: "python-taste", title: "Python Taster", description: "Explore Python programming", estimatedHours: 10, order: 3 },
            { id: "design-taste", title: "Design Taster", description: "Introduction to UI/UX design", estimatedHours: 10, order: 4 },
            { id: "choose", title: "Choose Your Path", description: "Select your specialty and dive deeper", estimatedHours: 10, order: 5 },
        ],
    }
}

/**
 * Get all available skill paths.
 */
export function getAllSkillPaths(): SkillPath[] {
    return [
        ...Object.values(SKILL_PATHS),
        getGeneralBeginnerPath(),
    ]
}

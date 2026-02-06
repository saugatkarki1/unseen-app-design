// data/seed-curriculum.ts
// ============================================================================
// CURRICULUM SEED DATA
// ============================================================================
// Curriculum items derived from existing curriculum phases.
// Maps to skill domains for personalized recommendations.
// ============================================================================

import type { CurriculumItemInsert } from "@/lib/supabase/types"

/**
 * Seed curriculum items organized by skill domain.
 * These are simplified versions of the full curriculum for the recommendation system.
 */
export const seedCurriculumItems: Omit<CurriculumItemInsert, "id">[] = [
    // =========================================================================
    // WEB DEVELOPMENT CURRICULUM
    // =========================================================================
    {
        title: "Setting Up Your Development Environment",
        description: "Install VS Code, Node.js, and essential extensions for web development.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "Web Development",
        display_order: 1,
        is_active: true,
    },
    {
        title: "HTML & CSS Fundamentals",
        description: "Learn the building blocks of web pages with HTML structure and CSS styling.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 60,
        skill_domain: "Web Development",
        display_order: 2,
        is_active: true,
    },
    {
        title: "JavaScript Basics",
        description: "Master variables, functions, and control flow in JavaScript.",
        type: "exercise",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Web Development",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Introduction to React",
        description: "Learn component-based development with React and JSX.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 60,
        skill_domain: "Web Development",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Building Your First React App",
        description: "Create a complete React application with state management and routing.",
        type: "project",
        difficulty: "Beginner",
        estimated_minutes: 180,
        skill_domain: "Web Development",
        display_order: 5,
        is_active: true,
    },
    {
        title: "Tailwind CSS Mastery",
        description: "Learn utility-first CSS with Tailwind for rapid UI development.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 90,
        skill_domain: "Web Development",
        display_order: 6,
        is_active: true,
    },
    {
        title: "React Hooks Deep Dive",
        description: "Master useState, useEffect, useContext, and custom hooks.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 120,
        skill_domain: "Web Development",
        display_order: 7,
        is_active: true,
    },
    {
        title: "Building a Portfolio Website",
        description: "Create a professional portfolio showcasing your web development skills.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 240,
        skill_domain: "Web Development",
        display_order: 8,
        is_active: true,
    },

    // =========================================================================
    // FULL STACK DEVELOPMENT CURRICULUM
    // =========================================================================
    {
        title: "Full Stack Architecture Overview",
        description: "Understand how frontend, backend, and databases work together.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "Full Stack Development",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Node.js & Express Basics",
        description: "Build your first API with Node.js and Express framework.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Full Stack Development",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Database Design with PostgreSQL",
        description: "Learn relational database design, SQL queries, and connections.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 120,
        skill_domain: "Full Stack Development",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Building REST APIs",
        description: "Design and implement RESTful APIs with proper error handling.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 180,
        skill_domain: "Full Stack Development",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Next.js Full Stack Development",
        description: "Build full-stack applications with Next.js App Router.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 150,
        skill_domain: "Full Stack Development",
        display_order: 5,
        is_active: true,
    },
    {
        title: "Authentication & Authorization",
        description: "Implement secure user authentication with JWT and sessions.",
        type: "exercise",
        difficulty: "Advanced",
        estimated_minutes: 120,
        skill_domain: "Full Stack Development",
        display_order: 6,
        is_active: true,
    },

    // =========================================================================
    // MOBILE DEVELOPMENT CURRICULUM
    // =========================================================================
    {
        title: "Mobile Development Fundamentals",
        description: "Understand mobile platforms, design patterns, and development approaches.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "Mobile Development",
        display_order: 1,
        is_active: true,
    },
    {
        title: "React Native Setup & Basics",
        description: "Set up React Native environment and build your first mobile app.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Mobile Development",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Mobile UI Components",
        description: "Build responsive mobile interfaces with native components.",
        type: "exercise",
        difficulty: "Beginner",
        estimated_minutes: 60,
        skill_domain: "Mobile Development",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Navigation in Mobile Apps",
        description: "Implement stack, tab, and drawer navigation patterns.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 75,
        skill_domain: "Mobile Development",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Building a Mobile Todo App",
        description: "Create a complete todo application with local storage.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 180,
        skill_domain: "Mobile Development",
        display_order: 5,
        is_active: true,
    },

    // =========================================================================
    // BACKEND ENGINEERING CURRICULUM
    // =========================================================================
    {
        title: "Backend Development Principles",
        description: "Learn server-side architecture, API design, and best practices.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "Backend Engineering",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Building APIs with Python & FastAPI",
        description: "Create high-performance APIs using Python and FastAPI.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Backend Engineering",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Database Optimization",
        description: "Learn indexing, query optimization, and database performance.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 90,
        skill_domain: "Backend Engineering",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Microservices Architecture",
        description: "Design and implement microservices-based applications.",
        type: "video",
        difficulty: "Advanced",
        estimated_minutes: 120,
        skill_domain: "Backend Engineering",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Building a Scalable API",
        description: "Create a production-ready API with caching and rate limiting.",
        type: "project",
        difficulty: "Advanced",
        estimated_minutes: 240,
        skill_domain: "Backend Engineering",
        display_order: 5,
        is_active: true,
    },

    // =========================================================================
    // DATA SCIENCE CURRICULUM
    // =========================================================================
    {
        title: "Introduction to Data Science",
        description: "Understand the data science workflow and key concepts.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "Data Science",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Python for Data Science",
        description: "Learn pandas, numpy, and data manipulation techniques.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 120,
        skill_domain: "Data Science",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Data Visualization with Python",
        description: "Create insightful visualizations with matplotlib and seaborn.",
        type: "exercise",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Data Science",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Machine Learning Fundamentals",
        description: "Learn supervised and unsupervised learning algorithms.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 150,
        skill_domain: "Data Science",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Building a ML Classification Model",
        description: "Create an end-to-end machine learning classification project.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 180,
        skill_domain: "Data Science",
        display_order: 5,
        is_active: true,
    },

    // =========================================================================
    // UI/UX DESIGN CURRICULUM
    // =========================================================================
    {
        title: "Design Thinking Principles",
        description: "Learn user-centered design methodology and research techniques.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "UI/UX & Design",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Figma Fundamentals",
        description: "Master the essential tools and workflows in Figma.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "UI/UX & Design",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Wireframing & Prototyping",
        description: "Create low and high-fidelity wireframes and interactive prototypes.",
        type: "exercise",
        difficulty: "Beginner",
        estimated_minutes: 60,
        skill_domain: "UI/UX & Design",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Design Systems",
        description: "Build scalable design systems with components and tokens.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 120,
        skill_domain: "UI/UX & Design",
        display_order: 4,
        is_active: true,
    },
    {
        title: "Designing a Mobile App",
        description: "Create a complete mobile app design from research to prototype.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 240,
        skill_domain: "UI/UX & Design",
        display_order: 5,
        is_active: true,
    },

    // =========================================================================
    // DEVOPS & CLOUD CURRICULUM
    // =========================================================================
    {
        title: "DevOps Introduction",
        description: "Understand CI/CD pipelines, automation, and DevOps culture.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "DevOps & Cloud",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Docker Fundamentals",
        description: "Learn containerization with Docker for consistent deployments.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "DevOps & Cloud",
        display_order: 2,
        is_active: true,
    },
    {
        title: "GitHub Actions CI/CD",
        description: "Set up automated testing and deployment pipelines.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 75,
        skill_domain: "DevOps & Cloud",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Kubernetes Basics",
        description: "Deploy and manage containerized applications with Kubernetes.",
        type: "video",
        difficulty: "Advanced",
        estimated_minutes: 150,
        skill_domain: "DevOps & Cloud",
        display_order: 4,
        is_active: true,
    },

    // =========================================================================
    // CYBERSECURITY CURRICULUM
    // =========================================================================
    {
        title: "Cybersecurity Fundamentals",
        description: "Learn security principles, threats, and defense strategies.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "Cybersecurity",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Web Application Security",
        description: "Understand OWASP Top 10 and common web vulnerabilities.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Cybersecurity",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Secure Coding Practices",
        description: "Learn to write secure code and prevent common vulnerabilities.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 90,
        skill_domain: "Cybersecurity",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Penetration Testing Basics",
        description: "Introduction to ethical hacking and penetration testing.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 120,
        skill_domain: "Cybersecurity",
        display_order: 4,
        is_active: true,
    },

    // =========================================================================
    // COMPUTER SCIENCE FUNDAMENTALS CURRICULUM
    // =========================================================================
    {
        title: "Introduction to Algorithms",
        description: "Learn algorithmic thinking and problem-solving strategies.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "Computer Science Fundamentals",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Data Structures Essentials",
        description: "Master arrays, linked lists, stacks, queues, and trees.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 150,
        skill_domain: "Computer Science Fundamentals",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Algorithm Practice Problems",
        description: "Solve classic algorithm problems with step-by-step solutions.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 120,
        skill_domain: "Computer Science Fundamentals",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Dynamic Programming",
        description: "Learn optimization techniques and dynamic programming patterns.",
        type: "video",
        difficulty: "Advanced",
        estimated_minutes: 180,
        skill_domain: "Computer Science Fundamentals",
        display_order: 4,
        is_active: true,
    },

    // =========================================================================
    // GAME DEVELOPMENT CURRICULUM
    // =========================================================================
    {
        title: "Game Development Overview",
        description: "Understand game engines, design patterns, and development workflow.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "Game Development",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Unity Fundamentals",
        description: "Learn Unity basics, scene management, and game objects.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 120,
        skill_domain: "Game Development",
        display_order: 2,
        is_active: true,
    },
    {
        title: "2D Game Mechanics",
        description: "Implement player movement, physics, and collision detection.",
        type: "exercise",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Game Development",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Building a 2D Platformer",
        description: "Create a complete 2D platformer game with levels and enemies.",
        type: "project",
        difficulty: "Intermediate",
        estimated_minutes: 300,
        skill_domain: "Game Development",
        display_order: 4,
        is_active: true,
    },

    // =========================================================================
    // BUSINESS & STARTUPS CURRICULUM
    // =========================================================================
    {
        title: "Startup Fundamentals",
        description: "Learn lean startup methodology and product development.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 45,
        skill_domain: "Business & Startups",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Building an MVP",
        description: "Define, design, and build a minimum viable product.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "Business & Startups",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Product-Market Fit",
        description: "Validate your idea and find product-market fit.",
        type: "exercise",
        difficulty: "Intermediate",
        estimated_minutes: 60,
        skill_domain: "Business & Startups",
        display_order: 3,
        is_active: true,
    },
    {
        title: "Fundraising & Pitching",
        description: "Learn to pitch your startup and raise funding.",
        type: "video",
        difficulty: "Intermediate",
        estimated_minutes: 90,
        skill_domain: "Business & Startups",
        display_order: 4,
        is_active: true,
    },

    // =========================================================================
    // GENERAL CURRICULUM (For explorers)
    // =========================================================================
    {
        title: "Finding Your Path in Tech",
        description: "Explore different tech career paths and find your direction.",
        type: "reading",
        difficulty: "Beginner",
        estimated_minutes: 30,
        skill_domain: "General",
        display_order: 1,
        is_active: true,
    },
    {
        title: "Programming Fundamentals",
        description: "Core programming concepts applicable to any language.",
        type: "video",
        difficulty: "Beginner",
        estimated_minutes: 90,
        skill_domain: "General",
        display_order: 2,
        is_active: true,
    },
    {
        title: "Building Your First Project",
        description: "Choose a beginner project and build it from scratch.",
        type: "project",
        difficulty: "Beginner",
        estimated_minutes: 120,
        skill_domain: "General",
        display_order: 3,
        is_active: true,
    },
]

/**
 * Get curriculum items by skill domain.
 */
export function getCurriculumByDomain(domain: string): Omit<CurriculumItemInsert, "id">[] {
    return seedCurriculumItems.filter(item => item.skill_domain === domain)
}

/**
 * Get curriculum items by difficulty.
 */
export function getCurriculumByDifficulty(
    difficulty: "Beginner" | "Intermediate" | "Advanced"
): Omit<CurriculumItemInsert, "id">[] {
    return seedCurriculumItems.filter(item => item.difficulty === difficulty)
}

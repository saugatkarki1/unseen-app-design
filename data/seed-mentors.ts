// data/seed-mentors.ts
// ============================================================================
// MENTOR SEED DATA
// ============================================================================
// Sample mentors for each skill domain for demo and testing purposes.
// ============================================================================

import type { MentorInsert } from "@/lib/supabase/types"

/**
 * Seed mentor data for demo purposes.
 * Each mentor has specializations that map to SkillDomain values.
 */
export const seedMentors: Omit<MentorInsert, "id">[] = [
    // Web Development Mentors
    {
        name: "Sarah Chen",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=sarah-chen",
        bio: "Senior Frontend Engineer with 8 years of experience in React, Vue, and modern web technologies. Passionate about building accessible and performant web applications.",
        specializations: ["Web Development", "Full Stack Development"],
        is_active: true,
    },
    {
        name: "Marcus Williams",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=marcus-williams",
        bio: "Full-stack developer specializing in Next.js and Node.js. Former tech lead at a YC startup. Loves mentoring aspiring developers.",
        specializations: ["Web Development", "Full Stack Development", "Backend Engineering"],
        is_active: true,
    },

    // Mobile Development Mentors
    {
        name: "Priya Sharma",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=priya-sharma",
        bio: "iOS and React Native specialist with 6 years of mobile development experience. Built apps with millions of downloads.",
        specializations: ["Mobile Development"],
        is_active: true,
    },
    {
        name: "James Rodriguez",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=james-rodriguez",
        bio: "Android developer and Flutter enthusiast. Google Developer Expert in mobile technologies.",
        specializations: ["Mobile Development"],
        is_active: true,
    },

    // Backend Engineering Mentors
    {
        name: "Elena Kowalski",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=elena-kowalski",
        bio: "Backend architect with expertise in distributed systems, microservices, and cloud infrastructure. 10+ years in the industry.",
        specializations: ["Backend Engineering", "DevOps & Cloud"],
        is_active: true,
    },
    {
        name: "David Kim",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=david-kim",
        bio: "Systems engineer specializing in scalable APIs and database optimization. Previously at AWS and Stripe.",
        specializations: ["Backend Engineering", "Full Stack Development"],
        is_active: true,
    },

    // Data Science & AI Mentors
    {
        name: "Dr. Aisha Patel",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=aisha-patel",
        bio: "Machine Learning researcher with a PhD in Computer Science. Published author on NLP and computer vision topics.",
        specializations: ["Data Science"],
        is_active: true,
    },
    {
        name: "Michael Zhang",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=michael-zhang",
        bio: "Data Scientist at a Fortune 500 company. Expert in Python, TensorFlow, and building production ML pipelines.",
        specializations: ["Data Science", "Computer Science Fundamentals"],
        is_active: true,
    },

    // UI/UX Design Mentors
    {
        name: "Olivia Martinez",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=olivia-martinez",
        bio: "Product Designer with 7 years of experience at top tech companies. Specializes in design systems and user research.",
        specializations: ["UI/UX & Design"],
        is_active: true,
    },
    {
        name: "Thomas Anderson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=thomas-anderson",
        bio: "UX Lead with a background in psychology. Expert in user testing, prototyping, and design thinking.",
        specializations: ["UI/UX & Design", "Web Development"],
        is_active: true,
    },

    // Game Development Mentors
    {
        name: "Ryan Cooper",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=ryan-cooper",
        bio: "Game developer with experience in Unity and Unreal Engine. Shipped 5 indie games on Steam.",
        specializations: ["Game Development"],
        is_active: true,
    },

    // DevOps & Cloud Mentors
    {
        name: "Lisa Huang",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=lisa-huang",
        bio: "DevOps engineer and AWS certified solutions architect. Expert in CI/CD, Kubernetes, and infrastructure as code.",
        specializations: ["DevOps & Cloud", "Backend Engineering"],
        is_active: true,
    },

    // Cybersecurity Mentors
    {
        name: "Alex Turner",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=alex-turner",
        bio: "Security researcher and ethical hacker. OSCP certified with experience in penetration testing and security audits.",
        specializations: ["Cybersecurity"],
        is_active: true,
    },

    // Computer Science Fundamentals Mentors
    {
        name: "Dr. Robert Lee",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=robert-lee",
        bio: "Computer Science professor with expertise in algorithms, data structures, and competitive programming.",
        specializations: ["Computer Science Fundamentals", "Data Science"],
        is_active: true,
    },

    // Business & Startups Mentors
    {
        name: "Jennifer Walsh",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=jennifer-walsh",
        bio: "Serial entrepreneur and startup advisor. Founded 3 successful companies and mentored over 100 founders.",
        specializations: ["Business & Startups"],
        is_active: true,
    },
    {
        name: "Chris Thompson",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=chris-thompson",
        bio: "Product manager turned startup founder. Expert in MVP development, product-market fit, and fundraising.",
        specializations: ["Business & Startups", "Full Stack Development"],
        is_active: true,
    },

    // General / Multi-domain Mentor
    {
        name: "Emily Foster",
        avatar_url: "https://api.dicebear.com/7.x/avataaars/svg?seed=emily-foster",
        bio: "Career coach and tech mentor with a broad background across multiple domains. Specializes in helping beginners find their path.",
        specializations: ["General", "Web Development", "Mobile Development"],
        is_active: true,
    },
]

/**
 * Get mentors by specialization.
 */
export function getMentorsBySpecialization(specialization: string): Omit<MentorInsert, "id">[] {
    return seedMentors.filter(mentor =>
        mentor.specializations?.includes(specialization)
    )
}

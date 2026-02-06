/**
 * Gamification System Configuration
 * Points, badges, streaks, and leaderboard logic
 */

export interface Badge {
    id: string;
    name: string;
    description: string;
    icon: string;
    color: string;
    requiredPoints?: number;
    requiredCapsules?: string[];
    requiredProjects?: string[];
}

export interface PointsConfig {
    capsuleComplete: number;
    challengeComplete: number;
    exerciseComplete: number;
    projectTaskComplete: number;
    projectComplete: number;
    dailyStreakBonus: number;
    weekStreakBonus: number;
    portfolioAdd: number;
}

export interface StreakConfig {
    maxDays: number;
    bonusMultiplier: number;
    resetHour: number; // Hour of day when streak resets (local time)
}

// Points configuration
export const pointsConfig: PointsConfig = {
    capsuleComplete: 50,      // Base points per capsule
    challengeComplete: 15,    // Points per challenge
    exerciseComplete: 25,     // Points per exercise
    projectTaskComplete: 20,  // Points per project task
    projectComplete: 100,     // Bonus for completing project
    dailyStreakBonus: 10,     // Daily streak bonus
    weekStreakBonus: 50,      // Weekly streak bonus (7 days)
    portfolioAdd: 25,         // Adding project to portfolio
};

// Streak configuration
export const streakConfig: StreakConfig = {
    maxDays: 365,
    bonusMultiplier: 1.5,     // Points multiplier after 7-day streak
    resetHour: 4,             // 4 AM local time
};

// Badge definitions
export const badges: Badge[] = [
    // Phase 1 Badges
    {
        id: "react-starter",
        name: "React Starter",
        description: "Created your first React project",
        icon: "Rocket",
        color: "from-blue-500 to-cyan-500",
        requiredCapsules: ["react-project-creation"],
    },
    {
        id: "ui-foundations",
        name: "UI Foundations",
        description: "Set up shadcn/ui in your project",
        icon: "Layout",
        color: "from-violet-500 to-purple-500",
        requiredCapsules: ["shadcn-setup"],
    },

    // Phase 2 Badges
    {
        id: "context-master",
        name: "Context Master",
        description: "Built dark mode with React Context",
        icon: "Moon",
        color: "from-slate-700 to-slate-900",
        requiredCapsules: ["dark-mode-context"],
    },
    {
        id: "data-fetcher",
        name: "Data Fetcher",
        description: "Mastered fetching data with useEffect",
        icon: "Database",
        color: "from-emerald-500 to-green-500",
        requiredCapsules: ["useeffect-data"],
    },
    {
        id: "motion-animator",
        name: "Motion Animator",
        description: "Added Framer Motion animations",
        icon: "Sparkles",
        color: "from-pink-500 to-rose-500",
        requiredCapsules: ["framer-motion-basics"],
    },

    // Phase 3 Badges
    {
        id: "auth-builder",
        name: "Auth Builder",
        description: "Built an animated auth form",
        icon: "Key",
        color: "from-amber-500 to-orange-500",
        requiredProjects: ["auth-form"],
    },
    {
        id: "form-wizard",
        name: "Form Wizard",
        description: "Created a multi-step form wizard",
        icon: "FileText",
        color: "from-teal-500 to-cyan-500",
        requiredProjects: ["multi-step-form"],
    },

    // Phase 4 Badges
    {
        id: "dashboard-developer",
        name: "Dashboard Developer",
        description: "Built a complete dashboard application",
        icon: "LayoutDashboard",
        color: "from-indigo-500 to-blue-500",
        requiredProjects: ["dashboard-app"],
    },
    {
        id: "app-architect",
        name: "App Architect",
        description: "Built a full-featured task manager",
        icon: "Building",
        color: "from-purple-500 to-violet-500",
        requiredProjects: ["task-manager"],
    },
    {
        id: "realtime-pro",
        name: "Realtime Pro",
        description: "Built a real-time chat application",
        icon: "MessageCircle",
        color: "from-green-500 to-emerald-500",
        requiredProjects: ["realtime-chat"],
    },

    // Phase 5-6 Badges
    {
        id: "portfolio-ready",
        name: "Portfolio Ready",
        description: "Deployed your portfolio website",
        icon: "Globe",
        color: "from-rose-500 to-pink-500",
        requiredProjects: ["portfolio-site"],
    },
    {
        id: "certified-developer",
        name: "Certified Developer",
        description: "Completed the capstone project",
        icon: "Trophy",
        color: "from-yellow-500 to-amber-500",
        requiredProjects: ["capstone-project"],
    },

    // Streak Badges
    {
        id: "week-warrior",
        name: "Week Warrior",
        description: "Maintained a 7-day streak",
        icon: "Flame",
        color: "from-orange-500 to-red-500",
    },
    {
        id: "month-master",
        name: "Month Master",
        description: "Maintained a 30-day streak",
        icon: "Fire",
        color: "from-red-500 to-rose-600",
    },

    // Points Badges
    {
        id: "point-collector",
        name: "Point Collector",
        description: "Earned 500 points",
        icon: "Star",
        color: "from-yellow-400 to-yellow-500",
        requiredPoints: 500,
    },
    {
        id: "point-master",
        name: "Point Master",
        description: "Earned 2000 points",
        icon: "Stars",
        color: "from-amber-400 to-yellow-500",
        requiredPoints: 2000,
    },
    {
        id: "point-legend",
        name: "Point Legend",
        description: "Earned 5000 points",
        icon: "Crown",
        color: "from-yellow-300 to-amber-500",
        requiredPoints: 5000,
    },
];

// Helper to get badge by ID
export function getBadgeById(id: string): Badge | undefined {
    return badges.find(badge => badge.id === id);
}

// Calculate points with streak bonus
export function calculatePointsWithBonus(basePoints: number, streakDays: number): number {
    if (streakDays >= 7) {
        return Math.round(basePoints * streakConfig.bonusMultiplier);
    }
    return basePoints;
}

// Check if user qualifies for a badge
export function checkBadgeQualification(
    badge: Badge,
    completedCapsules: string[],
    completedProjects: string[],
    totalPoints: number
): boolean {
    if (badge.requiredPoints && totalPoints < badge.requiredPoints) {
        return false;
    }

    if (badge.requiredCapsules) {
        const hasAllCapsules = badge.requiredCapsules.every(
            capsuleId => completedCapsules.includes(capsuleId)
        );
        if (!hasAllCapsules) return false;
    }

    if (badge.requiredProjects) {
        const hasAllProjects = badge.requiredProjects.every(
            projectId => completedProjects.includes(projectId)
        );
        if (!hasAllProjects) return false;
    }

    return true;
}

// Leaderboard entry type
export interface LeaderboardEntry {
    rank: number;
    name: string;
    avatar?: string;
    points: number;
    capsules: number;
    projects: number;
    streak: number;
    badges: string[];
}

// Mock leaderboard data (would come from Supabase in production)
export const mockLeaderboard: LeaderboardEntry[] = [
    {
        rank: 1,
        name: "Alex Chen",
        points: 4850,
        capsules: 11,
        projects: 7,
        streak: 45,
        badges: ["certified-developer", "month-master", "point-master"],
    },
    {
        rank: 2,
        name: "Sarah Johnson",
        points: 3920,
        capsules: 11,
        projects: 5,
        streak: 28,
        badges: ["dashboard-developer", "week-warrior", "point-master"],
    },
    {
        rank: 3,
        name: "Mike Williams",
        points: 2840,
        capsules: 9,
        projects: 4,
        streak: 14,
        badges: ["auth-builder", "motion-animator", "point-collector"],
    },
];

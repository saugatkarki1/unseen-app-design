// app/api/lessons/route.ts
// ============================================================================
// DOMAIN-FILTERED LESSONS API
// ============================================================================
// GET /api/lessons?domain=Web+Development
// Returns lessons and tasks filtered by skill domain.
// ============================================================================

import { NextRequest, NextResponse } from "next/server"
import { getCapsulesByDomain, getProjectsByDomain, getRecommendedTasks } from "@/lib/curriculum"
import { getSkillPath, getGeneralBeginnerPath } from "@/lib/skill-paths"
import type { SkillDomain } from "@/lib/skill-domain"

export async function GET(request: NextRequest) {
    try {
        const searchParams = request.nextUrl.searchParams
        const domainParam = searchParams.get("domain")
        const limitParam = searchParams.get("limit")

        // Validate domain
        const validDomains: SkillDomain[] = [
            "Web Development",
            "Full Stack Development",
            "Mobile Development",
            "Data Science",
            "Game Development",
            "UI/UX & Design",
            "DevOps & Cloud",
            "Cybersecurity",
            "General",
        ]

        const domain = (domainParam && validDomains.includes(domainParam as SkillDomain))
            ? domainParam as SkillDomain
            : "General"

        const limit = limitParam ? parseInt(limitParam, 10) : 10

        // Get domain-specific content
        const capsules = getCapsulesByDomain(domain)
        const projects = getProjectsByDomain(domain)
        const recommendedTasks = getRecommendedTasks(domain, Math.min(limit, 5))

        // Get learning path
        const skillPath = domain === "General"
            ? getGeneralBeginnerPath()
            : getSkillPath(domain)

        return NextResponse.json({
            success: true,
            domain,
            data: {
                capsules: capsules.slice(0, limit).map((c) => ({
                    id: c.id,
                    title: c.title,
                    description: c.description,
                    difficulty: c.difficulty,
                    estimatedMinutes: c.estimatedMinutes,
                    points: c.points,
                })),
                projects: projects.slice(0, limit).map((p) => ({
                    id: p.id,
                    title: p.title,
                    description: p.description,
                    difficulty: p.difficulty,
                    estimatedHours: p.estimatedHours,
                    technologies: p.technologies,
                })),
                recommendedTasks: recommendedTasks.map((t) => ({
                    id: t.id,
                    title: t.title,
                    description: t.description,
                    estimatedMinutes: t.estimatedMinutes,
                })),
                skillPath: skillPath ? {
                    title: skillPath.title,
                    description: skillPath.description,
                    totalEstimatedHours: skillPath.totalEstimatedHours,
                    steps: skillPath.steps,
                } : null,
            },
            meta: {
                totalCapsules: capsules.length,
                totalProjects: projects.length,
            },
        })
    } catch (error) {
        console.error("[/api/lessons] Error:", error)
        return NextResponse.json(
            { success: false, error: "Failed to fetch lessons" },
            { status: 500 }
        )
    }
}

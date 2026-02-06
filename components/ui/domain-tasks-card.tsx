"use client"

// components/ui/domain-tasks-card.tsx
// ============================================================================
// DOMAIN-SPECIFIC TASKS CARD
// ============================================================================
// Displays recommended lessons and tasks based on user's skill domain.
// Part of Phase 2 dashboard personalization.
// ============================================================================

import { useMemo } from "react"
import { BookOpen, ChevronRight, Clock, Sparkles } from "lucide-react"
import { getRecommendedTasks, getDomainLearningMessage, hasDedicatedContent } from "@/lib/curriculum"
import { getSkillDomainDescription, type SkillDomain } from "@/lib/skill-domain"

interface DomainTasksCardProps {
    domain: SkillDomain
    className?: string
}

export function DomainTasksCard({ domain, className = "" }: DomainTasksCardProps) {
    // Get recommended tasks for this domain
    const recommendedTasks = useMemo(() => {
        return getRecommendedTasks(domain, 4)
    }, [domain])

    const domainMessage = getDomainLearningMessage(domain)
    const domainDescription = getSkillDomainDescription(domain)
    const hasContent = hasDedicatedContent(domain)

    return (
        <div className={`cyber-card p-5 ${className}`}>
            {/* Header */}
            <div className="flex items-start justify-between mb-4">
                <div>
                    <p className="text-[10px] font-tech uppercase tracking-widest text-primary mb-1">
                        ■ Your Learning Path
                    </p>
                    <h3 className="text-lg font-tech font-semibold text-foreground">
                        {domain}
                    </h3>
                    <p className="text-sm text-muted-foreground mt-1">
                        {domainDescription}
                    </p>
                </div>
                <div className="p-2 rounded-lg bg-primary/10">
                    <Sparkles className="h-5 w-5 text-primary" />
                </div>
            </div>

            {/* Domain Message */}
            <div className="mb-4 p-3 rounded-lg bg-secondary/50 border border-border/50">
                <p className="text-sm text-muted-foreground">
                    {domainMessage}
                </p>
            </div>

            {/* Recommended Tasks */}
            {recommendedTasks.length > 0 ? (
                <div className="space-y-3">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                        ■ Recommended Lessons
                    </p>
                    {recommendedTasks.map((task, index) => (
                        <div
                            key={task.id}
                            className="group flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50 hover:border-primary/30 transition-colors cursor-pointer"
                        >
                            <div className="flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary border border-border text-sm font-tech text-muted-foreground">
                                {index + 1}
                            </div>
                            <div className="flex-1 min-w-0">
                                <p className="text-sm font-tech text-foreground group-hover:text-primary transition-colors line-clamp-1">
                                    {task.title}
                                </p>
                                <div className="flex items-center gap-3 mt-1">
                                    <span className="flex items-center gap-1 text-xs text-muted-foreground">
                                        <Clock className="h-3 w-3" />
                                        {task.estimatedMinutes} min
                                    </span>
                                    <span className="text-xs text-muted-foreground capitalize">
                                        {task.difficulty}
                                    </span>
                                </div>
                            </div>
                            <ChevronRight className="h-4 w-4 text-muted-foreground group-hover:text-primary transition-colors flex-shrink-0 mt-1" />
                        </div>
                    ))}
                </div>
            ) : (
                // Fallback for domains without content
                <div className="space-y-3">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                        ■ Getting Started
                    </p>
                    <div className="p-4 rounded-lg bg-secondary/30 border border-border/50 text-center">
                        <BookOpen className="h-8 w-8 text-muted-foreground mx-auto mb-2" />
                        <p className="text-sm text-muted-foreground">
                            Dedicated {domain} content coming soon.
                        </p>
                        <p className="text-xs text-muted-foreground mt-1">
                            Start with environment setup to prepare your tools.
                        </p>
                    </div>
                </div>
            )}

            {/* Content Note for non-dedicated domains */}
            {!hasContent && recommendedTasks.length > 0 && (
                <p className="mt-4 text-xs text-muted-foreground/70 text-center">
                    Showing foundational content. More {domain} lessons coming soon.
                </p>
            )}
        </div>
    )
}

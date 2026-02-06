"use client"

import { useEffect, useState, useCallback } from "react"
import { Users, Target, MessageSquare, CheckCircle2, Clock, BookOpen, User, AlertCircle } from "lucide-react"
import {
    getMentorDashboardData,
    updateMentorNoteAndFocus,
    type MentorDashboardData,
} from "@/lib/actions/mentor-dashboard-actions"
import type { MentorLearnerView } from "@/lib/supabase/types"

/**
 * MENTOR DASHBOARD
 * 
 * This page allows mentors to:
 * - View all assigned learners
 * - See learner details (skill_domain, skill_level, learning_goal)
 * - Add notes and set "next focus" guidance per learner
 * - See curriculum progress signals
 */
export default function MentorDashboardPage() {
    const [data, setData] = useState<MentorDashboardData | null>(null)
    const [loading, setLoading] = useState(true)
    const [error, setError] = useState<string | null>(null)

    // Fetch mentor dashboard data
    useEffect(() => {
        async function fetchData() {
            try {
                const dashboardData = await getMentorDashboardData()
                setData(dashboardData)
            } catch (err) {
                console.error("[MentorDashboard] Error fetching data:", err)
                setError("Failed to load dashboard data")
            } finally {
                setLoading(false)
            }
        }
        fetchData()
    }, [])

    // Handle note/focus update
    const handleUpdateNote = useCallback(async (
        learnerId: string,
        note: string | null,
        nextFocus: string | null
    ) => {
        const result = await updateMentorNoteAndFocus(learnerId, note, nextFocus)
        if (result.success) {
            // Refresh data
            const dashboardData = await getMentorDashboardData()
            setData(dashboardData)
        }
        return result
    }, [])

    if (loading) {
        return <MentorDashboardSkeleton />
    }

    if (error) {
        return (
            <div className="flex w-full min-h-screen flex-col items-center justify-center px-4 py-6">
                <div className="cyber-card p-8 text-center max-w-md">
                    <AlertCircle className="h-12 w-12 text-destructive mx-auto mb-4" />
                    <h2 className="text-lg font-tech text-foreground mb-2">Error Loading Dashboard</h2>
                    <p className="text-sm text-muted-foreground">{error}</p>
                </div>
            </div>
        )
    }

    if (!data?.isMentor) {
        return (
            <div className="flex w-full min-h-screen flex-col items-center justify-center px-4 py-6">
                <div className="cyber-card p-8 text-center max-w-md">
                    <User className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                    <h2 className="text-lg font-tech text-foreground mb-2">Mentor Access Only</h2>
                    <p className="text-sm text-muted-foreground">
                        This dashboard is only available for registered mentors.
                    </p>
                </div>
            </div>
        )
    }

    return (
        <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {/* Header */}
            <div className="mb-6">
                <h1 className="text-2xl font-tech font-bold text-foreground mb-1">
                    Mentor Dashboard
                </h1>
                <p className="text-sm text-muted-foreground">
                    Welcome, {data.mentorName}. Manage your {data.totalLearners} assigned learner{data.totalLearners !== 1 ? "s" : ""}.
                </p>
            </div>

            {/* Stats Row */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                <div className="cyber-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Users className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-2xl font-tech font-bold text-foreground tabular-nums">
                                {data.totalLearners}
                            </p>
                            <p className="text-xs text-muted-foreground">Assigned Learners</p>
                        </div>
                    </div>
                </div>

                <div className="cyber-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-green-500/10">
                            <CheckCircle2 className="h-5 w-5 text-green-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-tech font-bold text-foreground tabular-nums">
                                {data.learners.filter(l => l.onboarding_completed).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Onboarded</p>
                        </div>
                    </div>
                </div>

                <div className="cyber-card p-4">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-blue-500/10">
                            <BookOpen className="h-5 w-5 text-blue-500" />
                        </div>
                        <div>
                            <p className="text-2xl font-tech font-bold text-foreground tabular-nums">
                                {data.learners.filter(l => l.curriculum_started).length}
                            </p>
                            <p className="text-xs text-muted-foreground">Started Curriculum</p>
                        </div>
                    </div>
                </div>
            </div>

            {/* Learner List */}
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                        ■ Your Learners
                    </p>
                    <p className="text-xs text-muted-foreground">
                        Sorted by recently onboarded
                    </p>
                </div>

                {data.learners.length === 0 ? (
                    <div className="cyber-card p-8 text-center">
                        <Users className="h-12 w-12 text-muted-foreground mx-auto mb-4" />
                        <p className="text-sm text-muted-foreground">
                            No learners assigned yet. Learners will appear here once assigned to you.
                        </p>
                    </div>
                ) : (
                    <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                        {data.learners.map((learner) => (
                            <LearnerCard
                                key={learner.id}
                                learner={learner}
                                onUpdateNote={handleUpdateNote}
                            />
                        ))}
                    </div>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// LEARNER CARD COMPONENT
// ============================================================================

interface LearnerCardProps {
    learner: MentorLearnerView
    onUpdateNote: (learnerId: string, note: string | null, nextFocus: string | null) => Promise<{ success: boolean; error?: string }>
}

function LearnerCard({ learner, onUpdateNote }: LearnerCardProps) {
    const [noteValue, setNoteValue] = useState(learner.note || "")
    const [focusValue, setFocusValue] = useState(learner.next_focus || "")
    const [saving, setSaving] = useState(false)
    const [expanded, setExpanded] = useState(false)

    const hasChanges = noteValue !== (learner.note || "") || focusValue !== (learner.next_focus || "")

    const handleSave = async () => {
        if (!hasChanges) return
        setSaving(true)
        try {
            await onUpdateNote(
                learner.id,
                noteValue || null,
                focusValue || null
            )
        } finally {
            setSaving(false)
        }
    }

    const formatRelativeTime = (iso?: string | null) => {
        if (!iso) return "Never"
        const date = new Date(iso)
        const now = new Date()
        const diffMs = now.getTime() - date.getTime()
        const diffDays = Math.floor(diffMs / (1000 * 60 * 60 * 24))
        if (diffDays === 0) return "Today"
        if (diffDays === 1) return "Yesterday"
        if (diffDays < 7) return `${diffDays}d ago`
        return date.toLocaleDateString()
    }

    return (
        <div className="cyber-card p-4">
            {/* Learner Header */}
            <div className="flex items-start gap-3 mb-4">
                <div className="h-10 w-10 rounded-full bg-secondary flex items-center justify-center flex-shrink-0">
                    {learner.avatar_url ? (
                        <img
                            src={learner.avatar_url}
                            alt={learner.full_name || "Learner"}
                            className="h-10 w-10 rounded-full object-cover"
                        />
                    ) : (
                        <User className="h-5 w-5 text-muted-foreground" />
                    )}
                </div>
                <div className="flex-1 min-w-0">
                    <h3 className="font-tech font-semibold text-foreground truncate">
                        {learner.full_name || "Unknown Learner"}
                    </h3>
                    <p className="text-xs text-muted-foreground truncate">
                        {learner.email}
                    </p>
                </div>
                <div className="flex items-center gap-1">
                    {learner.onboarding_completed ? (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-tech rounded bg-green-500/10 text-green-500">
                            <CheckCircle2 className="h-3 w-3" />
                            Onboarded
                        </span>
                    ) : (
                        <span className="inline-flex items-center gap-1 px-2 py-0.5 text-[10px] font-tech rounded bg-yellow-500/10 text-yellow-500">
                            <Clock className="h-3 w-3" />
                            Pending
                        </span>
                    )}
                </div>
            </div>

            {/* Learner Details Grid */}
            <div className="grid grid-cols-2 gap-3 mb-4 text-sm">
                <div>
                    <p className="text-[10px] font-tech uppercase tracking-wider text-muted-foreground mb-0.5">
                        Skill Domain
                    </p>
                    <p className="text-foreground font-medium truncate">
                        {learner.skill_domain || "—"}
                    </p>
                </div>
                <div>
                    <p className="text-[10px] font-tech uppercase tracking-wider text-muted-foreground mb-0.5">
                        Skill Level
                    </p>
                    <p className="text-foreground font-medium">
                        {learner.inferred_skill_level || "—"}
                    </p>
                </div>
                <div className="col-span-2">
                    <p className="text-[10px] font-tech uppercase tracking-wider text-muted-foreground mb-0.5">
                        Learning Goal
                    </p>
                    <p className="text-foreground text-sm line-clamp-2">
                        {learner.learning_goal || "No goal specified"}
                    </p>
                </div>
            </div>

            {/* Progress Signals */}
            <div className="flex items-center gap-4 pb-3 border-b border-border/50 mb-3">
                <div className="flex items-center gap-1.5">
                    <BookOpen className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        {learner.curriculum_count} items
                    </span>
                </div>
                <div className="flex items-center gap-1.5">
                    {learner.curriculum_started ? (
                        <>
                            <CheckCircle2 className="h-3.5 w-3.5 text-green-500" />
                            <span className="text-xs text-green-500">Started</span>
                        </>
                    ) : (
                        <>
                            <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                            <span className="text-xs text-muted-foreground">Not started</span>
                        </>
                    )}
                </div>
                <div className="flex items-center gap-1.5 ml-auto">
                    <Clock className="h-3.5 w-3.5 text-muted-foreground" />
                    <span className="text-xs text-muted-foreground">
                        {formatRelativeTime(learner.last_activity_at)}
                    </span>
                </div>
            </div>

            {/* Mentor Actions (Expandable) */}
            <button
                onClick={() => setExpanded(!expanded)}
                className="w-full flex items-center justify-between py-1 text-sm text-primary hover:text-primary/80 transition-colors"
            >
                <span className="flex items-center gap-1.5 font-tech">
                    <MessageSquare className="h-3.5 w-3.5" />
                    {(learner.note || learner.next_focus) ? "View/Edit Notes" : "Add Notes"}
                </span>
                <span className="text-xs">
                    {expanded ? "▲" : "▼"}
                </span>
            </button>

            {expanded && (
                <div className="mt-3 space-y-3">
                    {/* Note Input */}
                    <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-muted-foreground mb-1">
                            <MessageSquare className="h-3 w-3 inline mr-1" />
                            Note
                        </label>
                        <textarea
                            className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg resize-none focus:outline-none focus:ring-1 focus:ring-primary"
                            rows={2}
                            placeholder="Add a private note about this learner..."
                            value={noteValue}
                            onChange={(e) => setNoteValue(e.target.value)}
                        />
                    </div>

                    {/* Next Focus Input */}
                    <div>
                        <label className="block text-[10px] font-tech uppercase tracking-wider text-muted-foreground mb-1">
                            <Target className="h-3 w-3 inline mr-1" />
                            Next Focus
                        </label>
                        <input
                            type="text"
                            className="w-full px-3 py-2 text-sm bg-secondary border border-border rounded-lg focus:outline-none focus:ring-1 focus:ring-primary"
                            placeholder="What should they focus on next?"
                            value={focusValue}
                            onChange={(e) => setFocusValue(e.target.value)}
                        />
                    </div>

                    {/* Save Button */}
                    {hasChanges && (
                        <button
                            onClick={handleSave}
                            disabled={saving}
                            className="w-full py-2 px-4 text-sm font-tech bg-primary text-primary-foreground rounded-lg hover:bg-primary/90 transition-colors disabled:opacity-50"
                        >
                            {saving ? "Saving..." : "Save Changes"}
                        </button>
                    )}
                </div>
            )}
        </div>
    )
}

// ============================================================================
// SKELETON LOADER
// ============================================================================

function MentorDashboardSkeleton() {
    return (
        <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8">
            {/* Header Skeleton */}
            <div className="mb-6">
                <div className="h-8 w-48 bg-secondary rounded animate-pulse mb-2" />
                <div className="h-4 w-64 bg-secondary rounded animate-pulse" />
            </div>

            {/* Stats Row Skeleton */}
            <div className="grid grid-cols-1 sm:grid-cols-3 gap-4 mb-6">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="cyber-card p-4">
                        <div className="flex items-center gap-3">
                            <div className="h-9 w-9 bg-secondary rounded-lg animate-pulse" />
                            <div>
                                <div className="h-6 w-12 bg-secondary rounded animate-pulse mb-1" />
                                <div className="h-3 w-20 bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>

            {/* Learner Cards Skeleton */}
            <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                {[1, 2, 3, 4].map((i) => (
                    <div key={i} className="cyber-card p-4">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="h-10 w-10 bg-secondary rounded-full animate-pulse" />
                            <div className="flex-1">
                                <div className="h-5 w-32 bg-secondary rounded animate-pulse mb-1" />
                                <div className="h-3 w-24 bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                        <div className="grid grid-cols-2 gap-3">
                            <div>
                                <div className="h-3 w-16 bg-secondary rounded animate-pulse mb-1" />
                                <div className="h-4 w-24 bg-secondary rounded animate-pulse" />
                            </div>
                            <div>
                                <div className="h-3 w-16 bg-secondary rounded animate-pulse mb-1" />
                                <div className="h-4 w-20 bg-secondary rounded animate-pulse" />
                            </div>
                        </div>
                    </div>
                ))}
            </div>
        </div>
    )
}

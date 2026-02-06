"use client"

// components/ui/curriculum-progress.tsx
// ============================================================================
// CURRICULUM PROGRESS COMPONENT
// ============================================================================
// Displays curriculum items with progress tracking and completion actions.
// ============================================================================

import { useState } from "react"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Progress } from "@/components/ui/progress"
import {
    BookOpen,
    Check,
    CheckCircle2,
    Circle,
    Clock,
    Film,
    Folder,
    Loader2,
    PlayCircle,
    Wrench,
} from "lucide-react"
import type { CurriculumItem } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

interface CurriculumItemWithStatus {
    item: CurriculumItem
    status: "assigned" | "in_progress" | "completed"
}

interface CurriculumProgressProps {
    items: CurriculumItemWithStatus[]
    progress: {
        total: number
        completed: number
        inProgress: number
        percentComplete: number
    }
    onStartItem?: (itemId: string) => Promise<void>
    onCompleteItem?: (itemId: string) => Promise<void>
}

interface NextCurriculumItemProps {
    item: CurriculumItem
    onStart?: () => Promise<void>
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getTypeIcon(type: string) {
    switch (type) {
        case "video":
            return <Film className="h-4 w-4 text-blue-500" />
        case "reading":
            return <BookOpen className="h-4 w-4 text-green-500" />
        case "exercise":
            return <Wrench className="h-4 w-4 text-orange-500" />
        case "project":
            return <Folder className="h-4 w-4 text-purple-500" />
        default:
            return <Circle className="h-4 w-4 text-muted-foreground" />
    }
}

function getDifficultyColor(difficulty: string): string {
    switch (difficulty) {
        case "Beginner":
            return "bg-green-500/10 text-green-600 hover:bg-green-500/15"
        case "Intermediate":
            return "bg-yellow-500/10 text-yellow-600 hover:bg-yellow-500/15"
        case "Advanced":
            return "bg-red-500/10 text-red-600 hover:bg-red-500/15"
        default:
            return "bg-muted text-muted-foreground"
    }
}

function formatMinutes(minutes: number): string {
    if (minutes < 60) return `${minutes}m`
    const hours = Math.floor(minutes / 60)
    const remaining = minutes % 60
    return remaining > 0 ? `${hours}h ${remaining}m` : `${hours}h`
}

function getStatusIcon(status: string) {
    switch (status) {
        case "completed":
            return <CheckCircle2 className="h-4 w-4 text-green-500" />
        case "in_progress":
            return <PlayCircle className="h-4 w-4 text-blue-500" />
        default:
            return <Circle className="h-4 w-4 text-muted-foreground/40" />
    }
}

// ============================================================================
// CURRICULUM PROGRESS COMPONENT
// ============================================================================

export function CurriculumProgress({
    items,
    progress,
    onStartItem,
    onCompleteItem,
}: CurriculumProgressProps) {
    const [loadingItemId, setLoadingItemId] = useState<string | null>(null)

    const handleAction = async (itemId: string, action: "start" | "complete") => {
        setLoadingItemId(itemId)
        try {
            if (action === "start" && onStartItem) {
                await onStartItem(itemId)
            } else if (action === "complete" && onCompleteItem) {
                await onCompleteItem(itemId)
            }
        } finally {
            setLoadingItemId(null)
        }
    }

    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <CardTitle className="text-lg">Your Curriculum</CardTitle>
                    <Badge variant="outline" className="text-xs">
                        {progress.completed}/{progress.total} complete
                    </Badge>
                </div>
                <Progress value={progress.percentComplete} className="h-2 mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
                {items.length === 0 ? (
                    <p className="text-sm text-muted-foreground text-center py-4">
                        No curriculum items yet. Check back soon!
                    </p>
                ) : (
                    items.map((curriculumItem) => (
                        <div
                            key={curriculumItem.item.id}
                            className={`flex items-center gap-3 p-3 rounded-lg border transition-colors ${curriculumItem.status === "in_progress"
                                    ? "bg-blue-500/5 border-blue-500/20"
                                    : curriculumItem.status === "completed"
                                        ? "bg-green-500/5 border-green-500/20"
                                        : "bg-card hover:bg-muted/50"
                                }`}
                        >
                            {/* Status Icon */}
                            <div className="shrink-0">
                                {getStatusIcon(curriculumItem.status)}
                            </div>

                            {/* Type Icon */}
                            <div className="shrink-0">
                                {getTypeIcon(curriculumItem.item.type)}
                            </div>

                            {/* Content */}
                            <div className="flex-1 min-w-0">
                                <p className={`text-sm font-medium truncate ${curriculumItem.status === "completed" ? "line-through text-muted-foreground" : ""
                                    }`}>
                                    {curriculumItem.item.title}
                                </p>
                                <div className="flex items-center gap-2 mt-0.5">
                                    <Badge
                                        variant="outline"
                                        className={`text-[10px] px-1.5 py-0 ${getDifficultyColor(curriculumItem.item.difficulty)}`}
                                    >
                                        {curriculumItem.item.difficulty}
                                    </Badge>
                                    <span className="text-xs text-muted-foreground flex items-center gap-1">
                                        <Clock className="h-3 w-3" />
                                        {formatMinutes(curriculumItem.item.estimated_minutes)}
                                    </span>
                                </div>
                            </div>

                            {/* Action Button */}
                            {curriculumItem.status !== "completed" && (
                                <Button
                                    size="sm"
                                    variant={curriculumItem.status === "in_progress" ? "default" : "outline"}
                                    className="shrink-0"
                                    disabled={loadingItemId === curriculumItem.item.id}
                                    onClick={() => handleAction(
                                        curriculumItem.item.id,
                                        curriculumItem.status === "in_progress" ? "complete" : "start"
                                    )}
                                >
                                    {loadingItemId === curriculumItem.item.id ? (
                                        <Loader2 className="h-4 w-4 animate-spin" />
                                    ) : curriculumItem.status === "in_progress" ? (
                                        <>
                                            <Check className="h-4 w-4 mr-1" />
                                            Done
                                        </>
                                    ) : (
                                        "Start"
                                    )}
                                </Button>
                            )}
                        </div>
                    ))
                )}
            </CardContent>
        </Card>
    )
}

// ============================================================================
// NEXT CURRICULUM ITEM COMPONENT
// ============================================================================

export function NextCurriculumItem({ item, onStart }: NextCurriculumItemProps) {
    const [loading, setLoading] = useState(false)

    const handleStart = async () => {
        if (!onStart) return
        setLoading(true)
        try {
            await onStart()
        } finally {
            setLoading(false)
        }
    }

    return (
        <Card className="border-primary/20 bg-gradient-to-br from-primary/5 to-transparent">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-2">
                    <div className="h-8 w-8 rounded-full bg-primary/10 flex items-center justify-center">
                        {getTypeIcon(item.type)}
                    </div>
                    <div>
                        <p className="text-xs text-muted-foreground font-medium">Up Next</p>
                        <CardTitle className="text-base">{item.title}</CardTitle>
                    </div>
                </div>
            </CardHeader>
            <CardContent>
                {item.description && (
                    <p className="text-sm text-muted-foreground mb-3 line-clamp-2">
                        {item.description}
                    </p>
                )}
                <div className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                        <Badge
                            variant="outline"
                            className={getDifficultyColor(item.difficulty)}
                        >
                            {item.difficulty}
                        </Badge>
                        <span className="text-xs text-muted-foreground flex items-center gap-1">
                            <Clock className="h-3 w-3" />
                            {formatMinutes(item.estimated_minutes)}
                        </span>
                    </div>
                    {onStart && (
                        <Button size="sm" onClick={handleStart} disabled={loading}>
                            {loading ? (
                                <Loader2 className="h-4 w-4 animate-spin" />
                            ) : (
                                <>
                                    <PlayCircle className="h-4 w-4 mr-1" />
                                    Start
                                </>
                            )}
                        </Button>
                    )}
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================================
// SKELETON
// ============================================================================

export function CurriculumProgressSkeleton() {
    return (
        <Card>
            <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                    <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                </div>
                <div className="h-2 w-full bg-muted rounded animate-pulse mt-2" />
            </CardHeader>
            <CardContent className="space-y-2">
                {[1, 2, 3].map((i) => (
                    <div key={i} className="flex items-center gap-3 p-3 rounded-lg border">
                        <div className="h-4 w-4 bg-muted rounded-full animate-pulse" />
                        <div className="h-4 w-4 bg-muted rounded animate-pulse" />
                        <div className="flex-1 space-y-1">
                            <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                            <div className="h-3 w-24 bg-muted rounded animate-pulse" />
                        </div>
                    </div>
                ))}
            </CardContent>
        </Card>
    )
}

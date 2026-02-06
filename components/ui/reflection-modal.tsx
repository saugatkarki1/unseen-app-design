"use client"

import { useState, useEffect, useCallback } from "react"
import { BookOpen, Send, AlertCircle } from "lucide-react"
import { useAppStore, useUserActiveFocusSession } from "@/lib/store"
import { cn } from "@/lib/utils"

/**
 * ReflectionModal - Non-dismissible modal for mandatory reflection
 * 
 * Rules:
 * - Cannot be skipped, dismissed, or ESC-closed
 * - Must reference: intent, outcome, mistake pattern, insight
 * - Only shown if focus was actually started (after finish/abandon)
 * - Backdrop click disabled
 */
export function ReflectionModal() {
    // USER-SCOPED SELECTOR - Prevent cross-user data leakage
    const activeFocusSession = useUserActiveFocusSession()
    const currentUserId = useAppStore((state) => state.userId)

    // Actions from store
    const { submitReflection, deferReflection } = useAppStore()

    const [outcomeDescription, setOutcomeDescription] = useState("")
    const [mistakePattern, setMistakePattern] = useState("")
    const [insight, setInsight] = useState("")
    const [errors, setErrors] = useState<Record<string, boolean>>({})

    // Non-blocking modal - Escape key not hijacked, handled by UI buttons


    const validate = useCallback(() => {
        const newErrors: Record<string, boolean> = {}

        if (!outcomeDescription.trim()) newErrors.outcomeDescription = true
        if (!mistakePattern.trim()) newErrors.mistakePattern = true
        if (!insight.trim()) newErrors.insight = true

        setErrors(newErrors)
        return Object.keys(newErrors).length === 0
    }, [outcomeDescription, mistakePattern, insight])

    const handleSubmit = useCallback(() => {
        if (!validate()) return

        submitReflection({
            outcomeDescription: outcomeDescription.trim(),
            mistakePattern: mistakePattern.trim(),
            insight: insight.trim(),
        })

        // Reset form
        setOutcomeDescription("")
        setMistakePattern("")
        setInsight("")
        setErrors({})
    }, [validate, submitReflection, outcomeDescription, mistakePattern, insight])

    // STRICT VISIBILITY CHECK
    const session = activeFocusSession

    // 1. Must have a session
    if (!session) return null

    // 2. Must be for current user (prevent cross-user bleed)
    if (session.userId !== currentUserId) return null

    // 3. Must not be active (must be finished or abandoned)
    if (session.status === 'active') return null

    // 4. Must not be already handled
    if (session.reflectionSubmitted) return null

    // 5. Must have a valid outcome
    if (session.outcome !== 'finished' && session.outcome !== 'abandoned') {
        return null
    }

    const wasAbandoned = session.outcome === "abandoned"

    return (
        <div
            className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4"
            // Prevent backdrop click from closing
            onClick={(e) => e.stopPropagation()}
        >
            <div
                className="bg-card border border-border rounded-xl max-w-2xl w-full max-h-[90vh] overflow-y-auto shadow-2xl"
                onClick={(e) => e.stopPropagation()}
            >
                {/* Header - No close button */}
                <div className={cn(
                    "px-6 py-4 border-b border-border",
                    wasAbandoned ? "bg-warning/5" : "bg-primary/5"
                )}>
                    <div className="flex items-center gap-3">
                        <div className={cn(
                            "p-2 rounded-lg",
                            wasAbandoned ? "bg-warning/10" : "bg-primary/10"
                        )}>
                            <BookOpen className={cn(
                                "h-5 w-5",
                                wasAbandoned ? "text-warning" : "text-primary"
                            )} />
                        </div>
                        <div>
                            <h2 className="text-lg font-semibold">
                                {wasAbandoned ? "Reflect on Abandonment" : "Complete Reflection"}
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                This reflection cannot be skipped.
                            </p>
                        </div>
                    </div>
                </div>

                {/* Intent Reference */}
                <div className="px-6 py-4 border-b border-border bg-secondary/20">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-2">
                        ■ Your Intent
                    </p>
                    <p className="text-sm text-foreground">
                        {session.intentDeclaration}
                    </p>
                    {session.artifacts && session.artifacts.length > 0 && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-2">
                                ■ Work Created ({session.artifacts.length})
                            </p>
                            <div className="space-y-1">
                                {session.artifacts.map((artifact) => (
                                    <div key={artifact.id} className="flex items-center gap-2 text-xs text-muted-foreground">
                                        <span className="px-1.5 py-0.5 bg-secondary rounded text-[10px] uppercase">
                                            {artifact.type}
                                        </span>
                                        <span className="line-clamp-1">{artifact.title}</span>
                                    </div>
                                ))}
                            </div>
                        </div>
                    )}
                    {session.proof && (
                        <div className="mt-3 pt-3 border-t border-border/50">
                            <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                                ■ Proof Submitted
                            </p>
                            <p className="text-xs text-muted-foreground line-clamp-2">
                                {session.proof}
                            </p>
                        </div>
                    )}
                </div>

                {/* Form */}
                <div className="px-6 py-5 space-y-5">
                    {/* Outcome */}
                    <div>
                        <label className="text-sm font-medium block mb-2">
                            {wasAbandoned
                                ? "Why did you abandon this session?"
                                : "What was the outcome?"
                            }
                            <span className="text-destructive ml-1">*</span>
                        </label>
                        <textarea
                            value={outcomeDescription}
                            onChange={(e) => {
                                setOutcomeDescription(e.target.value)
                                setErrors(prev => ({ ...prev, outcomeDescription: false }))
                            }}
                            placeholder={wasAbandoned
                                ? "Be honest about what led to abandoning..."
                                : "Describe what you accomplished or created..."
                            }
                            className={cn(
                                "w-full min-h-[80px] bg-secondary/30 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2",
                                errors.outcomeDescription
                                    ? "border-destructive focus:ring-destructive/50"
                                    : "border-border focus:ring-primary/50"
                            )}
                        />
                        {errors.outcomeDescription && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                This field is required.
                            </p>
                        )}
                    </div>

                    {/* Friction Question */}
                    <div>
                        <label className="text-sm font-medium block mb-2">
                            What friction did you encounter while making it?
                            <span className="text-destructive ml-1">*</span>
                        </label>
                        <textarea
                            value={mistakePattern}
                            onChange={(e) => {
                                setMistakePattern(e.target.value)
                                setErrors(prev => ({ ...prev, mistakePattern: false }))
                            }}
                            placeholder="What got in your way? What resistance did you notice?"
                            className={cn(
                                "w-full min-h-[80px] bg-secondary/30 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2",
                                errors.mistakePattern
                                    ? "border-destructive focus:ring-destructive/50"
                                    : "border-border focus:ring-primary/50"
                            )}
                        />
                        {errors.mistakePattern && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                This field is required.
                            </p>
                        )}
                    </div>

                    {/* Understanding Change */}
                    <div>
                        <label className="text-sm font-medium block mb-2">
                            What changed in your understanding after creating this?
                            <span className="text-destructive ml-1">*</span>
                        </label>
                        <textarea
                            value={insight}
                            onChange={(e) => {
                                setInsight(e.target.value)
                                setErrors(prev => ({ ...prev, insight: false }))
                            }}
                            placeholder="What do you see differently now? What did the work reveal?"
                            className={cn(
                                "w-full min-h-[80px] bg-secondary/30 border rounded-lg p-3 text-sm resize-none focus:outline-none focus:ring-2",
                                errors.insight
                                    ? "border-destructive focus:ring-destructive/50"
                                    : "border-border focus:ring-primary/50"
                            )}
                        />
                        {errors.insight && (
                            <p className="text-xs text-destructive mt-1 flex items-center gap-1">
                                <AlertCircle className="h-3 w-3" />
                                This field is required.
                            </p>
                        )}
                    </div>
                </div>

                {/* Footer - No cancel button */}
                <div className="px-6 py-4 border-t border-border bg-secondary/10">
                    <div className="flex items-center justify-between">
                        <button
                            onClick={deferReflection}
                            className="text-muted-foreground text-sm hover:text-foreground transition-colors px-3 py-2 rounded-lg hover:bg-secondary/50"
                        >
                            Save Reflection for Later
                        </button>
                        <button
                            onClick={handleSubmit}
                            className="flex items-center gap-2 px-5 py-2.5 rounded-lg bg-primary text-primary-foreground text-sm font-medium hover:bg-primary/90 transition-colors"
                        >
                            <Send className="h-4 w-4" />
                            Submit Reflection
                        </button>
                    </div>
                </div>
            </div>
        </div>
    )
}

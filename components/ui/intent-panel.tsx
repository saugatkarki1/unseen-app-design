"use client"

import { useState } from "react"
import { Send, X, Target, Play, CheckCircle } from "lucide-react"
import { useAppStore, useUserActiveIntent, useUserActiveFocusSession } from "@/lib/store"
import { cn } from "@/lib/utils"

/**
 * IntentPanel - A calm, non-pushy component for declaring intent
 * 
 * Rules:
 * - User-written declaration, never system-generated
 * - Declaring intent does NOT start focus, lock navigation, or trigger reflection
 * - Only ONE active intent at a time
 * - No daily reset, no auto-generation, no suggestions
 */
export function IntentPanel() {
    // USER-SCOPED SELECTORS - Prevent cross-user data leakage
    const activeIntent = useUserActiveIntent()
    const activeFocusSession = useUserActiveFocusSession()

    // Actions from store
    const {
        declareIntent,
        beginFocus,
        resolveIntent,
    } = useAppStore()

    const [declaration, setDeclaration] = useState("")
    const [isExpanded, setIsExpanded] = useState(false)

    const handleDeclare = () => {
        const trimmed = declaration.trim()
        if (!trimmed) return
        declareIntent(trimmed)
        setDeclaration("")
        setIsExpanded(false)
    }

    const handleBeginFocus = () => {
        beginFocus()
    }

    const handleResolve = () => {
        resolveIntent()
    }

    // If there's an active focus session (active OR waiting for reflection), don't show intent panel
    if (activeFocusSession) {
        return null
    }

    // If there's an active intent, show it
    if (activeIntent) {
        return (
            <div className="cyber-card cyber-card-accent-green p-5">
                <div className="flex items-start justify-between gap-4">
                    <div className="flex-1 min-w-0">
                        <p className="text-[10px] font-tech uppercase tracking-widest text-primary mb-2">
                            ■ Current Intent
                        </p>
                        <p className="text-sm text-foreground leading-relaxed">
                            {activeIntent.declaration}
                        </p>
                        <p className="text-xs text-muted-foreground mt-2">
                            Declared {new Date(activeIntent.declaredAt).toLocaleDateString()}
                        </p>
                    </div>
                    <div className="flex items-center gap-2">
                        <button
                            onClick={handleBeginFocus}
                            className="flex items-center gap-2 px-3 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-tech uppercase tracking-wide hover:bg-primary/90 transition-colors"
                        >
                            <Play className="h-4 w-4" />
                            Begin Focus
                        </button>
                        <button
                            onClick={handleResolve}
                            className="p-2 rounded-lg text-muted-foreground hover:text-foreground hover:bg-secondary transition-colors"
                            title="Resolve without focus"
                        >
                            <CheckCircle className="h-4 w-4" />
                        </button>
                    </div>
                </div>
            </div>
        )
    }

    // No active intent - show declaration input (collapsed or expanded)
    if (!isExpanded) {
        return (
            <div className="cyber-card p-5">
                <button
                    onClick={() => setIsExpanded(true)}
                    className="w-full flex items-center gap-3 text-left group"
                >
                    <div className="p-2 rounded-lg bg-secondary/50 group-hover:bg-primary/10 transition-colors">
                        <Target className="h-5 w-5 text-muted-foreground group-hover:text-primary transition-colors" />
                    </div>
                    <div className="flex-1">
                        <p className="text-sm text-muted-foreground group-hover:text-foreground transition-colors">
                            What are you choosing to care about right now?
                        </p>
                    </div>
                </button>
            </div>
        )
    }

    // Expanded state - show text input
    return (
        <div className="cyber-card cyber-card-accent-green p-5">
            <div className="space-y-4">
                <div className="flex items-center justify-between">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-primary">
                        ■ Declare Intent
                    </p>
                    <button
                        onClick={() => {
                            setIsExpanded(false)
                            setDeclaration("")
                        }}
                        className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                    >
                        <X className="h-4 w-4" />
                    </button>
                </div>

                <textarea
                    value={declaration}
                    onChange={(e) => setDeclaration(e.target.value)}
                    placeholder="What I am choosing to care about right now..."
                    className="w-full min-h-[80px] bg-secondary/30 border border-border rounded-lg p-3 text-sm text-foreground placeholder:text-muted-foreground resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                    autoFocus
                />

                <div className="flex items-center justify-between">
                    <p className="text-xs text-muted-foreground">
                        This is a declaration, not a commitment.
                    </p>
                    <button
                        onClick={handleDeclare}
                        disabled={!declaration.trim()}
                        className={cn(
                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-tech uppercase tracking-wide transition-colors",
                            declaration.trim()
                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                        )}
                    >
                        <Send className="h-4 w-4" />
                        Declare
                    </button>
                </div>
            </div>
        </div>
    )
}

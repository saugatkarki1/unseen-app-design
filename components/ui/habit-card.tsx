"use client"

import { motion, AnimatePresence } from "framer-motion"
import { Check, Lock, Sparkles, Star } from "lucide-react"
import { cn } from "@/lib/utils"
import type { Habit, HabitCategory } from "@/data/habits"
import type { UserHabitState } from "@/lib/store"
import {
    Tooltip,
    TooltipContent,
    TooltipProvider,
    TooltipTrigger,
} from "@/components/ui/tooltip"

interface HabitCardProps {
    habit: Habit
    userState?: UserHabitState
    isCompletedToday?: boolean
    onHover?: () => void
}

const categoryIcons: Record<HabitCategory, string> = {
    study: "📚",
    work: "💼",
    project: "🚀",
    ritual: "🔥",
}

const categoryGradients: Record<HabitCategory, string> = {
    study: "from-blue-500/10 to-indigo-500/10",
    work: "from-emerald-500/10 to-teal-500/10",
    project: "from-purple-500/10 to-violet-500/10",
    ritual: "from-orange-500/10 to-amber-500/10",
}

const categoryBadgeColors: Record<HabitCategory, string> = {
    study: "bg-blue-500/10 text-blue-600",
    work: "bg-emerald-500/10 text-emerald-600",
    project: "bg-purple-500/10 text-purple-600",
    ritual: "bg-orange-500/10 text-orange-600",
}

export function HabitCard({ habit, userState, isCompletedToday = false }: HabitCardProps) {
    const isCompleted = userState?.status === "completed"
    const isLocked = habit.locked
    const completionCount = userState?.completionCount || 0

    // Determine unlock requirements for locked habits
    const unlockText = isLocked && habit.prerequisites.length > 0
        ? `Complete ${habit.prerequisites.length} prerequisite${habit.prerequisites.length > 1 ? "s" : ""} to unlock`
        : ""

    return (
        <TooltipProvider>
            <motion.div
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -10 }}
                transition={{ duration: 0.3, ease: "easeOut" }}
                whileHover={!isLocked ? { scale: 1.02, y: -2 } : undefined}
                className={cn(
                    "group relative overflow-hidden rounded-xl border transition-all duration-300",
                    isLocked
                        ? "border-border/50 bg-muted/30 cursor-not-allowed opacity-60"
                        : isCompleted
                            ? "border-success/30 bg-gradient-to-br from-success/5 to-success/10"
                            : "border-border bg-card hover:shadow-lg hover:border-primary/20"
                )}
            >
                {/* Background gradient based on category */}
                {!isLocked && !isCompleted && (
                    <div className={cn(
                        "absolute inset-0 bg-gradient-to-br opacity-0 transition-opacity duration-300 group-hover:opacity-100",
                        categoryGradients[habit.category]
                    )} />
                )}

                {/* Completion glow effect */}
                <AnimatePresence>
                    {isCompletedToday && isCompleted && (
                        <motion.div
                            initial={{ opacity: 0, scale: 0.8 }}
                            animate={{ opacity: 1, scale: 1 }}
                            exit={{ opacity: 0, scale: 0.8 }}
                            className="absolute inset-0 bg-gradient-to-br from-success/20 to-success/5 pointer-events-none"
                        />
                    )}
                </AnimatePresence>

                <div className="relative z-10 p-4 sm:p-5">
                    {/* Header: Icon + Category Badge + Aura Reward */}
                    <div className="flex items-start justify-between gap-3 mb-3">
                        <div className="flex items-center gap-2">
                            <span className="text-xl" role="img" aria-label={habit.category}>
                                {categoryIcons[habit.category]}
                            </span>
                            <span className={cn(
                                "text-[10px] font-medium uppercase tracking-wider px-2 py-0.5 rounded-full",
                                categoryBadgeColors[habit.category]
                            )}>
                                {habit.category}
                            </span>
                        </div>

                        {/* Aura Reward Badge */}
                        <Tooltip>
                            <TooltipTrigger asChild>
                                <div className={cn(
                                    "flex items-center gap-1 px-2 py-1 rounded-full text-xs font-medium",
                                    isCompleted
                                        ? "bg-success/10 text-success"
                                        : isLocked
                                            ? "bg-muted text-muted-foreground"
                                            : "bg-amber-500/10 text-amber-600"
                                )}>
                                    <Star className="h-3 w-3" />
                                    <span>{habit.auraReward}</span>
                                </div>
                            </TooltipTrigger>
                            <TooltipContent>
                                <p>Earn {habit.auraReward} Aura points</p>
                            </TooltipContent>
                        </Tooltip>
                    </div>

                    {/* Title with Lock Icon for locked habits */}
                    <div className="flex items-start gap-2 mb-2">
                        {isLocked && (
                            <Lock className="h-4 w-4 text-muted-foreground mt-0.5 flex-shrink-0" />
                        )}
                        <h3 className={cn(
                            "font-semibold transition-colors",
                            isCompleted
                                ? "text-success"
                                : isLocked
                                    ? "text-muted-foreground"
                                    : "text-foreground group-hover:text-primary"
                        )}>
                            {habit.title}
                        </h3>
                    </div>

                    {/* Description */}
                    <p className={cn(
                        "text-sm leading-relaxed",
                        isLocked ? "text-muted-foreground/70" : "text-muted-foreground"
                    )}>
                        {habit.description}
                    </p>

                    {/* Unlock requirements for locked habits */}
                    {isLocked && unlockText && (
                        <p className="mt-2 text-xs text-warning flex items-center gap-1">
                            <Lock className="h-3 w-3" />
                            {unlockText}
                        </p>
                    )}

                    {/* Completion indicator */}
                    <div className="mt-4 flex items-center justify-between">
                        <AnimatePresence mode="wait">
                            {isCompleted ? (
                                <motion.div
                                    key="completed"
                                    initial={{ opacity: 0, scale: 0.5 }}
                                    animate={{ opacity: 1, scale: 1 }}
                                    exit={{ opacity: 0, scale: 0.5 }}
                                    transition={{ type: "spring", stiffness: 500, damping: 25 }}
                                    className="flex items-center gap-2"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-success">
                                        <Check className="h-4 w-4 text-white" />
                                    </div>
                                    <span className="text-xs font-medium text-success">Completed</span>
                                    {isCompletedToday && (
                                        <motion.div
                                            initial={{ opacity: 0, x: -10 }}
                                            animate={{ opacity: 1, x: 0 }}
                                            className="flex items-center gap-1 text-xs text-success/80"
                                        >
                                            <Sparkles className="h-3 w-3" />
                                            <span>Today!</span>
                                        </motion.div>
                                    )}
                                </motion.div>
                            ) : isLocked ? (
                                <motion.div
                                    key="locked"
                                    className="flex items-center gap-2 text-muted-foreground"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full bg-muted border border-border">
                                        <Lock className="h-3 w-3" />
                                    </div>
                                    <span className="text-xs">Locked</span>
                                </motion.div>
                            ) : (
                                <motion.div
                                    key="pending"
                                    className="flex items-center gap-2 text-muted-foreground"
                                >
                                    <div className="flex h-6 w-6 items-center justify-center rounded-full border-2 border-dashed border-muted-foreground/30" />
                                    <span className="text-xs">Pending</span>
                                </motion.div>
                            )}
                        </AnimatePresence>

                        {/* Completion count for recurring habits */}
                        {completionCount > 0 && (
                            <span className="text-xs text-muted-foreground">
                                {completionCount}× completed
                            </span>
                        )}
                    </div>
                </div>
            </motion.div>
        </TooltipProvider>
    )
}

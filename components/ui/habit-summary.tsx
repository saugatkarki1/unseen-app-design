"use client"

import { motion } from "framer-motion"
import { Flame, Star, Trophy, TrendingUp } from "lucide-react"
import { cn } from "@/lib/utils"

interface HabitSummaryProps {
    completedToday: number
    totalAvailable: number
    auraEarnedToday: number
    currentStreak: number
    totalAura: number
}

export function HabitSummary({
    completedToday,
    totalAvailable,
    auraEarnedToday,
    currentStreak,
    totalAura,
}: HabitSummaryProps) {
    const progressPercentage = totalAvailable > 0
        ? Math.round((completedToday / totalAvailable) * 100)
        : 0

    return (
        <motion.div
            initial={{ opacity: 0, y: -10 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.4 }}
            className="rounded-xl bg-gradient-to-r from-primary via-primary/95 to-primary/90 px-4 py-5 sm:px-6 sm:py-6 text-white shadow-lg"
        >
            <div className="grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
                {/* Today's Progress */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider">
                        <TrendingUp className="h-4 w-4" />
                        <span>Today's Progress</span>
                    </div>
                    <div className="flex items-end gap-3">
                        <p className="text-3xl font-light tabular-nums">
                            {completedToday}/{totalAvailable}
                        </p>
                        <span className="text-sm text-white/60 pb-1">habits</span>
                    </div>
                    {/* Progress bar */}
                    <div className="h-1.5 w-full bg-white/20 rounded-full overflow-hidden">
                        <motion.div
                            initial={{ width: 0 }}
                            animate={{ width: `${progressPercentage}%` }}
                            transition={{ duration: 0.8, ease: "easeOut" }}
                            className={cn(
                                "h-full rounded-full",
                                progressPercentage === 100
                                    ? "bg-success"
                                    : progressPercentage >= 50
                                        ? "bg-amber-400"
                                        : "bg-white/80"
                            )}
                        />
                    </div>
                </div>

                {/* Aura Earned Today */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider">
                        <Star className="h-4 w-4" />
                        <span>Aura Earned</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <motion.p
                            key={auraEarnedToday}
                            initial={{ scale: 1.2, color: "#FFD700" }}
                            animate={{ scale: 1, color: "#FFFFFF" }}
                            transition={{ duration: 0.3 }}
                            className="text-3xl font-light tabular-nums"
                        >
                            +{auraEarnedToday}
                        </motion.p>
                        <span className="text-sm text-white/60 pb-1">today</span>
                    </div>
                </div>

                {/* Current Streak */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider">
                        <Flame className="h-4 w-4" />
                        <span>Streak</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-light tabular-nums">{currentStreak}</p>
                        <span className="text-sm text-white/60 pb-1">days</span>
                    </div>
                </div>

                {/* Total Aura */}
                <div className="space-y-2">
                    <div className="flex items-center gap-2 text-white/70 text-xs uppercase tracking-wider">
                        <Trophy className="h-4 w-4" />
                        <span>Total Aura</span>
                    </div>
                    <div className="flex items-end gap-2">
                        <p className="text-3xl font-light tabular-nums">{totalAura}</p>
                        <span className="text-sm text-white/60 pb-1">points</span>
                    </div>
                </div>
            </div>
        </motion.div>
    )
}

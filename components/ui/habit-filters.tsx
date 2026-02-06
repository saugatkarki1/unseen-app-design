"use client"

import { motion } from "framer-motion"
import { BookOpen, Briefcase, FolderKanban, Flame, LayoutGrid } from "lucide-react"
import { cn } from "@/lib/utils"
import type { HabitCategory } from "@/data/habits"

interface HabitFiltersProps {
    activeFilter: HabitCategory | "all"
    onFilterChange: (filter: HabitCategory | "all") => void
    counts?: Record<HabitCategory | "all", number>
}

const filterOptions: { id: HabitCategory | "all"; label: string; icon: React.ElementType }[] = [
    { id: "all", label: "All", icon: LayoutGrid },
    { id: "study", label: "Study", icon: BookOpen },
    { id: "work", label: "Work", icon: Briefcase },
    { id: "project", label: "Projects", icon: FolderKanban },
    { id: "ritual", label: "Rituals", icon: Flame },
]

export function HabitFilters({ activeFilter, onFilterChange, counts }: HabitFiltersProps) {
    return (
        <div className="relative flex items-center gap-1 overflow-x-auto scrollbar-hide pb-1 sm:gap-2">
            {filterOptions.map((option) => {
                const isActive = activeFilter === option.id
                const Icon = option.icon
                const count = counts?.[option.id]

                return (
                    <motion.button
                        key={option.id}
                        onClick={() => onFilterChange(option.id)}
                        whileHover={{ scale: 1.02 }}
                        whileTap={{ scale: 0.98 }}
                        className={cn(
                            "relative flex items-center gap-2 px-3 py-2 sm:px-4 sm:py-2.5 rounded-lg font-medium text-sm transition-colors whitespace-nowrap",
                            isActive
                                ? "text-primary"
                                : "text-muted-foreground hover:text-foreground"
                        )}
                    >
                        {/* Active background */}
                        {isActive && (
                            <motion.div
                                layoutId="activeFilterBg"
                                className="absolute inset-0 bg-primary/10 rounded-lg"
                                initial={false}
                                transition={{ type: "spring", stiffness: 500, damping: 35 }}
                            />
                        )}

                        <span className="relative z-10 flex items-center gap-2">
                            <Icon className={cn(
                                "h-4 w-4 transition-colors",
                                isActive ? "text-primary" : "text-muted-foreground"
                            )} />
                            <span>{option.label}</span>
                            {count !== undefined && count > 0 && (
                                <span className={cn(
                                    "text-xs px-1.5 py-0.5 rounded-full",
                                    isActive
                                        ? "bg-primary/20 text-primary"
                                        : "bg-muted text-muted-foreground"
                                )}>
                                    {count}
                                </span>
                            )}
                        </span>
                    </motion.button>
                )
            })}
        </div>
    )
}

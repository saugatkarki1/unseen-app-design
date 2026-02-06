"use client";

import { useState, useEffect } from "react";
import { motion, useReducedMotion } from "framer-motion";
import { useTheme } from "next-themes";
import { Flame, Crown, Medal, Trophy } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";

export interface LeaderboardUser {
    id: string;
    rank: number;
    name: string;
    avatar?: string;
    auraScore: number;
    streak: number;
    activityData: number[];
    dailyChange: number;
    dailyChangePercent: number;
}

interface LeaderboardTableProps {
    users?: LeaderboardUser[];
    onUserSelect?: (userId: string) => void;
    className?: string;
    maxRows?: number;
}

export function LeaderboardTable({
    users = [],
    onUserSelect,
    className = "",
    maxRows = 10,
}: LeaderboardTableProps) {
    const [selectedUser, setSelectedUser] = useState<string | null>(null);
    const [mounted, setMounted] = useState(false);
    const shouldReduceMotion = useReducedMotion();
    const { theme } = useTheme();
    const isDark = theme === "dark";

    useEffect(() => {
        setMounted(true);
    }, []);

    const handleUserSelect = (userId: string) => {
        setSelectedUser(userId);
        if (onUserSelect) {
            onUserSelect(userId);
        }
    };

    const formatNumber = (num: number) => {
        if (num >= 1000000) {
            return `${(num / 1000000).toFixed(1)}M`;
        }
        if (num >= 1000) {
            return `${(num / 1000).toFixed(1)}K`;
        }
        return num.toLocaleString();
    };

    const formatPercentage = (value: number) => {
        const sign = value >= 0 ? "+" : "";
        return `${sign}${value.toFixed(2)}%`;
    };

    const getPerformanceColor = (value: number) => {
        if (!mounted) {
            const isPositive = value >= 0;
            return {
                color: isPositive ? "#22c55e" : "#f87171",
                bgColor: isPositive ? "bg-green-500/10" : "bg-red-500/10",
                borderColor: isPositive ? "border-green-500/30" : "border-red-500/30",
                textColor: isPositive ? "text-green-500" : "text-red-500",
            };
        }

        const isPositive = value >= 0;
        const color = isPositive
            ? isDark
                ? "#22c55e"
                : "#16a34a"
            : isDark
                ? "#f87171"
                : "#dc2626";
        const bgColor = isPositive
            ? isDark
                ? "bg-green-500/10"
                : "bg-green-50"
            : isDark
                ? "bg-red-500/10"
                : "bg-red-50";
        const borderColor = isPositive
            ? isDark
                ? "border-green-500/30"
                : "border-green-200"
            : isDark
                ? "border-red-500/30"
                : "border-red-200";
        const textColor = isPositive
            ? isDark
                ? "text-green-400"
                : "text-green-600"
            : isDark
                ? "text-red-400"
                : "text-red-600";

        return { color, bgColor, borderColor, textColor };
    };

    const getRankIcon = (rank: number) => {
        switch (rank) {
            case 1:
                return <Crown className="h-5 w-5 text-yellow-500" />;
            case 2:
                return <Medal className="h-5 w-5 text-gray-400" />;
            case 3:
                return <Medal className="h-5 w-5 text-amber-600" />;
            default:
                return null;
        }
    };

    const getRankBgColor = (rank: number) => {
        switch (rank) {
            case 1:
                return "bg-gradient-to-br from-yellow-400 to-amber-500";
            case 2:
                return "bg-gradient-to-br from-gray-300 to-gray-400";
            case 3:
                return "bg-gradient-to-br from-amber-500 to-orange-600";
            default:
                return "bg-muted";
        }
    };

    const renderSparkline = (data: number[]) => {
        if (!data || data.length === 0) return null;

        const min = Math.min(...data);
        const max = Math.max(...data);
        const range = max - min || 1;

        const createPath = (dataPoints: number[]) => {
            return dataPoints
                .map((value, index) => {
                    const x = (index / (dataPoints.length - 1)) * 60;
                    const y = 20 - ((value - min) / range) * 15;
                    return `${x},${y}`;
                })
                .join(" ");
        };

        const fullPath = createPath(data);
        const isPositive = data[data.length - 1] >= data[0];
        const strokeColor = isPositive ? "#22c55e" : "#f87171";

        return (
            <div className="w-16 h-6">
                <motion.svg
                    width="60"
                    height="20"
                    viewBox="0 0 60 20"
                    className="overflow-visible"
                    initial={{ opacity: 0, scale: 0.95 }}
                    animate={{ opacity: 1, scale: 1 }}
                    transition={{
                        type: "spring",
                        stiffness: 400,
                        damping: 25,
                        duration: shouldReduceMotion ? 0.2 : 0.5,
                    }}
                >
                    {fullPath && (
                        <motion.polyline
                            points={fullPath}
                            fill="none"
                            stroke={strokeColor}
                            strokeWidth="1.5"
                            initial={{ pathLength: 0 }}
                            animate={{ pathLength: 1 }}
                            transition={{
                                duration: shouldReduceMotion ? 0.3 : 0.8,
                                ease: "easeOut",
                                delay: 0.2,
                            }}
                        />
                    )}
                </motion.svg>
            </div>
        );
    };

    const containerVariants = {
        visible: {
            transition: {
                staggerChildren: 0.04,
                delayChildren: 0.1,
            },
        },
    };

    const rowVariants = {
        hidden: {
            opacity: 0,
            y: 20,
            scale: 0.98,
            filter: "blur(4px)",
        },
        visible: {
            opacity: 1,
            y: 0,
            scale: 1,
            filter: "blur(0px)",
            transition: {
                type: "spring" as const,
                stiffness: 400,
                damping: 25,
                mass: 0.7,
            },
        },
    };

    // Pad the users array with empty slots to always show maxRows
    const paddedUsers: (LeaderboardUser | null)[] = [...users];
    while (paddedUsers.length < maxRows) {
        paddedUsers.push(null);
    }

    const getInitials = (name: string) => {
        return name
            .replace(/[^A-Za-z]/g, "")
            .slice(0, 2)
            .toUpperCase() || "??";
    };

    return (
        <div className={`w-full ${className}`}>
            {/* Table Container */}
            <div className="bg-background border border-border/50 rounded-2xl overflow-hidden">
                {/* Desktop Table View */}
                <div className="hidden md:block overflow-x-auto">
                    <div className="min-w-[700px]">
                        {/* Table Headers */}
                        <div
                            className="px-6 py-3 text-xs font-medium text-muted-foreground/70 uppercase tracking-wide bg-muted/15 border-b border-border/20 text-left"
                            style={{
                                display: "grid",
                                gridTemplateColumns:
                                    "60px 200px 100px 80px 100px 140px",
                                columnGap: "12px",
                            }}
                        >
                            <div style={{ textAlign: "left" }}>Rank</div>
                            <div style={{ textAlign: "left" }}>User</div>
                            <div style={{ textAlign: "left" }}>Aura</div>
                            <div style={{ textAlign: "left" }}>Streak</div>
                            <div style={{ textAlign: "left" }}>Activity</div>
                            <div style={{ textAlign: "left" }} className="pr-4">
                                Daily Change
                            </div>
                        </div>

                        {/* Table Rows */}
                        <motion.div
                            variants={containerVariants}
                            initial="hidden"
                            animate="visible"
                        >
                            {paddedUsers.map((user, index) => (
                                <motion.div key={user?.id || `empty-${index}`} variants={rowVariants}>
                                    <div
                                        className={`px-6 py-3 group relative transition-all duration-200 ${user
                                            ? selectedUser === user.id
                                                ? "bg-muted/50 border-b border-border/30 cursor-pointer"
                                                : "hover:bg-muted/30 cursor-pointer"
                                            : "opacity-40"
                                            } ${index < paddedUsers.length - 1 ? "border-b border-border/20" : ""}`}
                                        style={{
                                            display: "grid",
                                            gridTemplateColumns:
                                                "60px 200px 100px 80px 100px 140px",
                                            columnGap: "12px",
                                        }}
                                        onClick={() => user && handleUserSelect(user.id)}
                                    >
                                        {/* Rank */}
                                        <div className="flex items-center gap-2">
                                            {user ? (
                                                <>
                                                    <div
                                                        className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-bold ${user.rank <= 3
                                                            ? `${getRankBgColor(user.rank)} text-white`
                                                            : "bg-muted text-foreground/70"
                                                            }`}
                                                    >
                                                        {user.rank <= 3 ? getRankIcon(user.rank) : user.rank}
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="w-8 h-8 rounded-full bg-muted/50 flex items-center justify-center text-sm text-muted-foreground/50">
                                                    {index + 1}
                                                </div>
                                            )}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex items-center gap-3">
                                            {user ? (
                                                <>
                                                    <Avatar className="h-10 w-10 border border-border/30">
                                                        {user.avatar ? (
                                                            <AvatarImage src={user.avatar} alt={user.name} />
                                                        ) : (
                                                            <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                {getInitials(user.name)}
                                                            </AvatarFallback>
                                                        )}
                                                    </Avatar>
                                                    <div className="min-w-0">
                                                        <div className="font-medium text-foreground/90 truncate">
                                                            {user.name}
                                                        </div>
                                                        <div className="text-xs text-muted-foreground/70">
                                                            Learner
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-10 w-10 rounded-full bg-muted/30 border border-dashed border-border/30" />
                                                    <div className="min-w-0">
                                                        <div className="h-4 w-24 bg-muted/30 rounded" />
                                                        <div className="h-3 w-16 bg-muted/20 rounded mt-1" />
                                                    </div>
                                                </>
                                            )}
                                        </div>

                                        {/* Aura Score */}
                                        <div className="flex items-center">
                                            {user ? (
                                                (() => {
                                                    const { bgColor, borderColor, textColor } =
                                                        getPerformanceColor(user.auraScore > 0 ? 1 : -1);
                                                    return (
                                                        <div
                                                            className={`px-2 py-1 rounded-lg text-xs font-medium border ${bgColor} ${borderColor} ${textColor}`}
                                                        >
                                                            {formatNumber(user.auraScore)}
                                                        </div>
                                                    );
                                                })()
                                            ) : (
                                                <div className="h-6 w-12 bg-muted/30 rounded" />
                                            )}
                                        </div>

                                        {/* Streak */}
                                        <div className="flex items-center gap-1">
                                            {user ? (
                                                <>
                                                    <Flame className="h-4 w-4 text-orange-500" />
                                                    <span className="font-semibold text-foreground/90 text-sm">
                                                        {user.streak}
                                                    </span>
                                                </>
                                            ) : (
                                                <div className="h-4 w-8 bg-muted/30 rounded" />
                                            )}
                                        </div>

                                        {/* Activity Chart */}
                                        <div className="flex items-center">
                                            {user && user.activityData.length > 0 ? (
                                                renderSparkline(user.activityData)
                                            ) : (
                                                <div className="h-5 w-14 bg-muted/20 rounded" />
                                            )}
                                        </div>

                                        {/* Daily Change */}
                                        <div className="flex items-center gap-2 pr-4">
                                            {user ? (
                                                <>
                                                    <span
                                                        className={`font-semibold text-sm ${getPerformanceColor(user.dailyChange).textColor
                                                            }`}
                                                    >
                                                        {user.dailyChange >= 0 ? "+" : ""}
                                                        {user.dailyChange}
                                                    </span>
                                                    {(() => {
                                                        const { bgColor, borderColor, textColor } =
                                                            getPerformanceColor(user.dailyChangePercent);
                                                        return (
                                                            <div
                                                                className={`px-2 py-1 rounded-lg text-xs font-medium border ${bgColor} ${borderColor} ${textColor}`}
                                                            >
                                                                {formatPercentage(user.dailyChangePercent)}
                                                            </div>
                                                        );
                                                    })()}
                                                </>
                                            ) : (
                                                <>
                                                    <div className="h-4 w-8 bg-muted/30 rounded" />
                                                    <div className="h-6 w-14 bg-muted/20 rounded" />
                                                </>
                                            )}
                                        </div>
                                    </div>
                                </motion.div>
                            ))}
                        </motion.div>
                    </div>
                </div>

                {/* Mobile Card View */}
                <div className="block md:hidden">
                    <div className="p-4 space-y-3">
                        {paddedUsers.length === 0 || paddedUsers.every(u => u === null) ? (
                            <div className="text-center text-muted-foreground py-8">
                                <p className="text-sm">No learners on the leaderboard yet</p>
                            </div>
                        ) : (
                            paddedUsers.map((user, index) => (
                                <motion.div
                                    key={user?.id || `mobile-empty-${index}`}
                                    variants={rowVariants}
                                    initial="hidden"
                                    animate="visible"
                                    className={`rounded-xl border border-border/30 p-4 ${user
                                        ? selectedUser === user.id
                                            ? "bg-muted/50"
                                            : "bg-background hover:bg-muted/30"
                                        : "opacity-40 bg-muted/10"
                                        }`}
                                    onClick={() => user && handleUserSelect(user.id)}
                                >
                                    <div className="flex items-center gap-3">
                                        {/* Rank */}
                                        <div
                                            className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold flex-shrink-0 ${user && user.rank <= 3
                                                    ? `${getRankBgColor(user?.rank || index + 1)} text-white`
                                                    : "bg-muted text-foreground/70"
                                                }`}
                                        >
                                            {user && user.rank <= 3 ? getRankIcon(user.rank) : (user?.rank || index + 1)}
                                        </div>

                                        {/* User Info */}
                                        <div className="flex-1 min-w-0">
                                            {user ? (
                                                <>
                                                    <div className="flex items-center gap-2">
                                                        <Avatar className="h-8 w-8 border border-border/30 flex-shrink-0">
                                                            {user.avatar ? (
                                                                <AvatarImage src={user.avatar} alt={user.name} />
                                                            ) : (
                                                                <AvatarFallback className="bg-primary/10 text-primary text-xs">
                                                                    {getInitials(user.name)}
                                                                </AvatarFallback>
                                                            )}
                                                        </Avatar>
                                                        <div className="min-w-0 flex-1">
                                                            <div className="font-medium text-foreground/90 truncate text-sm">
                                                                {user.name}
                                                            </div>
                                                        </div>
                                                    </div>
                                                </>
                                            ) : (
                                                <div className="flex items-center gap-2">
                                                    <div className="h-8 w-8 rounded-full bg-muted/30 border border-dashed border-border/30 flex-shrink-0" />
                                                    <div className="h-4 w-20 bg-muted/30 rounded" />
                                                </div>
                                            )}
                                        </div>

                                        {/* Score on Right */}
                                        {user && (
                                            <div className="text-right flex-shrink-0">
                                                <div className="text-sm font-semibold text-foreground/90">
                                                    {formatNumber(user.auraScore)} pts
                                                </div>
                                                <div className="flex items-center justify-end gap-1 text-xs text-muted-foreground">
                                                    <Flame className="h-3 w-3 text-orange-500" />
                                                    {user.streak} days
                                                </div>
                                            </div>
                                        )}
                                    </div>

                                    {/* Bottom Row: Activity & Change */}
                                    {user && (
                                        <div className="flex items-center justify-between mt-3 pt-3 border-t border-border/20">
                                            <div className="flex items-center gap-2">
                                                <span className="text-xs text-muted-foreground">Activity:</span>
                                                {user.activityData.length > 0 && renderSparkline(user.activityData)}
                                            </div>
                                            <div className="flex items-center gap-1">
                                                <span
                                                    className={`text-xs font-medium ${getPerformanceColor(user.dailyChange).textColor}`}
                                                >
                                                    {user.dailyChange >= 0 ? "+" : ""}{user.dailyChange}
                                                </span>
                                                <span
                                                    className={`text-xs px-1.5 py-0.5 rounded ${getPerformanceColor(user.dailyChangePercent).bgColor} ${getPerformanceColor(user.dailyChangePercent).textColor}`}
                                                >
                                                    {formatPercentage(user.dailyChangePercent)}
                                                </span>
                                            </div>
                                        </div>
                                    )}
                                </motion.div>
                            ))
                        )}
                    </div>
                </div>
            </div>
        </div>
    );
}

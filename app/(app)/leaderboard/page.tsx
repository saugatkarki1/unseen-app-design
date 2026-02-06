"use client"

import { useState } from "react"
import Link from "next/link"
import {
    Crown,
    Medal,
    Flame,
    Trophy,
    Star,
    ArrowLeft,
} from "lucide-react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { cn } from "@/lib/utils"
import SphereImageGrid, { ImageData } from "@/components/ui/img-sphere"
import { LeaderboardTable, LeaderboardUser } from "@/components/ui/leaderboard-table"

// Sample avatar images for the globe
const GLOBE_AVATARS: ImageData[] = [
    { id: "1", src: "https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?w=150&h=150&fit=crop&crop=face", alt: "User 1" },
    { id: "2", src: "https://images.unsplash.com/photo-1494790108377-be9c29b29330?w=150&h=150&fit=crop&crop=face", alt: "User 2" },
    { id: "3", src: "https://images.unsplash.com/photo-1500648767791-00dcc994a43e?w=150&h=150&fit=crop&crop=face", alt: "User 3" },
    { id: "4", src: "https://images.unsplash.com/photo-1534528741775-53994a69daeb?w=150&h=150&fit=crop&crop=face", alt: "User 4" },
    { id: "5", src: "https://images.unsplash.com/photo-1517841905240-472988babdf9?w=150&h=150&fit=crop&crop=face", alt: "User 5" },
    { id: "6", src: "https://images.unsplash.com/photo-1438761681033-6461ffad8d80?w=150&h=150&fit=crop&crop=face", alt: "User 6" },
    { id: "7", src: "https://images.unsplash.com/photo-1472099645785-5658abf4ff4e?w=150&h=150&fit=crop&crop=face", alt: "User 7" },
    { id: "8", src: "https://images.unsplash.com/photo-1544005313-94ddf0286df2?w=150&h=150&fit=crop&crop=face", alt: "User 8" },
    { id: "9", src: "https://images.unsplash.com/photo-1506794778202-cad84cf45f1d?w=150&h=150&fit=crop&crop=face", alt: "User 9" },
    { id: "10", src: "https://images.unsplash.com/photo-1531746020798-e6953c6e8e04?w=150&h=150&fit=crop&crop=face", alt: "User 10" },
    { id: "11", src: "https://images.unsplash.com/photo-1519345182560-3f2917c472ef?w=150&h=150&fit=crop&crop=face", alt: "User 11" },
    { id: "12", src: "https://images.unsplash.com/photo-1522075469751-3a6694fb2f61?w=150&h=150&fit=crop&crop=face", alt: "User 12" },
    { id: "13", src: "https://images.unsplash.com/photo-1560250097-0b93528c311a?w=150&h=150&fit=crop&crop=face", alt: "User 13" },
    { id: "14", src: "https://images.unsplash.com/photo-1573496359142-b8d87734a5a2?w=150&h=150&fit=crop&crop=face", alt: "User 14" },
    { id: "15", src: "https://images.unsplash.com/photo-1580489944761-15a19d654956?w=150&h=150&fit=crop&crop=face", alt: "User 15" },
    { id: "16", src: "https://images.unsplash.com/photo-1512484776495-a09d92e87c3b?w=150&h=150&fit=crop&crop=face", alt: "User 16" },
    { id: "17", src: "https://images.unsplash.com/photo-1519085360753-af0119f7cbe7?w=150&h=150&fit=crop&crop=face", alt: "User 17" },
    { id: "18", src: "https://images.unsplash.com/photo-1488426862026-3ee34a7d66df?w=150&h=150&fit=crop&crop=face", alt: "User 18" },
    { id: "19", src: "https://images.unsplash.com/photo-1496345875659-11f7dd282d1d?w=150&h=150&fit=crop&crop=face", alt: "User 19" },
    { id: "20", src: "https://images.unsplash.com/photo-1463453091185-61582044d556?w=150&h=150&fit=crop&crop=face", alt: "User 20" },
    { id: "21", src: "https://images.unsplash.com/photo-1521146764736-56c929d59c83?w=150&h=150&fit=crop&crop=face", alt: "User 21" },
    { id: "22", src: "https://images.unsplash.com/photo-1507591064344-4c6ce005b128?w=150&h=150&fit=crop&crop=face", alt: "User 22" },
    { id: "23", src: "https://images.unsplash.com/photo-1529626455594-4ff0802cfb7e?w=150&h=150&fit=crop&crop=face", alt: "User 23" },
    { id: "24", src: "https://images.unsplash.com/photo-1504257432389-52343af06ae3?w=150&h=150&fit=crop&crop=face", alt: "User 24" },
    { id: "25", src: "https://images.unsplash.com/photo-1504199367641-aba8151af406?w=150&h=150&fit=crop&crop=face", alt: "User 25" },
    { id: "26", src: "https://images.unsplash.com/photo-1523824921871-d6f1a15151f1?w=150&h=150&fit=crop&crop=face", alt: "User 26" },
    { id: "27", src: "https://images.unsplash.com/photo-1542327897-d73f4005b533?w=150&h=150&fit=crop&crop=face", alt: "User 27" },
    { id: "28", src: "https://images.unsplash.com/photo-1501196354995-cbb51c65aaea?w=150&h=150&fit=crop&crop=face", alt: "User 28" },
    { id: "29", src: "https://images.unsplash.com/photo-1485893226355-9a1c32a0c81e?w=150&h=150&fit=crop&crop=face", alt: "User 29" },
    { id: "30", src: "https://images.unsplash.com/photo-1511551203524-9a24350a5771?w=150&h=150&fit=crop&crop=face", alt: "User 30" },
]

export default function LeaderboardPage() {
    const { auraScore, currentStreak, publicAlias, profileImage } = useAppStore()

    const userRank: number | null = auraScore > 0 ? Math.max(1, Math.ceil(100 / Math.max(auraScore, 1))) : null
    const hasData = auraScore > 0

    const initials = (publicAlias ? publicAlias.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() : "UN") || "UN"

    // Generate leaderboard users - only show current user if they have data
    const leaderboardUsers: LeaderboardUser[] = hasData && userRank
        ? [{
            id: "current-user",
            rank: userRank,
            name: publicAlias || "You",
            avatar: profileImage || undefined,
            auraScore: auraScore,
            streak: currentStreak,
            activityData: [auraScore * 0.7, auraScore * 0.8, auraScore * 0.85, auraScore * 0.9, auraScore * 0.95, auraScore],
            dailyChange: Math.round(auraScore * 0.05),
            dailyChangePercent: 5.0,
        }]
        : []

    return (
        <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10 overflow-x-hidden">
            {/* Header */}
            <header className="mb-6 w-full flex-shrink-0 rounded-xl bg-gradient-to-r from-amber-500 to-yellow-500 px-4 py-4 text-white shadow-sm sm:px-6 sm:py-5">
                <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                    <div className="flex items-center gap-3">
                        <Link href="/profile" className="hover:opacity-80 transition-opacity">
                            <ArrowLeft className="h-5 w-5" />
                        </Link>
                        <div>
                            <h1 className="text-xl font-semibold sm:text-2xl flex items-center gap-2">
                                <Crown className="h-6 w-6" />
                                Global Leaderboard
                            </h1>
                            <p className="text-xs text-white/80 sm:text-sm">
                                Rankings based on Aura and consistency
                            </p>
                        </div>
                    </div>
                </div>
            </header>

            {/* Main Content Grid */}
            <div className="grid gap-6 lg:grid-cols-2 lg:gap-8">
                {/* LEFT: Globe Section */}
                <section className="rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6 flex flex-col items-center">
                    <h2 className="text-lg font-semibold mb-4 text-center">Our Community</h2>
                    <p className="text-sm text-muted-foreground text-center mb-6">
                        Learners from around the world building their skills
                    </p>

                    {/* 3D Sphere Globe - Responsive */}
                    <div className="flex justify-center w-full max-w-full overflow-hidden">
                        <div className="hidden sm:block">
                            <SphereImageGrid
                                images={GLOBE_AVATARS}
                                containerSize={400}
                                sphereRadius={160}
                                dragSensitivity={0.6}
                                momentumDecay={0.96}
                                maxRotationSpeed={5}
                                baseImageScale={0.14}
                                hoverScale={1.3}
                                perspective={1000}
                                autoRotate={true}
                                autoRotateSpeed={0.2}
                            />
                        </div>
                        <div className="block sm:hidden">
                            <SphereImageGrid
                                images={GLOBE_AVATARS}
                                containerSize={280}
                                sphereRadius={110}
                                dragSensitivity={0.6}
                                momentumDecay={0.96}
                                maxRotationSpeed={5}
                                baseImageScale={0.14}
                                hoverScale={1.3}
                                perspective={800}
                                autoRotate={true}
                                autoRotateSpeed={0.2}
                            />
                        </div>
                    </div>

                    <p className="text-xs text-muted-foreground text-center mt-4">
                        Drag to rotate · Click to view profile
                    </p>
                </section>

                {/* RIGHT: Rankings */}
                <section className="space-y-6">
                    {/* Your Position */}
                    {hasData && (
                        <Card className="bg-gradient-to-br from-primary/10 to-primary/5 border-primary/20">
                            <CardContent className="py-6">
                                <div className="flex items-center gap-4">
                                    <div className="relative">
                                        <Avatar className="h-14 w-14 border-2 border-white shadow-md">
                                            {profileImage ? (
                                                <AvatarImage src={profileImage} alt="Profile" />
                                            ) : (
                                                <AvatarFallback className="bg-primary text-white">{initials}</AvatarFallback>
                                            )}
                                        </Avatar>
                                        {userRank && userRank <= 4 && (
                                            <div className="absolute -top-1 -right-1 h-6 w-6 rounded-full bg-gradient-to-br from-yellow-400 to-amber-500 flex items-center justify-center text-white text-[10px] font-bold shadow border border-white">
                                                #{userRank}
                                            </div>
                                        )}
                                    </div>
                                    <div className="flex-1">
                                        <p className="text-xs text-muted-foreground uppercase tracking-wider">Your Position</p>
                                        <p className="text-lg font-semibold">{publicAlias || "You"}</p>
                                        <div className="flex items-center gap-3 text-sm text-muted-foreground mt-0.5">
                                            <span className="flex items-center gap-1">
                                                <Star className="h-4 w-4 text-yellow-500" />
                                                {auraScore} pts
                                            </span>
                                            <span className="flex items-center gap-1">
                                                <Flame className="h-4 w-4 text-orange-500" />
                                                {currentStreak} day streak
                                            </span>
                                        </div>
                                    </div>
                                    <div className="text-right">
                                        <p className="text-4xl font-bold text-primary">#{userRank || "—"}</p>
                                        <p className="text-xs text-muted-foreground">Global Rank</p>
                                    </div>
                                </div>
                            </CardContent>
                        </Card>
                    )}

                    {/* How Rankings Work */}
                    <Card className="bg-card">
                        <CardHeader>
                            <CardTitle className="text-sm font-medium text-muted-foreground">How Rankings Work</CardTitle>
                        </CardHeader>
                        <CardContent>
                            <div className="grid gap-4 sm:grid-cols-3">
                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                    <Flame className="h-6 w-6 mx-auto text-orange-500 mb-2" />
                                    <p className="text-sm font-medium">Consistency</p>
                                    <p className="text-xs text-muted-foreground mt-1">Daily rituals build score</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                    <Star className="h-6 w-6 mx-auto text-yellow-500 mb-2" />
                                    <p className="text-sm font-medium">Depth</p>
                                    <p className="text-xs text-muted-foreground mt-1">Deep work earns more</p>
                                </div>
                                <div className="text-center p-4 rounded-lg bg-muted/50">
                                    <Trophy className="h-6 w-6 mx-auto text-primary mb-2" />
                                    <p className="text-sm font-medium">Proof</p>
                                    <p className="text-xs text-muted-foreground mt-1">Submissions boost rank</p>
                                </div>
                            </div>
                        </CardContent>
                    </Card>

                </section>
            </div>

            {/* Leaderboard Table - Full Width */}
            <section className="mt-8">
                <LeaderboardTable
                    users={leaderboardUsers}
                    maxRows={10}
                    onUserSelect={() => { }}
                />
                <p className="text-xs text-muted-foreground text-center mt-4">
                    More learners will appear as the community grows
                </p>
            </section>
        </div>
    )
}

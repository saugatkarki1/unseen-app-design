"use client"

// components/ui/mentor-card.tsx
// ============================================================================
// MENTOR CARD COMPONENT
// ============================================================================
// Displays the assigned mentor with avatar, name, bio, and specializations.
// ============================================================================

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Badge } from "@/components/ui/badge"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Calendar, MessageCircle, User } from "lucide-react"
import type { Mentor } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

interface MentorCardProps {
    mentor: Mentor
    assignedAt?: string | null
    assignmentReason?: string | null
    showActions?: boolean
    compact?: boolean
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

function getInitials(name: string): string {
    return name
        .split(" ")
        .map(part => part[0])
        .join("")
        .toUpperCase()
        .slice(0, 2)
}

function formatDate(dateStr: string | null): string {
    if (!dateStr) return ""
    return new Date(dateStr).toLocaleDateString("en-US", {
        month: "short",
        day: "numeric",
        year: "numeric",
    })
}

// ============================================================================
// COMPONENT
// ============================================================================

export function MentorCard({
    mentor,
    assignedAt,
    showActions = true,
    compact = false,
}: MentorCardProps) {
    if (compact) {
        return (
            <div className="flex items-center gap-3 p-3 rounded-lg bg-card border">
                <Avatar className="h-10 w-10">
                    <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.name} />
                    <AvatarFallback className="bg-primary/10 text-primary">
                        {getInitials(mentor.name)}
                    </AvatarFallback>
                </Avatar>
                <div className="flex-1 min-w-0">
                    <p className="font-medium text-sm truncate">{mentor.name}</p>
                    <p className="text-xs text-muted-foreground truncate">
                        {mentor.specializations.slice(0, 2).join(", ")}
                    </p>
                </div>
            </div>
        )
    }

    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <Avatar className="h-14 w-14 border-2 border-primary/20">
                        <AvatarImage src={mentor.avatar_url || undefined} alt={mentor.name} />
                        <AvatarFallback className="bg-gradient-to-br from-primary/20 to-primary/5 text-primary text-lg">
                            {getInitials(mentor.name)}
                        </AvatarFallback>
                    </Avatar>
                    <div className="flex-1 min-w-0">
                        <CardTitle className="text-lg">{mentor.name}</CardTitle>
                        <p className="text-sm text-muted-foreground">
                            {assignedAt && `Your mentor since ${formatDate(assignedAt)}`}
                        </p>
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                {/* Bio */}
                {mentor.bio && (
                    <p className="text-sm text-muted-foreground line-clamp-3">
                        {mentor.bio}
                    </p>
                )}

                {/* Specializations */}
                <div className="flex flex-wrap gap-1.5">
                    {mentor.specializations.map((spec) => (
                        <Badge
                            key={spec}
                            variant="secondary"
                            className="text-xs bg-primary/10 text-primary hover:bg-primary/15"
                        >
                            {spec}
                        </Badge>
                    ))}
                </div>

                {/* Actions */}
                {showActions && (
                    <div className="flex gap-2 pt-2">
                        <Button variant="outline" size="sm" className="flex-1">
                            <User className="h-4 w-4 mr-1.5" />
                            Profile
                        </Button>
                        <Button variant="outline" size="sm" className="flex-1">
                            <MessageCircle className="h-4 w-4 mr-1.5" />
                            Message
                        </Button>
                        <Button size="sm" className="flex-1">
                            <Calendar className="h-4 w-4 mr-1.5" />
                            Schedule
                        </Button>
                    </div>
                )}
            </CardContent>
        </Card>
    )
}

// ============================================================================
// SKELETON
// ============================================================================

export function MentorCardSkeleton() {
    return (
        <Card className="overflow-hidden">
            <CardHeader className="pb-3">
                <div className="flex items-center gap-3">
                    <div className="h-14 w-14 rounded-full bg-muted animate-pulse" />
                    <div className="flex-1 space-y-2">
                        <div className="h-5 w-32 bg-muted rounded animate-pulse" />
                        <div className="h-4 w-48 bg-muted rounded animate-pulse" />
                    </div>
                </div>
            </CardHeader>
            <CardContent className="space-y-4">
                <div className="space-y-2">
                    <div className="h-4 w-full bg-muted rounded animate-pulse" />
                    <div className="h-4 w-3/4 bg-muted rounded animate-pulse" />
                </div>
                <div className="flex gap-1.5">
                    <div className="h-5 w-20 bg-muted rounded animate-pulse" />
                    <div className="h-5 w-24 bg-muted rounded animate-pulse" />
                </div>
            </CardContent>
        </Card>
    )
}

// ============================================================================
// EMPTY STATE
// ============================================================================

export function NoMentorAssigned() {
    return (
        <Card className="overflow-hidden border-dashed">
            <CardContent className="flex flex-col items-center justify-center py-8 text-center">
                <div className="h-12 w-12 rounded-full bg-muted flex items-center justify-center mb-3">
                    <User className="h-6 w-6 text-muted-foreground" />
                </div>
                <p className="text-sm font-medium">No mentor assigned yet</p>
                <p className="text-xs text-muted-foreground mt-1">
                    Complete your onboarding to get matched with a mentor
                </p>
            </CardContent>
        </Card>
    )
}

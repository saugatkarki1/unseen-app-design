"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import { GraduationCap, Users } from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { updateUserRole, type Role } from "@/lib/role"
import { cn } from "@/lib/utils"

/**
 * Role Selection Page
 * 
 * Full-page UI for new users to select their role (Student or Mentor).
 * This page blocks access to the dashboard until a role is selected.
 */
export default function RoleSelectionPage() {
    const router = useRouter()
    const [selectedRole, setSelectedRole] = useState<Role | null>(null)
    const [isSubmitting, setIsSubmitting] = useState(false)
    const [error, setError] = useState<string | null>(null)

    const handleRoleSelect = (role: Role) => {
        setSelectedRole(role)
        setError(null)
    }

    const handleContinue = async () => {
        if (!selectedRole) return

        setIsSubmitting(true)
        setError(null)

        try {
            const success = await updateUserRole(supabase, selectedRole)

            if (success) {
                router.replace("/dashboard")
            } else {
                setError("Failed to save your role. Please try again.")
            }
        } catch (err) {
            console.error("Role selection error:", err)
            setError("An unexpected error occurred. Please try again.")
        } finally {
            setIsSubmitting(false)
        }
    }

    return (
        <div className="min-h-screen flex flex-col items-center justify-center bg-background px-4 py-12">
            {/* Header */}
            <div className="text-center mb-10 max-w-md">
                <h1 className="text-3xl font-bold tracking-tight text-foreground mb-3">
                    Choose Your Role
                </h1>
                <p className="text-muted-foreground">
                    How would you like to use this platform? You can change this later in settings.
                </p>
            </div>

            {/* Role Cards */}
            <div className="flex flex-col sm:flex-row gap-4 sm:gap-6 w-full max-w-2xl mb-8">
                {/* Student Card */}
                <button
                    type="button"
                    onClick={() => handleRoleSelect("student")}
                    disabled={isSubmitting}
                    className={cn(
                        "flex-1 p-6 rounded-xl border-2 transition-all duration-200",
                        "hover:border-primary/50 hover:bg-secondary/30",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedRole === "student"
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-border bg-card"
                    )}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div
                            className={cn(
                                "p-4 rounded-full transition-colors",
                                selectedRole === "student"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-muted-foreground"
                            )}
                        >
                            <GraduationCap className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Student
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Learn, practice, and track your progress
                            </p>
                        </div>
                    </div>
                </button>

                {/* Mentor Card */}
                <button
                    type="button"
                    onClick={() => handleRoleSelect("mentor")}
                    disabled={isSubmitting}
                    className={cn(
                        "flex-1 p-6 rounded-xl border-2 transition-all duration-200",
                        "hover:border-primary/50 hover:bg-secondary/30",
                        "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                        "disabled:opacity-50 disabled:cursor-not-allowed",
                        selectedRole === "mentor"
                            ? "border-primary bg-primary/5 shadow-lg"
                            : "border-border bg-card"
                    )}
                >
                    <div className="flex flex-col items-center text-center gap-4">
                        <div
                            className={cn(
                                "p-4 rounded-full transition-colors",
                                selectedRole === "mentor"
                                    ? "bg-primary/10 text-primary"
                                    : "bg-secondary text-muted-foreground"
                            )}
                        >
                            <Users className="h-8 w-8" />
                        </div>
                        <div>
                            <h2 className="text-xl font-semibold text-foreground mb-2">
                                Mentor
                            </h2>
                            <p className="text-sm text-muted-foreground">
                                Guide others and share your expertise
                            </p>
                        </div>
                    </div>
                </button>
            </div>

            {/* Error Message */}
            {error && (
                <div className="mb-6 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm max-w-md text-center">
                    {error}
                </div>
            )}

            {/* Continue Button */}
            <button
                type="button"
                onClick={handleContinue}
                disabled={!selectedRole || isSubmitting}
                className={cn(
                    "px-8 py-3 rounded-lg font-medium text-base transition-all duration-200",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    selectedRole
                        ? "bg-primary text-primary-foreground hover:bg-primary/90 shadow-md"
                        : "bg-secondary text-muted-foreground cursor-not-allowed"
                )}
            >
                {isSubmitting ? (
                    <span className="flex items-center gap-2">
                        <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                        Saving...
                    </span>
                ) : (
                    "Continue"
                )}
            </button>

            {/* Footer Note */}
            <p className="mt-8 text-xs text-muted-foreground max-w-sm text-center">
                Your role determines your initial experience. All core features remain accessible regardless of your choice.
            </p>
        </div>
    )
}

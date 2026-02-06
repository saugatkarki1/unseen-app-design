"use client"

import { useState, useEffect } from "react"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { useAppStore } from "@/lib/store"
import { supabase } from "@/lib/supabaseClient"
import { fetchUserRoleStatus, updateUserRole, type Role } from "@/lib/role"
import { GraduationCap, Users, Check } from "lucide-react"
import { cn } from "@/lib/utils"

export default function SettingsPage() {
  const { userEmail, publicAlias, userName } = useAppStore()

  const [authProfile, setAuthProfile] = useState<{ fullName: string; email: string } | null>(null)
  const [currentRole, setCurrentRole] = useState<Role | null>(null)
  const [isRoleLoading, setIsRoleLoading] = useState(true)
  const [isRoleSaving, setIsRoleSaving] = useState(false)
  const [roleError, setRoleError] = useState<string | null>(null)
  const [roleSuccess, setRoleSuccess] = useState<string | null>(null)

  useEffect(() => {
    const fetchUser = async () => {
      const { data: { user } } = await supabase.auth.getUser()
      if (user) {
        setAuthProfile({
          fullName: user.user_metadata.full_name || "",
          email: user.email || "",
        })
      }
    }
    fetchUser()
  }, [])

  // Fetch current role
  useEffect(() => {
    const fetchRole = async () => {
      setIsRoleLoading(true)
      const status = await fetchUserRoleStatus(supabase)
      if (status) {
        setCurrentRole(status.role)
      }
      setIsRoleLoading(false)
    }
    fetchRole()
  }, [])

  // Use authenticated user data as source of truth, fallback to store
  const displayEmail = authProfile?.email || userEmail || ""
  const displayName = authProfile?.fullName || userName || ""

  const [currentPassword, setCurrentPassword] = useState("")
  const [newPassword, setNewPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [success, setSuccess] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setSuccess("")

    if (!currentPassword || !newPassword || !confirmPassword) {
      setError("All fields are required.")
      return
    }

    if (newPassword !== confirmPassword) {
      setError("New password and confirmation do not match.")
      return
    }

    setIsSubmitting(true)
    await new Promise((resolve) => setTimeout(resolve, 300))
    setIsSubmitting(false)

    setCurrentPassword("")
    setNewPassword("")
    setConfirmPassword("")
    setSuccess("Password updated (placeholder only, no backend yet).")
  }

  const handleRoleSwitch = async (newRole: Role) => {
    if (newRole === currentRole || isRoleSaving) return

    setIsRoleSaving(true)
    setRoleError(null)
    setRoleSuccess(null)

    const success = await updateUserRole(supabase, newRole)

    if (success) {
      setCurrentRole(newRole)
      setRoleSuccess(`Role changed to ${newRole === "student" ? "Student" : "Mentor"}`)
      // Clear success message after 3 seconds
      setTimeout(() => setRoleSuccess(null), 3000)
    } else {
      setRoleError("Failed to update role. Please try again.")
    }

    setIsRoleSaving(false)
  }

  const accountId = publicAlias || displayName || ""

  return (
    <div className="space-y-8">
      <div>
        <h1 className="text-2xl font-semibold tracking-tight">Settings</h1>
        <p className="mt-2 text-muted-foreground">Basic account controls. Advanced options will appear here in the future.</p>
      </div>

      {/* Role Selection */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Your Role</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {isRoleLoading ? (
            <div className="flex items-center gap-2 text-muted-foreground">
              <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
              Loading...
            </div>
          ) : (
            <>
              <div className="flex flex-col sm:flex-row gap-3">
                {/* Student Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("student")}
                  disabled={isRoleSaving}
                  className={cn(
                    "flex-1 p-4 rounded-lg border-2 transition-all duration-200",
                    "hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    currentRole === "student"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-secondary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        currentRole === "student"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <GraduationCap className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-foreground">Student</p>
                      <p className="text-xs text-muted-foreground">Learn and practice</p>
                    </div>
                    {currentRole === "student" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>

                {/* Mentor Option */}
                <button
                  type="button"
                  onClick={() => handleRoleSwitch("mentor")}
                  disabled={isRoleSaving}
                  className={cn(
                    "flex-1 p-4 rounded-lg border-2 transition-all duration-200",
                    "hover:border-primary/50 disabled:opacity-50 disabled:cursor-not-allowed",
                    currentRole === "mentor"
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card hover:bg-secondary/30"
                  )}
                >
                  <div className="flex items-center gap-3">
                    <div
                      className={cn(
                        "p-2 rounded-full",
                        currentRole === "mentor"
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <Users className="h-5 w-5" />
                    </div>
                    <div className="text-left flex-1">
                      <p className="font-medium text-foreground">Mentor</p>
                      <p className="text-xs text-muted-foreground">Guide others</p>
                    </div>
                    {currentRole === "mentor" && (
                      <Check className="h-5 w-5 text-primary" />
                    )}
                  </div>
                </button>
              </div>

              {roleError && (
                <p className="text-sm text-destructive">{roleError}</p>
              )}
              {roleSuccess && (
                <p className="text-sm text-success">{roleSuccess}</p>
              )}

              {isRoleSaving && (
                <div className="flex items-center gap-2 text-muted-foreground text-sm">
                  <span className="h-3 w-3 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Updating role...
                </div>
              )}
            </>
          )}
        </CardContent>
      </Card>

      {/* Change Password */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Change Password</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="current-password">Current password</Label>
              <Input
                id="current-password"
                type="password"
                value={currentPassword}
                onChange={(e) => setCurrentPassword(e.target.value)}
                autoComplete="current-password"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="new-password">New password</Label>
              <Input
                id="new-password"
                type="password"
                value={newPassword}
                onChange={(e) => setNewPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-password">Confirm new password</Label>
              <Input
                id="confirm-password"
                type="password"
                value={confirmPassword}
                onChange={(e) => setConfirmPassword(e.target.value)}
                autoComplete="new-password"
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {success && <p className="text-sm text-success">{success}</p>}
            <Button type="submit" disabled={isSubmitting} className="mt-2">
              {isSubmitting ? "Updating..." : "Update Password"}
            </Button>
          </form>
        </CardContent>
      </Card>

      {/* Account Info (read-only) */}
      <Card>
        <CardHeader>
          <CardTitle className="text-sm font-medium text-muted-foreground">Account Info</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <p className="text-xs text-muted-foreground mb-1">Email</p>
            <p className="text-sm font-medium">{displayEmail}</p>
          </div>
          <div>
            <p className="text-xs text-muted-foreground mb-1">Account ID</p>
            <p className="text-sm font-medium break-all">{accountId}</p>
          </div>
        </CardContent>
      </Card>
    </div>
  )
}

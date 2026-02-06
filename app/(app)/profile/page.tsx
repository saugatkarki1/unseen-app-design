"use client"

// app/(app)/profile/page.tsx
// ============================================================================
// USER PROFILE PAGE
// ============================================================================
// Displays and allows editing of user profile information.
// ============================================================================

import { useState, useEffect, useRef, type ChangeEvent } from "react"
import {
  Calendar,
  Edit3,
  Check,
  X,
  User,
  Building2,
  GraduationCap,
  Target,
  Clock,
  Lightbulb,
  TrendingUp,
  AtSign,
  Save,
  Loader2,
  Camera,
  Mail,
  Lock,
  Image,
  Palette,
  Upload,
  BookOpen,
  Sparkles,
} from "lucide-react"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Textarea } from "@/components/ui/textarea"
import { supabase } from "@/lib/supabaseClient"
import { updateProfile, type UpdateProfileInput } from "./actions"
import { cn } from "@/lib/utils"

// ============================================================================
// TYPES
// ============================================================================

interface ProfileData {
  id: string
  username: string | null
  full_name: string | null
  preferred_name: string | null
  bio: string | null
  avatar_url: string | null
  role: string
  institution: string | null
  current_skill_level: string | null
  time_commitment: string | null
  motivation_type: string | null
  inferred_skill_domain: string | null
  inferred_skill_level: string | null
  normalized_learning_goal: string | null
  cover_image_url: string | null
  cover_color: string | null
  created_at: string | null
  // Note: email comes from auth session, not profiles table
  email?: string | null
}

// ============================================================================
// HELPER FUNCTIONS
// ============================================================================

const getSkillLevelLabel = (level: string | null): string => {
  if (!level) return "Not set"
  const labels: Record<string, string> = {
    beginner: "Beginner",
    intermediate: "Intermediate",
    advanced: "Advanced",
  }
  return labels[level] || level
}

const getTimeCommitmentLabel = (commitment: string | null): string => {
  if (!commitment) return "Not set"
  const labels: Record<string, string> = {
    casual: "Casual",
    regular: "Regular",
    intensive: "Intensive",
  }
  return labels[commitment] || commitment
}

const getMotivationLabel = (motivation: string | null): string => {
  if (!motivation) return "Not set"
  const labels: Record<string, string> = {
    career: "Career Growth",
    curiosity: "Curiosity",
    project: "Build a Project",
    other: "Other",
  }
  return labels[motivation] || motivation
}

const getRoleLabel = (role: string | null): string => {
  if (!role) return "Not set"
  return role === "student" ? "Student" : role === "mentor" ? "Mentor" : role
}

const formatJoinDate = (date: string | null): string => {
  if (!date) return "Unknown"
  return new Date(date).toLocaleDateString("en-US", {
    year: "numeric",
    month: "long",
    day: "numeric",
  })
}

const getInitials = (name: string | null, email: string | null): string => {
  if (name) {
    const parts = name.split(" ").filter(Boolean)
    if (parts.length >= 2) {
      return (parts[0][0] + parts[1][0]).toUpperCase()
    }
    return name.slice(0, 2).toUpperCase()
  }
  if (email) {
    const localPart = email.split("@")[0]
    return localPart.slice(0, 2).toUpperCase()
  }
  return "UN"
}

// ============================================================================
// SKILL LEVEL OPTIONS
// ============================================================================

const skillLevelOptions = [
  { value: "beginner", label: "Beginner" },
  { value: "intermediate", label: "Intermediate" },
  { value: "advanced", label: "Advanced" },
]

const timeCommitmentOptions = [
  { value: "casual", label: "Casual" },
  { value: "regular", label: "Regular" },
  { value: "intensive", label: "Intensive" },
]

const motivationOptions = [
  { value: "career", label: "Career Growth" },
  { value: "curiosity", label: "Curiosity" },
  { value: "project", label: "Build a Project" },
  { value: "other", label: "Other" },
]

const roleOptions = [
  { value: "student", label: "Student" },
  { value: "mentor", label: "Mentor" },
]

// Cover color preset options
const coverColorPresets = [
  { value: "#1e293b", label: "Slate" },
  { value: "#7c3aed", label: "Violet" },
  { value: "#2563eb", label: "Blue" },
  { value: "#059669", label: "Emerald" },
  { value: "#d97706", label: "Amber" },
  { value: "#dc2626", label: "Red" },
  { value: "#0891b2", label: "Cyan" },
  { value: "#7c2d12", label: "Brown" },
]

// ============================================================================
// COMPONENT
// ============================================================================

export default function ProfilePage() {
  // State
  const [profile, setProfile] = useState<ProfileData | null>(null)
  const [isLoading, setIsLoading] = useState(true)
  const [isEditing, setIsEditing] = useState(false)
  const [isSaving, setIsSaving] = useState(false)
  const [saveError, setSaveError] = useState<string | null>(null)
  const [saveSuccess, setSaveSuccess] = useState(false)

  // Editable field states
  const [editFullName, setEditFullName] = useState("")
  const [editPreferredName, setEditPreferredName] = useState("")
  const [editBio, setEditBio] = useState("")
  const [editAvatarUrl, setEditAvatarUrl] = useState("")
  const [editInstitution, setEditInstitution] = useState("")
  const [editSkillLevel, setEditSkillLevel] = useState<string | null>(null)
  const [editTimeCommitment, setEditTimeCommitment] = useState<string | null>(null)
  const [editMotivation, setEditMotivation] = useState<string | null>(null)
  const [editRole, setEditRole] = useState<string>("student")
  const [editCoverImageUrl, setEditCoverImageUrl] = useState<string | null>(null)
  const [editCoverColor, setEditCoverColor] = useState<string>("#1e293b")

  const fileInputRef = useRef<HTMLInputElement>(null)
  const coverFileInputRef = useRef<HTMLInputElement>(null)

  // Fetch profile on mount
  useEffect(() => {
    const fetchProfile = async () => {
      setIsLoading(true)
      const { data: { user } } = await supabase.auth.getUser()

      if (!user) {
        setIsLoading(false)
        return
      }

      const { data, error } = await supabase
        .from("profiles")
        .select(`
          id,
          username,
          full_name,
          preferred_name,
          bio,
          avatar_url,
          role,
          institution,
          current_skill_level,
          time_commitment,
          motivation_type,
          inferred_skill_domain,
          inferred_skill_level,
          normalized_learning_goal,
          cover_image_url,
          cover_color,
          created_at
        `)
        .eq("id", user.id)
        .single()

      if (error) {
        console.error("Error fetching profile:", error.message || error)
      } else if (data) {
        // Add email from auth user to profile data
        const profileData = data as Record<string, unknown>
        setProfile({
          id: profileData.id as string,
          username: profileData.username as string | null,
          full_name: profileData.full_name as string | null,
          preferred_name: profileData.preferred_name as string | null,
          bio: profileData.bio as string | null,
          avatar_url: profileData.avatar_url as string | null,
          role: profileData.role as string || "student",
          institution: profileData.institution as string | null,
          current_skill_level: profileData.current_skill_level as string | null,
          time_commitment: profileData.time_commitment as string | null,
          motivation_type: profileData.motivation_type as string | null,
          inferred_skill_domain: profileData.inferred_skill_domain as string | null,
          inferred_skill_level: profileData.inferred_skill_level as string | null,
          normalized_learning_goal: profileData.normalized_learning_goal as string | null,
          cover_image_url: profileData.cover_image_url as string | null,
          cover_color: profileData.cover_color as string | null,
          created_at: profileData.created_at as string | null,
          email: user.email || null,
        })
        // Initialize edit states
        setEditFullName((profileData.full_name as string) || "")
        setEditPreferredName((profileData.preferred_name as string) || "")
        setEditBio((profileData.bio as string) || "")
        setEditAvatarUrl((profileData.avatar_url as string) || "")
        setEditInstitution((profileData.institution as string) || "")
        setEditSkillLevel(profileData.current_skill_level as string | null)
        setEditTimeCommitment(profileData.time_commitment as string | null)
        setEditMotivation(profileData.motivation_type as string | null)
        setEditRole((profileData.role as string) || "student")
        setEditCoverImageUrl(profileData.cover_image_url as string | null)
        setEditCoverColor((profileData.cover_color as string) || "#1e293b")
      }

      setIsLoading(false)
    }

    fetchProfile()
  }, [])

  // Start editing
  const handleStartEdit = () => {
    setSaveError(null)
    setSaveSuccess(false)
    setIsEditing(true)
  }

  // Cancel editing
  const handleCancelEdit = () => {
    // Reset to original values
    if (profile) {
      setEditFullName(profile.full_name || "")
      setEditPreferredName(profile.preferred_name || "")
      setEditBio(profile.bio || "")
      setEditAvatarUrl(profile.avatar_url || "")
      setEditInstitution(profile.institution || "")
      setEditSkillLevel(profile.current_skill_level)
      setEditTimeCommitment(profile.time_commitment)
      setEditMotivation(profile.motivation_type)
      setEditRole(profile.role || "student")
      setEditCoverImageUrl(profile.cover_image_url)
      setEditCoverColor(profile.cover_color || "#1e293b")
    }
    setIsEditing(false)
    setSaveError(null)
  }

  // Save changes
  const handleSave = async () => {
    if (!profile) return

    setIsSaving(true)
    setSaveError(null)
    setSaveSuccess(false)

    const input: UpdateProfileInput = {
      full_name: editFullName,
      preferred_name: editPreferredName,
      bio: editBio,
      avatar_url: editAvatarUrl,
      institution: editInstitution,
      current_skill_level: editSkillLevel as "beginner" | "intermediate" | "advanced" | null,
      time_commitment: editTimeCommitment as "casual" | "regular" | "intensive" | null,
      motivation_type: editMotivation as "career" | "curiosity" | "project" | "other" | null,
      role: editRole as "student" | "mentor",
      cover_image_url: editCoverImageUrl,
      cover_color: editCoverColor,
    }

    const result = await updateProfile(input)

    setIsSaving(false)

    if (result.success) {
      // Update local profile state
      setProfile({
        ...profile,
        full_name: editFullName || null,
        preferred_name: editPreferredName || null,
        bio: editBio || null,
        avatar_url: editAvatarUrl || null,
        institution: editInstitution || null,
        current_skill_level: editSkillLevel,
        time_commitment: editTimeCommitment,
        motivation_type: editMotivation,
        role: editRole,
        cover_image_url: editCoverImageUrl,
        cover_color: editCoverColor,
      })
      setSaveSuccess(true)
      setIsEditing(false)

      // Clear success message after 3 seconds
      setTimeout(() => setSaveSuccess(false), 3000)
    } else {
      setSaveError(result.error || "Failed to save changes")
    }
  }

  // Loading state
  if (isLoading) {
    return (
      <div className="flex items-center justify-center min-h-[50vh]">
        <Loader2 className="h-8 w-8 animate-spin text-primary" />
      </div>
    )
  }

  // No profile found
  if (!profile) {
    return (
      <div className="flex flex-col items-center justify-center min-h-[50vh] gap-4">
        <p className="text-muted-foreground">Profile not found</p>
      </div>
    )
  }

  // Computed values
  const displayName = profile.full_name || profile.email?.split("@")[0] || "Anonymous"
  const initials = getInitials(profile.full_name, profile.email ?? null)

  return (
    <div className="flex w-full min-h-screen max-w-4xl mx-auto flex-col px-4 py-6 md:px-6 md:py-8">
      {/* HEADER */}
      <header
        className="relative w-full flex-shrink-0 rounded-xl overflow-hidden shadow-lg"
        style={{
          backgroundColor: (isEditing ? editCoverColor : profile.cover_color) || '#1e293b',
          backgroundImage: (isEditing ? editCoverImageUrl : profile.cover_image_url)
            ? `url(${isEditing ? editCoverImageUrl : profile.cover_image_url})`
            : undefined,
          backgroundSize: 'cover',
          backgroundPosition: 'center',
        }}
      >
        {/* Overlay for text readability */}
        <div className="absolute inset-0 bg-black/30" />

        <div className="relative z-10 flex flex-col sm:flex-row items-center gap-6 px-6 py-8">
          {/* Avatar */}
          <div className="relative">
            <Avatar className="h-24 w-24 ring-4 ring-white/20">
              <AvatarImage src={isEditing ? editAvatarUrl : profile.avatar_url || undefined} />
              <AvatarFallback className="text-2xl font-bold bg-primary-foreground/20 text-primary-foreground">
                {initials}
              </AvatarFallback>
            </Avatar>
            {isEditing && (
              <button
                onClick={() => fileInputRef.current?.click()}
                className="absolute bottom-0 right-0 p-1.5 rounded-full bg-background/90 text-foreground hover:bg-background transition-colors"
              >
                <Camera className="h-4 w-4" />
              </button>
            )}
          </div>

          {/* Name & Username */}
          <div className="text-center sm:text-left text-white flex-1">
            <h1 className="text-2xl font-bold">{displayName}</h1>
            {profile.username && (
              <p className="text-white/70 flex items-center justify-center sm:justify-start gap-1 mt-1">
                <AtSign className="h-4 w-4" />
                {profile.username}
              </p>
            )}
            <p className="text-white/60 text-sm mt-2 flex items-center justify-center sm:justify-start gap-1">
              <Calendar className="h-4 w-4" />
              Joined {formatJoinDate(profile.created_at)}
            </p>
          </div>

          {/* Edit Button */}
          <div className="flex gap-2">
            {isEditing ? (
              <>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleCancelEdit}
                  disabled={isSaving}
                  className="bg-white/10 border-white/20 text-white hover:bg-white/20"
                >
                  <X className="h-4 w-4 mr-1" />
                  Cancel
                </Button>
                <Button
                  size="sm"
                  onClick={handleSave}
                  disabled={isSaving}
                  className="bg-white text-primary hover:bg-white/90"
                >
                  {isSaving ? (
                    <Loader2 className="h-4 w-4 mr-1 animate-spin" />
                  ) : (
                    <Save className="h-4 w-4 mr-1" />
                  )}
                  Save
                </Button>
              </>
            ) : (
              <Button
                variant="outline"
                size="sm"
                onClick={handleStartEdit}
                className="bg-white/10 border-white/20 text-white hover:bg-white/20"
              >
                <Edit3 className="h-4 w-4 mr-1" />
                Edit Profile
              </Button>
            )}
          </div>
        </div>
      </header>

      {/* Success/Error Messages */}
      {saveSuccess && (
        <div className="mt-4 p-3 rounded-lg bg-green-500/10 border border-green-500/20 text-green-600 text-sm flex items-center gap-2">
          <Check className="h-4 w-4" />
          Profile updated successfully
        </div>
      )}
      {saveError && (
        <div className="mt-4 p-3 rounded-lg bg-destructive/10 border border-destructive/20 text-destructive text-sm flex items-center gap-2">
          <X className="h-4 w-4" />
          {saveError}
        </div>
      )}

      {/* MAIN CONTENT */}
      <div className="mt-6 grid gap-6 md:grid-cols-2">
        {/* LEFT COLUMN - Bio & Personal Info */}
        <section className="space-y-6">
          {/* Bio */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <User className="h-4 w-4" />
              About
            </h2>
            {isEditing ? (
              <div className="space-y-4">
                {/* Email (read-only) */}
                <div>
                  <Label className="text-xs text-muted-foreground flex items-center gap-1">
                    <Lock className="h-3 w-3" />
                    Email (read-only)
                  </Label>
                  <div className="mt-1 flex items-center gap-2 px-3 py-2 rounded-md bg-muted/50 text-muted-foreground text-sm">
                    <Mail className="h-4 w-4" />
                    {profile.email || "No email"}
                  </div>
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Full Name</Label>
                  <Input
                    value={editFullName}
                    onChange={(e) => setEditFullName(e.target.value)}
                    placeholder="Your full name"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Preferred Name</Label>
                  <Input
                    value={editPreferredName}
                    onChange={(e) => setEditPreferredName(e.target.value)}
                    placeholder="What should we call you?"
                    className="mt-1"
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Bio</Label>
                  <Textarea
                    value={editBio}
                    onChange={(e) => setEditBio(e.target.value)}
                    placeholder="Tell us about yourself..."
                    className="mt-1 resize-none"
                    rows={3}
                  />
                </div>
                <div>
                  <Label className="text-xs text-muted-foreground">Avatar URL</Label>
                  <Input
                    value={editAvatarUrl}
                    onChange={(e) => setEditAvatarUrl(e.target.value)}
                    placeholder="https://..."
                    className="mt-1"
                  />
                </div>
              </div>
            ) : (
              <div className="space-y-3">
                {/* Email (read-only display) */}
                <div className="flex items-center gap-2 text-sm text-muted-foreground">
                  <Mail className="h-4 w-4" />
                  <span>{profile.email || "No email"}</span>
                </div>
                {/* Full Name */}
                {profile.full_name && (
                  <p className="text-foreground font-medium">{profile.full_name}</p>
                )}
                {/* Bio */}
                <p className="text-foreground">
                  {profile.bio || <span className="text-muted-foreground italic">No bio yet</span>}
                </p>
                {profile.preferred_name && (
                  <p className="text-sm text-muted-foreground">
                    Goes by: <span className="text-foreground">{profile.preferred_name}</span>
                  </p>
                )}
              </div>
            )}
          </div>

          {/* Institution */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Building2 className="h-4 w-4" />
              Institution
            </h2>
            {isEditing ? (
              <Input
                value={editInstitution}
                onChange={(e) => setEditInstitution(e.target.value)}
                placeholder="Your school, university, or company"
              />
            ) : (
              <p className="text-foreground">
                {profile.institution || <span className="text-muted-foreground italic">Not set</span>}
              </p>
            )}
          </div>

          {/* Role */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <GraduationCap className="h-4 w-4" />
              Role
            </h2>
            {isEditing ? (
              <div className="flex gap-2">
                {roleOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEditRole(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      editRole === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-foreground font-medium">{getRoleLabel(profile.role)}</p>
            )}
          </div>

          {/* Cover Customization - Only visible in edit mode */}
          {isEditing && (
            <div className="rounded-xl bg-card border border-border/50 p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Image className="h-4 w-4" />
                Cover Customization
              </h2>
              <div className="space-y-4">
                {/* Cover Image Upload */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 block">Cover Image</Label>
                  <div className="flex items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => coverFileInputRef.current?.click()}
                      className="gap-2"
                    >
                      <Upload className="h-4 w-4" />
                      Upload Image
                    </Button>
                    {editCoverImageUrl && (
                      <button
                        onClick={() => setEditCoverImageUrl(null)}
                        className="text-xs text-destructive hover:underline"
                      >
                        Remove
                      </button>
                    )}
                  </div>
                  {editCoverImageUrl && (
                    <div className="mt-2 relative w-full h-20 rounded-md overflow-hidden border border-border">
                      <img
                        src={editCoverImageUrl}
                        alt="Cover preview"
                        className="w-full h-full object-cover"
                      />
                    </div>
                  )}
                </div>

                {/* Cover Color Picker */}
                <div>
                  <Label className="text-xs text-muted-foreground mb-2 flex items-center gap-1">
                    <Palette className="h-3 w-3" />
                    Cover Color {editCoverImageUrl && <span className="text-muted-foreground">(visible if no image)</span>}
                  </Label>
                  <div className="flex flex-wrap gap-2">
                    {coverColorPresets.map((color) => (
                      <button
                        key={color.value}
                        onClick={() => setEditCoverColor(color.value)}
                        className={cn(
                          "w-8 h-8 rounded-md border-2 transition-all",
                          editCoverColor === color.value
                            ? "border-primary ring-2 ring-primary/30"
                            : "border-border hover:border-primary/50"
                        )}
                        style={{ backgroundColor: color.value }}
                        title={color.label}
                      />
                    ))}
                  </div>
                  <div className="mt-2 flex items-center gap-2">
                    <Label className="text-xs text-muted-foreground">Custom:</Label>
                    <Input
                      type="text"
                      value={editCoverColor}
                      onChange={(e) => setEditCoverColor(e.target.value)}
                      placeholder="#1e293b"
                      className="w-28 h-8 text-xs"
                    />
                    <div
                      className="w-8 h-8 rounded-md border border-border"
                      style={{ backgroundColor: editCoverColor }}
                    />
                  </div>
                </div>
              </div>
            </div>
          )}
        </section>

        {/* RIGHT COLUMN - Learning Profile */}
        <section className="space-y-6">
          {/* Skill Domain (Read-only) */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Target className="h-4 w-4" />
              Skill Domain
              <span className="text-xs bg-muted px-2 py-0.5 rounded">Read-only</span>
            </h2>
            <p className="text-foreground font-medium">
              {profile.inferred_skill_domain || <span className="text-muted-foreground italic font-normal">Not determined yet</span>}
            </p>
          </div>

          {/* Learning Goal (Read-only - from classifier) */}
          {profile.normalized_learning_goal && (
            <div className="rounded-xl bg-card border border-border/50 p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <BookOpen className="h-4 w-4" />
                Learning Goal
                <span className="text-xs bg-muted px-2 py-0.5 rounded">Read-only</span>
              </h2>
              <p className="text-foreground font-medium">
                {profile.normalized_learning_goal}
              </p>
            </div>
          )}

          {/* Inferred Skill Level (Read-only - from classifier) */}
          {profile.inferred_skill_level && (
            <div className="rounded-xl bg-card border border-border/50 p-6">
              <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
                <Sparkles className="h-4 w-4" />
                Inferred Skill Level
                <span className="text-xs bg-muted px-2 py-0.5 rounded">Read-only</span>
              </h2>
              <p className="text-foreground font-medium">
                {profile.inferred_skill_level}
              </p>
            </div>
          )}

          {/* Skill Level */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <TrendingUp className="h-4 w-4" />
              Skill Level
            </h2>
            {isEditing ? (
              <div className="flex gap-2">
                {skillLevelOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEditSkillLevel(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      editSkillLevel === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-foreground font-medium">{getSkillLevelLabel(profile.current_skill_level)}</p>
            )}
          </div>

          {/* Time Commitment */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Clock className="h-4 w-4" />
              Time Commitment
            </h2>
            {isEditing ? (
              <div className="flex gap-2">
                {timeCommitmentOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEditTimeCommitment(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      editTimeCommitment === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-foreground font-medium">{getTimeCommitmentLabel(profile.time_commitment)}</p>
            )}
          </div>

          {/* Motivation */}
          <div className="rounded-xl bg-card border border-border/50 p-6">
            <h2 className="text-sm font-medium text-muted-foreground mb-3 flex items-center gap-2">
              <Lightbulb className="h-4 w-4" />
              Motivation
            </h2>
            {isEditing ? (
              <div className="flex flex-wrap gap-2">
                {motivationOptions.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setEditMotivation(option.value)}
                    className={cn(
                      "px-4 py-2 rounded-lg border text-sm font-medium transition-colors",
                      editMotivation === option.value
                        ? "border-primary bg-primary/10 text-primary"
                        : "border-border hover:border-primary/50"
                    )}
                  >
                    {option.label}
                  </button>
                ))}
              </div>
            ) : (
              <p className="text-foreground font-medium">{getMotivationLabel(profile.motivation_type)}</p>
            )}
          </div>
        </section>
      </div>

      {/* Hidden file input for avatar upload */}
      <input
        ref={fileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) {
            // For now, just show a URL input. Real implementation would upload to storage.
            const url = URL.createObjectURL(file)
            setEditAvatarUrl(url)
          }
        }}
      />

      {/* Hidden file input for cover image upload */}
      <input
        ref={coverFileInputRef}
        type="file"
        accept="image/*"
        className="hidden"
        onChange={(e: ChangeEvent<HTMLInputElement>) => {
          const file = e.target.files?.[0]
          if (file) {
            // Create a temporary URL for preview. 
            // For production, upload to Supabase Storage and use the public URL.
            const url = URL.createObjectURL(file)
            setEditCoverImageUrl(url)
          }
        }}
      />
    </div>
  )
}

"use server"

// app/(app)/profile/actions.ts
// ============================================================================
// PROFILE SERVER ACTIONS
// ============================================================================
// Server actions for updating user profile data.
// ============================================================================

import { createSupabaseServerClient } from "@/lib/supabase/server"
import { revalidatePath } from "next/cache"

export interface UpdateProfileInput {
    full_name?: string
    preferred_name?: string
    bio?: string
    avatar_url?: string
    institution?: string
    current_skill_level?: "beginner" | "intermediate" | "advanced" | null
    time_commitment?: "casual" | "regular" | "intensive" | null
    motivation_type?: "career" | "curiosity" | "project" | "other" | null
    role?: "student" | "mentor"
    cover_image_url?: string | null
    cover_color?: string | null
}

export interface UpdateProfileResult {
    success: boolean
    error?: string
}

/**
 * Update user profile in Supabase.
 * Only updates the fields that are explicitly provided.
 */
export async function updateProfile(input: UpdateProfileInput): Promise<UpdateProfileResult> {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return { success: false, error: "Not authenticated" }
        }

        // Build update object with only provided fields
        const updateData: Record<string, unknown> = {
            updated_at: new Date().toISOString(),
        }

        if (input.full_name !== undefined) updateData.full_name = input.full_name.trim() || null
        if (input.preferred_name !== undefined) updateData.preferred_name = input.preferred_name.trim() || null
        if (input.bio !== undefined) updateData.bio = input.bio.trim() || null
        if (input.avatar_url !== undefined) updateData.avatar_url = input.avatar_url.trim() || null
        if (input.institution !== undefined) updateData.institution = input.institution.trim() || null
        if (input.current_skill_level !== undefined) updateData.current_skill_level = input.current_skill_level
        if (input.time_commitment !== undefined) updateData.time_commitment = input.time_commitment
        if (input.motivation_type !== undefined) updateData.motivation_type = input.motivation_type
        if (input.role !== undefined) updateData.role = input.role
        if (input.cover_image_url !== undefined) updateData.cover_image_url = input.cover_image_url
        if (input.cover_color !== undefined) updateData.cover_color = input.cover_color

        const { error } = await supabase
            .from("profiles")
            .update(updateData)
            .eq("id", user.id)

        if (error) {
            console.error("[updateProfile] Error:", error)
            return { success: false, error: error.message }
        }

        // Revalidate the profile page
        revalidatePath("/profile")

        return { success: true }
    } catch (err) {
        console.error("[updateProfile] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred" }
    }
}

/**
 * Fetch the current user's profile data.
 */
export async function getProfile() {
    try {
        const supabase = await createSupabaseServerClient()
        const { data: { user } } = await supabase.auth.getUser()

        if (!user) {
            return null
        }

        const { data: profile, error } = await supabase
            .from("profiles")
            .select(`
                id,
                email,
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
                cover_image_url,
                cover_color,
                created_at
            `)
            .eq("id", user.id)
            .single()

        if (error) {
            console.error("[getProfile] Error:", error)
            return null
        }

        return profile
    } catch (err) {
        console.error("[getProfile] Unexpected error:", err)
        return null
    }
}

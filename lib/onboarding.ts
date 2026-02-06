// lib/onboarding.ts
// ============================================================================
// ONBOARDING SYSTEM
// ============================================================================
// Server-side functions for managing user onboarding.
// Uses the admin client (service role) to bypass RLS.
// ============================================================================

import { supabaseAdmin } from "@/lib/supabase/admin"
import type { ProfileInsert } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

export type OnboardingRole = "student" | "mentor"

export interface OnboardingData {
    fullName: string
    role: OnboardingRole
    learningGoal?: string // Only required for students
}

export interface OnboardingStatus {
    onboardingCompleted: boolean
    fullName: string | null
    role: OnboardingRole | null
    learningGoal: string | null
}

export interface OnboardingResult {
    success: boolean
    error?: string
    hint?: string
}

// ============================================================================
// VALIDATION
// ============================================================================

const VALID_ROLES: OnboardingRole[] = ["student", "mentor"]

export function isValidOnboardingRole(value: unknown): value is OnboardingRole {
    return typeof value === "string" && VALID_ROLES.includes(value as OnboardingRole)
}

export function validateOnboardingData(data: OnboardingData): { valid: boolean; error?: string } {
    if (!data.fullName || data.fullName.trim().length === 0) {
        return { valid: false, error: "Full name is required." }
    }

    if (data.fullName.trim().length < 2) {
        return { valid: false, error: "Full name must be at least 2 characters." }
    }

    if (!isValidOnboardingRole(data.role)) {
        return { valid: false, error: "Please select a valid role." }
    }

    if (data.role === "student" && (!data.learningGoal || data.learningGoal.trim().length === 0)) {
        return { valid: false, error: "Please tell us what you want to learn." }
    }

    return { valid: true }
}

// ============================================================================
// DATABASE OPERATIONS (SERVER-SIDE ONLY)
// ============================================================================

/**
 * Fetch onboarding status for a given user ID
 * Uses admin client to bypass RLS
 */
export async function fetchOnboardingStatus(userId: string): Promise<OnboardingStatus | null> {
    try {
        // Define expected return type for the query
        type ProfileOnboardingData = {
            onboarding_completed: boolean | null
            full_name: string | null
            role: string | null
            learning_goal: string | null
        }

        const { data, error } = await supabaseAdmin
            .from("profiles")
            .select("onboarding_completed, full_name, role, learning_goal")
            .eq("id", userId)
            .single()

        if (error) {
            // Handle schema cache error specifically
            if (error.code === "PGRST205" || error.message?.includes("PGRST205")) {
                console.error(
                    "[fetchOnboardingStatus] Schema cache error. Run 'NOTIFY pgrst, reload schema' in SQL Editor."
                )
                return null
            }

            // PGRST116 = no rows found, which is fine for new users
            if (error.code === "PGRST116") {
                console.log("[fetchOnboardingStatus] No profile found for user:", userId)
                return null
            }

            console.error("[fetchOnboardingStatus] Database error:", error)
            return null
        }

        if (!data) {
            return null
        }

        // Cast to expected type
        const typedData = data as unknown as ProfileOnboardingData

        return {
            onboardingCompleted: Boolean(typedData.onboarding_completed),
            fullName: typedData.full_name || null,
            role: isValidOnboardingRole(typedData.role) ? typedData.role : null,
            learningGoal: typedData.learning_goal || null,
        }
    } catch (err) {
        console.error("[fetchOnboardingStatus] Unexpected error:", err)
        return null
    }
}

/**
 * Save onboarding data for a given user ID
 * Uses admin client to bypass RLS
 */
export async function saveOnboardingData(
    userId: string,
    data: OnboardingData
): Promise<OnboardingResult> {
    // Validate data first
    const validation = validateOnboardingData(data)
    if (!validation.valid) {
        return { success: false, error: validation.error }
    }

    try {
        const profileData = {
            id: userId,
            full_name: data.fullName.trim(),
            role: data.role,
            learning_goal: data.role === "student" ? data.learningGoal?.trim() || null : null,
            role_selected: true,
            onboarding_completed: true,
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .upsert(profileData as unknown as ProfileInsert, { onConflict: "id" })

        if (error) {
            console.error("[saveOnboardingData] Database error:", error)

            // Handle schema cache error
            if (error.code === "PGRST205" || error.message?.includes("PGRST205")) {
                return {
                    success: false,
                    error: "Database configuration error.",
                    hint: "Run 'NOTIFY pgrst, reload schema' in Supabase SQL Editor.",
                }
            }

            // Handle API key errors
            if (error.message?.includes("No API key") || error.message?.includes("Invalid API key")) {
                return {
                    success: false,
                    error: "API configuration error.",
                    hint: "Check that SUPABASE_SERVICE_ROLE_KEY in .env.local is correct.",
                }
            }

            return { success: false, error: "Failed to save your information. Please try again." }
        }

        console.log("[saveOnboardingData] Success for user:", userId)
        return { success: true }
    } catch (err) {
        console.error("[saveOnboardingData] Unexpected error:", err)
        return { success: false, error: "An unexpected error occurred. Please try again." }
    }
}

/**
 * Determine if a user needs to complete onboarding
 */
export async function needsOnboarding(userId: string): Promise<boolean> {
    const status = await fetchOnboardingStatus(userId)

    // If we can't fetch status, assume onboarding is needed
    if (!status) {
        return true
    }

    return !status.onboardingCompleted
}

/**
 * Create initial profile for a new user (called after signup)
 */
export async function createInitialProfile(
    userId: string,
    email?: string
): Promise<OnboardingResult> {
    try {
        const profileData = {
            id: userId,
            email: email || null,
            role: "student" as const, // Default role
            role_selected: false,
            onboarding_completed: false,
            created_at: new Date().toISOString(),
            updated_at: new Date().toISOString(),
        }

        const { error } = await supabaseAdmin
            .from("profiles")
            .upsert(profileData as unknown as ProfileInsert, { onConflict: "id", ignoreDuplicates: true })

        if (error) {
            console.error("[createInitialProfile] Error:", error)

            if (error.code === "PGRST205") {
                return {
                    success: false,
                    error: "Database not configured correctly.",
                    hint: "Run the SQL migration scripts in docs/complete-profiles-fix.sql",
                }
            }

            return { success: false, error: "Failed to create profile." }
        }

        return { success: true }
    } catch (err) {
        console.error("[createInitialProfile] Unexpected error:", err)
        return { success: false, error: "Failed to create profile." }
    }
}
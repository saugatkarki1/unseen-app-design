import type { SupabaseClient } from "@supabase/supabase-js"

// ============================================================================
// ROLE SYSTEM TYPES
// ============================================================================

export type Role = "student" | "mentor"

export interface UserRoleStatus {
    role: Role
    role_selected: boolean
}

// Valid role values for validation
const VALID_ROLES: Role[] = ["student", "mentor"]

// ============================================================================
// VALIDATION
// ============================================================================

/**
 * Type guard to check if a value is a valid Role
 */
export function isValidRole(value: unknown): value is Role {
    return typeof value === "string" && VALID_ROLES.includes(value as Role)
}

// ============================================================================
// DATABASE OPERATIONS
// ============================================================================

/**
 * Fetch the current user's role status from the profiles table
 * Returns null if user is not authenticated or profile not found
 */
export async function fetchUserRoleStatus(
    supabase: SupabaseClient
): Promise<UserRoleStatus | null> {
    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        return null
    }

    const { data, error } = await supabase
        .from("profiles")
        .select("role, role_selected")
        .eq("id", user.id)
        .single()

    if (error || !data) {
        console.error("Error fetching role status:", error)
        return null
    }

    // Validate role value from database
    if (!isValidRole(data.role)) {
        console.error("Invalid role value in database:", data.role)
        return null
    }

    return {
        role: data.role,
        role_selected: Boolean(data.role_selected),
    }
}

/**
 * Update the user's role and mark role_selected as true
 * Returns true on success, false on failure
 */
export async function updateUserRole(
    supabase: SupabaseClient,
    role: Role
): Promise<boolean> {
    // Validate role before attempting update
    if (!isValidRole(role)) {
        console.error("Invalid role value:", role)
        return false
    }

    const {
        data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
        console.error("No authenticated user")
        return false
    }

    const { error } = await supabase
        .from("profiles")
        .update({
            role,
            role_selected: true,
        })
        .eq("id", user.id)

    if (error) {
        console.error("Error updating role:", JSON.stringify(error, null, 2))
        return false
    }

    return true
}

/**
 * Check if the user needs to select a role
 * Returns true if role selection is required
 */
export async function needsRoleSelection(
    supabase: SupabaseClient
): Promise<boolean> {
    const status = await fetchUserRoleStatus(supabase)

    // If we can't fetch status, assume role selection is needed
    // This handles edge cases like missing profile
    if (!status) {
        return true
    }

    return !status.role_selected
}

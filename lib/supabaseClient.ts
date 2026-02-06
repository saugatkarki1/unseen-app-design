import { createBrowserClient } from "@supabase/ssr"
import { env } from "@/lib/env"
import type { Database } from "@/lib/supabase/types"

// ============================================================================
// BROWSER SUPABASE CLIENT
// ============================================================================
// This client is used in client-side components.
// It uses the ANON key which is safe to expose publicly.
// 
// NEVER use the service_role key on the client side!
// ============================================================================

let supabaseInstance: ReturnType<typeof createBrowserClient<Database>> | null = null

/**
 * Get the browser Supabase client (singleton)
 * Uses ANON key only - safe for client-side use
 */
export function getSupabaseBrowserClient() {
    if (supabaseInstance) {
        return supabaseInstance
    }

    // Validate environment variables are present
    const url = env.client.NEXT_PUBLIC_SUPABASE_URL
    const anonKey = env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY

    if (!url || !anonKey) {
        throw new Error(
            "Missing Supabase environment variables. Check your .env.local file."
        )
    }

    supabaseInstance = createBrowserClient<Database>(url, anonKey)
    return supabaseInstance
}

// Default export for backwards compatibility
export const supabase = createBrowserClient<Database>(
    env.client.NEXT_PUBLIC_SUPABASE_URL,
    env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY
)

// ============================================================================
// ERROR HANDLING HELPERS
// ============================================================================

export interface SupabaseErrorInfo {
    code: string
    message: string
    hint?: string
}

/**
 * Parse Supabase errors and provide user-friendly messages
 */
export function parseSupabaseError(error: unknown): SupabaseErrorInfo {
    if (!error) {
        return { code: "UNKNOWN", message: "An unknown error occurred" }
    }

    const err = error as Record<string, unknown>
    const code = (err.code as string) || "UNKNOWN"
    const message = (err.message as string) || "An error occurred"

    // Handle common error codes
    if (code === "PGRST205" || message.includes("PGRST205")) {
        return {
            code: "PGRST205",
            message: "Database table not found in schema cache",
            hint: "Run 'NOTIFY pgrst, reload schema' in Supabase SQL Editor.",
        }
    }

    if (code === "PGRST301" || message.includes("PGRST301")) {
        return {
            code: "PGRST301",
            message: "JWT token is invalid or expired",
            hint: "Please sign out and sign back in.",
        }
    }

    if (message.includes("No API key found") || message.includes("Invalid API key")) {
        return {
            code: "API_KEY_ERROR",
            message: "Invalid or missing API key",
            hint: "Check your Supabase configuration.",
        }
    }

    if (code === "42501" || message.includes("permission denied")) {
        return {
            code: "RLS_ERROR",
            message: "Permission denied by Row Level Security",
            hint: "Check your RLS policies in Supabase.",
        }
    }

    return { code, message }
}

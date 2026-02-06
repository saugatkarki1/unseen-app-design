import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import type { Database } from "@/lib/supabase/types"

// ============================================================================
// ADMIN CLIENT - SERVER ONLY
// ============================================================================
// Uses Service Role Key to bypass RLS.
// NEVER expose this to the client.
// ============================================================================

const globalForSupabase = global as unknown as {
    supabaseAdmin: ReturnType<typeof createClient<Database>>
}

export const supabaseAdmin =
    globalForSupabase.supabaseAdmin ||
    createClient<Database>(
        env.client.NEXT_PUBLIC_SUPABASE_URL,
        env.server.SUPABASE_SERVICE_ROLE_KEY,
        {
            auth: {
                autoRefreshToken: false,
                persistSession: false,
            },
        }
    )

if (process.env.NODE_ENV !== "production") {
    globalForSupabase.supabaseAdmin = supabaseAdmin
}

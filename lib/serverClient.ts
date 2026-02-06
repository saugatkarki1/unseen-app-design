import { createClient } from "@supabase/supabase-js"
import { env } from "@/lib/env"
import type { Database } from "@/lib/supabase/types"

// ============================================================================
// SERVER CLIENT (SERVICE ROLE)
// ============================================================================
// Uses Service Role Key to bypass RLS - SERVER ONLY.
// This is an alias for the admin client for backwards compatibility.
// ============================================================================

export const supabaseServer = createClient<Database>(
    env.client.NEXT_PUBLIC_SUPABASE_URL,
    env.server.SUPABASE_SERVICE_ROLE_KEY,
    {
        auth: {
            autoRefreshToken: false,
            persistSession: false,
        },
    }
)
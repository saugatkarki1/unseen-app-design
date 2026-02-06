import { createClient } from "@supabase/supabase-js"
import { cookies } from "next/headers"
import { env } from "@/lib/env"
import type { Database } from "@/lib/supabase/types"

// ============================================================================
// SERVER SUPABASE CLIENT
// ============================================================================
// Creates a Supabase client for use in Server Components and Server Actions.
// Uses ANON key with user session from cookies.
// ============================================================================

export const createSupabaseServerClient = async () => {
  // In Next.js 16+, cookies() returns a Promise
  const cookieStore = await cookies()

  // Read the Supabase auth tokens from cookies
  const accessToken = cookieStore.get("sb-access-token")?.value
  const refreshToken = cookieStore.get("sb-refresh-token")?.value

  const supabase = createClient<Database>(
    env.client.NEXT_PUBLIC_SUPABASE_URL,
    env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
    {
      auth: {
        persistSession: false,
        autoRefreshToken: false,
        detectSessionInUrl: false,
      },
      global: {
        headers: accessToken
          ? { Authorization: `Bearer ${accessToken}` }
          : {},
      },
    }
  )

  // If we have tokens, set the session manually
  if (accessToken && refreshToken) {
    await supabase.auth.setSession({
      access_token: accessToken,
      refresh_token: refreshToken,
    })
  }

  return supabase
}

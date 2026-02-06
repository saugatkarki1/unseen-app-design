import { createClient as createSupabaseClient } from "@supabase/supabase-js"
import { NextRequest, NextResponse } from "next/server"
import { env } from "@/lib/env"

export async function GET(request: NextRequest) {
  const requestUrl = new URL(request.url)
  const code = requestUrl.searchParams.get("code")

  // Handle email confirmation callback from Supabase email verification links
  if (code) {
    try {
      // Create a server-side Supabase client to exchange the code for a session
      const supabase = createSupabaseClient(
        env.client.NEXT_PUBLIC_SUPABASE_URL,
        env.client.NEXT_PUBLIC_SUPABASE_ANON_KEY,
      )

      // Exchange the authorization code for a user session
      // This code is valid for 1 hour after the email verification link is sent
      const { error, data } = await supabase.auth.exchangeCodeForSession(code)

      if (error) {
        console.error("Error exchanging code for session:", error)
        // If code exchange fails, redirect to login with error
        return NextResponse.redirect(new URL("/auth?error=email_verification_failed", requestUrl.origin))
      }

      if (!data?.session) {
        console.error("No session returned from code exchange")
        return NextResponse.redirect(new URL("/auth?error=no_session", requestUrl.origin))
      }

      // Session was established successfully
      // Always redirect to /dashboard - the layout gate will handle routing
      // based on user's profile, role, and onboarding status
      const redirectPath = "/dashboard"

      console.log(`[Auth Callback] Redirecting user ${data.session.user.id} to ${redirectPath}`)

      const response = NextResponse.redirect(new URL(redirectPath, requestUrl.origin))

      response.cookies.set("sb-access-token", data.session.access_token, {
        path: "/",
        secure: process.env.NODE_ENV === "production",
        sameSite: "lax",
        maxAge: 60 * 60 * 24 * 7, // 1 week
      })

      if (data.session.refresh_token) {
        response.cookies.set("sb-refresh-token", data.session.refresh_token, {
          path: "/",
          secure: process.env.NODE_ENV === "production",
          sameSite: "lax",
          maxAge: 60 * 60 * 24 * 7, // 1 week
        })
      }

      return response
    } catch (error) {
      console.error("Unexpected error in callback route:", error)
      return NextResponse.redirect(new URL("/auth?error=callback_error", requestUrl.origin))
    }
  }

  // No code provided - redirect to login
  console.warn("No authorization code provided to callback route")
  return NextResponse.redirect(new URL("/auth", requestUrl.origin))
}

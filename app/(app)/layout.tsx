import type { ReactNode } from "react"
import { redirect } from "next/navigation"
import { headers } from "next/headers"
import { AppShell } from "@/components/layout/app-shell"
import { getOnboardingRedirect } from "@/lib/auth/onboarding-gate"

// ============================================================================
// APP LAYOUT
// ============================================================================
// This layout wraps all authenticated routes in the (app) group.
// It uses the canonical onboarding gate to enforce routing rules.
//
// IMPORTANT: All onboarding redirect logic is centralized in:
// lib/auth/onboarding-gate.ts
//
// Do NOT add redirect logic here or in any page components.
// ============================================================================

export default async function AppLayout({ children }: { children: ReactNode }) {
  // Get current pathname from headers (set by Next.js)
  const headersList = await headers()
  const pathname = headersList.get("x-pathname") || headersList.get("x-invoke-path") || "/"

  // Use the canonical onboarding gate to determine if redirect is needed
  const redirectTo = await getOnboardingRedirect(pathname)

  if (redirectTo) {
    redirect(redirectTo)
  }

  // User is on the correct page - render the app shell
  return <AppShell>{children}</AppShell>
}

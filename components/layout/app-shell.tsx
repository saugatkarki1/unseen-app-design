"use client"

import type React from "react"

import { useEffect, useState } from "react"
import { useRouter, usePathname } from "next/navigation"
import { motion } from "framer-motion"
import { TopNav } from "./top-nav"
import { BottomNav } from "./bottom-nav"
import { Sidebar, COLLAPSED_WIDTH, EXPANDED_WIDTH } from "./sidebar"
import { SidebarProvider, useSidebarState } from "./sidebar-context"
import { useAppStore } from "@/lib/store"
import { AlertTriangle } from "lucide-react"
import { VerificationBanner } from "./verification-banner"
import { FocusMode } from "@/components/ui/focus-mode"
import { ReflectionModal } from "@/components/ui/reflection-modal"
import { supabase } from "@/lib/supabaseClient"
import { getProfileSyncData } from "@/lib/actions/profile-actions"

interface AppShellProps {
  children: React.ReactNode
}

function AppShellContent({ children }: AppShellProps) {
  const router = useRouter()
  const pathname = usePathname()
  const isOnboarded = useAppStore((state) => state.isOnboarded)
  const checkAndApplyDecay = useAppStore((state) => state.checkAndApplyDecay)
  const activeFocusSession = useAppStore((state) => state.activeFocusSession)
  const resetUserScopedState = useAppStore((state) => state.resetUserScopedState)
  const setUserId = useAppStore((state) => state.setUserId)
  const currentUserId = useAppStore((state) => state.userId)
  const setProfileImage = useAppStore((state) => state.setProfileImage)
  const setPublicAlias = useAppStore((state) => state.setPublicAlias)
  const [decayNotice, setDecayNotice] = useState<{ show: boolean; amount: number }>({ show: false, amount: 0 })
  const { isOpen } = useSidebarState()

  // SYNC PROFILE DATA FROM DATABASE
  // This ensures the header avatar and name are populated from the database on mount
  useEffect(() => {
    async function syncProfileData() {
      try {
        const { avatarUrl, fullName } = await getProfileSyncData()
        if (avatarUrl) {
          setProfileImage(avatarUrl)
        }
        if (fullName) {
          setPublicAlias(fullName)
        }
      } catch (err) {
        console.error("[AppShell] Error syncing profile data:", err)
      }
    }
    // Sync when userId is set
    if (currentUserId) {
      syncProfileData()
    }
  }, [currentUserId, setProfileImage, setPublicAlias])

  // AUTH STATE CHANGE LISTENER - Handles user switch and logout
  useEffect(() => {
    const { data: { subscription } } = supabase.auth.onAuthStateChange((event, session) => {
      if (event === 'SIGNED_OUT') {
        // User logged out - reset all state
        console.log('[AUTH] User signed out, resetting state.')
        resetUserScopedState()
      } else if (event === 'SIGNED_IN' && session?.user) {
        // User signed in - check if userId changed
        const newUserId = session.user.id
        if (currentUserId && currentUserId !== newUserId) {
          console.log('[AUTH] User changed, resetting state.')
          resetUserScopedState()
        }
        setUserId(newUserId)
      } else if (event === 'TOKEN_REFRESHED' && session?.user) {
        // Ensure userId is set on token refresh
        if (!currentUserId) {
          setUserId(session.user.id)
        }
      }
    })

    // Check current session on mount
    supabase.auth.getSession().then(({ data: { session } }) => {
      if (session?.user && !currentUserId) {
        setUserId(session.user.id)
      }
    })

    return () => {
      subscription.unsubscribe()
    }
  }, [currentUserId, resetUserScopedState, setUserId])

  useEffect(() => {
    if (isOnboarded) {
      const { decayed, amount } = checkAndApplyDecay()
      if (decayed && amount > 0) {
        setDecayNotice({ show: true, amount })
        const timer = setTimeout(() => setDecayNotice({ show: false, amount: 0 }), 5000)
        return () => clearTimeout(timer)
      }
    }
  }, [isOnboarded, checkAndApplyDecay])

  // Show clean layout for onboarding
  if (pathname === "/onboarding") {
    return <>{children}</>
  }

  // If there's an active focus session, show FocusMode overlay
  // ReflectionModal will handle its own visibility based on session state

  return (
    <div className="min-h-screen bg-background">
      {/* Freewill System Overlays - render at top level, take priority */}
      <FocusMode />
      <ReflectionModal />

      <Sidebar />
      <TopNav />

      {/* Mobile Header Spacer */}
      <div className="md:hidden h-14" />

      {/* Main Content Area */}
      <main className="min-h-screen pt-0 md:pt-16 pb-20 md:pb-0">
        {/* Desktop uses animated margin from sidebar, mobile is full width */}
        <motion.div
          className="hidden md:block"
          style={{ minHeight: '100%' }}
          initial={{ marginLeft: COLLAPSED_WIDTH }}
          animate={{
            marginLeft: isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
          }}
          transition={{
            duration: 0.3,
            ease: [0.25, 0.1, 0.25, 1],
          }}
        >
          {/* Verification Banner */}
          <VerificationBanner />

          {/* Decay Notice */}
          {decayNotice.show && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
              <div className="flex items-center gap-3 px-4 md:px-6">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive font-tech">
                  Your Aura decayed by {decayNotice.amount} points due to missed days.
                </p>
                <button
                  onClick={() => setDecayNotice({ show: false, amount: 0 })}
                  className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Page Content - Desktop */}
          <div className="w-full">
            {children}
          </div>
        </motion.div>

        {/* Mobile Content - Full Width */}
        <div className="md:hidden">
          {/* Verification Banner */}
          <VerificationBanner />

          {/* Decay Notice */}
          {decayNotice.show && (
            <div className="bg-destructive/10 border-b border-destructive/20 px-4 py-3">
              <div className="flex items-center gap-3 px-4">
                <AlertTriangle className="h-4 w-4 text-destructive shrink-0" />
                <p className="text-sm text-destructive font-tech">
                  Your Aura decayed by {decayNotice.amount} points due to missed days.
                </p>
                <button
                  onClick={() => setDecayNotice({ show: false, amount: 0 })}
                  className="ml-auto text-sm text-muted-foreground hover:text-foreground transition-colors"
                >
                  Dismiss
                </button>
              </div>
            </div>
          )}

          {/* Page Content - Mobile */}
          <div className="w-full overflow-x-hidden">
            {children}
          </div>
        </div>
      </main>

      <BottomNav />
    </div>
  )
}

export function AppShell({ children }: AppShellProps) {
  return (
    <SidebarProvider>
      <AppShellContent>{children}</AppShellContent>
    </SidebarProvider>
  )
}

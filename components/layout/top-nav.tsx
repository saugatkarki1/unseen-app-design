"use client"

import { useEffect, useState } from "react"
import { User, LogOut, Clock } from "lucide-react"
import Link from "next/link"
import { usePathname, useRouter } from "next/navigation"
import { DropdownMenu, DropdownMenuContent, DropdownMenuItem, DropdownMenuTrigger } from "@/components/ui/dropdown-menu"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"
import { supabase } from "@/lib/supabaseClient"
import { COLLAPSED_WIDTH, EXPANDED_WIDTH } from "./sidebar"
import { useSidebarState } from "./sidebar-context"
import { motion } from "framer-motion"

export function TopNav() {
  const [mounted, setMounted] = useState(false)
  const [currentTime, setCurrentTime] = useState<string>("")
  const pathname = usePathname()
  const router = useRouter()
  const { publicAlias, profileImage, resetUserScopedState } = useAppStore()
  const { isOpen } = useSidebarState()

  useEffect(() => {
    setMounted(true)
    // Update time every minute
    const updateTime = () => {
      const now = new Date()
      setCurrentTime(now.toLocaleTimeString('en-US', {
        hour: '2-digit',
        minute: '2-digit',
        hour12: false
      }))
    }
    updateTime()
    const interval = setInterval(updateTime, 60000)
    return () => clearInterval(interval)
  }, [])

  if (!mounted) return null
  if (pathname === "/onboarding") return null

  const initials = publicAlias ? publicAlias.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "UN" : "UN"

  // Get page title from pathname
  const getPageTitle = () => {
    const path = pathname.split('/')[1] || 'dashboard'
    return path.toUpperCase()
  }

  const handleLogout = async () => {
    try {
      // CRITICAL: Reset all user-scoped state on logout to prevent data leakage
      resetUserScopedState()
      await supabase.auth.signOut()
      router.replace("/auth")
    } catch (error) {
      console.error("Logout failed:", error)
      router.replace("/auth")
    }
  }

  return (
    <motion.header
      className="fixed top-0 right-0 z-30 h-16 border-b border-border bg-card hidden md:flex"
      initial={{ left: COLLAPSED_WIDTH }}
      animate={{ left: isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH }}
      transition={{ duration: 0.3, ease: [0.25, 0.1, 0.25, 1] }}
    >
      <div className="flex h-full w-full items-center justify-between px-6">
        {/* Left: Page Title */}
        <div className="flex items-center gap-4">
          <div className="flex items-center gap-2">
            <div className="h-2 w-2 rounded-sm bg-primary" />
            <h1 className="font-tech text-lg font-bold text-foreground tracking-wider">
              {getPageTitle()}
            </h1>
          </div>
          <div className="flex items-center gap-2 text-muted-foreground">
            <Clock className="h-3.5 w-3.5" />
            <span className="font-tech text-xs">
              Last updated {currentTime}
            </span>
          </div>
        </div>

        {/* Right: Profile */}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <button
              className="flex items-center gap-3 rounded-lg px-3 py-2 hover:bg-secondary/50 transition-colors focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 focus:ring-offset-background"
              aria-label="User menu"
            >
              <Avatar className="h-8 w-8 border border-border">
                {profileImage && <AvatarImage src={profileImage} alt="Profile image" />}
                <AvatarFallback className="bg-primary text-primary-foreground text-xs font-tech">
                  {initials}
                </AvatarFallback>
              </Avatar>
              <span className="font-tech text-sm text-foreground/80 hidden lg:block">
                {publicAlias || "User"}
              </span>
            </button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end" className="w-48 bg-card border-border">
            <DropdownMenuItem asChild>
              <Link href="/profile" className="flex items-center gap-2 cursor-pointer font-tech text-sm">
                <User className="h-4 w-4" />
                Profile
              </Link>
            </DropdownMenuItem>
            <DropdownMenuItem
              onClick={handleLogout}
              className="flex items-center gap-2 cursor-pointer text-muted-foreground font-tech text-sm"
            >
              <LogOut className="h-4 w-4" />
              Logout
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    </motion.header>
  )
}

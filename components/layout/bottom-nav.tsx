"use client"

import { useState } from "react"
import {
  LayoutDashboard,
  Flame,
  Trophy,
  Archive,
  BookOpen,
  ChevronUp,
  MessageSquare,
  Settings,
  Target,
} from "lucide-react"
import Link from "next/link"
import { usePathname } from "next/navigation"
import { cn } from "@/lib/utils"

// Updated mobile navigation: 5 core items
// Profile is accessed via header avatar, not bottom nav
// Leaderboard is merged into Profile page
const navItems = [
  { href: "/dashboard", label: "Home", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: Archive },
]

export function BottomNav() {
  const pathname = usePathname()
  const [vaultOpen, setVaultOpen] = useState(false)

  if (pathname === "/onboarding") return null

  return (
    <>
      <nav
        className="fixed bottom-0 left-0 right-0 z-50 border-t border-border bg-background md:hidden"
        role="navigation"
        aria-label="Main navigation"
      >
        <div className="flex h-16 items-center justify-around px-2">
          {navItems.map(({ href, label, icon: Icon }) => {
            const isActive = pathname === href || pathname.startsWith(href + "/")
            const isVault = href === "/vault"

            const handleClick: React.MouseEventHandler<HTMLAnchorElement> | undefined = (event) => {
              if (isVault) {
                event.preventDefault()
                setVaultOpen((open) => !open)
              }
            }

            return (
              <Link
                key={href}
                href={href}
                onClick={handleClick}
                className={cn(
                  "flex flex-col items-center justify-center gap-1 px-3 py-2 min-w-[56px] rounded-lg transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  isActive ? "text-primary" : "text-muted-foreground hover:text-foreground",
                )}
                aria-current={isActive ? "page" : undefined}
              >
                <Icon className="h-5 w-5" aria-hidden="true" />
                <span className="text-[10px] font-medium">{label}</span>
              </Link>
            )
          })}
        </div>
      </nav>

      {vaultOpen && (
        <div className="fixed bottom-16 left-0 right-0 z-40 px-3 pb-3 md:hidden">
          <div className="mx-auto max-w-md overflow-hidden rounded-t-2xl border border-border bg-background shadow-lg">
            {/* Subtle handle / scroll hint */}
            <div className="flex justify-center pt-2">
              <div className="h-1 w-10 rounded-full bg-border/80" />
            </div>
            <div className="scroll-thin scroll-smooth max-h-64 space-y-1.5 overflow-y-auto px-3 pb-3 pt-2">
              {/* Vault, Drops, Chat, Settings - Aura/Future removed (now in Profile) */}
              // Vault and Settings
              <Link
                href="/vault"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  pathname === "/vault"
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setVaultOpen(false)}
              >
                <Archive className="h-4 w-4" aria-hidden="true" />
                <span>Vault</span>
              </Link>
              <Link
                href="/settings"
                className={cn(
                  "flex items-center gap-3 rounded-lg px-3 py-2 text-sm transition-colors duration-150",
                  "focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2",
                  pathname.startsWith("/settings")
                    ? "bg-primary text-primary-foreground"
                    : "hover:bg-accent hover:text-accent-foreground",
                )}
                onClick={() => setVaultOpen(false)}
              >
                <Settings className="h-4 w-4" aria-hidden="true" />
                <span>Settings</span>
              </Link>
            </div>
          </div>
        </div>
      )}
    </>
  )
}

"use client"

import { usePathname } from "next/navigation"
import Link from "next/link"
import { motion } from "framer-motion"
import {
  LayoutDashboard,
  Flame,
  BookOpen,
  Archive,
  MessageSquare,
  Settings,
  Trophy,
  Target,
  Hexagon,
  User,
} from "lucide-react"
import { cn } from "@/lib/utils"
import { useSidebarState } from "./sidebar-context"
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar"
import { useAppStore } from "@/lib/store"

const COLLAPSED_WIDTH = 72
const EXPANDED_WIDTH = 240

// Navigation items - preserving all existing routes
const navItems = [
  { href: "/dashboard", label: "Overview", icon: LayoutDashboard },
  { href: "/vault", label: "Vault", icon: Archive },
]

export function Sidebar() {
  const pathname = usePathname()
  const { isOpen, setIsOpen } = useSidebarState()
  const { publicAlias, profileImage } = useAppStore()

  if (pathname === "/onboarding") return null

  const initials = publicAlias ? publicAlias.replace(/[^A-Za-z]/g, "").slice(0, 2).toUpperCase() || "UN" : "UN"

  return (
    <>
      {/* Desktop Sidebar */}
      <motion.aside
        className="hidden md:flex fixed left-0 top-0 bottom-0 flex-col bg-sidebar border-r border-sidebar-border z-40"
        initial={{ width: COLLAPSED_WIDTH }}
        animate={{
          width: isOpen ? EXPANDED_WIDTH : COLLAPSED_WIDTH,
        }}
        transition={{
          duration: 0.3,
          ease: [0.25, 0.1, 0.25, 1],
        }}
        onMouseEnter={() => setIsOpen(true)}
        onMouseLeave={() => setIsOpen(false)}
        role="navigation"
        aria-label="Main navigation"
      >
        {/* Logo/Brand Section */}
        <div className="flex items-center h-16 px-4 border-b border-sidebar-border">
          <div className="flex items-center gap-3 overflow-hidden">
            <Hexagon className="h-8 w-8 text-primary flex-shrink-0" strokeWidth={1.5} />
            <motion.div
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
              className="overflow-hidden whitespace-nowrap"
            >
              <p className="font-tech text-sm font-bold text-sidebar-foreground tracking-wider">
                FRYSTA
              </p>
              <p className="font-tech text-[10px] text-muted-foreground uppercase tracking-widest">
                OS For Growth
              </p>
            </motion.div>
          </div>
        </div>

        {/* Navigation Section */}
        <div className="flex-1 flex flex-col py-4">
          {/* Section Label */}
          <motion.p
            initial={{ opacity: 0 }}
            animate={{ opacity: isOpen ? 1 : 0 }}
            transition={{ duration: 0.2 }}
            className="px-5 mb-2 text-[10px] font-tech uppercase tracking-widest text-muted-foreground"
          >
            Tools
          </motion.p>

          <nav className="flex flex-col gap-1 px-3">
            {navItems.map(({ href, label, icon: Icon }) => {
              const isActive = pathname === href || pathname.startsWith(href + "/")
              return (
                <Link
                  key={href}
                  href={href}
                  className={cn(
                    "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium transition-all duration-200 group/link overflow-hidden",
                    "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar",
                    isActive
                      ? "bg-sidebar-accent text-sidebar-primary"
                      : "text-sidebar-foreground/70 hover:bg-sidebar-accent/50 hover:text-sidebar-foreground",
                  )}
                  aria-current={isActive ? "page" : undefined}
                >
                  {/* Active indicator */}
                  {isActive && (
                    <motion.div
                      layoutId="activeIndicator"
                      className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                      transition={{ duration: 0.2 }}
                    />
                  )}
                  <Icon
                    className={cn(
                      "h-5 w-5 flex-shrink-0 transition-colors",
                      isActive ? "text-primary" : "text-sidebar-foreground/70 group-hover/link:text-sidebar-foreground"
                    )}
                    aria-hidden="true"
                  />
                  <motion.span
                    initial={{ opacity: 0, width: 0 }}
                    animate={{
                      opacity: isOpen ? 1 : 0,
                      width: isOpen ? "auto" : 0,
                    }}
                    transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
                    className="whitespace-nowrap overflow-hidden font-tech text-sm uppercase tracking-wide"
                  >
                    {label}
                  </motion.span>
                </Link>
              )
            })}
          </nav>
        </div>

        {/* Settings - Footer */}
        <div className="border-t border-sidebar-border px-3 py-3">
          <Link
            href="/settings"
            className={cn(
              "relative flex items-center gap-3 rounded-md px-3 py-2.5 text-sm font-medium group/link overflow-hidden",
              "hover:bg-sidebar-accent/50 transition-all duration-200",
              "focus:outline-none focus:ring-2 focus:ring-sidebar-ring focus:ring-offset-2 focus:ring-offset-sidebar",
              pathname === "/settings"
                ? "bg-sidebar-accent text-sidebar-primary"
                : "text-sidebar-foreground/70 hover:text-sidebar-foreground"
            )}
          >
            {pathname === "/settings" && (
              <motion.div
                layoutId="activeIndicator"
                className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-6 bg-primary rounded-r-full"
                transition={{ duration: 0.2 }}
              />
            )}
            <Settings
              className={cn(
                "h-5 w-5 flex-shrink-0 transition-colors",
                pathname === "/settings" ? "text-primary" : "text-sidebar-foreground/70 group-hover/link:text-sidebar-foreground"
              )}
              aria-hidden="true"
            />
            <motion.span
              initial={{ opacity: 0, width: 0 }}
              animate={{
                opacity: isOpen ? 1 : 0,
                width: isOpen ? "auto" : 0,
              }}
              transition={{ duration: 0.2, delay: isOpen ? 0.1 : 0 }}
              className="whitespace-nowrap overflow-hidden font-tech text-sm uppercase tracking-wide"
            >
              Settings
            </motion.span>
          </Link>
        </div>
      </motion.aside>

      {/* Mobile Header - Simple with logo and profile icon */}
      <div className="md:hidden fixed top-0 left-0 right-0 z-50 flex items-center justify-between px-4 h-14 bg-sidebar border-b border-sidebar-border">
        {/* Logo */}
        <Link href="/dashboard" className="flex items-center gap-2">
          <Hexagon className="h-6 w-6 text-primary" strokeWidth={1.5} />
          <span className="font-tech text-sm font-bold text-sidebar-foreground tracking-wider">FRYSTA</span>
        </Link>

        {/* Profile Icon */}
        <Link
          href="/profile"
          className="p-2 rounded-lg hover:bg-sidebar-accent transition-colors"
          aria-label="Go to profile"
        >
          <Avatar className="h-8 w-8 border border-border">
            {profileImage && <AvatarImage src={profileImage} alt="Profile" />}
            <AvatarFallback className="bg-primary text-primary-foreground text-xs font-tech">
              {initials}
            </AvatarFallback>
          </Avatar>
        </Link>
      </div>
    </>
  )
}

export { COLLAPSED_WIDTH, EXPANDED_WIDTH }

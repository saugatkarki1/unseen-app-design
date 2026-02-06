"use client"

import AuthSwitch from "@/components/ui/auth-switch"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-[#0B1D51] via-[#1E3A8A] to-[#0B1D51]">
      <AuthSwitch />
    </div>
  )
}

"use client"

import AuthSwitch from "@/components/ui/auth-switch"

export default function AuthPage() {
  return (
    <div className="min-h-screen flex items-center justify-center px-4 py-8 bg-gradient-to-br from-emerald-500 via-green-600 to-emerald-700">
      <AuthSwitch />
    </div>
  )
}

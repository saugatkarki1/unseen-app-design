"use client"

import { useRouter, useSearchParams } from "next/navigation"
import { useState, Suspense } from "react"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"

function ResetPasswordForm() {
  const router = useRouter()
  const searchParams = useSearchParams()
  const token = searchParams.get("token") || ""

  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [error, setError] = useState("")
  const [message, setMessage] = useState("")
  const [isSubmitting, setIsSubmitting] = useState(false)

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault()
    setError("")
    setMessage("")

    if (!token) {
      setError("Reset link is invalid or missing.")
      return
    }

    if (!password || !confirmPassword) {
      setError("Enter and confirm your new password.")
      return
    }

    if (password.length < 8) {
      setError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      setError("Passwords must match.")
      return
    }

    try {
      setIsSubmitting(true)
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      })

      const data = await response.json().catch(() => ({}))

      if (!response.ok) {
        setError(data?.error || "Unable to reset password.")
        setIsSubmitting(false)
        return
      }

      setMessage("Your password has been reset. Redirecting to dashboard...")
      setTimeout(() => {
        router.push("/dashboard")
      }, 1500)
    } catch {
      setError("Unable to reset password. Please try again.")
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div className="w-full max-w-md space-y-8">
        <div className="text-center">
          <h1 className="text-sm font-semibold tracking-widest text-primary uppercase">FRYSTA</h1>
        </div>

        <div className="space-y-6">
          <div className="space-y-1 text-center">
            <h2 className="text-xl font-semibold tracking-tight">Set New Password</h2>
            <p className="text-sm text-muted-foreground">
              Choose a new password for your account. This link expires for security.
            </p>
          </div>

          <form className="space-y-4" onSubmit={handleSubmit}>
            <div className="space-y-2">
              <Label htmlFor="new-password">New Password</Label>
              <Input
                id="new-password"
                type="password"
                autoComplete="new-password"
                value={password}
                onChange={(e) => {
                  setPassword(e.target.value)
                  setError("")
                }}
                disabled={isSubmitting}
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="confirm-new-password">Confirm Password</Label>
              <Input
                id="confirm-new-password"
                type="password"
                autoComplete="new-password"
                value={confirmPassword}
                onChange={(e) => {
                  setConfirmPassword(e.target.value)
                  setError("")
                }}
                disabled={isSubmitting}
              />
            </div>
            {error && <p className="text-sm text-destructive">{error}</p>}
            {message && <p className="text-sm text-success">{message}</p>}
            <Button type="submit" disabled={isSubmitting} className="w-full">
              {isSubmitting ? "Saving..." : "Save new password"}
            </Button>
          </form>
        </div>
      </div>
    </div>
  )
}

export default function ResetPasswordPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12">
        <div className="w-full max-w-md space-y-8">
          <div className="text-center">
            <h1 className="text-sm font-semibold tracking-widest text-primary uppercase">FRYSTA</h1>
          </div>
          <div className="text-center text-sm text-muted-foreground">Loading...</div>
        </div>
      </div>
    }>
      <ResetPasswordForm />
    </Suspense>
  )
}


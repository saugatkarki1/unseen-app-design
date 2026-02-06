"use client"

import { useState } from "react"
import { supabase } from "@/lib/supabaseClient"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { Label } from "@/components/ui/label"
import { Eye, EyeOff, Mail, Lock, User, ArrowRight, Loader2, Check } from "lucide-react"
import { cn } from "@/lib/utils"

interface SignupFormProps {
  onSuccess: (message: string) => void
  onError: (error: string) => void
}

export function SignupForm({ onSuccess, onError }: SignupFormProps) {
  const [fullName, setFullName] = useState("")
  const [email, setEmail] = useState("")
  const [password, setPassword] = useState("")
  const [confirmPassword, setConfirmPassword] = useState("")
  const [showPassword, setShowPassword] = useState(false)
  const [showConfirmPassword, setShowConfirmPassword] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Password validation checks
  const passwordChecks = {
    length: password.length >= 8,
    match: password === confirmPassword && confirmPassword.length > 0,
  }

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    onError("")

    // Validation
    if (!email.trim() || !password.trim() || !confirmPassword.trim()) {
      onError("All fields are required.")
      return
    }

    if (!/\S+@\S+\.\S+/.test(email)) {
      onError("Please enter a valid email address.")
      return
    }

    if (password.length < 8) {
      onError("Password must be at least 8 characters.")
      return
    }

    if (password !== confirmPassword) {
      onError("Passwords do not match.")
      return
    }

    try {
      setIsSubmitting(true)

      const { data, error } = await supabase.auth.signUp({
        email: email.trim(),
        password,
        options: {
          data: {
            full_name: fullName.trim(),
            email_confirmed: false,
          },
          emailRedirectTo: `${typeof window !== "undefined" ? window.location.origin : ""}/auth/callback`,
        },
      })

      if (error) {
        onError(error.message || "Failed to create account.")
        return
      }

      if (!data.user) {
        onError("Failed to create account.")
        return
      }

      if (!data.session) {
        onSuccess("Please check your email to confirm your account. Click the link in the email to continue.")
        return
      }

      onSuccess("Account created! Redirecting to dashboard...")
    } catch (err) {
      onError("An unexpected error occurred during signup.")
      console.error("Signup error:", err)
    } finally {
      setIsSubmitting(false)
    }
  }

  return (
    <form onSubmit={handleSubmit} className="space-y-5">
      {/* Full Name Field */}
      <div className="space-y-2">
        <Label
          htmlFor="signup-name"
          className="text-sm font-medium text-foreground/80"
        >
          Full name
        </Label>
        <div className="relative">
          <User className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-name"
            name="fullName"
            type="text"
            placeholder="John Doe"
            value={fullName}
            onChange={(e) => setFullName(e.target.value)}
            disabled={isSubmitting}
            autoComplete="name"
            className={cn(
              "h-12 pl-10 pr-4 rounded-xl border-border/50 bg-background/50",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200 placeholder:text-muted-foreground/50"
            )}
          />
        </div>
      </div>

      {/* Email Field */}
      <div className="space-y-2">
        <Label
          htmlFor="signup-email"
          className="text-sm font-medium text-foreground/80"
        >
          Email address
        </Label>
        <div className="relative">
          <Mail className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-email"
            name="email"
            type="email"
            placeholder="you@example.com"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            disabled={isSubmitting}
            autoComplete="email"
            className={cn(
              "h-12 pl-10 pr-4 rounded-xl border-border/50 bg-background/50",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200 placeholder:text-muted-foreground/50"
            )}
          />
        </div>
      </div>

      {/* Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="signup-password"
          className="text-sm font-medium text-foreground/80"
        >
          Password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-password"
            name="password"
            type={showPassword ? "text" : "password"}
            placeholder="Create a strong password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            className={cn(
              "h-12 pl-10 pr-12 rounded-xl border-border/50 bg-background/50",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200 placeholder:text-muted-foreground/50"
            )}
          />
          <button
            type="button"
            onClick={() => setShowPassword(!showPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Confirm Password Field */}
      <div className="space-y-2">
        <Label
          htmlFor="signup-confirm"
          className="text-sm font-medium text-foreground/80"
        >
          Confirm password
        </Label>
        <div className="relative">
          <Lock className="absolute left-3.5 top-1/2 -translate-y-1/2 h-4 w-4 text-muted-foreground" />
          <Input
            id="signup-confirm"
            name="confirmPassword"
            type={showConfirmPassword ? "text" : "password"}
            placeholder="Confirm your password"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            disabled={isSubmitting}
            autoComplete="new-password"
            className={cn(
              "h-12 pl-10 pr-12 rounded-xl border-border/50 bg-background/50",
              "focus:border-primary focus:ring-2 focus:ring-primary/20",
              "transition-all duration-200 placeholder:text-muted-foreground/50"
            )}
          />
          <button
            type="button"
            onClick={() => setShowConfirmPassword(!showConfirmPassword)}
            className="absolute right-3.5 top-1/2 -translate-y-1/2 text-muted-foreground hover:text-foreground transition-colors"
          >
            {showConfirmPassword ? (
              <EyeOff className="h-4 w-4" />
            ) : (
              <Eye className="h-4 w-4" />
            )}
          </button>
        </div>
      </div>

      {/* Password Requirements */}
      {password.length > 0 && (
        <div className="space-y-2 p-3 rounded-xl bg-muted/30 border border-border/30">
          <p className="text-xs font-medium text-muted-foreground">Password requirements:</p>
          <div className="space-y-1.5">
            <div className="flex items-center gap-2 text-xs">
              <div className={cn(
                "h-4 w-4 rounded-full flex items-center justify-center transition-colors",
                passwordChecks.length
                  ? "bg-green-500/20 text-green-600"
                  : "bg-muted text-muted-foreground"
              )}>
                <Check className="h-3 w-3" />
              </div>
              <span className={cn(
                passwordChecks.length ? "text-foreground" : "text-muted-foreground"
              )}>
                At least 8 characters
              </span>
            </div>
            {confirmPassword.length > 0 && (
              <div className="flex items-center gap-2 text-xs">
                <div className={cn(
                  "h-4 w-4 rounded-full flex items-center justify-center transition-colors",
                  passwordChecks.match
                    ? "bg-green-500/20 text-green-600"
                    : "bg-destructive/20 text-destructive"
                )}>
                  <Check className="h-3 w-3" />
                </div>
                <span className={cn(
                  passwordChecks.match ? "text-foreground" : "text-destructive"
                )}>
                  Passwords match
                </span>
              </div>
            )}
          </div>
        </div>
      )}

      {/* Submit Button */}
      <Button
        type="submit"
        disabled={isSubmitting || !email.trim() || !password.trim() || !confirmPassword.trim()}
        className={cn(
          "w-full h-12 rounded-xl font-medium text-sm",
          "bg-primary hover:bg-primary/90",
          "shadow-lg shadow-primary/25 hover:shadow-xl hover:shadow-primary/30",
          "transition-all duration-300",
          "disabled:opacity-50 disabled:shadow-none"
        )}
      >
        {isSubmitting ? (
          <>
            <Loader2 className="mr-2 h-4 w-4 animate-spin" />
            Creating account...
          </>
        ) : (
          <>
            Create Account
            <ArrowRight className="ml-2 h-4 w-4" />
          </>
        )}
      </Button>

      {/* Terms */}
      <p className="text-center text-xs text-muted-foreground">
        By creating an account, you agree to our{" "}
        <a href="/terms" className="text-primary hover:underline">
          Terms of Service
        </a>{" "}
        and{" "}
        <a href="/privacy" className="text-primary hover:underline">
          Privacy Policy
        </a>
      </p>
    </form>
  )
}

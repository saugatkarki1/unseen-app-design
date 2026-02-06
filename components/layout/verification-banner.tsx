"use client"

import { useState, useEffect } from "react"
import emailjs from "@emailjs/browser"
import { Button } from "@/components/ui/button"
import { Input } from "@/components/ui/input"
import { useAppStore } from "@/lib/store"
import { supabase } from "@/lib/supabaseClient"
import { cn } from "@/lib/utils"

const serviceId = "service_9xj7cnw"
const templateId = "template_632cd5l"
const publicKey = "2846C5RS8Z0bt8UhR"

const generateCode = () => Math.floor(100000 + Math.random() * 900000).toString()

export function VerificationBanner() {
  const {
    userEmail,
    userName,
    emailVerified,
    verificationCode,
    verificationSentAt,
    setVerificationChallenge,
    confirmVerificationCode,
  } = useAppStore()

  const [codeInput, setCodeInput] = useState("")
  const [status, setStatus] = useState<"idle" | "sent" | "error" | "verified">("idle")
  const [message, setMessage] = useState("")
  const [isSending, setIsSending] = useState(false)
  const [resendUntil, setResendUntil] = useState<number | null>(null)
  const [cooldownRemaining, setCooldownRemaining] = useState(0)
  const [isVerifiedFromSupabase, setIsVerifiedFromSupabase] = useState<boolean | null>(null)
  const [isLoading, setIsLoading] = useState(true)

  const COOLDOWN_SECONDS = 60

  // Check actual verification status from Supabase
  useEffect(() => {
    const checkVerificationStatus = async () => {
      try {
        const { data: { user } } = await supabase.auth.getUser()
        if (user) {
          // Supabase sets email_confirmed_at when email is verified
          const isVerified = !!user.email_confirmed_at
          setIsVerifiedFromSupabase(isVerified)
        } else {
          setIsVerifiedFromSupabase(null)
        }
      } catch (error) {
        console.error("Error checking verification status:", error)
      } finally {
        setIsLoading(false)
      }
    }

    checkVerificationStatus()
  }, [])

  // Initialize cooldown from persisted storage (optional persistence across navigation)
  useEffect(() => {
    if (typeof window === "undefined") return
    const stored = window.localStorage.getItem("unseen_verification_resend_until")
    if (stored) {
      const ts = Number(stored)
      if (!Number.isNaN(ts) && ts > Date.now()) {
        setResendUntil(ts)
        setCooldownRemaining(Math.ceil((ts - Date.now()) / 1000))
      } else {
        window.localStorage.removeItem("unseen_verification_resend_until")
      }
    }
  }, [])

  // Tick down cooldown timer
  useEffect(() => {
    if (!resendUntil) return
    const interval = window.setInterval(() => {
      const diff = resendUntil - Date.now()
      if (diff <= 0) {
        setResendUntil(null)
        setCooldownRemaining(0)
        if (typeof window !== "undefined") {
          window.localStorage.removeItem("unseen_verification_resend_until")
        }
        window.clearInterval(interval)
      } else {
        setCooldownRemaining(Math.ceil(diff / 1000))
      }
    }, 1000)

    return () => window.clearInterval(interval)
  }, [resendUntil])

  // Don't show banner while loading, if verified, or if no email
  if (isLoading) return null
  if (isVerifiedFromSupabase === true) return null
  if (emailVerified) return null
  if (!userEmail) return null

  const handleSend = async () => {
    if (!serviceId || !templateId || !publicKey) {
      setStatus("error")
      setMessage("Email service is not configured. Add EmailJS keys to continue.")
      return
    }

    // Cooldown guard
    if (resendUntil && resendUntil > Date.now()) {
      setStatus("error")
      setMessage(`Please wait ${cooldownRemaining || 1}s before resending.`)
      return
    }

    const code = generateCode()
    setIsSending(true)
    setMessage("")

    try {
      await emailjs.send(
        serviceId,
        templateId,
        {
          to_email: userEmail,
          otp_code: code,
          user_name: userName || userEmail,
        },
        { publicKey },
      )
      setVerificationChallenge(code)
      setStatus("sent")
      setMessage("Code sent successfully")

      const nextUntil = Date.now() + COOLDOWN_SECONDS * 1000
      setResendUntil(nextUntil)
      setCooldownRemaining(COOLDOWN_SECONDS)
      if (typeof window !== "undefined") {
        window.localStorage.setItem("unseen_verification_resend_until", String(nextUntil))
      }
    } catch (error) {
      console.error("Email send failed", error)
      setStatus("error")
      setMessage("Could not send verification code. Try again.")
    } finally {
      setIsSending(false)
    }
  }

  const handleConfirm = () => {
    const trimmed = codeInput.trim()
    if (trimmed.length !== 6) {
      setStatus("error")
      setMessage("Enter the 6-digit code.")
      return
    }

    // Expiry check: 10 minutes
    if (!verificationSentAt) {
      setStatus("error")
      setMessage("Code expired. Request a new code.")
      return
    }

    const sentTime = new Date(verificationSentAt).getTime()
    const now = Date.now()
    const tenMinutesMs = 10 * 60 * 1000

    if (Number.isNaN(sentTime) || now - sentTime > tenMinutesMs) {
      setStatus("error")
      setMessage("Code expired")
      return
    }

    const success = confirmVerificationCode(trimmed)
    if (success) {
      setStatus("verified")
      setMessage("Email verified. Aura is now active.")
      setCodeInput("")
    } else {
      setStatus("error")
      setMessage("Invalid code")
    }
  }

  return (
    <div className="border-b border-border bg-muted/60">
      <div className="mx-auto max-w-4xl px-4 py-3 md:px-6">
        <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
          <div className="flex-1 space-y-1">
            <p className="text-sm font-medium">
              Verify your email to activate Aura growth and save long-term progress.
            </p>
            <p className="text-xs text-muted-foreground">
              Aura is visible. Growth and decay remain paused until verification is complete.
            </p>
          </div>
          <div className="flex flex-col gap-2 md:flex-row md:items-center">
            <div className="flex items-center gap-2">
              <Button variant="secondary" onClick={handleSend} disabled={isSending} className="whitespace-nowrap">
                {status === "sent" && verificationCode ? "Resend code" : "Verify Email"}
              </Button>
              <Input
                value={codeInput}
                onChange={(e) => setCodeInput(e.target.value.replace(/[^0-9]/g, "").slice(0, 6))}
                placeholder="6-digit code"
                className="w-32"
                inputMode="numeric"
              />
              <Button onClick={handleConfirm} variant="outline">
                Confirm
              </Button>
            </div>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="ghost"
                onClick={handleSend}
                disabled={isSending || cooldownRemaining > 0}
                className="px-0 text-xs font-medium text-primary hover:text-primary"
              >
                Resend Code
              </Button>
              {cooldownRemaining > 0 && (
                <span className="text-[11px] text-muted-foreground">
                  Resend available in {cooldownRemaining}s
                </span>
              )}
            </div>
            {message && (
              <p
                className={cn(
                  "text-xs",
                  status === "verified" ? "text-success" : status === "error" ? "text-destructive" : "text-muted-foreground",
                )}
              >
                {message}
              </p>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}


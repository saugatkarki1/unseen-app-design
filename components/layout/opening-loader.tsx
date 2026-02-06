"use client"

import { useEffect, useState, useRef } from "react"
import anime from "animejs"

// Daily motivational quotes - action-oriented, serious, non-cheesy
// One quote per day, selected deterministically based on date
const QUOTES = [
  "Start before you feel ready.",
  "Discipline creates the future you want.",
  "One focused action is enough.",
  "Consistency compounds in silence.",
  "The work doesn't need an audience to matter.",
  "Identity determines trajectory, not goals.",
  "Act before motivation arrives.",
  "Small repeated efforts create lasting change.",
  "Progress accumulates in the margins.",
  "Show up on schedule, not when inspired.",
  "The gap grows silently when you skip.",
  "Every action is a vote for who you become.",
  "Real progress is quiet and unannounced.",
  "Friction tells you where you need to go.",
  "The disciplined do not wait to feel ready.",
  "Motivation follows action, not the other way around.",
  "One hour daily outweighs weekend sprints.",
  "The person who runs is a runner, regardless of races.",
  "Focus less on achievement, more on becoming.",
  "Let your actions compound in silence.",
  "High friction activities are often high value.",
  "The muse visits those already at work.",
  "Sustainable intensity beats heroic effort.",
  "Acknowledge the gap, then decide if you'll let it grow.",
  "The future self is built in moments you choose to act.",
  "Professional code looks different from tutorial code.",
  "Quality of help is proportional to quality of question.",
  "You learn to write by reading.",
  "Three solid projects beat thirty tutorial clones.",
  "Proof of work matters more than certificates.",
  "The work doesn't need validation to be real.",
]

/**
 * Get the quote for today based on the date
 * Uses day of year to ensure consistency throughout the day
 */
function getTodayQuote(): string {
  const now = new Date()
  const startOfYear = new Date(now.getFullYear(), 0, 0)
  const dayOfYear = Math.floor((now.getTime() - startOfYear.getTime()) / (1000 * 60 * 60 * 24))
  const quoteIndex = dayOfYear % QUOTES.length
  return QUOTES[quoteIndex]
}

/**
 * Opening Loader Component
 * 
 * Full-screen loader that appears on initial page load/refresh.
 * Shows a daily rotating motivational quote with smooth fade transitions.
 * Only appears once per session (on initial load, not internal navigation).
 */
export function OpeningLoader() {
  const [shouldRender, setShouldRender] = useState(true)
  const [isFadingOut, setIsFadingOut] = useState(false)
  const quote = getTodayQuote()
  const quoteRef = useRef<HTMLHeadingElement>(null)
  const animationRef = useRef<anime.AnimeInstance | null>(null)

  useEffect(() => {
    // Check if loader was already shown in this session
    const loaderShown = sessionStorage.getItem("frysta-loader-shown")

    if (loaderShown === "true") {
      // Already shown in this session, skip rendering
      setShouldRender(false)
      return
    }

    // Mark as shown immediately to prevent re-renders
    sessionStorage.setItem("frysta-loader-shown", "true")

    // Initialize quote animation
    if (quoteRef.current) {
      const textWrapper = quoteRef.current
      const textContent = textWrapper.textContent || ""
      textWrapper.innerHTML = textContent.replace(/\S/g, "<span class='letter'>$&</span>")

      // Start letter-by-letter animation - scoped to this quote element
      // Total animation time ~1.8s for the text
      animationRef.current = anime({
        targets: quoteRef.current.querySelectorAll(".letter"),
        opacity: [0, 1],
        duration: 1800,
        delay: 0,
        easing: "easeOutExpo",
      })
    }

    // Track timeouts for cleanup
    let fadeOutTimer: NodeJS.Timeout
    let removeTimer: NodeJS.Timeout

    // Fixed duration for loader: 5 seconds
    const duration = 5000

    // Start fade out after duration
    fadeOutTimer = setTimeout(() => {
      // Check if component is still mounted/valid before updating state
      if (document.hidden) return // Optional optimization

      setIsFadingOut(true)
      // Remove from DOM after fade completes
      removeTimer = setTimeout(() => {
        setShouldRender(false)
      }, 400) // Match transition duration
    }, duration)

    return () => {
      clearTimeout(fadeOutTimer)
      clearTimeout(removeTimer)
      // Clean up animation
      if (animationRef.current) {
        animationRef.current.pause()
        animationRef.current = null
      }
    }
  }, [])

  // Don't render if not needed
  if (!shouldRender || !quote) {
    return null
  }

  return (
    <div
      className="fixed inset-0 z-[9999] flex items-center justify-center bg-primary transition-all ease-out"
      style={{
        opacity: isFadingOut ? 0 : 1,
        transform: isFadingOut ? "translateY(-4px)" : "translateY(0)",
        transitionDuration: "400ms",
        pointerEvents: isFadingOut ? "none" : "auto",
      }}
      aria-live="polite"
      aria-label="Loading"
    >
      <div className="mx-auto max-w-2xl px-6 text-center">
        {/* Animated ring - existing element */}
        <div className="mb-8 flex justify-center">
          <div className="h-12 w-12 rounded-full border-2 border-white/20 border-t-white animate-spin" />
        </div>

        {/* FRYSTA wordmark - existing element */}
        <p className="text-xs uppercase tracking-[0.2em] text-white/40 sm:text-sm">
          FRYSTA
        </p>

        {/* Animated quote - letter-by-letter animation */}
        <h1 ref={quoteRef} className="ml3 frysta-quote">
          {quote}
        </h1>
      </div>
    </div>
  )
}


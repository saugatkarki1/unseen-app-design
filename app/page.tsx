"use client"

import { useState, useCallback } from "react"
import { HeroSection } from "@/components/ui/hero-section"
import Preloader from "@/components/ui/preloader"

export default function HomePage() {
  const [showPreloader, setShowPreloader] = useState(true)

  const handleComplete = useCallback(() => {
    setShowPreloader(false)
  }, [])

  return (
    <>
      {showPreloader && <Preloader onComplete={handleComplete} />}
      <main className='w-full'>
        <HeroSection />
      </main>
    </>
  )
}

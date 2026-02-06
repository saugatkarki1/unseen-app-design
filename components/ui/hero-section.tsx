"use client"

import type React from "react"

import { useState } from "react"
import { ArrowUpRight } from "lucide-react"
import { useRouter } from "next/navigation"

export function HeroSection() {
    const [isHovered, setIsHovered] = useState(false)
    const [isClicked, setIsClicked] = useState(false)
    const router = useRouter()

    const handleClick = (e: React.MouseEvent<HTMLDivElement>) => {
        e.preventDefault()
        setIsClicked(true)

        setTimeout(() => {
            router.push("/auth")
        }, 500)
    }

    return (
        <section className="flex min-h-screen items-center justify-center px-6">
            <div className="relative flex flex-col items-center gap-12">
                {/* Status indicator */}
                <div
                    className="flex items-center gap-3 transition-all duration-500"
                    style={{
                        opacity: isClicked ? 0 : 1,
                        transform: isClicked ? "translateY(-20px)" : "translateY(0)",
                        pointerEvents: isClicked ? "none" : "auto",
                    }}
                >
                    <span className="relative flex size-2">
                        <span className="absolute inline-flex h-full w-full animate-ping rounded-full bg-primary opacity-75" />
                        <span className="relative inline-flex size-2 rounded-full bg-primary" />
                    </span>
                    <span className="text-sm font-medium tracking-widest uppercase text-muted-foreground">
                        Private Learning System
                    </span>
                </div>

                {/* Main content */}
                <div
                    className="group relative cursor-pointer"
                    onMouseEnter={() => setIsHovered(true)}
                    onMouseLeave={() => setIsHovered(false)}
                    onClick={handleClick}
                    style={{
                        pointerEvents: isClicked ? "none" : "auto",
                    }}
                >
                    <div className="flex flex-col items-center gap-6">
                        <h2
                            className="relative text-center text-5xl font-light tracking-tight text-foreground sm:text-6xl md:text-7xl lg:text-8xl transition-all duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                            style={{
                                opacity: isClicked ? 0 : 1,
                                transform: isClicked ? "translateY(-40px) scale(0.95)" : "translateY(0) scale(1)",
                            }}
                        >
                            <span className="block overflow-hidden">
                                <span
                                    className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)]"
                                    style={{
                                        transform: isHovered && !isClicked ? "translateY(-8%)" : "translateY(0)",
                                    }}
                                >
                                    Let's Build Our
                                </span>
                            </span>
                            <span className="block overflow-hidden">
                                <span
                                    className="block transition-transform duration-700 ease-[cubic-bezier(0.16,1,0.3,1)] delay-75"
                                    style={{
                                        transform: isHovered && !isClicked ? "translateY(-8%)" : "translateY(0)",
                                    }}
                                >
                                    <span className="text-muted-foreground/60">Future Together</span>
                                </span>
                            </span>
                        </h2>

                        {/* Arrow button */}
                        <div className="relative mt-4 flex size-16 items-center justify-center sm:size-20">
                            <div
                                className="pointer-events-none absolute inset-0 rounded-full border transition-all ease-out"
                                style={{
                                    borderColor: isClicked ? "var(--primary)" : isHovered ? "var(--primary)" : "var(--border)",
                                    backgroundColor: isClicked ? "transparent" : isHovered ? "var(--primary)" : "transparent",
                                    transform: isClicked ? "scale(3)" : isHovered ? "scale(1.1)" : "scale(1)",
                                    opacity: isClicked ? 0 : 1,
                                    transitionDuration: isClicked ? "700ms" : "500ms",
                                }}
                            />
                            <ArrowUpRight
                                className="size-6 transition-all ease-[cubic-bezier(0.16,1,0.3,1)] sm:size-7"
                                style={{
                                    transform: isClicked
                                        ? "translate(100px, -100px) scale(0.5)"
                                        : isHovered
                                            ? "translate(2px, -2px)"
                                            : "translate(0, 0)",
                                    opacity: isClicked ? 0 : 1,
                                    color: isHovered && !isClicked ? "var(--primary-foreground)" : "var(--foreground)",
                                    transitionDuration: isClicked ? "600ms" : "500ms",
                                }}
                            />
                        </div>
                    </div>

                    {/* Decorative lines */}
                    <div className="absolute -left-8 top-1/2 -translate-y-1/2 sm:-left-16">
                        <div
                            className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
                            style={{
                                transform: isClicked ? "scaleX(0) translateX(-20px)" : isHovered ? "scaleX(1.5)" : "scaleX(1)",
                                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
                            }}
                        />
                    </div>
                    <div className="absolute -right-8 top-1/2 -translate-y-1/2 sm:-right-16">
                        <div
                            className="h-px w-8 bg-border transition-all duration-500 sm:w-12"
                            style={{
                                transform: isClicked ? "scaleX(0) translateX(20px)" : isHovered ? "scaleX(1.5)" : "scaleX(1)",
                                opacity: isClicked ? 0 : isHovered ? 1 : 0.5,
                            }}
                        />
                    </div>
                </div>

                {/* Description */}
                <div
                    className="mt-8 flex flex-col items-center gap-4 text-center transition-all duration-500 delay-100"
                    style={{
                        opacity: isClicked ? 0 : 1,
                        transform: isClicked ? "translateY(20px)" : "translateY(0)",
                        pointerEvents: isClicked ? "none" : "auto",
                    }}
                >
                    <p className="max-w-md text-sm leading-relaxed text-muted-foreground">
                        A private learning system for disciplined self-formation. Begin your journey of intentional growth.
                    </p>
                    <span className="text-xs tracking-widest uppercase text-muted-foreground/60">Click to get started</span>
                </div>
            </div>
        </section>
    )
}

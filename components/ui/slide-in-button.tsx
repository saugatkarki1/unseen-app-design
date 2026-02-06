"use client"

import { useState } from "react"
import Link from "next/link"
import { ArrowRight } from "lucide-react"
import { cn } from "@/lib/utils"

interface SlideInButtonProps {
    children?: React.ReactNode
    href?: string
    onClick?: () => void
    className?: string
    defaultBgColor?: string
    hoverBgColor?: string
    defaultTextColor?: string
    hoverTextColor?: string
    size?: "sm" | "md" | "lg"
    disabled?: boolean
    type?: "button" | "submit" | "reset"
    showIcon?: boolean
}

export function SlideInButton({
    children = "Get Started",
    href,
    onClick,
    className,
    defaultBgColor = "bg-white",
    hoverBgColor = "bg-primary",
    defaultTextColor = "text-black",
    hoverTextColor = "text-white",
    size = "lg",
    disabled = false,
    type = "button",
    showIcon = true,
}: SlideInButtonProps) {
    const [isHovered, setIsHovered] = useState(false)

    const sizeClasses = {
        sm: "px-4 py-1.5 text-sm",
        md: "px-5 py-2.5 text-base",
        lg: "px-6 py-3.5 text-base",
    }

    const iconSizeClasses = {
        sm: "h-4 w-4",
        md: "h-5 w-5",
        lg: "h-5 w-5",
    }

    const buttonContent = (
        <span
            className={cn(
                "relative inline-flex items-center justify-center gap-2 overflow-hidden rounded-full font-medium transition-all duration-300",
                sizeClasses[size],
                defaultBgColor,
                disabled && "opacity-50 cursor-not-allowed",
                className
            )}
            onMouseEnter={() => !disabled && setIsHovered(true)}
            onMouseLeave={() => setIsHovered(false)}
        >
            {/* Sliding background fill */}
            <span
                className={cn(
                    "absolute inset-0 rounded-full transition-transform duration-500 ease-out",
                    hoverBgColor,
                    isHovered ? "translate-y-0" : "translate-y-full"
                )}
                style={{
                    transformOrigin: "bottom center",
                }}
            />

            {/* Text content */}
            <span
                className={cn(
                    "relative z-10 transition-colors duration-300",
                    isHovered ? hoverTextColor : defaultTextColor
                )}
            >
                {children}
            </span>

            {/* Arrow icon */}
            {showIcon && (
                <span
                    className={cn(
                        "relative z-10 transition-all duration-300",
                        isHovered ? hoverTextColor : defaultTextColor,
                        isHovered ? "translate-x-0 opacity-100" : "translate-x-2 opacity-0"
                    )}
                >
                    <ArrowRight className={iconSizeClasses[size]} />
                </span>
            )}
        </span>
    )

    if (href) {
        return (
            <Link href={href} className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full">
                {buttonContent}
            </Link>
        )
    }

    return (
        <button
            type={type}
            onClick={onClick}
            disabled={disabled}
            className="focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2 rounded-full"
        >
            {buttonContent}
        </button>
    )
}

"use client"

// app/(app)/mentor-onboarding/page.tsx
// ============================================================================
// MENTOR ONBOARDING PAGE
// ============================================================================
// Multi-step form for mentor onboarding. Collects expertise, experience,
// availability, and motivation before granting mentor dashboard access.
// ============================================================================

import { useState, useEffect, useCallback } from "react"
import { useRouter } from "next/navigation"
import {
    ArrowRight,
    ArrowLeft,
    CheckCircle,
    User,
    Building2,
    Sparkles,
    Target,
    Clock,
    Heart,
    Loader2,
} from "lucide-react"
import { cn } from "@/lib/utils"
import {
    saveMentorOnboardingField,
    getMentorOnboardingStatus,
    completeMentorOnboarding,
    MENTOR_EXPERTISE_OPTIONS,
    MENTOR_EXPERIENCE_LEVELS,
    MENTOR_AVAILABILITY_OPTIONS,
    type MentorOnboardingField,
} from "@/lib/actions/mentor-onboarding-actions"
import type { MentorExperienceLevel, MentorAvailability } from "@/lib/supabase/types"

// ============================================================================
// TYPES
// ============================================================================

type Step = "full_name" | "info" | "expertise" | "experience" | "availability" | "motivation" | "complete"

const STEPS: Step[] = ["full_name", "info", "expertise", "experience", "availability", "motivation", "complete"]

// ============================================================================
// MAIN COMPONENT
// ============================================================================

export default function MentorOnboardingPage() {
    const router = useRouter()

    // State
    const [currentStep, setCurrentStep] = useState<Step>("full_name")
    const [isLoading, setIsLoading] = useState(true)
    const [isSaving, setIsSaving] = useState(false)
    const [error, setError] = useState<string | null>(null)

    // Form data
    const [fullName, setFullName] = useState("")
    const [email, setEmail] = useState("")
    const [institution, setInstitution] = useState("")
    const [expertise, setExpertise] = useState<string[]>([])
    const [experienceLevel, setExperienceLevel] = useState<MentorExperienceLevel | "">("")
    const [availability, setAvailability] = useState<MentorAvailability | "">("")
    const [motivation, setMotivation] = useState("")

    // ========================================================================
    // LOAD EXISTING DATA
    // ========================================================================
    // Note: Authentication and routing are handled by the server-side layout gate.
    // This useEffect only loads existing profile data for pre-filling form fields.
    // NO redirect logic should be here - the layout gate is the single authority.

    useEffect(() => {
        async function loadExistingData() {
            try {
                const status = await getMentorOnboardingStatus()

                // Pre-fill form with existing data
                if (status.profile) {
                    setFullName(status.profile.full_name || "")
                    setEmail(status.profile.email || "")
                    setInstitution(status.profile.institution || "")
                    setExpertise(status.profile.mentor_expertise || [])
                    setExperienceLevel(status.profile.mentor_experience_level || "")
                    setAvailability(status.profile.mentor_availability || "")
                    setMotivation(status.profile.mentor_motivation || "")
                }
            } catch (err) {
                console.error("[MentorOnboarding] Error loading existing data:", err)
            } finally {
                setIsLoading(false)
            }
        }
        loadExistingData()
    }, [])

    // ========================================================================
    // NAVIGATION
    // ========================================================================

    const currentStepIndex = STEPS.indexOf(currentStep)
    const totalSteps = STEPS.length - 1 // Exclude "complete" from count
    const progress = (currentStepIndex / totalSteps) * 100

    const goToStep = useCallback((step: Step) => {
        setError(null)
        setCurrentStep(step)
    }, [])

    const goNext = useCallback(() => {
        const nextIndex = currentStepIndex + 1
        if (nextIndex < STEPS.length) {
            goToStep(STEPS[nextIndex])
        }
    }, [currentStepIndex, goToStep])

    const goBack = useCallback(() => {
        const prevIndex = currentStepIndex - 1
        if (prevIndex >= 0) {
            goToStep(STEPS[prevIndex])
        }
    }, [currentStepIndex, goToStep])

    // ========================================================================
    // SAVE HANDLERS
    // ========================================================================

    const saveField = async (field: MentorOnboardingField, value: string | string[]) => {
        setIsSaving(true)
        setError(null)

        const result = await saveMentorOnboardingField(field, value)

        setIsSaving(false)

        if (!result.success) {
            setError(result.error || "Failed to save")
            return false
        }

        return true
    }

    const handleFullNameNext = async () => {
        if (!fullName.trim() || fullName.trim().length < 2) {
            setError("Please enter your full name (at least 2 characters)")
            return
        }

        const success = await saveField("full_name", fullName.trim())
        if (success) goNext()
    }

    const handleInfoNext = async () => {
        // Institution is optional, just save if provided
        if (institution.trim()) {
            await saveField("institution", institution.trim())
        }
        goNext()
    }

    const handleExpertiseNext = async () => {
        if (expertise.length === 0) {
            setError("Please select at least one area of expertise")
            return
        }

        const success = await saveField("mentor_expertise", expertise)
        if (success) goNext()
    }

    const handleExperienceNext = async () => {
        if (!experienceLevel) {
            setError("Please select your experience level")
            return
        }

        const success = await saveField("mentor_experience_level", experienceLevel)
        if (success) goNext()
    }

    const handleAvailabilityNext = async () => {
        if (!availability) {
            setError("Please select your availability")
            return
        }

        const success = await saveField("mentor_availability", availability)
        if (success) goNext()
    }

    const handleMotivationNext = async () => {
        // Motivation is optional
        if (motivation.trim()) {
            await saveField("mentor_motivation", motivation.trim())
        }
        goNext()
    }

    const handleComplete = async () => {
        setIsSaving(true)
        setError(null)

        const result = await completeMentorOnboarding()

        setIsSaving(false)

        if (!result.success) {
            setError(result.error || "Failed to complete onboarding")
            return
        }

        // CRITICAL: NO client-side redirect decisions.
        // Use router.refresh() + router.push() to trigger the server-side layout gate,
        // which is the ONLY routing authority.
        // The layout gate will detect mentor onboarding is complete and redirect to /mentor-dashboard
        router.refresh()
        router.push("/")
    }

    // ========================================================================
    // RENDER LOADING
    // ========================================================================

    if (isLoading) {
        return (
            <div className="flex min-h-screen items-center justify-center px-4">
                <div className="cyber-card p-8 text-center">
                    <Loader2 className="h-8 w-8 animate-spin text-primary mx-auto mb-4" />
                    <p className="text-sm text-muted-foreground">Loading...</p>
                </div>
            </div>
        )
    }

    // ========================================================================
    // RENDER
    // ========================================================================

    return (
        <div className="flex min-h-screen flex-col items-center justify-center px-4 py-8">
            {/* Progress Bar */}
            <div className="w-full max-w-lg mb-8">
                <div className="flex items-center justify-between mb-2">
                    <span className="text-xs font-tech text-muted-foreground">
                        Mentor Onboarding
                    </span>
                    <span className="text-xs font-tech text-muted-foreground">
                        Step {Math.min(currentStepIndex + 1, totalSteps)} of {totalSteps}
                    </span>
                </div>
                <div className="h-1 w-full bg-secondary rounded-full overflow-hidden">
                    <div
                        className="h-full bg-gradient-to-r from-primary to-primary/70 transition-all duration-500 ease-out"
                        style={{ width: `${Math.min(progress, 100)}%` }}
                    />
                </div>

                {/* Step Indicators */}
                <div className="flex justify-between mt-3">
                    {STEPS.slice(0, -1).map((step, idx) => (
                        <div
                            key={step}
                            className={cn(
                                "w-8 h-8 rounded-full flex items-center justify-center text-xs font-tech transition-all duration-300",
                                idx < currentStepIndex
                                    ? "bg-primary text-primary-foreground"
                                    : idx === currentStepIndex
                                        ? "bg-primary/20 text-primary ring-2 ring-primary"
                                        : "bg-secondary text-muted-foreground"
                            )}
                        >
                            {idx < currentStepIndex ? (
                                <CheckCircle className="h-4 w-4" />
                            ) : (
                                idx + 1
                            )}
                        </div>
                    ))}
                </div>
            </div>

            {/* Step Content */}
            <div className="w-full max-w-lg">
                {currentStep === "full_name" && (
                    <StepCard
                        icon={<User className="h-8 w-8" />}
                        title="What's your full name?"
                        subtitle="This will be displayed to learners you mentor."
                    >
                        <input
                            type="text"
                            className="cyber-input w-full px-4 py-3 text-lg"
                            placeholder="Enter your full name"
                            value={fullName}
                            onChange={(e) => setFullName(e.target.value)}
                            autoFocus
                        />
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        <StepActions
                            onNext={handleFullNameNext}
                            isSaving={isSaving}
                            showBack={false}
                        />
                    </StepCard>
                )}

                {currentStep === "info" && (
                    <StepCard
                        icon={<Building2 className="h-8 w-8" />}
                        title="Institution / Organization"
                        subtitle="Optional. Where do you work or study?"
                    >
                        <div className="space-y-4">
                            <div>
                                <label className="block text-xs font-tech text-muted-foreground mb-1">
                                    Role
                                </label>
                                <div className="cyber-card-inner px-4 py-3 text-foreground bg-secondary/50">
                                    <span className="inline-flex items-center gap-2">
                                        <Sparkles className="h-4 w-4 text-primary" />
                                        Mentor
                                    </span>
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-tech text-muted-foreground mb-1">
                                    Email
                                </label>
                                <div className="cyber-card-inner px-4 py-3 text-muted-foreground bg-secondary/50">
                                    {email || "Not available"}
                                </div>
                            </div>
                            <div>
                                <label className="block text-xs font-tech text-muted-foreground mb-1">
                                    Institution (Optional)
                                </label>
                                <input
                                    type="text"
                                    className="cyber-input w-full px-4 py-3"
                                    placeholder="e.g., Google, MIT, Freelance"
                                    value={institution}
                                    onChange={(e) => setInstitution(e.target.value)}
                                />
                            </div>
                        </div>
                        <StepActions
                            onNext={handleInfoNext}
                            onBack={goBack}
                            isSaving={isSaving}
                            nextLabel="Continue"
                        />
                    </StepCard>
                )}

                {currentStep === "expertise" && (
                    <StepCard
                        icon={<Target className="h-8 w-8" />}
                        title="Areas of Expertise"
                        subtitle="Select all areas you can mentor learners in."
                    >
                        <div className="grid grid-cols-2 gap-3">
                            {MENTOR_EXPERTISE_OPTIONS.map((area) => (
                                <button
                                    key={area}
                                    onClick={() => {
                                        setExpertise((prev) =>
                                            prev.includes(area)
                                                ? prev.filter((a) => a !== area)
                                                : [...prev, area]
                                        )
                                    }}
                                    className={cn(
                                        "px-4 py-3 rounded-lg text-sm font-tech transition-all duration-200",
                                        "border-2",
                                        expertise.includes(area)
                                            ? "bg-primary/20 border-primary text-primary"
                                            : "bg-secondary border-transparent text-foreground hover:border-primary/50"
                                    )}
                                >
                                    {area}
                                </button>
                            ))}
                        </div>
                        {expertise.length > 0 && (
                            <p className="text-xs text-muted-foreground mt-3">
                                Selected: {expertise.join(", ")}
                            </p>
                        )}
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        <StepActions
                            onNext={handleExpertiseNext}
                            onBack={goBack}
                            isSaving={isSaving}
                        />
                    </StepCard>
                )}

                {currentStep === "experience" && (
                    <StepCard
                        icon={<Sparkles className="h-8 w-8" />}
                        title="Experience Level"
                        subtitle="How would you describe your mentoring experience?"
                    >
                        <div className="space-y-3">
                            {MENTOR_EXPERIENCE_LEVELS.map((level) => (
                                <button
                                    key={level}
                                    onClick={() => setExperienceLevel(level)}
                                    className={cn(
                                        "w-full px-4 py-4 rounded-lg text-left transition-all duration-200",
                                        "border-2",
                                        experienceLevel === level
                                            ? "bg-primary/20 border-primary"
                                            : "bg-secondary border-transparent hover:border-primary/50"
                                    )}
                                >
                                    <span className="font-tech text-foreground capitalize">
                                        {level}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {level === "beginner" && "New to mentoring, eager to help learners"}
                                        {level === "intermediate" && "Some mentoring experience, comfortable guiding"}
                                        {level === "advanced" && "Extensive mentoring experience, proven track record"}
                                    </p>
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        <StepActions
                            onNext={handleExperienceNext}
                            onBack={goBack}
                            isSaving={isSaving}
                        />
                    </StepCard>
                )}

                {currentStep === "availability" && (
                    <StepCard
                        icon={<Clock className="h-8 w-8" />}
                        title="Time Commitment"
                        subtitle="How much time can you dedicate to mentoring?"
                    >
                        <div className="space-y-3">
                            {MENTOR_AVAILABILITY_OPTIONS.map((option) => (
                                <button
                                    key={option}
                                    onClick={() => setAvailability(option)}
                                    className={cn(
                                        "w-full px-4 py-4 rounded-lg text-left transition-all duration-200",
                                        "border-2",
                                        availability === option
                                            ? "bg-primary/20 border-primary"
                                            : "bg-secondary border-transparent hover:border-primary/50"
                                    )}
                                >
                                    <span className="font-tech text-foreground capitalize">
                                        {option === "fulltime" ? "Full-time" : option}
                                    </span>
                                    <p className="text-xs text-muted-foreground mt-1">
                                        {option === "casual" && "A few hours per week, flexible schedule"}
                                        {option === "regular" && "10-20 hours per week, consistent availability"}
                                        {option === "fulltime" && "20+ hours per week, highly available"}
                                    </p>
                                </button>
                            ))}
                        </div>
                        {error && <p className="text-sm text-destructive mt-2">{error}</p>}
                        <StepActions
                            onNext={handleAvailabilityNext}
                            onBack={goBack}
                            isSaving={isSaving}
                        />
                    </StepCard>
                )}

                {currentStep === "motivation" && (
                    <StepCard
                        icon={<Heart className="h-8 w-8" />}
                        title="Your Motivation"
                        subtitle="Optional. What drives you to mentor others?"
                    >
                        <textarea
                            className="cyber-input w-full px-4 py-3 min-h-[120px] resize-none"
                            placeholder="e.g., I want to help beginners learn web development and avoid common pitfalls..."
                            value={motivation}
                            onChange={(e) => setMotivation(e.target.value)}
                        />
                        <p className="text-xs text-muted-foreground mt-2">
                            This helps us understand your goals and match you with the right learners.
                        </p>
                        <StepActions
                            onNext={handleMotivationNext}
                            onBack={goBack}
                            isSaving={isSaving}
                            nextLabel="Continue"
                        />
                    </StepCard>
                )}

                {currentStep === "complete" && (
                    <StepCard
                        icon={<CheckCircle className="h-8 w-8 text-green-500" />}
                        title="You're All Set!"
                        subtitle="Review your information and complete onboarding."
                    >
                        <div className="space-y-4">
                            <SummaryRow label="Name" value={fullName} />
                            <SummaryRow label="Role" value="Mentor" />
                            <SummaryRow label="Institution" value={institution || "Not specified"} />
                            <SummaryRow label="Expertise" value={expertise.join(", ")} />
                            <SummaryRow label="Experience" value={experienceLevel} capitalize />
                            <SummaryRow
                                label="Availability"
                                value={availability === "fulltime" ? "Full-time" : availability}
                                capitalize
                            />
                            {motivation && (
                                <SummaryRow label="Motivation" value={motivation} />
                            )}
                        </div>
                        {error && <p className="text-sm text-destructive mt-4">{error}</p>}
                        <div className="flex gap-3 mt-6">
                            <button
                                onClick={goBack}
                                className="flex-1 py-3 px-4 rounded-lg font-tech text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors"
                            >
                                <ArrowLeft className="inline h-4 w-4 mr-1" />
                                Back
                            </button>
                            <button
                                onClick={handleComplete}
                                disabled={isSaving}
                                className="flex-1 py-3 px-4 rounded-lg font-tech text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50"
                            >
                                {isSaving ? (
                                    <>
                                        <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                                        Completing...
                                    </>
                                ) : (
                                    <>
                                        Complete Onboarding
                                        <CheckCircle className="inline h-4 w-4 ml-1" />
                                    </>
                                )}
                            </button>
                        </div>
                    </StepCard>
                )}
            </div>
        </div>
    )
}

// ============================================================================
// SUB-COMPONENTS
// ============================================================================

function StepCard({
    icon,
    title,
    subtitle,
    children,
}: {
    icon: React.ReactNode
    title: string
    subtitle: string
    children: React.ReactNode
}) {
    return (
        <div className="cyber-card p-6 animate-in fade-in-0 slide-in-from-bottom-4 duration-300">
            <div className="flex items-center gap-3 mb-6">
                <div className="p-2 rounded-lg bg-primary/10 text-primary">
                    {icon}
                </div>
                <div>
                    <h2 className="text-lg font-tech font-bold text-foreground">{title}</h2>
                    <p className="text-sm text-muted-foreground">{subtitle}</p>
                </div>
            </div>
            {children}
        </div>
    )
}

function StepActions({
    onNext,
    onBack,
    isSaving,
    nextLabel = "Next",
    showBack = true,
}: {
    onNext: () => void
    onBack?: () => void
    isSaving: boolean
    nextLabel?: string
    showBack?: boolean
}) {
    return (
        <div className="flex gap-3 mt-6">
            {showBack && onBack && (
                <button
                    onClick={onBack}
                    disabled={isSaving}
                    className="py-3 px-4 rounded-lg font-tech text-sm bg-secondary text-foreground hover:bg-secondary/80 transition-colors disabled:opacity-50"
                >
                    <ArrowLeft className="inline h-4 w-4 mr-1" />
                    Back
                </button>
            )}
            <button
                onClick={onNext}
                disabled={isSaving}
                className={cn(
                    "py-3 px-6 rounded-lg font-tech text-sm bg-primary text-primary-foreground hover:bg-primary/90 transition-colors disabled:opacity-50",
                    showBack ? "flex-1" : "w-full"
                )}
            >
                {isSaving ? (
                    <>
                        <Loader2 className="inline h-4 w-4 mr-1 animate-spin" />
                        Saving...
                    </>
                ) : (
                    <>
                        {nextLabel}
                        <ArrowRight className="inline h-4 w-4 ml-1" />
                    </>
                )}
            </button>
        </div>
    )
}

function SummaryRow({
    label,
    value,
    capitalize = false,
}: {
    label: string
    value: string
    capitalize?: boolean
}) {
    return (
        <div className="flex justify-between items-start py-2 border-b border-border/50">
            <span className="text-xs font-tech uppercase tracking-wider text-muted-foreground">
                {label}
            </span>
            <span className={cn(
                "text-sm text-foreground text-right max-w-[60%]",
                capitalize && "capitalize"
            )}>
                {value}
            </span>
        </div>
    )
}

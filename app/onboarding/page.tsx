"use client"

import { useState } from "react"
import { useRouter } from "next/navigation"
import {
  ArrowRight,
  ArrowLeft,
  GraduationCap,
  Users,
  CheckCircle,
  Building2,
  BookOpen,
  Clock,
  Target,
  Sparkles,
  Briefcase,
  Lightbulb,
  Rocket,
  HelpCircle,
} from "lucide-react"
import { supabase } from "@/lib/supabaseClient"
import { saveOnboardingResponse, completeOnboarding, getUserRole, type OnboardingStep } from "./actions"
import { classifyIntent } from "@/lib/intent-classifier"
import { cn } from "@/lib/utils"

type Step = "identity" | "role" | "institution" | "learning_goal" | "skill_level" | "time_commitment" | "motivation"

// Student onboarding steps (mentors exit immediately after role selection)
const STUDENT_STEPS: Step[] = ["identity", "role", "institution", "learning_goal", "skill_level", "time_commitment", "motivation"]

/**
 * Onboarding Page
 * 
 * Multi-step form collecting all mandatory user information after signup.
 * Users cannot access the dashboard until onboarding is complete.
 * 
 * Mandatory fields:
 * - full_name, role, institution
 * - For students: learning_goal, skill_level, time_commitment, motivation_type
 */
export default function OnboardingPage() {
  const router = useRouter()

  // Form state
  const [step, setStep] = useState<Step>("identity")
  const [fullName, setFullName] = useState("")
  const [role, setRole] = useState<"student" | "mentor" | null>(null)
  const [institution, setInstitution] = useState("")
  const [learningGoal, setLearningGoal] = useState("")
  const [skillLevel, setSkillLevel] = useState<"beginner" | "intermediate" | "advanced" | null>(null)
  const [timeCommitment, setTimeCommitment] = useState<"casual" | "regular" | "intensive" | null>(null)
  const [motivationType, setMotivationType] = useState<"career" | "curiosity" | "project" | "other" | null>(null)

  // UI state
  const [error, setError] = useState("")
  const [isTransitioning, setIsTransitioning] = useState(false)
  const [isSubmitting, setIsSubmitting] = useState(false)

  // Note: Authentication and routing are handled by the server-side layout gate.
  // This page only renders the form - no client-side redirect logic needed.

  // Get step configuration - always returns student steps
  // Mentors exit immediately after role selection and use /mentor-onboarding
  const getSteps = (): Step[] => {
    return STUDENT_STEPS
  }

  // Smooth step transitions
  const goToStep = (nextStep: Step) => {
    setIsTransitioning(true)
    setTimeout(() => {
      setStep(nextStep)
      setIsTransitioning(false)
      setError("")
    }, 150)
  }

  // Navigate to next step
  const getNextStep = (): Step | null => {
    const steps = getSteps()
    const currentIndex = steps.indexOf(step)
    if (currentIndex < steps.length - 1) {
      return steps[currentIndex + 1]
    }
    return null
  }

  // Navigate to previous step
  const getPreviousStep = (): Step | null => {
    const steps = getSteps()
    const currentIndex = steps.indexOf(step)
    if (currentIndex > 0) {
      return steps[currentIndex - 1]
    }
    return null
  }

  // Save response and proceed
  const saveAndProceed = async (stepKey: OnboardingStep, value: string) => {
    setIsSubmitting(true)
    setError("")

    const result = await saveOnboardingResponse({
      stepKey,
      questionKey: stepKey,
      responseValue: value,
    })

    if (!result.success) {
      setError(result.error || "Failed to save response")
      setIsSubmitting(false)
      return false
    }

    setIsSubmitting(false)
    return true
  }

  // Step 1: Identity validation
  const handleIdentityNext = async () => {
    if (!fullName.trim()) {
      setError("Full name is required.")
      return
    }
    if (fullName.trim().length < 2) {
      setError("Please enter your full name.")
      return
    }

    const success = await saveAndProceed("full_name", fullName.trim())
    if (success) goToStep("role")
  }

  // Step 2: Role selection
  // CRITICAL: Mentor and Student onboarding are COMPLETELY SEPARATE flows.
  // - Students proceed through this page's steps
  // - Mentors are routed to /mentor-onboarding via the layout gate
  const handleRoleNext = async () => {
    if (!role) {
      setError("Please select a role.")
      return
    }

    const success = await saveAndProceed("role", role)
    if (success) {
      if (role === "mentor") {
        // MENTOR FLOW: Immediately stop student onboarding and redirect away.
        // Using replace() ensures mentors NEVER navigate back to /onboarding.
        // The layout gate will redirect to /mentor-onboarding.
        router.replace("/")
      } else {
        // STUDENT FLOW: Continue through student-specific steps
        goToStep("institution")
      }
    }
  }

  // Step 3: Institution (Students only)
  const handleInstitutionNext = async () => {
    if (!institution.trim()) {
      setError("Please tell us where you're from.")
      return
    }

    const success = await saveAndProceed("institution", institution.trim())
    if (success) {
      goToStep("learning_goal")
    }
  }

  // Step 4: Learning Goal
  const handleLearningGoalNext = async () => {
    if (!learningGoal.trim()) {
      setError("Please tell us what you want to learn.")
      return
    }

    // Run intent classifier
    const classification = classifyIntent(learningGoal.trim())

    const success = await saveOnboardingResponse({
      stepKey: "learning_direction",
      questionKey: "learning_goal",
      responseValue: learningGoal.trim(),
      responseMetadata: {
        classified_domain: classification.detected_domain,
        confidence: classification.confidence,
        needs_clarification: classification.needs_clarification,
      },
    })

    if (success) {
      setIsSubmitting(false)
      goToStep("skill_level")
    } else {
      setError("Failed to save response")
      setIsSubmitting(false)
    }
  }

  // Step 5: Skill Level
  const handleSkillLevelNext = async () => {
    if (!skillLevel) {
      setError("Please select your skill level.")
      return
    }

    const success = await saveAndProceed("skill_level", skillLevel)
    if (success) goToStep("time_commitment")
  }

  // Step 6: Time Commitment
  const handleTimeCommitmentNext = async () => {
    if (!timeCommitment) {
      setError("Please select your availability.")
      return
    }

    const success = await saveAndProceed("time_commitment", timeCommitment)
    if (success) goToStep("motivation")
  }

  // Step 7: Motivation (Final step for both students and mentors)
  const handleMotivationNext = async () => {
    if (!motivationType) {
      setError("Please select your motivation.")
      return
    }

    const success = await saveAndProceed("motivation", motivationType)
    if (success) handleComplete()
  }

  // Final submission (STUDENTS ONLY)
  // Mentors exit after role selection and never reach this function.
  const handleComplete = async () => {
    setIsSubmitting(true)
    setError("")

    const result = await completeOnboarding()

    if (!result.success) {
      setError(result.error || "Failed to complete onboarding.")
      setIsSubmitting(false)
      return
    }

    // Student onboarding complete - go to dashboard
    router.refresh()
    router.push("/dashboard")
  }

  // Calculate progress
  const steps = getSteps()
  const stepIndex = steps.indexOf(step)
  const totalSteps = steps.length
  const prevStep = getPreviousStep()


  return (
    <div className="min-h-screen flex flex-col items-center justify-center px-4 py-12 bg-background">
      <div
        className={cn(
          "w-full max-w-md space-y-8 transition-opacity duration-150",
          isTransitioning ? "opacity-0" : "opacity-100"
        )}
      >
        {/* Header */}
        <div className="text-center">
          <h1 className="text-sm font-semibold tracking-widest text-primary uppercase">
            Welcome
          </h1>
          <p className="mt-2 text-muted-foreground text-sm">
            Let&apos;s set up your profile
          </p>
        </div>

        {/* Step 1: Identity */}
        {step === "identity" && (
          <div className="space-y-8">
            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                What&apos;s your name?
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps us personalize your experience.
              </p>
            </div>

            <div className="space-y-4">
              <input
                type="text"
                placeholder="Full name"
                value={fullName}
                onChange={(e) => {
                  setFullName(e.target.value)
                  setError("")
                }}
                autoFocus
                autoComplete="name"
                disabled={isSubmitting}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-background",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  error ? "border-destructive" : "border-border"
                )}
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              onClick={handleIdentityNext}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 2: Role Selection */}
        {step === "role" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                How will you use this platform?
              </h2>
              <p className="text-sm text-muted-foreground">
                Choose the role that best describes you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {/* Student Card */}
              <button
                type="button"
                onClick={() => {
                  setRole("student")
                  setError("")
                }}
                disabled={isSubmitting}
                className={cn(
                  "p-5 rounded-xl border-2 transition-all duration-200 text-left",
                  "hover:border-primary/50 hover:bg-secondary/30",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  role === "student"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors",
                      role === "student"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <GraduationCap className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        Student
                      </h3>
                      {role === "student" && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Learn, practice, and track your progress
                    </p>
                  </div>
                </div>
              </button>

              {/* Mentor Card */}
              <button
                type="button"
                onClick={() => {
                  setRole("mentor")
                  setError("")
                }}
                disabled={isSubmitting}
                className={cn(
                  "p-5 rounded-xl border-2 transition-all duration-200 text-left",
                  "hover:border-primary/50 hover:bg-secondary/30",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  role === "mentor"
                    ? "border-primary bg-primary/5"
                    : "border-border bg-card"
                )}
              >
                <div className="flex items-start gap-4">
                  <div
                    className={cn(
                      "p-3 rounded-lg transition-colors",
                      role === "mentor"
                        ? "bg-primary/10 text-primary"
                        : "bg-secondary text-muted-foreground"
                    )}
                  >
                    <Users className="h-6 w-6" />
                  </div>
                  <div className="flex-1">
                    <div className="flex items-center justify-between">
                      <h3 className="font-semibold text-foreground">
                        Mentor
                      </h3>
                      {role === "mentor" && (
                        <CheckCircle className="h-5 w-5 text-primary" />
                      )}
                    </div>
                    <p className="mt-1 text-sm text-muted-foreground">
                      Guide others and share your expertise
                    </p>
                  </div>
                </div>
              </button>
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              onClick={handleRoleNext}
              disabled={!role || isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2",
                role
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 3: Institution */}
        {step === "institution" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                Where are you from?
              </h2>
              <p className="text-sm text-muted-foreground">
                Your school, college, or organization.
              </p>
            </div>

            <div className="space-y-4">
              <div className="grid grid-cols-2 gap-3">
                {[
                  { value: "High School", icon: Building2 },
                  { value: "College", icon: GraduationCap },
                  { value: "University", icon: Building2 },
                  { value: "Working Professional", icon: Briefcase },
                  { value: "Self-taught", icon: BookOpen },
                  { value: "Other", icon: HelpCircle },
                ].map((option) => (
                  <button
                    key={option.value}
                    type="button"
                    onClick={() => {
                      setInstitution(option.value)
                      setError("")
                    }}
                    disabled={isSubmitting}
                    className={cn(
                      "p-4 rounded-lg border-2 transition-all duration-200 text-left",
                      "hover:border-primary/50 hover:bg-secondary/30",
                      "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                      "disabled:opacity-50 disabled:cursor-not-allowed",
                      institution === option.value
                        ? "border-primary bg-primary/5"
                        : "border-border bg-card"
                    )}
                  >
                    <div className="flex items-center gap-3">
                      <option.icon className={cn(
                        "h-5 w-5",
                        institution === option.value ? "text-primary" : "text-muted-foreground"
                      )} />
                      <span className={cn(
                        "text-sm font-medium",
                        institution === option.value ? "text-foreground" : "text-muted-foreground"
                      )}>
                        {option.value}
                      </span>
                    </div>
                  </button>
                ))}
              </div>

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              onClick={handleInstitutionNext}
              disabled={!institution || isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2",
                institution
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  {role === "mentor" ? "Completing..." : "Saving..."}
                </>
              ) : (
                <>
                  {role === "mentor" ? "Complete" : "Continue"}
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 4: Learning Goal (Students only) */}
        {step === "learning_goal" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                What do you want to learn?
              </h2>
              <p className="text-sm text-muted-foreground">
                Tell us about your learning goals.
              </p>
            </div>

            <div className="space-y-4">
              <textarea
                placeholder="e.g., I want to learn web development, specifically React and Next.js..."
                value={learningGoal}
                onChange={(e) => {
                  setLearningGoal(e.target.value)
                  setError("")
                }}
                autoFocus
                disabled={isSubmitting}
                rows={4}
                className={cn(
                  "w-full px-4 py-3 rounded-lg border bg-background resize-none",
                  "focus:outline-none focus:ring-2 focus:ring-primary focus:border-transparent",
                  "disabled:opacity-50 disabled:cursor-not-allowed",
                  error ? "border-destructive" : "border-border"
                )}
              />

              {error && (
                <p className="text-sm text-destructive">{error}</p>
              )}
            </div>

            <button
              onClick={handleLearningGoalNext}
              disabled={isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium",
                "bg-primary text-primary-foreground",
                "hover:bg-primary/90 transition-colors",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "disabled:opacity-50 disabled:cursor-not-allowed",
                "flex items-center justify-center gap-2"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 5: Skill Level (Students only) */}
        {step === "skill_level" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                What&apos;s your current level?
              </h2>
              <p className="text-sm text-muted-foreground">
                This helps us tailor content to you.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  value: "beginner" as const,
                  label: "Beginner",
                  description: "Just starting my journey",
                  icon: Sparkles,
                },
                {
                  value: "intermediate" as const,
                  label: "Intermediate",
                  description: "Have some experience building projects",
                  icon: BookOpen,
                },
                {
                  value: "advanced" as const,
                  label: "Advanced",
                  description: "Comfortable with complex concepts",
                  icon: Rocket,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setSkillLevel(option.value)
                    setError("")
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "p-5 rounded-xl border-2 transition-all duration-200 text-left",
                    "hover:border-primary/50 hover:bg-secondary/30",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    skillLevel === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-lg transition-colors",
                        skillLevel === option.value
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {option.label}
                        </h3>
                        {skillLevel === option.value && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              onClick={handleSkillLevelNext}
              disabled={!skillLevel || isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2",
                skillLevel
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 6: Time Commitment (Students only) */}
        {step === "time_commitment" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                How much time can you dedicate?
              </h2>
              <p className="text-sm text-muted-foreground">
                We&apos;ll pace your learning accordingly.
              </p>
            </div>

            <div className="grid grid-cols-1 gap-4">
              {[
                {
                  value: "casual" as const,
                  label: "Casual",
                  description: "A few hours per week",
                  icon: Clock,
                },
                {
                  value: "regular" as const,
                  label: "Regular",
                  description: "Several hours per week",
                  icon: Target,
                },
                {
                  value: "intensive" as const,
                  label: "Intensive",
                  description: "Daily focused learning",
                  icon: Rocket,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setTimeCommitment(option.value)
                    setError("")
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "p-5 rounded-xl border-2 transition-all duration-200 text-left",
                    "hover:border-primary/50 hover:bg-secondary/30",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    timeCommitment === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex items-start gap-4">
                    <div
                      className={cn(
                        "p-3 rounded-lg transition-colors",
                        timeCommitment === option.value
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <option.icon className="h-6 w-6" />
                    </div>
                    <div className="flex-1">
                      <div className="flex items-center justify-between">
                        <h3 className="font-semibold text-foreground">
                          {option.label}
                        </h3>
                        {timeCommitment === option.value && (
                          <CheckCircle className="h-5 w-5 text-primary" />
                        )}
                      </div>
                      <p className="mt-1 text-sm text-muted-foreground">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            <button
              onClick={handleTimeCommitmentNext}
              disabled={!timeCommitment || isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2",
                timeCommitment
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Saving...
                </>
              ) : (
                <>
                  Continue
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Step 7: Motivation (Students only) */}
        {step === "motivation" && (
          <div className="space-y-8">
            {prevStep && (
              <button
                onClick={() => goToStep(prevStep)}
                className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors"
                disabled={isSubmitting}
              >
                <ArrowLeft className="h-4 w-4" />
                Back
              </button>
            )}

            <div className="space-y-2 text-center">
              <h2 className="text-xl font-semibold tracking-tight">
                What motivates you to learn?
              </h2>
              <p className="text-sm text-muted-foreground">
                Help us understand your goals.
              </p>
            </div>

            <div className="grid grid-cols-2 gap-4">
              {[
                {
                  value: "career" as const,
                  label: "Career Growth",
                  icon: Briefcase,
                },
                {
                  value: "curiosity" as const,
                  label: "Curiosity",
                  icon: Lightbulb,
                },
                {
                  value: "project" as const,
                  label: "Build a Project",
                  icon: Rocket,
                },
                {
                  value: "other" as const,
                  label: "Other",
                  icon: HelpCircle,
                },
              ].map((option) => (
                <button
                  key={option.value}
                  type="button"
                  onClick={() => {
                    setMotivationType(option.value)
                    setError("")
                  }}
                  disabled={isSubmitting}
                  className={cn(
                    "p-4 rounded-xl border-2 transition-all duration-200",
                    "hover:border-primary/50 hover:bg-secondary/30",
                    "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                    "disabled:opacity-50 disabled:cursor-not-allowed",
                    motivationType === option.value
                      ? "border-primary bg-primary/5"
                      : "border-border bg-card"
                  )}
                >
                  <div className="flex flex-col items-center gap-2">
                    <div
                      className={cn(
                        "p-3 rounded-lg transition-colors",
                        motivationType === option.value
                          ? "bg-primary/10 text-primary"
                          : "bg-secondary text-muted-foreground"
                      )}
                    >
                      <option.icon className="h-5 w-5" />
                    </div>
                    <span className={cn(
                      "text-sm font-medium text-center",
                      motivationType === option.value ? "text-foreground" : "text-muted-foreground"
                    )}>
                      {option.label}
                    </span>
                  </div>
                </button>
              ))}
            </div>

            {error && (
              <p className="text-sm text-destructive text-center">{error}</p>
            )}

            {/* Summary */}
            <div className="rounded-lg border border-border bg-muted/40 p-4 text-sm space-y-2">
              <p className="font-medium text-foreground">Summary</p>
              <p className="text-muted-foreground">Name: {fullName}</p>
              <p className="text-muted-foreground">Role: {role === "student" ? "Student" : "Mentor"}</p>
              {role === "student" && institution && (
                <p className="text-muted-foreground">From: {institution}</p>
              )}
              {role === "student" && skillLevel && (
                <p className="text-muted-foreground">Level: {skillLevel.charAt(0).toUpperCase() + skillLevel.slice(1)}</p>
              )}
            </div>

            <button
              onClick={handleMotivationNext}
              disabled={!motivationType || isSubmitting}
              className={cn(
                "w-full px-4 py-3 rounded-lg font-medium transition-all",
                "focus:outline-none focus:ring-2 focus:ring-primary focus:ring-offset-2",
                "flex items-center justify-center gap-2",
                motivationType
                  ? "bg-primary text-primary-foreground hover:bg-primary/90"
                  : "bg-secondary text-muted-foreground cursor-not-allowed"
              )}
            >
              {isSubmitting ? (
                <>
                  <span className="h-4 w-4 border-2 border-current border-t-transparent rounded-full animate-spin" />
                  Completing...
                </>
              ) : (
                <>
                  Complete
                  <ArrowRight className="h-4 w-4" />
                </>
              )}
            </button>
          </div>
        )}

        {/* Progress Indicator */}
        <div className="flex justify-center gap-2">
          {Array.from({ length: totalSteps }).map((_, index) => (
            <div
              key={index}
              className={cn(
                "h-2 rounded-full transition-all duration-300",
                index === stepIndex
                  ? "bg-primary w-6"
                  : index < stepIndex
                    ? "bg-primary/40 w-2"
                    : "bg-border w-2"
              )}
            />
          ))}
        </div>
      </div>
    </div>
  )
}

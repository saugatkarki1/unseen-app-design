"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Star,
    ChevronRight,
    Code,
    Lightbulb,
    Trophy,
    Play
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getCapsuleById, type SkillCapsule } from "@/data/curriculum"
import { pointsConfig } from "@/data/gamification"
import { cn } from "@/lib/utils"

export default function CapsulePage() {
    const params = useParams()
    const router = useRouter()
    const capsuleId = params.id as string

    const [capsule, setCapsule] = useState<SkillCapsule | null>(null)
    const [currentStepIndex, setCurrentStepIndex] = useState(0)
    const [completedSteps, setCompletedSteps] = useState<string[]>([])
    const [completedChallenges, setCompletedChallenges] = useState<string[]>([])
    const [completedExercises, setCompletedExercises] = useState<string[]>([])
    const [showCompletion, setShowCompletion] = useState(false)
    const [earnedPoints, setEarnedPoints] = useState(0)

    useEffect(() => {
        const found = getCapsuleById(capsuleId)
        if (found) {
            setCapsule(found)
        }
    }, [capsuleId])

    if (!capsule) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading capsule...</p>
            </div>
        )
    }

    const currentStep = capsule.steps[currentStepIndex]
    const isLastStep = currentStepIndex === capsule.steps.length - 1
    const allStepsComplete = completedSteps.length === capsule.steps.length

    const handleCompleteStep = () => {
        if (!completedSteps.includes(currentStep.id)) {
            setCompletedSteps([...completedSteps, currentStep.id])
        }

        if (!isLastStep) {
            setCurrentStepIndex(currentStepIndex + 1)
        }
    }

    const handleCompleteChallenge = (challengeId: string) => {
        if (!completedChallenges.includes(challengeId)) {
            setCompletedChallenges([...completedChallenges, challengeId])
            setEarnedPoints(prev => prev + pointsConfig.challengeComplete)
        }
    }

    const handleCompleteExercise = (exerciseId: string, exercisePoints: number) => {
        if (!completedExercises.includes(exerciseId)) {
            setCompletedExercises([...completedExercises, exerciseId])
            setEarnedPoints(prev => prev + exercisePoints)
        }
    }

    const handleCompleteCapsule = () => {
        const totalPoints = capsule.points + earnedPoints
        setEarnedPoints(totalPoints)
        setShowCompletion(true)
    }

    const allComplete = allStepsComplete &&
        completedChallenges.length === capsule.challenges.length &&
        completedExercises.length === capsule.exercises.length

    return (
        <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
            {/* Header */}
            <header className="mb-6 w-full flex-shrink-0">
                <button
                    onClick={() => router.push("/curriculum")}
                    className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors mb-4"
                >
                    <ArrowLeft className="h-4 w-4" />
                    Back to Curriculum
                </button>

                <div className="rounded-xl bg-primary px-4 py-4 text-primary-foreground shadow-sm sm:px-6 sm:py-5">
                    <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
                        <div className="min-w-0 flex-1">
                            <p className="text-xs uppercase tracking-wide text-white/60">Skill Capsule</p>
                            <h1 className="text-xl font-semibold sm:text-2xl">{capsule.title}</h1>
                            <p className="mt-1 text-xs text-white/80 sm:text-sm">{capsule.description}</p>
                        </div>
                        <div className="flex items-center gap-4 flex-shrink-0">
                            <div className="flex items-center gap-2 text-white/80">
                                <Clock className="h-4 w-4" />
                                <span className="text-sm">{capsule.estimatedMinutes} min</span>
                            </div>
                            <div className="flex items-center gap-2 text-white/80">
                                <Star className="h-4 w-4 text-yellow-400" />
                                <span className="text-sm">{capsule.points} pts</span>
                            </div>
                        </div>
                    </div>
                </div>
            </header>

            {/* Progress Bar */}
            <div className="mb-6">
                <div className="flex items-center justify-between text-sm mb-2">
                    <span className="text-muted-foreground">Progress</span>
                    <span className="text-muted-foreground">
                        {completedSteps.length}/{capsule.steps.length} steps
                    </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${(completedSteps.length / capsule.steps.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1">
                {/* Sidebar - Step Navigation */}
                <div className="lg:w-64 flex-shrink-0">
                    <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Steps</h3>
                        <div className="space-y-1">
                            {capsule.steps.map((step, index) => {
                                const isComplete = completedSteps.includes(step.id)
                                const isCurrent = index === currentStepIndex
                                return (
                                    <button
                                        key={step.id}
                                        onClick={() => setCurrentStepIndex(index)}
                                        className={cn(
                                            "w-full flex items-center gap-2 p-2 rounded-lg text-left text-sm transition-colors",
                                            isCurrent && "bg-primary/10 text-primary",
                                            !isCurrent && "hover:bg-muted"
                                        )}
                                    >
                                        <div className={cn(
                                            "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 text-xs",
                                            isComplete ? "bg-green-500 text-white" : "bg-muted"
                                        )}>
                                            {isComplete ? <CheckCircle2 className="h-4 w-4" /> : index + 1}
                                        </div>
                                        <span className="truncate">{step.title}</span>
                                    </button>
                                )
                            })}
                        </div>
                    </div>
                </div>

                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Current Step */}
                    <AnimatePresence mode="wait">
                        <motion.div
                            key={currentStep.id}
                            initial={{ opacity: 0, x: 20 }}
                            animate={{ opacity: 1, x: 0 }}
                            exit={{ opacity: 0, x: -20 }}
                            className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6"
                        >
                            <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/10 opacity-60" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <div className="w-8 h-8 rounded-lg bg-primary/10 flex items-center justify-center">
                                        <span className="text-sm font-medium text-primary">{currentStepIndex + 1}</span>
                                    </div>
                                    <h2 className="text-xl font-semibold">{currentStep.title}</h2>
                                </div>

                                <div className="prose prose-neutral max-w-none">
                                    <p className="text-muted-foreground">{currentStep.content}</p>

                                    {currentStep.codeExample && (
                                        <div className="mt-4">
                                            <div className="flex items-center gap-2 text-sm text-muted-foreground mb-2">
                                                <Code className="h-4 w-4" />
                                                <span>Code Example</span>
                                            </div>
                                            <pre className="bg-neutral-900 text-neutral-100 p-4 rounded-lg overflow-x-auto text-sm">
                                                <code>{currentStep.codeExample}</code>
                                            </pre>
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center gap-3 mt-6 pt-4 border-t border-border">
                                    {currentStepIndex > 0 && (
                                        <Button
                                            variant="outline"
                                            onClick={() => setCurrentStepIndex(currentStepIndex - 1)}
                                        >
                                            Previous
                                        </Button>
                                    )}
                                    <Button onClick={handleCompleteStep}>
                                        {completedSteps.includes(currentStep.id) ? (
                                            isLastStep ? "Completed ✓" : "Next Step"
                                        ) : (
                                            isLastStep ? "Complete Step" : "Complete & Continue"
                                        )}
                                        {!isLastStep && <ChevronRight className="h-4 w-4 ml-1" />}
                                    </Button>
                                </div>
                            </div>
                        </motion.div>
                    </AnimatePresence>

                    {/* Challenges */}
                    {capsule.challenges.length > 0 && (
                        <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-amber-500/5 via-transparent to-orange-500/10 opacity-60" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Lightbulb className="h-5 w-5 text-amber-500" />
                                    <h3 className="text-lg font-semibold">Challenges</h3>
                                    <span className="text-xs text-muted-foreground">+{pointsConfig.challengeComplete} pts each</span>
                                </div>

                                <div className="space-y-4">
                                    {capsule.challenges.map((challenge) => {
                                        const isComplete = completedChallenges.includes(challenge.id)
                                        return (
                                            <div
                                                key={challenge.id}
                                                className={cn(
                                                    "p-4 rounded-lg border transition-colors",
                                                    isComplete ? "border-green-500/30 bg-green-500/5" : "border-border"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div>
                                                        <h4 className="font-medium">{challenge.title}</h4>
                                                        <p className="text-sm text-muted-foreground mt-1">{challenge.description}</p>
                                                        {challenge.hint && (
                                                            <p className="text-xs text-muted-foreground mt-2 italic">
                                                                💡 Hint: {challenge.hint}
                                                            </p>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={isComplete ? "outline" : "default"}
                                                        onClick={() => handleCompleteChallenge(challenge.id)}
                                                        disabled={isComplete}
                                                    >
                                                        {isComplete ? "Done ✓" : "I Did It"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Exercises */}
                    {capsule.exercises.length > 0 && (
                        <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6">
                            <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/10 opacity-60" />
                            <div className="relative z-10">
                                <div className="flex items-center gap-2 mb-4">
                                    <Play className="h-5 w-5 text-violet-500" />
                                    <h3 className="text-lg font-semibold">Exercises</h3>
                                </div>

                                <div className="space-y-4">
                                    {capsule.exercises.map((exercise) => {
                                        const isComplete = completedExercises.includes(exercise.id)
                                        return (
                                            <div
                                                key={exercise.id}
                                                className={cn(
                                                    "p-4 rounded-lg border transition-colors",
                                                    isComplete ? "border-green-500/30 bg-green-500/5" : "border-border"
                                                )}
                                            >
                                                <div className="flex items-start justify-between gap-4">
                                                    <div className="flex-1">
                                                        <div className="flex items-center gap-2">
                                                            <h4 className="font-medium">{exercise.title}</h4>
                                                            <span className="text-xs px-2 py-0.5 rounded-full bg-muted">
                                                                {exercise.type}
                                                            </span>
                                                            <span className="text-xs text-muted-foreground">
                                                                +{exercise.points} pts
                                                            </span>
                                                        </div>
                                                        <p className="text-sm text-muted-foreground mt-1">{exercise.instructions}</p>

                                                        {exercise.starterCode && (
                                                            <pre className="mt-3 bg-neutral-900 text-neutral-100 p-3 rounded-lg overflow-x-auto text-xs">
                                                                <code>{exercise.starterCode}</code>
                                                            </pre>
                                                        )}
                                                    </div>
                                                    <Button
                                                        size="sm"
                                                        variant={isComplete ? "outline" : "default"}
                                                        onClick={() => handleCompleteExercise(exercise.id, exercise.points)}
                                                        disabled={isComplete}
                                                    >
                                                        {isComplete ? "Done ✓" : "Complete"}
                                                    </Button>
                                                </div>
                                            </div>
                                        )
                                    })}
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Complete Capsule Button */}
                    {allComplete && !showCompletion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0B1D51] to-[#1E3A8A] p-6 text-white"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">🎉 All tasks complete!</h3>
                                    <p className="text-white/80 text-sm">
                                        You've finished all steps, challenges, and exercises.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCompleteCapsule}
                                    className="bg-white text-[#0B1D51] hover:bg-white/90"
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Claim {capsule.points + earnedPoints} Points
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>
            </div>

            {/* Completion Modal */}
            <AnimatePresence>
                {showCompletion && (
                    <motion.div
                        initial={{ opacity: 0 }}
                        animate={{ opacity: 1 }}
                        exit={{ opacity: 0 }}
                        className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4"
                    >
                        <motion.div
                            initial={{ scale: 0.9, opacity: 0 }}
                            animate={{ scale: 1, opacity: 1 }}
                            exit={{ scale: 0.9, opacity: 0 }}
                            className="bg-card rounded-2xl max-w-md w-full p-8 text-center shadow-2xl border border-white/10"
                        >
                            <div className="w-20 h-20 mx-auto rounded-full bg-green-500/10 flex items-center justify-center mb-6">
                                <Trophy className="h-10 w-10 text-green-500" />
                            </div>
                            <h2 className="text-2xl font-bold mb-2">Capsule Complete! 🎉</h2>
                            <p className="text-muted-foreground mb-6">
                                You've mastered "{capsule.title}"
                            </p>

                            <div className="bg-muted/50 rounded-lg p-4 mb-6">
                                <p className="text-3xl font-bold text-primary">+{earnedPoints}</p>
                                <p className="text-sm text-muted-foreground">Points Earned</p>
                            </div>

                            {capsule.badgeId && (
                                <div className="bg-amber-500/10 rounded-lg p-4 mb-6">
                                    <p className="text-sm font-medium text-amber-600">🏆 New Badge Unlocked!</p>
                                </div>
                            )}

                            <div className="flex gap-3">
                                <Button
                                    variant="outline"
                                    className="flex-1"
                                    onClick={() => router.push("/curriculum")}
                                >
                                    Back to Curriculum
                                </Button>
                                <Button
                                    className="flex-1"
                                    onClick={() => router.push("/curriculum")}
                                >
                                    Continue Learning
                                </Button>
                            </div>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

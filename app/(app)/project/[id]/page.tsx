"use client"

import { useState, useEffect } from "react"
import { useParams, useRouter } from "next/navigation"
import {
    ArrowLeft,
    CheckCircle2,
    Clock,
    Star,
    Github,
    ExternalLink,
    Trophy,
    Rocket,
    Briefcase
} from "lucide-react"
import { motion, AnimatePresence } from "framer-motion"
import { Button } from "@/components/ui/button"
import { getProjectById, type Project } from "@/data/curriculum"
import { pointsConfig } from "@/data/gamification"
import { cn } from "@/lib/utils"

export default function ProjectPage() {
    const params = useParams()
    const router = useRouter()
    const projectId = params.id as string

    const [project, setProject] = useState<Project | null>(null)
    const [completedTasks, setCompletedTasks] = useState<string[]>([])
    const [showCompletion, setShowCompletion] = useState(false)
    const [addedToPortfolio, setAddedToPortfolio] = useState(false)

    useEffect(() => {
        const found = getProjectById(projectId)
        if (found) {
            setProject(found)
        }
    }, [projectId])

    if (!project) {
        return (
            <div className="flex items-center justify-center min-h-screen">
                <p className="text-muted-foreground">Loading project...</p>
            </div>
        )
    }

    const handleToggleTask = (taskId: string) => {
        if (completedTasks.includes(taskId)) {
            setCompletedTasks(completedTasks.filter(id => id !== taskId))
        } else {
            setCompletedTasks([...completedTasks, taskId])
        }
    }

    const allTasksComplete = completedTasks.length === project.tasks.length

    const handleCompleteProject = () => {
        setShowCompletion(true)
    }

    const handleAddToPortfolio = () => {
        setAddedToPortfolio(true)
    }

    const getDifficultyColor = (difficulty: string) => {
        switch (difficulty) {
            case "beginner": return "bg-green-500/10 text-green-600"
            case "intermediate": return "bg-amber-500/10 text-amber-600"
            case "advanced": return "bg-red-500/10 text-red-600"
            default: return "bg-muted text-muted-foreground"
        }
    }

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

                <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6">
                    <div className="absolute inset-0 bg-gradient-to-br from-orange-500/10 via-transparent to-red-500/10 opacity-60" />
                    <div className="relative z-10">
                        <div className="flex flex-col sm:flex-row sm:items-start sm:justify-between gap-4">
                            <div className="min-w-0 flex-1">
                                <div className="flex items-center gap-2 mb-2">
                                    <span className={cn(
                                        "text-xs px-2 py-0.5 rounded-full font-medium",
                                        getDifficultyColor(project.difficulty)
                                    )}>
                                        {project.difficulty}
                                    </span>
                                    <span className="text-xs text-muted-foreground">Project</span>
                                </div>
                                <h1 className="text-xl font-semibold sm:text-2xl">{project.title}</h1>
                                <p className="mt-1 text-sm text-muted-foreground">{project.description}</p>

                                {/* Technologies */}
                                <div className="flex flex-wrap gap-2 mt-3">
                                    {project.technologies.map(tech => (
                                        <span key={tech} className="text-xs px-2 py-1 bg-muted rounded-md">
                                            {tech}
                                        </span>
                                    ))}
                                </div>
                            </div>
                            <div className="flex flex-col items-end gap-2 flex-shrink-0">
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Clock className="h-4 w-4" />
                                    <span className="text-sm">{project.estimatedHours}h</span>
                                </div>
                                <div className="flex items-center gap-2 text-muted-foreground">
                                    <Star className="h-4 w-4 text-yellow-400" />
                                    <span className="text-sm">{project.points} pts</span>
                                </div>
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
                        {completedTasks.length}/{project.tasks.length} tasks
                    </span>
                </div>
                <div className="h-2 bg-muted rounded-full overflow-hidden">
                    <div
                        className="h-full bg-primary rounded-full transition-all duration-300"
                        style={{ width: `${(completedTasks.length / project.tasks.length) * 100}%` }}
                    />
                </div>
            </div>

            <div className="flex flex-col lg:flex-row gap-6 flex-1">
                {/* Main Content */}
                <div className="flex-1 min-w-0 space-y-6">
                    {/* Expected Outcome */}
                    <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-blue-500/5 via-transparent to-indigo-500/10 opacity-60" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-3">
                                <Rocket className="h-5 w-5 text-blue-500" />
                                <h3 className="text-lg font-semibold">Expected Outcome</h3>
                            </div>
                            <p className="text-muted-foreground">{project.expectedOutcome}</p>
                        </div>
                    </div>

                    {/* Tasks Checklist */}
                    <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-6">
                        <div className="absolute inset-0 bg-gradient-to-br from-violet-500/5 via-transparent to-purple-500/10 opacity-60" />
                        <div className="relative z-10">
                            <div className="flex items-center gap-2 mb-4">
                                <CheckCircle2 className="h-5 w-5 text-violet-500" />
                                <h3 className="text-lg font-semibold">Project Tasks</h3>
                                <span className="text-xs text-muted-foreground">
                                    +{pointsConfig.projectTaskComplete} pts each
                                </span>
                            </div>

                            <div className="space-y-3">
                                {project.tasks.map((task, index) => {
                                    const isComplete = completedTasks.includes(task.id)
                                    return (
                                        <div
                                            key={task.id}
                                            onClick={() => handleToggleTask(task.id)}
                                            className={cn(
                                                "flex items-start gap-3 p-4 rounded-lg border cursor-pointer transition-all",
                                                isComplete
                                                    ? "border-green-500/30 bg-green-500/5"
                                                    : "border-border hover:border-primary/50"
                                            )}
                                        >
                                            <div className={cn(
                                                "w-6 h-6 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 transition-colors",
                                                isComplete ? "bg-green-500 text-white" : "border-2 border-muted-foreground/30"
                                            )}>
                                                {isComplete && <CheckCircle2 className="h-4 w-4" />}
                                            </div>
                                            <div className="flex-1">
                                                <p className={cn(
                                                    "font-medium",
                                                    isComplete && "line-through text-muted-foreground"
                                                )}>
                                                    {index + 1}. {task.title}
                                                </p>
                                                {task.description && (
                                                    <p className="text-sm text-muted-foreground mt-1">{task.description}</p>
                                                )}
                                            </div>
                                        </div>
                                    )
                                })}
                            </div>
                        </div>
                    </div>

                    {/* Complete Project Button */}
                    {allTasksComplete && !showCompletion && (
                        <motion.div
                            initial={{ opacity: 0, y: 20 }}
                            animate={{ opacity: 1, y: 0 }}
                            className="group relative overflow-hidden rounded-xl bg-gradient-to-r from-[#0B1D51] to-[#1E3A8A] p-6 text-white"
                        >
                            <div className="flex items-center justify-between">
                                <div>
                                    <h3 className="text-lg font-semibold">🎉 All tasks complete!</h3>
                                    <p className="text-white/80 text-sm">
                                        You've completed all project tasks.
                                    </p>
                                </div>
                                <Button
                                    onClick={handleCompleteProject}
                                    className="bg-white text-[#0B1D51] hover:bg-white/90"
                                >
                                    <Trophy className="h-4 w-4 mr-2" />
                                    Complete Project
                                </Button>
                            </div>
                        </motion.div>
                    )}
                </div>

                {/* Sidebar - Resources */}
                <div className="lg:w-72 flex-shrink-0 space-y-4">
                    {/* GitHub Template */}
                    {project.githubTemplate && (
                        <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-4">
                            <h3 className="text-sm font-medium text-muted-foreground mb-3">Resources</h3>
                            <a
                                href={project.githubTemplate}
                                target="_blank"
                                rel="noopener noreferrer"
                                className="flex items-center gap-2 p-3 rounded-lg border border-border hover:border-primary/50 transition-colors"
                            >
                                <Github className="h-5 w-5" />
                                <span className="text-sm font-medium">Starter Template</span>
                                <ExternalLink className="h-3 w-3 ml-auto text-muted-foreground" />
                            </a>
                        </div>
                    )}

                    {/* Tips */}
                    <div className="group relative overflow-hidden rounded-xl bg-card [box-shadow:0_0_0_1px_rgba(255,255,255,.05),0_2px_4px_rgba(0,0,0,.2),0_12px_24px_rgba(0,0,0,.3)] border border-white/10 p-4">
                        <h3 className="text-sm font-medium text-muted-foreground mb-3">Pro Tips</h3>
                        <ul className="space-y-2 text-sm text-muted-foreground">
                            <li>• Break tasks into smaller commits</li>
                            <li>• Test each feature as you build</li>
                            <li>• Use meaningful commit messages</li>
                            <li>• Document your code</li>
                        </ul>
                    </div>
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
                            <h2 className="text-2xl font-bold mb-2">Project Complete! 🎉</h2>
                            <p className="text-muted-foreground mb-6">
                                You've built "{project.title}"
                            </p>

                            <div className="bg-muted/50 rounded-lg p-4 mb-6">
                                <p className="text-3xl font-bold text-primary">
                                    +{project.points + (project.tasks.length * pointsConfig.projectTaskComplete)}
                                </p>
                                <p className="text-sm text-muted-foreground">Points Earned</p>
                            </div>

                            {project.badgeId && (
                                <div className="bg-amber-500/10 rounded-lg p-4 mb-6">
                                    <p className="text-sm font-medium text-amber-600">🏆 New Badge Unlocked!</p>
                                </div>
                            )}

                            {/* Add to Portfolio */}
                            {!addedToPortfolio ? (
                                <Button
                                    className="w-full mb-3"
                                    onClick={handleAddToPortfolio}
                                >
                                    <Briefcase className="h-4 w-4 mr-2" />
                                    Add to Portfolio
                                </Button>
                            ) : (
                                <div className="bg-green-500/10 rounded-lg p-3 mb-3 text-green-600 text-sm font-medium">
                                    ✓ Added to Portfolio
                                </div>
                            )}

                            <Button
                                variant="outline"
                                className="w-full"
                                onClick={() => router.push("/curriculum")}
                            >
                                Back to Curriculum
                            </Button>
                        </motion.div>
                    </motion.div>
                )}
            </AnimatePresence>
        </div>
    )
}

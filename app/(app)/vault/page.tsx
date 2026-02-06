"use client"

import { useState } from "react"
import {
  Plus,
  FileText,
  Lightbulb,
  AlertCircle,
  StickyNote,
  FolderOpen,
  Pencil,
  Trash2,
  ArrowLeft,
  Save,
  Code2,
  Rocket,
  ExternalLink,
} from "lucide-react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card"
import { Input } from "@/components/ui/input"
import { Textarea } from "@/components/ui/textarea"
import { EmptyState } from "@/components/ui/interactive-empty-state"
import { useAppStore, useUserVaultEntries, useUserProjectLogs, useUserIntentHistory, useUserReflections, type VaultEntry, type ProjectLog, type Intent, type Reflection } from "@/lib/store"
import { cn } from "@/lib/utils"
import { useMemo } from "react"

type Tab = "entries" | "projects"
// Note type excluded: Vault stores evidence of work only
type EntryType = "learning" | "solution" | "mistake"

const entryTypeConfig: Record<EntryType, { label: string; icon: typeof FileText; description: string }> = {
  learning: { label: "What I learned", icon: Lightbulb, description: "New concepts, insights, or skills" },
  solution: { label: "How I solved it", icon: FileText, description: "Problems you worked through" },
  mistake: { label: "Mistakes made", icon: AlertCircle, description: "Errors and what they taught you" },
}

// Fallback for legacy 'note' entries that exist from before the lock
const getLegacyConfig = (type: string) => {
  if (type in entryTypeConfig) {
    return entryTypeConfig[type as EntryType]
  }
  if (type === 'code') return { label: "Code Snippet", icon: Code2, description: "Proof of code" }
  if (type === 'external') return { label: "External Link", icon: ExternalLink, description: "External resource" }

  // Legacy note entries
  return { label: "[Legacy] Note", icon: StickyNote, description: "Legacy entry" }
}

export default function VaultPage() {
  // USER-SCOPED SELECTORS - Prevent cross-user data leakage
  const vaultEntries = useUserVaultEntries()
  const projectLogs = useUserProjectLogs()
  const intentHistory = useUserIntentHistory()
  const reflections = useUserReflections()

  // Actions from store
  const {
    addVaultEntry,
    updateVaultEntry,
    deleteVaultEntry,
    addProjectLog,
    updateProjectLog,
    deleteProjectLog,
    emailVerified,
  } = useAppStore()

  // Group vault entries by intentId
  type IntentGroup = {
    intent: Intent | null
    intentId: string | null
    entries: VaultEntry[]
    reflection: Reflection | null
    isLegacy: boolean
  }

  const groupedByIntent = useMemo(() => {
    const groups: IntentGroup[] = []
    const entriesByIntent = new Map<string | null, VaultEntry[]>()

    // Group entries by intentId
    vaultEntries.forEach((entry) => {
      const key = entry.intentId || null
      if (!entriesByIntent.has(key)) {
        entriesByIntent.set(key, [])
      }
      entriesByIntent.get(key)!.push(entry)
    })

    // Create groups with intent and reflection data
    entriesByIntent.forEach((entries, intentId) => {
      const intent = intentId ? intentHistory.find((i) => i.id === intentId) || null : null
      const focusSessionId = entries[0]?.focusSessionId
      const reflection = focusSessionId
        ? reflections.find((r) => r.focusSessionId === focusSessionId) || null
        : null
      const isLegacy = !intentId && entries.every((e) => e.isLegacy || e.type === 'note')

      groups.push({ intent, intentId, entries, reflection, isLegacy })
    })

    // Sort: non-legacy first, then by most recent entry
    return groups.sort((a, b) => {
      if (a.isLegacy !== b.isLegacy) return a.isLegacy ? 1 : -1
      const aDate = a.entries[0]?.createdAt || ''
      const bDate = b.entries[0]?.createdAt || ''
      return bDate.localeCompare(aDate)
    })
  }, [vaultEntries, intentHistory, reflections])

  // Page header (non-identity)
  const renderHeader = (subtitle: string) => (
    <header className="mb-6 w-full flex-shrink-0 rounded-xl bg-primary px-4 py-4 text-primary-foreground shadow-sm sm:px-6 sm:py-5">
      <div className="flex flex-col gap-2 sm:flex-row sm:items-center sm:justify-between">
        <div className="min-w-0 flex-1">
          <h1 className="text-xl font-semibold sm:text-2xl">Vault</h1>
          <p className="mt-1 text-xs text-white/80 sm:text-sm">{subtitle}</p>
        </div>
      </div>
    </header>
  )

  const [activeTab, setActiveTab] = useState<Tab>("entries")
  const [isCreating, setIsCreating] = useState(false)
  const [isCreatingProject, setIsCreatingProject] = useState(false)
  const [editingEntry, setEditingEntry] = useState<VaultEntry | null>(null)
  const [editingProject, setEditingProject] = useState<ProjectLog | null>(null)
  const [viewingProject, setViewingProject] = useState<ProjectLog | null>(null)
  const [previewEntry, setPreviewEntry] = useState<VaultEntry | null>(null)

  // Form state for entries
  const [entryType, setEntryType] = useState<EntryType>("learning")
  const [entryTitle, setEntryTitle] = useState("")
  const [entryContent, setEntryContent] = useState("")
  const [entryTags, setEntryTags] = useState("")

  // Form state for projects
  const [projectName, setProjectName] = useState("")
  const [projectIdea, setProjectIdea] = useState("")
  const [projectDecisions, setProjectDecisions] = useState("")
  const [projectBugs, setProjectBugs] = useState("")
  const [projectImprovements, setProjectImprovements] = useState("")

  const [isSaving, setIsSaving] = useState(false)

  const resetEntryForm = () => {
    setEntryType("learning")
    setEntryTitle("")
    setEntryContent("")
    setEntryTags("")
    setIsCreating(false)
    setEditingEntry(null)
  }

  const resetProjectForm = () => {
    setProjectName("")
    setProjectIdea("")
    setProjectDecisions("")
    setProjectBugs("")
    setProjectImprovements("")
    setIsCreatingProject(false)
    setEditingProject(null)
  }

  const handleSaveEntry = async () => {
    if (!entryTitle.trim() || !entryContent.trim()) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    const tags = entryTags
      .split(",")
      .map((t) => t.trim())
      .filter(Boolean)

    if (editingEntry) {
      updateVaultEntry(editingEntry.id, { title: entryTitle, content: entryContent, tags, type: entryType })
    } else {
      addVaultEntry({ type: entryType, title: entryTitle, content: entryContent, tags })
    }

    setIsSaving(false)
    resetEntryForm()
  }

  const handleSaveProject = async () => {
    if (!projectName.trim()) return

    setIsSaving(true)
    await new Promise((resolve) => setTimeout(resolve, 200))

    const decisions = projectDecisions.split("\n").filter(Boolean)
    const bugs = projectBugs.split("\n").filter(Boolean)
    const improvements = projectImprovements.split("\n").filter(Boolean)

    if (editingProject) {
      updateProjectLog(editingProject.id, {
        projectName,
        idea: projectIdea,
        decisions,
        bugs,
        improvements,
      })
    } else {
      addProjectLog({
        projectName,
        idea: projectIdea,
        decisions,
        bugs,
        improvements,
      })
    }

    setIsSaving(false)
    resetProjectForm()
    setViewingProject(null)
  }

  const startEditEntry = (entry: VaultEntry) => {
    // Block editing legacy note entries
    if (entry.type === "note") {
      console.warn('[BLOCKED] Legacy notes cannot be edited.')
      return
    }
    setEditingEntry(entry)
    setEntryType(entry.type as EntryType)
    setEntryTitle(entry.title)
    setEntryContent(entry.content)
    setEntryTags(entry.tags.join(", "))
    setIsCreating(true)
  }

  const startEditProject = (project: ProjectLog) => {
    setEditingProject(project)
    setProjectName(project.projectName)
    setProjectIdea(project.idea)
    setProjectDecisions(project.decisions.join("\n"))
    setProjectBugs(project.bugs.join("\n"))
    setProjectImprovements(project.improvements.join("\n"))
    setIsCreatingProject(true)
    setViewingProject(null)
  }

  const handleDeleteEntry = (id: string) => {
    if (confirm("Delete this entry?")) {
      deleteVaultEntry(id)
    }
  }

  const handleDeleteProject = (id: string) => {
    if (confirm("Delete this project log?")) {
      deleteProjectLog(id)
      setViewingProject(null)
    }
  }

  // Project detail view
  if (viewingProject) {
    return (
      <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {renderHeader("Your personal knowledge base and proof of work.")}
        <div className="flex flex-1 flex-col space-y-8 overflow-y-auto max-w-2xl w-full">
          <button
            onClick={() => setViewingProject(null)}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vault
          </button>

          <div className="flex items-start justify-between">
            <div>
              <h1 className="text-2xl font-semibold tracking-tight">{viewingProject.projectName}</h1>
              <p className="text-sm text-muted-foreground mt-1">
                Started {new Date(viewingProject.createdAt).toLocaleDateString()}
              </p>
              {viewingProject.unverified && (
                <p className="text-xs text-warning-foreground mt-1">Logged while email was unverified.</p>
              )}
            </div>
            <div className="flex gap-2">
              <Button variant="ghost" size="sm" onClick={() => startEditProject(viewingProject)}>
                <Pencil className="h-4 w-4" />
              </Button>
              <Button variant="ghost" size="sm" onClick={() => handleDeleteProject(viewingProject.id)}>
                <Trash2 className="h-4 w-4" />
              </Button>
            </div>
          </div>

          {viewingProject.idea && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Idea</CardTitle>
              </CardHeader>
              <CardContent>
                <p className="text-sm leading-relaxed">{viewingProject.idea}</p>
              </CardContent>
            </Card>
          )}

          {viewingProject.decisions.length > 0 && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Decisions</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {viewingProject.decisions.map((decision, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-muted-foreground">•</span>
                      {decision}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {viewingProject.bugs.length > 0 && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Bugs Encountered</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {viewingProject.bugs.map((bug, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-destructive">•</span>
                      {bug}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}

          {viewingProject.improvements.length > 0 && (
            <Card className="bg-card">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-muted-foreground">Improvements</CardTitle>
              </CardHeader>
              <CardContent>
                <ul className="space-y-2">
                  {viewingProject.improvements.map((improvement, i) => (
                    <li key={i} className="text-sm flex gap-2">
                      <span className="text-success">•</span>
                      {improvement}
                    </li>
                  ))}
                </ul>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    )
  }

  // Entry/Project create form
  if (isCreating || isCreatingProject) {
    const formContent = isCreatingProject ? (
      <>
        <Card className="bg-card">
          <CardContent className="py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Project Name</label>
              <Input
                value={projectName}
                onChange={(e) => setProjectName(e.target.value)}
                placeholder="What are you building?"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Idea / Purpose</label>
              <Textarea
                value={projectIdea}
                onChange={(e) => setProjectIdea(e.target.value)}
                placeholder="What problem does this solve? Why does it matter?"
                className="min-h-[80px]"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Decisions Made</label>
              <Textarea
                value={projectDecisions}
                onChange={(e) => setProjectDecisions(e.target.value)}
                placeholder="One decision per line&#10;Why did you choose this approach?&#10;What alternatives did you consider?"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">One decision per line</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Bugs / Issues</label>
              <Textarea
                value={projectBugs}
                onChange={(e) => setProjectBugs(e.target.value)}
                placeholder="One bug per line&#10;What went wrong?&#10;How did you fix it?"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">One bug per line</p>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Improvements / Next Steps</label>
              <Textarea
                value={projectImprovements}
                onChange={(e) => setProjectImprovements(e.target.value)}
                placeholder="One improvement per line&#10;What would you do differently?&#10;What's next?"
                className="min-h-[100px]"
              />
              <p className="text-xs text-muted-foreground">One improvement per line</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={resetProjectForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveProject} disabled={!projectName.trim() || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Project"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    ) : (
      <>
        <Card className="bg-card">
          <CardContent className="py-6 space-y-6">
            <div className="space-y-2">
              <label className="text-sm font-medium">Type</label>
              <div className="grid grid-cols-2 gap-2">
                {(Object.keys(entryTypeConfig) as EntryType[]).map((type) => {
                  const config = entryTypeConfig[type]
                  const Icon = config.icon
                  return (
                    <button
                      key={type}
                      onClick={() => setEntryType(type)}
                      className={cn(
                        "flex items-center gap-2 p-3 rounded-lg border text-left text-sm transition-colors",
                        entryType === type
                          ? "border-primary bg-primary/5"
                          : "border-border hover:border-muted-foreground/30",
                      )}
                    >
                      <Icon className="h-4 w-4 text-muted-foreground flex-shrink-0" />
                      <span>{config.label}</span>
                    </button>
                  )
                })}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Title</label>
              <Input
                value={entryTitle}
                onChange={(e) => setEntryTitle(e.target.value)}
                placeholder="Brief, searchable title"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Content</label>
              <Textarea
                value={entryContent}
                onChange={(e) => setEntryContent(e.target.value)}
                placeholder="Write in Markdown if you like..."
                className="min-h-[200px] font-mono text-sm"
              />
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium">Tags (optional)</label>
              <Input
                value={entryTags}
                onChange={(e) => setEntryTags(e.target.value)}
                placeholder="javascript, debugging, react"
              />
              <p className="text-xs text-muted-foreground">Comma-separated</p>
            </div>

            <div className="flex justify-end gap-3 pt-4 border-t border-border">
              <Button variant="ghost" onClick={resetEntryForm}>
                Cancel
              </Button>
              <Button onClick={handleSaveEntry} disabled={!entryTitle.trim() || !entryContent.trim() || isSaving}>
                <Save className="h-4 w-4 mr-2" />
                {isSaving ? "Saving..." : "Save Entry"}
              </Button>
            </div>
          </CardContent>
        </Card>
      </>
    )

    return (
      <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
        {renderHeader("Your personal knowledge base and proof of work.")}
        <div className="flex flex-1 flex-col space-y-8 overflow-y-auto max-w-2xl w-full">
          <button
            onClick={() => {
              resetEntryForm()
              resetProjectForm()
            }}
            className="flex items-center gap-2 text-sm text-muted-foreground hover:text-foreground transition-colors w-fit"
          >
            <ArrowLeft className="h-4 w-4" />
            Back to vault
          </button>

          <h1 className="text-2xl font-semibold tracking-tight">
            {isCreatingProject
              ? editingProject
                ? "Edit Project"
                : "New Project Log"
              : editingEntry
                ? "Edit Entry"
                : "New Entry"}
          </h1>

          {formContent}
        </div>
      </div>
    )
  }

  // Main list view
  return (
    <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8 lg:py-10">
      {renderHeader("Your personal knowledge base and proof of work.")}
      <div className="flex flex-1 flex-col space-y-8 overflow-y-auto">
        {!emailVerified && (
          <div className="p-3 rounded-lg border border-warning/20 bg-warning/10 text-sm text-warning-foreground">
            Entries are stored as unverified progress. Aura growth is locked until email verification.
          </div>
        )}

        {/* Tabs */}
        <div className="flex gap-4 border-b border-border">
          <button
            onClick={() => setActiveTab("entries")}
            className={cn(
              "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "entries"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Knowledge Base
          </button>
          <button
            onClick={() => setActiveTab("projects")}
            className={cn(
              "pb-3 text-sm font-medium transition-colors border-b-2 -mb-px",
              activeTab === "projects"
                ? "border-primary text-foreground"
                : "border-transparent text-muted-foreground hover:text-foreground",
            )}
          >
            Project Logs
          </button>
        </div>

        {activeTab === "entries" ? (
          <>
            <Button onClick={() => setIsCreating(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Entry
            </Button>

            {vaultEntries.length === 0 ? (
              <EmptyState
                title="Your knowledge base is empty"
                description="Start documenting what you learn, problems you solve, and mistakes you make."
                icons={[
                  <Lightbulb key="i1" className="h-6 w-6" />,
                  <FileText key="i2" className="h-6 w-6" />,
                  <StickyNote key="i3" className="h-6 w-6" />,
                ]}
                action={{
                  label: "Add Entry",
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => setIsCreating(true),
                }}
              />
            ) : (
              <div className="space-y-8">
                {groupedByIntent.map((group) => {
                  const hasReflection = !!group.reflection
                  const isFinished = !!group.reflection && group.reflection.outcome === 'finished'
                  const isAbandoned = !!group.reflection && group.reflection.outcome === 'abandoned'
                  const isDeferred = group.entries[0]?.focusSessionId && !group.reflection

                  // Timestamp from intent or first entry
                  const timestamp = group.intent?.declaredAt || group.entries[0]?.createdAt

                  return (
                    <div key={group.intentId || 'legacy'} className="relative pl-6 border-l-2 border-border/50 pb-8 last:pb-0 last:border-transparent">
                      {/* Timeline dot */}
                      <div className={cn(
                        "absolute -left-[9px] top-0 h-4 w-4 rounded-full border-2 bg-background",
                        isFinished ? "border-primary" :
                          isAbandoned ? "border-muted-foreground" :
                            "border-primary/50"
                      )} />

                      {/* Intent Header */}
                      <div className="mb-4">
                        <div className="flex items-baseline gap-2 mb-1">
                          <span className="text-xs font-tech text-muted-foreground uppercase tracking-widest">
                            {new Date(timestamp).toLocaleDateString(undefined, { month: 'short', day: 'numeric', year: 'numeric' })}
                          </span>
                          {isFinished && <span className="text-[10px] px-1.5 py-0.5 rounded bg-primary/10 text-primary">Completed</span>}
                          {isAbandoned && <span className="text-[10px] px-1.5 py-0.5 rounded bg-muted text-muted-foreground">Abandoned</span>}
                          {isDeferred && !group.isLegacy && <span className="text-[10px] px-1.5 py-0.5 rounded border border-primary/30 text-primary">In Progress / Deferred</span>}
                        </div>

                        {group.intent ? (
                          <h2 className="text-xl font-medium text-foreground">
                            "{group.intent.declaration}"
                          </h2>
                        ) : (
                          <h2 className="text-xl font-medium text-muted-foreground italic">
                            {group.isLegacy ? "Legacy Notes" : "Unlinked Artifacts"}
                          </h2>
                        )}
                        <p className="text-xs text-muted-foreground mt-1">
                          {group.entries.length} artifact{group.entries.length !== 1 ? 's' : ''}
                        </p>
                      </div>

                      {/* Reflection Excerpt */}
                      {hasReflection && (
                        <div className="mb-4 p-4 rounded-lg bg-secondary/20 border border-border/50 italic text-muted-foreground text-sm">
                          <p>"{group.reflection?.insight || group.reflection?.outcomeDescription}"</p>
                        </div>
                      )}

                      {/* Artifacts Grid */}
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                        {group.entries.map((entry) => {
                          const config = getLegacyConfig(entry.type)
                          const Icon = config.icon
                          const isLegacy = entry.type === "note" || entry.isLegacy === true
                          const isCode = entry.type === 'code'

                          return (
                            <Card
                              key={entry.id}
                              className={cn(
                                "group bg-card/50 hover:bg-card transition-all cursor-pointer border border-border/50",
                                isCode && "border-l-2 border-l-primary/50"
                              )}
                              onClick={() => {
                                // @ts-ignore - Valid property for artifacts logic
                                setPreviewEntry(entry)
                              }}
                            >
                              <CardContent className="py-3 px-4">
                                <div className="flex items-start gap-3">
                                  <div className="mt-0.5 w-6 h-6 rounded bg-muted/50 flex items-center justify-center flex-shrink-0">
                                    {isCode ? (
                                      <Code2 className="h-3 w-3 text-primary" />
                                    ) : (
                                      <Icon className="h-3 w-3 text-muted-foreground" />
                                    )}
                                  </div>
                                  <div className="flex-1 min-w-0">
                                    <div className="flex items-start justify-between gap-2">
                                      <h3 className="font-medium text-sm truncate pr-2">
                                        {entry.title}
                                      </h3>
                                      <div className="flex gap-1 opacity-0 group-hover:opacity-100 transition-opacity" onClick={(e) => e.stopPropagation()}>
                                        {!isLegacy && (
                                          <>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => startEditEntry(entry)}>
                                              <Pencil className="h-3 w-3" />
                                            </Button>
                                            <Button variant="ghost" size="icon" className="h-6 w-6" onClick={() => handleDeleteEntry(entry.id)}>
                                              <Trash2 className="h-3 w-3" />
                                            </Button>
                                          </>
                                        )}
                                      </div>
                                    </div>
                                    <p className="text-xs text-muted-foreground line-clamp-2 mt-1 font-mono text-[10px] opacity-80">
                                      {entry.type === 'code' ? 'Click to preview code' : entry.content}
                                    </p>
                                    {entry.type === 'learning' && entry.content.startsWith('http') && (
                                      <div className="mt-2 text-xs flex items-center gap-1 text-primary">
                                        <ExternalLink className="h-3 w-3" />
                                        External Link
                                      </div>
                                    )}
                                  </div>
                                </div>
                              </CardContent>
                            </Card>
                          )
                        })}
                      </div>
                    </div>
                  )
                })}
              </div>
            )}
          </>
        ) : (
          <>
            <Button onClick={() => setIsCreatingProject(true)}>
              <Plus className="h-4 w-4 mr-2" />
              New Project
            </Button>

            {projectLogs.length === 0 ? (
              <EmptyState
                title="No project logs yet"
                description="Document your projects: ideas, decisions, bugs, and improvements."
                icons={[
                  <FolderOpen key="p1" className="h-6 w-6" />,
                  <Code2 key="p2" className="h-6 w-6" />,
                  <Rocket key="p3" className="h-6 w-6" />,
                ]}
                action={{
                  label: "Add Project",
                  icon: <Plus className="h-4 w-4" />,
                  onClick: () => setIsCreatingProject(true),
                }}
              />
            ) : (
              <div className="grid gap-4 sm:grid-cols-2">
                {projectLogs.map((project) => (
                  <Card
                    key={project.id}
                    className="cursor-pointer hover:border-muted-foreground/30 transition-colors bg-card"
                    onClick={() => setViewingProject(project)}
                  >
                    <CardContent className="py-4">
                      <div className="flex items-start gap-3">
                        <div className="w-10 h-10 rounded-lg bg-primary/10 flex items-center justify-center flex-shrink-0">
                          <FolderOpen className="h-5 w-5 text-primary" />
                        </div>
                        <div className="flex-1 min-w-0">
                          <h3 className="font-medium">{project.projectName}</h3>
                          <p className="text-xs text-muted-foreground mt-0.5">
                            {new Date(project.createdAt).toLocaleDateString()}
                          </p>
                          {project.unverified && (
                            <p className="text-[11px] text-warning mt-1">Unverified progress</p>
                          )}
                          {project.idea && (
                            <p className="text-sm text-muted-foreground mt-2 line-clamp-2">{project.idea}</p>
                          )}
                          <div className="flex gap-3 mt-3 text-xs text-muted-foreground">
                            <span>{project.decisions.length} decisions</span>
                            <span>{project.bugs.length} bugs</span>
                          </div>
                        </div>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </>
        )}

        {/* Aura note */}
        <Card className="bg-primary/5">
          <CardContent className="py-4">
            <p className="text-xs text-muted-foreground">
              Documentation builds depth. Each entry increases your Aura and serves as proof of effort.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Artifact Preview Modal */}
      <ArtifactPreviewOverlay
        entry={previewEntry}
        onClose={() => setPreviewEntry(null)}
      />
    </div>
  )
}

// ----------------------------------------------------------------------------
// HELPER COMPONENTS
// ----------------------------------------------------------------------------

import { CodePreview } from "@/components/ui/code-preview"
import { X } from "lucide-react"

function ArtifactPreviewOverlay({
  entry,
  onClose
}: {
  entry: VaultEntry | null,
  onClose: () => void
}) {
  if (!entry) return null

  // @ts-ignore - Handle missing language property safely
  const language = entry.language || 'text'
  const isCode = entry.type === 'code'

  return (
    <div className="fixed inset-0 z-[100] bg-black/80 flex items-center justify-center p-4">
      {/* Click backdrop to close */}
      <div className="absolute inset-0" onClick={onClose} />

      <div className="relative bg-card w-full max-w-4xl h-[80vh] rounded-xl flex flex-col shadow-2xl border border-border overflow-hidden">
        {/* Header */}
        <div className="flex items-center justify-between px-4 py-3 border-b border-border bg-muted/20">
          <div className="flex items-center gap-2">
            {isCode ? <Code2 className="h-4 w-4 text-primary" /> : <FileText className="h-4 w-4 text-muted-foreground" />}
            <span className="font-medium text-sm">{entry.title}</span>
            {language !== 'text' && (
              <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground uppercase">{language}</span>
            )}
          </div>
          <button onClick={onClose} className="p-1 hover:bg-muted rounded">
            <X className="h-5 w-5 text-muted-foreground" />
          </button>
        </div>

        {/* Content */}
        <div className="flex-1 overflow-hidden p-0 bg-background">
          {isCode ? (
            <div className="h-full grid grid-cols-1 md:grid-cols-2 divide-y md:divide-y-0 md:divide-x divide-border">
              {/* Code Source */}
              <div className="p-4 overflow-auto bg-secondary/10">
                <pre className="text-xs font-mono whitespace-pre-wrap">{entry.content}</pre>
              </div>
              {/* Live Preview */}
              <div className="h-full overflow-hidden">
                <CodePreview code={entry.content} language={language} className="h-full border-none" />
              </div>
            </div>
          ) : (
            <div className="p-8 h-full overflow-auto">
              <div className="max-w-prose mx-auto">
                <div className="whitespace-pre-wrap text-sm leading-relaxed">{entry.content}</div>

                {entry.type === 'external' && entry.content.startsWith('http') && (
                  <div className="mt-8 pt-6 border-t border-border">
                    <a
                      href={entry.content}
                      target="_blank"
                      rel="noreferrer"
                      className="inline-flex items-center gap-2 px-4 py-2 bg-primary text-primary-foreground rounded-lg text-sm hover:bg-primary/90 transition-colors"
                    >
                      <ExternalLink className="h-4 w-4" />
                      Open External Link
                    </a>
                  </div>
                )}
              </div>
            </div>
          )}
        </div>
      </div>
    </div>
  )
}

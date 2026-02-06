"use client"

import { useState, useEffect, useCallback } from "react"
import {
    Flag, CheckCircle, X, Clock, AlertTriangle,
    FileText, Code, Link2, Plus, Trash2, Edit2, Save,
    ExternalLink, Upload, Eye, EyeOff
} from "lucide-react"
import { useAppStore, useUserActiveFocusSession, useUserFocusArtifacts, FocusArtifact } from "@/lib/store"
import { cn } from "@/lib/utils"
import { CodePreview, supportsPreview } from "@/components/ui/code-preview"

/**
 * FocusMode - Full-screen creation workspace when focus is active
 * 
 * FREEWILL RULES:
 * - Navigation locked (back button blocked, sidebar hidden)
 * - Persists across refresh via zustand persist
 * - Only exits: Finish Focus (requires artifact) or Abandon Focus
 * - No time limits, no system deadlines, no auto-start
 * - User has freedom to create notes, code, or external artifacts
 * 
 * This space exists to capture what you actually worked on.
 * Notes, code, or anything you create here becomes your proof.
 */

type ArtifactTab = 'notes' | 'code' | 'external'
type ArtifactType = 'note' | 'code' | 'external'

// Languages with preview support listed first
const CODE_LANGUAGES = [
    { value: 'html', label: 'HTML', preview: true },
    { value: 'css', label: 'CSS', preview: true },
    { value: 'javascript', label: 'JavaScript', preview: true },
    { value: 'jsx', label: 'React (JSX)', preview: true },
    { value: 'tsx', label: 'React (TSX)', preview: true },
    { value: 'typescript', label: 'TypeScript', preview: true },
    { value: 'python', label: 'Python', preview: false },
    { value: 'java', label: 'Java', preview: false },
    { value: 'go', label: 'Go', preview: false },
    { value: 'rust', label: 'Rust', preview: false },
    { value: 'sql', label: 'SQL', preview: false },
    { value: 'bash', label: 'Bash', preview: false },
    { value: 'other', label: 'Other', preview: false },
]

export function FocusMode() {
    // USER-SCOPED SELECTORS - Prevent cross-user data leakage
    const activeFocusSession = useUserActiveFocusSession()
    const focusArtifacts = useUserFocusArtifacts()

    // Actions from store
    const {
        finishFocus,
        abandonFocus,
        addFocusArtifact,
        updateFocusArtifact,
        deleteFocusArtifact,
    } = useAppStore()

    // Tab state
    const [activeTab, setActiveTab] = useState<ArtifactTab>('notes')

    // Note creation state
    const [noteTitle, setNoteTitle] = useState("")
    const [noteContent, setNoteContent] = useState("")

    // Code creation state
    const [codeTitle, setCodeTitle] = useState("")
    const [codeContent, setCodeContent] = useState("")
    const [codeLanguage, setCodeLanguage] = useState("html")
    const [showPreview, setShowPreview] = useState(true)

    // External link creation state
    const [showLinkForm, setShowLinkForm] = useState(false)
    const [linkTitle, setLinkTitle] = useState("")
    const [linkUrl, setLinkUrl] = useState("")

    // Edit state
    const [editingArtifact, setEditingArtifact] = useState<FocusArtifact | null>(null)
    const [editTitle, setEditTitle] = useState("")
    const [editContent, setEditContent] = useState("")

    // Modal state
    const [showFinishModal, setShowFinishModal] = useState(false)
    const [showAbandonConfirm, setShowAbandonConfirm] = useState(false)
    const [finishError, setFinishError] = useState("")

    // Timer
    const [elapsedTime, setElapsedTime] = useState("")

    // Calculate elapsed time
    useEffect(() => {
        if (!activeFocusSession) return

        const updateElapsed = () => {
            const start = new Date(activeFocusSession.startedAt).getTime()
            const now = Date.now()
            const diff = now - start

            const hours = Math.floor(diff / (1000 * 60 * 60))
            const minutes = Math.floor((diff % (1000 * 60 * 60)) / (1000 * 60))

            if (hours > 0) {
                setElapsedTime(`${hours}h ${minutes}m`)
            } else {
                setElapsedTime(`${minutes}m`)
            }
        }

        updateElapsed()
        const interval = setInterval(updateElapsed, 60000)
        return () => clearInterval(interval)
    }, [activeFocusSession])

    // Block browser back button
    useEffect(() => {
        if (!activeFocusSession) return

        const handlePopState = (e: PopStateEvent) => {
            e.preventDefault()
            window.history.pushState(null, "", window.location.href)
        }

        window.history.pushState(null, "", window.location.href)
        window.addEventListener("popstate", handlePopState)
        return () => window.removeEventListener("popstate", handlePopState)
    }, [activeFocusSession])

    // Block keyboard navigation
    useEffect(() => {
        if (!activeFocusSession) return

        const handleKeyDown = (e: KeyboardEvent) => {
            if ((e.metaKey || e.ctrlKey) && e.key === "w") {
                e.preventDefault()
            }
            if (e.key === "Escape") {
                e.preventDefault()
            }
        }

        window.addEventListener("keydown", handleKeyDown)
        return () => window.removeEventListener("keydown", handleKeyDown)
    }, [activeFocusSession])

    // Save note as artifact
    const handleSaveNote = useCallback(() => {
        const title = noteTitle.trim() || "Untitled Note"
        const content = noteContent.trim()
        if (!content) return

        addFocusArtifact({
            type: 'note',
            title,
            content,
        })

        setNoteTitle("")
        setNoteContent("")
    }, [noteTitle, noteContent, addFocusArtifact])

    // Save code as artifact
    const handleSaveCode = useCallback(() => {
        const title = codeTitle.trim() || `Code (${codeLanguage})`
        const content = codeContent.trim()
        if (!content) return

        addFocusArtifact({
            type: 'code',
            title,
            content,
            language: codeLanguage,
            previewSupported: supportsPreview(codeLanguage),
        })

        setCodeTitle("")
        setCodeContent("")
    }, [codeTitle, codeContent, codeLanguage, addFocusArtifact])

    // Save link as artifact
    const handleSaveLink = useCallback(() => {
        const title = linkTitle.trim() || "External Link"
        const url = linkUrl.trim()
        if (!url) return

        addFocusArtifact({
            type: 'external',
            title,
            content: url,
            url: url,
        })

        setLinkTitle("")
        setLinkUrl("")
        setShowLinkForm(false)
    }, [linkTitle, linkUrl, addFocusArtifact])

    // Start editing artifact
    const startEdit = (artifact: FocusArtifact) => {
        setEditingArtifact(artifact)
        setEditTitle(artifact.title)
        setEditContent(artifact.content)
    }

    // Save edited artifact
    const handleSaveEdit = useCallback(() => {
        if (!editingArtifact) return

        updateFocusArtifact(editingArtifact.id, {
            title: editTitle.trim() || editingArtifact.title,
            content: editContent.trim() || editingArtifact.content,
        })

        setEditingArtifact(null)
        setEditTitle("")
        setEditContent("")
    }, [editingArtifact, editTitle, editContent, updateFocusArtifact])

    // Finish focus
    const handleFinish = useCallback(() => {
        if (focusArtifacts.length === 0) {
            setFinishError("Create at least one artifact before finishing.")
            return
        }

        // Generate proof summary from artifacts
        const proofSummary = focusArtifacts
            .map(a => `[${a.type.toUpperCase()}] ${a.title}`)
            .join("\n")

        const success = finishFocus(proofSummary)
        if (success) {
            setShowFinishModal(false)
            setFinishError("")
        }
    }, [focusArtifacts, finishFocus])

    // Abandon focus
    const handleAbandon = useCallback(() => {
        abandonFocus()
        setShowAbandonConfirm(false)
    }, [abandonFocus])

    if (!activeFocusSession) {
        return null
    }

    return (
        <div className="fixed inset-0 z-[100] bg-background flex flex-col">
            {/* Header */}
            <header className="flex-shrink-0 border-b border-border bg-card/50 backdrop-blur">
                <div className="container max-w-6xl mx-auto px-4 py-3 flex items-center justify-between">
                    <div className="flex items-center gap-3">
                        <div className="p-2 rounded-lg bg-primary/10">
                            <Flag className="h-5 w-5 text-primary" />
                        </div>
                        <div>
                            <p className="text-[10px] font-tech uppercase tracking-widest text-primary">
                                ■ Focus Active
                            </p>
                            <p className="text-sm text-muted-foreground flex items-center gap-2">
                                <Clock className="h-3 w-3" />
                                <span className="text-foreground font-medium">{elapsedTime || "Just started"}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span>{focusArtifacts.length} artifact{focusArtifacts.length !== 1 ? 's' : ''}</span>
                                <span className="text-muted-foreground/50">•</span>
                                <span className="text-xs">Started {new Date(activeFocusSession.startedAt).toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })}</span>
                            </p>
                        </div>
                    </div>

                    <div className="flex items-center gap-2">
                        <button
                            onClick={() => setShowAbandonConfirm(true)}
                            className="px-3 py-2 rounded-lg text-sm text-muted-foreground hover:text-destructive hover:bg-destructive/10 transition-colors"
                        >
                            Abandon
                        </button>
                        <button
                            onClick={() => setShowFinishModal(true)}
                            className="flex items-center gap-2 px-4 py-2 rounded-lg bg-primary text-primary-foreground text-sm font-tech uppercase tracking-wide hover:bg-primary/90 transition-colors"
                        >
                            <CheckCircle className="h-4 w-4" />
                            Finish
                        </button>
                    </div>
                </div>
            </header>

            {/* Intent Display */}
            <div className="border-b border-border bg-secondary/20">
                <div className="container max-w-6xl mx-auto px-4 py-3">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                        ■ Your Intent
                    </p>
                    <p className="text-sm text-foreground">
                        {activeFocusSession.intentDeclaration}
                    </p>
                </div>
            </div>

            {/* UI Guidance - Non-directive, observational */}
            <div className="bg-primary/5 border-b border-border">
                <div className="container max-w-6xl mx-auto px-4 py-2">
                    <p className="text-xs text-muted-foreground text-center">
                        This space exists to capture what you actually worked on. Notes, code, or anything you create here becomes your proof.
                    </p>
                </div>
            </div>

            {/* Tabs */}
            <div className="border-b border-border">
                <div className="container max-w-6xl mx-auto px-4">
                    <div className="flex gap-1">
                        <button
                            onClick={() => setActiveTab('notes')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'notes'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <FileText className="h-4 w-4" />
                            Notes
                        </button>
                        <button
                            onClick={() => setActiveTab('code')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'code'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <Code className="h-4 w-4" />
                            Code
                        </button>
                        <button
                            onClick={() => setActiveTab('external')}
                            className={cn(
                                "flex items-center gap-2 px-4 py-3 text-sm font-medium border-b-2 transition-colors",
                                activeTab === 'external'
                                    ? "border-primary text-primary"
                                    : "border-transparent text-muted-foreground hover:text-foreground"
                            )}
                        >
                            <ExternalLink className="h-4 w-4" />
                            External
                            {focusArtifacts.length > 0 && (
                                <span className="ml-1 px-1.5 py-0.5 text-[10px] bg-primary/20 text-primary rounded">
                                    {focusArtifacts.length}
                                </span>
                            )}
                        </button>
                    </div>
                </div>
            </div>

            {/* Main Content */}
            <main className="flex-1 overflow-y-auto">
                <div className="container max-w-6xl mx-auto px-4 py-6">

                    {/* Notes Tab */}
                    {activeTab === 'notes' && (
                        <div className="space-y-4">
                            <div className="cyber-card p-4">
                                <input
                                    type="text"
                                    value={noteTitle}
                                    onChange={(e) => setNoteTitle(e.target.value)}
                                    placeholder="Note title (optional)"
                                    className="w-full bg-transparent border-none text-lg font-medium placeholder:text-muted-foreground/50 focus:outline-none mb-3"
                                />
                                <textarea
                                    value={noteContent}
                                    onChange={(e) => setNoteContent(e.target.value)}
                                    placeholder="Write your notes, thoughts, or documentation here..."
                                    className="w-full min-h-[300px] bg-secondary/20 border border-border rounded-lg p-4 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                />
                                <div className="flex justify-end mt-3">
                                    <button
                                        onClick={handleSaveNote}
                                        disabled={!noteContent.trim()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            noteContent.trim()
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Save as Artifact
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* Code Tab - Split Pane Editor + Preview */}
                    {activeTab === 'code' && (
                        <div className="space-y-4">
                            {/* Header with title, language, preview toggle */}
                            <div className="cyber-card p-4">
                                <div className="flex items-center gap-3 mb-3">
                                    <input
                                        type="text"
                                        value={codeTitle}
                                        onChange={(e) => setCodeTitle(e.target.value)}
                                        placeholder="Code snippet title (optional)"
                                        className="flex-1 bg-transparent border-none text-lg font-medium placeholder:text-muted-foreground/50 focus:outline-none"
                                    />
                                    <select
                                        value={codeLanguage}
                                        onChange={(e) => setCodeLanguage(e.target.value)}
                                        className="bg-secondary border border-border rounded-lg px-3 py-1.5 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    >
                                        {CODE_LANGUAGES.map((lang) => (
                                            <option key={lang.value} value={lang.value}>
                                                {lang.label}{lang.preview ? ' ✓' : ''}
                                            </option>
                                        ))}
                                    </select>
                                    {supportsPreview(codeLanguage) && (
                                        <button
                                            onClick={() => setShowPreview(!showPreview)}
                                            className={cn(
                                                "flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-colors border",
                                                showPreview
                                                    ? "bg-primary/10 border-primary text-primary"
                                                    : "bg-secondary border-border text-muted-foreground hover:text-foreground"
                                            )}
                                        >
                                            {showPreview ? <Eye className="h-4 w-4" /> : <EyeOff className="h-4 w-4" />}
                                            Preview
                                        </button>
                                    )}
                                </div>

                                {/* Split pane: Editor + Preview */}
                                <div className={cn(
                                    "grid gap-4",
                                    showPreview && supportsPreview(codeLanguage) ? "grid-cols-1 lg:grid-cols-2" : "grid-cols-1"
                                )}>
                                    {/* Code Editor */}
                                    <div>
                                        <textarea
                                            value={codeContent}
                                            onChange={(e) => setCodeContent(e.target.value)}
                                            placeholder={codeLanguage === 'html'
                                                ? '<h1>Hello World</h1>\n<p>Start typing to see preview...</p>'
                                                : codeLanguage === 'jsx' || codeLanguage === 'tsx'
                                                    ? 'function App() {\n  return <h1>Hello World</h1>;\n}'
                                                    : '// Paste or write your code here...'}
                                            className="w-full min-h-[350px] bg-secondary/30 border border-border rounded-lg p-4 text-sm font-mono resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                            spellCheck={false}
                                        />
                                    </div>

                                    {/* Live Preview */}
                                    {showPreview && supportsPreview(codeLanguage) && (
                                        <div className="min-h-[350px]">
                                            <CodePreview
                                                code={codeContent}
                                                language={codeLanguage}
                                                className="h-full"
                                            />
                                        </div>
                                    )}
                                </div>

                                <div className="flex items-center justify-between mt-3">
                                    {supportsPreview(codeLanguage) && (
                                        <p className="text-xs text-muted-foreground">
                                            Preview updates as you type
                                        </p>
                                    )}
                                    {!supportsPreview(codeLanguage) && (
                                        <p className="text-xs text-muted-foreground">
                                            Preview not available for {codeLanguage}
                                        </p>
                                    )}
                                    <button
                                        onClick={handleSaveCode}
                                        disabled={!codeContent.trim()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            codeContent.trim()
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Save as Artifact
                                    </button>
                                </div>
                            </div>
                        </div>
                    )}

                    {/* External Tab */}
                    {activeTab === 'external' && (
                        <div className="space-y-4">
                            {/* Add Link Button */}
                            {!showLinkForm && (
                                <button
                                    onClick={() => setShowLinkForm(true)}
                                    className="flex items-center gap-2 px-4 py-2 rounded-lg border border-dashed border-border text-sm text-muted-foreground hover:border-primary hover:text-primary transition-colors"
                                >
                                    <Plus className="h-4 w-4" />
                                    Add External Link
                                </button>
                            )}

                            {/* Link Form */}
                            {showLinkForm && (
                                <div className="cyber-card p-4">
                                    <div className="flex items-center justify-between mb-3">
                                        <p className="text-sm font-medium">Add External Link</p>
                                        <button
                                            onClick={() => setShowLinkForm(false)}
                                            className="p-1 rounded text-muted-foreground hover:text-foreground"
                                        >
                                            <X className="h-4 w-4" />
                                        </button>
                                    </div>
                                    <input
                                        type="text"
                                        value={linkTitle}
                                        onChange={(e) => setLinkTitle(e.target.value)}
                                        placeholder="Link title (optional)"
                                        className="w-full bg-secondary/30 border border-border rounded-lg p-2 text-sm mb-2 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <input
                                        type="url"
                                        value={linkUrl}
                                        onChange={(e) => setLinkUrl(e.target.value)}
                                        placeholder="https://..."
                                        className="w-full bg-secondary/30 border border-border rounded-lg p-2 text-sm mb-3 focus:outline-none focus:ring-2 focus:ring-primary/50"
                                    />
                                    <button
                                        onClick={handleSaveLink}
                                        disabled={!linkUrl.trim()}
                                        className={cn(
                                            "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                            linkUrl.trim()
                                                ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                                : "bg-secondary text-muted-foreground cursor-not-allowed"
                                        )}
                                    >
                                        <Plus className="h-4 w-4" />
                                        Add Link
                                    </button>
                                </div>
                            )}

                            {/* Artifacts List */}
                            {focusArtifacts.length === 0 ? (
                                <div className="cyber-card p-8 text-center">
                                    <p className="text-muted-foreground text-sm mb-2">
                                        No artifacts yet.
                                    </p>
                                    <p className="text-xs text-muted-foreground/70">
                                        Create notes, code, or add links in the other tabs.
                                    </p>
                                </div>
                            ) : (
                                <div className="space-y-3">
                                    {focusArtifacts.map((artifact) => (
                                        <div key={artifact.id} className="cyber-card p-4 group">
                                            {editingArtifact?.id === artifact.id ? (
                                                // Edit Mode
                                                <div className="space-y-3">
                                                    <input
                                                        type="text"
                                                        value={editTitle}
                                                        onChange={(e) => setEditTitle(e.target.value)}
                                                        className="w-full bg-secondary/30 border border-border rounded-lg p-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                    <textarea
                                                        value={editContent}
                                                        onChange={(e) => setEditContent(e.target.value)}
                                                        className="w-full min-h-[100px] bg-secondary/30 border border-border rounded-lg p-2 text-sm resize-none focus:outline-none focus:ring-2 focus:ring-primary/50"
                                                    />
                                                    <div className="flex justify-end gap-2">
                                                        <button
                                                            onClick={() => setEditingArtifact(null)}
                                                            className="px-3 py-1.5 rounded-lg text-sm text-muted-foreground hover:text-foreground"
                                                        >
                                                            Cancel
                                                        </button>
                                                        <button
                                                            onClick={handleSaveEdit}
                                                            className="flex items-center gap-1 px-3 py-1.5 rounded-lg bg-primary text-primary-foreground text-sm hover:bg-primary/90"
                                                        >
                                                            <Save className="h-3 w-3" />
                                                            Save
                                                        </button>
                                                    </div>
                                                </div>
                                            ) : (
                                                // View Mode
                                                <div className="flex items-start justify-between">
                                                    <div className="flex-1 min-w-0">
                                                        <div className="flex items-center gap-2 mb-1">
                                                            {artifact.type === 'note' && <FileText className="h-4 w-4 text-muted-foreground" />}
                                                            {artifact.type === 'code' && <Code className="h-4 w-4 text-muted-foreground" />}
                                                            {artifact.type === 'external' && <ExternalLink className="h-4 w-4 text-muted-foreground" />}
                                                            <span className="font-medium text-sm">{artifact.title}</span>
                                                            {artifact.language && (
                                                                <span className="text-[10px] px-1.5 py-0.5 bg-secondary rounded text-muted-foreground">
                                                                    {artifact.language}
                                                                </span>
                                                            )}
                                                        </div>
                                                        <p className="text-xs text-muted-foreground line-clamp-2">
                                                            {artifact.content}
                                                        </p>
                                                    </div>
                                                    <div className="flex items-center gap-1 opacity-0 group-hover:opacity-100 transition-opacity">
                                                        <button
                                                            onClick={() => startEdit(artifact)}
                                                            className="p-1.5 rounded text-muted-foreground hover:text-foreground hover:bg-secondary"
                                                        >
                                                            <Edit2 className="h-3 w-3" />
                                                        </button>
                                                        <button
                                                            onClick={() => deleteFocusArtifact(artifact.id)}
                                                            className="p-1.5 rounded text-muted-foreground hover:text-destructive hover:bg-destructive/10"
                                                        >
                                                            <Trash2 className="h-3 w-3" />
                                                        </button>
                                                    </div>
                                                </div>
                                            )}
                                        </div>
                                    ))}
                                </div>
                            )}
                        </div>
                    )}
                </div>
            </main>

            {/* Finish Modal */}
            {showFinishModal && (
                <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl max-w-lg w-full p-6 shadow-2xl">
                        <div className="flex items-center justify-between mb-4">
                            <h3 className="text-lg font-semibold">Finish Focus</h3>
                            <button
                                onClick={() => {
                                    setShowFinishModal(false)
                                    setFinishError("")
                                }}
                                className="p-1 rounded text-muted-foreground hover:text-foreground transition-colors"
                            >
                                <X className="h-5 w-5" />
                            </button>
                        </div>

                        <div className="space-y-4">
                            {focusArtifacts.length === 0 ? (
                                <div className="p-4 bg-destructive/10 border border-destructive/30 rounded-lg">
                                    <p className="text-sm text-destructive">
                                        You need at least one artifact to complete this focus session.
                                    </p>
                                </div>
                            ) : (
                                <div>
                                    <p className="text-sm font-medium mb-2">Artifacts to submit:</p>
                                    <div className="space-y-2">
                                        {focusArtifacts.map((artifact) => (
                                            <div key={artifact.id} className="flex items-center gap-2 text-sm text-muted-foreground">
                                                {artifact.type === 'note' && <FileText className="h-3 w-3" />}
                                                {artifact.type === 'code' && <Code className="h-3 w-3" />}
                                                {artifact.type === 'external' && <ExternalLink className="h-3 w-3" />}
                                                {artifact.title}
                                            </div>
                                        ))}
                                    </div>
                                    <p className="text-xs text-muted-foreground mt-3">
                                        These artifacts will be saved to your Vault.
                                    </p>
                                </div>
                            )}

                            {finishError && (
                                <p className="text-xs text-destructive">{finishError}</p>
                            )}

                            <div className="flex justify-end gap-3">
                                <button
                                    onClick={() => {
                                        setShowFinishModal(false)
                                        setFinishError("")
                                    }}
                                    className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                                >
                                    Cancel
                                </button>
                                <button
                                    onClick={handleFinish}
                                    disabled={focusArtifacts.length === 0}
                                    className={cn(
                                        "flex items-center gap-2 px-4 py-2 rounded-lg text-sm font-medium transition-colors",
                                        focusArtifacts.length > 0
                                            ? "bg-primary text-primary-foreground hover:bg-primary/90"
                                            : "bg-secondary text-muted-foreground cursor-not-allowed"
                                    )}
                                >
                                    <CheckCircle className="h-4 w-4" />
                                    Complete Focus
                                </button>
                            </div>
                        </div>
                    </div>
                </div>
            )}

            {/* Abandon Confirmation */}
            {showAbandonConfirm && (
                <div className="fixed inset-0 z-[110] bg-black/60 flex items-center justify-center p-4">
                    <div className="bg-card border border-border rounded-xl max-w-md w-full p-6 shadow-2xl">
                        <div className="flex items-start gap-3 mb-4">
                            <div className="p-2 rounded-lg bg-warning/10">
                                <AlertTriangle className="h-5 w-5 text-warning" />
                            </div>
                            <div>
                                <h3 className="text-lg font-semibold">Abandon Focus?</h3>
                                <p className="text-sm text-muted-foreground mt-1">
                                    You will need to complete a reflection about why you're abandoning this session.
                                </p>
                                {focusArtifacts.length > 0 && (
                                    <p className="text-xs text-muted-foreground mt-2">
                                        Note: Your {focusArtifacts.length} artifact{focusArtifacts.length !== 1 ? 's' : ''} will be saved for reference but not added to Vault.
                                    </p>
                                )}
                            </div>
                        </div>

                        <div className="flex justify-end gap-3">
                            <button
                                onClick={() => setShowAbandonConfirm(false)}
                                className="px-4 py-2 rounded-lg text-sm text-muted-foreground hover:text-foreground transition-colors"
                            >
                                Continue Focus
                            </button>
                            <button
                                onClick={handleAbandon}
                                className="px-4 py-2 rounded-lg bg-destructive text-destructive-foreground text-sm font-medium hover:bg-destructive/90 transition-colors"
                            >
                                Abandon & Reflect
                            </button>
                        </div>
                    </div>
                </div>
            )}
        </div>
    )
}

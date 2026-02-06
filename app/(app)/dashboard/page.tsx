"use client"

import { useEffect, useMemo, useState } from "react"
import { Brain, Archive, ChevronDown, ChevronUp, ArrowUpRight, Flame, Target, Clock, Eye, GraduationCap } from "lucide-react"
import {
  useAppStore,
  useTodayLogged,
  useUserActiveIntent,
  useUserIntentHistory,
  useUserFocusHistory,
  useUserReflections,
  useUserActiveFocusSession,
  useUserVaultEntries,
  useUserProjectLogs,
  useUserCompletedFocusSessions
} from "@/lib/store"
import { ActivityChartCard } from "@/components/ui/activity-chart-card"
import { IntentPanel } from "@/components/ui/intent-panel"
import { DomainTasksCard } from "@/components/ui/domain-tasks-card"
import { getGuidanceHint, shouldShowGuidance } from "@/lib/guidance-hints"
import { getProfileSkillDomain } from "@/lib/actions/profile-actions"
import type { SkillDomain } from "@/lib/skill-domain"
import { MentorCard, MentorCardSkeleton, NoMentorAssigned } from "@/components/ui/mentor-card"
import { CurriculumProgress, CurriculumProgressSkeleton, NextCurriculumItem } from "@/components/ui/curriculum-progress"
import {
  getLearningDashboardData,
  initializeLearning,
  completeCurriculumItem,
  startCurriculumItemAction,
  type LearningDashboardData,
} from "@/lib/actions/mentor-actions"

/**
 * FREEWILL DASHBOARD
 * 
 * This page is an exploration space, not a task list.
 * - No prescriptive "do this next" elements
 * - IntentPanel is the primary actionable area
 * - Guidance is observational only (patterns, not directives)
 * - All stats are informational, not obligations
 * - User can do nothing and that is valid
 */
export default function DashboardPage() {
  // User-agnostic store data
  const {
    auraScore,
    auraHistory,
    ritualLogs,
    practiceSessions,
    shadowDrops,
    currentStreak,
  } = useAppStore()

  // USER-SCOPED SELECTORS - Prevent cross-user data leakage
  const activeIntent = useUserActiveIntent()
  const intentHistory = useUserIntentHistory()
  const focusHistory = useUserFocusHistory()
  const reflections = useUserReflections()
  const activeFocusSession = useUserActiveFocusSession()
  const vaultEntries = useUserVaultEntries()
  const projectLogs = useUserProjectLogs()
  const completedFocusSessions = useUserCompletedFocusSessions()

  const todayLogged = useTodayLogged()

  const [displayAura, setDisplayAura] = useState(0)
  const [shadowExpanded, setShadowExpanded] = useState(false)
  const [showIntentHistory, setShowIntentHistory] = useState(false)

  // PHASE 2: Skill domain personalization
  const [skillDomain, setSkillDomain] = useState<SkillDomain>("General")
  const [domainLoading, setDomainLoading] = useState(true)

  // PHASE 2: Fetch skill domain on mount
  useEffect(() => {
    async function fetchDomain() {
      try {
        const domain = await getProfileSkillDomain()
        setSkillDomain(domain)
      } catch (err) {
        console.error("[DashboardPage] Error fetching skill domain:", err)
        setSkillDomain("General")
      } finally {
        setDomainLoading(false)
      }
    }
    fetchDomain()
  }, [])

  // PHASE 3: Learning dashboard data (mentor + curriculum)
  const [learningData, setLearningData] = useState<LearningDashboardData | null>(null)
  const [learningLoading, setLearningLoading] = useState(true)

  // PHASE 3: Fetch learning data on mount
  useEffect(() => {
    async function fetchLearningData() {
      try {
        let data = await getLearningDashboardData()
        // If no mentor or curriculum, initialize learning
        if (!data.mentor || data.curriculum.length === 0) {
          data = await initializeLearning()
        }
        setLearningData(data)
      } catch (err) {
        console.error("[DashboardPage] Error fetching learning data:", err)
      } finally {
        setLearningLoading(false)
      }
    }
    fetchLearningData()
  }, [])

  // PHASE 3: Handlers for curriculum actions
  const handleStartCurriculum = async (itemId: string) => {
    await startCurriculumItemAction(itemId)
    // Refresh learning data
    const data = await getLearningDashboardData()
    setLearningData(data)
  }

  const handleCompleteCurriculum = async (itemId: string) => {
    await completeCurriculumItem(itemId)
    // Refresh learning data
    const data = await getLearningDashboardData()
    setLearningData(data)
  }

  // Animate Aura score
  useEffect(() => {
    let frame: number
    const duration = 500
    const start = performance.now()
    const from = 0
    const to = auraScore

    const loop = (now: number) => {
      const t = Math.min(1, (now - start) / duration)
      const eased = 1 - Math.pow(1 - t, 3)
      const value = Math.round(from + (to - from) * eased)
      setDisplayAura(value)
      if (t < 1) frame = requestAnimationFrame(loop)
    }

    frame = requestAnimationFrame(loop)
    return () => cancelAnimationFrame(frame)
  }, [auraScore])

  // Transform aura history for ActivityChartCard
  const activityChartData = useMemo(() => {
    if (!auraHistory?.length) {
      return [
        { day: "S", value: 0 },
        { day: "M", value: 0 },
        { day: "T", value: 0 },
        { day: "W", value: 0 },
        { day: "T", value: 0 },
        { day: "F", value: 0 },
        { day: "S", value: 0 },
      ]
    }
    const ordered = [...auraHistory].sort((a, b) => a.date.localeCompare(b.date))
    const slice = ordered.slice(-7)
    const dayLabels = ["S", "M", "T", "W", "T", "F", "S"]
    return slice.map((entry, index) => ({
      day: dayLabels[new Date(entry.date).getDay()] || dayLabels[index % 7],
      value: entry.score,
    }))
  }, [auraHistory])

  // FREEWILL: Recent activity - informational only, no urgency
  const recentActivities = useMemo(() => {
    type ActivityType = "ritual" | "practice" | "vault" | "project"
    type ActivityItem = {
      id: string
      type: ActivityType
      title: string
      timestamp: string
    }

    const items: ActivityItem[] = []

    ritualLogs.forEach((log) => {
      items.push({
        id: `ritual-${log.id}`,
        type: "ritual",
        title: log.description || "Ritual logged",
        timestamp: log.date,
      })
    })

    practiceSessions.forEach((session) => {
      items.push({
        id: `practice-${session.id}`,
        type: "practice",
        title: session.type === "drill" ? "Skill drill" : "Thinking exercise",
        timestamp: session.date,
      })
    })

    vaultEntries.forEach((entry) => {
      items.push({
        id: `vault-${entry.id}`,
        type: "vault",
        title: entry.title || "Vault entry",
        timestamp: entry.updatedAt || entry.createdAt,
      })
    })

    projectLogs.forEach((log) => {
      items.push({
        id: `project-${log.id}`,
        type: "project",
        title: log.projectName || "Project log",
        timestamp: log.updatedAt || log.createdAt,
      })
    })

    return items
      .filter((item) => !!item.timestamp)
      .sort((a, b) => new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime())
      .slice(0, 5)
  }, [ritualLogs, practiceSessions, vaultEntries, projectLogs])

  const formatRelativeDay = (iso?: string) => {
    if (!iso) return "No record"
    const date = new Date(iso)
    const today = new Date()
    const diffDays = Math.floor((today.getTime() - date.getTime()) / (1000 * 60 * 60 * 24))
    if (diffDays === 0) return "today"
    if (diffDays === 1) return "yesterday"
    return `${diffDays}d ago`
  }

  const totalVault = vaultEntries.length + projectLogs.length

  const primaryShadowDrop = shadowDrops[0]
  const secondaryShadowDrops = shadowDrops.slice(1, 3)
  const [expandedDropIds, setExpandedDropIds] = useState<string[]>([])

  const toggleDrop = (id: string) => {
    setExpandedDropIds((prev) =>
      prev.includes(id) ? prev.filter((x) => x !== id) : [...prev, id],
    )
  }

  // FREEWILL: Observational guidance only - never prescriptive
  const guidanceContext = {
    focusHistory,
    reflections,
    activeIntent,
    activeFocusSession,
  }
  const showGuidance = shouldShowGuidance(guidanceContext)
  const guidanceHint = showGuidance ? getGuidanceHint(guidanceContext) : null

  // FREEWILL: Recent intents for optional review (not highlighted as "must-do")
  const recentIntents = intentHistory.slice(0, 3)

  return (
    <div className="flex w-full min-h-screen max-w-full flex-col px-4 py-6 md:px-6 md:py-8 lg:px-8">

      {/* FREEWILL: Intent Panel - Primary actionable area (optional, user-driven) */}
      <div className="mb-6">
        <IntentPanel />
      </div>

      {/* FREEWILL: Observational Guidance - Only shown when patterns exist, never prescriptive */}
      {guidanceHint && (
        <div className="mb-6 cyber-card p-4 border-l-2 border-muted-foreground/30">
          <div className="flex items-start gap-3">
            <div className="p-1.5 rounded bg-secondary/50">
              <Eye className="h-4 w-4 text-muted-foreground" />
            </div>
            <div>
              <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                ■ Pattern Observed
              </p>
              {/* FREEWILL: Observational language only - no "should", "must", "try" */}
              <p className="text-sm text-muted-foreground">
                {guidanceHint}
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Stats Row - Aura and Current State dominant, others demoted */}
      <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4 mb-6">
        {/* Aura Score Card - DOMINANT */}
        <div className="cyber-card cyber-card-accent-green p-4">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[10px] font-tech uppercase tracking-widest text-primary mb-1">
                ■ Aura
              </p>
              <p className="text-4xl font-tech font-bold text-foreground tabular-nums">
                {displayAura}
              </p>
              {/* FREEWILL: Neutral descriptor, not a prompt */}
              <p className="text-xs text-muted-foreground mt-1">
                Current score
              </p>
            </div>
            <div className={`p-2 rounded-lg ${todayLogged ? 'bg-primary/10' : 'bg-secondary'}`}>
              <ArrowUpRight className={`h-5 w-5 ${todayLogged ? 'text-primary' : 'text-muted-foreground'}`} />
            </div>
          </div>
        </div>

        {/* Current Streak Card - DEMOTED: smaller text, muted colors, no accent border */}
        <div className="cyber-card p-4 opacity-70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                ■ Streak
              </p>
              <p className="text-2xl font-tech font-medium text-muted-foreground tabular-nums">
                {currentStreak}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Days recorded
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-secondary/50">
              <Flame className="h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>

        {/* Focus Sessions - DEMOTED: smaller text, muted colors, no accent border */}
        <div className="cyber-card p-4 opacity-70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                ■ Focus Sessions
              </p>
              <p className="text-2xl font-tech font-medium text-muted-foreground tabular-nums">
                {completedFocusSessions}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Completed with reflection
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-secondary/50">
              <Target className="h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>

        {/* Vault Entries Card - DEMOTED: smaller text, muted colors, no accent border */}
        <div className="cyber-card p-4 opacity-70">
          <div className="flex items-start justify-between">
            <div>
              <p className="text-[9px] font-tech uppercase tracking-widest text-muted-foreground mb-1">
                ■ Vault
              </p>
              <p className="text-2xl font-tech font-medium text-muted-foreground tabular-nums">
                {totalVault}
              </p>
              <p className="text-[10px] text-muted-foreground/70 mt-1">
                Entries archived
              </p>
            </div>
            <div className="p-1.5 rounded-lg bg-secondary/50">
              <Archive className="h-4 w-4 text-muted-foreground/60" />
            </div>
          </div>
        </div>
      </div>

      {/* PHASE 2: Personalized Learning Path - Domain-specific tasks */}
      {!domainLoading && (
        <div className="mb-6">
          <DomainTasksCard domain={skillDomain} />
        </div>
      )}

      {/* PHASE 3: Mentor & Curriculum Section */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
        {/* Mentor Card */}
        <div className="lg:col-span-1">
          <div className="mb-2">
            <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground flex items-center gap-1.5">
              <GraduationCap className="h-3.5 w-3.5" />
              Your Mentor
            </p>
          </div>
          {learningLoading ? (
            <MentorCardSkeleton />
          ) : learningData?.mentor ? (
            <MentorCard
              mentor={learningData.mentor.mentor}
              assignedAt={learningData.mentor.assignedAt}
              showActions={true}
            />
          ) : (
            <NoMentorAssigned />
          )}
        </div>

        {/* Next Curriculum Item + Progress */}
        <div className="lg:col-span-2">
          <div className="mb-2">
            <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
              ■ Learning Path
            </p>
          </div>
          {learningLoading ? (
            <CurriculumProgressSkeleton />
          ) : learningData?.curriculum && learningData.curriculum.length > 0 ? (
            <div className="space-y-4">
              {learningData.nextItem && (
                <NextCurriculumItem
                  item={learningData.nextItem}
                  onStart={async () => {
                    await handleStartCurriculum(learningData.nextItem!.id)
                  }}
                />
              )}
              <CurriculumProgress
                items={learningData.curriculum}
                progress={learningData.progress}
                onStartItem={handleStartCurriculum}
                onCompleteItem={handleCompleteCurriculum}
              />
            </div>
          ) : (
            <div className="cyber-card p-6 text-center">
              <p className="text-sm text-muted-foreground">
                Complete your onboarding to get personalized curriculum recommendations.
              </p>
            </div>
          )}
        </div>
      </div>

      {/* Main Content Grid */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 flex-1">
        {/* Left Column - Chart + Shadow Drops */}
        <div className="lg:col-span-2 space-y-6">
          {/* Chart Section - Read-only, passive, no interactive controls */}
          <div className="cyber-card p-5">
            <div className="flex items-center justify-between mb-4">
              <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                ■ Weekly Aura
              </p>
              <div className="flex items-center gap-4 text-xs">
                <span className="flex items-center gap-1.5">
                  <span className="h-2 w-2 rounded-full bg-primary" />
                  <span className="text-muted-foreground font-tech">Aura</span>
                </span>
              </div>
            </div>
            <ActivityChartCard
              title=""
              totalValue=""
              trendText=""
              data={activityChartData}
              dropdownOptions={[]}
              className="border-0 bg-transparent p-0 shadow-none pointer-events-none"
            />
          </div>

          {/* FREEWILL: Historical Intents - Optional review, no urgency */}
          {recentIntents.length > 0 && (
            <div className="cyber-card p-5">
              <button
                onClick={() => setShowIntentHistory(!showIntentHistory)}
                className="w-full flex items-center justify-between"
              >
                <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                  ■ Past Intents ({intentHistory.length})
                </p>
                {showIntentHistory ? (
                  <ChevronUp className="h-4 w-4 text-muted-foreground" />
                ) : (
                  <ChevronDown className="h-4 w-4 text-muted-foreground" />
                )}
              </button>
              {showIntentHistory && (
                <div className="mt-4 space-y-3">
                  {recentIntents.map((intent) => (
                    <div
                      key={intent.id}
                      className="p-3 rounded-lg bg-secondary/30 border border-border/50"
                    >
                      <p className="text-sm text-foreground line-clamp-2">
                        {intent.declaration}
                      </p>
                      <p className="text-xs text-muted-foreground mt-1">
                        {new Date(intent.declaredAt).toLocaleDateString()}
                      </p>
                    </div>
                  ))}
                </div>
              )}
            </div>
          )}

          {/* Shadow Drop Section - COLLAPSED BY DEFAULT */}
          <div className="cyber-card p-5">
            <button
              onClick={() => setShadowExpanded((prev) => !prev)}
              className="w-full flex items-center justify-between"
            >
              <div className="flex items-center gap-2">
                <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground">
                  ■ Shadow Drop
                </p>
                <span className="text-xs text-muted-foreground/70">
                  {primaryShadowDrop?.title || "Identity Before Outcome"}
                </span>
              </div>
              {shadowExpanded ? (
                <ChevronUp className="h-4 w-4 text-muted-foreground" />
              ) : (
                <ChevronDown className="h-4 w-4 text-muted-foreground" />
              )}
            </button>

            {shadowExpanded && (
              <div className="mt-4 space-y-4">
                <div>
                  <h3 className="text-lg font-tech font-semibold text-foreground">
                    {primaryShadowDrop?.title || "Identity Before Outcome"}
                  </h3>
                  <p className="mt-2 text-sm text-muted-foreground">
                    {primaryShadowDrop?.content ||
                      "Goals push you to act once. Identity keeps you acting indefinitely. Your Aura tracks identity, not ambition."}
                  </p>
                </div>

                {secondaryShadowDrops.length > 0 && (
                  <div className="border-t border-border pt-4">
                    <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-3">
                      Previous Drops
                    </p>
                    <div className="grid gap-3 sm:grid-cols-2">
                      {secondaryShadowDrops.map((drop) => {
                        const expanded = expandedDropIds.includes(drop.id)
                        return (
                          <div
                            key={drop.id}
                            className="rounded-lg bg-secondary/30 border border-border p-3"
                          >
                            <p className="truncate font-tech text-sm text-foreground">
                              {drop.title}
                            </p>
                            <p
                              className={`mt-1 text-xs text-muted-foreground transition-all duration-200 ${expanded ? "" : "line-clamp-2"
                                }`}
                            >
                              {drop.content}
                            </p>
                            <button
                              type="button"
                              onClick={() => toggleDrop(drop.id)}
                              className="mt-2 text-[10px] font-tech text-primary hover:text-primary/80 transition-colors uppercase tracking-wide"
                            >
                              {expanded ? "Hide" : "Read"}
                            </button>
                          </div>
                        )
                      })}
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Right Column - Activity Feed */}
        <div className="space-y-6">
          {/* FREEWILL: Status Card - DOMINANT, Neutral state, no obligations */}
          <div className="cyber-card cyber-card-accent-green p-5">
            <p className="text-[10px] font-tech uppercase tracking-widest text-primary mb-3">
              ■ Current State
            </p>
            <div className="flex items-center gap-3">
              <div className="p-2 rounded-lg bg-primary/10">
                <Clock className="h-5 w-5 text-primary" />
              </div>
              <div>
                {/* FREEWILL: Idle-ready messaging - no pressure */}
                <p className="text-sm font-tech text-foreground">
                  {activeIntent ? "Intent declared" : "Idle"}
                </p>
                <p className="text-xs text-muted-foreground">
                  {activeIntent ? "Focus when ready" : "No requirements"}
                </p>
              </div>
            </div>
          </div>

          {/* Recent Activity - Historical record, not prompts */}
          <div className="cyber-card p-5">
            <p className="text-[10px] font-tech uppercase tracking-widest text-muted-foreground mb-4">
              ■ Recent Activity
            </p>
            {recentActivities.length === 0 ? (
              <p className="text-sm text-muted-foreground">No activity recorded.</p>
            ) : (
              <div className="space-y-3">
                {recentActivities.map((activity) => (
                  <div
                    key={activity.id}
                    className="flex items-start gap-3 p-3 rounded-lg bg-secondary/30 border border-border/50"
                  >
                    <div className="mt-0.5 flex h-8 w-8 flex-shrink-0 items-center justify-center rounded-lg bg-secondary border border-border">
                      {activity.type === "practice" ? (
                        <Brain className="h-4 w-4 text-muted-foreground" />
                      ) : activity.type === "vault" || activity.type === "project" ? (
                        <Archive className="h-4 w-4 text-muted-foreground" />
                      ) : (
                        <Flame className="h-4 w-4 text-muted-foreground" />
                      )}
                    </div>
                    <div className="min-w-0 flex-1">
                      <p className="line-clamp-1 text-sm font-tech text-foreground">
                        {activity.title}
                      </p>
                      <p className="mt-0.5 text-xs text-muted-foreground">
                        {formatRelativeDay(activity.timestamp)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>
        </div>
      </div>
    </div>
  )
}

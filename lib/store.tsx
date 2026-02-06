"use client"

import { create } from "zustand"
import { persist } from "zustand/middleware"

export type RitualDepth = "light" | "focused" | "deep"

/**
 * @deprecated LEGACY SYSTEM - Read-only access only.
 * No new RitualLog entries may be created. This interface is retained
 * for backward compatibility with existing user data.
 */
export interface RitualLog {
  id: string
  date: string
  description: string
  depth: RitualDepth
  hasProof: boolean
  proofUrl?: string
  proofType?: "link" | "file"
  prompt?: string
  unverified?: boolean
}

/**
 * @deprecated LEGACY SYSTEM - Read-only access only.
 * ShadowDrop mutations are disabled. This interface is retained
 * for displaying existing content only.
 */
export interface ShadowDrop {
  id: string
  title: string
  content: string
  publishedAt: string
  isRead: boolean
  reflection?: string
}

export interface ShadowUnit {
  id: string
  trackId: string
  title: string
  realityStatement: string
  guidedActions: string[]
  practicePrompt: string
  practiceType: "code" | "terminal" | "screenshot" | "reflection"
  whyItMatters: string
  userSubmission?: string
}

export interface ShadowTrack {
  id: string
  title: string
  description: string
  units: ShadowUnit[]
}

export interface SkillDrill {
  id: string
  title: string
  description: string
  difficulty: "beginner" | "intermediate" | "advanced"
  code?: string
  options?: { id: string; text: string; isCorrect: boolean }[]
  explanation: string
}

export interface ThinkingGame {
  id: string
  title: string
  scenario: string
  question: string
  options: { id: string; text: string; insight: string }[]
  bestOptionId: string
}

/**
 * @deprecated LEGACY SYSTEM - Read-only access only.
 * No new PracticeSession entries may be created. This interface is retained
 * for backward compatibility with existing user data.
 */
export interface PracticeSession {
  id: string
  date: string
  type: "drill" | "thinking"
  drillId?: string
  gameId?: string
  correct: boolean
  timeSpent: number
  unverified?: boolean
}

/**
 * User habit tracking state for habit card components.
 */
export interface UserHabitState {
  habitId: string
  status: "not_started" | "in_progress" | "completed"
  completionCount: number
  lastCompletedAt?: string
}

export interface VaultEntry {
  id: string
  userId: string
  type: "learning" | "solution" | "mistake" | "note" | "code" | "external"
  title: string
  content: string
  language?: string
  url?: string
  tags: string[]
  createdAt: string
  updatedAt: string
  unverified?: boolean
  /** Entries created before system hardening are marked legacy */
  isLegacy?: boolean
  /** Ties entry to a FocusSession for proof provenance */
  focusSessionId?: string
  /** Ties entry to an Intent for proof provenance */
  intentId?: string
}

export interface ProjectLog {
  id: string
  userId: string
  projectName: string
  idea: string
  decisions: string[]
  bugs: string[]
  improvements: string[]
  createdAt: string
  updatedAt: string
  unverified?: boolean
}

// ============================================================================
// FREEWILL MENTOR SYSTEM - Core Types
// ============================================================================

/**
 * INTENT SYSTEM
 * Intent is a user-written declaration of what they choose to care about.
 * - Not system-generated
 * - Not mandatory
 * - Only ONE active intent at a time
 * - Declaring intent does NOT start focus, lock navigation, or trigger reflection
 */
export interface Intent {
  id: string
  userId: string
  declaration: string
  status: 'declared' | 'in_focus' | 'resolved'
  declaredAt: string
  resolvedAt?: string
}

/**
 * FOCUS SYSTEM
 * Focus is the only moment discipline applies.
 * - Starts ONLY when user explicitly clicks "Begin Focus"
 * - Requires an active intent
 * - Navigation locked, back button blocked
 * - Persists across refresh
 * - Only exits: Finish Focus or Abandon Focus
 */
export interface FocusSession {
  id: string
  userId: string
  intentId: string
  intentDeclaration: string
  startedAt: string
  endedAt?: string
  status: 'active' | 'finished' | 'abandoned'
  outcome: 'finished' | 'abandoned' | null
  reflectionSubmitted: boolean
  reflectionDeferred: boolean
  proof?: string  // Required for 'finished' outcome
  artifacts: FocusArtifact[]  // Work created during this session
}

/**
 * FOCUS ARTIFACT SYSTEM
 * Artifacts are tangible proof of work created during focus.
 * - Notes: Documentation, thoughts, decisions
 * - Code: Code snippets with optional language
 * - Link: External resources, URLs to work
 */
export interface FocusArtifact {
  id: string
  userId: string
  focusSessionId: string
  type: 'note' | 'code' | 'external'
  title: string
  content: string
  language?: string  // For code: 'javascript', 'html', 'css', 'jsx', 'tsx', etc.
  previewSupported?: boolean  // True for HTML/CSS/JS/React
  url?: string  // For external links
  createdAt: string
  updatedAt: string
}

/**
 * REFLECTION SYSTEM
 * Reflection happens ONLY after Finish Focus or Abandon Focus.
 * - Cannot be skipped, dismissed, or ESC-closed
 * - Must reference: intent, outcome, mistake pattern, insight
 * - Not shown if focus never started
 */
export interface Reflection {
  id: string
  userId: string
  focusSessionId: string
  intentDeclaration: string
  outcome: 'finished' | 'abandoned'
  outcomeDescription: string
  mistakePattern: string
  insight: string
  createdAt: string
}

export type AuraStatus = "weak" | "forming" | "solid" | "strong"

interface AppState {
  // User state
  userId: string
  isOnboarded: boolean
  userName: string
  userEmail: string
  publicAlias: string
  profileImage: string
  emailVerified: boolean
  verificationCode: string
  verificationSentAt: string
  joinDate: string
  focusArea: string

  // Aura system
  auraScore: number
  auraHistory: { date: string; score: number }[]
  lastDecayCheck: string

  // Ritual system
  ritualLogs: RitualLog[]
  todayLogged: boolean
  currentStreak: number
  longestStreak: number

  // Shadow drops (reading content)
  shadowDrops: ShadowDrop[]

  // Shadow curriculum (learning system)
  shadowTracks: ShadowTrack[]
  completedUnits: string[]

  practiceSessions: PracticeSession[]

  vaultEntries: VaultEntry[]
  projectLogs: ProjectLog[]

  futureReflection: string

  profileBackgroundColor: string

  /**
   * FREEWILL ENTRY STATE
   * User enters in IDLE mode. No nudges, no prompts, no obligations.
   * User may browse, do nothing, or leave at any time.
   */
  userMode: "IDLE" | "ACTIVE"

  // ============================================================================
  // FREEWILL MENTOR SYSTEM - State
  // ============================================================================

  /** Active intent (only one at a time) */
  activeIntent: Intent | null
  /** History of resolved intents */
  intentHistory: Intent[]
  /** Active focus session (only one at a time) */
  activeFocusSession: FocusSession | null
  /** History of completed focus sessions */
  focusHistory: FocusSession[]
  /** Reflections tied to focus sessions */
  reflections: Reflection[]
  /** Temporary artifacts created during active focus session */
  focusArtifacts: FocusArtifact[]


  // Actions
  completeOnboarding: (name: string, email: string, focusArea: string) => void
  updateProfile: (name: string, email: string, focusArea: string, publicAlias?: string, profileImage?: string) => void
  setVerificationChallenge: (code: string) => void
  confirmVerificationCode: (code: string) => boolean
  clearVerificationChallenge: () => void
  markEmailVerified: () => void
  logRitual: (
    description: string,
    depth: RitualDepth,
    proofUrl?: string,
    proofType?: "link" | "file",
    prompt?: string,
  ) => void
  markShadowRead: (id: string) => void
  saveShadowReflection: (id: string, reflection: string) => void
  saveFutureReflection: (reflection: string) => void
  calculateAuraStatus: () => AuraStatus
  getAuraTrend: () => "up" | "down" | "stable"
  checkAndApplyDecay: () => { decayed: boolean; amount: number }
  resetState: () => void

  // Learning actions
  completeUnit: (unitId: string, submission: string) => void

  logPracticeSession: (session: Omit<PracticeSession, "id" | "date">) => void

  addVaultEntry: (entry: Omit<VaultEntry, "id" | "userId" | "createdAt" | "updatedAt">) => void
  updateVaultEntry: (id: string, updates: Partial<VaultEntry>) => void
  deleteVaultEntry: (id: string) => void
  addProjectLog: (log: Omit<ProjectLog, "id" | "userId" | "createdAt" | "updatedAt">) => void
  updateProjectLog: (id: string, updates: Partial<ProjectLog>) => void
  deleteProjectLog: (id: string) => void

  setProfileBackgroundColor: (color: string) => void

  // ============================================================================
  // FREEWILL MENTOR SYSTEM - Actions
  // ============================================================================

  /**
   * Declare intent - user-written, not system-generated.
   * Does NOT start focus, lock navigation, or trigger reflection.
   */
  declareIntent: (declaration: string) => void

  /**
   * Begin focus - only works if an active intent exists.
   * Locks navigation, starts focus session.
   */
  beginFocus: () => boolean

  /**
   * Finish focus - requires proof artifact.
   * Returns false if proof is empty/missing.
   */
  finishFocus: (proof: string) => boolean

  /**
   * Abandon focus - transitions to mandatory reflection.
   */
  abandonFocus: () => void

  /**
   * Defer reflection - allows user to save reflection for later.
   * Scoped to specific focus session.
   */
  deferReflection: () => void

  /**
   * Submit reflection - completes the reflection requirement.
   * Called after focus ends (either finished or abandoned).
   */
  submitReflection: (data: {
    outcomeDescription: string
    mistakePattern: string
    insight: string
  }) => void

  /**
   * Resolve intent without focus - marks intent as resolved.
   * Only allowed if intent is in 'declared' status.
   */
  resolveIntent: () => void

  /**
   * Clear session state on logout to prevent cross-user bleed.
   */
  clearSessionOnLogout: () => void,

  /**
   * Reset all user-scoped state on auth boundary.
   * MANDATORY: Call on login/logout/user switch to prevent data leakage.
   */
  resetUserScopedState: () => void

  /**
   * Set the current user ID and reset state if user changed.
   * Called by auth state change listener.
   */
  setUserId: (userId: string) => void

  // ============================================================================
  // FOCUS ARTIFACT ACTIONS
  // ============================================================================

  /**
   * Add artifact during focus session.
   * Only works when focus is active.
   */
  addFocusArtifact: (artifact: Omit<FocusArtifact, 'id' | 'userId' | 'focusSessionId' | 'createdAt' | 'updatedAt'>) => void

  /**
   * Update existing artifact during focus session.
   */
  updateFocusArtifact: (id: string, updates: Partial<Pick<FocusArtifact, 'title' | 'content' | 'language' | 'previewSupported' | 'url'>>) => void

  /**
   * Delete artifact during focus session.
   */
  deleteFocusArtifact: (id: string) => void

}

const defaultShadowDrops: ShadowDrop[] = [
  {
    id: "1",
    title: "The Myth of Motivation",
    content:
      "Motivation is not a prerequisite for action. It is a byproduct of it. The disciplined do not wait to feel ready. They begin, and readiness follows. Your future self is built in the moments you choose to act without enthusiasm.\n\nThis is the difference between amateurs and professionals. Amateurs wait for inspiration. Professionals show up on schedule. The muse visits those who are already at work.\n\nStart before you're ready. Act before you feel like it. The feeling follows the action, not the other way around.",
    publishedAt: "2024-12-15",
    isRead: false,
  },
  {
    id: "2",
    title: "Consistency Over Intensity",
    content:
      "A single hour of deep work every day for a year outweighs a weekend of manic productivity. The compounding effect of small, repeated efforts creates what bursts of energy never can: lasting change.\n\nThe math is simple but counterintuitive. One hour daily equals 365 hours yearly. A 12-hour weekend sprint, repeated monthly, equals 144 hours. Consistency wins by a factor of 2.5x—and that's before accounting for the retention and skill-building that daily practice provides.\n\nChoose sustainable intensity over heroic effort. The tortoise understood something the hare didn't.",
    publishedAt: "2024-12-12",
    isRead: false,
  },
  {
    id: "3",
    title: "The Weight of Uncommitted Days",
    content:
      "Every day you skip accumulates. Not as guilt—that fades. But as distance between who you are and who you intended to become. The gap grows silently.\n\nMissed days don't announce themselves. They slip by quietly, each one whispering that tomorrow will be different. But tomorrow arrives with the same excuses, the same friction, the same path of least resistance.\n\nThe antidote is not motivation. It's acknowledgment. See the gap clearly. Feel its weight. Then decide if you're willing to let it grow.",
    publishedAt: "2024-12-09",
    isRead: false,
  },
  {
    id: "4",
    title: "Identity Before Outcome",
    content:
      "Goals are useful for direction, but identity determines trajectory. The person who runs once wants to finish a race. The person who is a runner will run regardless of races.\n\nEvery action you take is a vote for the type of person you wish to become. Each ritual logged is not just a task completed—it's a statement about who you are. You are the kind of person who shows up. Who does the work. Who maintains their commitments.\n\nFocus less on what you want to achieve and more on who you want to become. The outcomes follow the identity.",
    publishedAt: "2024-12-06",
    isRead: false,
  },
  {
    id: "5",
    title: "The Silence of Progress",
    content:
      "Real progress is quiet. It doesn't announce itself or seek validation. It accumulates in the margins, in the daily decisions no one sees, in the work done without witnesses.\n\nThe loudest transformations are often the most fragile. Announced goals create social pressure but not internal change. The person who quietly does the work for months before speaking is building something durable.\n\nLet your actions compound in silence. Let the results speak when they're ready. The work doesn't need an audience to matter.",
    publishedAt: "2024-12-03",
    isRead: false,
  },
  {
    id: "6",
    title: "Friction as Information",
    content:
      "The resistance you feel before starting is data, not destiny. It tells you what matters, what challenges you, what lies outside your comfort zone.\n\nHigh friction activities are often high value activities. The brain resists what is difficult, uncertain, or ego-threatening—precisely the things that create growth. Low friction activities feel good but rarely move the needle.\n\nNotice where the friction is. That's usually where you need to go.",
    publishedAt: "2024-11-30",
    isRead: false,
  },
]

const defaultShadowTracks: ShadowTrack[] = [
  {
    id: "foundations",
    title: "Foundations",
    description: "Start from absolute zero. No assumptions.",
    units: [
      {
        id: "f1",
        trackId: "foundations",
        title: "Your First Tool: The Code Editor",
        realityStatement: "Most people install VS Code without knowing what it actually does.",
        guidedActions: [
          "Download VS Code from code.visualstudio.com",
          "Open it. Look at the interface. Don't touch anything yet.",
          "Identify: the file explorer (left), the editor (center), the terminal (bottom)",
          "Create a new file. Save it as 'test.txt'. Write your name in it.",
          "Close VS Code. Open it again. Find your file.",
        ],
        practicePrompt:
          "Describe in your own words what VS Code is and what the three main areas do. What surprised you?",
        practiceType: "reflection",
        whyItMatters:
          "A code editor is where you'll spend thousands of hours. Understanding it deeply separates professionals from people who just follow tutorials.",
      },
      {
        id: "f2",
        trackId: "foundations",
        title: "The Terminal Is Not Scary",
        realityStatement: "The terminal is just a text-based way to control your computer. That's it.",
        guidedActions: [
          "Open the terminal in VS Code (View → Terminal, or Ctrl/Cmd + `)",
          "Type 'pwd' and press Enter. This shows where you are.",
          "Type 'ls' (Mac/Linux) or 'dir' (Windows). This lists files.",
          "Type 'cd Desktop' to move to your Desktop folder.",
          "Type 'mkdir practice' to create a new folder called 'practice'.",
        ],
        practicePrompt: "Paste the output of running 'pwd' and 'ls' in your terminal. What folder are you in?",
        practiceType: "terminal",
        whyItMatters:
          "Every real developer uses the terminal daily. It's faster, more powerful, and essential for professional work. Fear of it holds people back for years.",
      },
      {
        id: "f3",
        trackId: "foundations",
        title: "Your First HTML File",
        realityStatement: "HTML is not a programming language. It's a way to structure content. Nothing more.",
        guidedActions: [
          "In VS Code, create a new file called 'index.html'",
          "Type '!' and press Tab. VS Code will generate HTML boilerplate.",
          "Inside the <body> tag, add: <h1>Hello World</h1>",
          "Save the file. Find it in your file explorer.",
          "Double-click it. It opens in your browser.",
        ],
        practicePrompt: "Paste your HTML code here. Then describe what you see in the browser.",
        practiceType: "code",
        whyItMatters:
          "This is the foundation of everything on the web. Every website you've ever visited started as an HTML file. You just made one.",
      },
      {
        id: "f4",
        trackId: "foundations",
        title: "Variables Are Just Labels",
        realityStatement: "A variable is a name attached to a value. That's the entire concept.",
        guidedActions: [
          "Create a file called 'script.js'",
          "Write: let name = 'your name here';",
          "Write: console.log(name);",
          "Open the terminal and run: node script.js",
          "Change the value of 'name' and run it again.",
        ],
        practicePrompt: "Paste your code. What happened when you changed the name?",
        practiceType: "code",
        whyItMatters:
          "Variables are the atoms of programming. Everything else is built on storing and manipulating values. Get this, and you get the foundation of all code.",
      },
    ],
  },
  {
    id: "developer-thinking",
    title: "Developer Thinking",
    description: "How to think, not what to type.",
    units: [
      {
        id: "dt1",
        trackId: "developer-thinking",
        title: "Read The Error Message",
        realityStatement: "Most beginners look at errors and panic. Most errors tell you exactly what's wrong.",
        guidedActions: [
          "Create a file called 'broken.js'",
          "Write: console.log(hello) — notice there are no quotes",
          "Run it with: node broken.js",
          "Read the error message carefully. What does it say?",
          "Fix it by adding quotes: console.log('hello')",
        ],
        practicePrompt: "Paste the error message you saw. In your own words, what was it telling you?",
        practiceType: "terminal",
        whyItMatters:
          "Reading error messages is a superpower. Beginners ignore them. Professionals read them first. This habit alone will save you hundreds of hours.",
      },
      {
        id: "dt2",
        trackId: "developer-thinking",
        title: "Break It Down",
        realityStatement:
          "Every complex problem is a collection of small problems. Solve the small ones, and the big one solves itself.",
        guidedActions: [
          "Think of something you want to build (a to-do list, a calculator, anything)",
          "Write down 5-10 tiny steps it would require",
          "For each step, ask: Do I know how to do this? If not, what do I need to learn?",
          "Pick ONE step. Just one. Figure out how to do only that.",
          "Document what you learned.",
        ],
        practicePrompt:
          "What did you want to build? List your breakdown. Which step did you tackle first, and what did you learn?",
        practiceType: "reflection",
        whyItMatters:
          "This is how senior developers approach every problem. They don't see complexity—they see a list of simple tasks. Train this mental model early.",
      },
      {
        id: "dt3",
        trackId: "developer-thinking",
        title: "Google Like A Developer",
        realityStatement: "Professional developers Google things constantly. The skill is knowing what to search.",
        guidedActions: [
          "Try to do something you don't know how to do (e.g., 'center a div')",
          "Search: 'how to center a div CSS'",
          "Open the top 3 results. Compare the answers.",
          "Try each solution. See which one actually works for your case.",
          "Bookmark the best resource you found.",
        ],
        practicePrompt: "What did you search for? What did you learn about comparing multiple sources?",
        practiceType: "reflection",
        whyItMatters:
          "You will never memorize everything. Knowing how to find answers quickly and evaluate them critically is a permanent career skill.",
      },
    ],
  },
  {
    id: "real-world-tools",
    title: "Real-World Tools",
    description: "What professionals actually use.",
    units: [
      {
        id: "rw1",
        trackId: "real-world-tools",
        title: "Git Is Not Optional",
        realityStatement: "Every professional developer uses Git. Every company expects you to know it.",
        guidedActions: [
          "Install Git from git-scm.com",
          "Open terminal. Type: git --version",
          "Navigate to a project folder. Type: git init",
          "Create a file. Then: git add . then: git commit -m 'first commit'",
          "Type: git log to see your commit history",
        ],
        practicePrompt: "Paste the output of 'git log' showing your first commit.",
        practiceType: "terminal",
        whyItMatters:
          "Git tracks your code history. It lets you undo mistakes, collaborate with others, and is required for any professional job. No exceptions.",
      },
      {
        id: "rw2",
        trackId: "real-world-tools",
        title: "GitHub Is Your Portfolio",
        realityStatement: "Your GitHub profile is often the first thing employers look at. More than your resume.",
        guidedActions: [
          "Create a GitHub account at github.com",
          "Create a new repository (green 'New' button)",
          "Follow their instructions to connect your local project",
          "Push your first commit: git push -u origin main",
          "Visit your GitHub repo in the browser. Your code is there.",
        ],
        practicePrompt: "Paste the link to your GitHub repository.",
        practiceType: "reflection",
        whyItMatters:
          "GitHub is where you prove you can code. No degree or certificate matters as much as a GitHub profile showing real projects and consistent commits.",
      },
      {
        id: "rw3",
        trackId: "real-world-tools",
        title: "npm: The Package Manager",
        realityStatement: "You don't write everything from scratch. npm lets you use code others have written.",
        guidedActions: [
          "Make sure Node.js is installed: node --version",
          "In a project folder, run: npm init -y",
          "Look at the package.json file it created",
          "Install a package: npm install lodash",
          "Look at node_modules folder. That's where packages live.",
        ],
        practicePrompt: "Paste the contents of your package.json file.",
        practiceType: "code",
        whyItMatters:
          "Modern development is built on packages. Understanding npm unlocks React, Next.js, and every modern framework.",
      },
    ],
  },
  {
    id: "career-reality",
    title: "Career Reality",
    description: "What nobody tells you about getting hired.",
    units: [
      {
        id: "cr1",
        trackId: "career-reality",
        title: "Nobody Cares About Your Bootcamp",
        realityStatement: "Certificates and bootcamp completion don't get you hired. Proof of work does.",
        guidedActions: [
          "Look at 5 job postings for junior developers",
          "Write down what they actually ask for (not 'preferred')",
          "Compare that to what you know right now",
          "Identify the biggest gap between what they want and what you have",
          "Plan how you'll close that gap in the next 30 days",
        ],
        practicePrompt: "What was the biggest gap you identified? What's your 30-day plan to close it?",
        practiceType: "reflection",
        whyItMatters:
          "The job market is competitive. Winners are people who see clearly where they stand and take action to improve. Self-delusion doesn't get hired.",
      },
      {
        id: "cr2",
        trackId: "career-reality",
        title: "Your Projects Are Your Resume",
        realityStatement: "Three solid projects beat 30 tutorial clones. Quality over quantity.",
        guidedActions: [
          "Think of a problem you or someone you know actually has",
          "Design a simple solution (it doesn't need to be revolutionary)",
          "Build a basic version. It should work, not be perfect.",
          "Put it on GitHub with a clear README explaining what it does",
          "Deploy it somewhere (Vercel, Netlify) so anyone can see it",
        ],
        practicePrompt: "What problem did you choose? How will your project solve it?",
        practiceType: "reflection",
        whyItMatters:
          "Employers want to see that you can solve real problems. A project that solves an actual need shows more than any number of to-do app tutorials.",
      },
    ],
  },
  {
    id: "silent-skills",
    title: "Silent Skills",
    description: "The things that separate good from great.",
    units: [
      {
        id: "ss1",
        trackId: "silent-skills",
        title: "Ask Better Questions",
        realityStatement: "The quality of help you receive is directly proportional to the quality of your question.",
        guidedActions: [
          "Think of something you're stuck on right now",
          "Write out the question you would ask for help",
          "Now rewrite it with: What you're trying to do, What you've tried, What specific error or result you're getting",
          "Search for that improved question. Did you find better results?",
          "If you still need help, post your well-formed question somewhere (Stack Overflow, Discord, etc.)",
        ],
        practicePrompt: "Paste your original question and your improved version. What changed?",
        practiceType: "reflection",
        whyItMatters:
          "Good developers know how to get help efficiently. A well-formed question often reveals its own answer—and gets faster, better responses when it doesn't.",
      },
      {
        id: "ss2",
        trackId: "silent-skills",
        title: "Read Other People's Code",
        realityStatement: "You learn to write by reading. Code is no different.",
        guidedActions: [
          "Find a popular open-source project on GitHub (start with something small)",
          "Clone it locally: git clone [url]",
          "Open it in VS Code. Just look at the structure first.",
          "Pick ONE file. Read it line by line. Google what you don't understand.",
          "Write 3 things you learned from reading that code",
        ],
        practicePrompt: "What project did you read? What 3 things did you learn?",
        practiceType: "reflection",
        whyItMatters:
          "Professional code looks different from tutorial code. Reading real projects teaches patterns, conventions, and approaches you won't find in courses.",
      },
    ],
  },
]

export const skillDrills: SkillDrill[] = [
  {
    id: "sd1",
    title: "Fix the Bug",
    description: "This code should log 'Hello World' but it doesn't. Find and fix the error.",
    difficulty: "beginner",
    code: `const message = "Hello World"
console.log(mesage)`,
    options: [
      { id: "a", text: "Change 'mesage' to 'message'", isCorrect: true },
      { id: "b", text: "Add semicolons", isCorrect: false },
      { id: "c", text: "Use let instead of const", isCorrect: false },
      { id: "d", text: "Add quotes around Hello World", isCorrect: false },
    ],
    explanation:
      "The variable is named 'message' but the console.log tries to use 'mesage' (missing 's'). Typos in variable names are one of the most common bugs.",
  },
  {
    id: "sd2",
    title: "Predict the Output",
    description: "What will this code log?",
    difficulty: "beginner",
    code: `let x = 5
x = x + 3
console.log(x)`,
    options: [
      { id: "a", text: "5", isCorrect: false },
      { id: "b", text: "8", isCorrect: true },
      { id: "c", text: "53", isCorrect: false },
      { id: "d", text: "Error", isCorrect: false },
    ],
    explanation: "x starts as 5, then we add 3 to it (5 + 3 = 8) and reassign. Variables can be updated.",
  },
  {
    id: "sd3",
    title: "Array Access",
    description: "What will this log?",
    difficulty: "beginner",
    code: `const fruits = ['apple', 'banana', 'cherry']
console.log(fruits[1])`,
    options: [
      { id: "a", text: "apple", isCorrect: false },
      { id: "b", text: "banana", isCorrect: true },
      { id: "c", text: "cherry", isCorrect: false },
      { id: "d", text: "undefined", isCorrect: false },
    ],
    explanation:
      "Arrays are zero-indexed. fruits[0] is 'apple', fruits[1] is 'banana', fruits[2] is 'cherry'. This trips up almost everyone at first.",
  },
  {
    id: "sd4",
    title: "Function Return",
    description: "What does this function return?",
    difficulty: "intermediate",
    code: `function double(num) {
  num * 2
}
console.log(double(5))`,
    options: [
      { id: "a", text: "10", isCorrect: false },
      { id: "b", text: "5", isCorrect: false },
      { id: "c", text: "undefined", isCorrect: true },
      { id: "d", text: "Error", isCorrect: false },
    ],
    explanation:
      "The function calculates num * 2 but doesn't return it. Without an explicit 'return' statement, functions return undefined. Add 'return num * 2' to fix it.",
  },
  {
    id: "sd5",
    title: "Object Property",
    description: "What's wrong with this code?",
    difficulty: "intermediate",
    code: `const user = {
  name: 'Alex',
  age: 25
}
console.log(user[name])`,
    options: [
      { id: "a", text: "Nothing, it works fine", isCorrect: false },
      { id: "b", text: "Should be user.name or user['name']", isCorrect: true },
      { id: "c", text: "Objects can't have string values", isCorrect: false },
      { id: "d", text: "Missing semicolon after 25", isCorrect: false },
    ],
    explanation:
      "user[name] tries to use a variable called 'name' as the key. To access the property, use user.name (dot notation) or user['name'] (bracket notation with quotes).",
  },
  {
    id: "sd6",
    title: "Async Understanding",
    description: "What order will these log?",
    difficulty: "advanced",
    code: `console.log('1')
setTimeout(() => console.log('2'), 0)
console.log('3')`,
    options: [
      { id: "a", text: "1, 2, 3", isCorrect: false },
      { id: "b", text: "1, 3, 2", isCorrect: true },
      { id: "c", text: "2, 1, 3", isCorrect: false },
      { id: "d", text: "3, 2, 1", isCorrect: false },
    ],
    explanation:
      "Even with 0ms delay, setTimeout is asynchronous. JavaScript executes all synchronous code first (1, 3), then processes the callback queue (2). This is the event loop.",
  },
]

export const thinkingGames: ThinkingGame[] = [
  {
    id: "tg1",
    title: "Database Design",
    scenario:
      "You're building a social media app. Users can post content and follow other users. You need to store who follows whom.",
    question: "Which approach would a senior developer likely choose?",
    options: [
      {
        id: "a",
        text: "Store a list of follower IDs as a comma-separated string in the user table",
        insight:
          "This is a common beginner mistake. Comma-separated strings are hard to query, update, and will cause performance issues at scale.",
      },
      {
        id: "b",
        text: "Create a separate 'follows' table with follower_id and following_id columns",
        insight:
          "Correct. A junction/relationship table is the standard pattern. It's queryable, scalable, and follows database normalization principles.",
      },
      {
        id: "c",
        text: "Store followers as a JSON array in the user document",
        insight:
          "While NoSQL databases support this, it has scaling limits and makes certain queries (like 'who follows this user?') inefficient.",
      },
    ],
    bestOptionId: "b",
  },
  {
    id: "tg2",
    title: "Code Review",
    scenario: `A junior developer wrote this to check if a user is an admin:

if (user.role == 'admin' || user.role == 'Admin' || user.role == 'ADMIN') {
  // allow access
}`,
    question: "What would you suggest in a code review?",
    options: [
      {
        id: "a",
        text: "It works, ship it",
        insight: "While it technically works, it's fragile. Any new casing ('aDmIn') breaks it, and it's repetitive.",
      },
      {
        id: "b",
        text: "Use user.role.toLowerCase() === 'admin'",
        insight: "Good thinking! Normalizing the string to lowercase handles all casing variations in one clean check.",
      },
      {
        id: "c",
        text: "Store roles as numbers instead of strings",
        insight:
          "This could work but changes the data model significantly. The simpler fix is normalizing the comparison.",
      },
    ],
    bestOptionId: "b",
  },
  {
    id: "tg3",
    title: "Performance Issue",
    scenario:
      "Your e-commerce site loads slowly. You notice the homepage makes 47 separate API calls to fetch product data.",
    question: "What would break first if traffic increased 10x?",
    options: [
      {
        id: "a",
        text: "The database would run out of storage",
        insight: "Storage isn't typically the bottleneck here—it's the number of connections and queries.",
      },
      {
        id: "b",
        text: "The API server would run out of memory from handling so many requests",
        insight:
          "Likely! Each request consumes resources. 47 calls × 10x users = 470x the API load. This is why batching and caching matter.",
      },
      {
        id: "c",
        text: "The user's browser would crash",
        insight:
          "Browsers can handle many requests, but users would experience severe slowdown. The server-side impact is more critical.",
      },
    ],
    bestOptionId: "b",
  },
  {
    id: "tg4",
    title: "Security Thinking",
    scenario:
      "You're building a login form. The designer wants to show 'Invalid username' when the username doesn't exist and 'Invalid password' when the password is wrong.",
    question: "What would a senior developer flag as a concern?",
    options: [
      {
        id: "a",
        text: "The messages are too vague and should include more detail",
        insight: "Actually, more detail would make it worse from a security perspective.",
      },
      {
        id: "b",
        text: "This reveals whether usernames exist in the system, enabling enumeration attacks",
        insight:
          "Exactly. Attackers can probe to find valid usernames, then focus password attacks on confirmed accounts. Use generic messages like 'Invalid credentials'.",
      },
      {
        id: "c",
        text: "The form should auto-fill the password for convenience",
        insight: "Never auto-fill passwords. This is a security anti-pattern.",
      },
    ],
    bestOptionId: "b",
  },
  {
    id: "tg5",
    title: "Architecture Decision",
    scenario:
      "Your startup is growing fast. The monolithic app handles everything: user auth, payments, emails, and the main product features. Deployments take 2 hours and one bug takes down everything.",
    question: "What architectural change would you prioritize first?",
    options: [
      {
        id: "a",
        text: "Rewrite everything in microservices immediately",
        insight:
          "This is tempting but risky. Full rewrites often fail. The 'strangler fig' pattern (gradual extraction) is safer.",
      },
      {
        id: "b",
        text: "Extract the most problematic component (likely payments) into its own service first",
        insight:
          "Smart. Start with the highest-risk or most independent component. This reduces blast radius without a full rewrite.",
      },
      {
        id: "c",
        text: "Add more servers to handle the load",
        insight:
          "This addresses symptoms, not the root cause. It won't fix deployment time or the single point of failure.",
      },
    ],
    bestOptionId: "b",
  },
]

export const dailyPrompts = [
  "What did you practice today that compounds over time?",
  "What did you struggle with today?",
  "What did you avoid, and why?",
  "What required discipline today?",
  "What did you do that your future self will thank you for?",
  "What friction did you push through today?",
  "What did you learn from today's effort?",
]

export const getTodayPrompt = (): string => {
  const dayOfYear = Math.floor(
    (Date.now() - new Date(new Date().getFullYear(), 0, 0).getTime()) / (1000 * 60 * 60 * 24),
  )
  return dailyPrompts[dayOfYear % dailyPrompts.length]
}

const getTodayString = () => new Date().toISOString().split("T")[0]

const daysBetween = (date1: string, date2: string): number => {
  const d1 = new Date(date1)
  const d2 = new Date(date2)
  const diffTime = Math.abs(d2.getTime() - d1.getTime())
  return Math.floor(diffTime / (1000 * 60 * 60 * 24))
}

const aliasPrefixes = [
  "Signal",
  "Rook",
  "North",
  "Quiet",
  "Cipher",
  "Vector",
  "Obsidian",
  "Drift",
  "Trace",
  "Echo",
]

const aliasSuffixes = ["Vigil", "Line", "Shade", "Weld", "Pulse", "Hollow", "Arc", "Ward", "Null", "Strand"]

const generateAlias = () => {
  const prefix = aliasPrefixes[Math.floor(Math.random() * aliasPrefixes.length)]
  const suffix = aliasSuffixes[Math.floor(Math.random() * aliasSuffixes.length)]
  const digits = Math.floor(100 + Math.random() * 900).toString()
  return `${prefix}${suffix}-${digits}`
}

const generateVerificationCode = () => Math.floor(100000 + Math.random() * 900000).toString()

export const useAppStore = create<AppState>()(
  persist(
    (set, get) => ({
      // Initial state
      userId: "",
      isOnboarded: false,
      userName: "",
      userEmail: "",
      publicAlias: "",
      profileImage: "",
      emailVerified: false,
      verificationCode: "",
      verificationSentAt: "",
      joinDate: "",
      focusArea: "",

      auraScore: 0,
      auraHistory: [],
      lastDecayCheck: "",

      ritualLogs: [],
      todayLogged: false,
      currentStreak: 0,
      longestStreak: 0,

      shadowDrops: defaultShadowDrops,
      shadowTracks: defaultShadowTracks,
      completedUnits: [],

      practiceSessions: [],

      vaultEntries: [],
      projectLogs: [],

      futureReflection: "",

      profileBackgroundColor: "primary",

      // FREEWILL MENTOR SYSTEM - Initial State
      userMode: "IDLE",
      activeIntent: null,
      intentHistory: [],
      activeFocusSession: null,
      focusHistory: [],
      reflections: [],
      focusArtifacts: [],

      // Actions
      completeOnboarding: (name, email, focusArea) => {
        const today = getTodayString()
        const alias = generateAlias()
        set({
          userId: `user-${Date.now()}`, // Placeholder, should be updated by auth listener
          isOnboarded: true,
          userName: name,
          userEmail: email,
          publicAlias: alias,
          profileImage: "",
          emailVerified: false,
          verificationCode: "",
          verificationSentAt: "",
          focusArea,
          joinDate: today,
          auraScore: 0,
          auraHistory: [],
          lastDecayCheck: "",
        })
      },

      updateProfile: (name, email, focusArea, publicAlias, profileImage) => {
        const state = get()
        const emailChanged = email.trim() !== state.userEmail
        set({
          userName: name,
          userEmail: email,
          focusArea,
          publicAlias: publicAlias ? publicAlias.toLowerCase() : state.publicAlias,
          profileImage: profileImage ?? state.profileImage,
          emailVerified: emailChanged ? false : state.emailVerified,
          verificationCode: emailChanged ? "" : state.verificationCode,
          verificationSentAt: emailChanged ? "" : state.verificationSentAt,
        })
      },

      setVerificationChallenge: (code) => {
        set({
          verificationCode: code,
          verificationSentAt: new Date().toISOString(),
        })
      },

      confirmVerificationCode: (code) => {
        const matches = code.trim() !== "" && code.trim() === get().verificationCode
        if (matches) {
          set({
            emailVerified: true,
            verificationCode: "",
            verificationSentAt: "",
            auraHistory:
              get().auraHistory.length === 0
                ? [{ date: getTodayString(), score: get().auraScore }]
                : get().auraHistory,
          })
        }
        return matches
      },

      clearVerificationChallenge: () => {
        set({
          verificationCode: "",
          verificationSentAt: "",
        })
      },

      markEmailVerified: () => {
        set({
          emailVerified: true,
          verificationCode: "",
          verificationSentAt: "",
          auraHistory:
            get().auraHistory.length === 0
              ? [{ date: getTodayString(), score: get().auraScore }]
              : get().auraHistory,
        })
      },

      // @deprecated LEGACY SYSTEM - Mutations disabled
      logRitual: () => {
        console.warn('[DEPRECATED] logRitual: Legacy system disabled. No new rituals can be logged.')
        return
      },

      // @deprecated LEGACY SYSTEM - Mutations disabled
      markShadowRead: () => {
        console.warn('[DEPRECATED] markShadowRead: Legacy system disabled.')
        return
      },

      // @deprecated LEGACY SYSTEM - Mutations disabled
      saveShadowReflection: () => {
        console.warn('[DEPRECATED] saveShadowReflection: Legacy system disabled.')
        return
      },

      saveFutureReflection: (reflection) => {
        set({ futureReflection: reflection })
      },

      calculateAuraStatus: () => {
        const score = get().auraScore
        if (score < 25) return "weak"
        if (score < 50) return "forming"
        if (score < 75) return "solid"
        return "strong"
      },

      getAuraTrend: () => {
        const history = get().auraHistory
        if (history.length < 2) return "stable"
        const recent = history[0]?.score ?? 0
        const previous = history[1]?.score ?? 0
        if (recent > previous) return "up"
        if (recent < previous) return "down"
        return "stable"
      },

      checkAndApplyDecay: () => {
        const state = get()
        const today = getTodayString()

        if (!state.emailVerified) {
          return { decayed: false, amount: 0 }
        }

        if (state.lastDecayCheck === today) {
          return { decayed: false, amount: 0 }
        }

        const loggedToday = state.ritualLogs.some((log) => log.date === today)
        if (loggedToday) {
          set({ lastDecayCheck: today })
          return { decayed: false, amount: 0 }
        }

        const lastLogDate = state.ritualLogs[0]?.date
        if (!lastLogDate) {
          set({ lastDecayCheck: today })
          return { decayed: false, amount: 0 }
        }

        const daysMissed = daysBetween(lastLogDate, today)
        if (daysMissed <= 1) {
          set({ lastDecayCheck: today })
          return { decayed: false, amount: 0 }
        }

        const decayAmount = Math.min(state.auraScore, (daysMissed - 1) * 5)
        const newScore = Math.max(0, state.auraScore - decayAmount)

        set({
          auraScore: newScore,
          auraHistory: [{ date: today, score: newScore }, ...state.auraHistory].slice(0, 14),
          lastDecayCheck: today,
          currentStreak: 0,
        })

        return { decayed: true, amount: decayAmount }
      },

      // @deprecated LEGACY SYSTEM - Mutations disabled (curriculum deleted)
      completeUnit: () => {
        console.warn('[DEPRECATED] completeUnit: Legacy system disabled.')
        return
      },

      // @deprecated LEGACY SYSTEM - Mutations disabled
      logPracticeSession: () => {
        console.warn('[DEPRECATED] logPracticeSession: Legacy system disabled.')
        return
      },

      addVaultEntry: (entry) => {
        // VAULT PURPOSE LOCK: Block standalone notes
        if (entry.type === "note") {
          console.warn('[BLOCKED] Standalone notes are not allowed. Vault stores evidence of work only.')
          return
        }

        const now = new Date().toISOString()
        const state = get()
        const today = getTodayString()
        const emailVerified = state.emailVerified

        const newEntry: VaultEntry = {
          ...entry,
          id: Date.now().toString(),
          userId: state.userId,
          createdAt: now,
          updatedAt: now,
          unverified: !emailVerified,
        }

        const newScore = emailVerified ? Math.min(100, state.auraScore + 2) : state.auraScore

        set({
          vaultEntries: [newEntry, ...state.vaultEntries],
          auraScore: newScore,
          auraHistory: [
            { date: today, score: emailVerified ? newScore : state.auraScore },
            ...state.auraHistory.filter((h) => h.date !== today),
          ].slice(
            0,
            14,
          ),
        })
      },

      updateVaultEntry: (id, updates) => {
        set((state) => ({
          vaultEntries: state.vaultEntries.map((entry) =>
            entry.id === id && entry.userId === state.userId
              ? { ...entry, ...updates, updatedAt: new Date().toISOString() }
              : entry,
          ),
        }))
      },

      deleteVaultEntry: (id) => {
        set((state) => ({
          vaultEntries: state.vaultEntries.filter((entry) =>
            entry.id === id ? entry.userId !== state.userId : true
          ),
        }))
      },

      addProjectLog: (log) => {
        const now = new Date().toISOString()
        const state = get()
        const today = getTodayString()
        const emailVerified = state.emailVerified

        const newLog: ProjectLog = {
          ...log,
          id: Date.now().toString(),
          userId: state.userId,
          createdAt: now,
          updatedAt: now,
          unverified: !emailVerified,
        }

        const newScore = emailVerified ? Math.min(100, state.auraScore + 3) : state.auraScore

        set({
          projectLogs: [newLog, ...state.projectLogs],
          auraScore: newScore,
          auraHistory: [
            { date: today, score: emailVerified ? newScore : state.auraScore },
            ...state.auraHistory.filter((h) => h.date !== today),
          ].slice(
            0,
            14,
          ),
        })
      },

      updateProjectLog: (id, updates) => {
        set((state) => ({
          projectLogs: state.projectLogs.map((log) =>
            log.id === id && log.userId === state.userId
              ? { ...log, ...updates, updatedAt: new Date().toISOString() }
              : log,
          ),
        }))
      },

      deleteProjectLog: (id) => {
        set((state) => ({
          projectLogs: state.projectLogs.filter((log) =>
            log.id === id ? log.userId !== state.userId : true
          ),
        }))
      },

      setProfileBackgroundColor: (color) => {
        set({ profileBackgroundColor: color })
      },

      // ============================================================================
      // FREEWILL MENTOR SYSTEM - Action Implementations
      // ============================================================================

      declareIntent: (declaration) => {
        const trimmed = declaration.trim()
        if (!trimmed) {
          console.warn('[BLOCKED] Cannot declare empty intent.')
          return
        }

        const state = get()

        // GUARD: Validate user is authenticated
        if (!state.userId) {
          console.warn('[BLOCKED] Cannot declare intent without authenticated user.')
          return
        }

        // GUARD: Check for existing intent from another user (data leak detection)
        if (state.activeIntent && state.activeIntent.userId !== state.userId) {
          console.warn('[DATA LEAK] Found intent from another user. Clearing.')
          set({ activeIntent: null })
          // Continue to allow creating new intent
        }

        let updatedIntentHistory = state.intentHistory

        // If there's an existing intent that was NEVER focused, auto-resolve as abandoned
        if (state.activeIntent && state.activeIntent.userId === state.userId && state.activeIntent.status === 'declared') {
          const resolvedIntent = {
            ...state.activeIntent,
            status: 'resolved' as const,
            resolvedAt: new Date().toISOString(),
          }
          updatedIntentHistory = [resolvedIntent, ...state.intentHistory]
        } else if (state.activeIntent && state.activeIntent.userId === state.userId) {
          // Intent was in focus or has other status - block new declaration
          console.warn('[BLOCKED] Complete current intent before declaring new one.')
          return
        }

        const newIntent: Intent = {
          id: Date.now().toString(),
          userId: state.userId,
          declaration: trimmed,
          status: 'declared',
          declaredAt: new Date().toISOString(),
        }

        set({
          activeIntent: newIntent,
          intentHistory: updatedIntentHistory,
          userMode: 'ACTIVE',
        })
      },

      beginFocus: () => {
        const state = get()

        // GUARD: Validate user is authenticated
        if (!state.userId) {
          console.warn('[BLOCKED] Cannot begin focus without authenticated user.')
          return false
        }

        if (!state.activeIntent) {
          console.warn('[BLOCKED] Cannot begin focus without an active intent.')
          return false
        }

        // GUARD: Check if intent belongs to current user
        if (state.activeIntent.userId !== state.userId) {
          console.warn('[DATA LEAK] Active intent does not belong to current user. Clearing.')
          set({ activeIntent: null })
          return false
        }

        if (state.activeFocusSession) {
          // GUARD: Check if session belongs to current user
          if (state.activeFocusSession.userId !== state.userId) {
            console.warn('[DATA LEAK] Active focus session does not belong to current user. Clearing.')
            set({ activeFocusSession: null })
          } else {
            console.warn('[BLOCKED] Focus session already active.')
            return false
          }
        }


        const focusSession: FocusSession = {
          id: Date.now().toString(),
          userId: state.userId,
          intentId: state.activeIntent.id,
          intentDeclaration: state.activeIntent.declaration,
          startedAt: new Date().toISOString(),
          status: 'active',
          outcome: null,
          reflectionSubmitted: false,
          reflectionDeferred: false,
          artifacts: [],
        }

        set({
          activeFocusSession: focusSession,
          activeIntent: { ...state.activeIntent, status: 'in_focus' },
          focusArtifacts: [],  // Clear any stale artifacts
        })

        return true
      },

      finishFocus: (proof) => {
        const state = get()

        if (!state.activeFocusSession) {
          console.warn('[BLOCKED] No active focus session to finish.')
          return false
        }

        // Require at least one artifact to finish
        if (state.focusArtifacts.length === 0) {
          console.warn('[BLOCKED] Cannot finish focus without at least one artifact.')
          return false
        }

        const trimmedProof = proof.trim()
        if (!trimmedProof) {
          console.warn('[BLOCKED] Cannot finish focus without proof.')
          return false
        }

        const now = new Date().toISOString()

        // Include artifacts in the completed session
        const completedSession: FocusSession = {
          ...state.activeFocusSession,
          endedAt: now,
          status: 'finished',
          outcome: 'finished',
          proof: trimmedProof,
          artifacts: [...state.focusArtifacts],
        }

        // Create VaultEntries from artifacts
        // Create VaultEntries from artifacts
        const newVaultEntries: VaultEntry[] = state.focusArtifacts.map((artifact) => ({
          id: `vault-${artifact.id}`,
          userId: state.userId,
          type: artifact.type === 'note' ? 'learning' : artifact.type,
          title: artifact.title,
          content: artifact.content,
          url: artifact.url,
          language: artifact.language,
          tags: artifact.language ? [...(artifact.language ? [artifact.language] : [])] : [],
          createdAt: artifact.createdAt,
          updatedAt: now,
          focusSessionId: state.activeFocusSession!.id,
          intentId: state.activeFocusSession!.intentId,
        }))

        set({
          activeFocusSession: completedSession,
          focusArtifacts: [],  // Clear artifacts after save
          vaultEntries: [...newVaultEntries, ...state.vaultEntries],
        })

        return true
      },

      abandonFocus: () => {
        const state = get()

        if (!state.activeFocusSession) {
          console.warn('[BLOCKED] No active focus session to abandon.')
          return
        }

        const now = new Date().toISOString()
        const abandonedSession: FocusSession = {
          ...state.activeFocusSession,
          endedAt: now,
          status: 'abandoned',
          outcome: 'abandoned',
          artifacts: [...state.focusArtifacts],  // Keep artifacts for reference
        }

        set({
          activeFocusSession: abandonedSession,
          focusArtifacts: [],  // Clear artifacts
        })
      },

      deferReflection: () => {
        const state = get()
        const session = state.activeFocusSession

        // Allow deferring if session exists and is NOT active (i.e. finished or abandoned)
        if (!session || session.status === 'active') {
          return
        }

        const deferredSession: FocusSession = {
          ...session,
          reflectionDeferred: true,
        }

        set({
          activeFocusSession: null,
          focusHistory: [deferredSession, ...state.focusHistory],
        })
      },

      submitReflection: (data) => {
        const state = get()
        const session = state.activeFocusSession

        if (!session) {
          console.warn('[BLOCKED] No active focus session to reflect on.')
          return
        }

        const reflection: Reflection = {
          id: Date.now().toString(),
          userId: state.userId,
          focusSessionId: session.id,
          intentDeclaration: session.intentDeclaration,
          outcome: session.outcome as 'finished' | 'abandoned',
          outcomeDescription: data.outcomeDescription.trim(),
          mistakePattern: data.mistakePattern.trim(),
          insight: data.insight.trim(),
          createdAt: new Date().toISOString(),
        }

        const completedSession: FocusSession = {
          ...session,
          reflectionSubmitted: true,
        }

        // Resolve the intent after reflection is submitted
        const resolvedIntent = state.activeIntent
          ? { ...state.activeIntent, status: 'resolved' as const, resolvedAt: new Date().toISOString() }
          : null

        set({
          activeFocusSession: null,
          focusHistory: [completedSession, ...state.focusHistory],
          reflections: [reflection, ...state.reflections],
          activeIntent: null,
          intentHistory: resolvedIntent
            ? [resolvedIntent, ...state.intentHistory]
            : state.intentHistory,
          userMode: 'IDLE',
        })
      },

      resolveIntent: () => {
        const state = get()

        if (!state.activeIntent) {
          console.warn('[BLOCKED] No active intent to resolve.')
          return
        }

        if (state.activeIntent.status !== 'declared') {
          console.warn('[BLOCKED] Can only resolve intents in declared status.')
          return
        }

        const resolvedIntent = {
          ...state.activeIntent,
          status: 'resolved' as const,
          resolvedAt: new Date().toISOString(),
        }

        set({
          activeIntent: null,
          intentHistory: [resolvedIntent, ...state.intentHistory],
          userMode: 'IDLE',
        })
      },

      clearSessionOnLogout: () => {
        set({
          activeFocusSession: null,
          activeIntent: null,
          userMode: 'IDLE',
          focusArtifacts: [],
        })
      },

      resetUserScopedState: () => {
        // MANDATORY: Clear ALL user-scoped state to prevent cross-user bleed
        // On auth boundary, we MUST clear everything including historical data
        // because the persisted storage is shared across all users
        set({
          // Clear active session state
          activeIntent: null,
          activeFocusSession: null,
          focusArtifacts: [],
          userMode: 'IDLE',

          // Clear user profile (will be repopulated by auth)
          userId: '',
          isOnboarded: false,
          userName: '',
          userEmail: '',
          publicAlias: '',
          profileImage: '',
          emailVerified: false,
          verificationCode: '',
          verificationSentAt: '',
          joinDate: '',
          focusArea: '',

          // Clear user metrics (will be recalculated)
          auraScore: 0,
          auraHistory: [],
          lastDecayCheck: '',
          currentStreak: 0,
          longestStreak: 0,

          // CRITICAL: Clear ALL historical data on auth boundary
          // Since storage is shared, we must clear to prevent leakage
          intentHistory: [],
          focusHistory: [],
          reflections: [],
          vaultEntries: [],
          projectLogs: [],

          // Reset legacy data
          ritualLogs: [],
          todayLogged: false,
          practiceSessions: [],
          futureReflection: '',
        })
      },

      setUserId: (newUserId: string) => {
        const state = get()

        // If userId is the same, no action needed
        if (state.userId === newUserId) {
          return
        }

        // If there was a previous user, reset all state first
        if (state.userId && state.userId !== newUserId) {
          console.log('[AUTH] User changed, resetting state.')
          get().resetUserScopedState()
        }

        // Set the new userId
        set({ userId: newUserId })
      },

      // ============================================================================
      // FOCUS ARTIFACT ACTION IMPLEMENTATIONS
      // ============================================================================

      addFocusArtifact: (artifact) => {
        const state = get()

        if (!state.activeFocusSession) {
          console.warn('[BLOCKED] Cannot add artifact without active focus session.')
          return
        }

        const now = new Date().toISOString()
        const newArtifact: FocusArtifact = {
          id: Date.now().toString(),
          userId: state.userId,
          focusSessionId: state.activeFocusSession.id,
          type: artifact.type,
          title: artifact.title,
          content: artifact.content,
          language: artifact.language,
          previewSupported: artifact.previewSupported,
          url: artifact.url,
          createdAt: now,
          updatedAt: now,
        }

        set({
          focusArtifacts: [...state.focusArtifacts, newArtifact],
        })
      },

      updateFocusArtifact: (id, updates) => {
        const state = get()

        if (!state.activeFocusSession) {
          console.warn('[BLOCKED] Cannot update artifact without active focus session.')
          return
        }

        set({
          focusArtifacts: state.focusArtifacts.map((artifact) =>
            artifact.id === id && artifact.userId === state.userId
              ? { ...artifact, ...updates, updatedAt: new Date().toISOString() }
              : artifact
          ),
        })
      },

      deleteFocusArtifact: (id) => {
        const state = get()

        if (!state.activeFocusSession) {
          console.warn('[BLOCKED] Cannot delete artifact without active focus session.')
          return
        }

        set({
          focusArtifacts: state.focusArtifacts.filter((artifact) =>
            artifact.id === id ? artifact.userId !== state.userId : true
          ),
        })
      },

      resetState: () => {
        // PRESERVE historical data: intentHistory, focusHistory, reflections, vaultEntries, projectLogs
        // Only reset active session state and user profile
        set({
          isOnboarded: false,
          userName: "",
          userEmail: "",
          publicAlias: "",
          profileImage: "",
          emailVerified: false,
          verificationCode: "",
          verificationSentAt: "",
          joinDate: "",
          focusArea: "",
          auraScore: 0,
          auraHistory: [],
          lastDecayCheck: "",
          ritualLogs: [],
          todayLogged: false,
          currentStreak: 0,
          longestStreak: 0,
          shadowDrops: defaultShadowDrops,
          shadowTracks: defaultShadowTracks,
          completedUnits: [],
          practiceSessions: [],
          // vaultEntries: PRESERVED
          // projectLogs: PRESERVED
          futureReflection: "",
          // FREEWILL MENTOR SYSTEM - only reset active state
          userMode: "IDLE",
          activeIntent: null,
          // intentHistory: PRESERVED
          activeFocusSession: null,
          // focusHistory: PRESERVED
          // reflections: PRESERVED
          focusArtifacts: [],
        })
      },
    }),
    {
      name: "unseen-storage",
      partialize: (state) => {
        const {
          activeFocusSession,
          focusArtifacts,
          ...rest
        } = state
        return rest
      },
    },
  ),
)

// Selectors
export const useTodayLogged = () => {
  const ritualLogs = useAppStore((state) => state.ritualLogs)
  const today = getTodayString()
  return ritualLogs.some((log) => log.date === today)
}

export const useTodayRitual = () => {
  const ritualLogs = useAppStore((state) => state.ritualLogs)
  const today = getTodayString()
  return ritualLogs.find((log) => log.date === today)
}

export const useAuraAtRisk = () => {
  const todayLogged = useTodayLogged()
  const auraScore = useAppStore((state) => state.auraScore)
  const emailVerified = useAppStore((state) => state.emailVerified)
  if (!emailVerified) return false
  return !todayLogged && auraScore > 0
}

export const useHoursUntilDecay = () => {
  const now = new Date()
  const midnight = new Date()
  midnight.setHours(24, 0, 0, 0)
  const diffMs = midnight.getTime() - now.getTime()
  return Math.floor(diffMs / (1000 * 60 * 60))
}

export const useDaysMissed = () => {
  const ritualLogs = useAppStore((state) => state.ritualLogs)
  if (ritualLogs.length === 0) return 0
  const lastLogDate = ritualLogs[0]?.date
  if (!lastLogDate) return 0
  const today = getTodayString()
  return daysBetween(lastLogDate, today)
}

export const useWeeklyReflection = () => {
  const ritualLogs = useAppStore((state) => state.ritualLogs)
  const practiceSessions = useAppStore((state) => state.practiceSessions)

  const last7Logs = ritualLogs.filter((log) => {
    const logDate = new Date(log.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return logDate >= weekAgo
  })

  const last7Sessions = practiceSessions.filter((s) => {
    const sDate = new Date(s.date)
    const weekAgo = new Date()
    weekAgo.setDate(weekAgo.getDate() - 7)
    return sDate >= weekAgo
  })

  const deepCount = last7Logs.filter((l) => l.depth === "deep").length
  const proofCount = last7Logs.filter((l) => l.hasProof).length

  if (last7Logs.length === 0 && last7Sessions.length === 0) {
    return "What prevented you from showing up this week? What needs to change?"
  }
  if (last7Logs.length >= 6 && last7Sessions.length >= 3) {
    return "Your consistency across rituals and practice is building. What would it look like to maintain this for a month?"
  }
  if (last7Logs.length >= 6) {
    return "Strong ritual consistency. Consider adding practice sessions to accelerate skill-building."
  }
  if (deepCount === 0 && last7Logs.length > 0) {
    return "You've been consistent, but not deep. What would it take to increase intensity?"
  }
  if (proofCount === 0 && last7Logs.length > 2) {
    return "Consider adding proof to your rituals. Accountability strengthens commitment."
  }
  if (last7Sessions.length >= 5 && last7Logs.length < 3) {
    return "Good practice frequency, but your daily rituals are falling behind. Balance both."
  }
  return "Are your daily actions aligned with who you want to become?"
}

export const usePracticeStats = () => {
  const practiceSessions = useAppStore((state) => state.practiceSessions)

  const weekAgo = new Date()
  weekAgo.setDate(weekAgo.getDate() - 7)

  const thisWeek = practiceSessions.filter((s) => new Date(s.date) >= weekAgo).length
  const correctCount = practiceSessions.filter((s) => s.correct).length
  const accuracy = practiceSessions.length > 0 ? Math.round((correctCount / practiceSessions.length) * 100) : 0

  return {
    total: practiceSessions.length,
    thisWeek,
    accuracy,
  }
}

export const useLearningProgress = () => {
  const completedUnits = useAppStore((state) => state.completedUnits)
  const shadowTracks = useAppStore((state) => state.shadowTracks)

  const totalUnits = shadowTracks.reduce((acc, track) => acc + track.units.length, 0)

  return {
    completed: completedUnits.length,
    total: totalUnits,
    percentage: totalUnits > 0 ? Math.round((completedUnits.length / totalUnits) * 100) : 0,
  }
}

// ============================================================================
// USER-SCOPED SELECTORS - Prevent cross-user data bleed
// ============================================================================

import { useShallow } from 'zustand/react/shallow'

/**
 * Get user's active intent with invariant guard
 */
export const useUserActiveIntent = () => {
  return useAppStore((state) => {
    if (!state.userId) return null
    if (!state.activeIntent) return null

    // Invariant guard: Ensure intent belongs to current user
    if (state.activeIntent.userId !== state.userId) {
      return null
    }

    return state.activeIntent
  })
}

/**
 * Get user's intent history with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserIntentHistory = () => {
  const userId = useAppStore((state) => state.userId)
  const intentHistory = useAppStore(useShallow((state) => state.intentHistory))

  if (!userId) return []

  // Filter client-side: Only return intents belonging to current user
  return intentHistory.filter(intent => intent.userId === userId)
}

/**
 * Get user's active focus session with invariant guard
 */
export const useUserActiveFocusSession = () => {
  return useAppStore((state) => {
    if (!state.userId) return null
    if (!state.activeFocusSession) return null

    // Invariant guard: Ensure session belongs to current user
    if (state.activeFocusSession.userId !== state.userId) {
      return null
    }

    return state.activeFocusSession
  })
}

/**
 * Get user's focus history with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserFocusHistory = () => {
  const userId = useAppStore((state) => state.userId)
  const focusHistory = useAppStore(useShallow((state) => state.focusHistory))

  if (!userId) return []

  // Filter client-side: Only return sessions belonging to current user
  return focusHistory.filter(session => session.userId === userId)
}

/**
 * Get user's completed focus sessions count (only with reflections)
 */
export const useUserCompletedFocusSessions = () => {
  const userId = useAppStore((state) => state.userId)
  const focusHistory = useAppStore(useShallow((state) => state.focusHistory))

  if (!userId) return 0

  // Count only completed sessions with reflections belonging to current user
  return focusHistory.filter(session =>
    session.userId === userId &&
    session.status === 'finished' &&
    session.reflectionSubmitted
  ).length
}

/**
 * Get user's reflections with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserReflections = () => {
  const userId = useAppStore((state) => state.userId)
  const reflections = useAppStore(useShallow((state) => state.reflections))

  if (!userId) return []

  // Filter client-side: Only return reflections belonging to current user
  return reflections.filter(reflection => reflection.userId === userId)
}

/**
 * Get user's vault entries with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserVaultEntries = () => {
  const userId = useAppStore((state) => state.userId)
  const vaultEntries = useAppStore(useShallow((state) => state.vaultEntries))

  if (!userId) return []

  // Filter client-side: Only return vault entries belonging to current user
  return vaultEntries.filter(entry => entry.userId === userId)
}

/**
 * Get user's project logs with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserProjectLogs = () => {
  const userId = useAppStore((state) => state.userId)
  const projectLogs = useAppStore(useShallow((state) => state.projectLogs))

  if (!userId) return []

  // Filter client-side: Only return project logs belonging to current user
  return projectLogs.filter(log => log.userId === userId)
}

/**
 * Get user's focus artifacts with invariant guard
 * Uses useShallow to prevent infinite re-renders from array reference changes
 */
export const useUserFocusArtifacts = () => {
  const userId = useAppStore((state) => state.userId)
  const focusArtifacts = useAppStore(useShallow((state) => state.focusArtifacts))

  if (!userId) return []

  // Filter client-side: Only return artifacts belonging to current user
  return focusArtifacts.filter(artifact => artifact.userId === userId)
}

// Habit tracking selectors


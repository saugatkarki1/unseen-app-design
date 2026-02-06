/**
 * Comprehensive Learning Curriculum Data
 * 6 Phases: Environment → Core React → UI Components → Full Apps → Portfolio → Gamification
 */

export type DifficultyLevel = "beginner" | "intermediate" | "advanced";
export type CapsuleStatus = "locked" | "available" | "in_progress" | "completed";
export type ProjectStatus = "locked" | "available" | "in_progress" | "completed" | "portfolio";

export interface Challenge {
    id: string;
    title: string;
    description: string;
    hint?: string;
    expectedOutput?: string;
}

export interface Exercise {
    id: string;
    title: string;
    type: "code" | "quiz" | "task";
    instructions: string;
    starterCode?: string;
    solution?: string;
    points: number;
}

export interface SkillCapsule {
    id: string;
    phaseId: string;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    estimatedMinutes: number;
    points: number;
    badgeId?: string;
    prerequisites: string[];
    steps: {
        id: string;
        title: string;
        content: string;
        codeExample?: string;
    }[];
    challenges: Challenge[];
    exercises: Exercise[];
    order: number;
}

export interface Project {
    id: string;
    phaseId: string;
    title: string;
    description: string;
    difficulty: DifficultyLevel;
    estimatedHours: number;
    points: number;
    badgeId?: string;
    prerequisites: string[];
    technologies: string[];
    tasks: {
        id: string;
        title: string;
        description: string;
        completed?: boolean;
    }[];
    expectedOutcome: string;
    githubTemplate?: string;
    order: number;
}

export interface Phase {
    id: string;
    number: number;
    title: string;
    subtitle: string;
    description: string;
    color: string;
    icon: string;
    capsules: SkillCapsule[];
    projects: Project[];
}

// ============================================================================
// PHASE 1: ENVIRONMENT & BASICS
// ============================================================================
const phase1Capsules: SkillCapsule[] = [
    {
        id: "vscode-setup",
        phaseId: "phase-1",
        title: "VS Code Setup & Terminal Basics",
        description: "Set up your development environment with VS Code and learn essential terminal commands.",
        difficulty: "beginner",
        estimatedMinutes: 30,
        points: 50,
        prerequisites: [],
        order: 1,
        steps: [
            {
                id: "step-1",
                title: "Download VS Code",
                content: "Visit code.visualstudio.com and download VS Code for your operating system. Install it following the wizard.",
            },
            {
                id: "step-2",
                title: "Essential Extensions",
                content: "Install these extensions: ES7+ React snippets, Tailwind CSS IntelliSense, Prettier, ESLint, Auto Rename Tag.",
            },
            {
                id: "step-3",
                title: "Terminal Basics",
                content: "Open the integrated terminal with Ctrl+` (backtick). Learn these commands:",
                codeExample: `# Navigation
cd folder-name    # Change directory
cd ..             # Go up one level
ls                # List files (Mac/Linux)
dir               # List files (Windows)

# File operations
mkdir my-project  # Create folder
touch file.js     # Create file (Mac/Linux)
rm file.js        # Delete file`,
            },
            {
                id: "step-4",
                title: "Configure Settings",
                content: "Open Settings (Cmd+, or Ctrl+,). Enable: Format on Save, Auto Save, Tab Size: 2.",
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Create Your First Project Folder",
                description: "Using only terminal commands, create a folder called 'learning-react' and navigate into it.",
                hint: "Use mkdir and cd commands",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Terminal Navigation Quiz",
                type: "quiz",
                instructions: "What command lists all files in the current directory on Mac/Linux?",
                solution: "ls",
                points: 10,
            },
        ],
    },
    {
        id: "nodejs-npm-git",
        phaseId: "phase-1",
        title: "Node.js, npm & Git Installation",
        description: "Install Node.js, npm package manager, and Git for version control.",
        difficulty: "beginner",
        estimatedMinutes: 45,
        points: 75,
        prerequisites: ["vscode-setup"],
        order: 2,
        steps: [
            {
                id: "step-1",
                title: "Install Node.js",
                content: "Visit nodejs.org and download the LTS version. This includes npm automatically.",
            },
            {
                id: "step-2",
                title: "Verify Installation",
                content: "Open terminal and verify:",
                codeExample: `node --version  # Should show v18+ or v20+
npm --version   # Should show 9+ or 10+`,
            },
            {
                id: "step-3",
                title: "Install Git",
                content: "Download from git-scm.com. Configure your identity:",
                codeExample: `git config --global user.name "Your Name"
git config --global user.email "your@email.com"`,
            },
            {
                id: "step-4",
                title: "Create GitHub Account",
                content: "Sign up at github.com. This will be your portfolio and collaboration hub.",
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Initialize a Git Repository",
                description: "In your learning-react folder, initialize a Git repository and make your first commit.",
                hint: "Use git init, git add, git commit",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "First Commit",
                type: "task",
                instructions: "Create a README.md file, add it to git, and commit with message 'Initial commit'",
                points: 20,
            },
        ],
    },
    {
        id: "react-project-creation",
        phaseId: "phase-1",
        title: "Create Your First React Project",
        description: "Use Vite to create a blazing-fast React + TypeScript project.",
        difficulty: "beginner",
        estimatedMinutes: 30,
        points: 100,
        badgeId: "react-starter",
        prerequisites: ["nodejs-npm-git"],
        order: 3,
        steps: [
            {
                id: "step-1",
                title: "Create with Vite",
                content: "Vite is the modern way to create React projects. Run:",
                codeExample: `npm create vite@latest my-first-app -- --template react-ts
cd my-first-app
npm install
npm run dev`,
            },
            {
                id: "step-2",
                title: "Explore the Structure",
                content: "Understand the project structure: src/, public/, package.json, vite.config.ts",
            },
            {
                id: "step-3",
                title: "Modify App.tsx",
                content: "Open src/App.tsx and change the content to display your name.",
                codeExample: `function App() {
  return (
    <div>
      <h1>Hello, I'm [Your Name]!</h1>
      <p>This is my first React app.</p>
    </div>
  )
}
export default App`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Add Your Photo",
                description: "Add an image to the public folder and display it in your app.",
                hint: "Use <img src='/your-image.jpg' /> ",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Deploy to Netlify",
                type: "task",
                instructions: "Run npm run build and drag the dist folder to Netlify Drop",
                points: 30,
            },
        ],
    },
    {
        id: "tailwind-setup",
        phaseId: "phase-1",
        title: "Tailwind CSS Setup",
        description: "Add Tailwind CSS for utility-first styling that scales.",
        difficulty: "beginner",
        estimatedMinutes: 25,
        points: 75,
        prerequisites: ["react-project-creation"],
        order: 4,
        steps: [
            {
                id: "step-1",
                title: "Install Tailwind",
                content: "In your Vite project, run:",
                codeExample: `npm install -D tailwindcss postcss autoprefixer
npx tailwindcss init -p`,
            },
            {
                id: "step-2",
                title: "Configure tailwind.config.js",
                content: "Update the content array:",
                codeExample: `export default {
  content: [
    "./index.html",
    "./src/**/*.{js,ts,jsx,tsx}",
  ],
  theme: { extend: {} },
  plugins: [],
}`,
            },
            {
                id: "step-3",
                title: "Add Tailwind Directives",
                content: "In src/index.css, add at the top:",
                codeExample: `@tailwind base;
@tailwind components;
@tailwind utilities;`,
            },
            {
                id: "step-4",
                title: "Test It",
                content: "Update App.tsx with Tailwind classes:",
                codeExample: `<h1 className="text-4xl font-bold text-blue-600">
  Hello Tailwind!
</h1>`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Create a Gradient Card",
                description: "Create a card with rounded corners, shadow, and gradient background using only Tailwind classes.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Responsive Design",
                type: "code",
                instructions: "Make your card responsive: full width on mobile, half width on desktop",
                starterCode: `<div className="...">Card Content</div>`,
                solution: `<div className="w-full md:w-1/2 p-4 rounded-lg shadow-lg bg-gradient-to-r from-blue-500 to-purple-500">Card Content</div>`,
                points: 25,
            },
        ],
    },
    {
        id: "shadcn-setup",
        phaseId: "phase-1",
        title: "shadcn/ui Setup",
        description: "Set up shadcn/ui for beautiful, accessible, customizable components.",
        difficulty: "beginner",
        estimatedMinutes: 30,
        points: 100,
        badgeId: "ui-foundations",
        prerequisites: ["tailwind-setup"],
        order: 5,
        steps: [
            {
                id: "step-1",
                title: "Initialize shadcn",
                content: "Run the shadcn CLI:",
                codeExample: `npx shadcn@latest init`,
            },
            {
                id: "step-2",
                title: "Configure Options",
                content: "Choose: TypeScript: Yes, Style: New York, Base color: Neutral, CSS Variables: Yes",
            },
            {
                id: "step-3",
                title: "Add Your First Component",
                content: "Add the Button component:",
                codeExample: `npx shadcn@latest add button`,
            },
            {
                id: "step-4",
                title: "Use the Component",
                content: "Import and use in App.tsx:",
                codeExample: `import { Button } from "@/components/ui/button"

function App() {
  return (
    <div className="p-8">
      <Button>Click Me</Button>
      <Button variant="outline">Outline</Button>
      <Button variant="destructive">Delete</Button>
    </div>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Add More Components",
                description: "Add Card, Input, and Label components using the shadcn CLI.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Build a Login Form UI",
                type: "task",
                instructions: "Using shadcn components (Card, Input, Label, Button), create a basic login form layout.",
                points: 40,
            },
        ],
    },
];

// ============================================================================
// PHASE 2: CORE REACT SKILLS
// ============================================================================
const phase2Capsules: SkillCapsule[] = [
    {
        id: "components-props",
        phaseId: "phase-2",
        title: "Components & Props",
        description: "Learn to create reusable components and pass data with props.",
        difficulty: "beginner",
        estimatedMinutes: 45,
        points: 100,
        prerequisites: ["shadcn-setup"],
        order: 1,
        steps: [
            {
                id: "step-1",
                title: "What is a Component?",
                content: "A component is a reusable piece of UI. It's a function that returns JSX.",
            },
            {
                id: "step-2",
                title: "Create a Component",
                content: "Create src/components/UserCard.tsx:",
                codeExample: `interface UserCardProps {
  name: string;
  role: string;
  avatar?: string;
}

export function UserCard({ name, role, avatar }: UserCardProps) {
  return (
    <div className="p-4 rounded-lg border bg-white shadow-sm">
      {avatar && <img src={avatar} alt={name} className="w-16 h-16 rounded-full" />}
      <h3 className="text-lg font-semibold">{name}</h3>
      <p className="text-sm text-gray-500">{role}</p>
    </div>
  )
}`,
            },
            {
                id: "step-3",
                title: "Use the Component",
                content: "Import and use with different props:",
                codeExample: `import { UserCard } from "./components/UserCard"

function App() {
  return (
    <div className="grid grid-cols-3 gap-4 p-8">
      <UserCard name="Alice" role="Developer" />
      <UserCard name="Bob" role="Designer" />
      <UserCard name="Charlie" role="Manager" />
    </div>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Add a children prop",
                description: "Modify UserCard to accept children and render them below the role.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Create a BlogPostCard",
                type: "code",
                instructions: "Create a BlogPostCard component with title, excerpt, author, and date props.",
                points: 30,
            },
        ],
    },
    {
        id: "state-usestate",
        phaseId: "phase-2",
        title: "State with useState",
        description: "Make your components interactive with React state.",
        difficulty: "beginner",
        estimatedMinutes: 45,
        points: 100,
        prerequisites: ["components-props"],
        order: 2,
        steps: [
            {
                id: "step-1",
                title: "What is State?",
                content: "State is data that changes over time. When state changes, React re-renders the component.",
            },
            {
                id: "step-2",
                title: "Counter Example",
                content: "The classic counter example:",
                codeExample: `import { useState } from 'react'

function Counter() {
  const [count, setCount] = useState(0)
  
  return (
    <div className="flex items-center gap-4">
      <button onClick={() => setCount(count - 1)}>-</button>
      <span className="text-2xl font-bold">{count}</span>
      <button onClick={() => setCount(count + 1)}>+</button>
    </div>
  )
}`,
            },
            {
                id: "step-3",
                title: "Form Input State",
                content: "Controlled inputs with state:",
                codeExample: `function SearchBox() {
  const [query, setQuery] = useState('')
  
  return (
    <div>
      <input 
        value={query}
        onChange={(e) => setQuery(e.target.value)}
        placeholder="Search..."
        className="border rounded px-3 py-2"
      />
      <p>You're searching for: {query}</p>
    </div>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Build a Like Button",
                description: "Create a button that shows the like count and increments when clicked. Show a heart icon that fills when liked.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Todo Input",
                type: "code",
                instructions: "Create an input that adds items to a list when Enter is pressed",
                points: 40,
            },
        ],
    },
    {
        id: "conditional-rendering",
        phaseId: "phase-2",
        title: "Conditional Rendering",
        description: "Show different UI based on conditions and state.",
        difficulty: "beginner",
        estimatedMinutes: 30,
        points: 75,
        prerequisites: ["state-usestate"],
        order: 3,
        steps: [
            {
                id: "step-1",
                title: "Ternary Operator",
                content: "Show different content based on a condition:",
                codeExample: `function Greeting({ isLoggedIn }: { isLoggedIn: boolean }) {
  return (
    <div>
      {isLoggedIn ? (
        <p>Welcome back!</p>
      ) : (
        <p>Please sign in.</p>
      )}
    </div>
  )
}`,
            },
            {
                id: "step-2",
                title: "Logical AND (&&)",
                content: "Show content only if condition is true:",
                codeExample: `function Notifications({ count }: { count: number }) {
  return (
    <div>
      {count > 0 && (
        <span className="bg-red-500 text-white px-2 rounded-full">
          {count}
        </span>
      )}
    </div>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Loading State",
                description: "Create a component that shows a loading spinner while data is loading, then shows the content.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Toggle Visibility",
                type: "code",
                instructions: "Create a 'Show More' button that reveals hidden content when clicked",
                points: 25,
            },
        ],
    },
    {
        id: "dark-mode-context",
        phaseId: "phase-2",
        title: "Dark Mode with Context",
        description: "Learn React Context by building a dark mode toggle.",
        difficulty: "intermediate",
        estimatedMinutes: 60,
        points: 150,
        badgeId: "context-master",
        prerequisites: ["conditional-rendering"],
        order: 4,
        steps: [
            {
                id: "step-1",
                title: "Create Theme Context",
                content: "Create src/context/ThemeContext.tsx:",
                codeExample: `import { createContext, useContext, useState, ReactNode } from 'react'

type Theme = 'light' | 'dark'

interface ThemeContextType {
  theme: Theme
  toggleTheme: () => void
}

const ThemeContext = createContext<ThemeContextType | undefined>(undefined)

export function ThemeProvider({ children }: { children: ReactNode }) {
  const [theme, setTheme] = useState<Theme>('light')
  
  const toggleTheme = () => {
    setTheme(prev => prev === 'light' ? 'dark' : 'light')
  }
  
  return (
    <ThemeContext.Provider value={{ theme, toggleTheme }}>
      <div className={theme}>
        {children}
      </div>
    </ThemeContext.Provider>
  )
}

export function useTheme() {
  const context = useContext(ThemeContext)
  if (!context) throw new Error('useTheme must be used within ThemeProvider')
  return context
}`,
            },
            {
                id: "step-2",
                title: "Create Toggle Button",
                content: "Create a toggle component:",
                codeExample: `import { useTheme } from './context/ThemeContext'
import { Sun, Moon } from 'lucide-react'

function ThemeToggle() {
  const { theme, toggleTheme } = useTheme()
  
  return (
    <button onClick={toggleTheme} className="p-2 rounded-full">
      {theme === 'light' ? <Moon /> : <Sun />}
    </button>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Persist Theme",
                description: "Save the theme preference to localStorage so it persists on page refresh.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "System Preference",
                type: "task",
                instructions: "Detect the system's dark mode preference and use it as the default theme",
                points: 50,
            },
        ],
    },
    {
        id: "useeffect-data",
        phaseId: "phase-2",
        title: "Fetch Data with useEffect",
        description: "Load and display data from APIs using useEffect.",
        difficulty: "intermediate",
        estimatedMinutes: 60,
        points: 150,
        badgeId: "data-fetcher",
        prerequisites: ["conditional-rendering"],
        order: 5,
        steps: [
            {
                id: "step-1",
                title: "useEffect Basics",
                content: "useEffect runs side effects like data fetching:",
                codeExample: `import { useState, useEffect } from 'react'

interface User {
  id: number
  name: string
  email: string
}

function UserList() {
  const [users, setUsers] = useState<User[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  
  useEffect(() => {
    async function fetchUsers() {
      try {
        const res = await fetch('https://jsonplaceholder.typicode.com/users')
        const data = await res.json()
        setUsers(data)
      } catch (err) {
        setError('Failed to fetch users')
      } finally {
        setLoading(false)
      }
    }
    
    fetchUsers()
  }, []) // Empty array = run once on mount
  
  if (loading) return <p>Loading...</p>
  if (error) return <p className="text-red-500">{error}</p>
  
  return (
    <ul>
      {users.map(user => (
        <li key={user.id}>{user.name}</li>
      ))}
    </ul>
  )
}`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Add Search Filter",
                description: "Add a search input that filters the users list as you type.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Fetch Posts",
                type: "task",
                instructions: "Fetch posts from JSONPlaceholder and display them in cards",
                points: 50,
            },
        ],
    },
    {
        id: "framer-motion-basics",
        phaseId: "phase-2",
        title: "Animations with Framer Motion",
        description: "Add smooth, professional animations to your React components.",
        difficulty: "intermediate",
        estimatedMinutes: 45,
        points: 125,
        badgeId: "motion-animator",
        prerequisites: ["state-usestate"],
        order: 6,
        steps: [
            {
                id: "step-1",
                title: "Install Framer Motion",
                content: "Add Framer Motion to your project:",
                codeExample: `npm install framer-motion`,
            },
            {
                id: "step-2",
                title: "Basic Animation",
                content: "Animate on mount:",
                codeExample: `import { motion } from 'framer-motion'

function AnimatedCard() {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
      className="p-6 bg-white rounded-lg shadow-lg"
    >
      <h2>I fade in!</h2>
    </motion.div>
  )
}`,
            },
            {
                id: "step-3",
                title: "Hover & Tap Effects",
                content: "Interactive animations:",
                codeExample: `<motion.button
  whileHover={{ scale: 1.05 }}
  whileTap={{ scale: 0.95 }}
  className="px-4 py-2 bg-blue-500 text-white rounded"
>
  Click me
</motion.button>`,
            },
        ],
        challenges: [
            {
                id: "challenge-1",
                title: "Staggered List",
                description: "Create a list where items animate in one after another with a stagger effect.",
            },
        ],
        exercises: [
            {
                id: "exercise-1",
                title: "Page Transitions",
                type: "task",
                instructions: "Create enter/exit animations for route changes",
                points: 60,
            },
        ],
    },
];

// ============================================================================
// PHASE 3: REAL PROJECTS - UI COMPONENTS
// ============================================================================
const phase3Projects: Project[] = [
    {
        id: "auth-form",
        phaseId: "phase-3",
        title: "Animated Auth Form",
        description: "Build a beautiful login/signup form with animated toggle between states.",
        difficulty: "intermediate",
        estimatedHours: 4,
        points: 300,
        badgeId: "auth-builder",
        prerequisites: ["framer-motion-basics", "state-usestate"],
        technologies: ["React", "TypeScript", "Tailwind", "Framer Motion"],
        order: 1,
        tasks: [
            { id: "task-1", title: "Create AuthSwitch component with sliding animation", description: "" },
            { id: "task-2", title: "Build SignIn form with validation", description: "" },
            { id: "task-3", title: "Build SignUp form with validation", description: "" },
            { id: "task-4", title: "Add animated half-circle background that shifts on toggle", description: "" },
            { id: "task-5", title: "Make fully responsive", description: "" },
        ],
        expectedOutcome: "A professional auth form with smooth animations between sign in and sign up states.",
    },
    {
        id: "sidebar-nav",
        phaseId: "phase-3",
        title: "Collapsible Sidebar",
        description: "Create a responsive sidebar that expands on hover and works on mobile.",
        difficulty: "intermediate",
        estimatedHours: 3,
        points: 250,
        prerequisites: ["components-props", "conditional-rendering"],
        technologies: ["React", "TypeScript", "Tailwind", "Framer Motion"],
        order: 2,
        tasks: [
            { id: "task-1", title: "Create sidebar layout with navigation items", description: "" },
            { id: "task-2", title: "Add hover expand behavior for desktop", description: "" },
            { id: "task-3", title: "Create mobile drawer version", description: "" },
            { id: "task-4", title: "Add active state indicators", description: "" },
        ],
        expectedOutcome: "A sidebar that's collapsed by default, expands on hover (desktop) or with hamburger menu (mobile).",
    },
    {
        id: "card-grid",
        phaseId: "phase-3",
        title: "Dynamic Card Grid",
        description: "Build a responsive card grid that fetches and displays data.",
        difficulty: "intermediate",
        estimatedHours: 2,
        points: 200,
        prerequisites: ["useeffect-data"],
        technologies: ["React", "TypeScript", "Tailwind"],
        order: 3,
        tasks: [
            { id: "task-1", title: "Create reusable Card component", description: "" },
            { id: "task-2", title: "Build responsive grid layout", description: "" },
            { id: "task-3", title: "Fetch data and populate cards", description: "" },
            { id: "task-4", title: "Add skeleton loading state", description: "" },
        ],
        expectedOutcome: "A grid of cards that loads data and has smooth loading states.",
    },
    {
        id: "toast-modal",
        phaseId: "phase-3",
        title: "Toast & Modal System",
        description: "Implement a toast notification system and reusable modal component.",
        difficulty: "intermediate",
        estimatedHours: 3,
        points: 250,
        prerequisites: ["dark-mode-context"],
        technologies: ["React", "TypeScript", "Tailwind", "Framer Motion"],
        order: 4,
        tasks: [
            { id: "task-1", title: "Create Toast component with variants (success, error, warning)", description: "" },
            { id: "task-2", title: "Build Toast context for global access", description: "" },
            { id: "task-3", title: "Create Modal component with overlay", description: "" },
            { id: "task-4", title: "Add animation for enter/exit", description: "" },
        ],
        expectedOutcome: "Global toast notifications and reusable modal that can be triggered from anywhere.",
    },
    {
        id: "multi-step-form",
        phaseId: "phase-3",
        title: "Multi-Step Form Wizard",
        description: "Create a multi-step form with validation and progress indicator.",
        difficulty: "advanced",
        estimatedHours: 5,
        points: 400,
        badgeId: "form-wizard",
        prerequisites: ["state-usestate"],
        technologies: ["React", "TypeScript", "Tailwind", "React Hook Form", "Zod"],
        order: 5,
        tasks: [
            { id: "task-1", title: "Create step progress indicator", description: "" },
            { id: "task-2", title: "Build individual step forms", description: "" },
            { id: "task-3", title: "Add form validation with Zod", description: "" },
            { id: "task-4", title: "Implement next/back navigation", description: "" },
            { id: "task-5", title: "Add step transition animations", description: "" },
        ],
        expectedOutcome: "A wizard-style form that guides users through multiple steps with validation.",
    },
];

// ============================================================================
// PHASE 4: FULL APPLICATIONS
// ============================================================================
const phase4Projects: Project[] = [
    {
        id: "dashboard-app",
        phaseId: "phase-4",
        title: "Dashboard Application",
        description: "Build a complete dashboard with sidebar, charts, and data tables.",
        difficulty: "advanced",
        estimatedHours: 8,
        points: 600,
        badgeId: "dashboard-developer",
        prerequisites: ["sidebar-nav", "card-grid"],
        technologies: ["React", "TypeScript", "Tailwind", "Recharts", "shadcn"],
        order: 1,
        tasks: [
            { id: "task-1", title: "Create dashboard layout with sidebar", description: "" },
            { id: "task-2", title: "Build stat cards with KPIs", description: "" },
            { id: "task-3", title: "Add charts (line, bar, pie)", description: "" },
            { id: "task-4", title: "Create data table with sorting/filtering", description: "" },
            { id: "task-5", title: "Add dark mode support", description: "" },
        ],
        expectedOutcome: "A professional admin dashboard with analytics and data management.",
    },
    {
        id: "task-manager",
        phaseId: "phase-4",
        title: "Task Management App",
        description: "Build a Kanban-style task manager with drag-and-drop.",
        difficulty: "advanced",
        estimatedHours: 10,
        points: 800,
        badgeId: "app-architect",
        prerequisites: ["dashboard-app"],
        technologies: ["React", "TypeScript", "Tailwind", "DnD Kit", "Supabase"],
        order: 2,
        tasks: [
            { id: "task-1", title: "Create Kanban board layout", description: "" },
            { id: "task-2", title: "Build task cards", description: "" },
            { id: "task-3", title: "Implement drag-and-drop", description: "" },
            { id: "task-4", title: "Add task creation/editing", description: "" },
            { id: "task-5", title: "Connect to Supabase for persistence", description: "" },
        ],
        expectedOutcome: "A fully functional task manager with drag-and-drop and real data persistence.",
    },
    {
        id: "realtime-chat",
        phaseId: "phase-4",
        title: "Real-time Chat",
        description: "Build a real-time chat application with Supabase.",
        difficulty: "advanced",
        estimatedHours: 8,
        points: 700,
        badgeId: "realtime-pro",
        prerequisites: ["useeffect-data"],
        technologies: ["React", "TypeScript", "Tailwind", "Supabase Realtime"],
        order: 3,
        tasks: [
            { id: "task-1", title: "Set up Supabase realtime subscription", description: "" },
            { id: "task-2", title: "Create chat UI with message bubbles", description: "" },
            { id: "task-3", title: "Add message sending", description: "" },
            { id: "task-4", title: "Show online users", description: "" },
            { id: "task-5", title: "Add typing indicators", description: "" },
        ],
        expectedOutcome: "A real-time chat where messages appear instantly for all users.",
    },
];

// ============================================================================
// PHASES DEFINITION
// ============================================================================
export const phases: Phase[] = [
    {
        id: "phase-1",
        number: 1,
        title: "Environment & Basics",
        subtitle: "Set up your development environment",
        description: "Install tools, create your first React project, and set up Tailwind + shadcn.",
        color: "from-emerald-500 to-teal-500",
        icon: "Terminal",
        capsules: phase1Capsules,
        projects: [],
    },
    {
        id: "phase-2",
        number: 2,
        title: "Core React Skills",
        subtitle: "Master React fundamentals",
        description: "Learn components, state, effects, and animations.",
        color: "from-blue-500 to-indigo-500",
        icon: "Code",
        capsules: phase2Capsules,
        projects: [],
    },
    {
        id: "phase-3",
        number: 3,
        title: "UI Component Projects",
        subtitle: "Build real components",
        description: "Create production-ready UI components and patterns.",
        color: "from-violet-500 to-purple-500",
        icon: "Layout",
        capsules: [],
        projects: phase3Projects,
    },
    {
        id: "phase-4",
        number: 4,
        title: "Full Applications",
        subtitle: "Build complete apps",
        description: "Combine components into full-featured applications.",
        color: "from-orange-500 to-red-500",
        icon: "Rocket",
        capsules: [],
        projects: phase4Projects,
    },
    {
        id: "phase-5",
        number: 5,
        title: "Portfolio & Deploy",
        subtitle: "Showcase your work",
        description: "Build your portfolio and deploy projects to production.",
        color: "from-pink-500 to-rose-500",
        icon: "Globe",
        capsules: [],
        projects: [
            {
                id: "portfolio-site",
                phaseId: "phase-5",
                title: "Portfolio Website",
                description: "Create your personal portfolio showcasing all projects.",
                difficulty: "advanced",
                estimatedHours: 12,
                points: 1000,
                badgeId: "portfolio-ready",
                prerequisites: ["dashboard-app"],
                technologies: ["Next.js", "TypeScript", "Tailwind", "Framer Motion"],
                order: 1,
                tasks: [
                    { id: "task-1", title: "Design and build hero section", description: "" },
                    { id: "task-2", title: "Create projects showcase", description: "" },
                    { id: "task-3", title: "Add about and contact sections", description: "" },
                    { id: "task-4", title: "Deploy to Vercel", description: "" },
                ],
                expectedOutcome: "A professional portfolio website live on the internet.",
            },
        ],
    },
    {
        id: "phase-6",
        number: 6,
        title: "Capstone & Beyond",
        subtitle: "Prove your expertise",
        description: "Complete a capstone project combining everything you've learned.",
        color: "from-amber-500 to-yellow-500",
        icon: "Trophy",
        capsules: [],
        projects: [
            {
                id: "capstone-project",
                phaseId: "phase-6",
                title: "Capstone Project",
                description: "Build a full-stack application with auth, dashboard, real-time features, and animations.",
                difficulty: "advanced",
                estimatedHours: 20,
                points: 2000,
                badgeId: "certified-developer",
                prerequisites: ["portfolio-site", "realtime-chat", "task-manager"],
                technologies: ["Next.js", "TypeScript", "Tailwind", "Supabase", "Framer Motion"],
                order: 1,
                tasks: [
                    { id: "task-1", title: "Plan and design your application", description: "" },
                    { id: "task-2", title: "Implement authentication", description: "" },
                    { id: "task-3", title: "Build core features with real-time updates", description: "" },
                    { id: "task-4", title: "Add professional animations", description: "" },
                    { id: "task-5", title: "Deploy and document", description: "" },
                ],
                expectedOutcome: "A portfolio-worthy full-stack application demonstrating all your skills.",
            },
        ],
    },
];

// Helper to get all capsules
export function getAllCapsules(): SkillCapsule[] {
    return phases.flatMap(phase => phase.capsules);
}

// Helper to get all projects
export function getAllProjects(): Project[] {
    return phases.flatMap(phase => phase.projects);
}

// Helper to get capsule by ID
export function getCapsuleById(id: string): SkillCapsule | undefined {
    return getAllCapsules().find(capsule => capsule.id === id);
}

// Helper to get project by ID
export function getProjectById(id: string): Project | undefined {
    return getAllProjects().find(project => project.id === id);
}

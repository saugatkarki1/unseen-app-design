import { promises as fs } from "fs"
import path from "path"

export interface UserRecord {
  id: string
  fullName: string
  email: string
  passwordHash: string
  skillDirection: string
  createdAt: string
}

export interface SessionRecord {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
}

export interface PasswordResetRecord {
  token: string
  userId: string
  createdAt: string
  expiresAt: string
  used: boolean
}

interface DatabaseShape {
  users: UserRecord[]
  sessions: SessionRecord[]
  passwordResets: PasswordResetRecord[]
}

const DATA_DIR = path.join(process.cwd(), "data")
const DATA_FILE = path.join(DATA_DIR, "auth.json")

async function ensureDataFile(): Promise<void> {
  await fs.mkdir(DATA_DIR, { recursive: true })
  try {
    await fs.access(DATA_FILE)
  } catch {
    const initial: DatabaseShape = { users: [], sessions: [], passwordResets: [] }
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8")
  }
}

async function readDb(): Promise<DatabaseShape> {
  await ensureDataFile()
  const raw = await fs.readFile(DATA_FILE, "utf8")
  try {
    const parsed = JSON.parse(raw) as DatabaseShape
    return {
      users: parsed.users ?? [],
      sessions: parsed.sessions ?? [],
      passwordResets: parsed.passwordResets ?? [],
    }
  } catch {
    const initial: DatabaseShape = { users: [], sessions: [], passwordResets: [] }
    await fs.writeFile(DATA_FILE, JSON.stringify(initial, null, 2), "utf8")
    return initial
  }
}

async function writeDb(db: DatabaseShape): Promise<void> {
  await fs.writeFile(DATA_FILE, JSON.stringify(db, null, 2), "utf8")
}

export async function findUserByEmail(email: string): Promise<UserRecord | undefined> {
  const db = await readDb()
  const target = email.trim().toLowerCase()
  return db.users.find((u) => u.email.toLowerCase() === target)
}

export async function findUserById(id: string): Promise<UserRecord | undefined> {
  const db = await readDb()
  return db.users.find((u) => u.id === id)
}

export async function createUser(user: Omit<UserRecord, "id" | "createdAt">): Promise<UserRecord> {
  const db = await readDb()
  const now = new Date().toISOString()
  const id = crypto.randomUUID()

  if (db.users.some((u) => u.email.toLowerCase() === user.email.toLowerCase())) {
    throw new Error("EMAIL_TAKEN")
  }

  const newUser: UserRecord = {
    id,
    createdAt: now,
    ...user,
  }

  db.users.push(newUser)
  await writeDb(db)
  return newUser
}

export async function createSession(userId: string, ttlHours = 24 * 7): Promise<SessionRecord> {
  const db = await readDb()
  const token = crypto.randomUUID()
  const now = new Date()
  const expires = new Date(now.getTime() + ttlHours * 60 * 60 * 1000)

  const session: SessionRecord = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
  }

  db.sessions = db.sessions.filter((s) => s.token !== token)
  db.sessions.push(session)
  await writeDb(db)
  return session
}

export async function getSession(token: string): Promise<SessionRecord | undefined> {
  const db = await readDb()
  const session = db.sessions.find((s) => s.token === token)
  if (!session) return undefined

  const now = new Date()
  const expires = new Date(session.expiresAt)
  if (expires.getTime() <= now.getTime()) {
    db.sessions = db.sessions.filter((s) => s.token !== token)
    await writeDb(db)
    return undefined
  }

  return session
}

export async function deleteSession(token: string): Promise<void> {
  const db = await readDb()
  db.sessions = db.sessions.filter((s) => s.token !== token)
  await writeDb(db)
}

export async function deleteSessionsForUser(userId: string): Promise<void> {
  const db = await readDb()
  db.sessions = db.sessions.filter((s) => s.userId !== userId)
  await writeDb(db)
}

export async function createPasswordResetToken(userId: string, ttlMinutes = 15): Promise<PasswordResetRecord> {
  const db = await readDb()
  const now = new Date()
  const expires = new Date(now.getTime() + ttlMinutes * 60 * 1000)

  const token = crypto.randomUUID()
  const record: PasswordResetRecord = {
    token,
    userId,
    createdAt: now.toISOString(),
    expiresAt: expires.toISOString(),
    used: false,
  }

  db.passwordResets = db.passwordResets.filter((r) => r.userId !== userId)
  db.passwordResets.push(record)
  await writeDb(db)
  return record
}

export async function usePasswordResetToken(
  token: string,
): Promise<PasswordResetRecord & { valid: boolean; reason?: string }> {
  const db = await readDb()
  const record = db.passwordResets.find((r) => r.token === token)
  if (!record) {
    return { token, userId: "", createdAt: "", expiresAt: "", used: true, valid: false, reason: "invalid" }
  }

  const now = new Date()
  const expires = new Date(record.expiresAt)

  if (record.used) {
    return { ...record, valid: false, reason: "used" }
  }
  if (expires.getTime() <= now.getTime()) {
    return { ...record, valid: false, reason: "expired" }
  }

  record.used = true
  db.passwordResets = db.passwordResets.map((r) => (r.token === token ? record : r))
  await writeDb(db)

  return { ...record, valid: true }
}

export async function updateUserPassword(userId: string, passwordHash: string): Promise<void> {
  const db = await readDb()
  db.users = db.users.map((u) => (u.id === userId ? { ...u, passwordHash } : u))
  await writeDb(db)
}



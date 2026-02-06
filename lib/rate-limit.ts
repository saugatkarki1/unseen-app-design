type WindowState = {
  count: number
  resetAt: number
}

const windows = new Map<string, WindowState>()

export function rateLimit(options: { key: string; max: number; windowMs: number }): { allowed: boolean; retryAfter?: number } {
  const now = Date.now()
  const existing = windows.get(options.key)

  if (!existing || existing.resetAt <= now) {
    windows.set(options.key, { count: 1, resetAt: now + options.windowMs })
    return { allowed: true }
  }

  if (existing.count < options.max) {
    existing.count += 1
    windows.set(options.key, existing)
    return { allowed: true }
  }

  const retryAfter = Math.max(0, existing.resetAt - now)
  return { allowed: false, retryAfter }
}



/**
 * Persistent rate-limiter backed by PostgreSQL.
 *
 * Why this replaces the previous in-memory Map:
 *  - Survives process restarts (counters are not reset on deploy/crash).
 *  - Shared across all application instances behind a load-balancer.
 *  - Uses a single atomic UPSERT to avoid race conditions between concurrent
 *    requests from the same IP.
 *
 * If the database is unavailable the function falls back to `allowed: true`
 * so that a DB outage never locks legitimate users out of the application.
 */
import { prisma } from '@/lib/prisma'

const DEFAULT_WINDOW_MS = 60_000

function getClientIp(request: Request): string {
  const forwarded = request.headers.get('x-forwarded-for')
  if (forwarded) {
    // De-facto format: "client, proxy1, proxy2" (leftmost = originating client).
    // Docker / direct Node often sends no XFF → we fall back below.
    const parts = forwarded
      .split(',')
      .map((p) => p.trim())
      .filter(Boolean)
    return parts[0] || 'unknown'
  }
  return request.headers.get('x-real-ip')?.trim() || 'unknown'
}

export async function checkRateLimit(options: {
  request: Request
  key: string
  limit: number
  windowMs?: number
  /**
   * When the client IP is missing (typical with Docker port publish), every request
   * would otherwise share the same `unknown` bucket and lock everyone out after a
   * few attempts. Pass a stable per-actor value (e.g. normalized email) for auth routes.
   */
  identityFallback?: string
}): Promise<{ allowed: boolean; retryAfter: number }> {
  const { request, key, limit, windowMs = DEFAULT_WINDOW_MS, identityFallback } = options
  const now = new Date()
  const resetAt = new Date(now.getTime() + windowMs)
  let ip = getClientIp(request)
  if (ip === 'unknown' && identityFallback) {
    const safe = identityFallback.toLowerCase().trim().slice(0, 320)
    ip = `fb:${safe}`
  }
  const storeKey = `${key}:${ip}`

  try {
    // Atomic upsert:
    //  - First request in window → insert row with count = 1
    //  - Subsequent requests in window → increment existing count
    //  - Window expired → reset count to 1 and start a new window
    const result = await prisma.$queryRaw<Array<{ count: number; resetAt: Date }>>`
      INSERT INTO rate_limits (id, count, "resetAt")
      VALUES (${storeKey}, 1, ${resetAt})
      ON CONFLICT (id) DO UPDATE SET
        count = CASE
          WHEN rate_limits."resetAt" <= ${now} THEN 1
          ELSE rate_limits.count + 1
        END,
        "resetAt" = CASE
          WHEN rate_limits."resetAt" <= ${now} THEN ${resetAt}
          ELSE rate_limits."resetAt"
        END
      RETURNING count, "resetAt"
    `

    const entry = result[0]
    if (!entry) return { allowed: true, retryAfter: windowMs }

    const retryAfter = Math.max(0, entry.resetAt.getTime() - now.getTime())

    if (entry.count > limit) {
      return { allowed: false, retryAfter }
    }

    return { allowed: true, retryAfter }
  } catch {
    // DB unavailable — fail open so legitimate users are not locked out
    return { allowed: true, retryAfter: windowMs }
  }
}

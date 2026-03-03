import { prisma } from '@/lib/prisma'

/**
 * JWT token revocation blocklist backed by PostgreSQL.
 *
 * When a user signs out (or an admin invalidates a session), that JWT's `jti`
 * claim is written here.  The `jwt` callback in auth.ts then checks this table
 * on every request and returns `null` (invalidating the session) when a match
 * is found.
 *
 * Expired entries are pruned probabilistically inside `isTokenRevoked` so the
 * table stays small without needing a separate cron job.
 */

/**
 * Add a JWT JTI to the revocation list.
 * Idempotent — safe to call multiple times for the same JTI.
 */
export async function revokeToken(jti: string, expiresAt: Date): Promise<void> {
  await prisma.revokedToken.upsert({
    where:  { jti },
    create: { jti, expiresAt },
    update: {},
  })
}

/**
 * Returns `true` when the JTI is in the blocklist (session must be rejected).
 * Also runs a probabilistic cleanup of expired entries (1 % of calls).
 */
export async function isTokenRevoked(jti: string): Promise<boolean> {
  // Probabilistic cleanup: runs on ~1 % of calls, fire-and-forget
  if (Math.random() < 0.01) {
    prisma.revokedToken
      .deleteMany({ where: { expiresAt: { lt: new Date() } } })
      .catch(() => {/* non-critical — ignore errors */})
  }

  const entry = await prisma.revokedToken.findUnique({ where: { jti } })
  return entry !== null
}

/**
 * Explicitly purge all expired entries from the blocklist.
 * Call this from a scheduled task or the health-check endpoint.
 */
export async function purgeExpiredTokens(): Promise<number> {
  const result = await prisma.revokedToken.deleteMany({
    where: { expiresAt: { lt: new Date() } },
  })
  return result.count
}

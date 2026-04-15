/**
 * ─── Adaptive Learning Analytics ────────────────────────────────────────────
 *
 * Computes per-user, per-tag skill statistics from the TaskAttempt event log.
 * Aggregations are derived on-demand from `task_attempts`.
 *
 * Usage:
 *   const stats    = await getUserTagStats('user-id')
 *   const weakTags = await getUserWeakTags('user-id')
 */

import { prisma } from '@/lib/prisma'

// ─── Per-user TTL cache ────────────────────────────────────────────────────────
//
// getUserTagStats performs an unbounded findMany over the full task_attempts
// history and aggregates it in JavaScript.  Both /api/practice/session and
// /api/recommend/tasks call this function independently for the same user on
// every request.  The cache prevents redundant DB reads within a 60-second
// window without requiring any new infrastructure.
//
// Cache is keyed by userId.  Invalidate it after a task submission by calling
// invalidateUserTagStatsCache(userId).

interface CacheEntry {
  data:      TagStat[]
  expiresAt: number
}

const statsCache = new Map<string, CacheEntry>()
const CACHE_TTL_MS = 60_000  // 1 minute

function getCached(userId: string): TagStat[] | null {
  const entry = statsCache.get(userId)
  if (!entry || Date.now() > entry.expiresAt) {
    statsCache.delete(userId)
    return null
  }
  return entry.data
}

function setCache(userId: string, data: TagStat[]): void {
  statsCache.set(userId, { data, expiresAt: Date.now() + CACHE_TTL_MS })
}

/**
 * Explicitly invalidate the cached stats for a user.
 * Call this after submitTaskAnswer() so the next recommendation request
 * reflects the newly submitted result.
 */
export function invalidateUserTagStatsCache(userId: string): void {
  statsCache.delete(userId)
}

// ─── Public types ─────────────────────────────────────────────────────────────

/**
 * Aggregated statistics for a single tag as experienced by one user.
 */
export interface TagStat {
  /** The tag name from the Tag record linked via TaskProgressTag */
  tag:           string
  /** Total number of task submissions that included this tag */
  attempts:      number
  /** Number of those submissions that were marked isCorrect = true */
  correct:       number
  /** correct / attempts  (0 when attempts = 0) */
  successRate:   number
  /**
   * Bayesian (Laplace / add-one) smoothed score:
   *   score = (correct + 1) / (attempts + 2)
   *
   * This prevents tags with very few attempts from dominating the weakness
   * ranking.  A tag with 0 attempts receives a neutral prior of 0.5.
   */
  score:         number
  /** Timestamp of the most recent attempt involving this tag */
  lastAttemptAt: Date | null
}

/**
 * Weakness entry used for recommendation scoring.
 * weakness = 1 - successRate  (0 = perfect, 1 = always wrong)
 */
export interface WeakTag {
  tag:      string
  weakness: number
}

// ─── Core analytics ───────────────────────────────────────────────────────────

/**
 * Compute per-tag statistics for a user based on their full TaskProgress history.
 *
 * Algorithm:
 *  1. Fetch all TaskAttempt rows for the user via the taskAttemptTags relation.
 *  2. Each tag linked through TaskAttemptTag becomes an independent observation.
 *  3. Accumulate attempts/correct/lastAttemptAt per tag.
 *  4. Derive successRate and Bayesian score.
 *
 * @param userId  - The Prisma User.id to aggregate for.
 */
export async function getUserTagStats(userId: string): Promise<TagStat[]> {
  const cached = getCached(userId)
  if (cached) return cached

  const records = await prisma.taskAttempt.findMany({
    where:  { userId },
    select: {
      taskAttemptTags: { select: { tag: { select: { name: true } } } },
      isCorrect:        true,
      attemptedAt:      true,
    },
  })

  // Map<tagString, accumulated counters>
  const tagMap = new Map<string, {
    attempts:      number
    correct:       number
    lastAttemptAt: Date | null
  }>()

  for (const row of records) {
    for (const tat of row.taskAttemptTags) {
      const tag = tat.tag.name
      if (!tag) continue
      const acc = tagMap.get(tag) ?? { attempts: 0, correct: 0, lastAttemptAt: null }

      acc.attempts += 1
      if (row.isCorrect === true) acc.correct += 1

      if (row.attemptedAt) {
        if (!acc.lastAttemptAt || row.attemptedAt > acc.lastAttemptAt) {
          acc.lastAttemptAt = row.attemptedAt
        }
      }

      tagMap.set(tag, acc)
    }
  }  // end outer for

  const stats: TagStat[] = []

  for (const [tag, data] of tagMap) {
    const successRate = data.attempts > 0 ? data.correct / data.attempts : 0
    // Laplace smoothing: avoids 0/N and N/N extremes
    const score       = (data.correct + 1) / (data.attempts + 2)

    stats.push({
      tag,
      attempts:      data.attempts,
      correct:       data.correct,
      successRate,
      score,
      lastAttemptAt: data.lastAttemptAt,
    })
  }

  setCache(userId, stats)
  return stats
}

/**
 * Return tags ordered from weakest → strongest.
 *
 *   weakness = 1 - successRate
 *
 * Tags with the lowest success rate appear first and are prioritised by the
 * recommendation engine.
 *
 * @param userId - The Prisma User.id to compute weakness for.
 */
export async function getUserWeakTags(userId: string): Promise<WeakTag[]> {
  const stats = await getUserTagStats(userId)

  return stats
    .map((s): WeakTag => ({ tag: s.tag, weakness: 1 - s.successRate }))
    .sort((a, b) => b.weakness - a.weakness)
}

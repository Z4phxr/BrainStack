import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth } from '@/lib/auth-helpers'
import { getUserTagStats, getUserWeakTags } from '@/lib/analytics'
import { prisma } from '@/lib/prisma'
import { randomUUID } from 'crypto'
import { extractText } from '@/lib/lexical'

/**
 * GET /api/practice/session?limit=10
 *
 * Generates a balanced practice session queue for the authenticated user.
 *
 * Session composition:
 *   ~40% weak-tag tasks   — tasks covering the user's weakest tags
 *   ~30% medium-tag tasks — tasks covering tags with middling performance
 *   ~30% random tasks     — any published tasks for variety
 *
 * Exclusion: tasks already solved correctly are excluded first; if a
 * pool runs dry they are added back to guarantee the requested limit.
 *
 * Response:
 *   { sessionId: string, tasks: [{ id, question, tags }] }
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const TOP_WEAK_TAGS      = 3
const CANDIDATE_LIMIT    = 300
const DEFAULT_LIMIT      = 10
const MAX_LIMIT          = 50

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalise = (s: string) => s.toLowerCase().trim()

function payloadTaskTags(task: any): string[] {
  const tagObjects: Array<Record<string, unknown>> = task.tags ?? []
  return tagObjects
    .map((t) => normalise(String(t.name ?? t.slug ?? t.tag ?? '')))
    .filter(Boolean)
}

/**
 * Deterministic shuffle using Fisher-Yates so tests can control randomness.
 * In production Math.random() is used.
 */
function shuffle<T>(arr: T[]): T[] {
  const a = [...arr]
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1))
    ;[a[i], a[j]] = [a[j], a[i]]
  }
  return a
}

/** Pick up to `n` unique items from `arr` that are not already in `seen`. */
function pickUnique<T extends { id: string }>(arr: T[], n: number, seen: Set<string>): T[] {
  const out: T[] = []
  for (const item of arr) {
    if (out.length >= n) break
    if (!seen.has(item.id)) {
      out.push(item)
      seen.add(item.id)
    }
  }
  return out
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get('limit') ?? String(DEFAULT_LIMIT), 10) || DEFAULT_LIMIT),
      MAX_LIMIT,
    )

    // ── Step 1: get tag stats ─────────────────────────────────────────────────
    const [allWeak, allStats] = await Promise.all([
      getUserWeakTags(user.id),
      getUserTagStats(user.id),
    ])

    const topWeak   = allWeak.slice(0, TOP_WEAK_TAGS)
    const weakTagSet = new Set(topWeak.map((t) => normalise(t.tag)))

    // Medium = tags with successRate 0.4–0.7 (struggling but not worst)
    const mediumTagSet = new Set(
      allStats
        .filter((s) => s.successRate >= 0.4 && s.successRate < 0.7)
        .map((s) => normalise(s.tag)),
    )

    // ── Step 2: build attempt maps ────────────────────────────────────────────
    const attempts = await prisma.taskAttempt.findMany({
      where:  { userId: user.id, isCorrect: true },
      select: { taskId: true },
    })
    const solvedCorrectly = new Set(
      attempts.map((a) => a.taskId),
    )

    // ── Step 3: fetch candidate tasks ─────────────────────────────────────────
    const payload = await getPayload({ config })
    const { docs: allTasks } = await payload.find({
      collection: 'tasks',
      where:      { isPublished: { equals: true } },
      limit:      CANDIDATE_LIMIT,
      depth:      1,
    })

    // Normalised task shape
    interface NTask { id: string; question: string; tags: string[] }

    const toNTask = (t: any): NTask => ({
      id:       String(t.id),
      question: extractText(t.prompt),
      tags:     payloadTaskTags(t),
    })

    // Prefer tasks never solved correctly; fall back to all
    function preferUnsolved(pool: NTask[]): NTask[] {
      const unsolved = pool.filter((t) => !solvedCorrectly.has(t.id))
      return unsolved.length > 0 ? unsolved : pool
    }

    const weakPool   = preferUnsolved(shuffle((allTasks as any[]).map(toNTask).filter((t) => t.tags.some((tag) => weakTagSet.has(tag)))))
    const mediumPool = preferUnsolved(shuffle((allTasks as any[]).map(toNTask).filter((t) => t.tags.some((tag) => mediumTagSet.has(tag)))))
    const randomPool = preferUnsolved(shuffle((allTasks as any[]).map(toNTask)))

    // ── Step 4: compose session ───────────────────────────────────────────────
    // Target distribution: 40% weak, 30% medium, 30% random
    const weakCount   = Math.round(limit * 0.4)
    const mediumCount = Math.round(limit * 0.3)
    const randomCount = limit - weakCount - mediumCount   // absorbs rounding

    const picked = new Set<string>()
    const session: NTask[] = []

    const weakSlice   = pickUnique(weakPool,   weakCount,   picked)
    const mediumSlice = pickUnique(mediumPool,  mediumCount, picked)
    const randomSlice = pickUnique(randomPool,  randomCount, picked)

    // Interleave: W W M R W M R W ...
    // Simple merge: weak then medium then random, shuffled for variety
    const merged = [
      ...weakSlice,
      ...mediumSlice,
      ...randomSlice,
    ]

    // If pools didn't fill the limit, top up from randomPool
    if (merged.length < limit) {
      const extra = pickUnique(randomPool, limit - merged.length, picked)
      merged.push(...extra)
    }

    // Interleave the three types so the queue doesn't cluster by type
    const interleaved: NTask[] = []
    const buckets = [weakSlice, mediumSlice, randomSlice]
    const maxLen  = Math.max(...buckets.map((b) => b.length))
    for (let i = 0; i < maxLen; i++) {
      for (const bucket of buckets) {
        if (i < bucket.length) interleaved.push(bucket[i])
      }
    }

    // Fill any remaining slots from the extra picks
    const extra = merged.filter((t) => !interleaved.find((s) => s.id === t.id))
    const finalQueue = [...interleaved, ...extra].slice(0, limit)

    return NextResponse.json({
      sessionId: randomUUID(),
      tasks:     finalQueue,
    })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' },  { status: 403 })
      }
    }
    console.error('[GET /api/practice/session]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

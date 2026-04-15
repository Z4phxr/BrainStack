import { NextResponse } from 'next/server'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAuth } from '@/lib/auth-helpers'
import { getUserWeakTags } from '@/lib/analytics'
import { prisma } from '@/lib/prisma'
import { extractText } from '@/lib/lexical'

/**
 * GET /api/recommend/tasks?limit=5&mode=weak|review|mixed
 *
 * Returns a personalised list of practice tasks.
 *
 * Query parameters:
 *   limit  = number             (default 5, max 20)
 *   mode   = "weak"|"review"|"mixed"  (default "weak")
 *
 * Modes:
 *
 *   weak   — Focus on weakest tags.
 *     1. Compute top-3 weakest tags via getUserWeakTags().
 *     2. Score published tasks by sum-of-weakness for matching tags.
 *     3. Apply novelty (+0.3) and staleness (+0.2) bonuses.
 *
 *   review — Return tasks the user previously got wrong, most recent first.
 *     1. Pull TaskAttempt rows with isCorrect = false.
 *     2. De-duplicate by taskId keeping the latest attempt.
 *     3. Exclude tasks since solved correctly.
 *     4. Sort by attemptedAt descending.
 *
 *   mixed  — Balanced blend: 40% weak, 30% review, 30% random.
 *     Merges the three pools and interleaves them.
 *
 * Response:
 *   { tasks: [{ id, question, tags, score }], explanation, mode }
 */

// ─── Constants ────────────────────────────────────────────────────────────────

const TOP_WEAK_TAGS   = 3
const CANDIDATE_LIMIT = 300
const STALE_DAYS      = 7
const BONUS_NEW       = 0.3
const BONUS_STALE     = 0.2

// ─── Helpers ─────────────────────────────────────────────────────────────────

const normalise = (s: string) => s.toLowerCase().trim()

function payloadTaskTags(task: any): string[] {
  const tagObjects: Array<Record<string, unknown>> = task.tags ?? []
  return tagObjects
    .map((t) => normalise(String(t.name ?? t.slug ?? t.tag ?? '')))
    .filter(Boolean)
}

interface ScoredTask {
  id:       string
  question: string
  tags:     string[]
  score:    number
}

// ─── Mode handlers ────────────────────────────────────────────────────────────

/**
 * WEAK mode: rank published tasks by overlap with the user's weakest tags.
 */
async function weakMode(
  userId: string,
  allTasks: any[],
  limit: number,
): Promise<{ tasks: ScoredTask[]; explanation: string }> {
  const allWeakTags = await getUserWeakTags(userId)
  const topWeak     = allWeakTags.slice(0, TOP_WEAK_TAGS)

  if (topWeak.length === 0) {
    return {
      tasks:       [],
      explanation: 'No tag history found — submit some tasks first to enable recommendations.',
    }
  }

  const weakTagSet = new Set(topWeak.map((t) => normalise(t.tag)))
  const weakTagMap = new Map(topWeak.map((t) => [normalise(t.tag), t.weakness]))

  const attempts = await prisma.taskAttempt.findMany({
    where:  { userId },
    select: { taskId: true, attemptedAt: true },
    orderBy: { attemptedAt: 'desc' },
  })
  const attemptedIds    = new Set<string>()
  const lastAttemptedAt = new Map<string, Date>()
  for (const a of attempts) {
    attemptedIds.add(a.taskId)
    if (a.attemptedAt && !lastAttemptedAt.has(a.taskId)) {
      lastAttemptedAt.set(a.taskId, a.attemptedAt)
    }
  }

  const now = Date.now()

  const scored = allTasks
    .map((task) => {
      const tags     = payloadTaskTags(task)
      const matching = tags.filter((t) => weakTagSet.has(t))
      if (matching.length === 0) return null

      let score = matching.reduce((sum, t) => sum + (weakTagMap.get(t) ?? 0), 0)
      const taskId = String(task.id)

      if (!attemptedIds.has(taskId)) {
        score += BONUS_NEW
      } else {
        const lastAt = lastAttemptedAt.get(taskId)
        if (lastAt) {
          const daysAgo = (now - lastAt.getTime()) / (1000 * 60 * 60 * 24)
          if (daysAgo >= STALE_DAYS) score += BONUS_STALE
        }
      }

      return {
        id:       taskId,
        question: extractText(task.prompt),
        tags,
        score:    Math.round(score * 1000) / 1000,
      } as ScoredTask
    })
    .filter((t): t is ScoredTask => t !== null)

  scored.sort((a, b) => b.score - a.score)

  return {
    tasks:       scored.slice(0, limit),
    explanation: `Tasks selected because the user struggles with tags: ${topWeak.map((t) => t.tag).join(', ')}`,
  }
}

/**
 * REVIEW mode: return tasks previously answered incorrectly, most recent first.
 * Tasks the user has since answered correctly are excluded.
 */
async function reviewMode(
  userId: string,
  allTasks: any[],
  limit: number,
): Promise<{ tasks: ScoredTask[]; explanation: string }> {
  const allAttempts = await prisma.taskAttempt.findMany({
    where:  { userId },
    select: { taskId: true, isCorrect: true, attemptedAt: true },
    orderBy: { attemptedAt: 'desc' },
  })

  // Track which tasks were ever solved correctly
  const everCorrect = new Set(
    allAttempts.filter((a) => a.isCorrect === true).map((a) => a.taskId),
  )

  // Most-recent incorrect attempt per task (deduplicated)
  const seen = new Set<string>()
  const incorrect: { taskId: string; attemptedAt: Date }[] = []
  for (const a of allAttempts) {
    if (a.isCorrect === false && !everCorrect.has(a.taskId) && !seen.has(a.taskId) && a.attemptedAt !== null) {
      incorrect.push({ taskId: a.taskId, attemptedAt: a.attemptedAt! })
      seen.add(a.taskId)
    }
  }

  // Build a lookup map for task data
  const taskById = new Map(allTasks.map((t) => [String(t.id), t]))

  const tasks: ScoredTask[] = []
  for (const { taskId, attemptedAt } of incorrect) {
    if (tasks.length >= limit) break
    const task = taskById.get(taskId)
    if (!task) continue
    // Score by recency: more recent = higher score
    const score = 1 / (1 + (Date.now() - attemptedAt.getTime()) / (1000 * 60 * 60 * 24))
    tasks.push({
      id:       taskId,
      question: extractText(task.prompt),
      tags:     payloadTaskTags(task),
      score:    Math.round(score * 1000) / 1000,
    })
  }

  return {
    tasks,
    explanation: 'Tasks you previously answered incorrectly, sorted by most recent attempt.',
  }
}

/**
 * MIXED mode: 40% weak, 30% review, 30% random — interleaved.
 */
async function mixedMode(
  userId: string,
  allTasks: any[],
  limit: number,
): Promise<{ tasks: ScoredTask[]; explanation: string }> {
  const weakCount   = Math.round(limit * 0.4)
  const reviewCount = Math.round(limit * 0.3)
  const randomCount = limit - weakCount - reviewCount

  const [weakResult, reviewResult] = await Promise.all([
    weakMode(userId,   allTasks, weakCount),
    reviewMode(userId, allTasks, reviewCount),
  ])

  // Random pool: shuffle all tasks, take what's needed
  const weakIds   = new Set(weakResult.tasks.map((t) => t.id))
  const reviewIds = new Set(reviewResult.tasks.map((t) => t.id))

  const randomPool = allTasks
    .filter((t) => !weakIds.has(String(t.id)) && !reviewIds.has(String(t.id)))
    .sort(() => Math.random() - 0.5)
    .slice(0, randomCount)
    .map((t) => ({
      id:       String(t.id),
      question: extractText(t.prompt),
      tags:     payloadTaskTags(t),
      score:    0,
    } as ScoredTask))

  // Interleave weak / review / random
  const buckets = [weakResult.tasks, reviewResult.tasks, randomPool]
  const maxLen  = Math.max(...buckets.map((b) => b.length))
  const merged: ScoredTask[] = []
  for (let i = 0; i < maxLen; i++) {
    for (const bucket of buckets) {
      if (i < bucket.length) merged.push(bucket[i])
    }
  }

  return {
    tasks:       merged.slice(0, limit),
    explanation: 'Mixed practice: weak-tag tasks, recent mistakes, and random tasks.',
  }
}

// ─── Route ────────────────────────────────────────────────────────────────────

export async function GET(req: Request) {
  try {
    const user = await requireAuth()

    const { searchParams } = new URL(req.url)
    const limit = Math.min(
      Math.max(1, parseInt(searchParams.get('limit') ?? '5', 10) || 5),
      20,
    )
    const mode = (['weak', 'review', 'mixed'] as const).includes(
      searchParams.get('mode') as any,
    )
      ? (searchParams.get('mode') as 'weak' | 'review' | 'mixed')
      : 'weak'

    // Fetch all published tasks once and share across modes
    const payload = await getPayload({ config })
    const { docs: allTasks } = await payload.find({
      collection: 'tasks',
      where:      { isPublished: { equals: true } },
      limit:      CANDIDATE_LIMIT,
      depth:      1,
    })

    let result: { tasks: ScoredTask[]; explanation: string }

    if (mode === 'review') {
      result = await reviewMode(user.id, allTasks as any[], limit)
    } else if (mode === 'mixed') {
      result = await mixedMode(user.id, allTasks as any[], limit)
    } else {
      result = await weakMode(user.id, allTasks as any[], limit)
    }

    return NextResponse.json({ ...result, mode })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    console.error('[GET /api/recommend/tasks]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

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
 *   review — Return tasks whose latest attempt is incorrect, most recent first.
 *     1. Pull TaskAttempts ordered by attemptedAt descending.
 *     2. Take the latest attempt per taskId.
 *     3. Keep tasks where that latest attempt is incorrect (a prior correct attempt does not exclude).
 *     4. Sort by that attempt's attemptedAt descending.
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
const courseIdFromTask = (task: any): string | null => {
  const lesson = task?.lesson
  if (!lesson || typeof lesson !== 'object') return null
  const course = (lesson as { course?: unknown }).course
  if (!course) return null
  if (typeof course === 'string' || typeof course === 'number') return String(course)
  if (typeof course === 'object' && 'id' in course) return String((course as { id: string | number }).id)
  return null
}

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

  const perTask = await prisma.taskAttempt.groupBy({
    by: ['taskId'],
    where: { userId },
    _max: { attemptedAt: true },
  })
  const attemptedIds    = new Set<string>(perTask.map((r) => r.taskId))
  const lastAttemptedAt = new Map<string, Date>()
  for (const row of perTask) {
    const at = row._max.attemptedAt
    if (at) lastAttemptedAt.set(row.taskId, at)
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
 * REVIEW mode: tasks whose latest submission is incorrect, most recent first.
 * A task answered correctly in the past but wrong on the latest try is included.
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

  const latestByTask = new Map<string, { isCorrect: boolean; attemptedAt: Date }>()
  for (const a of allAttempts) {
    if (a.attemptedAt == null || latestByTask.has(a.taskId)) continue
    latestByTask.set(a.taskId, {
      isCorrect: a.isCorrect === true,
      attemptedAt: a.attemptedAt,
    })
  }

  const incorrect = [...latestByTask.entries()]
    .filter(([, meta]) => !meta.isCorrect)
    .map(([taskId, meta]) => ({ taskId, attemptedAt: meta.attemptedAt }))
    .sort((x, y) => y.attemptedAt.getTime() - x.attemptedAt.getTime())

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
    explanation: 'Tasks where your latest answer was incorrect, sorted by most recent attempt.',
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
    const archivedCourseRows = await prisma.courseProgress.findMany({
      where: { userId: user.id, archivedAt: { not: null } },
      select: { courseId: true },
    })
    const archivedCourseIds = new Set(archivedCourseRows.map((r) => r.courseId))
    const candidateTasks = (allTasks as any[]).filter((task) => {
      const taskCourseId = courseIdFromTask(task)
      return !taskCourseId || !archivedCourseIds.has(taskCourseId)
    })

    let result: { tasks: ScoredTask[]; explanation: string }

    if (mode === 'review') {
      result = await reviewMode(user.id, candidateTasks, limit)
    } else if (mode === 'mixed') {
      result = await mixedMode(user.id, candidateTasks, limit)
    } else {
      result = await weakMode(user.id, candidateTasks, limit)
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

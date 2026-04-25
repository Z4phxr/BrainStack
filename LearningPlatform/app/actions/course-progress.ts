'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getPayload } from 'payload'
import type { Payload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'

/**
 * Get course progress for the current user (uses 1-minute cache).
 */
export async function getCourseProgress(courseId: string) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  return await getCachedCourseProgress(session.user.id, courseId)
}

/**
 * Get all course progress for the current user (for dashboard).
 */
export async function getAllCourseProgress() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  // Backward-compatible: some local DB/schema snapshots do not include archivedAt yet.
  const whereWithArchiveFilter: Record<string, unknown> = { userId: session.user.id }
  whereWithArchiveFilter.archivedAt = null
  try {
    return await prisma.courseProgress.findMany({
      where: whereWithArchiveFilter as never,
      orderBy: { lastActivityAt: 'desc' },
    })
  } catch {
    return prisma.courseProgress.findMany({
      where: { userId: session.user.id },
      orderBy: { lastActivityAt: 'desc' },
    })
  }
}

/**
 * Recalculate and persist course progress for a user.
 * Exported so lesson-progress.ts and submit-task.ts can invoke it.
 */
export async function recalculateCourseProgress(userId: string, courseId: string) {
  const payload = await getPayload({ config })

  // Get all published lessons for this course (Payload defaults limit to 10)
  const { docs: allLessons } = await payload.find({
    collection: 'lessons',
    where: {
      course: { equals: courseId },
      isPublished: { equals: true },
    },
    limit: 10_000,
  })

  const totalLessons = allLessons.length
  const lessonIds = allLessons.map((l) => String(l.id))

  const completedCount = await prisma.lessonProgress.count({
    where: {
      userId,
      lessonId: { in: lessonIds },
      status: 'COMPLETED',
    },
  })

  const progressPercentage = totalLessons > 0
    ? Math.round((completedCount / totalLessons) * 100)
    : 0

  const { docs: allTasks } = await payload.find({
    collection: 'tasks',
    where: {
      lesson: { in: lessonIds },
      isPublished: { equals: true },
    },
    limit: 10_000,
  })

  const totalPoints = allTasks.reduce((sum, task) => sum + (task.points || 0), 0)
  const taskIds = allTasks.map((t) => String(t.id))

  const earnedPointsResult = await prisma.taskProgress.aggregate({
    where: { userId, taskId: { in: taskIds } },
    _sum: { earnedPoints: true },
  })

  const earnedPoints = earnedPointsResult._sum.earnedPoints || 0

  await prisma.courseProgress.upsert({
    where: { userId_courseId: { userId, courseId } },
    create: {
      userId,
      courseId,
      totalLessons,
      completedLessons: completedCount,
      progressPercentage,
      totalPoints,
      earnedPoints,
      lastActivityAt: new Date(),
    },
    update: {
      totalLessons,
      completedLessons: completedCount,
      progressPercentage,
      totalPoints,
      earnedPoints,
      lastActivityAt: new Date(),
    },
  })
}

/**
 * Cached version of course progress (1-minute TTL).
 * Private — external callers go through getCourseProgress().
 */
const getCachedCourseProgress = unstable_cache(
  async (userId: string, courseId: string) => {
    let courseProgress = await prisma.courseProgress.findUnique({
      where: { userId_courseId: { userId, courseId } },
    })

    // If not cached or stale (>5 minutes), recalculate
    if (!courseProgress || new Date().getTime() - courseProgress.lastActivityAt.getTime() > 300000) {
      await recalculateCourseProgress(userId, courseId)
      courseProgress = await prisma.courseProgress.findUnique({
        where: { userId_courseId: { userId, courseId } },
      })
    }

    return courseProgress
  },
  ['course-progress'],
  { revalidate: 60, tags: ['course-progress'] }
)

const POPULAR_COURSE_LIMIT = 5

/**
 * After engagement-based ordering, pad with newest published courses (excluding any
 * already chosen) until `limit` ids, or until the catalog runs out.
 */
async function extendPopularCourseIdsToLimit(
  payload: Payload,
  engagementOrderedIds: string[],
  limit = POPULAR_COURSE_LIMIT,
): Promise<string[]> {
  const out = [...engagementOrderedIds]
  const seen = new Set(out)
  if (out.length >= limit) return out.slice(0, limit)

  const { docs: recent } = await payload.find({
    collection: 'courses',
    where: { isPublished: { equals: true } },
    sort: '-createdAt',
    limit: 50,
    depth: 0,
  })

  for (const c of recent) {
    const id = String(c.id)
    if (seen.has(id)) continue
    out.push(id)
    seen.add(id)
    if (out.length >= limit) break
  }

  return out
}

async function computePopularCourseIds(): Promise<string[]> {
  const payload = await getPayload({ config })
  const rows = await prisma.lessonProgress.findMany({
    where: { status: { in: ['IN_PROGRESS', 'COMPLETED'] } },
    select: { userId: true, lessonId: true },
  })
  if (rows.length === 0) {
    return extendPopularCourseIdsToLimit(payload, [], POPULAR_COURSE_LIMIT)
  }

  const lessonIds = [...new Set(rows.map((r) => r.lessonId))]
  if (lessonIds.length === 0) {
    return extendPopularCourseIdsToLimit(payload, [], POPULAR_COURSE_LIMIT)
  }
  const { docs: lessons } = await payload.find({
    collection: 'lessons',
    where: {
      id: { in: lessonIds },
      isPublished: { equals: true },
    },
    limit: lessonIds.length,
    depth: 0,
  })

  const lessonToCourse = new Map<string, string>()
  for (const lesson of lessons) {
    const cid =
      typeof lesson.course === 'object' && lesson.course !== null && 'id' in lesson.course
        ? String((lesson.course as { id: string }).id)
        : String(lesson.course)
    lessonToCourse.set(String(lesson.id), cid)
  }

  const pairSeen = new Set<string>()
  const counts = new Map<string, number>()
  for (const row of rows) {
    const cid = lessonToCourse.get(row.lessonId)
    if (!cid) continue
    const key = `${row.userId}:${cid}`
    if (pairSeen.has(key)) continue
    pairSeen.add(key)
    counts.set(cid, (counts.get(cid) ?? 0) + 1)
  }

  const courseIds = [...counts.keys()]
  if (courseIds.length === 0) {
    return extendPopularCourseIdsToLimit(payload, [], POPULAR_COURSE_LIMIT)
  }

  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: {
      id: { in: courseIds },
      isPublished: { equals: true },
    },
    limit: courseIds.length,
    depth: 0,
  })

  const meta = new Map(
    courses.map((c) => {
      const id = String(c.id)
      const createdRaw = (c as { createdAt?: string }).createdAt
      const createdAt = createdRaw ? new Date(createdRaw).getTime() : 0
      const title = String((c as { title?: string }).title ?? '')
      return [id, { createdAt, title }] as const
    }),
  )

  const engagementOrdered = courseIds
    .filter((id) => meta.has(id))
    .sort((a, b) => {
      const diff = (counts.get(b) ?? 0) - (counts.get(a) ?? 0)
      if (diff !== 0) return diff
      const ma = meta.get(a)!
      const mb = meta.get(b)!
      if (mb.createdAt !== ma.createdAt) return mb.createdAt - ma.createdAt
      return ma.title.localeCompare(mb.title)
    })
    .slice(0, POPULAR_COURSE_LIMIT)

  return extendPopularCourseIdsToLimit(payload, engagementOrdered, POPULAR_COURSE_LIMIT)
}

const getPopularCourseIdsCached = unstable_cache(
  async () => computePopularCourseIds(),
  ['popular-course-ids-v2'],
  { revalidate: 120 },
)

/**
 * Up to five published course ids for the dashboard strip: ranked by distinct learners
 * (users with any IN_PROGRESS or COMPLETED lesson in that course), then padded with
 * newest published courses if fewer than five have engagement data. Cached ~2 minutes.
 */
export async function getPopularCourseIds(): Promise<string[]> {
  return getPopularCourseIdsCached()
}

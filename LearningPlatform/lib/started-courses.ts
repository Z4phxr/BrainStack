import type { Payload } from 'payload'
import { prisma } from '@/lib/prisma'

function courseIdFromLessonField(lesson: { id: string | number; course: unknown }): string | null {
  const c = lesson.course
  if (c && typeof c === 'object' && 'id' in c) {
    return String((c as { id: string }).id)
  }
  if (typeof c === 'string' || typeof c === 'number') {
    return String(c)
  }
  return null
}

/**
 * Course IDs the user has started: at least one published lesson in that course
 * with lesson progress IN_PROGRESS or COMPLETED. Ordered by most recent lesson activity.
 */
export async function getOrderedStartedCourseIds(userId: string, payload: Payload): Promise<string[]> {
  const progressRows = await prisma.lessonProgress.findMany({
    where: {
      userId,
      status: { in: ['IN_PROGRESS', 'COMPLETED'] },
    },
    select: { lessonId: true, lastViewedAt: true },
  })
  if (progressRows.length === 0) return []

  const lessonIds = [...new Set(progressRows.map((r) => r.lessonId))]

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
    const cid = courseIdFromLessonField(lesson as { id: string | number; course: unknown })
    if (cid) lessonToCourse.set(String(lesson.id), cid)
  }

  const courseLast = new Map<string, number>()
  for (const row of progressRows) {
    const courseId = lessonToCourse.get(row.lessonId)
    if (!courseId) continue
    const t = row.lastViewedAt.getTime()
    const prev = courseLast.get(courseId) ?? 0
    if (t > prev) courseLast.set(courseId, t)
  }

  const courseIds = [...courseLast.keys()]
  if (courseIds.length === 0) return []

  const { docs: publishedCourses } = await payload.find({
    collection: 'courses',
    where: {
      id: { in: courseIds },
      isPublished: { equals: true },
    },
    limit: courseIds.length,
    depth: 0,
  })
  const publishedSet = new Set(publishedCourses.map((c) => String(c.id)))

  return courseIds
    .filter((id) => publishedSet.has(id))
    .sort((a, b) => (courseLast.get(b)! - courseLast.get(a)!))
}

export async function fetchPublishedCoursesByIdsInOrder(
  payload: Payload,
  orderedIds: string[],
  depth: number,
): Promise<unknown[]> {
  if (orderedIds.length === 0) return []
  const { docs } = await payload.find({
    collection: 'courses',
    where: {
      id: { in: orderedIds },
      isPublished: { equals: true },
    },
    limit: orderedIds.length,
    depth,
  })
  const byId = new Map(docs.map((c) => [String(c.id), c]))
  return orderedIds.map((id) => byId.get(id)).filter(Boolean)
}

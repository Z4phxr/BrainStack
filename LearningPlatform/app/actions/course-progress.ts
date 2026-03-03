'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { getPayload } from 'payload'
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

  const allProgress = await prisma.courseProgress.findMany({
    where: { userId: session.user.id },
    orderBy: { lastActivityAt: 'desc' },
  })

  return allProgress
}

/**
 * Recalculate and persist course progress for a user.
 * Exported so lesson-progress.ts and submit-task.ts can invoke it.
 */
export async function recalculateCourseProgress(userId: string, courseId: string) {
  const payload = await getPayload({ config })

  // Get all published lessons for this course
  const { docs: allLessons } = await payload.find({
    collection: 'lessons',
    where: {
      course: { equals: courseId },
      isPublished: { equals: true },
    },
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

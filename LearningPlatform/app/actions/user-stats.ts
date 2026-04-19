'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import type { Payload } from 'payload'
import { getOrderedStartedCourseIds } from '@/lib/started-courses'

/**
 * Get aggregate learning stats for the current user (for dashboard widgets).
 * Pass the same Payload instance the caller uses so started courses are resolved in one pass.
 */
export async function getUserStats(payload: Payload) {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const [completedLessonsCount, totalPointsEarned, startedCourseIds] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId: session.user.id, status: 'COMPLETED' },
    }),
    prisma.taskProgress.aggregate({
      where: { userId: session.user.id },
      _sum: { earnedPoints: true },
    }),
    getOrderedStartedCourseIds(session.user.id, payload),
  ])

  return {
    completedLessons: completedLessonsCount,
    totalPoints: totalPointsEarned._sum.earnedPoints || 0,
    activeCourses: startedCourseIds.length,
    startedCourseIds,
  }
}

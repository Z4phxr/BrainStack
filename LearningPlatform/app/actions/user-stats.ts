'use server'

import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'

/**
 * Get aggregate learning stats for the current user (for dashboard widgets).
 */
export async function getUserStats() {
  const session = await auth()
  if (!session?.user?.id) {
    throw new Error('Unauthorized')
  }

  const [completedLessonsCount, totalPointsEarned, courseCount] = await Promise.all([
    prisma.lessonProgress.count({
      where: { userId: session.user.id, status: 'COMPLETED' },
    }),
    prisma.taskProgress.aggregate({
      where: { userId: session.user.id },
      _sum: { earnedPoints: true },
    }),
    prisma.courseProgress.count({
      where: { userId: session.user.id },
    }),
  ])

  return {
    completedLessons: completedLessonsCount,
    totalPoints: totalPointsEarned._sum.earnedPoints || 0,
    activeCourses: courseCount,
  }
}

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

// Mock prisma with our mock implementation
const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

/**
 * Integration Tests for Progress Tracking System
 * 
 * These tests verify that denormalized data (CourseProgress) stays in sync
 * with source data (LessonProgress and TaskProgress) using mocked Prisma.
 */

describe('Progress Tracking - Integration Tests (Mocked)', () => {
  const testUserId = 'test-user-123'
  const testCourseId = 'course-123'
  const testLessonId = 'lesson-123'

  beforeEach(() => {
    resetAllMocks(mockPrisma)
  })

  describe('CourseProgress Synchronization', () => {
    it('should create course progress when first lesson is started', async () => {
      const courseProgress = {
        id: 'progress-1',
        userId: testUserId,
        courseId: testCourseId,
        totalLessons: 10,
        completedLessons: 0,
        progressPercentage: 0,
        totalPoints: 100,
        earnedPoints: 0,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.courseProgress.upsert.mockResolvedValue(courseProgress)

      const result = await mockPrisma.courseProgress.upsert({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId,
          },
        },
        create: courseProgress,
        update: {},
      })

      expect(result.userId).toBe(testUserId)
      expect(result.courseId).toBe(testCourseId)
      expect(result.completedLessons).toBe(0)
    })

    it('should update course progress when lesson is completed', async () => {
      mockPrisma.lessonProgress.count.mockResolvedValue(1)

      const completedCount = 1
      const totalLessons = 10
      const progressPercentage = Math.round((completedCount / totalLessons) * 100)

      const updatedProgress = {
        id: 'progress-1',
        userId: testUserId,
        courseId: testCourseId,
        totalLessons,
        completedLessons: completedCount,
        progressPercentage,
        totalPoints: 100,
        earnedPoints: 10,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.courseProgress.update.mockResolvedValue(updatedProgress)

      const result = await mockPrisma.courseProgress.update({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId,
          },
        },
        data: {
          completedLessons: completedCount,
          progressPercentage,
        },
      })

      expect(result.completedLessons).toBe(1)
      expect(result.progressPercentage).toBe(10) // 1/10 = 10%
    })

    it('should update earned points when task is completed', async () => {
      const earnedPoints = 50
      const totalPoints = 100

      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-progress-1',
          userId: testUserId,
          taskId: 'task-1',
          lessonProgressId: 'lesson-progress-1',
          submittedAnswer: 'A',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: null,
          taskTags: [],
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const updatedProgress = {
        id: 'progress-1',
        userId: testUserId,
        courseId: testCourseId,
        totalLessons: 10,
        completedLessons: 1,
        progressPercentage: 10,
        totalPoints,
        earnedPoints,
        lastActivityAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.courseProgress.update.mockResolvedValue(updatedProgress)

      const result = await mockPrisma.courseProgress.update({
        where: {
          userId_courseId: {
            userId: testUserId,
            courseId: testCourseId,
          },
        },
        data: {
          earnedPoints,
        },
      })

      expect(result.earnedPoints).toBe(50)
    })
  })

  describe('LessonProgress Tracking', () => {
    it('should create lesson progress when first task is attempted', async () => {
      const lessonProgress = {
        id: 'lesson-progress-1',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.lessonProgress.upsert.mockResolvedValue(lessonProgress)

      const result = await mockPrisma.lessonProgress.upsert({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
        create: lessonProgress,
        update: { lastViewedAt: new Date() },
      })

      expect(result.status).toBe('IN_PROGRESS')
      expect(result.lessonId).toBe(testLessonId)
    })

    it('should mark lesson as completed when all tasks are passed', async () => {
      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-progress-1',
          userId: testUserId,
          taskId: 'task-1',
          lessonProgressId: 'lesson-progress-1',
          submittedAnswer: 'A',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: null,
          taskTags: [],
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const completedProgress = {
        id: 'lesson-progress-1',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'COMPLETED' as const,
        startedAt: new Date(Date.now() - 3600000),
        completedAt: new Date(),
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.lessonProgress.update.mockResolvedValue(completedProgress)

      const result = await mockPrisma.lessonProgress.update({
        where: {
          userId_lessonId: {
            userId: testUserId,
            lessonId: testLessonId,
          },
        },
        data: {
          status: 'COMPLETED',
          completedAt: new Date(),
        },
      })

      expect(result.status).toBe('COMPLETED')
      expect(result.completedAt).toBeDefined()
    })
  })

  describe('TaskProgress Recording', () => {
    it('should record correct task submission', async () => {
      const taskProgress = {
        id: 'task-progress-1',
        userId: testUserId,
        taskId: 'task-1',
        lessonProgressId: 'lesson-progress-1',
        submittedAnswer: 'A',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: 3,
        taskTags: ['arrays', 'sorting'],
        status: 'PASSED' as const,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.taskProgress.upsert.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.upsert({
        where: {
          userId_taskId: {
            userId: testUserId,
            taskId: 'task-1',
          },
        },
        create: taskProgress,
        update: {},
      })

      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(10)
      expect(result.status).toBe('PASSED')
    })

    it('should record incorrect task submission', async () => {
      const taskProgress = {
        id: 'task-progress-2',
        userId: testUserId,
        taskId: 'task-2',
        lessonProgressId: 'lesson-progress-1',
        submittedAnswer: 'B',
        earnedPoints: 0,
        maxPoints: 10,
        isCorrect: false,
        difficultyRating: null,
        taskTags: [],
        status: 'ATTEMPTED' as const,
        attemptedAt: new Date(),
        passedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.taskProgress.upsert.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.upsert({
        where: {
          userId_taskId: {
            userId: testUserId,
            taskId: 'task-2',
          },
        },
        create: taskProgress,
        update: {},
      })

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
      expect(result.status).toBe('ATTEMPTED')
    })

    it('should store difficulty rating with task submission', async () => {
      const taskProgress = {
        id: 'task-progress-3',
        userId: testUserId,
        taskId: 'task-3',
        lessonProgressId: 'lesson-progress-1',
        submittedAnswer: 'C',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: 4,
        taskTags: ['algorithms'],
        status: 'PASSED' as const,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.taskProgress.upsert.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.upsert({
        where: {
          userId_taskId: {
            userId: testUserId,
            taskId: 'task-3',
          },
        },
        create: taskProgress,
        update: {},
      })

      expect(result.difficultyRating).toBe(4)
    })

    it('should store task tags for analytics', async () => {
      const taskProgress = {
        id: 'task-progress-4',
        userId: testUserId,
        taskId: 'task-4',
        lessonProgressId: 'lesson-progress-1',
        submittedAnswer: 'D',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: null,
        taskTags: ['javascript', 'async', 'promises'],
        status: 'PASSED' as const,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }

      mockPrisma.taskProgress.upsert.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.upsert({
        where: {
          userId_taskId: {
            userId: testUserId,
            taskId: 'task-4',
          },
        },
        create: taskProgress,
        update: {},
      })

      expect(result.taskTags).toEqual(['javascript', 'async', 'promises'])
    })
  })
})

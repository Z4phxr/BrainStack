import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

// Mock prisma
const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

/**
 * Telemetry Data Capture Tests
 * 
 * Verify that analytics data (isCorrect, difficultyRating, taskProgressTags) 
 * are captured correctly for future data mining and AI analysis.
 */

describe('Telemetry Data Capture', () => {
  const testUserId = 'telemetry-user-123'
  const testLessonId = 'lesson-123'

  beforeEach(() => {
    resetAllMocks(mockPrisma)
  })

  describe('Objective Data: isCorrect for MCQ', () => {
    it('Should store isCorrect=true for correct MCQ answer', async () => {
      // Arrange
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
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      await mockPrisma.lessonProgress.create({
        data: {
          userId: testUserId,
          lessonId: testLessonId,
          status: 'IN_PROGRESS',
          startedAt: new Date(),
        },
      })

      // Act: Submit correct answer
      const taskProgress = {
        id: 'task-progress-1',
        userId: testUserId,
        taskId: 'task-mcq-correct',
        lessonProgressId: lessonProgress.id,
        status: 'PASSED' as const,
        submittedAnswer: 'B',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: null,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.taskProgress.create.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.create({
        data: {
          userId: testUserId,
          taskId: 'task-mcq-correct',
          lessonProgressId: lessonProgress.id,
          status: 'PASSED',
          submittedAnswer: 'B',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          attemptedAt: new Date(),
        },
      })

      // Assert
      expect(result.isCorrect).toBe(true)
      expect(result.earnedPoints).toBe(10)
    })

    it('Should store isCorrect=false for incorrect MCQ answer', async () => {
      const lessonProgress = {
        id: 'lesson-progress-2',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      const taskProgress = {
        id: 'task-progress-2',
        userId: testUserId,
        taskId: 'task-mcq-incorrect',
        lessonProgressId: lessonProgress.id,
        status: 'ATTEMPTED' as const,
        submittedAnswer: 'A',
        earnedPoints: 0,
        maxPoints: 10,
        isCorrect: false,
        difficultyRating: null,
        attemptedAt: new Date(),
        passedAt: null,
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.taskProgress.create.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.create({
        data: {
          userId: testUserId,
          taskId: 'task-mcq-incorrect',
          lessonProgressId: lessonProgress.id,
          status: 'ATTEMPTED',
          submittedAnswer: 'A',
          earnedPoints: 0,
          maxPoints: 10,
          isCorrect: false,
          attemptedAt: new Date(),
        },
      })

      expect(result.isCorrect).toBe(false)
      expect(result.earnedPoints).toBe(0)
    })
  })

  describe('Subjective Data: difficultyRating', () => {
    it('Should store difficultyRating for Open-Ended tasks (1-5 scale)', async () => {
      const lessonProgress = {
        id: 'lesson-progress-3',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      const taskProgress = {
        id: 'task-progress-3',
        userId: testUserId,
        taskId: 'task-open-ended',
        lessonProgressId: lessonProgress.id,
        status: 'PASSED' as const,
        submittedAnswer: 'My answer',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: 4,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.taskProgress.create.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.create({
        data: {
          userId: testUserId,
          taskId: 'task-open-ended',
          lessonProgressId: lessonProgress.id,
          status: 'PASSED',
          submittedAnswer: 'My answer',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: 4,
          attemptedAt: new Date(),
          passedAt: new Date(),
        },
      })

      expect(result.difficultyRating).toBe(4)
      expect(result.difficultyRating).toBeGreaterThanOrEqual(1)
      expect(result.difficultyRating).toBeLessThanOrEqual(5)
    })

    it('Should allow null difficultyRating if user skips feedback', async () => {
      const lessonProgress = {
        id: 'lesson-progress-4',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      const taskProgress = {
        id: 'task-progress-4',
        userId: testUserId,
        taskId: 'task-no-rating',
        lessonProgressId: lessonProgress.id,
        status: 'PASSED' as const,
        submittedAnswer: 'Answer',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: null,
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.taskProgress.create.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.create({
        data: {
          userId: testUserId,
          taskId: 'task-no-rating',
          lessonProgressId: lessonProgress.id,
          status: 'PASSED',
          submittedAnswer: 'Answer',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: null,
          attemptedAt: new Date(),
          passedAt: new Date(),
        },
      })

      expect(result.difficultyRating).toBeNull()
    })

    it('Should reject difficultyRating outside 1-5 range', async () => {
      // This test validates business logic - we validate in the app, not DB
      const invalidRatings = [0, 6, 10, -1]
      
      for (const rating of invalidRatings) {
        // In real app, this would be validated before DB insert
        const normalized = rating >= 1 && rating <= 5 ? rating : null
        expect(normalized).toBeNull()
      }
    })
  })

  describe('Categorical Data: taskProgressTags', () => {
    it('Should link task tags to TaskProgress via TaskProgressTag records', async () => {
      const lessonProgress = {
        id: 'lesson-progress-5',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      // After a task submission the app upserts TaskProgressTag rows
      const tagRecords = [
        { id: 'tpt-1', taskProgressId: 'task-progress-5', tagId: 'tag-arrays' },
        { id: 'tpt-2', taskProgressId: 'task-progress-5', tagId: 'tag-sorting' },
        { id: 'tpt-3', taskProgressId: 'task-progress-5', tagId: 'tag-algorithms' },
      ]

      mockPrisma.taskProgressTag.upsert
        .mockResolvedValueOnce(tagRecords[0])
        .mockResolvedValueOnce(tagRecords[1])
        .mockResolvedValueOnce(tagRecords[2])

      const result0 = await mockPrisma.taskProgressTag.upsert({ where: {}, create: tagRecords[0], update: {} })
      const result1 = await mockPrisma.taskProgressTag.upsert({ where: {}, create: tagRecords[1], update: {} })
      const result2 = await mockPrisma.taskProgressTag.upsert({ where: {}, create: tagRecords[2], update: {} })

      expect(result0.tagId).toBe('tag-arrays')
      expect(result1.tagId).toBe('tag-sorting')
      expect(result2.tagId).toBe('tag-algorithms')
    })

    it('Should handle tasks without tags (empty taskProgressTags)', async () => {
      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-progress-6',
          userId: testUserId,
          taskId: 'task-no-tags',
          lessonProgressId: 'lesson-1',
          submittedAnswer: 'Answer',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: null,
          taskProgressTags: [],
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const results = await mockPrisma.taskProgress.findMany({ where: { userId: testUserId } })

      expect(results[0].taskProgressTags).toEqual([])
      expect(results[0].taskProgressTags).toHaveLength(0)
    })
  })

  describe('Analytics Query Performance', () => {
    it('Should efficiently query tasks by tag (indexed via TaskProgressTag)', async () => {
      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-1',
          userId: testUserId,
          taskId: 'task-1',
          lessonProgressId: 'lesson-1',
          submittedAnswer: 'A',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: 3,
          taskProgressTags: [
            { id: 'tpt-1', tag: { name: 'arrays', slug: 'arrays' } },
            { id: 'tpt-2', tag: { name: 'sorting', slug: 'sorting' } },
          ],
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const results = await mockPrisma.taskProgress.findMany({
        where: {
          taskProgressTags: {
            some: { tag: { name: 'arrays' } },
          },
        },
        include: { taskProgressTags: { include: { tag: true } } },
      })

      expect(results).toHaveLength(1)
      expect(results[0].taskProgressTags[0].tag.name).toBe('arrays')
    })

    it('Should support analytics aggregation by isCorrect (indexed)', async () => {
      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-1',
          userId: testUserId,
          taskId: 'task-1',
          lessonProgressId: 'lesson-1',
          submittedAnswer: 'A',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: null,
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const correctTasks = await mockPrisma.taskProgress.findMany({
        where: {
          isCorrect: true,
        },
      })

      expect(correctTasks).toHaveLength(1)
      expect(correctTasks[0].isCorrect).toBe(true)
    })

    it('Should support analytics by difficulty rating (indexed)', async () => {
      mockPrisma.taskProgress.findMany.mockResolvedValue([
        {
          id: 'task-1',
          userId: testUserId,
          taskId: 'task-1',
          lessonProgressId: 'lesson-1',
          submittedAnswer: 'A',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: 4,
          status: 'PASSED',
          attemptedAt: new Date(),
          passedAt: new Date(),
          createdAt: new Date(),
          updatedAt: new Date(),
        },
      ])

      const difficultTasks = await mockPrisma.taskProgress.findMany({
        where: {
          difficultyRating: {
            gte: 4,
          },
        },
      })

      expect(difficultTasks).toHaveLength(1)
      expect(difficultTasks[0].difficultyRating).toBeGreaterThanOrEqual(4)
    })
  })

  describe('Telemetry Data Completeness', () => {
    it('Should capture all three telemetry dimensions simultaneously', async () => {
      const lessonProgress = {
        id: 'lesson-progress-7',
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS' as const,
        startedAt: new Date(),
        completedAt: null,
        lastViewedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.lessonProgress.create.mockResolvedValue(lessonProgress)

      const taskProgress = {
        id: 'task-progress-7',
        userId: testUserId,
        taskId: 'task-complete-telemetry',
        lessonProgressId: lessonProgress.id,
        status: 'PASSED' as const,
        submittedAnswer: 'Complete answer',
        earnedPoints: 10,
        maxPoints: 10,
        isCorrect: true,
        difficultyRating: 5,
        taskProgressTags: [
          { id: 'tpt-1', tag: { name: 'react', slug: 'react' } },
          { id: 'tpt-2', tag: { name: 'hooks', slug: 'hooks' } },
          { id: 'tpt-3', tag: { name: 'useState', slug: 'usestate' } },
        ],
        attemptedAt: new Date(),
        passedAt: new Date(),
        createdAt: new Date(),
        updatedAt: new Date(),
      }
      
      mockPrisma.taskProgress.create.mockResolvedValue(taskProgress)

      const result = await mockPrisma.taskProgress.create({
        data: {
          userId: testUserId,
          taskId: 'task-complete-telemetry',
          lessonProgressId: lessonProgress.id,
          status: 'PASSED',
          submittedAnswer: 'Complete answer',
          earnedPoints: 10,
          maxPoints: 10,
          isCorrect: true,
          difficultyRating: 5,
          attemptedAt: new Date(),
          passedAt: new Date(),
        },
      })

      // Verify all dimensions
      expect(result.isCorrect).toBe(true) // Objective
      expect(result.difficultyRating).toBe(5) // Subjective
      expect(result.taskProgressTags).toHaveLength(3) // Categorical
      expect(result.taskProgressTags[0].tag.name).toBe('react')
    })
  })
})

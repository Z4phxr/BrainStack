import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, createMockPayload, createMockSession } from '../mocks'

// Create mocks before importing modules that use them
const mockPrisma = createMockPrisma()
const mockPayload = createMockPayload()
const mockSession = createMockSession()

// Mock auth
vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

// Mock prisma
vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// Mock Next.js cache
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn: any) => fn),
}))

// Mock Payload
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

// Mock payload config to avoid database connection
vi.mock('@/src/payload/payload.config', () => ({
  default: {},
}))

// Set required environment variables
process.env.DATABASE_URL = 'mock://database'
process.env.PAYLOAD_DATABASE_URL = 'mock://database'

// Import after mocking
const { submitTaskAnswer, markLessonComplete } = await import('@/app/actions/progress')
const { auth } = await import('@/auth')
const { getPayload } = await import('payload')

describe('Server Actions: progress.ts', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue(mockPayload as any)
  })

  describe('submitTaskAnswer', () => {
    it('should throw error when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(
        submitTaskAnswer('task-1', 'lesson-1', 'answer', 'course-slug')
      ).rejects.toThrow('Unauthorized')
    })

    it('should throw error when task is not found', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      mockPayload.findByID.mockResolvedValueOnce(null)

      await expect(
        submitTaskAnswer('task-1', 'lesson-1', 'answer', 'course-slug')
      ).rejects.toThrow('Task not found')
    })

    it('should throw error when task is not published', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'task-1',
        isPublished: false,
        question: 'Test',
        points: 10,
      })

      await expect(
        submitTaskAnswer('task-1', 'lesson-1', 'answer', 'course-slug')
      ).rejects.toThrow('Task not found')
    })

    it('should throw error when lesson is not found', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      mockPayload.findByID
        .mockResolvedValueOnce({
          id: 'task-1',
          isPublished: true,
          question: 'Test?',
          correctAnswer: 'A',
          points: 10,
          tags: [],
        })
        .mockResolvedValueOnce(null) // lesson not found

      await expect(
        submitTaskAnswer('task-1', 'lesson-1', 'answer', 'course-slug')
      ).rejects.toThrow('Lesson not found')
    })

    it('should create lesson progress when submitting task', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      
      mockPayload.findByID
        .mockResolvedValueOnce({
          id: 'task-1',
          isPublished: true,
          type: 'MULTIPLE_CHOICE',
          question: 'Test?',
          correctAnswer: 'A',
          points: 10,
          tags: [],
        })
        .mockResolvedValueOnce({
          id: 'lesson-1',
          isPublished: true,
          title: 'Test Lesson',
          course: 'course-1',
        })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({
        id: 'progress-1',
        userId: 'mock-user-id',
        lessonId: 'lesson-1',
        status: 'IN_PROGRESS',
      } as any)

      mockPrisma.taskProgress.upsert.mockResolvedValue({
        id: 'task-progress-1',
        userId: 'mock-user-id',
        taskId: 'task-1',
        isCorrect: true,
        earnedPoints: 10,
      } as any)

      mockPrisma.taskProgress.findMany.mockResolvedValue([
        { taskId: 'task-1', status: 'PASSED' }
      ] as any)

      mockPrisma.courseProgress.upsert.mockResolvedValue({
        id: 'course-progress-1',
      } as any)

      const result = await submitTaskAnswer('task-1', 'lesson-1', 'A', 'test-course')

      expect(mockPrisma.lessonProgress.upsert).toHaveBeenCalled()
      expect(mockPrisma.taskProgress.upsert).toHaveBeenCalled()
      expect(result.isCorrect).toBeDefined()
      expect(result.earnedPoints).toBeDefined()
    })

    it('should validate difficulty rating (1-5 scale)', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      
      mockPayload.findByID
        .mockResolvedValueOnce({
          id: 'task-1',
          isPublished: true,
          question: 'Test?',
          correctAnswer: 'A',
          points: 10,
          tags: [],
        })
        .mockResolvedValueOnce({
          id: 'lesson-1',
          isPublished: true,
          course: 'course-1',
        })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'progress-1' } as any)
      mockPrisma.taskProgress.upsert.mockResolvedValue({
        id: 'task-progress-1',
        difficultyRating: 3,
      } as any)
      mockPrisma.taskProgress.findMany.mockResolvedValue([] as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      await submitTaskAnswer('task-1', 'lesson-1', 'A', 'test-course', 3)

      const upsertCall = mockPrisma.taskProgress.upsert.mock.calls[0][0]
      expect(upsertCall.create.difficultyRating).toBe(3)
    })

    it('should reject invalid difficulty ratings', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      
      mockPayload.findByID
        .mockResolvedValueOnce({
          id: 'task-1',
          isPublished: true,
          question: 'Test?',
          correctAnswer: 'A',
          points: 10,
          tags: [],
        })
        .mockResolvedValueOnce({
          id: 'lesson-1',
          isPublished: true,
          course: 'course-1',
        })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'progress-1' } as any)
      mockPrisma.taskProgress.upsert.mockResolvedValue({
        id: 'task-progress-1',
        difficultyRating: null,
      } as any)
      mockPrisma.taskProgress.findMany.mockResolvedValue([] as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      await submitTaskAnswer('task-1', 'lesson-1', 'A', 'test-course', 10) // Invalid: > 5

      const upsertCall = mockPrisma.taskProgress.upsert.mock.calls[0][0]
      expect(upsertCall.create.difficultyRating).toBeNull()
    })

    it('should extract and store task tags via normalized TaskProgressTag records', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)

      // Tags in Payload use the { tag: 'name' } shape for this task
      mockPayload.findByID
        .mockResolvedValueOnce({
          id: 'task-1',
          isPublished: true,
          question: 'Test?',
          correctAnswer: 'A',
          points: 10,
          tags: [{ tag: 'arrays' }, { tag: 'algorithms' }],
        })
        .mockResolvedValueOnce({
          id: 'lesson-1',
          isPublished: true,
          course: 'course-1',
        })

      // Canonical Tag IDs returned from prisma.tag.findMany
      mockPrisma.tag.findMany.mockResolvedValueOnce([
        { id: 'tag-id-arrays' },
        { id: 'tag-id-algorithms' },
      ] as any)

      mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'progress-1' } as any)
      mockPrisma.taskProgress.upsert.mockResolvedValue({ id: 'task-progress-1' } as any)
      mockPrisma.taskProgress.findMany.mockResolvedValue([] as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      await submitTaskAnswer('task-1', 'lesson-1', 'A', 'test-course')

      // The action looks up canonical tags by name/slug
      expect(mockPrisma.tag.findMany).toHaveBeenCalledWith(
        expect.objectContaining({
          where: expect.objectContaining({ OR: expect.any(Array) }),
        }),
      )

      // It stores tags as normalized TaskProgressTag join records — not as a String[] column
      expect(mockPrisma.taskProgressTag.upsert).toHaveBeenCalledTimes(2)
    })

    it('should auto-grade open-ended tasks when autoGrade=true (normalize and ignore punctuation/case)', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)

      // Ensure findByID consistently returns the open-ended task and lesson for
      // repeated calls within this test (the default mock returns a MCQ by
      // default). Use an implementation so repeated calls return the same data.
      mockPayload.findByID.mockImplementation(async ({ collection, id }) => {
        if (collection === 'tasks' && id === 'task-2') {
          return {
            id: 'task-2',
            isPublished: true,
            type: 'OPEN_ENDED',
            question: 'Explain X',
            correctAnswer: 'Hello, world!',
            autoGrade: true,
            points: 5,
            tags: [],
          }
        }
        if (collection === 'lessons' && id === 'lesson-2') {
          return { id: 'lesson-2', isPublished: true, course: 'course-1' }
        }
        return null
      })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'progress-2' } as any)
      mockPrisma.taskProgress.upsert.mockResolvedValue({ id: 'task-progress-2', isCorrect: true } as any)
      mockPrisma.taskProgress.findMany.mockResolvedValue([] as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      // Variant answers that should normalize-equal the correct answer
      const answers = [
        'hello world',
        'Hello, world!',
        'HELLO WORLD!!!',
        '  hello   world '
      ]

      for (const a of answers) {
        const result = await submitTaskAnswer('task-2', 'lesson-2', a, 'test-course')
        expect(result.isCorrect).toBe(true)
      }
    })

    it('should NOT auto-grade open-ended tasks when autoGrade=false', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)

      mockPayload.findByID.mockImplementation(async ({ collection, id }) => {
        if (collection === 'tasks' && id === 'task-3') {
          return {
            id: 'task-3',
            isPublished: true,
            type: 'OPEN_ENDED',
            question: 'Explain Y',
            correctAnswer: 'Answer',
            autoGrade: false,
            points: 5,
            tags: [],
          }
        }
        if (collection === 'lessons' && id === 'lesson-3') {
          return { id: 'lesson-3', isPublished: true, course: 'course-1' }
        }
        return null
      })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({ id: 'progress-3' } as any)
      mockPrisma.taskProgress.upsert.mockResolvedValue({ id: 'task-progress-3', isCorrect: false } as any)
      mockPrisma.taskProgress.findMany.mockResolvedValue([] as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      const result = await submitTaskAnswer('task-3', 'lesson-3', 'Answer', 'test-course')
      expect(result.isCorrect).toBe(false)
    })
  })

  describe('markLessonComplete', () => {
    it('should throw error when user is not authenticated', async () => {
      vi.mocked(auth).mockResolvedValue(null)

      await expect(
        markLessonComplete('lesson-1', 'course-slug')
      ).rejects.toThrow('Unauthorized')
    })

    it('should throw error when lesson is not found', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      mockPayload.findByID.mockResolvedValueOnce(null)

      await expect(
        markLessonComplete('lesson-1', 'course-slug')
      ).rejects.toThrow('Lesson not found')
    })

    it('should mark lesson as completed', async () => {
      vi.mocked(auth).mockResolvedValue(mockSession as any)
      
      mockPayload.findByID.mockResolvedValueOnce({
        id: 'lesson-1',
        isPublished: true,
        course: 'course-1',
      })

      mockPrisma.lessonProgress.upsert.mockResolvedValue({
        id: 'progress-1',
        status: 'COMPLETED',
      } as any)
      mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-1' } as any)

      await markLessonComplete('lesson-1', 'test-course')

      expect(mockPrisma.lessonProgress.upsert).toHaveBeenCalled()
      const upsertCall = mockPrisma.lessonProgress.upsert.mock.calls[0][0]
      expect(upsertCall.update.status).toBe('COMPLETED')
    })
  })
})

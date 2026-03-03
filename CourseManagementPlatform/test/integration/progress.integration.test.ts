import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, createMockPayload, createMockSession } from '../mocks'

// Create mocks
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

// Mock Next.js cache and revalidate
vi.mock('next/cache', () => ({
  revalidatePath: vi.fn(),
  unstable_cache: vi.fn((fn: any) => fn),
}))

// Mock Payload
vi.mock('payload', () => ({
  getPayload: vi.fn(),
}))

// Mock payload config
vi.mock('@/src/payload/payload.config', () => ({ default: {} }))

process.env.DATABASE_URL = 'mock://database'
process.env.PAYLOAD_DATABASE_URL = 'mock://database'

const { submitTaskAnswer } = await import('@/app/actions/progress')
const { auth } = await import('@/auth')
const { getPayload } = await import('payload')

describe('Integration: course progress flow', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    vi.mocked(getPayload).mockResolvedValue(mockPayload as any)
    vi.mocked(auth).mockResolvedValue(mockSession as any)
  })

  it('marks lessons completed and updates course progress when all tasks are submitted', async () => {
    // Prepare payload.findByID to return task then lesson for each submit
    // For first submit: task-1 then lesson-1
    // For second submit: task-2 then lesson-2
    const findByID = vi.fn()
      .mockImplementationOnce(async ({ collection, id }: any) => ({
        id: 'task-1', isPublished: true, type: 'MULTIPLE_CHOICE', correctAnswer: 'A', points: 5, tags: [],
      }))
      .mockImplementationOnce(async ({ collection, id }: any) => ({
        id: 'lesson-1', isPublished: true, course: 'course-1', title: 'L1'
      }))
      .mockImplementationOnce(async ({ collection, id }: any) => ({
        id: 'task-2', isPublished: true, type: 'MULTIPLE_CHOICE', correctAnswer: 'B', points: 5, tags: [],
      }))
      .mockImplementationOnce(async ({ collection, id }: any) => ({
        id: 'lesson-2', isPublished: true, course: 'course-1', title: 'L2'
      }))

    // Mock find to return all published lessons and tasks when recalc runs
    const find = vi.fn(async ({ collection, where }: any) => {
      if (collection === 'lessons') {
        return { docs: [ { id: 'lesson-1', isPublished: true }, { id: 'lesson-2', isPublished: true } ] }
      }
      if (collection === 'tasks') {
        return { docs: [ { id: 'task-1', points: 5 }, { id: 'task-2', points: 5 } ] }
      }
      return { docs: [] }
    })

    mockPayload.findByID = findByID as any
    mockPayload.find = find as any

    // Prisma behavior: upserts succeed; taskProgress.count should count submissions per lesson
    // First call to taskProgress.count (for lesson-1) return 1, second for lesson-2 return 1
    mockPrisma.taskProgress.count
      .mockResolvedValueOnce(1)
      .mockResolvedValueOnce(1)

    // lessonProgress.count used in recalc should return 2 after both completes
    mockPrisma.lessonProgress.count.mockResolvedValue(2)

    // courseProgress.upsert spy
    mockPrisma.courseProgress.upsert.mockResolvedValue({ id: 'course-progress-1' } as any)

    // Submit first task (correct answer 'A')
    await submitTaskAnswer('task-1', 'lesson-1', 'A', 'course-slug')

    // Submit second task (correct answer 'B')
    await submitTaskAnswer('task-2', 'lesson-2', 'B', 'course-slug')

    // After two submissions, recalc should have upserted courseProgress at least once
    expect(mockPrisma.courseProgress.upsert).toHaveBeenCalled()

    // Inspect last upsert call to ensure completedLessons = 2 and progressPercentage computed
    const lastUpsert = mockPrisma.courseProgress.upsert.mock.calls.slice(-1)[0][0]
    expect(lastUpsert.create.completedLessons === 2 || lastUpsert.update.completedLessons === 2).toBeTruthy()
    // progressPercentage should be 100 when 2/2 lessons completed
    const percent = lastUpsert.create?.progressPercentage ?? lastUpsert.update?.progressPercentage
    expect(percent === 100 || percent === 100.0).toBeTruthy()
  })
})

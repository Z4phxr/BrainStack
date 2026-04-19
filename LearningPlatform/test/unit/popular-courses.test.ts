import { describe, it, expect, vi, beforeEach } from 'vitest'

vi.mock('@/auth', () => ({
  auth: vi.fn(),
}))

vi.mock('next/cache', () => ({
  unstable_cache: (fn: () => Promise<unknown>) => fn,
}))

const mockFindMany = vi.fn()
vi.mock('@/lib/prisma', () => ({
  prisma: {
    lessonProgress: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

const mockGetPayload = vi.fn()
vi.mock('payload', () => ({
  getPayload: (...args: unknown[]) => mockGetPayload(...args),
}))

vi.mock('@payload-config', () => ({ default: {} }))

import { getPopularCourseIds } from '@/app/actions/course-progress'

describe('getPopularCourseIds', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('fills from newest published courses when there is no engagement yet', async () => {
    mockFindMany.mockResolvedValueOnce([])
    const mockFind = vi.fn().mockResolvedValueOnce({
      docs: [
        { id: 'new-1', createdAt: '2026-06-01T00:00:00.000Z' },
        { id: 'new-2', createdAt: '2026-05-01T00:00:00.000Z' },
        { id: 'new-3', createdAt: '2026-04-01T00:00:00.000Z' },
        { id: 'new-4', createdAt: '2026-03-01T00:00:00.000Z' },
        { id: 'new-5', createdAt: '2026-02-01T00:00:00.000Z' },
      ],
    })
    mockGetPayload.mockResolvedValue({ find: mockFind })

    const ids = await getPopularCourseIds()

    expect(ids).toEqual(['new-1', 'new-2', 'new-3', 'new-4', 'new-5'])
  })

  it('orders by distinct learners first, then pads to five with newest published', async () => {
    mockFindMany.mockResolvedValueOnce([
      { userId: 'u1', lessonId: 'l1' },
      { userId: 'u2', lessonId: 'l1' },
      { userId: 'u1', lessonId: 'l2' },
    ])
    const mockFind = vi
      .fn()
      .mockResolvedValueOnce({
        docs: [
          { id: 'l1', course: { id: 'c-low' } },
          { id: 'l2', course: { id: 'c-high' } },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          { id: 'c-low', createdAt: '2026-01-01T00:00:00.000Z', title: 'Low' },
          { id: 'c-high', createdAt: '2026-01-01T00:00:00.000Z', title: 'High' },
        ],
      })
      .mockResolvedValueOnce({
        docs: [
          { id: 'c-low', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 'c-high', createdAt: '2026-01-01T00:00:00.000Z' },
          { id: 'fill-a', createdAt: '2026-08-01T00:00:00.000Z' },
          { id: 'fill-b', createdAt: '2026-07-01T00:00:00.000Z' },
          { id: 'fill-c', createdAt: '2026-06-01T00:00:00.000Z' },
        ],
      })
    mockGetPayload.mockResolvedValue({ find: mockFind })

    const ids = await getPopularCourseIds()

    expect(ids).toHaveLength(5)
    expect(ids[0]).toBe('c-low')
    expect(ids[1]).toBe('c-high')
    expect(ids.slice(2)).toEqual(['fill-a', 'fill-b', 'fill-c'])
  })
})

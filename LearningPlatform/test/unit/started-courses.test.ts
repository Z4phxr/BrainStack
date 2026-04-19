import { describe, it, expect, vi, beforeEach } from 'vitest'

const mockFindMany = vi.fn()

vi.mock('@/lib/prisma', () => ({
  prisma: {
    lessonProgress: {
      findMany: (...args: unknown[]) => mockFindMany(...args),
    },
  },
}))

import {
  getOrderedStartedCourseIds,
  fetchPublishedCoursesByIdsInOrder,
} from '@/lib/started-courses'

describe('started-courses', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('getOrderedStartedCourseIds returns empty when no progress rows', async () => {
    mockFindMany.mockResolvedValueOnce([])
    const mockPayloadFind = vi.fn()
    const payload = { find: mockPayloadFind } as any

    await expect(getOrderedStartedCourseIds('user-1', payload)).resolves.toEqual([])
    expect(mockPayloadFind).not.toHaveBeenCalled()
  })

  it('getOrderedStartedCourseIds maps lessons to courses and sorts by latest activity', async () => {
    mockFindMany.mockResolvedValueOnce([
      { lessonId: 'l1', lastViewedAt: new Date('2026-01-01T12:00:00Z') },
      { lessonId: 'l2', lastViewedAt: new Date('2026-01-03T12:00:00Z') },
    ])
    const mockPayloadFind = vi
      .fn()
      .mockResolvedValueOnce({
        docs: [
          { id: 'l1', course: { id: 'course-a' } },
          { id: 'l2', course: { id: 'course-b' } },
        ],
      })
      .mockResolvedValueOnce({
        docs: [{ id: 'course-a' }, { id: 'course-b' }],
      })
    const payload = { find: mockPayloadFind } as any

    const ids = await getOrderedStartedCourseIds('user-1', payload)

    expect(ids).toEqual(['course-b', 'course-a'])
  })

  it('fetchPublishedCoursesByIdsInOrder preserves caller order', async () => {
    const mockPayloadFind = vi.fn().mockResolvedValueOnce({
      docs: [
        { id: 'second', title: 'Second' },
        { id: 'first', title: 'First' },
      ],
    })
    const payload = { find: mockPayloadFind } as any

    const out = await fetchPublishedCoursesByIdsInOrder(payload, ['first', 'second'], 0)

    expect(out.map((c: any) => c.id)).toEqual(['first', 'second'])
  })

  it('fetchPublishedCoursesByIdsInOrder returns empty array for empty ids', async () => {
    const mockPayloadFind = vi.fn()
    const payload = { find: mockPayloadFind } as any

    await expect(fetchPublishedCoursesByIdsInOrder(payload, [], 1)).resolves.toEqual([])
    expect(mockPayloadFind).not.toHaveBeenCalled()
  })
})

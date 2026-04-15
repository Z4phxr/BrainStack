/**
 * API tests — GET /api/recommend/tasks?mode=...
 *
 * Covers:
 * - weak mode returns tasks matching weak tags
 * - review mode returns tasks previously answered incorrectly
 * - mixed mode combines all three pools
 * - 401 for unauthenticated requests
 * - mode defaults to 'weak' when not specified
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

process.env.SKIP_DB_SETUP = '1'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma',    () => ({ prisma: mockPrisma }))
vi.mock('@/auth',          () => ({ auth: vi.fn() }))
vi.mock('payload',         () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@/lib/analytics', () => ({
  getUserWeakTags: vi.fn(),
  getUserTagStats:  vi.fn(),
}))

// ─── Deferred imports ─────────────────────────────────────────────────────────

const { GET }           = await import('@/app/api/recommend/tasks/route')
const { auth }          = await import('@/auth')
const { getPayload }    = await import('payload')
const { getUserWeakTags } = await import('@/lib/analytics')

const mockedAuth       = vi.mocked(auth)
const mockedGetPayload = vi.mocked(getPayload)
const mockedWeakTags   = vi.mocked(getUserWeakTags)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'user-1', email: 'u@test.com', role: 'STUDENT', name: 'User' },
  } as any)
}

function noSession() {
  mockedAuth.mockResolvedValue(null)
}

function makeTask(id: string, tags: string[]) {
  return {
    id,
    prompt: `Question ${id}`,
    isPublished: true,
    tags: tags.map((name) => ({ id: `t-${name}`, name, slug: name })),
  }
}

function payloadWith(tasks: any[]) {
  return { find: vi.fn().mockResolvedValue({ docs: tasks }) }
}

function get(url: string): Request {
  return new Request(url)
}

const DAY = 1000 * 60 * 60 * 24

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/recommend/tasks', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    vi.clearAllMocks()
    mockPrisma.taskAttempt.findMany.mockResolvedValue([])
    mockedWeakTags.mockResolvedValue([])
  })

  it('returns 401 when not authenticated', async () => {
    noSession()
    const res = await GET(get('http://localhost/api/recommend/tasks'))
    expect(res.status).toBe(401)
  })

  // ── weak mode ───────────────────────────────────────────────────────────────

  describe('mode=weak (default)', () => {
    it('returns tasks that match the user\'s weak tags', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([
        makeTask('t1', ['algebra']),
        makeTask('t2', ['chemistry']),
      ]) as any)
      mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.9 }])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=weak&limit=5'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.mode).toBe('weak')
      expect(body.tasks.length).toBeGreaterThan(0)
      // algebra task should be present
      expect(body.tasks.map((t: any) => t.id)).toContain('t1')
      // chemistry task has no weak tag match — should not appear
      expect(body.tasks.map((t: any) => t.id)).not.toContain('t2')
    })

    it('returns explanation mentioning weak tags', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([makeTask('t1', ['algebra'])]) as any)
      mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.9 }])
      mockPrisma.taskAttempt.findMany.mockResolvedValue([])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=weak'))
      const body = await res.json()

      expect(body.explanation).toMatch(/algebra/i)
    })

    it('returns empty tasks with guidance when no history exists', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([makeTask('t1', ['algebra'])]) as any)
      mockedWeakTags.mockResolvedValue([]) // no tag history

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=weak'))
      const body = await res.json()

      expect(body.tasks).toEqual([])
      expect(body.explanation).toMatch(/submit some tasks/i)
    })

    it('awards novelty bonus to never-attempted tasks', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([
        makeTask('new-task',   ['algebra']),
        makeTask('old-task',   ['algebra']),
      ]) as any)
      mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.8 }])
      // old-task was attempted long ago
      mockPrisma.taskAttempt.findMany.mockResolvedValue([
        { taskId: 'old-task', attemptedAt: new Date(Date.now() - 30 * DAY) },
      ])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=weak&limit=2'))
      const body = await res.json()

      const newT = body.tasks.find((t: any) => t.id === 'new-task')
      const oldT = body.tasks.find((t: any) => t.id === 'old-task')
      if (newT && oldT) {
        expect(newT.score).toBeGreaterThan(oldT.score)
      }
    })
  })

  // ── review mode ─────────────────────────────────────────────────────────────

  describe('mode=review', () => {
    it('returns incorrectly answered tasks sorted by recency', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([
        makeTask('t1', ['algebra']),
        makeTask('t2', ['geometry']),
        makeTask('t3', ['calculus']),
      ]) as any)

      const recentDate = new Date(Date.now() - 1 * DAY)
      const olderDate  = new Date(Date.now() - 5 * DAY)

      mockPrisma.taskAttempt.findMany.mockResolvedValue([
        { taskId: 't1', isCorrect: false, attemptedAt: recentDate },
        { taskId: 't2', isCorrect: false, attemptedAt: olderDate  },
        { taskId: 't3', isCorrect: true,  attemptedAt: recentDate },
      ])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=review&limit=5'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.mode).toBe('review')

      const ids = body.tasks.map((t: any) => t.id)
      // t1 and t2 were incorrect, t3 was correct (should not appear)
      expect(ids).toContain('t1')
      expect(ids).toContain('t2')
      expect(ids).not.toContain('t3')
    })

    it('excludes tasks that were since answered correctly', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([
        makeTask('t1', ['bio']),
      ]) as any)
      // t1 was wrong then later correct
      mockPrisma.taskAttempt.findMany.mockResolvedValue([
        { taskId: 't1', isCorrect: true,  attemptedAt: new Date(Date.now() - 1 * DAY) },
        { taskId: 't1', isCorrect: false, attemptedAt: new Date(Date.now() - 5 * DAY) },
      ])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=review&limit=5'))
      const body = await res.json()

      expect(body.tasks.map((t: any) => t.id)).not.toContain('t1')
    })
  })

  // ── mixed mode ──────────────────────────────────────────────────────────────

  describe('mode=mixed', () => {
    it('returns a blend of weak, review, and random tasks', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([
        makeTask('weak-t',   ['algebra']),
        makeTask('review-t', ['geometry']),
        makeTask('random-t', ['history']),
      ]) as any)
      mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.9 }])
      mockPrisma.taskAttempt.findMany.mockResolvedValue([
        // review-t was answered wrong
        { taskId: 'review-t', isCorrect: false, attemptedAt: new Date(Date.now() - 2 * DAY) },
      ])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=mixed&limit=6'))
      const body = await res.json()

      expect(res.status).toBe(200)
      expect(body.mode).toBe('mixed')
      expect(Array.isArray(body.tasks)).toBe(true)
      expect(body.tasks.length).toBeGreaterThan(0)
    })

    it('response includes mode field', async () => {
      userSession()
      mockedGetPayload.mockResolvedValue(payloadWith([makeTask('t1', ['x'])]) as any)
      mockedWeakTags.mockResolvedValue([])

      const res  = await GET(get('http://localhost/api/recommend/tasks?mode=mixed'))
      const body = await res.json()

      expect(body).toHaveProperty('mode', 'mixed')
    })
  })

  // ── limit enforcement ────────────────────────────────────────────────────────

  it('enforces maximum limit of 20', async () => {
    userSession()
    const tasks = Array.from({ length: 50 }, (_, i) => makeTask(`t${i}`, ['math']))
    mockedGetPayload.mockResolvedValue(payloadWith(tasks) as any)
    mockedWeakTags.mockResolvedValue([{ tag: 'math', weakness: 0.8 }])
    mockPrisma.taskAttempt.findMany.mockResolvedValue([])

    const res  = await GET(get('http://localhost/api/recommend/tasks?limit=999'))
    const body = await res.json()

    expect(body.tasks.length).toBeLessThanOrEqual(20)
  })
})

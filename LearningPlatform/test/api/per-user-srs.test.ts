/**
 * Tests — Per-user SRS via UserFlashcardProgress
 *
 * Covers:
 * - GET /api/flashcards/study merges per-user progress over global card defaults
 * - POST /api/flashcards/[id]/review bootstraps UserFlashcardProgress row
 * - POST /api/flashcards/[id]/review updates per-user row (not global Flashcard)
 * - SRS state machine transitions stored in UserFlashcardProgress
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma } from '../mocks'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/auth',       () => ({ auth: vi.fn() }))
vi.mock('next/cache',   () => ({ unstable_cache: (_fn: any) => _fn, revalidateTag: vi.fn() }))

// ─── Deferred imports ─────────────────────────────────────────────────────────

const { POST: reviewPost }   = await import('@/app/api/flashcards/[id]/review/route')
const { GET: studyGet }      = await import('@/app/api/flashcards/study/route')
const { auth } = await import('@/auth')
const mockedAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function userSession(id = 'user-42') {
  mockedAuth.mockResolvedValue({
    user: { id, email: 'student@test.com', role: 'STUDENT', name: 'Student' },
  } as any)
}

function makeRequest(method: string, url: string, body?: object): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function routeCtx(id: string) {
  return { params: Promise.resolve({ id }) }
}

const MOCK_SETTINGS = {
  id: 'settings-1', userId: 'user-42',
  newCardsPerDay: 20, maxReviews: 200,
  learningSteps: '1 10', relearningSteps: '10',
  graduatingInterval: 1, easyInterval: 4,
  startingEase: 2.5, masteredThreshold: 21,
  createdAt: new Date(), updatedAt: new Date(),
}

const MOCK_CARD = {
  id: 'fc-1', question: 'What is a limit?', answer: 'A limit is…',
  questionImageId: null, answerImageId: null,
  // Global default SRS values (should be overridden by per-user progress)
  state: 'NEW', interval: 0, easeFactor: 2.5, repetition: 0, stepIndex: 0,
  nextReviewAt: null, lastReviewedAt: null, lastResult: null,
  tags: [{ id: 'tag-1', name: 'Calculus', slug: 'calculus' }],
}

// ─── Study endpoint ───────────────────────────────────────────────────────────

describe('GET /api/flashcards/study — per-user SRS merging', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userSession()
  })

  it('returns 200 with cards for authenticated user', async () => {
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.flashcard.findMany).mockResolvedValue([MOCK_CARD] as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findMany).mockResolvedValue([])
    vi.mocked(mockPrisma.userFlashcardProgress.count).mockResolvedValue(0)

    const res = await studyGet(makeRequest('GET', 'http://localhost/api/flashcards/study'))
    expect(res.status).toBe(200)
    const data = await res.json()
    expect(Array.isArray(data.cards)).toBe(true)
  })

  it('falls back to card-level globals when no UserFlashcardProgress row exists', async () => {
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.flashcard.findMany).mockResolvedValue([MOCK_CARD] as any)
    // No per-user rows → empty map
    vi.mocked(mockPrisma.userFlashcardProgress.findMany).mockResolvedValue([])
    vi.mocked(mockPrisma.userFlashcardProgress.count).mockResolvedValue(0)

    const res = await studyGet(makeRequest('GET', 'http://localhost/api/flashcards/study?mode=free'))
    const data = await res.json()

    expect(data.cards[0].state).toBe('NEW')
    expect(data.cards[0].interval).toBe(0)
  })

  it('prefers UserFlashcardProgress state over global Flashcard defaults', async () => {
    const PER_USER_PROGRESS = {
      id: 'ufp-1', userId: 'user-42', flashcardId: 'fc-1',
      state: 'REVIEW', interval: 7, easeFactor: 2.7, repetition: 3, stepIndex: 0,
      nextReviewAt: new Date(Date.now() + 86_400_000),
      lastReviewedAt: new Date(), lastResult: 'GOOD',
      createdAt: new Date(), updatedAt: new Date(),
    }

    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.flashcard.findMany).mockResolvedValue([MOCK_CARD] as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findMany).mockResolvedValue([PER_USER_PROGRESS] as any)
    vi.mocked(mockPrisma.userFlashcardProgress.count).mockResolvedValue(1)

    const res = await studyGet(makeRequest('GET', 'http://localhost/api/flashcards/study?mode=free'))
    const data = await res.json()

    // Per-user progress should win
    expect(data.cards[0].state).toBe('REVIEW')
    expect(data.cards[0].interval).toBe(7)
    expect(data.cards[0].easeFactor).toBe(2.7)
  })

  it('uses userFlashcardProgress.count (not flashcard.count) for today budget', async () => {
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.flashcard.findMany).mockResolvedValue([MOCK_CARD] as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findMany).mockResolvedValue([])
    // Simulate 5 reviews already done today
    vi.mocked(mockPrisma.userFlashcardProgress.count).mockResolvedValue(5)

    const res = await studyGet(makeRequest('GET', 'http://localhost/api/flashcards/study'))
    const data = await res.json()

    expect(res.status).toBe(200)
    // Budget logic: newCardsPerDay(20) - reviewedToday(5) = 15 new allowed.
    // Since MOCK_CARD is NEW and due, it appears in cards.
    expect(Array.isArray(data.cards)).toBe(true)
    // The per-user count was queried (not flashcard.count)
    expect(mockPrisma.userFlashcardProgress.count).toHaveBeenCalled()
    expect(mockPrisma.flashcard.count).not.toHaveBeenCalled()
  })

  it('returns 401 for unauthenticated callers', async () => {
    mockedAuth.mockResolvedValue(null)
    const res = await studyGet(makeRequest('GET', 'http://localhost/api/flashcards/study'))
    expect(res.status).toBe(401)
  })
})

// ─── Review endpoint — per-user SRS writes ────────────────────────────────────

describe('POST /api/flashcards/[id]/review — UserFlashcardProgress', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    userSession()
  })

  it('creates a UserFlashcardProgress row on first review (bootstrap)', async () => {
    vi.mocked(mockPrisma.flashcard.findUnique).mockResolvedValue({
      ...MOCK_CARD, tags: [],
    } as any)
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    // First review → no existing per-user row
    vi.mocked(mockPrisma.userFlashcardProgress.findUnique).mockResolvedValue(null)
    vi.mocked(mockPrisma.userFlashcardProgress.create).mockResolvedValue({
      id: 'ufp-new', userId: 'user-42', flashcardId: 'fc-1',
      state: 'NEW', stepIndex: 0, interval: 0, easeFactor: 2.5, repetition: 0,
      nextReviewAt: null, lastReviewedAt: null, lastResult: null,
      createdAt: new Date(), updatedAt: new Date(),
    } as any)
    vi.mocked(mockPrisma.userFlashcardProgress.update).mockResolvedValue({
      id: 'ufp-new', state: 'LEARNING',
    } as any)

    const res = await reviewPost(
      makeRequest('POST', 'http://localhost/api/flashcards/fc-1/review', { answer: 'GOOD' }),
      routeCtx('fc-1'),
    )

    expect(res.status).toBe(200)
    // Bootstrap create should have been called
    expect(mockPrisma.userFlashcardProgress.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ userId: 'user-42', flashcardId: 'fc-1' }),
      }),
    )
    // Global flashcard.update should NOT be called
    expect(mockPrisma.flashcard.update).not.toHaveBeenCalled()
  })

  it('updates existing UserFlashcardProgress row on subsequent reviews', async () => {
    const EXISTING_PROGRESS = {
      id: 'ufp-existing', userId: 'user-42', flashcardId: 'fc-1',
      state: 'LEARNING', stepIndex: 1, interval: 0, easeFactor: 2.5, repetition: 0,
      nextReviewAt: new Date(), lastReviewedAt: new Date(), lastResult: 'GOOD',
      createdAt: new Date(), updatedAt: new Date(),
    }

    vi.mocked(mockPrisma.flashcard.findUnique).mockResolvedValue({
      ...MOCK_CARD, tags: [],
    } as any)
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findUnique).mockResolvedValue(EXISTING_PROGRESS as any)
    vi.mocked(mockPrisma.userFlashcardProgress.update).mockImplementation((args: any) =>
      Promise.resolve({ ...EXISTING_PROGRESS, ...args.data }),
    )

    await reviewPost(
      makeRequest('POST', 'http://localhost/api/flashcards/fc-1/review', { answer: 'GOOD' }),
      routeCtx('fc-1'),
    )

    // Should have updated the existing per-user row
    expect(mockPrisma.userFlashcardProgress.update).toHaveBeenCalledWith(
      expect.objectContaining({ where: { id: 'ufp-existing' } }),
    )
    // Should NOT have re-created it
    expect(mockPrisma.userFlashcardProgress.create).not.toHaveBeenCalled()
  })

  it('response contains SRS fields sourced from UserFlashcardProgress', async () => {
    vi.mocked(mockPrisma.flashcard.findUnique).mockResolvedValue({
      ...MOCK_CARD, tags: [],
    } as any)
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findUnique).mockResolvedValue(null)
    vi.mocked(mockPrisma.userFlashcardProgress.create).mockResolvedValue({
      id: 'ufp-1', userId: 'user-42', flashcardId: 'fc-1',
      state: 'NEW', stepIndex: 0, interval: 0, easeFactor: 2.5, repetition: 0,
      nextReviewAt: null, lastReviewedAt: null, lastResult: null,
      createdAt: new Date(), updatedAt: new Date(),
    } as any)

    const updatedDate = new Date()
    vi.mocked(mockPrisma.userFlashcardProgress.update).mockResolvedValue({
      id: 'ufp-1', state: 'REVIEW', interval: 4, easeFactor: 2.6,
      repetition: 1, stepIndex: 0,
      nextReviewAt: updatedDate, lastReviewedAt: updatedDate, lastResult: 'EASY',
    } as any)

    const res = await reviewPost(
      makeRequest('POST', 'http://localhost/api/flashcards/fc-1/review', { answer: 'EASY' }),
      routeCtx('fc-1'),
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.flashcard).toBeDefined()
    expect(data.flashcard.state).toBe('REVIEW')
    expect(data.flashcard.interval).toBe(4)
    expect(data.flashcard.lastResult).toBe('EASY')
  })

  it('global Flashcard record is never mutated by a review', async () => {
    vi.mocked(mockPrisma.flashcard.findUnique).mockResolvedValue({
      ...MOCK_CARD, tags: [],
    } as any)
    vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
    vi.mocked(mockPrisma.userFlashcardProgress.findUnique).mockResolvedValue(null)
    vi.mocked(mockPrisma.userFlashcardProgress.create).mockResolvedValue({
      id: 'ufp-1', state: 'NEW',
    } as any)
    vi.mocked(mockPrisma.userFlashcardProgress.update).mockResolvedValue({
      id: 'ufp-1', state: 'LEARNING',
    } as any)

    for (const answer of ['AGAIN', 'HARD', 'GOOD', 'EASY'] as const) {
      vi.clearAllMocks()
      userSession()
      vi.mocked(mockPrisma.flashcard.findUnique).mockResolvedValue({ ...MOCK_CARD, tags: [] } as any)
      vi.mocked(mockPrisma.flashcardSettings.upsert).mockResolvedValue(MOCK_SETTINGS as any)
      vi.mocked(mockPrisma.userFlashcardProgress.findUnique).mockResolvedValue(null)
      vi.mocked(mockPrisma.userFlashcardProgress.create).mockResolvedValue({ id: 'ufp-1', state: 'NEW' } as any)
      vi.mocked(mockPrisma.userFlashcardProgress.update).mockResolvedValue({ id: 'ufp-1', state: 'LEARNING' } as any)

      await reviewPost(
        makeRequest('POST', 'http://localhost/api/flashcards/fc-1/review', { answer }),
        routeCtx('fc-1'),
      )

      expect(mockPrisma.flashcard.update).not.toHaveBeenCalled()
    }
  })
})

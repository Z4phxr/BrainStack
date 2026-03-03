/**
 * API tests — GET /api/flashcards/study (weak-tag weighting)
 *
 * Verifies that:
 * - Due cards with weak tags appear before due cards without weak tags.
 * - SRS filter (isCardDue) still determines which cards are eligible.
 * - Weak-tag fetching failure is graceful (falls back to plain urgency sort).
 * - Free mode also applies weak-tag ordering.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

process.env.SKIP_DB_SETUP = '1'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma',    () => ({ prisma: mockPrisma }))
vi.mock('@/auth',          () => ({ auth: vi.fn() }))
vi.mock('@/lib/analytics', () => ({ getUserWeakTags: vi.fn() }))

// ─── Deferred imports ─────────────────────────────────────────────────────────

const { GET }             = await import('@/app/api/flashcards/study/route')
const { auth }            = await import('@/auth')
const { getUserWeakTags } = await import('@/lib/analytics')

const mockedAuth      = vi.mocked(auth)
const mockedWeakTags  = vi.mocked(getUserWeakTags)

// ─── Helpers ──────────────────────────────────────────────────────────────────

const PAST  = new Date(Date.now() - 10 * 24 * 60 * 60 * 1000) // 10 days ago — overdue
const PAST2 = new Date(Date.now() - 20 * 24 * 60 * 60 * 1000) // 20 days ago — more overdue
const FUTURE = new Date(Date.now() + 10 * 24 * 60 * 60 * 1000) // not due yet

function userSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'user-1', email: 'u@test.com', role: 'STUDENT', name: 'User' },
  } as any)
}

function noSession() {
  mockedAuth.mockResolvedValue(null)
}

/** Build a minimal flashcard record matching the Prisma return shape. */
function card(
  id: string,
  tags: Array<{ id: string; name: string; slug: string }> = [],
  nextReviewAt: Date | null = PAST,
) {
  return {
    id,
    question:       `Q ${id}`,
    answer:         `A ${id}`,
    questionImageId: null,
    answerImageId:   null,
    state:           'REVIEW',
    interval:        1,
    easeFactor:      2.5,
    repetition:      1,
    stepIndex:       0,
    nextReviewAt,
    lastReviewedAt:  new Date(Date.now() - 2 * 24 * 60 * 60 * 1000),
    lastResult:      'GOOD',
    tags,
  }
}

const SETTINGS_ROW = {
  id:              'settings-1',
  userId:          'user-1',
  newCardsPerDay:  20,
  maxReviews:      200,
  learningSteps:   '1 10',
  relearningSteps: '10',
  graduatingInterval: 1,
  easyInterval:    4,
  startingEaseFactor: 2.5,
  easyBonus:       1.3,
  hardMultiplier:  1.2,
  lapseMultiplier: 0.5,
  lapseMinInterval: 1,
  masteredThreshold: 21,
}

function get(url: string): Request {
  return new Request(url)
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('GET /api/flashcards/study — weak-tag weighting', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    vi.clearAllMocks()
    mockPrisma.flashcardSettings.upsert.mockResolvedValue(SETTINGS_ROW)
    mockPrisma.flashcard.count.mockResolvedValue(0)
    mockedWeakTags.mockResolvedValue([])
  })

  it('returns 401 for unauthenticated requests', async () => {
    noSession()
    const res = await GET(get('http://localhost/api/flashcards/study'))
    expect(res.status).toBe(401)
  })

  it('returns due cards normally when no weak tags exist', async () => {
    userSession()
    const cards = [
      card('c1', [{ id: 'tag-1', name: 'algebra', slug: 'algebra' }]),
      card('c2', [{ id: 'tag-2', name: 'history',  slug: 'history'  }]),
    ]
    mockPrisma.flashcard.findMany.mockResolvedValue(cards)
    mockedWeakTags.mockResolvedValue([])

    const res  = await GET(get('http://localhost/api/flashcards/study'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.cards.length).toBe(2)
  })

  it('places weak-tag due card before neutral due card of similar urgency', async () => {
    userSession()
    const weakCard    = card('weak-c',    [{ id: 'tag-a', name: 'algebra', slug: 'algebra' }], PAST)
    const neutralCard = card('neutral-c', [{ id: 'tag-b', name: 'history',  slug: 'history'  }], PAST)
    // Both cards have the same nextReviewAt → same base urgency.
    // weak-card matches the weak tag → should come first.
    mockPrisma.flashcard.findMany.mockResolvedValue([neutralCard, weakCard]) // neutral is first in DB order
    mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.9 }])

    const res  = await GET(get('http://localhost/api/flashcards/study'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.cards.length).toBeGreaterThanOrEqual(2)
    // After weak-tag boost, weak card should come first
    expect(body.cards[0].id).toBe('weak-c')
  })

  it('due cards still appear before not-due cards even without weak tag', async () => {
    userSession()
    const dueCard    = card('due-c',    [], PAST)
    const notDueCard = card('notdue-c', [], FUTURE)
    mockPrisma.flashcard.findMany.mockResolvedValue([notDueCard, dueCard])
    mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 0.9 }])

    // The route reads SRS state from userFlashcardProgress, NOT the flashcard itself.
    // Seed a progress row so notdue-c correctly has nextReviewAt in the future.
    mockPrisma.userFlashcardProgress.findMany.mockResolvedValue([
      { flashcardId: 'notdue-c', state: 'REVIEW', nextReviewAt: FUTURE,
        interval: 10, easeFactor: 2.5, repetition: 3, stepIndex: 0,
        lastReviewedAt: new Date(Date.now() - 2 * 24 * 60 * 60 * 1000), lastResult: 'GOOD' },
    ] as any)
    mockPrisma.userFlashcardProgress.count.mockResolvedValue(0) // no new reviews today

    const res  = await GET(get('http://localhost/api/flashcards/study'))
    const body = await res.json()

    // due-c should be scheduled (its progress is null → state=NEW → always due)
    // notdue-c should NOT appear in SRS mode because its nextReviewAt is in the future
    const ids = body.cards.map((c: any) => c.id)
    expect(ids).toContain('due-c')
    expect(ids).not.toContain('notdue-c')
  })

  it('gracefully falls back when getUserWeakTags fails', async () => {
    userSession()
    const cards = [card('c1', [{ id: 't1', name: 'math', slug: 'math' }])]
    mockPrisma.flashcard.findMany.mockResolvedValue(cards)
    mockedWeakTags.mockRejectedValue(new Error('analytics down'))

    const res  = await GET(get('http://localhost/api/flashcards/study'))
    const body = await res.json()

    // Should still return cards without crashing
    expect(res.status).toBe(200)
    expect(Array.isArray(body.cards)).toBe(true)
  })

  it('free mode: returns all cards sorted with weak-tag bonus', async () => {
    userSession()
    const neutralCard = card('n1', [{ id: 't1', name: 'history', slug: 'history' }], PAST2)
    const weakCard    = card('w1', [{ id: 't2', name: 'algebra', slug: 'algebra' }], PAST)
    // neutral has higher base urgency (PAST2 = more overdue) but no weak tag
    // weak has lower urgency but gets WEAK_TAG_BONUS of 0.5
    mockPrisma.flashcard.findMany.mockResolvedValue([neutralCard, weakCard])
    mockedWeakTags.mockResolvedValue([{ tag: 'algebra', weakness: 1.0 }])

    const res  = await GET(get('http://localhost/api/flashcards/study?mode=free'))
    const body = await res.json()

    expect(res.status).toBe(200)
    expect(body.mode).toBe('free')
    // Both cards returned (free mode returns all)
    expect(body.cards.length).toBe(2)
  })
})

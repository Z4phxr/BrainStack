import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))

const { GET: decksGet, POST: decksPost } = await import('@/app/api/flashcard-decks/route')
const { getFlashcardDashboardSummary } = await import('@/lib/flashcards-dashboard-summary')
const { auth } = await import('@/auth')
const mockedAuth = vi.mocked(auth)

function adminSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin', isPro: false },
  } as any)
}

function noSession() {
  mockedAuth.mockResolvedValue(null)
}

function req(method: string, url: string, body?: object): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

describe('flashcard-decks route', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    vi.clearAllMocks()
  })

  it('GET /api/flashcard-decks enforces auth', async () => {
    noSession()
    const res = await decksGet()
    expect(res.status).toBe(401)
  })

  it('GET /api/flashcard-decks loads relation metadata for hierarchy', async () => {
    adminSession()
    mockPrisma.flashcardDeck.findMany.mockResolvedValue([] as any)

    const res = await decksGet()
    expect(res.status).toBe(200)
    expect(mockPrisma.flashcardDeck.findMany).toHaveBeenCalledWith(
      expect.objectContaining({
        include: expect.objectContaining({
          parentDeck: expect.any(Object),
          childDecks: expect.any(Object),
        }),
      }),
    )
  })

  it('POST /api/flashcard-decks validates main decks require courseId', async () => {
    adminSession()
    const res = await decksPost(
      req('POST', 'http://localhost/api/flashcard-decks', {
        type: 'MAIN',
        name: 'Physics Deck',
      }),
    )
    expect(res.status).toBe(400)
    const body = await res.json()
    expect(body.issues.courseId[0]).toContain('Course is required')
  })

  it('POST /api/flashcard-decks creates a valid subdeck linked to module', async () => {
    adminSession()
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ id: 'course-1' }])
      .mockResolvedValueOnce([{ id: 'module-1' }])
    mockPrisma.flashcardDeck.findUnique.mockResolvedValue({
      id: 'main-deck-1',
      courseId: 'course-1',
      parentDeckId: null,
    } as any)
    mockPrisma.flashcardDeck.create.mockResolvedValue({
      id: 'subdeck-1',
      slug: 'module-1-deck',
      name: 'Module 1',
      courseId: 'course-1',
      moduleId: 'module-1',
      parentDeckId: 'main-deck-1',
      tags: [],
      childDecks: [],
      parentDeck: { id: 'main-deck-1', name: 'Physics', slug: 'physics-main' },
      _count: { flashcards: 0 },
    } as any)

    const res = await decksPost(
      req('POST', 'http://localhost/api/flashcard-decks', {
        type: 'SUBDECK',
        name: 'Module 1',
        courseId: 'course-1',
        moduleId: 'module-1',
        parentDeckId: 'main-deck-1',
      }),
    )
    expect(res.status).toBe(201)
    expect(mockPrisma.flashcardDeck.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({
          courseId: 'course-1',
          moduleId: 'module-1',
          parentDeckId: 'main-deck-1',
        }),
      }),
    )
  })
})

describe('getFlashcardDashboardSummary', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    vi.clearAllMocks()
  })

  it('returns empty when user has no started courses', async () => {
    mockPrisma.courseProgress.findMany.mockResolvedValue([])
    const summary = await getFlashcardDashboardSummary('user-1')
    expect(summary.decks).toHaveLength(0)
    expect(summary.all.total).toBe(0)
  })

  it('builds course -> deck -> subdeck hierarchy with aggregated stats', async () => {
    const now = new Date()
    const due = new Date(now.getTime() - 60_000)

    mockPrisma.courseProgress.findMany.mockResolvedValue([{ courseId: 'course-1' }] as any)
    mockPrisma.$queryRaw
      .mockResolvedValueOnce([{ id: 'course-1', slug: 'physics', title: 'Physics' }])
      .mockResolvedValueOnce([{ id: 'module-1', title: 'Relativity' }])
    mockPrisma.flashcardDeck.findMany.mockResolvedValue([
      { id: 'main-1', name: 'Physics Main', slug: 'physics-main', courseId: 'course-1', moduleId: null, parentDeckId: null },
      { id: 'sub-1', name: 'Relativity Subdeck', slug: 'physics-relativity', courseId: 'course-1', moduleId: 'module-1', parentDeckId: 'main-1' },
    ] as any)
    mockPrisma.flashcard.findMany.mockResolvedValue([
      {
        deck: { id: 'sub-1', name: 'Relativity Subdeck', slug: 'physics-relativity', courseId: 'course-1', moduleId: 'module-1', parentDeckId: 'main-1' },
        userProgress: [{ state: 'REVIEW', nextReviewAt: due }],
      },
      {
        deck: { id: 'sub-1', name: 'Relativity Subdeck', slug: 'physics-relativity', courseId: 'course-1', moduleId: 'module-1', parentDeckId: 'main-1' },
        userProgress: [],
      },
    ] as any)

    const summary = await getFlashcardDashboardSummary('user-1')
    expect(summary.decks).toHaveLength(1)
    expect(summary.decks[0].course.slug).toBe('physics')
    expect(summary.decks[0].subdecks).toHaveLength(1)
    expect(summary.decks[0].subdecks[0].deck.moduleTitle).toBe('Relativity')
    expect(summary.decks[0].stats.total).toBe(2)
    expect(summary.decks[0].stats.newCards).toBe(1)
    expect(summary.decks[0].stats.due).toBe(1)
  })
})

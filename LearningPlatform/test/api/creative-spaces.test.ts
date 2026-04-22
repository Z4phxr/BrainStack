/**
 * API tests — Creative Space routes (student-owned boards)
 *
 * Mocks Prisma + NextAuth. Covers list/create space and get/patch/delete by id,
 * plus items list/create on a space.
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma } from '../mocks'

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))

const { GET: listGet, POST: listPost } = await import('@/app/api/creative-spaces/route')
const {
  GET: spaceGet,
  PATCH: spacePatch,
  DELETE: spaceDelete,
} = await import('@/app/api/creative-spaces/[id]/route')
const { GET: itemsGet, POST: itemsPost } = await import('@/app/api/creative-spaces/[id]/items/route')

const { auth } = await import('@/auth')
const mockedAuth = vi.mocked(auth)

function studentSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'stu-1', email: 'student@test.com', role: 'STUDENT', name: 'Student' },
  } as any)
}

function noSession() {
  mockedAuth.mockResolvedValue(null)
}

function makeRequest(method: string, url: string, body?: object): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body !== undefined ? JSON.stringify(body) : undefined,
  })
}

function routeCtx(spaceId: string) {
  return { params: Promise.resolve({ id: spaceId }) }
}

const ownedSelectRow = {
  id: 'space-1',
  userId: 'stu-1',
  title: 'My board',
  createdAt: new Date(),
  updatedAt: new Date(),
  lastEditedAt: new Date(),
  courseId: null,
  moduleId: null,
  lessonId: null,
}

const fullSpaceRow = {
  ...ownedSelectRow,
  _count: { items: 2, decks: 0, flashcards: 0, activities: 1 },
}

describe('GET /api/creative-spaces', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    noSession()
    const res = await listGet()
    expect(res.status).toBe(401)
  })

  it('returns 200 with spaces for student', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findMany).mockResolvedValue([fullSpaceRow] as any)

    const res = await listGet()
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.spaces).toHaveLength(1)
    expect(data.spaces[0].id).toBe('space-1')
    expect(mockPrisma.creativeSpace.findMany).toHaveBeenCalled()
  })
})

describe('POST /api/creative-spaces', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    noSession()
    const res = await listPost(makeRequest('POST', 'http://localhost/api/creative-spaces', { title: 'A' }))
    expect(res.status).toBe(401)
  })

  it('returns 201 and created space', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.create).mockResolvedValue({
      id: 'new-space',
      userId: 'stu-1',
      title: 'Named',
      courseId: null,
      moduleId: null,
      lessonId: null,
      createdAt: new Date(),
      updatedAt: new Date(),
      lastEditedAt: new Date(),
    } as any)

    const res = await listPost(
      makeRequest('POST', 'http://localhost/api/creative-spaces', { title: 'Named' }),
    )
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.space.title).toBe('Named')
  })

  it('returns 400 for invalid body', async () => {
    studentSession()
    const res = await listPost(
      makeRequest('POST', 'http://localhost/api/creative-spaces', {
        title: 'x'.repeat(200),
      }),
    )
    expect(res.status).toBe(400)
  })
})

describe('GET /api/creative-spaces/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    noSession()
    const res = await spaceGet(makeRequest('GET', 'http://localhost/api/creative-spaces/space-1'), routeCtx('space-1'))
    expect(res.status).toBe(401)
  })

  it('returns 404 when space not found', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(null)
    const res = await spaceGet(makeRequest('GET', 'http://localhost/api/creative-spaces/space-1'), routeCtx('space-1'))
    expect(res.status).toBe(404)
  })

  it('returns 200 with space', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(fullSpaceRow as any)
    const res = await spaceGet(makeRequest('GET', 'http://localhost/api/creative-spaces/space-1'), routeCtx('space-1'))
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.space.id).toBe('space-1')
  })
})

describe('PATCH /api/creative-spaces/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when not owned', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(null)
    const res = await spacePatch(
      makeRequest('PATCH', 'http://localhost/api/creative-spaces/space-1', { title: 'Renamed' }),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 200 when update succeeds', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(ownedSelectRow as any)
    vi.mocked(mockPrisma.creativeSpace.update).mockResolvedValue({
      ...ownedSelectRow,
      title: 'Renamed',
    } as any)

    const res = await spacePatch(
      makeRequest('PATCH', 'http://localhost/api/creative-spaces/space-1', { title: 'Renamed' }),
      routeCtx('space-1'),
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.space.title).toBe('Renamed')
  })
})

describe('DELETE /api/creative-spaces/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when not owned', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(null)
    const res = await spaceDelete(
      makeRequest('DELETE', 'http://localhost/api/creative-spaces/space-1'),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 200 when delete succeeds', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(ownedSelectRow as any)
    vi.mocked(mockPrisma.creativeSpace.delete).mockResolvedValue(ownedSelectRow as any)

    const res = await spaceDelete(
      makeRequest('DELETE', 'http://localhost/api/creative-spaces/space-1'),
      routeCtx('space-1'),
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })
})

describe('GET /api/creative-spaces/[id]/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 401 when unauthenticated', async () => {
    noSession()
    const res = await itemsGet(
      makeRequest('GET', 'http://localhost/api/creative-spaces/space-1/items'),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(401)
  })

  it('returns 404 when space not owned', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(null)
    const res = await itemsGet(
      makeRequest('GET', 'http://localhost/api/creative-spaces/space-1/items'),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 200 with items', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(ownedSelectRow as any)
    vi.mocked(mockPrisma.creativeItem.findMany).mockResolvedValue([
      { id: 'item-1', type: 'TEXT', spaceId: 'space-1', userId: 'stu-1' },
    ] as any)

    const res = await itemsGet(
      makeRequest('GET', 'http://localhost/api/creative-spaces/space-1/items'),
      routeCtx('space-1'),
    )
    const data = await res.json()
    expect(res.status).toBe(200)
    expect(data.items).toHaveLength(1)
    expect(data.items[0].type).toBe('TEXT')
  })
})

describe('POST /api/creative-spaces/[id]/items', () => {
  beforeEach(() => {
    vi.clearAllMocks()
  })

  it('returns 404 when space not owned', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(null)
    const res = await itemsPost(
      makeRequest('POST', 'http://localhost/api/creative-spaces/space-1/items', { type: 'TEXT' }),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 201 when item is created', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(ownedSelectRow as any)
    vi.mocked(mockPrisma.creativeItem.aggregate).mockResolvedValue({ _max: { zIndex: 0 } } as any)
    vi.mocked(mockPrisma.creativeItem.create).mockResolvedValue({
      id: 'item-new',
      spaceId: 'space-1',
      userId: 'stu-1',
      type: 'TEXT',
      x: 80,
      y: 80,
      width: 280,
      height: 180,
      zIndex: 1,
      tag: null,
      payload: null,
      createdAt: new Date(),
      updatedAt: new Date(),
    } as any)
    vi.mocked(mockPrisma.creativeSpace.update).mockResolvedValue(ownedSelectRow as any)
    vi.mocked(mockPrisma.creativeActivityEvent.create).mockResolvedValue({ id: 'act-1' } as any)

    const res = await itemsPost(
      makeRequest('POST', 'http://localhost/api/creative-spaces/space-1/items', { type: 'TEXT' }),
      routeCtx('space-1'),
    )
    const data = await res.json()
    expect(res.status).toBe(201)
    expect(data.item.id).toBe('item-new')
    expect(mockPrisma.creativeActivityEvent.create).toHaveBeenCalled()
  })

  it('returns 400 for invalid item type', async () => {
    studentSession()
    vi.mocked(mockPrisma.creativeSpace.findFirst).mockResolvedValue(ownedSelectRow as any)

    const res = await itemsPost(
      makeRequest('POST', 'http://localhost/api/creative-spaces/space-1/items', { type: 'INVALID' }),
      routeCtx('space-1'),
    )
    expect(res.status).toBe(400)
  })
})

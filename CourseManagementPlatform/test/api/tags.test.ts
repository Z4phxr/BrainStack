/**
 * API tests — Tag routes
 *
 * Covers:
 * - GET    /api/tags              (list all tags, admin only)
 * - POST   /api/tags              (create tag, admin only)
 * - PUT    /api/tags/[id]         (rename tag + sync payload.tasks_tags)
 * - DELETE /api/tags/[id]         (delete tag + clean payload.tasks_tags orphans)
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma } from '../mocks'

// ─── Mocks ────────────────────────────────────────────────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/auth',       () => ({ auth: vi.fn() }))
vi.mock('next/cache',   () => ({
  unstable_cache: (_fn: any) => _fn,
  revalidateTag: vi.fn(),
}))

// ─── Deferred imports ─────────────────────────────────────────────────────────

const { GET: listGet, POST: listPost } = await import('@/app/api/tags/route')
const { PUT: tagPut, DELETE: tagDelete } = await import('@/app/api/tags/[id]/route')
const { auth } = await import('@/auth')
const mockedAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function adminSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
  } as any)
}

function noSession() {
  mockedAuth.mockResolvedValue(null)
}

function makeRequest(method: string, url: string, body?: object): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

function routeCtx(id: string) {
  return { params: { id } }
}

const MOCK_TAG = {
  id: 'tag-1',
  name: 'Calculus',
  slug: 'calculus',
  main: false,
  createdAt: new Date(),
  updatedAt: new Date(),
}

// ─── GET /api/tags ─────────────────────────────────────────────────────────────

describe('GET /api/tags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminSession()
  })

  it('returns 200 with tags array for admin', async () => {
    vi.mocked(mockPrisma.tag.findMany).mockResolvedValue([
      { id: 'tag-1', name: 'Calculus', slug: 'calculus', _count: { flashcards: 5 } },
      { id: 'tag-2', name: 'Algebra', slug: 'algebra', _count: { flashcards: 3 } },
    ] as any)

    const res = await listGet()
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tags).toHaveLength(2)
    expect(data.tags[0].name).toBe('Calculus')
  })

  it('returns 401 for unauthenticated callers', async () => {
    noSession()
    const res = await listGet()
    expect(res.status).toBe(401)
  })
})

// ─── POST /api/tags ────────────────────────────────────────────────────────────

describe('POST /api/tags', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminSession()
  })

  it('creates a tag and returns 201', async () => {
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(null)
    vi.mocked(mockPrisma.tag.create).mockResolvedValue({
      id: 'tag-new', name: 'Topology', slug: 'topology',
    } as any)

    const res = await listPost(makeRequest('POST', 'http://localhost/api/tags', { name: 'Topology' }))
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.tag.name).toBe('Topology')
    expect(data.tag.slug).toBe('topology')
  })

  it('auto-generates slug from name', async () => {
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(null)
    vi.mocked(mockPrisma.tag.create).mockResolvedValue({
      id: 'tag-new', name: 'Linear Algebra', slug: 'linear-algebra',
    } as any)

    const res = await listPost(
      makeRequest('POST', 'http://localhost/api/tags', { name: 'Linear Algebra' }),
    )
    expect(res.status).toBe(201)
    expect(mockPrisma.tag.create).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'linear-algebra' }),
      }),
    )
  })

  it('returns 400 for empty name', async () => {
    const res = await listPost(makeRequest('POST', 'http://localhost/api/tags', { name: '' }))
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Validation failed')
  })

  it('returns 409 when tag name already exists', async () => {
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(MOCK_TAG as any)

    const res = await listPost(makeRequest('POST', 'http://localhost/api/tags', { name: 'Calculus' }))
    expect(res.status).toBe(409)
  })

  it('returns 401 for unauthenticated callers', async () => {
    noSession()
    const res = await listPost(makeRequest('POST', 'http://localhost/api/tags', { name: 'Physics' }))
    expect(res.status).toBe(401)
  })
})

// ─── PUT /api/tags/[id] ────────────────────────────────────────────────────────

describe('PUT /api/tags/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminSession()
  })

  it('renames the tag (name + auto-slug) and returns 200', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(null)    // no conflict
    vi.mocked(mockPrisma.tag.update).mockResolvedValue({
      ...MOCK_TAG, name: 'Advanced Calculus', slug: 'advanced-calculus',
    } as any)

    const res = await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { name: 'Advanced Calculus' }),
      routeCtx('tag-1'),
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.tag.name).toBe('Advanced Calculus')
  })

  it('syncs payload.tasks_tags after rename', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(null)
    vi.mocked(mockPrisma.tag.update).mockResolvedValue({
      ...MOCK_TAG, name: 'Advanced Calculus', slug: 'advanced-calculus',
    } as any)
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(3 as any)   // 3 rows updated

    await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { name: 'Advanced Calculus' }),
      routeCtx('tag-1'),
    )

    // $executeRaw should have been called once to sync payload.tasks_tags
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1)
  })

  it('does NOT call $executeRaw when name is unchanged', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.update).mockResolvedValue({
      ...MOCK_TAG, main: true,
    } as any)

    await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { main: true }),
      routeCtx('tag-1'),
    )

    // No rename → no sync
    expect(mockPrisma.$executeRaw).not.toHaveBeenCalled()
  })

  it('returns 404 when tag does not exist', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(null)

    const res = await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/missing', { name: 'X' }),
      routeCtx('missing'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 409 on name conflict with another tag', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    // A different tag already has the target name
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue({ id: 'tag-other', name: 'Algebra' } as any)

    const res = await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { name: 'Algebra' }),
      routeCtx('tag-1'),
    )
    expect(res.status).toBe(409)
  })

  it('returns 401 for unauthenticated callers', async () => {
    noSession()
    const res = await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { name: 'X' }),
      routeCtx('tag-1'),
    )
    expect(res.status).toBe(401)
  })

  it('accepts explicit slug override', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.findFirst).mockResolvedValue(null)
    vi.mocked(mockPrisma.tag.update).mockResolvedValue({
      ...MOCK_TAG, name: 'Calculus II', slug: 'calc-2',
    } as any)

    await tagPut(
      makeRequest('PUT', 'http://localhost/api/tags/tag-1', { name: 'Calculus II', slug: 'calc-2' }),
      routeCtx('tag-1'),
    )

    expect(mockPrisma.tag.update).toHaveBeenCalledWith(
      expect.objectContaining({
        data: expect.objectContaining({ slug: 'calc-2' }),
      }),
    )
  })
})

// ─── DELETE /api/tags/[id] ────────────────────────────────────────────────────

describe('DELETE /api/tags/[id]', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    adminSession()
  })

  it('deletes tag and returns { success: true }', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.delete).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(0 as any)

    const res = await tagDelete(
      makeRequest('DELETE', 'http://localhost/api/tags/tag-1'),
      routeCtx('tag-1'),
    )
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
  })

  it('cleans up payload.tasks_tags orphans before deletion', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.delete).mockResolvedValue(MOCK_TAG as any)
    // $queryRaw must return rows so the conditional $executeRaw branch is entered
    vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([{ id: 'join-row-1' }, { id: 'join-row-2' }])
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(2 as any)   // 2 orphan rows deleted

    await tagDelete(
      makeRequest('DELETE', 'http://localhost/api/tags/tag-1'),
      routeCtx('tag-1'),
    )

    // $executeRaw should have cleaned payload.tasks_tags
    expect(mockPrisma.$executeRaw).toHaveBeenCalledTimes(1)
    // Then the canonical tag should be deleted
    expect(mockPrisma.tag.delete).toHaveBeenCalledWith({ where: { id: 'tag-1' } })
  })

  it('still deletes the tag even if payload.tasks_tags cleanup fails', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.tag.delete).mockResolvedValue(MOCK_TAG as any)
    vi.mocked(mockPrisma.$executeRaw).mockRejectedValue(new Error('Schema error'))

    const res = await tagDelete(
      makeRequest('DELETE', 'http://localhost/api/tags/tag-1'),
      routeCtx('tag-1'),
    )

    // Cleanup error is non-fatal; delete should still succeed
    expect(res.status).toBe(200)
    expect(mockPrisma.tag.delete).toHaveBeenCalled()
  })

  it('returns 404 when tag does not exist', async () => {
    vi.mocked(mockPrisma.tag.findUnique).mockResolvedValue(null)

    const res = await tagDelete(
      makeRequest('DELETE', 'http://localhost/api/tags/missing'),
      routeCtx('missing'),
    )
    expect(res.status).toBe(404)
  })

  it('returns 401 for unauthenticated callers', async () => {
    noSession()
    const res = await tagDelete(
      makeRequest('DELETE', 'http://localhost/api/tags/tag-1'),
      routeCtx('tag-1'),
    )
    expect(res.status).toBe(401)
  })
})

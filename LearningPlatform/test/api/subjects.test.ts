/**
 * API tests — /api/subjects (GET, POST, PUT, DELETE)
 *
 * The subjects routes use prisma.$queryRaw / $executeRaw to interact with
 * the payload."subjects" table directly.  All DB calls are intercepted via
 * vi.mock so no real database is required.
 *
 * Covers:
 * - GET  is public (no auth required); maps raw rows to { id, name, slug }
 * - POST requires admin auth; validates name; returns 201 with new subject
 * - PUT  requires admin auth; requires ?id param; returns 200 with updated subject
 * - DELETE requires admin auth; requires ?id param; returns 200 on success
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

process.env.SKIP_DB_SETUP = '1'

// ─── Mocks (must be declared before dynamic imports) ─────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))
vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))

// ─── Deferred imports ─────────────────────────────────────────────────────────

const { GET, POST, PUT, DELETE } = await import('@/app/api/subjects/route')
const { auth } = await import('@/auth')

const mockedAuth = vi.mocked(auth)

// ─── Helpers ──────────────────────────────────────────────────────────────────

function adminSession() {
  mockedAuth.mockResolvedValue({
    user: { id: 'admin-1', email: 'admin@test.com', role: 'ADMIN', name: 'Admin' },
  } as any)
}

function makeRequest(method: string, url: string, body?: object): Request {
  return new Request(url, {
    method,
    headers: { 'content-type': 'application/json' },
    body: body ? JSON.stringify(body) : undefined,
  })
}

// ─── GET ─────────────────────────────────────────────────────────────────────

describe('GET /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAllMocks(mockPrisma)
    mockedAuth.mockResolvedValue(null) // unauthenticated by default
  })

  it('returns 200 with subjects for unauthenticated callers', async () => {
    vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([
      { id: '1', name: 'Mathematics', slug: 'mathematics' },
      { id: '2', name: 'Physics', slug: 'physics' },
    ])

    const req = makeRequest('GET', 'http://localhost/api/subjects')
    const res = await GET(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.subjects).toHaveLength(2)
    expect(data.subjects[0].name).toBe('Mathematics')
  })

  it('returns empty subjects array and 500 when the database throws', async () => {
    vi.mocked(mockPrisma.$queryRaw).mockRejectedValueOnce(new Error('DB down'))

    const req = makeRequest('GET', 'http://localhost/api/subjects')
    const res = await GET(req)
    const data = await res.json()

    // Catch block returns { subjects: [] } with status 500
    expect(res.status).toBe(500)
    expect(Array.isArray(data.subjects)).toBe(true)
    expect(data.subjects).toHaveLength(0)
  })

  it('maps raw rows to { id, name, slug, tagSlugs } shape', async () => {
    vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([
      { id: 'abc', name: 'Chemistry', slug: 'chemistry' },
    ])

    const req = makeRequest('GET', 'http://localhost/api/subjects')
    const res = await GET(req)
    const data = await res.json()

    expect(data.subjects[0].id).toBe('abc')
    expect(data.subjects[0].name).toBe('Chemistry')
    expect(data.subjects[0].slug).toBe('chemistry')
    expect(Array.isArray(data.subjects[0].tagSlugs)).toBe(true)
  })
})

// ─── POST ─────────────────────────────────────────────────────────────────────

describe('POST /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAllMocks(mockPrisma)
    // $executeRaw returns number of affected rows; POST does not check the value
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(1 as any)
  })

  it('returns 401-equivalent error for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null)

    const req = makeRequest('POST', 'http://localhost/api/subjects', { name: 'Art' })
    const res = await POST(req)

    // requireAdmin throws; caught as generic 500 error
    expect(res.status).toBe(500)
    const data = await res.json()
    expect(data.error).toBeDefined()
  })

  it('returns 400 when name is missing', async () => {
    adminSession()
    const req = makeRequest('POST', 'http://localhost/api/subjects', { name: '' })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Subject name is required')
  })

  it('returns 400 when name is not a string', async () => {
    adminSession()
    const req = makeRequest('POST', 'http://localhost/api/subjects', { name: 123 })
    const res = await POST(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Subject name is required')
  })

  it('returns 400 when name is only whitespace', async () => {
    adminSession()
    const req = makeRequest('POST', 'http://localhost/api/subjects', { name: '   ' })
    const res = await POST(req)
    expect(res.status).toBe(400)
  })

  it('creates and returns the new subject (201) for admin', async () => {
    adminSession()
    const req = makeRequest('POST', 'http://localhost/api/subjects', {
      name: 'Biology',
      slug: 'biology',
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.subject.name).toBe('Biology')
    expect(data.subject.slug).toBe('biology')
    expect(mockPrisma.$executeRaw).toHaveBeenCalled()
  })

  it('auto-generates slug from name when slug is not provided', async () => {
    adminSession()
    const req = makeRequest('POST', 'http://localhost/api/subjects', {
      name: 'Linear Algebra',
    })
    const res = await POST(req)
    const data = await res.json()

    expect(res.status).toBe(201)
    expect(data.subject.slug).toBe('linear-algebra')
  })
})

// ─── PUT ─────────────────────────────────────────────────────────────────────

describe('PUT /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAllMocks(mockPrisma)
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(1 as any) // 1 row updated
  })

  it('returns 500-error for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null)
    const req = makeRequest('PUT', 'http://localhost/api/subjects?id=sub-1', { name: 'New' })
    const res = await PUT(req)
    expect(res.status).toBe(500)
  })

  it('returns 400 when id query param is missing', async () => {
    adminSession()
    const req = makeRequest('PUT', 'http://localhost/api/subjects', { name: 'New Name' })
    const res = await PUT(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing id')
  })

  it('returns 400 when name is missing', async () => {
    adminSession()
    const req = makeRequest('PUT', 'http://localhost/api/subjects?id=sub-1', { name: '' })
    const res = await PUT(req)
    expect(res.status).toBe(400)
  })

  it('returns 404 when no rows are updated (subject not found)', async () => {
    adminSession()
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(0 as any) // 0 rows updated
    const req = makeRequest('PUT', 'http://localhost/api/subjects?id=nonexistent', {
      name: 'Renamed',
    })
    const res = await PUT(req)
    expect(res.status).toBe(404)
  })

  it('returns 200 with updated subject on success', async () => {
    adminSession()
    const req = makeRequest('PUT', 'http://localhost/api/subjects?id=sub-1', {
      name: 'Renamed Subject',
    })
    const res = await PUT(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.subject.name).toBe('Renamed Subject')
    expect(data.subject.id).toBe('sub-1')
  })
})

// ─── DELETE ───────────────────────────────────────────────────────────────────

describe('DELETE /api/subjects', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    resetAllMocks(mockPrisma)
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(1 as any)
  })

  it('returns 500-error for unauthenticated requests', async () => {
    mockedAuth.mockResolvedValue(null)
    const req = makeRequest('DELETE', 'http://localhost/api/subjects?id=sub-1')
    const res = await DELETE(req)
    expect(res.status).toBe(500)
  })

  it('returns 400 when id query param is missing', async () => {
    adminSession()
    const req = makeRequest('DELETE', 'http://localhost/api/subjects')
    const res = await DELETE(req)
    expect(res.status).toBe(400)
    const data = await res.json()
    expect(data.error).toBe('Missing id')
  })

  it('returns 404 when subject does not exist (0 rows deleted)', async () => {
    adminSession()
    vi.mocked(mockPrisma.$executeRaw).mockResolvedValue(0 as any)
    const req = makeRequest('DELETE', 'http://localhost/api/subjects?id=ghost')
    const res = await DELETE(req)
    expect(res.status).toBe(404)
  })

  it('returns 200 success on successful deletion', async () => {
    adminSession()
    const req = makeRequest('DELETE', 'http://localhost/api/subjects?id=sub-1')
    const res = await DELETE(req)
    const data = await res.json()

    expect(res.status).toBe(200)
    expect(data.success).toBe(true)
    expect(mockPrisma.$executeRaw).toHaveBeenCalled()
  })
})

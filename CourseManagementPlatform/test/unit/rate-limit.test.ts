/**
 * Unit tests — lib/rate-limit.ts
 *
 * The rate-limiter is backed by PostgreSQL (prisma.$queryRaw).
 * All database calls are intercepted by the vi.mock below.
 *
 * Key behaviours tested:
 *  - Returns { allowed: true } when count <= limit
 *  - Returns { allowed: false } when count > limit
 *  - Returns { allowed: true } as a fail-open when the database is unavailable
 *  - Extracts the IP from x-forwarded-for (rightmost non-empty part)
 *  - Falls back to x-real-ip when x-forwarded-for is absent
 *  - Falls back to "unknown" when no IP headers exist
 *  - Includes a non-negative retryAfter value in the response
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

process.env.SKIP_DB_SETUP = '1'

// ─── Mock prisma before importing the module under test ───────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const { checkRateLimit } = await import('@/lib/rate-limit')

// ─── Helpers ──────────────────────────────────────────────────────────────────

function makeRequest(
  options: { forwardedFor?: string; realIp?: string } = {},
): Request {
  const headers = new Headers()
  if (options.forwardedFor !== undefined)
    headers.set('x-forwarded-for', options.forwardedFor)
  if (options.realIp !== undefined)
    headers.set('x-real-ip', options.realIp)
  return new Request('https://example.com', { headers })
}

/**
 * Configure mockPrisma.$queryRaw to return a {count, resetAt} entry that
 * simulates a given number of request counts within the window.
 */
function mockDbCount(count: number, resetAt = new Date(Date.now() + 60_000)): void {
  vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([{ count, resetAt }])
}

/**
 * Simulate the database being unavailable (throws on $queryRaw).
 */
function mockDbDown(): void {
  vi.mocked(mockPrisma.$queryRaw).mockRejectedValueOnce(new Error('Connection lost'))
}

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('checkRateLimit', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
  })

  // ── Allow / block decisions ────────────────────────────────────────────────

  describe('allow / block decisions', () => {
    it('allows the request when count equals the limit', async () => {
      mockDbCount(3) // count === limit
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      const result = await checkRateLimit({ request: req, key: 'login', limit: 3 })
      expect(result.allowed).toBe(true)
    })

    it('allows the request when count is below the limit', async () => {
      mockDbCount(1)
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      const result = await checkRateLimit({ request: req, key: 'login', limit: 5 })
      expect(result.allowed).toBe(true)
    })

    it('blocks the request when count exceeds the limit', async () => {
      mockDbCount(6) // count > limit of 5
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      const result = await checkRateLimit({ request: req, key: 'login', limit: 5 })
      expect(result.allowed).toBe(false)
    })

    it('returns retryAfter > 0 when blocked', async () => {
      const future = new Date(Date.now() + 30_000)
      vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([{ count: 10, resetAt: future }])
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      const result = await checkRateLimit({ request: req, key: 'login', limit: 5 })
      expect(result.allowed).toBe(false)
      expect(result.retryAfter).toBeGreaterThan(0)
    })

    it('returns retryAfter >= 0 when allowed', async () => {
      mockDbCount(1)
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      const result = await checkRateLimit({ request: req, key: 'login', limit: 10 })
      expect(result.retryAfter).toBeGreaterThanOrEqual(0)
    })
  })

  // ── Fail-open behaviour ────────────────────────────────────────────────────

  describe('database unavailability — fail-open', () => {
    it('allows the request when the database throws', async () => {
      mockDbDown()
      const req = makeRequest({ forwardedFor: '9.9.9.9' })
      const result = await checkRateLimit({ request: req, key: 'api', limit: 1 })
      expect(result.allowed).toBe(true)
    })

    it('returns a non-negative retryAfter when the database throws', async () => {
      mockDbDown()
      const req = makeRequest({ forwardedFor: '9.9.9.9' })
      const result = await checkRateLimit({ request: req, key: 'api', limit: 1 })
      expect(result.retryAfter).toBeGreaterThanOrEqual(0)
    })

    it('allows the request when $queryRaw returns an empty array', async () => {
      vi.mocked(mockPrisma.$queryRaw).mockResolvedValueOnce([])
      const req = makeRequest({ forwardedFor: '1.1.1.1' })
      const result = await checkRateLimit({ request: req, key: 'api', limit: 5 })
      expect(result.allowed).toBe(true)
    })
  })

  // ── IP extraction ──────────────────────────────────────────────────────────

  describe('IP extraction', () => {
    it('uses the rightmost IP from x-forwarded-for (trusted proxy position)', async () => {
      mockDbCount(1)
      const req = makeRequest({ forwardedFor: '1.1.1.1, 2.2.2.2, 3.3.3.3' })
      await checkRateLimit({ request: req, key: 'test', limit: 10 })

      // The storeKey passed to the DB should contain the rightmost IP: 3.3.3.3
      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const allArgs = [...callArgs].map(String)
      expect(allArgs.some(s => s.includes('3.3.3.3'))).toBe(true)
    })

    it('falls back to x-real-ip when x-forwarded-for is absent', async () => {
      mockDbCount(1)
      const req = makeRequest({ realIp: '5.5.5.5' })
      await checkRateLimit({ request: req, key: 'test', limit: 10 })

      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const allArgs = [...callArgs].map(String)
      expect(allArgs.some(s => s.includes('5.5.5.5'))).toBe(true)
    })

    it('uses "unknown" when no IP headers are present', async () => {
      mockDbCount(1)
      const req = makeRequest() // no IP headers
      await checkRateLimit({ request: req, key: 'test', limit: 10 })

      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const allArgs = [...callArgs].map(String)
      expect(allArgs.some(s => s.includes('unknown'))).toBe(true)
    })

    it('uses "unknown" when x-forwarded-for is an empty string', async () => {
      mockDbCount(1)
      const req = makeRequest({ forwardedFor: '' })
      await checkRateLimit({ request: req, key: 'test', limit: 10 })

      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const allArgs = [...callArgs].map(String)
      expect(allArgs.some(s => s.includes('unknown'))).toBe(true)
    })
  })

  // ── Rate-limit keys are namespaced ─────────────────────────────────────────

  describe('rate-limit keys', () => {
    it('includes the provided key in the store key sent to the database', async () => {
      mockDbCount(1)
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      await checkRateLimit({ request: req, key: 'login', limit: 10 })

      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const allArgs = [...callArgs].map(String)
      expect(allArgs.some(s => s.includes('login'))).toBe(true)
    })
  })

  // ── Custom window ──────────────────────────────────────────────────────────

  describe('custom windowMs', () => {
    it('passes a resetAt within the specified window to the database', async () => {
      mockDbCount(1)
      const before = Date.now()
      const req = makeRequest({ forwardedFor: '1.2.3.4' })
      await checkRateLimit({ request: req, key: 'api', limit: 5, windowMs: 5_000 })
      const after = Date.now()

      // The second positional argument to $queryRaw is the resetAt Date
      const callArgs = vi.mocked(mockPrisma.$queryRaw).mock.calls[0] ?? []
      const dateArgs = [...callArgs].filter(a => a instanceof Date) as Date[]
      expect(dateArgs.length).toBeGreaterThan(0)
      const resetAt = dateArgs[0].getTime()
      // resetAt should be approximately now + 5000 ms
      expect(resetAt).toBeGreaterThanOrEqual(before + 4_900)
      expect(resetAt).toBeLessThanOrEqual(after + 5_100)
    })
  })
})

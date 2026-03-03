/**
 * Unit tests — lib/token-blocklist.ts
 *
 * Tests for revokeToken(), isTokenRevoked(), and purgeExpiredTokens()
 * with all Prisma calls intercepted via vi.mock.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

process.env.SKIP_DB_SETUP = '1'

// ─── Mock prisma before importing module under test ───────────────────────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({ prisma: mockPrisma }))

const { revokeToken, isTokenRevoked, purgeExpiredTokens } = await import(
  '@/lib/token-blocklist'
)

// ─── Tests ────────────────────────────────────────────────────────────────────

describe('revokeToken', () => {
  beforeEach(() => resetAllMocks(mockPrisma))

  it('calls revokedToken.upsert with the provided jti and expiresAt', async () => {
    const jti = 'test-jti-abc'
    const expiresAt = new Date('2030-01-01')

    vi.mocked(mockPrisma.revokedToken.upsert).mockResolvedValueOnce({
      id: 'rt-1',
      jti,
      expiresAt,
    } as any)

    await revokeToken(jti, expiresAt)

    expect(mockPrisma.revokedToken.upsert).toHaveBeenCalledWith(
      expect.objectContaining({
        where: { jti },
        create: { jti, expiresAt },
      }),
    )
  })

  it('is idempotent — calling it twice does not throw', async () => {
    const jti = 'dup-jti'
    const expiresAt = new Date('2030-01-01')

    vi.mocked(mockPrisma.revokedToken.upsert).mockResolvedValue({
      id: 'rt-1', jti, expiresAt,
    } as any)

    await expect(revokeToken(jti, expiresAt)).resolves.toBeUndefined()
    await expect(revokeToken(jti, expiresAt)).resolves.toBeUndefined()
    expect(mockPrisma.revokedToken.upsert).toHaveBeenCalledTimes(2)
  })
})

describe('isTokenRevoked', () => {
  beforeEach(() => resetAllMocks(mockPrisma))

  it('returns true when the jti is found in the blocklist', async () => {
    vi.mocked(mockPrisma.revokedToken.findUnique).mockResolvedValueOnce({
      id: 'rt-1',
      jti: 'blocked-jti',
      expiresAt: new Date('2030-01-01'),
    } as any)

    const result = await isTokenRevoked('blocked-jti')
    expect(result).toBe(true)
  })

  it('returns false when the jti is NOT found in the blocklist', async () => {
    vi.mocked(mockPrisma.revokedToken.findUnique).mockResolvedValueOnce(null)

    const result = await isTokenRevoked('valid-jti')
    expect(result).toBe(false)
  })

  it('queries findUnique with the correct jti', async () => {
    vi.mocked(mockPrisma.revokedToken.findUnique).mockResolvedValueOnce(null)

    await isTokenRevoked('some-jti')

    expect(mockPrisma.revokedToken.findUnique).toHaveBeenCalledWith({
      where: { jti: 'some-jti' },
    })
  })
})

describe('purgeExpiredTokens', () => {
  beforeEach(() => resetAllMocks(mockPrisma))

  it('deletes entries where expiresAt is in the past', async () => {
    vi.mocked(mockPrisma.revokedToken.deleteMany).mockResolvedValueOnce({ count: 3 })

    const deleted = await purgeExpiredTokens()

    expect(deleted).toBe(3)
    expect(mockPrisma.revokedToken.deleteMany).toHaveBeenCalledWith(
      expect.objectContaining({
        where: expect.objectContaining({
          expiresAt: expect.objectContaining({ lt: expect.any(Date) }),
        }),
      }),
    )
  })

  it('returns 0 when no expired tokens exist', async () => {
    vi.mocked(mockPrisma.revokedToken.deleteMany).mockResolvedValueOnce({ count: 0 })

    const deleted = await purgeExpiredTokens()
    expect(deleted).toBe(0)
  })
})

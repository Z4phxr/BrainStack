/**
 * Unit tests — lib/analytics.ts
 *
 * Tests for getUserTagStats() and getUserWeakTags() which derive per-tag
 * skill statistics from the TaskAttempt event log.
 */

import { describe, it, expect, beforeEach, vi } from 'vitest'
import { createMockPrisma, resetAllMocks } from '../mocks'

// Tell the global setup (test/setup.ts) to skip real-DB teardown hooks.
// All prisma calls in this file are intercepted by the vi.mock below.
process.env.SKIP_DB_SETUP = '1'

// ── 1. Register the mock BEFORE any module that imports @/lib/prisma ──────────

const mockPrisma = createMockPrisma()

vi.mock('@/lib/prisma', () => ({
  prisma: mockPrisma,
}))

// ── 2. Import the module under test (deferred so mock is in place first) ────

const { getUserTagStats, getUserWeakTags, invalidateUserTagStatsCache } = await import('@/lib/analytics')

// ─── Helpers ──────────────────────────────────────────────────────────────────

/** Build a minimal TaskAttempt row compatible with the select used in getUserTagStats. */
function progressRow(
  tagNames: string[],
  isCorrect: boolean,
  attemptedAt: Date = new Date('2025-01-15T12:00:00.000Z'),
) {
  return {
    taskAttemptTags: tagNames.map((name) => ({ tag: { name } })),
    isCorrect,
    attemptedAt,
  }
}

// ─── Test suite ───────────────────────────────────────────────────────────────

describe('getUserTagStats', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    invalidateUserTagStatsCache('user-1')
  })

  it('returns an empty array when the user has no task history', async () => {
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([])

    const result = await getUserTagStats('user-1')

    expect(result).toEqual([])
  })

  it('correctly aggregates attempts and correct counts per tag', async () => {
    // Row 1: biology ✓, chemistry ✓
    // Row 2: biology ✗
    // Row 3: chemistry ✓
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['biology', 'chemistry'], true),
      progressRow(['biology'], false),
      progressRow(['chemistry'], true),
    ])

    const result = await getUserTagStats('user-1')

    const biology   = result.find((s) => s.tag === 'biology')
    const chemistry = result.find((s) => s.tag === 'chemistry')

    expect(biology).toBeDefined()
    expect(biology?.attempts).toBe(2)
    expect(biology?.correct).toBe(1)

    expect(chemistry).toBeDefined()
    expect(chemistry?.attempts).toBe(2)
    expect(chemistry?.correct).toBe(2)
  })

  it('calculates successRate = correct / attempts', async () => {
    // 3 attempts, 1 correct
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['algebra'], true),
      progressRow(['algebra'], false),
      progressRow(['algebra'], false),
    ])

    const [stat] = await getUserTagStats('user-1')

    expect(stat.tag).toBe('algebra')
    expect(stat.attempts).toBe(3)
    expect(stat.correct).toBe(1)
    expect(stat.successRate).toBeCloseTo(1 / 3)
  })

  it('applies Bayesian (Laplace) smoothing: score = (correct + 1) / (attempts + 2)', async () => {
    // 1 attempt, 1 correct → score = 2/3 ≈ 0.667
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['physics'], true),
    ])

    const [stat] = await getUserTagStats('user-1')

    expect(stat.score).toBeCloseTo((1 + 1) / (1 + 2))  // 0.6667
  })

  it('gives a neutral prior of 0.5 to a tag seen exactly once — wrong', async () => {
    // 1 attempt, 0 correct → score = (0+1)/(1+2) = 1/3
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['history'], false),
    ])

    const [stat] = await getUserTagStats('user-1')

    expect(stat.score).toBeCloseTo(1 / 3)  // ≈ 0.333
  })

  it('records the most recent attemptedAt for each tag', async () => {
    const older  = new Date('2025-01-10T00:00:00.000Z')
    const newer  = new Date('2025-01-20T00:00:00.000Z')

    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['math'], true,  older),
      progressRow(['math'], false, newer),
    ])

    const [stat] = await getUserTagStats('user-1')

    expect(stat.lastAttemptAt).toEqual(newer)
  })

  it('skips empty / falsy tag names in taskProgressTags', async () => {
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['', 'valid-tag', ''], true),
    ])

    const result = await getUserTagStats('user-1')

    expect(result).toHaveLength(1)
    expect(result[0].tag).toBe('valid-tag')
  })
})

// ─────────────────────────────────────────────────────────────────────────────

describe('getUserWeakTags', () => {
  beforeEach(() => {
    resetAllMocks(mockPrisma)
    invalidateUserTagStatsCache('user-1')
  })

  it('returns an empty array when the user has no task history', async () => {
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([])

    const result = await getUserWeakTags('user-1')

    expect(result).toEqual([])
  })

  it('sorts tags from weakest to strongest (highest weakness first)', async () => {
    // chemistry: 0 correct out of 2  → successRate = 0.0 → weakness = 1.0
    // biology:   1 correct out of 2  → successRate = 0.5 → weakness = 0.5
    // physics:   2 correct out of 2  → successRate = 1.0 → weakness = 0.0
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['chemistry'], false),
      progressRow(['chemistry'], false),
      progressRow(['biology'],   true),
      progressRow(['biology'],   false),
      progressRow(['physics'],   true),
      progressRow(['physics'],   true),
    ])

    const result = await getUserWeakTags('user-1')
    const tags   = result.map((w) => w.tag)

    expect(tags[0]).toBe('chemistry')
    expect(tags[1]).toBe('biology')
    expect(tags[2]).toBe('physics')
  })

  it('computes weakness = 1 - successRate', async () => {
    // 1 correct / 4 attempts → successRate = 0.25 → weakness = 0.75
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['calculus'], true),
      progressRow(['calculus'], false),
      progressRow(['calculus'], false),
      progressRow(['calculus'], false),
    ])

    const [weak] = await getUserWeakTags('user-1')

    expect(weak.tag).toBe('calculus')
    expect(weak.weakness).toBeCloseTo(0.75)
  })

  it('returns WeakTag objects with only tag and weakness properties', async () => {
    mockPrisma.taskAttempt.findMany.mockResolvedValueOnce([
      progressRow(['geometry'], true),
    ])

    const [weak] = await getUserWeakTags('user-1')

    expect(weak).toHaveProperty('tag')
    expect(weak).toHaveProperty('weakness')
    // Should NOT include TagStat-specific fields
    expect(weak).not.toHaveProperty('attempts')
    expect(weak).not.toHaveProperty('correct')
    expect(weak).not.toHaveProperty('score')
  })
})

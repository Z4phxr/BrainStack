/**
 * SRS Algorithm tests — lib/srs.ts
 *
 * Covers every state × answer combination, edge cases for ease clamping,
 * MASTERED threshold promotion, isCardDue, getCardUrgency, sortByUrgency,
 * and the settings parse/serialize round-trip.
 */

import { describe, it, expect } from 'vitest'
import {
  calculateNextReview,
  isCardDue,
  getCardUrgency,
  sortByUrgency,
  parseSettings,
  serializeSettings,
  DEFAULT_SETTINGS,
  type SRSCardData,
  type SRSSettings,
} from '@/lib/srs'

// ─── Helpers ──────────────────────────────────────────────────────────────────

const NOW = new Date('2025-01-15T12:00:00.000Z')

/** Produce a minimal SRSCardData. */
function card(overrides: Partial<SRSCardData> = {}): SRSCardData {
  return {
    state:          'NEW',
    interval:       0,
    easeFactor:     2.5,
    repetition:     0,
    stepIndex:      0,
    nextReviewAt:   null,
    lastReviewedAt: null,
    lastResult:     null,
    ...overrides,
  }
}

function minutesFromNow(minutes: number): Date {
  return new Date(NOW.getTime() + minutes * 60 * 1000)
}

function daysFromNow(days: number): Date {
  const d = new Date(NOW)
  d.setDate(d.getDate() + days)
  return d
}

// ─── calculateNextReview — NEW / LEARNING ─────────────────────────────────────

describe('calculateNextReview — NEW / LEARNING', () => {
  const settings = DEFAULT_SETTINGS // learningSteps: [1, 10]

  describe('NEW card', () => {
    it('AGAIN → LEARNING step 0, next in 1 min', () => {
      const result = calculateNextReview(card(), 'AGAIN', settings, NOW)
      expect(result.state).toBe('LEARNING')
      expect(result.stepIndex).toBe(0)
      // nextReviewAt should be ~1 minute from now
      expect(result.nextReviewAt.getTime()).toBeCloseTo(
        minutesFromNow(1).getTime(),
        -3, // within ±1 second
      )
    })

    it('HARD → stays LEARNING step 0, next in 1.5 mins (50 % longer)', () => {
      const result = calculateNextReview(card(), 'HARD', settings, NOW)
      expect(result.state).toBe('LEARNING')
      expect(result.stepIndex).toBe(0)
      expect(result.nextReviewAt.getTime()).toBeCloseTo(
        minutesFromNow(1.5).getTime(),
        -3,
      )
    })

    it('GOOD → advances to step 1 (not yet graduated)', () => {
      const result = calculateNextReview(card(), 'GOOD', settings, NOW)
      expect(result.state).toBe('LEARNING')
      expect(result.stepIndex).toBe(1)
      // step 1 = 10 minutes
      expect(result.nextReviewAt.getTime()).toBeCloseTo(
        minutesFromNow(10).getTime(),
        -3,
      )
    })

    it('EASY → graduates immediately to REVIEW with easyInterval days', () => {
      const result = calculateNextReview(card(), 'EASY', settings, NOW)
      expect(result.state).toBe('REVIEW')
      expect(result.interval).toBe(settings.easyInterval) // 4
      expect(result.repetition).toBe(1)
      expect(result.stepIndex).toBe(0)
      // ease bumped up
      expect(result.easeFactor).toBeCloseTo(2.5 + 0.15, 5)
      expect(result.nextReviewAt >= daysFromNow(4)).toBe(true)
    })
  })

  describe('LEARNING card at last step (stepIndex = 1)', () => {
    const learningCard = card({ state: 'LEARNING', stepIndex: 1 })

    it('AGAIN → resets to step 0', () => {
      const result = calculateNextReview(learningCard, 'AGAIN', settings, NOW)
      expect(result.state).toBe('LEARNING')
      expect(result.stepIndex).toBe(0)
      expect(result.nextReviewAt.getTime()).toBeCloseTo(minutesFromNow(1).getTime(), -3)
    })

    it('HARD → stays on step 1, next in 15 mins', () => {
      const result = calculateNextReview(learningCard, 'HARD', settings, NOW)
      expect(result.state).toBe('LEARNING')
      expect(result.stepIndex).toBe(1)
      expect(result.nextReviewAt.getTime()).toBeCloseTo(minutesFromNow(15).getTime(), -3)
    })

    it('GOOD → graduates to REVIEW with graduatingInterval', () => {
      const result = calculateNextReview(learningCard, 'GOOD', settings, NOW)
      expect(result.state).toBe('REVIEW')
      expect(result.interval).toBe(settings.graduatingInterval) // 1
      expect(result.repetition).toBe(1)
      expect(result.stepIndex).toBe(0)
    })

    it('EASY → graduates to REVIEW with easyInterval', () => {
      const result = calculateNextReview(learningCard, 'EASY', settings, NOW)
      expect(result.state).toBe('REVIEW')
      expect(result.interval).toBe(settings.easyInterval) // 4
      expect(result.easeFactor).toBeCloseTo(2.5 + 0.15, 5)
    })
  })

  describe('Single-step learning (learningSteps = [5])', () => {
    const singleStep: SRSSettings = { ...DEFAULT_SETTINGS, learningSteps: [5] }

    it('GOOD graduates on the only step', () => {
      const result = calculateNextReview(card({ state: 'LEARNING', stepIndex: 0 }), 'GOOD', singleStep, NOW)
      expect(result.state).toBe('REVIEW')
      expect(result.interval).toBe(singleStep.graduatingInterval)
    })
  })
})

// ─── calculateNextReview — REVIEW ────────────────────────────────────────────

describe('calculateNextReview — REVIEW', () => {
  const reviewCard = card({ state: 'REVIEW', interval: 5, easeFactor: 2.5, repetition: 1 })
  const settings   = DEFAULT_SETTINGS

  it('AGAIN → RELEARNING, ease drops by 0.2, first relearning step', () => {
    const result = calculateNextReview(reviewCard, 'AGAIN', settings, NOW)
    expect(result.state).toBe('RELEARNING')
    expect(result.stepIndex).toBe(0)
    expect(result.easeFactor).toBeCloseTo(2.5 - 0.2, 5)
    // First relearning step = 10 minutes
    expect(result.nextReviewAt.getTime()).toBeCloseTo(minutesFromNow(10).getTime(), -3)
  })

  it('HARD → interval × 1.2, ease − 0.15, stays REVIEW', () => {
    const result = calculateNextReview(reviewCard, 'HARD', settings, NOW)
    expect(result.state).toBe('REVIEW')
    // Math.max(5+1, round(5 * 1.2)) = Math.max(6, 6) = 6
    expect(result.interval).toBe(6)
    expect(result.easeFactor).toBeCloseTo(2.5 - 0.15, 5)
    expect(result.repetition).toBe(2) // incremented from 1
  })

  it('GOOD → interval × ease, stays REVIEW', () => {
    const result = calculateNextReview(reviewCard, 'GOOD', settings, NOW)
    expect(result.state).toBe('REVIEW')
    // Math.max(5+1, round(5 * 2.5)) = Math.max(6, 13) = 13
    expect(result.interval).toBe(13)
    expect(result.easeFactor).toBeCloseTo(2.5, 5) // unchanged on GOOD
    expect(result.repetition).toBe(2)
  })

  it('EASY → interval × ease × 1.3, ease + 0.15, stays REVIEW', () => {
    const result = calculateNextReview(reviewCard, 'EASY', settings, NOW)
    expect(result.state).toBe('REVIEW')
    // Math.max(6, round(5 * 2.5 * 1.3)) = Math.max(6, 16) = 16
    expect(result.interval).toBe(16)
    expect(result.easeFactor).toBeCloseTo(2.5 + 0.15, 5)
  })

  it('ease is clamped at minimum 1.3 on repeated failure', () => {
    const lowEaseCard = card({ state: 'REVIEW', interval: 5, easeFactor: 1.35, repetition: 3 })
    const result      = calculateNextReview(lowEaseCard, 'AGAIN', settings, NOW)
    // 1.35 - 0.2 = 1.15, clamped to 1.3
    expect(result.easeFactor).toBe(1.3)
  })

  it('promotes card to MASTERED when interval ≥ masteredThreshold', () => {
    const highIntervalCard = card({
      state:      'REVIEW',
      interval:   20,
      easeFactor: 2.5,
      repetition: 10,
    })
    const result = calculateNextReview(highIntervalCard, 'GOOD', settings, NOW)
    // Math.max(21, round(20 * 2.5)) = max(21, 50) = 50 ≥ 21 → MASTERED
    expect(result.state).toBe('MASTERED')
    expect(result.interval).toBeGreaterThanOrEqual(settings.masteredThreshold)
  })

  it('keeps correct lastResult and lastReviewedAt', () => {
    const result = calculateNextReview(reviewCard, 'GOOD', settings, NOW)
    expect(result.lastResult).toBe('GOOD')
    expect(result.lastReviewedAt).toEqual(NOW)
  })
})

// ─── calculateNextReview — RELEARNING ────────────────────────────────────────

describe('calculateNextReview — RELEARNING', () => {
  // relearningSteps = [10] by default (single step)
  const relearningCard = card({
    state:      'RELEARNING',
    interval:   7,   // already-penalised interval
    easeFactor: 2.0,
    repetition: 5,
    stepIndex:  0,
  })
  const settings = DEFAULT_SETTINGS

  it('AGAIN → stays at step 0, next in 10 mins', () => {
    const result = calculateNextReview(relearningCard, 'AGAIN', settings, NOW)
    expect(result.state).toBe('RELEARNING')
    expect(result.stepIndex).toBe(0)
    expect(result.nextReviewAt.getTime()).toBeCloseTo(minutesFromNow(10).getTime(), -3)
  })

  it('HARD → stays at step 0, next in 15 mins (10 × 1.5)', () => {
    const result = calculateNextReview(relearningCard, 'HARD', settings, NOW)
    expect(result.state).toBe('RELEARNING')
    expect(result.nextReviewAt.getTime()).toBeCloseTo(minutesFromNow(15).getTime(), -3)
  })

  it('GOOD → graduates back to REVIEW keeping existing interval', () => {
    const result = calculateNextReview(relearningCard, 'GOOD', settings, NOW)
    expect(result.state).toBe('REVIEW')
    expect(result.interval).toBe(7) // unchanged
    expect(result.repetition).toBe(6) // incremented
    expect(result.stepIndex).toBe(0)
  })

  it('EASY → graduates to REVIEW with slightly boosted interval', () => {
    const result = calculateNextReview(relearningCard, 'EASY', settings, NOW)
    expect(result.state).toBe('REVIEW')
    // Math.max(7+1, 4) = Math.max(8, 4) = 8
    expect(result.interval).toBe(8)
    expect(result.easeFactor).toBeCloseTo(2.0 + 0.15, 5)
    expect(result.repetition).toBe(6)
  })
})

// ─── calculateNextReview — MASTERED ──────────────────────────────────────────

describe('calculateNextReview — MASTERED (treated as REVIEW)', () => {
  const masteredCard = card({
    state:      'MASTERED',
    interval:   30,
    easeFactor: 2.5,
    repetition: 15,
  })
  const settings = DEFAULT_SETTINGS

  it('AGAIN → RELEARNING (same as REVIEW fails)', () => {
    const result = calculateNextReview(masteredCard, 'AGAIN', settings, NOW)
    expect(result.state).toBe('RELEARNING')
  })

  it('GOOD → stays MASTERED when new interval ≥ threshold', () => {
    const result = calculateNextReview(masteredCard, 'GOOD', settings, NOW)
    // Math.max(31, round(30 * 2.5)) = max(31, 75) = 75 ≥ 21 → MASTERED
    expect(result.state).toBe('MASTERED')
    expect(result.interval).toBe(75)
  })
})

// ─── isCardDue ────────────────────────────────────────────────────────────────

describe('isCardDue', () => {
  it('NEW cards are always due', () => {
    expect(isCardDue(card({ state: 'NEW' }), NOW)).toBe(true)
  })

  it('cards with null nextReviewAt are always due', () => {
    expect(isCardDue(card({ state: 'LEARNING', nextReviewAt: null }), NOW)).toBe(true)
  })

  it('LEARNING card due within buffer window is shown', () => {
    const due = minutesFromNow(15) // within default 20-min buffer
    expect(isCardDue(card({ state: 'LEARNING', nextReviewAt: due }), NOW, 20)).toBe(true)
  })

  it('LEARNING card outside buffer window is not shown', () => {
    const due = minutesFromNow(60) // 60 min away, buffer is 20
    expect(isCardDue(card({ state: 'LEARNING', nextReviewAt: due }), NOW, 20)).toBe(false)
  })

  it('RELEARNING overdue card is shown', () => {
    const overdue = new Date(NOW.getTime() - 5 * 60 * 1000) // 5 mins ago
    expect(isCardDue(card({ state: 'RELEARNING', nextReviewAt: overdue }), NOW)).toBe(true)
  })

  it('REVIEW card due today is shown', () => {
    const dueToday = new Date(NOW)
    dueToday.setHours(22, 0, 0, 0) // later today
    expect(isCardDue(card({ state: 'REVIEW', nextReviewAt: dueToday }), NOW)).toBe(true)
  })

  it('REVIEW card due tomorrow is NOT shown', () => {
    const tomorrow = daysFromNow(1)
    expect(isCardDue(card({ state: 'REVIEW', nextReviewAt: tomorrow }), NOW)).toBe(false)
  })

  it('MASTERED card overdue is shown', () => {
    const lastWeek = daysFromNow(-7)
    expect(isCardDue(card({ state: 'MASTERED', nextReviewAt: lastWeek }), NOW)).toBe(true)
  })
})

// ─── getCardUrgency ───────────────────────────────────────────────────────────

describe('getCardUrgency', () => {
  const overdueDate   = daysFromNow(-1)
  const todayDate     = NOW            // same day
  const futureDate    = daysFromNow(3)
  const overdueMinute = minutesFromNow(-15)

  it('RELEARNING overdue → urgency 1 (highest priority)', () => {
    expect(getCardUrgency(card({ state: 'RELEARNING', nextReviewAt: overdueMinute }), NOW)).toBe(1)
  })

  it('REVIEW overdue → urgency 2', () => {
    expect(getCardUrgency(card({ state: 'REVIEW', nextReviewAt: overdueDate }), NOW)).toBe(2)
  })

  it('MASTERED overdue → urgency 2', () => {
    expect(getCardUrgency(card({ state: 'MASTERED', nextReviewAt: overdueDate }), NOW)).toBe(2)
  })

  it('LEARNING scheduled → urgency 3', () => {
    expect(getCardUrgency(card({ state: 'LEARNING', nextReviewAt: futureDate }), NOW)).toBe(3)
  })

  it('REVIEW due today → urgency 4', () => {
    expect(getCardUrgency(card({ state: 'REVIEW', nextReviewAt: todayDate }), NOW)).toBe(4)
  })

  it('NEW card → urgency 5', () => {
    expect(getCardUrgency(card({ state: 'NEW', nextReviewAt: null }), NOW)).toBe(5)
  })

  it('MASTERED future → urgency 6', () => {
    expect(getCardUrgency(card({ state: 'MASTERED', nextReviewAt: futureDate }), NOW)).toBe(6)
  })

  it('REVIEW future → urgency 7 (not due today)', () => {
    expect(getCardUrgency(card({ state: 'REVIEW', nextReviewAt: futureDate }), NOW)).toBe(7)
  })
})

// ─── sortByUrgency ────────────────────────────────────────────────────────────

describe('sortByUrgency', () => {
  it('puts most urgent cards first', () => {
    const cardA = card({ state: 'NEW' })
    const cardB = card({ state: 'RELEARNING', nextReviewAt: minutesFromNow(-5) })
    const cardC = card({ state: 'REVIEW',     nextReviewAt: daysFromNow(-1) })

    const sorted = sortByUrgency([cardA, cardB, cardC], NOW)

    // RELEARNING overdue (1) < REVIEW overdue (2) < NEW (5)
    expect(sorted[0].state).toBe('RELEARNING')
    expect(sorted[1].state).toBe('REVIEW')
    expect(sorted[2].state).toBe('NEW')
  })

  it('within the same urgency bucket, earlier due dates come first', () => {
    const earlier = card({ state: 'REVIEW', nextReviewAt: daysFromNow(-3), interval: 5, easeFactor: 2.5, repetition: 1 })
    const later   = card({ state: 'REVIEW', nextReviewAt: daysFromNow(-1), interval: 5, easeFactor: 2.5, repetition: 1 })

    const sorted = sortByUrgency([later, earlier], NOW)
    expect(sorted[0].nextReviewAt!.getTime()).toBeLessThan(sorted[1].nextReviewAt!.getTime())
  })

  it('does not mutate the source array', () => {
    const cards  = [card({ state: 'NEW' }), card({ state: 'RELEARNING', nextReviewAt: minutesFromNow(-1) })]
    const copy   = [...cards]
    sortByUrgency(cards, NOW)
    expect(cards).toEqual(copy)
  })

  it('handles an empty array', () => {
    expect(sortByUrgency([], NOW)).toEqual([])
  })

  it('handles a single card', () => {
    const single = [card({ state: 'NEW' })]
    expect(sortByUrgency(single, NOW)).toHaveLength(1)
  })
})

// ─── parseSettings / serializeSettings ───────────────────────────────────────

describe('parseSettings', () => {
  const raw = {
    newCardsPerDay:     20,
    maxReviews:         200,
    learningSteps:      '1 10',
    relearningSteps:    '10',
    graduatingInterval: 1,
    easyInterval:       4,
    startingEase:       2.5,
    masteredThreshold:  21,
  }

  it('parses learning steps from space-separated string', () => {
    const s = parseSettings(raw)
    expect(s.learningSteps).toEqual([1, 10])
  })

  it('parses relearning steps from space-separated string', () => {
    const s = parseSettings(raw)
    expect(s.relearningSteps).toEqual([10])
  })

  it('passes through numeric fields unchanged', () => {
    const s = parseSettings(raw)
    expect(s.newCardsPerDay).toBe(20)
    expect(s.maxReviews).toBe(200)
    expect(s.graduatingInterval).toBe(1)
    expect(s.easyInterval).toBe(4)
    expect(s.startingEase).toBe(2.5)
    expect(s.masteredThreshold).toBe(21)
  })

  it('filters out NaN and zero/negative entries from step strings', () => {
    const result = parseSettings({ ...raw, learningSteps: '5 abc 0 -1 10' })
    expect(result.learningSteps).toEqual([5, 10]) // only 5 and 10 are valid
  })

  it('returns empty array for empty steps string', () => {
    const result = parseSettings({ ...raw, learningSteps: '' })
    expect(result.learningSteps).toEqual([])
  })
})

describe('serializeSettings', () => {
  it('serializes learning steps to space-separated string', () => {
    const settings: SRSSettings = { ...DEFAULT_SETTINGS, learningSteps: [1, 10] }
    const { learningSteps } = serializeSettings(settings)
    expect(learningSteps).toBe('1 10')
  })

  it('serializes relearning steps to space-separated string', () => {
    const settings: SRSSettings = { ...DEFAULT_SETTINGS, relearningSteps: [10, 20] }
    const { relearningSteps } = serializeSettings(settings)
    expect(relearningSteps).toBe('10 20')
  })

  it('round-trips through parse and serialize without data loss', () => {
    const raw = {
      newCardsPerDay:     15,
      maxReviews:         100,
      learningSteps:      '2 7 15',
      relearningSteps:    '5 10',
      graduatingInterval: 2,
      easyInterval:       7,
      startingEase:       2.3,
      masteredThreshold:  30,
    }
    const parsed     = parseSettings(raw)
    const serialized = serializeSettings(parsed)

    expect(serialized.learningSteps).toBe('2 7 15')
    expect(serialized.relearningSteps).toBe('5 10')
  })
})

// ─── Edge cases / regression ──────────────────────────────────────────────────

describe('Edge cases', () => {
  it('nextReviewAt is always in the future (never in the past)', () => {
    const result = calculateNextReview(card({ state: 'REVIEW', interval: 5, easeFactor: 2.5, repetition: 1 }), 'GOOD', DEFAULT_SETTINGS, NOW)
    expect(result.nextReviewAt.getTime()).toBeGreaterThan(NOW.getTime())
  })

  it('interval is always at least 1 for REVIEW transitions', () => {
    // Card with interval=0 (edge case)
    const zeroCard = card({ state: 'REVIEW', interval: 0, easeFactor: 2.5, repetition: 1 })
    const result   = calculateNextReview(zeroCard, 'HARD', DEFAULT_SETTINGS, NOW)
    expect(result.interval).toBeGreaterThanOrEqual(1)
  })

  it('ease cannot go below MIN_EASE (1.3) on successive HARD / AGAIN answers', () => {
    let c = card({ state: 'REVIEW', interval: 10, easeFactor: 1.3, repetition: 5 })
    for (let i = 0; i < 5; i++) {
      c = { ...c, ...calculateNextReview(c as any, 'AGAIN', DEFAULT_SETTINGS, NOW), state: 'REVIEW' }
    }
    expect((c as any).easeFactor).toBeGreaterThanOrEqual(1.3)
  })

  it('ease increases correctly with repeated EASY answers', () => {
    let c = card({ state: 'REVIEW', interval: 5, easeFactor: 2.5, repetition: 1 })
    const r1 = calculateNextReview(c, 'EASY', DEFAULT_SETTINGS, NOW)
    c = { ...c, ...r1 }
    const r2 = calculateNextReview(c, 'EASY', DEFAULT_SETTINGS, NOW)
    expect(r2.easeFactor).toBeGreaterThan(r1.easeFactor)
  })
})

/**
 * ─── Spaced Repetition System (SRS) — Anki-like Algorithm ───────────────────
 *
 * Implements SM-2 with Anki's state-machine extensions:
 *
 *   NEW        → card has never been studied
 *   LEARNING   → in short learning steps (minutes-based)
 *   REVIEW     → long-term spaced repetition (days-based)
 *   RELEARNING → failed a REVIEW card; back to short steps before re-entering REVIEW
 *   MASTERED   → interval ≥ masteredThreshold days (still reviewed normally)
 *
 * Key design decisions:
 *  - Learning / relearning use addMinutes() for next-due timestamps.
 *  - Review / mastered use addDays() for next-due timestamps.
 *  - Ease is clamped at [1.3, ∞); default 2.5.
 *  - Graduating from LEARNING: Good → graduatingInterval days; Easy → easyInterval days.
 *  - Failing in REVIEW drops ease by 0.2 and moves into RELEARNING.
 *  - MASTERED is purely cosmetic — cards are processed identically to REVIEW.
 */

export type FlashcardState = 'NEW' | 'LEARNING' | 'REVIEW' | 'RELEARNING' | 'MASTERED'
export type ReviewAnswer   = 'AGAIN' | 'HARD' | 'GOOD' | 'EASY'

// ─── Settings ────────────────────────────────────────────────────────────────

export interface SRSSettings {
  newCardsPerDay:     number
  maxReviews:         number
  /** Learning steps in minutes, e.g. [1, 10] */
  learningSteps:      number[]
  /** Relearning steps in minutes, e.g. [10] */
  relearningSteps:    number[]
  /** Days until first REVIEW after graduating from LEARNING with Good */
  graduatingInterval: number
  /** Days for first REVIEW if graduated with Easy */
  easyInterval:       number
  startingEase:       number
  /** Interval (days) at which a card is marked MASTERED */
  masteredThreshold:  number
}

export const DEFAULT_SETTINGS: SRSSettings = {
  newCardsPerDay:     20,
  maxReviews:         200,
  learningSteps:      [1, 10],
  relearningSteps:    [10],
  graduatingInterval: 1,
  easyInterval:       4,
  startingEase:       2.5,
  masteredThreshold:  21,
}

// ─── Card data shape expected by the algorithm ───────────────────────────────

export interface SRSCardData {
  state:          FlashcardState
  interval:       number        // days
  easeFactor:     number
  repetition:     number
  stepIndex:      number
  nextReviewAt:   Date | null
  lastReviewedAt: Date | null
  lastResult?:    string | null
}

export interface SRSUpdateResult {
  state:          FlashcardState
  interval:       number
  easeFactor:     number
  repetition:     number
  stepIndex:      number
  nextReviewAt:   Date
  lastReviewedAt: Date
  lastResult:     ReviewAnswer
}

// ─── Internal helpers ─────────────────────────────────────────────────────────

const MIN_EASE = 1.3

function clamp(value: number, min: number, max: number): number {
  return Math.max(min, Math.min(max, value))
}

/** Add `minutes` to a Date (used for LEARNING / RELEARNING step scheduling). */
function addMinutes(date: Date, minutes: number): Date {
  return new Date(date.getTime() + minutes * 60 * 1000)
}

/**
 * Add `days` to a Date (starts at the same time-of-day).
 * Always rounds to at least 1 day so we never schedule in the past.
 */
function addDays(date: Date, days: number): Date {
  const d = new Date(date)
  d.setDate(d.getDate() + Math.max(1, Math.round(days)))
  return d
}

function endOfDay(date: Date): Date {
  const d = new Date(date)
  d.setHours(23, 59, 59, 999)
  return d
}

// ─── Core algorithm ───────────────────────────────────────────────────────────

/**
 * Calculate the next SRS state after a user answers a card.
 *
 * This is the ONLY place where spaced-repetition logic lives. All API routes
 * should call this function rather than re-implementing the algorithm.
 *
 * @param card     - Current SRS fields read from the database
 * @param answer   - The user's rating (AGAIN | HARD | GOOD | EASY)
 * @param settings - Decoded SRS settings for this user
 * @param now      - Injectable current time (useful for tests)
 */
export function calculateNextReview(
  card:     SRSCardData,
  answer:   ReviewAnswer,
  settings: SRSSettings,
  now:      Date = new Date(),
): SRSUpdateResult {
  const {
    learningSteps,
    relearningSteps,
    graduatingInterval,
    easyInterval,
    masteredThreshold,
  } = settings

  // Mutable working copy of key fields
  let state      = card.state
  let interval   = card.interval
  let easeFactor = card.easeFactor
  let repetition = card.repetition
  let stepIndex  = card.stepIndex
  let nextReviewAt: Date

  // ── NEW / LEARNING ─────────────────────────────────────────────────────────
  //
  // Steps are minute-based.  On Good the card advances one step; on the last
  // step it graduates straight into REVIEW (or MASTERED).
  if (state === 'NEW' || state === 'LEARNING') {
    state = 'LEARNING'

    switch (answer) {
      case 'AGAIN':
        // Failed: restart from step 0
        stepIndex    = 0
        nextReviewAt = addMinutes(now, learningSteps[0] ?? 1)
        break

      case 'HARD':
        // Stay on current step but wait 50 % longer
        nextReviewAt = addMinutes(now, (learningSteps[stepIndex] ?? 1) * 1.5)
        break

      case 'GOOD': {
        const nextStep = stepIndex + 1
        if (nextStep >= learningSteps.length) {
          // Graduate to REVIEW
          interval   = graduatingInterval
          repetition = 1
          stepIndex  = 0
          state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
          nextReviewAt = addDays(now, interval)
        } else {
          stepIndex    = nextStep
          nextReviewAt = addMinutes(now, learningSteps[nextStep])
        }
        break
      }

      case 'EASY':
        // Graduate immediately with easy-interval bonus
        interval   = easyInterval
        repetition = 1
        stepIndex  = 0
        easeFactor = clamp(easeFactor + 0.15, MIN_EASE, 9.99)
        state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
        nextReviewAt = addDays(now, interval)
        break
    }
  }

  // ── RELEARNING ─────────────────────────────────────────────────────────────
  //
  // Triggered when the user fails a REVIEW card.  Works like LEARNING but
  // uses the shorter relearningSteps array.  On graduation the card restores
  // to REVIEW keeping (the already-reduced) interval.
  else if (state === 'RELEARNING') {
    switch (answer) {
      case 'AGAIN':
        stepIndex    = 0
        nextReviewAt = addMinutes(now, relearningSteps[0] ?? 10)
        break

      case 'HARD':
        nextReviewAt = addMinutes(now, (relearningSteps[stepIndex] ?? 10) * 1.5)
        break

      case 'GOOD': {
        const nextStep = stepIndex + 1
        if (nextStep >= relearningSteps.length) {
          // Graduate back to REVIEW with existing (already penalised) interval
          stepIndex  = 0
          repetition += 1
          state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
          nextReviewAt = addDays(now, interval)
        } else {
          stepIndex    = nextStep
          nextReviewAt = addMinutes(now, relearningSteps[nextStep])
        }
        break
      }

      case 'EASY':
        // Graduate immediately; give a slight interval bonus
        stepIndex  = 0
        interval   = Math.max(interval + 1, easyInterval)
        repetition += 1
        easeFactor = clamp(easeFactor + 0.15, MIN_EASE, 9.99)
        state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
        nextReviewAt = addDays(now, interval)
        break
    }
  }

  // ── REVIEW / MASTERED ──────────────────────────────────────────────────────
  //
  // Standard SM-2 day-based scheduling.  The MASTERED state is treated
  // identically — it is just a cosmetic label meaning the interval is large.
  else {
    switch (answer) {
      case 'AGAIN':
        // Fail: drop ease, move to RELEARNING, keep current interval for later
        state      = 'RELEARNING'
        stepIndex  = 0
        easeFactor = clamp(easeFactor - 0.2, MIN_EASE, 9.99)
        // Schedule the first relearning step in minutes, NOT days
        nextReviewAt = addMinutes(now, relearningSteps[0] ?? 10)
        break

      case 'HARD':
        // Below expectations: multiply interval by 1.2 only; penalise ease
        interval   = Math.max(interval + 1, Math.round(interval * 1.2))
        easeFactor = clamp(easeFactor - 0.15, MIN_EASE, 9.99)
        repetition += 1
        state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
        nextReviewAt = addDays(now, interval)
        break

      case 'GOOD':
        // As expected: multiply by ease factor
        interval   = Math.max(interval + 1, Math.round(interval * easeFactor))
        repetition += 1
        state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
        nextReviewAt = addDays(now, interval)
        break

      case 'EASY':
        // Better than expected: ease × 1.3 bonus; increase ease
        interval   = Math.max(interval + 1, Math.round(interval * easeFactor * 1.3))
        easeFactor = clamp(easeFactor + 0.15, MIN_EASE, 9.99)
        repetition += 1
        state      = interval >= masteredThreshold ? 'MASTERED' : 'REVIEW'
        nextReviewAt = addDays(now, interval)
        break
    }
  }

  return {
    state,
    interval,
    easeFactor,
    repetition,
    stepIndex,
    nextReviewAt:   nextReviewAt!,
    lastReviewedAt: now,
    lastResult:     answer,
  }
}

// ─── Filtering helpers ────────────────────────────────────────────────────────

/**
 * Returns true if the card should appear in the current study session.
 *
 * Rules:
 *  - NEW cards are always available.
 *  - LEARNING / RELEARNING cards are shown if they are due within `minuteBuffer`
 *    minutes from now (so the session doesn't feel empty between steps).
 *  - REVIEW / MASTERED cards are shown if they are due on or before end-of-today.
 */
export function isCardDue(
  card:         SRSCardData,
  now:          Date = new Date(),
  minuteBuffer: number = 20,
): boolean {
  if (card.state === 'NEW') return true
  if (!card.nextReviewAt)  return true

  const dueAt = new Date(card.nextReviewAt)

  if (card.state === 'LEARNING' || card.state === 'RELEARNING') {
    return dueAt <= addMinutes(now, minuteBuffer)
  }

  // REVIEW / MASTERED: due today or earlier
  return dueAt <= endOfDay(now)
}

// ─── Urgency scoring / sorting ────────────────────────────────────────────────

/**
 * Return a numeric urgency score (lower = more urgent).
 *
 * Priority order:
 *  1 — RELEARNING overdue (failed cards that need immediate attention)
 *  2 — REVIEW / MASTERED overdue
 *  3 — LEARNING due now / soon
 *  4 — REVIEW / MASTERED due today
 *  5 — NEW cards
 *  6 — MASTERED (future)
 *  7 — Everything else (future reviews)
 */
export function getCardUrgency(card: SRSCardData, now: Date = new Date()): number {
  const dueAt = card.nextReviewAt ? new Date(card.nextReviewAt) : null

  switch (card.state) {
    case 'RELEARNING':
      return dueAt && dueAt < now ? 1 : 3

    case 'REVIEW': {
      if (!dueAt)              return 4
      if (dueAt < now)         return 2
      if (dueAt <= endOfDay(now)) return 4
      return 7
    }

    case 'MASTERED': {
      if (!dueAt)              return 6
      if (dueAt < now)         return 2
      if (dueAt <= endOfDay(now)) return 4
      return 6
    }

    case 'LEARNING':
      return dueAt && dueAt < now ? 1 : 3

    case 'NEW':
      return 5

    default:
      return 7
  }
}

/**
 * Sort an array of cards by urgency (most urgent first).
 * Within the same urgency bucket, earlier due dates come first.
 */
export function sortByUrgency<T extends SRSCardData>(cards: T[], now: Date = new Date()): T[] {
  return [...cards].sort((a, b) => {
    const diff = getCardUrgency(a, now) - getCardUrgency(b, now)
    if (diff !== 0) return diff

    // Secondary: earlier due date wins
    const aMs = a.nextReviewAt ? new Date(a.nextReviewAt).getTime() : 0
    const bMs = b.nextReviewAt ? new Date(b.nextReviewAt).getTime() : 0
    return aMs - bMs
  })
}

// ─── Settings parsing ─────────────────────────────────────────────────────────

/**
 * Convert a DB row from `flashcard_settings` (steps stored as space-separated
 * strings) into the typed SRSSettings object used by the algorithm.
 */
export function parseSettings(db: {
  newCardsPerDay:     number
  maxReviews:         number
  learningSteps:      string
  relearningSteps:    string
  graduatingInterval: number
  easyInterval:       number
  startingEase:       number
  masteredThreshold:  number
}): SRSSettings {
  const parseSteps = (s: string) =>
    s.split(' ').map(Number).filter((n) => !isNaN(n) && n > 0)

  return {
    newCardsPerDay:     db.newCardsPerDay,
    maxReviews:         db.maxReviews,
    learningSteps:      parseSteps(db.learningSteps),
    relearningSteps:    parseSteps(db.relearningSteps),
    graduatingInterval: db.graduatingInterval,
    easyInterval:       db.easyInterval,
    startingEase:       db.startingEase,
    masteredThreshold:  db.masteredThreshold,
  }
}

/**
 * Format a SRSSettings object back into the DB representation.
 */
export function serializeSettings(s: SRSSettings): {
  learningSteps:   string
  relearningSteps: string
} {
  return {
    learningSteps:   s.learningSteps.join(' '),
    relearningSteps: s.relearningSteps.join(' '),
  }
}

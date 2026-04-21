# Adaptive Learning System

Technical reference for the personalised learning engine that drives task recommendations, practice sessions, and spaced-repetition flashcard scheduling.

---

## Table of Contents

1. [Overview](#1-overview)
2. [Content Structure and Tagging](#2-content-structure-and-tagging)
3. [Tag System Architecture](#3-tag-system-architecture)
4. [Tag-Based Skill Analytics](#4-tag-based-skill-analytics)
5. [Adaptive Task Recommendations](#5-adaptive-task-recommendations)
6. [Practice Session Composition](#6-practice-session-composition)
7. [Spaced Repetition — Flashcard System](#7-spaced-repetition--flashcard-system)
8. [Combined Learning Flow](#8-combined-learning-flow)
9. [Configuration and Tuning](#9-configuration-and-tuning)

---

## 1. Overview

The adaptive learning system personalises the study experience for each student by tracking their performance history on a per-tag basis and using that data to surface the most valuable practice material. It is built from three cooperating subsystems:

| Subsystem | Location | Responsibility |
|-----------|----------|----------------|
| **Skill analytics** | `lib/analytics.ts` | Aggregates `task_progress` rows into per-tag statistics. Outputs tag weakness scores used by other subsystems. |
| **Task recommendation engine** | `app/api/recommend/tasks/route.ts` | Selects practice tasks from the CMS based on weakness scores, past errors, or random variety. |
| **Spaced repetition (SRS)** | `lib/srs.ts` + `app/api/flashcards/` | Schedules flashcard reviews per user using the SM-2 algorithm. Study session ordering is also influenced by weakness scores. |

The subsystems are **orthogonal**: the SRS algorithm and the task recommendation engine each call `getUserWeakTags()` independently. There is no shared state between the two beyond what `lib/analytics.ts` derives from current `task_progress` rows.

---

## 2. Content Structure and Tagging

### 2.1 Content hierarchy (Payload CMS — `payload` schema)

```
Organization of learning material:

  Subject
    └── Course  (one subject, many courses)
          └── Module  (ordered sections)
                └── Lesson  (rich-text content blocks)
                      └── Task  (question + correct answer)
                                │
                                └── tags  (N-to-many Tag records)
```

Tasks are the atomic unit of knowledge assessment. Each task can be assigned one or more `Tag` records that describe which knowledge areas the task covers. Examples: `algebra`, `sorting-algorithms`, `cell-biology`.

### 2.2 Flashcards

Flashcards are a parallel study mechanism: they are **not** lesson blocks. Each card lives in the `public` schema on a **`FlashcardDeck`** (`Flashcard.deckId`). Like tasks, each flashcard can carry multiple **`Tag`** records.

**Deck shapes:**

- **Course-linked** — A course can have one **main** deck (`FlashcardDeck.courseId`, no `parentDeckId`). **Subdecks** are children of that main (`parentDeckId`), typically one per **module** (`moduleId`). Cards for curriculum content are assigned to **subdecks**; the course main deck is structural (card placement rules are enforced in `lib/validate-flashcard-refs.ts` and the flashcard APIs).
- **Standalone** — Decks with **no** `courseId` are collections outside the course tree. The standalone **main** may hold **direct** cards; optional **subdecks** nest under that main for topical splits. **Study access** for standalone trees is gated: the learner must have enrolled the **root** main deck (`UserStandaloneFlashcardDeck` row, created from **`POST /api/flashcards/standalone-decks/enroll`**). Course-linked decks do not use that join. Enforcement lives in **`lib/flashcards-study-access.ts`** (`assertUserCanStudyDeckScope`), called from **`GET /api/flashcards/study`** when `mainDeckSlug` or `subdeckSlug` is present.

Admins manage hierarchy and cards at **`/admin/flashcards`**; see `PLATFORM_FEATURES.md` § *Flashcards and deck hierarchy*.

Flashcard tags feed into the SRS session ordering (see [Section 7.3](#73-weak-tag-ordering-in-srs-sessions)) but do not currently feed into the task recommendation analytics, since task performance and flashcard performance are tracked separately.

---

## 3. Tag System Architecture

### 3.1 Canonical tag storage

`Tag` records are the canonical source of truth and live in the `public` schema:

```
public.tags
  id    String  — cuid, primary key
  name  String  — unique display name
  slug  String  — unique URL-safe kebab-case identifier
  main  Boolean — whether the tag appears in the default UI filter bar
```

### 3.2 Tag assignment paths

Tags reach tasks and flashcards through different paths:

| Path | Table | Type |
|------|-------|------|
| Flashcard ↔ Tag | `public._FlashcardTags` (implicit) | Prisma many-to-many |
| TaskProgressTag ↔ Tag | `public.task_progress_tags` | Normalised join, with cascade |
| Payload task ↔ Tag name/slug | `payload.tasks_tags` | Denormalised copy, no FK |

### 3.3 Cross-schema tag synchronisation

The `payload.tasks_tags` table stores denormalised `name` and `slug` columns to allow Payload CMS to display tag names without querying the `public` schema. Changes to a canonical `Tag` are propagated by updating matching `tasks` documents through Payload APIs:

```typescript
// PUT /api/tags/[id]
const { docs } = await payload.find({
  collection: 'tasks',
  where: { 'tags.tagId': { equals: id } },
})

for (const task of docs) {
  const next = task.tags.map((t) =>
    t?.tagId === id ? { ...t, name: newName, slug: newSlug } : t
  )
  await payload.update({
    collection: 'tasks',
    id: String(task.id),
    data: { tags: next },
  })
}
```

```typescript
// DELETE /api/tags/[id]
await removeTagFromTasks(id)
await prisma.tag.delete({ where: { id } })
```

Both operations are wrapped in `try/catch` so task-tag sync failures do not abort the primary mutation.

### 3.4 Task submission tag sync

When a student submits a task answer, the tags declared in the Payload task's metadata are resolved against canonical `Tag` records in `public.tags` and written to `public.task_progress_tags` as a normalised many-to-many relationship:

```typescript
// app/actions/submit-task.ts (simplified)
const canonicalTags = await prisma.tag.findMany({
  where: {
    OR: [
      { slug: { in: normalisedTaskTagSlugs } },
      { name: { in: taskTagNames } },
    ],
  },
})

await prisma.$transaction(
  canonicalTags.map((t) =>
    prisma.taskProgressTag.upsert({
      where:  { taskProgressId_tagId: { taskProgressId: taskProgress.id, tagId: t.id } },
      create: { taskProgressId: taskProgress.id, tagId: t.id },
      update: {},
    })
  )
)
```

This sync is **best-effort, non-blocking**: failures are logged with `console.warn` but do not roll back the task submission.

---

## 4. Tag-Based Skill Analytics

All adaptive content selection is derived from the statistics computed in `lib/analytics.ts`. No ML models or external services are used — the analytics are computed on-demand from the append-only `task_attempts` event log.

### 4.0 Data model note (latest state + full history)

`TaskProgress` still keeps latest per-task state via `(userId, taskId)` + `upsert`, while `TaskAttempt` now stores one row per submission for longitudinal analytics. Adaptive scoring and review-history logic read from `task_attempts`.

### 4.1 `getUserTagStats(userId)`

Returns a `TagStat[]` array with one entry per tag the user has encountered.

**Query:**

```typescript
const records = await prisma.taskAttempt.findMany({
  where:  { userId },
  select: {
    taskAttemptTags: { select: { tag: { select: { name: true } } } },
    isCorrect:        true,
    attemptedAt:      true,
  },
})
```

**Aggregation algorithm:**

```
For each TaskAttempt row:
  For each tag linked via taskAttemptTags:
    acc[tag].attempts      += 1
    acc[tag].correct       += isCorrect ? 1 : 0
    acc[tag].lastAttemptAt  = max(lastAttemptAt, row.attemptedAt)

For each tag, derive:
  successRate = correct / attempts
  score       = (correct + 1) / (attempts + 2)   ← Laplace (add-one) smoothing
```

The **Laplace-smoothed score** prevents tags with very few attempts from dominating the weakness ranking. A tag seen zero times receives a neutral prior of 0.5; a tag with one wrong answer receives 0.33 rather than 0.0.

**`TagStat` shape:**

| Field | Type | Description |
|-------|------|-------------|
| `tag` | `string` | Tag name from `public.tags` |
| `attempts` | `number` | Total task submissions including this tag |
| `correct` | `number` | Submissions where `isCorrect = true` |
| `successRate` | `number` | `correct / attempts` |
| `score` | `number` | Bayesian-smoothed score in (0, 1) |
| `lastAttemptAt` | `Date \| null` | Timestamp of the most recent attempt |

### 4.2 `getUserWeakTags(userId)`

Wraps `getUserTagStats`, computes `weakness = 1 - successRate`, and sorts descending:

```typescript
return stats
  .map((s): WeakTag => ({ tag: s.tag, weakness: 1 - s.successRate }))
  .sort((a, b) => b.weakness - a.weakness)
```

A tag with `weakness = 1.0` means every attempt was wrong. A tag with `weakness = 0.0` means every attempt was correct.

### 4.3 Performance characteristics

- **Query cost:** One single `findMany` with nested includes per call. With typical student histories (hundreds to low thousands of task_progress rows) this runs well under 50 ms.
- **Caching:** Results are cached per user in-memory for 60 seconds (`CACHE_TTL_MS = 60_000`) in `lib/analytics.ts`. Cache entries are invalidated after new task submissions.
- **Minimum data required:** The user needs at least one completed task for any tags to appear. Routes that call `getUserWeakTags` gracefully handle the empty-array case.

---

## 5. Adaptive Task Recommendations

**Endpoint:** `GET /api/recommend/tasks?limit=<n>&mode=<mode>`

The recommendation engine fetches up to `CANDIDATE_LIMIT = 300` published tasks from Payload CMS, then scores and filters them using the analytics layer.

### 5.1 Query parameters

| Parameter | Default | Options | Description |
|-----------|---------|---------|-------------|
| `limit` | 5 | 1–20 | Number of tasks to return |
| `mode` | `"weak"` | `"weak"` \| `"review"` \| `"mixed"` | Selection strategy |

### 5.2 Mode: `weak` — exploit the user's knowledge gaps

1. Fetch top-3 weakest tags from `getUserWeakTags()`.
2. For each published task, compute a weakness score based on how many of the task's tags overlap with the weak-tag set, weighted by tag weakness.
3. Apply bonuses:
   - **Novelty bonus (`+0.3`):** task has never been attempted by this user.
   - **Staleness bonus (`+0.2`):** task was last attempted more than 7 days ago.
4. Sort by score descending, return top `limit` results.

**Score formula for a single task:**

```
score = Σ (weakness of matching tags)
      + 0.3  if never attempted
      + 0.2  if last attempted ≥ 7 days ago
```

### 5.3 Mode: `review` — target previously wrong answers

1. Load all `TaskProgress` rows for the user, ordered by `attemptedAt` descending.
2. Build a set of task IDs ever answered correctly.
3. Of tasks answered incorrectly, exclude any that have since been answered correctly.
4. Match remaining task IDs against the Payload task documents.
5. Return the `limit` most recently attempted wrong answers.

This mode effectively shows the student a list of "things you got wrong and haven't fixed yet."

### 5.4 Mode: `mixed` — balanced variety

Blends all three pools proportionally:

| Allocation | Source |
|-----------|--------|
| ~40% | `weakMode` results |
| ~30% | `reviewMode` results |
| ~30% | Random published tasks |

Tasks already present in the weak or review pools are deduplicated before random tasks are selected. The three slices are then interleaved to produce a varied list.

### 5.5 Response shape

```json
{
  "tasks": [
    {
      "id": "abc123",
      "question": "What is the time complexity of merge sort?",
      "tags": ["sorting-algorithms", "complexity"],
      "score": 1.52
    }
  ],
  "explanation": "Tasks selected because the user struggles with tags: sorting-algorithms, recursion, trees",
  "mode": "weak"
}
```

---

## 6. Practice Session Composition

**Endpoint:** `GET /api/practice/session?limit=<n>`

Generates a single practice queue of up to `limit` tasks (default 10, max 50) balanced across three skill-level bands.

### 6.1 Session composition

| Band | Target share | Source |
|------|-------------|--------|
| **Weak** | ~40% | Tasks whose tags overlap with the user's top-3 weakest tags |
| **Medium** | ~30% | Tasks whose tags fall in the 0.40–0.70 success-rate band |
| **Random** | ~30% | Any remaining published tasks |

### 6.2 Exclusion and fill

Tasks already solved correctly are removed from all three pools first. If a pool runs dry before its quota is filled, already-solved tasks are added back. In normal datasets this fills the requested `limit`; if the total unique candidate pool is smaller than `limit`, the response can still be shorter.

### 6.3 Session flow

```
Step 1: getUserTagStats + getUserWeakTags (parallel fetch)
Step 2: Build solved-correctly exclusion set from task_progress
Step 3: Fetch up to 300 published tasks from Payload CMS
Step 4: Partition tasks into three bands: weak / medium / random
Step 5: Shuffle each band (Fisher-Yates)
Step 6: Pick proportional quotas with deduplication
Step 7: Return sessionId + ordered task queue
```

The `sessionId` is a random UUID generated per request. It is informational — the client may use it to correlate session analytics, but there is no corresponding database record.

### 6.4 Medium-tag definition

A tag is in the "medium" band if its success rate is between 0.40 and 0.70 (inclusive of 0.40, exclusive of 0.70). Tags below 0.40 are in the "weak" band; tags at 0.70 and above are considered solid knowledge not prioritised for practice.

---

## 7. Spaced Repetition — Flashcard System

### 7.1 SM-2 algorithm (`lib/srs.ts`)

The SRS algorithm is implemented as a **pure function** with no database dependencies:

```typescript
calculateNextReview(card: SRSCardData, answer: ReviewAnswer, settings: SRSSettings): SRSUpdateResult
```

It implements a standard SM-2 state machine with Anki-style extensions:

```
State transitions:

  NEW        ──[any answer]──► LEARNING
  LEARNING   ──[GOOD/EASY]──► REVIEW        (graduated)
  LEARNING   ──[AGAIN]──────► LEARNING      (reset steps)
  REVIEW     ──[GOOD/EASY]──► REVIEW        (interval grows)
  REVIEW     ──[AGAIN]──────► RELEARNING    (ease drops by 0.2)
  RELEARNING ──[GOOD/EASY]──► REVIEW        (re-enters at short interval)
  REVIEW     ──[interval ≥ masteredThreshold]──► MASTERED
  MASTERED   ──[any review]──────────────────► MASTERED (if still above threshold)
```

| Answer | Effect |
|--------|--------|
| `AGAIN` | Reset to step 0 of current learning/relearning steps; reduce ease (if in REVIEW) |
| `HARD` | Stay at current step or increase interval by 1.2× in REVIEW |
| `GOOD` | Advance to next step; graduate to REVIEW when steps exhausted |
| `EASY` | Skip remaining steps; graduate immediately with `easyInterval` |

### 7.2 Per-user SRS state (`UserFlashcardProgress`)

Every user has an independent SRS schedule for each flashcard. The `UserFlashcardProgress` table stores the full SM-2 state:

| Field | Type | Description |
|-------|------|-------------|
| `state` | `FlashcardState` | Current state in the SM-2 state machine |
| `interval` | `Int` | Current review interval in days |
| `easeFactor` | `Float` | Ease multiplier (clamped ≥ 1.3, default 2.5) |
| `repetition` | `Int` | Count of successful consecutive reviews |
| `stepIndex` | `Int` | Position within learning/relearning steps array |
| `nextReviewAt` | `DateTime?` | Timestamp when card is next due |
| `lastReviewedAt` | `DateTime?` | Timestamp of the most recent review |
| `lastResult` | `LastResult?` | Last answer: `AGAIN \| HARD \| GOOD \| EASY` |

When a user first reviews a card, a new `UserFlashcardProgress` row is created using canonical defaults from `DEFAULT_SETTINGS` in `lib/srs.ts` (state `NEW`, interval `0`, easeFactor `2.5`).

### 7.3 Weak-tag ordering in SRS sessions

`GET /api/flashcards/study` uses weak-tag scores to reorder the study deck within the set of due cards:

```
Eligibility (filters): SRS determines WHICH cards are due
Ordering (weak bonus): analytics determines the ORDER within due cards

score = getCardUrgency(card, now) + (card_has_weak_tag ? WEAK_TAG_BONUS : 0)
```

`WEAK_TAG_BONUS = 0.5`. Cards tagged with one of the user's weakest topics receive a route-level ordering bonus.

### 7.4 SRS session modes

`GET /api/flashcards/study?mode=<mode>&tagSlug=<slug>&subject=<slug>&deckSlug=<slug>&subdeckSlug=<slug>&mainDeckSlug=<slug>`

| Mode | Behaviour |
|------|-----------|
| `srs` (default) | Shows only cards that are due now; respects `newCardsPerDay` and `maxReviews` daily budgets |
| `free` | Shows all cards in the set regardless of schedule; no daily limits |

Optional filters scope candidate cards before SRS/free rules:

- **`tagSlug`**, **`subject`** — topic / catalog-style narrowing.
- **`deckSlug`** (legacy alias) or **`subdeckSlug`** — limit to a **single** deck by slug (use one of these; do not combine with `mainDeckSlug`).
- **`mainDeckSlug`** — include cards on that **main** deck **plus** all of its **subdecks** (resolved by slug). Mutually exclusive with `deckSlug` / `subdeckSlug` in the handler.

**Access:** for **standalone** roots (no `courseId`), the route rejects the request unless the current user is enrolled on that root (`UserStandaloneFlashcardDeck`). Course mains remain available to any signed-in user.

In `srs` mode, the daily new-card budget is calculated via a `count` query rather than by loading all progress rows:

```typescript
const newReviewedToday = await prisma.userFlashcardProgress.count({
  where: {
    userId: user.id,
    state:  { not: 'NEW' },
    lastReviewedAt: { gte: startOfToday },
  },
})
const newBudget = Math.max(0, settings.newCardsPerDay - newReviewedToday)
```

### 7.5 Per-user SRS settings (`FlashcardSettings`)

Every user can customise their SRS parameters. If no settings row exists, one is created with these defaults on first access:

| Setting | Default | Description |
|---------|---------|-------------|
| `newCardsPerDay` | 20 | Daily budget for introducing new cards |
| `maxReviews` | 200 | Daily cap on review-state card sessions |
| `learningSteps` | `"1 10"` | Minutes between prompts during learning |
| `relearningSteps` | `"10"` | Minutes for cards that failed a review |
| `graduatingInterval` | 1 | Days to first REVIEW after completing learning (Good) |
| `easyInterval` | 4 | Days to first REVIEW if Easy during learning |
| `startingEase` | 2.5 | Initial ease factor for all new cards |
| `masteredThreshold` | 21 | Interval (days) at which a card is promoted to MASTERED |

Settings are serialised as space-delimited strings in the database (`learningSteps = "1 10"`) and parsed back to `number[]` by `parseSettings()` in `lib/srs.ts`.

---

## 8. Combined Learning Flow

The following describes a complete learning arc from first login through adaptive study.

### 8.1 First visit (cold start)

1. Student authenticates and opens a course.
2. They submit their first task answers. The `submitTaskAnswer` action creates `TaskProgress` rows and syncs `TaskProgressTag` records.
3. Before any tagged progress exists, `getUserWeakTags()` returns an empty list. `GET /api/recommend/tasks?mode=weak` therefore returns an empty `tasks` array with an explanation prompting the user to submit tasks first.

### 8.2 After several task submissions

1. Tag statistics accumulate across multiple lesson completions.
2. `GET /api/recommend/tasks?mode=weak` begins surfacing tasks that cover underperforming tags.
3. `GET /api/practice/session` generates sessions where ~40% of tasks are in the student's weakest knowledge areas.

### 8.3 Flashcard study alongside tasks

1. Student opens the flashcard study interface.
2. `GET /api/flashcards/study?mode=srs` returns only due cards, ordered by urgency plus weak-tag bonus.
3. The student provides answers (`AGAIN / HARD / GOOD / EASY`). Each answer triggers `POST /api/flashcards/[id]/review`, which runs the SM-2 algorithm and writes the updated state to `UserFlashcardProgress`.
4. Cards reviewed as `GOOD` or `EASY` are rescheduled to a future date. Cards reviewed as `AGAIN` re-enter the learning steps immediately.

### 8.4 Adaptive feedback loop

```
Task submission
  └── TaskProgressTag written
  └── Aggregated by getUserTagStats()
  └── getUserWeakTags() ranks knowledge gaps

          │                               │
          ▼                               ▼
  Task recommendations             Flashcard study
  (recommend/tasks)                (flashcards/study)
  focus on weak tags               boost weak-tag cards
```

Both surfaces consume the same analytics functions. The feedback loop tightens as the student accumulates more history — the recommendations become more personalised and the flashcard ordering becomes more targeted.

---

## 9. Configuration and Tuning

### 9.1 Recommendation engine constants

Defined at the top of `app/api/recommend/tasks/route.ts`:

| Constant | Value | Effect |
|----------|-------|--------|
| `TOP_WEAK_TAGS` | 3 | How many of the user's weakest tags to consider |
| `CANDIDATE_LIMIT` | 300 | Maximum tasks fetched from Payload CMS |
| `STALE_DAYS` | 7 | Days after which a stale task gets a staleness bonus |
| `BONUS_NEW` | 0.3 | Score bonus for never-attempted tasks |
| `BONUS_STALE` | 0.2 | Score bonus for tasks not attempted in ≥ 7 days |

### 9.2 Practice session constants

Defined at the top of `app/api/practice/session/route.ts`:

| Constant | Value | Effect |
|----------|-------|--------|
| `TOP_WEAK_TAGS` | 3 | Weak-band tag window |
| `CANDIDATE_LIMIT` | 300 | Maximum tasks fetched from Payload CMS |
| `DEFAULT_LIMIT` | 10 | Default session length |
| `MAX_LIMIT` | 50 | Maximum session length (capped server-side) |

### 9.3 Medium-tag band threshold

The `0.40–0.70` success-rate window for the medium band is hardcoded in `app/api/practice/session/route.ts`. Narrowing the window (e.g. `0.45–0.65`) makes the medium band more selective. Widening it overlaps more with the weak band.

### 9.4 SRS defaults

`DEFAULT_SETTINGS` in `lib/srs.ts` is the runtime default object used by SRS logic and per-user progress bootstrap. Database defaults for new `FlashcardSettings` rows are defined in `prisma/schema.prisma` (`@default(...)` values). Keep both aligned when tuning.

### 9.5 Tuning notes

- Task analytics and review-history logic use append-only `TaskAttempt` events; `TaskProgress` remains the latest-state snapshot used by other progress flows.
- `mode=weak` recommendations are empty for cold-start users until at least one tagged task result is recorded.
- Study ordering in `GET /api/flashcards/study` uses route-level numeric sorting (`getCardUrgency + weak-tag bonus`) rather than a strict two-pass comparator.

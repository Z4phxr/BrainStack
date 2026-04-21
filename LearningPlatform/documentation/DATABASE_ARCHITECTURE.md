# Database Architecture


## Table of Contents

1. [Overview](#1-overview)
2. [Database Technology](#2-database-technology)
3. [Data Model](#3-data-model)
4. [Data Flow](#4-data-flow)
5. [Query Strategy](#5-query-strategy)
6. [Indexing and Performance Considerations](#6-indexing-and-performance-considerations)
7. [Data Integrity](#7-data-integrity)
8. [Data Access Layer](#8-data-access-layer)
9. [Scalability Considerations](#9-scalability-considerations)

---

## 1. Overview

This document focuses on the platform's database architecture: schema ownership, data boundaries, relationships, integrity strategy, and query/performance patterns.

The system uses a dual-schema PostgreSQL setup so application data and CMS-managed content can evolve independently while still being coordinated at the app layer.

The platform uses a **single PostgreSQL instance** divided into two independent schemas:

| Schema | Owner | Purpose |
|--------|-------|---------|
| `public` | Prisma ORM | User accounts, authentication, progress tracking, flashcards, tags, activity logs |
| `payload` | Payload CMS | Course catalog — courses, modules, lessons, tasks, subjects, media |

This separation exists because the two schemas have fundamentally different write characteristics and ownership models. The `payload` schema is managed by Payload migrations/configuration. The `public` schema is owned by Prisma and evolves through explicit, versioned migrations under developer control.

While PostgreSQL can support cross-schema references, this project intentionally does not define DB-level FKs between Prisma-managed and Payload-managed entities. Cross-schema references (for example, `LessonProgress.lessonId` pointing to a Payload lesson) are stored as plain string fields and enforced at the application level via server actions/API logic and Payload hooks.

---

## 2. Database Technology

### Database system

**PostgreSQL** is used as the sole database. A single instance hosts both the `public` and `payload` schemas.

### Prisma ORM (`public` schema)

The `public` schema is accessed via **Prisma v7** using the native driver adapter pattern:

```typescript
import { PrismaClient } from '@prisma/client'
import { PrismaPg } from '@prisma/adapter-pg'
import { Pool } from 'pg'

const pool = new Pool({
  connectionString: sanitizeDatabaseUrl(process.env.DATABASE_URL),
  connectionTimeoutMillis: 5000,
  max: 10,
  ssl: process.env.DATABASE_URL?.includes('sslmode') ? { rejectUnauthorized: false } : false,
})

const adapter = new PrismaPg(pool)
const client = new PrismaClient({ adapter })
```

The `@prisma/adapter-pg` package connects Prisma to a `pg.Pool` instance rather than Prisma's default connection manager. This gives explicit control over connection pooling.

### Connection pool

The connection pool is capped at **10 connections** (`max: 10`), matching the constraints of the Railway free-tier PostgreSQL plan (approximately 25 total connections). The pool is stored on `globalThis` as a singleton to prevent Next.js hot-module reloads from creating new pools on each file change during development.

```typescript
const globalForPrisma = globalThis as unknown as {
  prisma: PrismaClient | undefined
  pool: Pool | undefined
}
```

In production, a new client is created per cold start. In development, the instance is reused across reloads.

### Payload CMS (`payload` schema)

The `payload` schema is managed by **Payload CMS v3** using `@payloadcms/db-postgres`. Payload handles all DDL operations in this schema through its own auto-migration system. Manual migrations must not be applied to this schema, as doing so risks breaking Payload's internal state tracking.

### Environment configuration

The database connection string is read from the `DATABASE_URL` environment variable. A `sanitizeDatabaseUrl` helper strips any leaked credentials from the URL before it is passed to the pool, preventing accidental credential exposure in logs.

---

## 3. Data Model

### 3.1 Two-schema architecture

```
+----------------------------------------------------------+
|                     PostgreSQL Instance                  |
|                                                          |
|  +------------------------+  +------------------------+  |
|  |   schema: public       |  |   schema: payload      |  |
|  |   (Prisma-managed)     |  |   (Payload CMS-managed)|  |
|  |                        |  |                        |  |
|  |  User                  |  |  courses               |  |
|  |  LessonProgress        |  |  modules               |  |
|  |  TaskProgress          |  |  lessons               |  |
|  |  CourseProgress        |  |  tasks                 |  |
|  |  Tag                   |  |  subjects              |  |
|  |  FlashcardDeck         |  |  payload-users         |  |
|  |  Flashcard             |  |  media                 |  |
|  |  FlashcardSettings     |  |  tasks_tags (join)     |  |
|  |  UserFlashcardProgress |  |                        |  |
|  |  UserStandaloneDeck (join) |  |                        |  |
|  |  TaskProgressTag       |  |                        |  |
|  |  ActivityLog           |  |                        |  |
|  |  PlatformFlags         |  |                        |  |
|  |  RevokedToken          |  |                        |  |
|  |  RateLimit             |  |                        |  |
|  +------------+-----------+  +------------+-----------+  |
|               |                           |              |
+---------------+---------------------------+--------------+
                |                           |
         Prisma Client              Payload CMS Client
                |                           |
                +-------------+-------------+
                              |
                       Next.js App Layer
                  (Server Actions + API Routes)
```

### 3.2 `public` schema — Prisma-managed entities

---

#### `User`

Stores credentials and role assignment for every platform participant.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` (cuid) | Primary key |
| `email` | `String` | Unique — used for login |
| `name` | `String?` | Optional display name |
| `passwordHash` | `String?` | Bcrypt hash; null for OAuth-only accounts |
| `role` | `Role` enum | `STUDENT` or `ADMIN` |
| `isPro` | `Boolean` | Enables Pro/VIP-gated features |
| `createdAt` | `DateTime` | Auto-set on creation |
| `updatedAt` | `DateTime` | Auto-updated on change |

**Relations:** one-to-many to `LessonProgress`, `TaskProgress`, `CourseProgress`, `UserFlashcardProgress`, `UserStandaloneFlashcardDeck`; one-to-one to `FlashcardSettings`.

---

#### `LessonProgress`

Tracks a student's engagement with a single lesson. One row per `(userId, lessonId)` pair.

| Field | Type | Notes |
|-------|------|-------|
| `lessonId` | `String` | References `payload.lessons.id` (no DB FK) |
| `status` | `LessonStatus` | `NOT_STARTED -> IN_PROGRESS -> COMPLETED` |
| `startedAt` | `DateTime?` | Set on first task submission |
| `completedAt` | `DateTime?` | Set once all tasks in the lesson have been submitted |
| `lastViewedAt` | `DateTime` | Updated on every task submission |

**Constraint:** `@@unique([userId, lessonId])`.

**Relations:** one-to-many to `TaskProgress`.

---

#### `TaskProgress`

Records a student's attempt on a single task. One row per `(userId, taskId)` pair — subsequent submissions overwrite via upsert.

| Field | Type | Notes |
|-------|------|-------|
| `taskId` | `String` | References `payload.tasks.id` (no DB FK) |
| `lessonProgressId` | `String` | FK -> `LessonProgress.id` (Cascade) |
| `status` | `TaskStatus` | `NOT_ATTEMPTED -> ATTEMPTED -> PASSED` |
| `submittedAnswer` | `String?` | Raw answer text |
| `isCorrect` | `Boolean?` | Set by server-side answer evaluation |
| `earnedPoints` / `maxPoints` | `Int` | Per-task scoring |
| `difficultyRating` | `Int?` | Optional 1-5 self-reported difficulty |

**Relations:** many-to-many to `Tag` via `TaskProgressTag`; belongs to `LessonProgress`.

---

#### `CourseProgress`

Denormalised summary of a student's progress in a full course. Recalculated after every task submission by `recalculateCourseProgress()`.

| Field | Type | Notes |
|-------|------|-------|
| `courseId` | `String` | References `payload.courses.id` (no DB FK) |
| `totalLessons` | `Int` | Total published lesson count in the course |
| `completedLessons` | `Int` | Count of fully completed lessons |
| `progressPercentage` | `Float` | `completedLessons / totalLessons * 100` |
| `totalPoints` | `Int` | Maximum possible points |
| `earnedPoints` | `Int` | Sum of `TaskProgress.earnedPoints` for this course |
| `enrolledAt` | `DateTime` | First enrollment timestamp |
| `lastActivityAt` | `DateTime` | Updated on every submission |

**Constraint:** `@@unique([userId, courseId])`.

---

#### `Tag`

A canonical label that can be applied to flashcards and, via `TaskProgressTag`, to task attempts for analytics filtering.

| Field | Type | Notes |
|-------|------|-------|
| `name` | `String` | Unique |
| `slug` | `String` | Unique, URL-safe kebab-case version of name |
| `main` | `Boolean` | Whether the tag appears in the default UI filter bar |

**Relations:** many-to-many to `Flashcard` via implicit `_FlashcardTags`; one-to-many to `TaskProgressTag`.

Denormalised copies of `name` and `slug` also exist in `payload.tasks_tags`. These are kept in sync by `PUT /api/tags/[id]` through paginated Payload task updates (not direct SQL mutation of `tasks_tags`).

---

#### `Flashcard`

A study card with LaTeX-capable question and answer text and optional media references. Per-user SRS scheduling is tracked in `UserFlashcardProgress`.

| Field | Type | Notes |
|-------|------|-------|
| `question` | `String` | Supports LaTeX markup |
| `answer` | `String` | Supports LaTeX markup |
| `deckId` | `String` | FK -> `FlashcardDeck.id` |
| `questionImageId` | `String?` | ID of a `payload.media` record |
| `answerImageId` | `String?` | ID of a `payload.media` record |

**Relations:** belongs to `FlashcardDeck`; many-to-many to `Tag` via implicit `_FlashcardTags`; one-to-many to `UserFlashcardProgress`.

---

#### `FlashcardDeck`

Named grouping container for flashcards. Decks form a **tree**: optional **`parentDeckId`** points to a parent deck (typically the course **main** deck or a standalone **main**). Import scripts and admin APIs use slug/id as stable keys.

| Field | Type | Notes |
|-------|------|-------|
| `slug` | `String` | Unique |
| `name` | `String` | Display name |
| `description` | `String?` | Optional deck description |
| `subjectId` | `String?` | Optional Payload **`subjects`** collection id (used for standalone mains and student catalog display) |
| `courseId` | `String?` | Payload course id when this deck belongs to a course (usually set on the **main** deck only) |
| `moduleId` | `String?` | Payload module id for **module-aligned subdecks** (`@unique` — one deck row per module when used) |
| `parentDeckId` | `String?` | Parent deck when this row is a **subdeck**; `null` means a **root** (main) deck |

**Course pattern:** one main deck per course (`courseId` set, `parentDeckId` null) and many subdecks under it (`parentDeckId` = main id). **Standalone pattern:** root decks with `courseId` null; optional child subdecks; standalone mains may own **direct** `Flashcard` rows.

**Relations:** self-referential hierarchy (`parentDeck` / `childDecks`); one-to-many to `Flashcard`; many-to-many to `Tag`; one-to-many to `UserStandaloneFlashcardDeck` (enrollments on **standalone root** decks only).

---

#### `UserStandaloneFlashcardDeck`

Join table: a learner **added** a standalone (non-course) **main** deck to their flashcard library from the student browse catalog. Required before standalone deck-tree and study URLs apply for that user (see `lib/flashcards-study-access.ts`).

| Field | Type | Notes |
|-------|------|-------|
| `userId` | `String` | FK → `User.id` (cascade) |
| `deckId` | `String` | FK → `FlashcardDeck.id` of a **root** standalone deck (`courseId` null, `parentDeckId` null) (cascade) |
| `createdAt` | `DateTime` | Enrollment timestamp |

**Constraint:** `@@id([userId, deckId])` — composite primary key. **Index:** `userId` for dashboard queries.

**Table:** `user_standalone_flashcard_decks`.

---

#### `FlashcardSettings`

Per-user configuration for the spaced-repetition scheduler. Created with sensible defaults on first access.

| Field | Default | Meaning |
|-------|---------|---------|
| `newCardsPerDay` | 20 | Budget of new cards shown per day |
| `maxReviews` | 200 | Daily cap on review cards |
| `learningSteps` | `"1 10"` | Minutes between learning-step prompts |
| `relearningSteps` | `"10"` | Minutes for failed REVIEW cards |
| `graduatingInterval` | 1 | Days to first REVIEW after passing learning with Good |
| `easyInterval` | 4 | Days to first REVIEW if pressed Easy during learning |
| `startingEase` | 2.5 | Initial ease factor for new cards |
| `masteredThreshold` | 21 | Interval (days) at which a card becomes MASTERED |

**Constraint:** `userId UNIQUE` — one settings row per user.

---

#### `UserFlashcardProgress`

Tracks the SM-2 spaced-repetition state for a single `(userId, flashcardId)` pair. This model replaced the deprecated global SRS fields on `Flashcard`, so each student has an independent study schedule.

| Field | Type | Notes |
|-------|------|-------|
| `state` | `FlashcardState` | `NEW -> LEARNING -> REVIEW -> RELEARNING -> MASTERED` |
| `interval` | `Int` | Current review interval in days |
| `easeFactor` | `Float` | SM-2 ease factor (clamped >= 1.3) |
| `repetition` | `Int` | Number of successful reviews |
| `stepIndex` | `Int` | Current position within learning or relearning steps |
| `nextReviewAt` | `DateTime?` | Timestamp when the card is next due |
| `lastReviewedAt` | `DateTime?` | Timestamp of the most recent review |
| `lastResult` | `LastResult?` | `AGAIN / HARD / GOOD / EASY` |

A row is created on a user's first review of a card, seeded from algorithm constants in `lib/srs.ts` (`DEFAULT_SETTINGS.startingEase`, initial state `NEW`).

**Constraint:** `@@unique([userId, flashcardId])`.

---

#### `TaskProgressTag`

Normalised join table between `TaskProgress` and `Tag`. Replaces the deprecated `taskTags String[]` array on `TaskProgress` with a proper many-to-many relationship that supports referential integrity, cascade deletes, and indexed tag-based analytics queries.

| Field | Type | Notes |
|-------|------|-------|
| `taskProgressId` | `String` | FK -> `TaskProgress.id` (Cascade) |
| `tagId` | `String` | FK -> `Tag.id` (Cascade) |

**Constraint:** `@@unique([taskProgressId, tagId])`.

---

#### `ActivityLog`

Immutable audit record of significant platform actions (tag creation, course deletion, user promotion, etc.).

| Field | Type | Notes |
|-------|------|-------|
| `timestamp` | `DateTime` (timestamptz) | When the action occurred |
| `action` | `String` | Action identifier e.g. `TAG_CREATED` |
| `actorUserId` | `String?` | The user who performed the action |
| `actorEmail` | `String?` | Denormalised email for legibility |
| `resourceType` | `String?` | e.g. `TAG`, `COURSE` |
| `resourceId` | `String?` | ID of the affected resource |
| `metadata` | `Json?` | Arbitrary key-value context (old/new values, etc.) |

Rows are never updated or deleted — this table is append-only by convention.

---

#### `PlatformFlags`

Singleton-style configuration row for cross-instance toggles (single logical key `id = "platform"`).

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | Primary key; use `"platform"` for the default row |
| `activityLoggingEnabled` | `Boolean` | When `false`, `logActivity` skips creating new `ActivityLog` rows (see `lib/platform-flags.ts`) |

---

#### `RevokedToken`

Stores revoked JWT token IDs (`jti`) and expiry time for logout/session invalidation.

| Field | Type | Notes |
|-------|------|-------|
| `jti` | `String` | Primary key (token ID) |
| `expiresAt` | `DateTime` | Token expiry; used for cleanup |
| `revokedAt` | `DateTime` | Revocation timestamp |

---

#### `RateLimit`

Persistent rate-limit counters shared across all app instances.

| Field | Type | Notes |
|-------|------|-------|
| `id` | `String` | Counter key |
| `count` | `Int` | Current count in window |
| `resetAt` | `DateTime` | Window reset timestamp |

---

### 3.3 `payload` schema — Payload CMS entities

Payload auto-generates tables from collection configuration files in `src/payload/collections/`. The key collections are:

| Collection slug | Description |
|----------------|-------------|
| `courses` | Top-level learning containers with title, slug, level, and subject |
| `modules` | Named sections within a course with ordering |
| `lessons` | Individual lessons inside a module; contain Lexical block-based content |
| `tasks` | Questions (multiple choice, open-ended, true/false) attached to lessons |
| `subjects` | Taxonomy of academic subjects (e.g. Mathematics, Computer Science) |
| `media` | File and image uploads referenced by lessons, tasks, and flashcards |

Payload also creates implicit join tables such as `tasks_tags` to store the `tags` array field defined on the `tasks` collection. This is a denormalised copy — the canonical `Tag` records live in `public.tags`.

---

### 3.4 Entity relationship summary

```
[Payload CMS -- payload schema]
  subjects  (1) --< (N) courses
  courses   (1) --< (N) modules
  modules   (1) --< (N) lessons
  lessons   (1) --< (N) tasks
  tasks     (N) >--< (N) tasks_tags  [payload join -- denormalised]

[Prisma -- public schema]
  User      (1) --< (N) CourseProgress
  User      (1) --< (N) LessonProgress
  User      (1) --< (1) FlashcardSettings
  User      (1) --< (N) UserFlashcardProgress
  User      (1) --< (N) UserStandaloneFlashcardDeck
  UserStandaloneFlashcardDeck (N) >-- (1) FlashcardDeck   [standalone root enrollment]

  LessonProgress (1) --< (N) TaskProgress
  TaskProgress   (N) >--< (N) Tag      [via TaskProgressTag]

  FlashcardDeck (1) --< (N) FlashcardDeck   [parentDeckId hierarchy: main -> subdecks]
  FlashcardDeck (1) --< (N) Flashcard
  FlashcardDeck (N) >--< (N) Tag       [via implicit DeckTags]
  Flashcard (N) >--< (N) Tag           [via implicit _FlashcardTags]
  Flashcard (1) --< (N) UserFlashcardProgress

[Cross-schema references -- application-level only, no DB FK]
  LessonProgress.lessonId    -->  payload.lessons.id
  TaskProgress.taskId        -->  payload.tasks.id
  CourseProgress.courseId    -->  payload.courses.id
  Flashcard.questionImageId  -->  payload.media.id
  Flashcard.answerImageId    -->  payload.media.id
```

---

## 4. Data Flow

### 4.1 Task submission (primary write path)

The most critical write path is triggered when a student submits an answer to a task:

```
Client (browser)
  └─► Next.js Server Action: submitTaskAnswer(taskId, lessonId, answer, courseSlug, difficultyRating?)
        │
        ├── auth()                             Verify session; reject if unauthenticated
        ├── payload.findByID('tasks')          Load task from payload schema; verify published
        ├── prisma.tag.findMany()              Resolve canonical Tag IDs from task metadata
        ├── payload.findByID('lessons')        Load lesson; verify published
        ├── prisma.lessonProgress.upsert()     Get or create lesson progress row
        ├── evaluateAnswer(task, answer)       Pure function: compute isCorrect, earnedPoints
        ├── prisma.taskProgress.upsert()       Record the attempt (last answer wins)
        ├── checkLessonCompletion()            Auto-complete lesson if all tasks submitted
        ├── prisma.$transaction([...upserts])  Sync TaskProgressTag join rows (best-effort)
        ├── recalculateCourseProgress()        Recompute CourseProgress aggregate
        └── revalidatePath(...)                Invalidate Next.js page caches
```

### 4.2 Flashcard study (SRS read path)

```
Client (browser)
  └─► GET /api/flashcards/study?tagSlug=<slug>&subject=<slug>&deckSlug=<slug>
        │
        ├── requireAuth()
        ├── prisma.flashcard.findMany()             Fetch cards (selective field projection)
        ├── prisma.userFlashcardProgress.findMany() Batch-fetch all user progress (one query)
        ├── prisma.flashcardSettings.upsert()       Get or create user settings
        ├── (merge cards with progress in memory)
        └── Return filtered, sorted study deck
```

### 4.3 Flashcard review (SRS write path)

```
Client (browser)
  └─► POST /api/flashcards/[id]/review  { answer: 'GOOD' }
        │
        ├── requireAuth()
        ├── prisma.flashcard.findUnique()              Load card content and tags
        ├── prisma.userFlashcardProgress.findUnique()  Check for existing per-user state
        │     └── if null --> create()  (bootstrap from DEFAULT_SETTINGS constants)
        ├── prisma.flashcardSettings.upsert()          Load user SRS settings
        ├── calculateNextReview(progress, answer, settings)  Pure SM-2 algorithm (lib/srs.ts)
        └── prisma.userFlashcardProgress.update()      Write next due date, ease, state
```

### 4.4 Tag rename (cross-schema write path)

```
Admin client
  └─► PUT /api/tags/[id]  { name, slug }
        │
        ├── requireAdmin()
        ├── prisma.tag.findUnique()         Verify tag exists
        ├── prisma.tag.findFirst()          Uniqueness check on new name/slug
        ├── prisma.tag.update()             Rename canonical Tag record
        └── payload.find + payload.update   Sync denormalized tag objects in tasks.tags (best-effort)
```

### 4.5 Course progress recalculation

After every task submission, `recalculateCourseProgress()` is called synchronously:

```
recalculateCourseProgress(userId, courseId)
  │
  ├── payload.find('lessons', { course: courseId, isPublished: true })   All published lessons
  ├── prisma.lessonProgress.findMany({ userId, status: COMPLETED })      Completed lessons
  ├── prisma.taskProgress.aggregate({ sum: earnedPoints })               Total earned points
  └── prisma.courseProgress.upsert()                                     Write aggregate row
```

---

## 5. Query Strategy

### 5.1 Upsert-based progress writes

All progress writes use `upsert` rather than separate `findUnique` + `create`/`update` calls. This eliminates race conditions on concurrent submissions and reduces round trips:

```typescript
await prisma.lessonProgress.upsert({
  where: { userId_lessonId: { userId, lessonId } },
  create: { userId, lessonId, status: 'IN_PROGRESS', startedAt: new Date() },
  update: { lastViewedAt: new Date() },
})
```

### 5.2 Batch progress fetch (N+1 prevention)

The flashcard study endpoint avoids the N+1 pattern by fetching all per-user progress rows in a single query and merging in memory:

```typescript
// One query for all cards -- not one per card
const userProgressRows = await prisma.userFlashcardProgress.findMany({
  where: { userId: user.id, flashcardId: { in: flashcardIds } },
})
const progressMap = new Map(userProgressRows.map((p) => [p.flashcardId, p]))
```

### 5.3 Projection + relation loading

The study endpoint fetches flashcards with required relations (`tags`, `deck`) in one query, then fetches per-user progress in a second query to avoid N+1:

```typescript
const flashcards = await prisma.flashcard.findMany({
  where: whereFilter,
  include: {
    tags: { select: { id: true, name: true, slug: true } },
    deck: { select: { id: true, name: true, slug: true } },
  },
})
```

### 5.4 Tag list caching

`GET /api/tags` uses Next.js `unstable_cache` with a 30-second TTL so that the tag list is served from the data cache in most cases. It is invalidated explicitly after any create, rename, or delete operation:

```typescript
const getCachedTags = unstable_cache(
  async () => prisma.tag.findMany({ orderBy: { name: 'asc' }, select: { ... } }),
  ['api-tags-list'],
  { revalidate: 30 },
)
// After mutation:
revalidateTag('api-tags-list')
```

### 5.5 SRS budget calculation via `count`

The daily new-card budget uses `count` instead of loading full progress rows:

```typescript
const newReviewedToday = await prisma.userFlashcardProgress.count({
  where: {
    userId: user.id,
    state: { not: 'NEW' },
    lastReviewedAt: { gte: startOfToday },
  },
})
```

### 5.6 Potential query risks

| Risk | Location | Mitigation |
|------|----------|-----------|
| Cross-schema grouped read on tags dashboard | `getTaskCountsByPrismaTagId` / `GET /api/tags` | Secondary index on `payload.tasks_tags.tag_id` |
| Unbounded Payload `find` during course recalculation | `recalculateCourseProgress` | Bounded by published lesson count per course |
| `$transaction` with many upserts for tag sync | `submitTaskAnswer` | Sent as single request; wrapped in try/catch so failure is non-fatal |

---

## 6. Indexing and Performance Considerations

### 6.1 Index inventory

#### `User`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `email` | Login lookup and uniqueness enforcement |

#### `lesson_progress`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `(userId, lessonId)` | Upsert lookup and uniqueness enforcement |
| Index | `userId` | Fetch all lessons for a student |
| Index | `lessonId` | Check which users have progress on a given lesson |
| Index | `status` | Dashboard queries filtering by `IN_PROGRESS` / `COMPLETED` |
| Index | `(userId, status)` | Fetch all in-progress lessons for a student in one scan |

#### `task_progress`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `(userId, taskId)` | Upsert lookup |
| Index | `userId` | Student analytics dashboard |
| Index | `taskId` | Admin: which students attempted a given task |
| Index | `status` | Filter by attempt status |
| Index | `isCorrect` | Analytics: pass-rate computation |
| Index | `difficultyRating` | Analytics: average difficulty by tag or lesson |

#### `course_progress`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `(userId, courseId)` | Upsert lookup |
| Index | `userId` | Fetch all per-course aggregate rows for a user (progress bars, recalculation) |
| Index | `courseId` | Aggregate rows for everyone working in one course |

The student **“Your courses”** list and **Active courses** stat use **`LessonProgress`** (started or completed published lessons), not a simple count of `CourseProgress` rows. `CourseProgress` remains the denormalised per-course summary used after submissions and for progress UI.

#### `user_flashcard_progress`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `(userId, flashcardId)` | Bootstrap and update lookup |
| Index | `userId` | All cards for a student |
| Index | `flashcardId` | All students' progress on one card |
| Index | `nextReviewAt` | Scheduler: fetch all cards due before a given timestamp |
| Index | `(userId, state)` | Dashboard: count `NEW / LEARNING / REVIEW` cards per user |

#### `flashcards`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Index | `deckId` | Filter cards by deck |
| Index | `createdAt` | Stable recency sorting in admin/API |

#### `flashcard_decks`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `slug` | Stable deck identity for imports/UI |

#### `task_progress_tags`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Unique | `(taskProgressId, tagId)` | Prevents duplicates; also the join key |
| Index | `taskProgressId` | Fetch tags for a given attempt |
| Index | `tagId` | Analytics: all attempts tagged with a given tag |

#### `activity_logs`

| Index | Columns | Rationale |
|-------|---------|-----------|
| Index | `timestamp DESC` | Chronological admin log display |
| Index | `actorUserId` | Filter logs by actor |
| Index | `action` | Filter logs by action type |
| Index | `resourceType` | Filter logs by affected resource type |

#### `payload.tasks_tags`

A secondary index on `tag_id` is added via migration to improve cross-schema join performance when looking up tasks by tag for analytics queries.

### 6.2 Potential performance bottlenecks

- **`CourseProgress` recalculation on every task submission.** This triggers a Payload CMS `find` call plus a Prisma aggregate on each submission. For courses with many lessons this is acceptable, but the read is unbounded and not cached.
- **Cross-schema raw SQL read path.** `getTaskCountsByPrismaTagId()` uses one grouped raw SQL query on `payload.tasks_tags` for admin tag counts. This is fast, but depends on Payload table shape stability.

---

## 7. Data Integrity

### 7.1 Unique constraints

| Table | Constraint | Purpose |
|-------|-----------|---------|
| `User` | `email UNIQUE` | One account per email address |
| `lesson_progress` | `(userId, lessonId)` | One progress record per user per lesson |
| `task_progress` | `(userId, taskId)` | One progress record per user per task |
| `course_progress` | `(userId, courseId)` | One progress record per user per course |
| `user_flashcard_progress` | `(userId, flashcardId)` | One SRS schedule per user per card |
| `task_progress_tags` | `(taskProgressId, tagId)` | No duplicate tag assignments per attempt |
| `tags` | `name UNIQUE`, `slug UNIQUE` | Tags are canonical; no duplicates |
| `flashcard_settings` | `userId UNIQUE` | One settings row per user |

### 7.2 Foreign key cascade rules

All FK relations in the `public` schema use `onDelete: Cascade`:

- Deleting a `User` removes all their progress rows, flashcard progress, and settings.
- Deleting a `LessonProgress` row cascades to all its `TaskProgress` children.
- Deleting a `TaskProgress` row cascades to all its `TaskProgressTag` children.
- Deleting a `Tag` cascades to `TaskProgressTag` rows and the implicit flashcard join table rows.
- Deleting a `Flashcard` cascades to all `UserFlashcardProgress` rows.

### 7.3 Cross-schema integrity (application-level)

Because PostgreSQL does not enforce foreign keys across schemas in different ownership contexts, the application maintains cross-schema integrity via Payload CMS lifecycle hooks:

```typescript
// src/payload/collections/Tasks.ts -- afterDelete hook
afterDelete: [
  async ({ id }) => {
    await prisma.taskProgress.deleteMany({ where: { taskId: String(id) } })
  },
],

// src/payload/collections/Lessons.ts -- afterDelete hook
afterDelete: [
  async ({ id }) => {
    await prisma.lessonProgress.deleteMany({ where: { lessonId: String(id) } })
  },
],
```

When a Payload lesson or task is deleted, all orphaned Prisma progress rows are removed synchronously. Cascade deletion of `TaskProgress` rows then automatically removes their `TaskProgressTag` children via the Prisma-managed FK.

For tag synchronisation, `PUT /api/tags/[id]` propagates name and slug changes by updating matching `tasks.tags` entries through the Payload API, and `DELETE /api/tags/[id]` removes matching task-tag entries before deleting the canonical `Tag` record:

```typescript
// Rename path: find tasks referencing tagId, then update each task's tags array
const { docs } = await payload.find({ collection: 'tasks', where: { 'tags.tagId': { equals: tagId } } })
await payload.update({ collection: 'tasks', id: String(task.id), data: { tags: nextTags } })

// Delete path: remove tag entries from each task.tags array before deleting Prisma tag
await payload.update({ collection: 'tasks', id: String(task.id), data: { tags: filteredTags } })
```

Both operations are wrapped in `try/catch` so a schema permission failure does not abort the main operation.

### 7.4 Application-level validation

- `difficultyRating` is validated to be between 1 and 5 before being written.
- `role` is enforced through NextAuth session checks (`requireAuth()`, `requireAdmin()`).
- Task `isPublished` status is checked before allowing student access to task content.
- Tag `name` and `slug` uniqueness are verified via a `findFirst` check before any update.

---

## 8. Data Access Layer

### 8.1 Architecture overview

There is no dedicated repository or service object layer. Database access is divided across three surfaces:

| Surface | Location | Responsibility |
|---------|----------|----------------|
| **Server Actions** | `app/actions/` | Mutations: submit answers, mark lessons complete, recalculate course progress |
| **API Route handlers** | `app/api/` | CRUD for flashcards, tags, flashcard settings, health check |
| **Payload CMS hooks** | `src/payload/collections/` | Cross-schema cleanup on CMS content delete |

All three surfaces share the same singleton `prisma` client exported from `lib/prisma.ts`.

### 8.2 Server Actions (`app/actions/`)

| File | Responsibility |
|------|---------------|
| `submit-task.ts` | Core submission flow: upsert progress, evaluate answer, sync tags, recalculate course aggregate |
| `lesson-progress.ts` | `checkLessonCompletion`: marks lesson complete when all tasks are submitted |
| `course-progress.ts` | `recalculateCourseProgress`, cached per-course reads, **`getPopularCourseIds()`** (distinct learners from `LessonProgress`, padded to five with newest published courses, short `unstable_cache` TTL) |
| `progress.ts` | Barrel re-exports for `app/actions/*` progress modules |
| `user-stats.ts` | Dashboard stats: completed lessons, total points, **active courses** (distinct started courses via `getOrderedStartedCourseIds`; takes a Payload instance to avoid duplicate CMS round-trips) |
| `lib/started-courses.ts` | **`getOrderedStartedCourseIds`**, **`fetchPublishedCoursesByIdsInOrder`**: map `LessonProgress` to published courses for the dashboard strip and stats |
| `lib/courses-catalog.ts` | Parses `/courses` query params, builds Payload `where`, serialises links for pagination (15 per page) |

### 8.3 SRS algorithm

The spaced-repetition scheduling logic lives entirely in `lib/srs.ts` as pure functions with no database dependencies. It implements SM-2 with Anki-style state transitions:

```
NEW -> LEARNING -> REVIEW -> RELEARNING -> REVIEW
                  REVIEW -> MASTERED   -> REVIEW
```

The algorithm accepts the current card state plus the user's answer (`AGAIN / HARD / GOOD / EASY`) and returns the next state, interval, ease factor, and due timestamp. This design makes the algorithm independently unit-testable without any database involvement.

### 8.4 Separation of concerns

| Concern | Handled by |
|---------|-----------|
| Authentication | `lib/auth-helpers.ts` — `requireAuth()` / `requireAdmin()` |
| Database access | `lib/prisma.ts` — singleton Prisma client |
| SRS algorithm | `lib/srs.ts` — pure functions, no side effects |
| CMS content access | `getPayload({ config })` — Payload SDK |
| Cache invalidation | `revalidateTag()` / `revalidatePath()` from Next.js |
| Audit logging | `lib/activity-log.ts` — append-only writes to `activity_logs` when `platform_flags.activityLoggingEnabled` is true (`lib/platform-flags.ts`) |

---

## 9. Scalability Considerations

### 9.1 Connection pool

The pool is capped at 10 connections, which is appropriate for Railway's free tier. Under higher concurrent load, requests will queue waiting for a free connection. Moving to a dedicated connection pooler such as PgBouncer or Neon pooling would allow the application to maintain a small fixed pool while the pooler handles more backend connections.

### 9.2 Progress table growth

`task_progress` grows at `O(users * tasks)`. `user_flashcard_progress` grows at `O(users * flashcards studied)`. Both scale linearly and are well-indexed. Deleted-user data is automatically removed via cascade, keeping the tables clean.

### 9.3 `CourseProgress` recalculation

`recalculateCourseProgress` is called synchronously on every task submission. At low scale this is fine. At higher scale it creates write amplification: each task submit triggers one Payload CMS `find` plus one Prisma aggregate plus one upsert. Debouncing or moving this to a background job would improve submission response times.

### 9.4 Cross-schema raw SQL

Cross-schema raw SQL is currently used for aggregated tag counts (`SELECT ... FROM payload.tasks_tags GROUP BY tag_id`) in admin tag-list analytics. Tag rename/delete synchronization itself is performed through Payload API updates, not SQL writes. The raw query remains a schema-coupled optimization: if Payload changes `tasks_tags` shape, this query must be updated.

### 9.5 Single database instance

The entire platform runs from one PostgreSQL instance. This is appropriate for early-stage deployments but does not support horizontal read scaling. If read traffic becomes significant, a read replica could serve analytics queries while writes remain on the primary.

### 9.6 Lean schema

The `Flashcard` model no longer carries global SRS columns. Per-user scheduling state is stored exclusively in `UserFlashcardProgress`. Bootstrap values for new progress rows come from the `DEFAULT_SETTINGS` constants in `lib/srs.ts` rather than from per-card database fields. The `TaskProgress` model no longer carries the denormalized `taskTags` array; tag associations are stored exclusively in `TaskProgressTag` with proper referential integrity.

---
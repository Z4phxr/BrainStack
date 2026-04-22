# BrainStack

[![Next.js](https://img.shields.io/badge/Next.js-16.2.4-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.83.0-ff69b4)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.8.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-blue)](LearningPlatform/documentation/TESTING.md)

A production-ready exam preparation and course management platform built on Next.js 16, Payload CMS v3, and PostgreSQL. The platform covers the full lifecycle from content creation to student exam practice - with a rich admin panel, an adaptive learning engine, Anki-style spaced repetition flashcards, and a detailed audit log.

**Technical reference:** all detailed setup, imports, testing, architecture, and stack docs live under [`LearningPlatform/documentation/`](LearningPlatform/documentation/README.md) (start with the index file linked here).


---

## Feature Overview

| Area | Highlights |
|------|-----------|
| Content management | Subjects → Courses → Modules → Lessons → Tasks; **draft/publish (`isPublished`) applies to courses, modules, lessons, and tasks** (subjects are taxonomy only) |
| Lesson builder | 6 composable content blocks: Rich Text, Image, Math (KaTeX), Callout, Video, Table |
| Task engine | Multiple Choice, True/False, Open-Ended with optional auto-grading |
| Adaptive learning | Tag-based weakness scoring surfaces personalized practice tasks |
| Spaced repetition | Full SM-2 algorithm - NEW / LEARNING / REVIEW / RELEARNING / MASTERED states |
| Flashcards (SRS) | Student **deck tree** (`/dashboard/flashcards`), **Discover decks** browse + library enroll (`/dashboard/flashcards/browse`), SM-2 study sessions; **standalone** decks require enrollment before study  |
| Audit trail | Persistent activity log for every admin action, viewable and filterable in the panel |
| Media | S3-compatible object storage with signed URL delivery and usage tracking |
| Security | JWT revocation, rate limiting, per-request CSP nonces, Zod validation throughout |
| Progress tracking | Per-user lesson completion and task grading stored at every granularity level |

---

## Admin Panel

Administrators manage the platform through a dedicated admin panel at `/admin`, built with [Payload CMS](https://payloadcms.com) and a custom Next.js UI layer.

The sidebar (see `LearningPlatform/components/admin/sidebar.tsx`) includes:

- **Dashboard** — admin home
- **Lessons** — block-based lesson authoring (see [Lesson Builder](#lesson-builder--content-blocks)); **courses and modules are edited inside these flows**, not as separate sidebar entries
- **Subjects** — top-level taxonomy
- **Tags** — canonical tags for tasks and flashcards (recommendations)
- **Tasks** — assessments with prompts, solutions, points, and tags
- **Flashcards** — SRS cards; **course-linked** decks (one main deck per course + **subdecks** per module) and **standalone** decks (collections not tied to a course, with optional subdecks). Managed in-app at `/admin/flashcards` (see [Spaced Repetition Flashcards](#spaced-repetition-flashcards)); APIs under `/api/flashcards` and `/api/flashcard-decks`.
- **Media** — uploads and library management
- **AI Agent** — experimental course generation workspace
- **Logs** — audit trail (see [Activity Log](#activity-log--audit-trail))
- **Users** — user list and **Pro** entitlement (`isPro`)
- **Settings** — admin UI preferences (theme, reading size)

---

## Draft to Publish Workflow

**Subjects** do not have an `isPublished` field; they are always available to admins for organization. **Courses, modules, lessons, and tasks** each have their own `isPublished` flag. Students only see content that is published along the path they are viewing.

```
Subject  ──►  Course  ──►  Module  ──►  Lesson  ──►  Task
             (published)  (published)  (published)  (published)
```

- A **Course** can be hidden in draft while its module structure is being built.
- A **Lesson** can be marked published independently - useful when releasing content progressively.
- A **Task** remains invisible to students until individually published.
- Admins always see all content regardless of publish state.

This gives content authors full control over what students see and when, without deleting content or creating branches.

---

## Lesson Builder & Content Blocks

Lessons are assembled from a sequence of typed content blocks. Admins add, reorder, and remove blocks freely in the Payload admin editor. Six block types are available:

### Text
Rich text powered by the Lexical editor. Supports headings, bold/italic, bullet and numbered lists, inline code, and links.

### Image
An image from the media library with configurable **width** (Small 400 px / Medium 600 px / Large 800 px / Full) and **alignment** (Left / Center / Right), plus an optional caption. Images are served through **`/api/media/serve/:filename`** (local file response or redirect to a **signed S3 URL** when cloud storage is configured).

### Math
A LaTeX formula rendered with **KaTeX** on the client. Supports both **display mode** (centred block equation) and **inline mode** for formulas embedded in surrounding text. An optional descriptive note is displayed beneath the formula.

```
Example: x = \frac{-b \pm \sqrt{b^2 - 4ac}}{2a}
```

### Callout
A highlighted box in one of three semantic variants:
- `info` - blue, for supplementary information
- `warning` - amber, for caveats and important notes
- `tip` - green, for helpful suggestions

Each callout contains its own rich text body.

### Video
An embedded YouTube video with selectable **aspect ratio** (16:9 widescreen or 4:3 standard), an optional title displayed above the player, and an optional caption below.

### Table
A structured data table with optional column headers. Supports a **caption** displayed above the table. Table data (headers and rows) is stored as JSON and rendered as a native HTML table.

---

## Task Types & Assessments

Each lesson can have any number of associated tasks. Three task types are supported:

| Type | Description | Grading |
|------|-------------|---------|
| **Multiple Choice** | A list of labelled options; one is correct | Automatic - matched against `correctAnswer` |
| **True / False** | Binary choice question | Automatic - matched against `"true"` or `"false"` |
| **Open Ended** | Free-text answer | Manual by default; optional **auto-grade** mode normalises and compares text case- and punctuation-insensitively |

Every task can include:
- A **rich text prompt** with full formatting
- An optional **question image** from the media library
- A **solution / explanation** in rich text, shown after submission
- An optional **solution image** and/or **solution video URL** (YouTube)
- **Tags** linking the task to the knowledge taxonomy
- A configurable **point value** and **display order**

---

## Adaptive Learning Engine

The recommendation engine builds a per-user skill model from task submission history:

1. **Tag weakness scores** - for each tag the student has encountered, the engine computes a score based on recent answer accuracy and recency weighting.
2. **Personalized task queue** - tasks tagged with the student's weakest knowledge areas are surfaced first at `/api/recommend/tasks`.
3. **Tag stats cache** - per-user tag statistics power recommendations and practice (`/api/practice/session`); results are cached (short TTL) and invalidated on new task submissions.

The full algorithm is documented in [ADAPTIVE_LEARNING.md](LearningPlatform/documentation/ADAPTIVE_LEARNING.md).

---

## Spaced Repetition Flashcards

The flashcard system implements the **SM-2** algorithm with Anki's state-machine extensions.

Each card tracks an independent per-user state:

| State | Description |
|-------|-------------|
| `NEW` | Never studied |
| `LEARNING` | In short learning steps (minutes-based scheduling) |
| `REVIEW` | Long-term spaced repetition (days-based scheduling) |
| `RELEARNING` | Failed a REVIEW card; returns to short steps before re-entering REVIEW |
| `MASTERED` | Interval ≥ 21 days (continues to be reviewed normally) |

When reviewing a card the student chooses one of four answers - **Again**, **Hard**, **Good**, **Easy** - and the algorithm updates the interval and ease factor accordingly. Learning steps are configurable (default: 1 min → 10 min → graduate to REVIEW at 1 day). Ease is clamped at a minimum of 1.3 to prevent cards from becoming impossibly infrequent.

Cards are linked to **tags**, so the SRS session can be filtered to a particular topic.

### Deck organisation (admin)

Flashcards are stored on **`FlashcardDeck`** rows (see Prisma `FlashcardDeck`). The admin **Flashcards** area (`/admin/flashcards`) supports:

- **Course-linked hierarchy** — One **main** deck per course (`courseId` set, no parent). **Subdecks** belong to that main (`parentDeckId`), typically aligned to **course modules** via `moduleId`. Cards for course material should live on **subdecks**; the course main deck is a container, not where new cards are assigned.
- **Standalone collections** — Decks with **no** `courseId` are independent of the curriculum. The standalone **main** deck can hold cards directly (“direct” cards) and/or use **subdecks** for named splits (e.g. interview prep by topic).

Study and list APIs can filter by deck slug, subdeck, or whole main tree; see `GET /api/flashcards/study` and admin list filters.

---

## Activity Log & Audit Trail

A persistent `activity_logs` table records every significant admin action. The admin **Logs** page at `/admin/logs` displays a paginated, filterable table of all entries.

Actions covered include:

- **Authentication** - `USER_REGISTERED`, `USER_LOGIN`, `USER_LOGOUT`, `USER_LOGIN_FAILED`
- **Subject / Course / Module / Lesson / Task** - created, updated, published, unpublished, deleted
- **Flashcard & Tag** - created, updated, deleted
- **Media** - uploaded, deleted
- **Pro / assistant (where applicable)** - lesson assistant usage and admin Pro flag updates

Each log entry stores the actor's user ID and email, the affected resource type and ID, a UTC timestamp, and an optional JSON metadata payload (e.g. the resource title).

Filters available in the admin panel: action type, actor user ID, date range. All filters are reflected in the URL for bookmarkable views.

The logging design is fire-and-forget - a logging failure never disrupts the primary operation.

Full reference: [LOGGING_SYSTEM.md](LearningPlatform/documentation/LOGGING_SYSTEM.md)


## Media Management

All uploaded files are stored in an **S3-compatible** object store when configured (AWS S3, Cloudflare R2, Railway Object Storage, or any compatible API); otherwise media can be stored **locally** under `public/media`.

- Admins upload via **`POST /api/media/upload`**; assets are tracked in the Payload **Media** collection.
- Delivery goes through **`/api/media/serve/:filename`** (signed URL redirect to S3 when enabled, or local file serve).
- Usage is tracked per file so admins can see which lessons and tasks reference a given asset before deletion.
- Used by lesson image blocks, task question/solution media, and related fields.


## Documentation

Canonical index (same structure as the repo): **[`LearningPlatform/documentation/README.md`](LearningPlatform/documentation/README.md)**

### Product and learning features

- **[`changelog/2026-04-20-flashcards.md`](LearningPlatform/documentation/changelog/2026-04-20-flashcards.md)** — Dated engineering log: flashcards student catalog, standalone enrollment, study access, migrations.
- **[`PLATFORM_FEATURES.md`](LearningPlatform/documentation/PLATFORM_FEATURES.md)** — Admin capabilities, draft/publish workflow, lesson blocks, task types, media behavior.
- **[`ADAPTIVE_LEARNING.md`](LearningPlatform/documentation/ADAPTIVE_LEARNING.md)** — Recommendations, weak-tag analytics, practice sessions, spaced repetition.
- **[`AI_COURSE_GENERATION.md`](LearningPlatform/documentation/AI_COURSE_GENERATION.md)** — Admin AI Agent flow, providers, testing notes, cost guidance.

### Development and operations

- **[`LOCAL_DEVELOPMENT.md`](LearningPlatform/documentation/LOCAL_DEVELOPMENT.md)** — Prerequisites, full local setup, quick start, Docker, local URLs.
- **[`CONTENT_IMPORTS.md`](LearningPlatform/documentation/CONTENT_IMPORTS.md)** — Bulk imports: data shapes, npm scripts, troubleshooting, Docker.
- **[`TESTING.md`](LearningPlatform/documentation/TESTING.md)** — Vitest and Playwright commands, suite layout, env flags, coverage baseline.

### Architecture and security

- **[`DATABASE_ARCHITECTURE.md`](LearningPlatform/documentation/DATABASE_ARCHITECTURE.md)** — Dual-schema design, models, indexing, integrity.
- **[`SECURITY_ARCHITECTURE.md`](LearningPlatform/documentation/SECURITY_ARCHITECTURE.md)** — Auth, authorization, rate limiting, CSP, sessions.
- **[`LOGGING_SYSTEM.md`](LearningPlatform/documentation/LOGGING_SYSTEM.md)** — Activity log actions, schema, admin usage.
- **[`TECHNOLOGY_STACK.md`](LearningPlatform/documentation/TECHNOLOGY_STACK.md)** — Framework, data, auth, testing, deployment layers.

### Prompts and assets

- **[`prompts/creation_prompt.MD`](LearningPlatform/documentation/prompts/creation_prompt.MD)** — Large template for LLM-generated import-shaped content.
- **[`screenshots/`](LearningPlatform/documentation/screenshots/)** — PNG assets (for example referenced from `AI_COURSE_GENERATION.md`).

# CourseManagementPlatform

[![Next.js](https://img.shields.io/badge/Next.js-15.5.12-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.72.0-ff69b4)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tests](https://img.shields.io/badge/tests-392%20passing-brightgreen)](https://github.com/Z4phxr/CourseManagementPlatform/actions)

A production-ready exam preparation and course management platform built on Next.js 15, Payload CMS v3, and PostgreSQL. The platform covers the full lifecycle from content creation to student exam practice - with a rich admin panel, an adaptive learning engine, Anki-style spaced repetition flashcards, and a detailed audit log.

---

## Table of Contents

- [Feature Overview](#feature-overview)
- [Admin Panel](#admin-panel)
- [Draft → Publish Workflow](#draft--publish-workflow)
- [Lesson Builder & Content Blocks](#lesson-builder--content-blocks)
- [Task Types & Assessments](#task-types--assessments)
- [Adaptive Learning Engine](#adaptive-learning-engine)
- [Spaced Repetition Flashcards](#spaced-repetition-flashcards)
- [Activity Log & Audit Trail](#activity-log--audit-trail)
- [Media Management](#media-management)
- [Security](#security)
- [Documentation](#documentation)
- [Getting Started](#getting-started)
- [Running Tests](#running-tests)
- [Deployment](#deployment)
- [Technology Stack](#technology-stack)

---

## Feature Overview

| Area | Highlights |
|------|-----------|
| Content management | Subjects → Courses → Modules → Lessons → Tasks, all with draft/publish control |
| Lesson builder | 6 composable content blocks: Rich Text, Image, Math (KaTeX), Callout, Video, Table |
| Task engine | Multiple Choice, True/False, Open-Ended with optional auto-grading |
| Adaptive learning | Tag-based weakness scoring surfaces personalized practice tasks |
| Spaced repetition | Full SM-2 algorithm - NEW / LEARNING / REVIEW / RELEARNING / MASTERED states |
| Audit trail | Persistent activity log for every admin action, viewable and filterable in the panel |
| Media | S3-compatible object storage with signed URL delivery and usage tracking |
| Security | JWT revocation, rate limiting, per-request CSP nonces, Zod validation throughout |
| Progress tracking | Per-user lesson completion and task grading stored at every granularity level |

---

## Admin Panel

Administrators manage the platform through a dedicated admin panel at `/admin`, built with [Payload CMS](https://payloadcms.com) and a custom Next.js UI layer.

The sidebar provides access to:

- **Courses** - create and organise the course catalog, set difficulty level (Beginner / Intermediate / Advanced), and link to a Subject
- **Modules** - group lessons within a course with ordering
- **Lessons** - build lesson content using the block-based editor (see [Lesson Builder](#lesson-builder--content-blocks))
- **Tasks** - create questions with prompts, answer choices, solutions, point values, and tag annotations
- **Subjects** - top-level topic taxonomy
- **Tags** - canonical knowledge tags shared across tasks and flashcards; power the recommendation engine
- **Flashcards** - create study cards linked to tags for the SRS system
- **Media** - upload and manage images and files backed by S3-compatible object storage
- **Settings** - global configuration (site title, default values)
- **Logs** - full audit trail of every administrative action (see [Activity Log](#activity-log--audit-trail))

---

## Draft → Publish Workflow

Every content type at every level of the hierarchy has an independent `isPublished` flag controlled by the admin. Students only ever see published content.

```
Subject  ──►  Course  ──►  Module  ──►  Lesson  ──►  Task
(published)  (published)  (published)  (published)  (published)
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
An image from the media library with configurable **width** (Small 400 px / Medium 600 px / Large 800 px / Full) and **alignment** (Left / Center / Right), plus an optional caption. Images are delivered through signed S3 URLs.

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
3. **Analytics dashboard** - admins and students can view per-tag performance breakdowns. Results are cached with a 60-second TTL and invalidated automatically on new submissions.

The full algorithm is documented in [ADAPTIVE_LEARNING.md](CourseManagementPlatform/documentation/ADAPTIVE_LEARNING.md).

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

---

## Activity Log & Audit Trail

A persistent `activity_logs` table records every significant admin action. The admin **Logs** page at `/admin/logs` displays a paginated, filterable table of all entries.

Actions covered include:

- **Authentication** - `USER_REGISTERED`, `USER_LOGIN`, `USER_LOGOUT`, `USER_LOGIN_FAILED`
- **Subject / Course / Module / Lesson / Task** - created, updated, published, unpublished, deleted
- **Flashcard & Tag** - created, updated, deleted
- **Media** - uploaded, deleted

Each log entry stores the actor's user ID and email, the affected resource type and ID, a UTC timestamp, and an optional JSON metadata payload (e.g. the resource title).

Filters available in the admin panel: action type, actor user ID, date range. All filters are reflected in the URL for bookmarkable views.

The logging design is fire-and-forget - a logging failure never disrupts the primary operation.

Full reference: [LOGGING_SYSTEM.md](CourseManagementPlatform/documentation/LOGGING_SYSTEM.md)

---

## Media Management

All uploaded files are stored in an **S3-compatible** object store (AWS S3, Cloudflare R2, Railway Object Storage, or any compatible API).

- Files are uploaded through the Payload CMS **Media** collection and stored with generated unique keys.
- Delivered via **pre-signed URLs** with a configurable expiry - no public bucket policy required.
- Usage is tracked per file so admins can see which lessons and tasks reference a given asset before deletion.
- Supported by all lesson content blocks (images in Image blocks, question and solution media on tasks).

---

## Security

| Layer | Implementation |
|-------|---------------|
| Authentication | Auth.js v5 with hashed (bcrypt) passwords |
| Session tokens | JWT with JTI field; a `token_blocklist` table enables instant revocation on logout |
| Rate limiting | Per-IP sliding window on all auth endpoints (`/auth/login`, `/auth/register`) |
| Input validation | Zod schemas on all API routes and server actions |
| Content Security Policy | Strict CSP with **per-request nonces** for inline scripts; `img-src` restricted to known storage hostnames |
| Access control | Role-based (`ADMIN` / `STUDENT`) enforced at the Payload collection level and in server actions |
| Query safety | Prisma parameterized queries throughout; no raw SQL string interpolation |


---

## More info here

| Document | Description |
|----------|-------------|
| [DATABASE_ARCHITECTURE.md](CourseManagementPlatform/documentation/DATABASE_ARCHITECTURE.md) | Dual-schema PostgreSQL design, data models, indexing strategy, and cross-schema FK model |
| [ADAPTIVE_LEARNING.md](CourseManagementPlatform/documentation/ADAPTIVE_LEARNING.md) | Tag system, skill analytics, task recommendation algorithm, and SRS integration |
| [SECURITY_ARCHITECTURE.md](CourseManagementPlatform/documentation/SECURITY_ARCHITECTURE.md) | Authentication, authorization, rate limiting, input validation, CSP, and session security |
| [LOGGING_SYSTEM.md](CourseManagementPlatform/documentation/LOGGING_SYSTEM.md) | Activity log schema, all logged action types, and admin panel usage |

---

## Local development

### Prerequisites

- Node.js 20.x
- Docker and Docker Compose (for local PostgreSQL)
- An S3-compatible storage bucket (AWS S3, Cloudflare R2, Railway Object Storage, or similar)


```bash
# 1. Clone the repository
git clone https://github.com/Z4phxr/CourseManagementPlatform.git
cd CourseManagementPlatform/CourseManagementPlatform

# 2. Install dependencies
npm install

# 3. Configure environment variables
cp .env.example .env
# Edit .env - fill in DATABASE_URL, AUTH_SECRET, PAYLOAD_SECRET, and S3 credentials

# 4. Start the local PostgreSQL instance
docker compose up -d postgres

# 5. Apply database migrations
npm run db:migrate:deploy

# 6. (Optional) Seed an admin account and sample content
npm run cms:seed

# 7. Start the development server
npm run dev
```

| URL | Purpose |
|-----|---------|
| `http://localhost:3000` | Student-facing application |
| `http://localhost:3000/admin` | Payload CMS admin panel |

---

## Running Tests

```bash
npm run test            # single run
npm run test:coverage   # with coverage report
npm run test:watch      # watch mode
```

392 tests - unit, integration, and component - using Vitest and Testing Library.

---

## Deployment

The platform can be deployed on [Railway](https://railway.app) using the included `Dockerfile` and `railway.toml`.

On container start, `docker-entrypoint.sh` runs all pending Prisma migrations synchronously before the Next.js server starts, ensuring the schema is always up to date before traffic is accepted.

### Required environment variables

```
DATABASE_URL
PAYLOAD_DATABASE_URL
AUTH_SECRET
PAYLOAD_SECRET
AUTH_TRUST_HOST=true
NEXTAUTH_URL
S3_BUCKET
AWS_REGION
AWS_ACCESS_KEY_ID
AWS_SECRET_ACCESS_KEY
```


## Technology Stack

| Layer | Technology |
|-------|-----------|
| Framework | Next.js 15.5 (App Router) |
| Language | TypeScript 5 |
| CMS | Payload CMS 3.72 |
| ORM | Prisma 7.3 |
| Database | PostgreSQL 16 |
| Authentication | Auth.js v5 (NextAuth) |
| Object storage | AWS S3 / S3-compatible |
| Styling | Tailwind CSS 4 + Radix UI |
| Testing | Vitest 4 + Testing Library |
| Container | Docker (multi-stage) |
| CI | GitHub Actions |

---

## Screenshots

- **Admin dashboard**

	![Admin dashboard](screenshots/Admin-dashboard.png)

- **Lesson builder (admin)**

	![Lesson builder](screenshots/Lesson-builder-admin.png)

- **Lesson view**

	![Lesson view](screenshots/Lesson-view.png)

- **Tasks list**

	![Tasks list](screenshots/Tasks.png)

- **Main page**

	![Main page](screenshots/Main-page.png)

- **Logs (admin)**

	![Logs](screenshots/Logs.png)



# Platform Features

Detailed feature reference for content authoring, publishing controls, lesson/task modeling, and media management.

## Feature Overview

| Area | Highlights |
|------|-----------|
| Content management | **Subjects** for taxonomy; **Courses → Modules → Lessons → Tasks** with per-entity draft/publish control |
| Lesson builder | 6 composable content blocks: Rich Text, Image, Math (KaTeX), Callout, Video, Table |
| Task engine | Multiple Choice, True/False, Open-Ended with optional auto-grading |
| Adaptive learning | Tag-based weakness scoring surfaces personalized practice tasks |
| Spaced repetition | Full SM-2 algorithm - NEW / LEARNING / REVIEW / RELEARNING / MASTERED states |
| Flashcard decks | Admin-defined decks with optional tag scope and deck-based study filtering |
| Pro features | Pro lesson assistant and admin-controlled user Pro entitlement |
| Audit trail | Activity log (append-only); new events can be paused in **Admin → Settings**; `/admin/logs` remains filterable for existing rows |
| Media | S3-compatible object storage with signed URL delivery and usage tracking |
| Security | JWT revocation, rate limiting, per-request CSP nonces, Zod validation throughout |
| Progress tracking | Per-user lesson completion and task grading stored at every granularity level |

## Student app (`/dashboard`, `/courses`)

Signed-in learners use the student layout (navbar, theme). Highlights:

- **Dashboard (`/dashboard`)**  
  - **Your courses** lists only courses where the learner has at least one **published** lesson in `IN_PROGRESS` or `COMPLETED` (from `LessonProgress`, resolved through Payload lessons). If none, a prompt links to the catalog.  
  - **Most popular** shows up to five courses ranked by **distinct learners** (same lesson-progress rule), then fills any remaining slots with the **newest published** courses so the strip stays full. Results are cached briefly server-side.  
  - A **Explore all courses** promo card (same centered column as the rest of the dashboard) links to `/courses`.  
  - Stat cards include **Active courses**: count of distinct started courses (same definition as Your courses), not a raw count of every `CourseProgress` row.

- **Course catalog (`/courses`)**  
  - Centered title and subtitle.  
  - **GET** form (shareable URLs): **search** by course title (substring), **filter** by level (Beginner / Intermediate / Advanced) and **subject**, **sort** by last updated, created date, or title (asc/desc).  
  - **Pagination**: 15 published courses per page.

## Admin Panel

Administrators manage the platform through a dedicated admin panel at `/admin`, built with [Payload CMS](https://payloadcms.com) and a custom Next.js UI layer.

The sidebar provides access to:

- **Dashboard** - high-level admin overview
- **Lessons** - build lesson content using the block-based editor
- **Courses and Modules** - managed through lesson/curriculum editing flows in admin tools
- **Tasks** - create questions with prompts, answer choices, solutions, point values, and tag annotations; list supports **search** (debounced, question/title/id/lessons) and **task type** filter via `GET /api/admin/tasks?type=…`
- **Subjects** - top-level topic taxonomy
- **Tags** - canonical knowledge tags shared across tasks and flashcards; power the recommendation engine
- **Flashcards** - create study cards linked to tags for the SRS system; admin list supports **search** (debounced, question/answer/deck/tags/id) alongside deck and tag filters
- **Flashcard Decks** - create named decks, connect tags, and organize study sets
- **Users** - list users; **Credentials** column toggles **Pro** and **admin** role (`PATCH /api/admin/users/:id`); self–admin demotion is blocked
- **Media** - upload and manage images and files backed by S3-compatible object storage
- **Settings** - theme, reading-size preferences, **activity log on/off**, and related controls
- **AI Agent** - draft and full AI course generation workspace
- **Logs** - full audit trail of every administrative action

## Draft -> Publish Workflow

Publish state is controlled with `isPublished` flags on course content entities (courses, modules, lessons, tasks). Students only ever see published content.

```
Subject  ->  Course  ->  Module  ->  Lesson  ->  Task
            (published)  (published)  (published)  (published)
```

- A **Course** can be hidden in draft while its module structure is being built.
- A **Lesson** can be marked published independently - useful when releasing content progressively.
- A **Task** remains invisible to students until individually published.
- Admins always see all content regardless of publish state.

This gives content authors full control over what students see and when, without deleting content or creating branches.

## Lesson Builder and Content Blocks

Lessons are assembled from a sequence of typed content blocks. Admins add, reorder, and remove blocks freely in the Payload admin editor. Six block types are available:

### Text

Rich text powered by the Lexical editor. Supports headings, bold/italic, bullet and numbered lists, inline code, and links.

### Image

An image from the media library with configurable **width** (Small 400 px / Medium 600 px / Large 800 px / Full) and **alignment** (Left / Center / Right), plus an optional caption. Images are served through `/api/media/serve/:filename` (local file response or signed S3 redirect, depending on storage mode).

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

## Task Types and Assessments

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

## Media Management

When an S3-compatible bucket is configured (AWS S3, Cloudflare R2, Railway Object Storage, or any compatible API), uploads are pushed to object storage after being written locally for metadata extraction. **If no bucket is configured**, files remain on the server under **`public/media`** (typical for local development).

- Files are uploaded via `POST /api/media/upload`, then registered in the Payload **Media** collection.
- Files are delivered via **`/api/media/serve/:filename`**: the handler **serves from disk when the file exists**, otherwise (if S3 is configured) **redirects to a signed URL** for the object in the bucket.
- Usage is tracked per file so admins can see which lessons and tasks reference a given asset before deletion.
- Used by image-oriented lesson/task fields (lesson image blocks, task question media, task solution media, and lesson attachments).

## Pro Features

BrainStack includes Pro-gated capabilities on top of the core learning flow:

- **Lesson Assistant API** (`POST /api/lesson-assistant`) for contextual AI help during lessons.
- **Pro guardrails** via `requireProUser()` and rate limiting on assistant usage.
- **Admin user management** via `/api/admin/users` and `PATCH /api/admin/users/[id]` (`isPro` and/or `role`).

## Flashcard Decks

Flashcards support optional deck organization for targeted study modes:

- Admin list/create endpoints via `/api/flashcard-decks`.
- Deck metadata includes `name`, `slug`, optional `description`, and associated tags.
- Study endpoint supports `deckSlug` filtering (`GET /api/flashcards/study`).

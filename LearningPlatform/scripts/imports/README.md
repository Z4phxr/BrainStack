# Learning platform content imports

This folder contains a **modular, idempotent** import system for:

- **Tags** (Prisma) — must always run first
- **Courses** (Payload): subjects → courses → modules → lessons → theory blocks → tasks
- **Standalone modules** (Payload): attach additional modules to an existing course by `courseSlug`
- **Flashcards** (Prisma): creates/updates cards after tags exist

All data lives in `scripts/imports/data/**` as **CommonJS modules** that export plain JavaScript objects/arrays (not JSON files).

---

## How it works

1. **Auto-discovery**: each runner scans its data directory and imports every `*.js` file (sorted by filename). Nothing is manually registered in code.
2. **Idempotency**: imports use stable natural keys (slug, composite order keys, question+tag-set for flashcards). Re-running inserts missing rows and **re-syncs** existing Payload rows from your files (see “Skip vs update” below).
3. **Fault isolation**: a bad file is logged and skipped where possible; runners exit with status `1` if any file failed.
4. **Dry-run**: pass `--dry-run` (or set `IMPORT_DRY_RUN=1`) to avoid writes. Payload steps still perform reads and print what would change; Prisma tag/flashcard helpers also respect dry-run.

---

## Import order (enforced by `import-all.js`)

1. **Tags** — flashcards and task tag embeddings expect slugs to exist in Prisma.
2. **Courses** — full tree import for each file in `data/courses/`.
3. **Modules** — incremental module additions in `data/modules/` (same idempotency rules as embedded modules).
4. **Flashcards** — creates or updates cards; skipped when question **and** tag set match and content unchanged.

---

## Folder structure

```text
scripts/imports/
  README.md                 ← this file
  data/
    tags/                   ← `*.js` files export an array of `{ name, slug, main? }`
    courses/                ← `*.js` files export `{ subject, course, modules }`
    modules/                ← `*.js` files export `{ courseSlug, module | modules }`
    flashcards/             ← `*.js` files export an array of `{ question, answer, tagSlugs }`
  helpers/
    utils.js                ← env, scanning, lexical helpers, validation, flashcard hash
    prisma-client.js        ← Prisma + pg adapter (matches legacy import scripts)
    payload-client.js       ← Payload local API bootstrap
    tags.js                 ← Prisma tag upserts + task tag helpers
    course-import.js        ← course tree sync
    module-import.js        ← standalone module import wrapper
    flashcard-import.js     ← flashcard upsert logic
  runners/
    import-all.js           ← orchestrates the ordered pipeline
    import-tags.js
    import-courses.js
    import-modules.js
    import-flashcards.js
```

---

## Skip vs update (design)

| Entity | Key | Behavior |
| --- | --- | --- |
| Tag | `slug` | **Skip** when `name` + `main` match; **update** when they differ |
| Subject | `slug` | **Update** if exists (files are treated as source of truth) |
| Course | `slug` | **Update** if exists |
| Module | `course` + `order` | **Update** if exists; warns when title changed at same order |
| Lesson | `module` + `order` | **Update** if exists |
| Task | `lesson` + `order` + `type` | **Update** if exists |
| Flashcard | `question` + tag **set** | **Skip** when question, answer, and tag links match; **update** when answer/tags differ; **create** when no matching tag set |

This avoids duplicate rows while keeping curriculum files authoritative for CMS-published content.

---

## Full examples

### Course import (`data/courses/*.js`)

```javascript
module.exports = {
  subject: { name: 'Web Development', slug: 'web-development' },
  course: {
    title: 'JavaScript Basics',
    slug: 'javascript-basics',
    description: 'Intro course',
    level: 'BEGINNER',
    isPublished: false,
  },
  modules: [
    {
      title: 'Getting started',
      order: 1,
      lessons: [
        {
          title: 'What is JavaScript?',
          order: 1,
          theoryBlocks: [{ blockType: 'text', content: 'Hello world' }],
          tasks: [
            {
              type: 'TRUE_FALSE',
              order: 1,
              prompt: 'JS runs in browsers.',
              correctAnswer: 'true',
              tagSlugs: ['javascript', 'basics'],
              points: 1,
            },
          ],
        },
      ],
    },
  ],
}
```

### Module import (`data/modules/*.js`)

```javascript
module.exports = {
  courseSlug: 'javascript-basics',
  module: {
    title: 'Advanced Topics',
    order: 3,
    lessons: [
      {
        title: 'Closures',
        order: 1,
        theoryBlocks: [],
        tasks: [],
      },
    ],
  },
}
```

You can also export `modules: [ {...}, {...} ]` instead of a single `module` object.

### Flashcards import (`data/flashcards/*.js`)

```javascript
module.exports = [
  {
    question: 'What is the JS engine in Chrome called?',
    answer: 'V8',
    tagSlugs: ['javascript', 'basics'],
  },
]
```

### Tags import (`data/tags/*.js`)

```javascript
module.exports = [
  { name: 'JavaScript', slug: 'javascript', main: true },
  { name: 'Basics', slug: 'basics' },
]
```

---

## How to run

From the **app root** (`LearningPlatform/LearningPlatform`, where `package.json` lives):

```bash
node scripts/imports/runners/import-all.js
```

> **Note:** Payload’s config is TypeScript (`src/payload/payload.config.ts`). Use **`tsx`** with **`tsconfig.scripts.json`** so Node can load that config:

```bash
npx tsx --tsconfig tsconfig.scripts.json ./scripts/imports/runners/import-all.js
```

Or use the npm scripts (see `package.json`):

```bash
npm run content:import:all
```

### Flags

- `--dry-run` — no Prisma/Payload writes
- `--strict` — fail validation earlier (e.g. require non-empty `modules` on course files)
- `--help` — print runner-specific help

---

## How to add new data

1. Add a new `*.js` file under the proper `data/<type>/` folder.
2. Export the object/array shape described above.
3. Prefer deterministic ordering via numeric `order` fields and URL-safe slugs.
4. Keep tag files lexicographically first if they must run before others in the same stage (files are sorted by name).
5. Re-run imports anytime — existing entities align to your files; flashcards skip cleanly when unchanged.

### Environment

- **Prisma**: `DATABASE_URL` or `PAYLOAD_DATABASE_URL`
- **Payload**: `PAYLOAD_SECRET`

(`dotenv` loads `.env` from the app root automatically.)

### Docker

From the host, with the stack running:

```bash
docker compose --env-file .env exec app npm run content:import:all
```

Import files are copied into the image at **build** time (`Dockerfile` copies `./scripts`). After editing `scripts/imports/data`, **rebuild** the image or **mount** `./scripts/imports` (see `DOCKER.md`).

If you previously deleted courses and still see stray lessons/tasks in admin, run once:

```bash
docker compose --env-file .env exec app npm run payload:cleanup-orphans
```

New deletes cascade automatically (see `beforeDelete` hooks on courses, modules, lessons).

---

## Validation & conflicts (bonus)

- **Duplicate module orders inside one file** log `[WARN]` before import.
- **Module title changes at the same order** log `[WARN]` but continue (import file wins).
- **Flashcard tag slugs missing** log `[WARN]` (import tags first).
- Course `level` must be one of `BEGINNER | INTERMEDIATE | ADVANCED` when provided.

# Content imports

Add **`.js` files** under `data/` (CommonJS: `module.exports = …`). Each runner picks up every `*.js` in its folder, **sorted by filename**—no registry in code.

**AI-generated course scripts:** use real **`image`** / **`video`** theory blocks — not `text` with `[IMAGE_PLACEHOLDER: …]`. See **[`AI_THEORY_BLOCKS.md`](./AI_THEORY_BLOCKS.md)** for exact shapes and the magic image token `__IMPORT_PLACEHOLDER_IMAGE__`.

**Run order (full pipeline):** tags → courses → standalone modules → flashcards. Use:

```bash
npm run content:import:all
```

(`DATABASE_URL` or `PAYLOAD_DATABASE_URL`, plus `PAYLOAD_SECRET`; `.env` at app root.)

| What | Folder | Export |
|------|--------|--------|
| **Tags** (Prisma) | `data/tags/` | Array of `{ name, slug, main?: boolean }` |
| **Course tree** (Payload) | `data/courses/` | One object `{ subject, course, modules }` per file |
| **Extra modules** (Payload) | `data/modules/` | `{ courseSlug, module }` or `{ courseSlug, modules: [...] }` |
| **Flashcards** (Prisma) | `data/flashcards/` | Array of `{ question, answer, tagSlugs: string[] }` |

Tasks reference tags by **slug**; import tags before courses/flashcards that use them. Course `level`: `BEGINNER` | `INTERMEDIATE` | `ADVANCED`.

---

## Shapes (minimal examples)

**`data/tags/example.js`**

```javascript
module.exports = [
  { name: 'JavaScript', slug: 'javascript', main: true },
  { name: 'Basics', slug: 'basics' },
]
```

**`data/courses/example.js`** — `theoryBlocks`: `text` / `callout` use string `content`; **`image`** uses Media id or `__IMPORT_PLACEHOLDER_IMAGE__` (resolved at import); **`video`** uses YouTube `videoUrl` + `aspectRatio`. Tasks need `type`, `order`, `prompt`, `tagSlugs`, etc. Details: [`AI_THEORY_BLOCKS.md`](./AI_THEORY_BLOCKS.md).

**Course cover (`course.coverImage`)** — optional; shown on the student dashboard and course page. Imports **do not** set a cover unless you specify one:

- **Omit** `coverImage` → leaves the course cover unchanged on re-import (no automatic placeholder).
- **`null`** → clears the cover.
- **`__IMPORT_PLACEHOLDER_IMAGE__`** → uses the bundled theory placeholder SVG (only if you set this explicitly).
- **`"your-file.png"`** → basename of a file under **`scripts/imports/assets/`**. Supported: `.png`, `.jpg`, `.jpeg`, `.webp`, `.gif`, `.svg`.

For day-to-day cover images, use **Admin → Edit course** (cover picker) or upload via **Admin → Media**.

```javascript
module.exports = {
  subject: { name: 'Web', slug: 'web' },
  course: {
    title: 'JS Basics',
    slug: 'js-basics',
    description: 'Intro',
    level: 'BEGINNER',
    isPublished: false,
    // coverImage: 'custom-cover.png', // optional — file in scripts/imports/assets/
  },
  modules: [
    {
      title: 'Start',
      order: 1,
      lessons: [
        {
          title: 'Hello',
          order: 1,
          theoryBlocks: [
            { blockType: 'text', content: 'Hello world' },
            {
              blockType: 'image',
              image: '__IMPORT_PLACEHOLDER_IMAGE__',
              caption: 'Replace via Admin → Media',
              align: 'center',
              width: 'md',
            },
            {
              blockType: 'video',
              videoUrl: 'https://www.youtube.com/watch?v=jNQXAC9IVRw',
              title: 'Placeholder',
              caption: 'Swap URL anytime',
              aspectRatio: '16:9',
            },
          ],
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

**`data/modules/example.js`**

```javascript
module.exports = {
  courseSlug: 'js-basics',
  module: {
    title: 'More topics',
    order: 2,
    lessons: [{ title: 'Closures', order: 1, theoryBlocks: [], tasks: [] }],
  },
}
```

**`data/flashcards/example.js`**

```javascript
module.exports = [
  { question: 'V8 is the JS engine in which browser?', answer: 'Chrome', tagSlugs: ['javascript'] },
]
```

---

## Commands

| Script | Scope |
|--------|--------|
| `npm run content:import:all` | Full pipeline (recommended) |
| `npm run content:import:tags` | Tags only |
| `npm run content:import:course` | `data/courses/` |
| `npm run content:import:modules` | `data/modules/` |
| `npm run content:import:flashcards` | `data/flashcards/` |

Flags: `--dry-run`, `--strict`, `--help` (per runner).

**Docker:** `docker compose --env-file .env exec app npm run content:import:all` — data files are baked in at image build unless you mount `scripts/imports`.

**Orphan Payload rows** after old deletes: `npm run payload:cleanup-orphans` (one-off maintenance).

Re-running imports **updates** existing Payload rows for the same natural keys; flashcards **skip** when question + tag set + answer already match.

---

## Troubleshooting

**`Payload init failed: ... payload_locked_documents ... SET DATA TYPE uuid`**

That error comes from **Drizzle dev schema push** on connect (not from the import writers themselves). Your DB still has integer PKs on Payload’s internal lock tables while the app expects UUIDs.

1. **Align the database** (do this once per environment):

```bash
npm run payload:migrate
```

Migration `2026-04-10_convert_locked_documents_to_uuid.ts` truncates those lock tables (only ephemeral edit locks) and converts IDs to UUID.

2. **Import runners** set `PAYLOAD_MIGRATING=true` so they **skip** dev push and avoid that failed `ALTER` while importing. You should still run `payload:migrate` so `next dev` and production stay consistent.

Then:

```bash
npm run content:import:all
```

**`Invalid module "@payload-config"`** when running import with plain `node`

Use the npm script (or `tsx --tsconfig tsconfig.scripts.json ...`) so path aliases resolve:

```bash
npm run content:import:all
```

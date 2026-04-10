# Content imports

Add **`.js` files** under `data/` (CommonJS: `module.exports = …`). Each runner picks up every `*.js` in its folder, **sorted by filename**—no registry in code.

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

**`data/courses/example.js`** — `theoryBlocks`: `text` / `callout` use string `content`; tasks need `type`, `order`, `prompt`, `tagSlugs`, etc.

```javascript
module.exports = {
  subject: { name: 'Web', slug: 'web' },
  course: {
    title: 'JS Basics',
    slug: 'js-basics',
    description: 'Intro',
    level: 'BEGINNER',
    isPublished: false,
  },
  modules: [
    {
      title: 'Start',
      order: 1,
      lessons: [
        {
          title: 'Hello',
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

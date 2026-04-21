# Instructions: generate flashcard import files

You output **only** CommonJS files: `module.exports = …`. No HTML, React, courses, or lessons.

**Paths**

- New tags: `scripts/imports/data/tags/[name].js` — array of `{ name, slug, main? }`. Create this **before** any file that uses new `tagSlugs`.
- Decks: `scripts/imports/data/flashcards/[name].js`

**Deck `deck` object — root (parent) deck**

- Required: `slug` (kebab-case, unique), `name`.
- Optional: `description`, `tagSlugs` (array of existing tag slugs).
- Optional: `subjectId` — string id for the catalog subject field; if you do not have one, omit or use `__SUBJECT_ID__` and leave a one-line note for the human to replace it.
- **Do not set:** `courseId`, `parentDeckSlug`, or `moduleId` on the root deck.

**Deck `deck` object — child deck (optional split)**

- Same as root, plus **`parentDeckSlug`** = the root deck’s `slug`.
- Still **do not set** `courseId` or `moduleId`.

**Cards**

Each item: `{ question: string, answer: string, tagSlugs: string[] }`. Answers: 2–4 clear sentences. LaTeX: use `\\` not `\`. Do not use the character `—`.

---

**Shape A — one file, all cards on the root deck**

```javascript
// scripts/imports/data/flashcards/example.js
module.exports = {
  deck: {
    slug: 'my-review-deck',
    name: 'My review deck',
    description: 'Optional.',
    tagSlugs: ['topic-slug'],
  },
  cards: [
    { question: '…?', answer: '….', tagSlugs: ['topic-slug'] },
  ],
}
```

**Shape B — root with empty `cards`, then a second file with an array of `{ deck, cards }`**

Root file must sort **before** the chunk file by filename (e.g. `topic-main.js` then `topic-parts.js`).

Root:

```javascript
module.exports = {
  deck: { slug: 'topic-main', name: 'Topic', tagSlugs: ['topic-slug'] },
  cards: [],
}
```

Chunk (one entry per section):

```javascript
module.exports = [
  {
    deck: { slug: 'topic-a', name: 'Section A', parentDeckSlug: 'topic-main', tagSlugs: ['topic-slug'] },
    cards: [{ question: '…?', answer: '….', tagSlugs: ['topic-slug'] }],
  },
  {
    deck: { slug: 'topic-b', name: 'Section B', parentDeckSlug: 'topic-main', tagSlugs: ['topic-slug'] },
    cards: [{ question: '…?', answer: '….', tagSlugs: ['topic-slug'] }],
  },
]
```

---

**Before you write:** if the user did not give topic, approximate card count, or whether to use one file vs root+chunk, ask in one short message.

**Before you finish:** every `slug` is unique across your files; every `tagSlugs` value exists in your tags file or was already valid; every file ends with a single `module.exports`.

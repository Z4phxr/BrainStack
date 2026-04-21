# Flashcards — student catalog, standalone library, and study access

**Release date:** 2026-04-20  
**Primary scope:** Student-facing flashcard discovery and deck-tree UX; **standalone** (non-course) decks opt-in via library enrollment; study API access rules; admin flashcard UI consolidation; documentation and API tests.

This log complements `git log` and is meant for onboarding, audits, and release notes. For exact line-level history, use:

```bash
git log --oneline -- app/api/flashcards app/(student)/dashboard/flashcards lib/flashcards-dashboard-summary.ts prisma/schema.prisma
```

---

## Summary

- **Course-linked decks** behave as before: any signed-in student can open course main/subdeck study URLs when the course deck exists.
- **Standalone main decks** (no `courseId`) only appear in a learner’s **dashboard summary** and **study** flows after they **enroll** via the browse catalog (`POST …/standalone-decks/enroll`), which creates a `UserStandaloneFlashcardDeck` row.
- **Browse catalog** lists standalone roots and published **course main** decks; learners add standalone sets to “My flashcards” from there.
- **Deck tree** page (`/dashboard/flashcards`) supports `?courseSlug=` and `?standaloneDeckSlug=` deep links from the dashboard strip and browse cards.
- **Prisma:** `FlashcardDeck.subjectId` (Payload subject taxonomy on decks) and join model **`UserStandaloneFlashcardDeck`** (`userId` + `deckId` composite PK).

---

## Added

### Data model

- **`UserStandaloneFlashcardDeck`** — `(userId, deckId)` enrollment for standalone **root** decks; cascades on user or deck delete. Table: `user_standalone_flashcard_decks`.
- **`FlashcardDeck.subjectId`** — optional Payload `subjects` id for standalone (and display) metadata; indexed.

### API routes

- **`GET /api/flashcards/standalone-decks`** — authenticated catalog: standalone mains + published course mains; includes tags, card counts, child subdeck counts, and **enrolled** flag per deck for the current user.
- **`POST /api/flashcards/standalone-decks/enroll`** — body `{ deckSlug }`; enrolls current user in a standalone main deck by slug (idempotent).
- **`PATCH /api/flashcard-decks/[id]`** (admin) — deck updates including metadata used by the student catalog.

### Libraries

- **`lib/flashcards-study-access.ts`** — `assertUserCanStudyDeckScope()` enforces: course-linked trees remain open; standalone **main** and **subdeck** study requires an enrollment row on the resolved standalone root.
- **`lib/payload-subject-names.ts`** — resolves subject display names for deck `subjectId` values in summaries and APIs.

### Student UI

- **`/dashboard/flashcards/browse`** — “Discover decks” catalog: filters (search, subject, sort), client pagination, enroll / open deck tree / course links, glass styling aligned with **Discover courses** (`/courses`).
- **Dashboard flashcard strip** — “Browse all decks” and per-deck “Open deck tree” links with `standaloneDeckSlug` / `courseSlug` query params.
- **`/dashboard/flashcards`** — deck tree cards: standalone description, **subject + tags** as glass pills (`studentGlassPill`), centered empty-state when there are no subdecks, **Back to dashboard** control (same pattern as `/courses`).

### Admin UI

- **`admin-flashcards-client.tsx`** — large client surface for `/admin/flashcards` (deck trees, filters, editors) extracted from the page entry.
- **`admin-flashcard-tag-picker.tsx`** — reusable tag picker for standalone deck authoring.
- **`/admin/flashcards/deck/[deckId]/page.tsx`** — legacy deck URL entry (redirects into the unified `view` / `deckSlug` query shape where applicable).

### Tests

- Extended **`test/api/flashcard-decks-and-summary.test.ts`**, **`test/api/flashcards.test.ts`**, **`test/api/flashcard-study-weighting.test.ts`** for dashboard filtering, deck validation, and study-scope behavior.

### Migrations (Prisma)

- `20260420120000_user_standalone_flashcard_decks`
- `20260420123000_flashcard_deck_subject_id`

---

## Changed

- **`getFlashcardDashboardSummary`** (`lib/flashcards-dashboard-summary.ts`) — aggregates **course** and **standalone** roots; standalone rows only for enrolled users; optional `courseSlug` / `standaloneDeckSlug` filtering for the deck-tree page; deck payload may include `description`, `subject`, and `tags` for standalone UI.
- **`GET /api/flashcards/dashboard-summary`** — forwards optional slug filters to the summary loader.
- **`GET /api/flashcards/study`** — calls **`assertUserCanStudyDeckScope`** for `mainDeckSlug` / `subdeckSlug` before building sessions.
- **`/admin/flashcards/page.tsx`** — hosts the refactored client component; hierarchy and standalone authoring flows updated (description, subject, tags).
- **`components/dashboard/flashcard-section.tsx`** — consumes new summary fields and browse links.
- **`app/(student)/courses/page.tsx`** — catalog title **Discover courses**; pagination UX (e.g. chevron controls) as implemented in-app.
- **`components/courses/catalog-pagination.tsx`** — removed if superseded by inline pagination on `/courses` (verify in tree).
- **`app/(student)/courses/[slug]/page.tsx`** — course detail integration with flashcard entry points where applicable.
- **`app/api/flashcard-decks/route.ts`**, **`app/api/flashcards/route.ts`**, **`validate-flashcard-refs.ts`** — validation and admin listing aligned with hierarchy and standalone rules.
- **`documentation/*`** — flashcards, database, adaptive learning, testing, and this changelog (see commit history for exact files).
- **Content imports** — `upsertFlashcardDeck` persists **`subjectId`**; **`import-flashcards.js`** forwards **`courseId` / `moduleId` / `parentDeckSlug`** from each `deck` object (previously dropped for `{ deck, cards }` files) and supports **`module.exports = [{ deck, cards }, …]`** chunk files. **`CONTENT_IMPORTS.md`** and **`documentation/prompts/creation_prompt.MD`** document course-main **`cards: []`**, standalone direct cards, `subjectId`, and enrollment vs import.

---

## Fixed / tightened

- Standalone deck slugs are **not** a public study surface without enrollment.
- Deck **subject** display uses Payload subject ids consistently where `subjectId` is set.

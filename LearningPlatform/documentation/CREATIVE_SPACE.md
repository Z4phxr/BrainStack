# Creative Space

Student-facing **whiteboards** (“creative spaces”) for freeform layout: notes, media, decks, drawings, and board chrome—separate from course lesson flow.

## Routes

| Path | Purpose |
|------|---------|
| `/creative-space` | List spaces, create a space, open a board. Uses the normal student shell **with navbar**. |
| `/creative-space/[spaceId]` | Full **board** view: no navbar, full viewport height. |

Routing uses a **`(shell)`** route group for most student pages (navbar + padding). The board route sits **outside** that group so layout does not depend on `x-pathname` (avoids navbar flashing wrong on refresh vs client navigation).

## Board (high level)

- **Pan / zoom** on a large fixed canvas; optional **background color**, **pattern overlay**, and **per-board** toolbar chrome (Light / Dark / Auto).
- **Blocks**: text notes, images, videos, links, course cards, **deck** cards (counts, SRS / Free Learn shortcuts), **flashcard** blocks (tap to flip front/back; drag from deck menus).
- **Drawing** layer (pen / eraser), persisted with the space.
- **Back to menu** fixed control above the tool column → returns to `/creative-space` (no extra card wrapper).

## Persistence & settings

- Space **items** and **drawings** stored in the database via **`/api/creative-spaces/...`** (CRUD, activity where applicable).
- **Local preferences** (background, pattern, zoom, toolbar chrome mode, surface appearance) are keyed **per `spaceId`** in `localStorage`, with one-time migration from older global keys where relevant.

## Main dashboard

- Promo card under **Your Flashcards** (“Open Creative Space”) linking to `/creative-space`.
- Creative Space is **not** a separate navbar icon; discovery is via the dashboard (and direct URL).

## Related UX fixes (brief)

- **Flashcards on board**: pointer capture is deferred until the user actually drags so a tap still fires **flip**.
- **Notes**: clicking outside a note’s textarea blurs it (board-level capture).
- **SRS / study** (`/dashboard/flashcards/study`): uses the same student shell **with navbar** as the rest of the app (fullscreen-only layout removed).

## Code map (starting points)

- **Board UI**: `components/student/creative-space-client.tsx`, `creative-space-board-with-surface.tsx`, `creative-space-surface-context.tsx`
- **Space list**: `components/student/creative-space-home-client.tsx`, `app/(student)/(shell)/creative-space/page.tsx`
- **Board route layout (no nav)**: `app/(student)/creative-space/[spaceId]/layout.tsx`
- **Student chrome + nav**: `app/(student)/(shell)/layout.tsx`
- **Dashboard promo**: `components/dashboard/creative-space-dashboard-promo.tsx`
- **Data / API helpers**: `lib/creative-space.ts`, `app/api/creative-spaces/**`

## Automated tests (Vitest)

- `test/api/creative-spaces.test.ts` — `/api/creative-spaces` (GET list, POST create), `/api/creative-spaces/[id]` (GET, PATCH, DELETE), `/api/creative-spaces/[id]/items` (GET, POST); Prisma + `auth` mocked
- `test/unit/creative-space-board.test.ts` — board hex normalization, preset / luminance chrome, pattern ids, surface CSS tokens
- `test/unit/creative-space-items.test.ts` — `CREATIVE_ITEM_TYPES` shape
- `test/components/creative-space-dashboard-promo.test.tsx` — promo copy and `/creative-space` CTA link

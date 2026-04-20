# Testing

Automated testing is split between Vitest (unit/component/api/integration/telemetry) and Playwright (browser E2E).

## Command Reference

```bash
npm run test              # full Vitest run
npm run test:watch        # Vitest watch mode
npm run test:ui           # Vitest interactive UI
npm run test:coverage     # Vitest + v8 coverage (text/json/html)
npm run test:ci           # Vitest run with SKIP_DB_SETUP=true
npm run test:unit         # test/unit
npm run test:integration  # test/integration
npm run test:telemetry    # test/telemetry
npm run test:e2e          # Playwright tests (test/e2e)
npm run test:e2e:ui       # Playwright UI mode
```

## Suite Structure

| Suite | Location | Runner | Notes |
|------|----------|--------|------|
| Unit | `test/unit` | Vitest | Utility, auth/security, SRS, analytics, rate-limit behavior |
| Component | `test/components` | Vitest + Testing Library | React UI/component behavior in `jsdom` |
| API | `test/api` | Vitest | Route handlers and API behaviors (usually mocked DB-light) |
| Integration | `test/integration` | Vitest | Cross-layer behavior, some suites require live DB/Payload |
| Telemetry | `test/telemetry` | Vitest | Data-capture/telemetry flows |
| E2E | `test/e2e` | Playwright | Browser journey tests. Playwright config is active; no E2E spec files are currently committed. |

## Current Configuration Highlights

- Vitest config: `vitest.config.ts`
  - `environment: 'jsdom'`
  - setup files: `test/setup.ts`, `test/setup-react.ts`
  - default env for runs is DB-light:
    - `SKIP_PAYLOAD_TESTS=true`
    - `SKIP_DB_SETUP=true`
- Playwright config: `playwright.config.ts`
  - `testDir: ./test/e2e`
  - auto web server: `npm run dev`
  - base URL: `PLAYWRIGHT_BASE_URL` or `http://localhost:3000`
  - browsers: Chromium, Firefox, WebKit

## Test Coverage

- Latest flashcard hierarchy regression pack (Apr 20, 2026):
  - Command:
    - `npm run test -- test/api/flashcards.test.ts test/api/flashcard-study-weighting.test.ts test/api/flashcard-decks-and-summary.test.ts`
  - Result:
    - Test files: `3 passed`
    - Tests: `43 passed`
  - Focused coverage command:
    - `npm run test:coverage -- test/api/flashcards.test.ts test/api/flashcard-study-weighting.test.ts test/api/flashcard-decks-and-summary.test.ts`
  - Focused coverage snapshot:
    - `app/api/flashcard-decks/route.ts`: `57.69%` statements
    - `app/api/flashcards/study/route.ts`: `69.09%` statements
    - `lib/flashcards-dashboard-summary.ts`: `89.47%` statements
  - New/updated feature-focused tests:
    - `test/api/flashcard-decks-and-summary.test.ts` (deck/subdeck create validation and dashboard hierarchy aggregation)
    - `test/api/flashcard-study-weighting.test.ts` (mainDeckSlug/subdeckSlug query validation and filtering)

- Latest baseline (Apr 15, 2026, `npm run test:coverage`):
  - Test files: `30 passed`, `2 skipped`
  - Tests: `413 passed`, `12 skipped`
  - Statements: `75.14%`
  - Branches: `58.88%`
  - Functions: `80%`
  - Lines: `76.9%`
- **Task attempt event log** (append-only `task_attempts` / recommendations / practice):
  - `test/unit/analytics.test.ts` — `getUserTagStats` / `getUserWeakTags` from `TaskAttempt` + `TaskAttemptTag`
  - `test/actions/progress.test.ts` — `submitTaskAnswer` writes attempts, tag joins, best-effort failure path, cache invalidation, no-tag tasks
  - `test/api/recommend-modes.test.ts` — weak (`groupBy` per task), review (latest-attempt semantics + ordering), mixed
  - `test/api/practice-session.test.ts` — solved tasks via `groupBy` on correct attempts
  - `test/integration/progress.integration.test.ts` — two submits ⇒ two `taskAttempt.create` calls
- Strong coverage areas:
  - `components/admin`: `93.68%` statements
  - `app/api/create-course`: `92%` statements
  - `app/api/subjects`: `100%` statements and lines
  - `lib/analytics.ts`: `100%` statements (tag stats from attempt log)
  - `app/api/recommend/tasks/route.ts`: ~`94%` statements
- Lower coverage areas (largest gaps):
  - `lib/prisma.ts`: `12.5%` statements
  - `lib/lexical.ts`: `20%` statements
  - `lib/lesson-theory-for-llm.ts`: `42.68%` statements
  - `lib/lexical-to-markdown.ts`: `0%` statements
  - `app/actions/progress.ts`: `0%` statements (barrel re-export only; implementation is in `submit-task.ts` and co-located modules)
  - `app/actions/user-stats.ts`: `0%` statements
- Coverage is produced by Vitest v8 reporters (`text`, `json`, `html`) and written to `coverage/`.
- Current Vitest config excludes `test/`, `prisma/`, `.next/`, `node_modules/`, and `**/*.config.*` from coverage.
- No explicit coverage threshold gate is configured in Vitest yet.

## Environment Flags

- `SKIP_DB_SETUP`
  - When true, DB connect/cleanup in `test/setup.ts` is skipped.
  - Used by default in DB-light runs and by `npm run test:ci`.
- `SKIP_PAYLOAD_TESTS`
  - Used by integration suites that need live Payload/DB access.
  - When true, those suites are conditionally skipped.

## Practical Workflows

- **Fast local check before commit**
  - `npm run test:unit`
  - `npm run test` (includes `test/api`, `test/components`, `test/integration`, etc.)
- **Pre-PR fuller pass**
  - `npm run test`
  - `npm run test:coverage`
- **When changing DB/Payload-heavy logic**
  - Run integration tests with DB/Payload available and skip flags disabled (example: set `SKIP_DB_SETUP=false` and `SKIP_PAYLOAD_TESTS=false` before `npm run test:integration`).
- **Browser journeys**
  - `npm run test:e2e`
  - Store Playwright specs in `test/e2e` so they are picked up by default config.

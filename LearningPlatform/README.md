# BrainStack

[![Next.js](https://img.shields.io/badge/Next.js-15.5.12-black?logo=nextdotjs&logoColor=white)](https://nextjs.org)
[![React](https://img.shields.io/badge/React-19.2.3-61DAFB?logo=react&logoColor=white)](https://reactjs.org)
[![TypeScript](https://img.shields.io/badge/TypeScript-5-blue?logo=typescript)](https://www.typescriptlang.org)
[![Payload CMS](https://img.shields.io/badge/Payload_CMS-3.72.0-ff69b4)](https://payloadcms.com)
[![PostgreSQL](https://img.shields.io/badge/PostgreSQL-16-336791?logo=postgresql&logoColor=white)](https://www.postgresql.org)
[![Prisma](https://img.shields.io/badge/Prisma-7.3.0-2D3748?logo=prisma&logoColor=white)](https://www.prisma.io)
[![Tests](https://img.shields.io/badge/tests-Vitest%20%2B%20Playwright-blue)](documentation/TESTING.md)

A production-ready exam preparation and course management platform built on Next.js 15, Payload CMS v3, and PostgreSQL. It covers the full lifecycle from content authoring to student practice with adaptive recommendations, spaced repetition flashcards, AI-assisted generation, and full audit logging.

---

## What You Can Do

| Area | Highlights |
|------|-----------|
| Student discovery | Dashboard shows courses you have started, a popularity strip, and a catalog promo card linking to `/courses` (filter by level and subject, search titles, sort, 15 per page) |
| Course authoring | Manage `Subject -> Course -> Module -> Lesson -> Task` content with draft/publish controls |
| Structured lessons | Build lessons from content blocks (text, image, math, callout, video, table) |
| Assessments | Use multiple-choice, true/false, and open-ended tasks with scoring and solutions |
| Adaptive learning | Recommend practice based on weak tags from learner answer history |
| Flashcards (SRS) | Run spaced-repetition sessions with per-user state and SM-2 scheduling |
| AI generation (experimental) | Generate draft and full course structures/content from the admin AI workspace |
| Media and security | Use S3-compatible media storage with signed URLs and role-based protected access |
| Progress and auditability | Track user progress and keep a persistent admin activity log |

---

## Quick Local Start

```bash
npm install
cp .env.example .env
# Fill required env values
npm run dev
```

For full setup (Docker, migrations, seeding, local URLs), see [`documentation/LOCAL_DEVELOPMENT.md`](documentation/LOCAL_DEVELOPMENT.md).

---

## AI Course Generation (Experimental)

The admin AI Agent supports draft generation, iterative refinement, and accept-and-generate with progress tracking.

- Endpoint flow and UI behavior: [`documentation/AI_COURSE_GENERATION.md`](documentation/AI_COURSE_GENERATION.md)
- Requires at least one provider key: `ANTHROPIC_API_KEY` or `OPENAI_API_KEY`
- Cost depends on selected model and output size

---

## Documentation

Start with the full docs index: [`documentation/README.md`](documentation/README.md)

### Product and Learning

- [`documentation/PLATFORM_FEATURES.md`](documentation/PLATFORM_FEATURES.md) - admin panel, draft/publish workflow, lesson blocks, task types, media behavior
- [`documentation/ADAPTIVE_LEARNING.md`](documentation/ADAPTIVE_LEARNING.md) - adaptive recommendation engine and spaced repetition internals
- [`documentation/AI_COURSE_GENERATION.md`](documentation/AI_COURSE_GENERATION.md) - AI generation workflow, provider setup, testing notes

### Development and Operations

- [`documentation/LOCAL_DEVELOPMENT.md`](documentation/LOCAL_DEVELOPMENT.md) - prerequisites, full setup, quick start, local URLs
- [`documentation/CONTENT_IMPORTS.md`](documentation/CONTENT_IMPORTS.md) - bulk content import workflows and script usage
- [`documentation/TESTING.md`](documentation/TESTING.md) - test commands and test suite scope

### Architecture and Reference

- [`documentation/DATABASE_ARCHITECTURE.md`](documentation/DATABASE_ARCHITECTURE.md) - schema architecture, data flow, indexing, integrity
- [`documentation/SECURITY_ARCHITECTURE.md`](documentation/SECURITY_ARCHITECTURE.md) - authentication, authorization, validation, session security
- [`documentation/LOGGING_SYSTEM.md`](documentation/LOGGING_SYSTEM.md) - action coverage, log schema, admin log usage
- [`documentation/TECHNOLOGY_STACK.md`](documentation/TECHNOLOGY_STACK.md) - stack by layer
- [`documentation/screenshots/`](documentation/screenshots/) - product screenshot assets (see also `documentation/AI_COURSE_GENERATION.md`)

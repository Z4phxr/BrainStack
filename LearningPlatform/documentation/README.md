# Documentation Index

This folder contains detailed technical documentation for BrainStack.

If you want a quick product overview, start with the root [`README.md`](../README.md).  
If you need architecture, implementation details, or operational guidance, use the documents below.

## Product and Learning Features

- [`PLATFORM_FEATURES.md`](./PLATFORM_FEATURES.md)  
  Admin panel capabilities, draft/publish workflow, lesson content blocks, task types, media behavior, the student dashboard plus **`/courses` (Discover courses)** and **`/dashboard/flashcards/browse` (Discover decks)**, and **flashcard deck hierarchy** (course main + module subdecks, standalone decks with optional **library enrollment**, student deck tree + study URLs, admin URLs).

- [`ADAPTIVE_LEARNING.md`](./ADAPTIVE_LEARNING.md)  
  Deep dive into adaptive recommendations, weak-tag analytics, practice session composition, and spaced repetition behavior.

- [`AI_COURSE_GENERATION.md`](./AI_COURSE_GENERATION.md)  
  Admin AI Agent flow, provider setup, current testing notes, and cost guidance.

- [`prompts/standalone_flashcards_prompt.MD`](./prompts/standalone_flashcards_prompt.MD)  
  Short imperative prompt: flashcard-only import files (no course). Full course + flashcards: [`prompts/creation_prompt.MD`](./prompts/creation_prompt.MD).

## Development and Operations

- [`LOCAL_DEVELOPMENT.md`](./LOCAL_DEVELOPMENT.md)  
  Prerequisites, full local setup, quick start path, and local URLs.

- [`CONTENT_IMPORTS.md`](./CONTENT_IMPORTS.md)  
  Full import workflow reference: data shapes, stage scripts, LLM notes, troubleshooting, and Docker usage.

- [`TESTING.md`](./TESTING.md)  
  Vitest and Playwright commands, suite layout, environment flags, and a recorded coverage baseline.

## Changelog (release-style notes)

- [`changelog/README.md`](./changelog/README.md) — index of dated engineering logs (large vertical slices).  
- [`changelog/2026-04-20-flashcards.md`](./changelog/2026-04-20-flashcards.md) — flashcards: student catalog, standalone library enrollment, study access, schema.

## Architecture and Security

- [`DATABASE_ARCHITECTURE.md`](./DATABASE_ARCHITECTURE.md)  
  Database schema design, data model boundaries, and storage responsibilities.

- [`SECURITY_ARCHITECTURE.md`](./SECURITY_ARCHITECTURE.md)  
  Authentication, authorization, and security controls across the platform.

- [`LOGGING_SYSTEM.md`](./LOGGING_SYSTEM.md)  
  Activity log action types, `logActivity` integration points, optional **pause** via Admin Settings, and `/admin/logs` filters.

- [`TECHNOLOGY_STACK.md`](./TECHNOLOGY_STACK.md)  
  Stack by layer across framework, data, auth, testing, and deployment.


# Logging System

## Overview

The activity logging system provides a persistent, queryable audit trail of important platform events. Administrators can review all logged actions through the admin panel to monitor platform usage, diagnose issues, and maintain accountability.

---

## What Is Logged

The system captures the following action types:

### Authentication

| Action | Triggered by |
|---|---|
| `USER_REGISTERED` | A new user account is created via `/auth/register` |
| `USER_LOGIN` | A user authenticates via `/auth/login` |
| `USER_LOGOUT` | A user signs out via `/auth/logout` |
| `USER_LOGIN_FAILED` | A login attempt fails (bad password or unknown email) |

### Subject Management

| Action | Triggered by |
|---|---|
| `SUBJECT_CREATED` | An admin creates a new subject |
| `SUBJECT_UPDATED` | An admin renames or modifies a subject |
| `SUBJECT_DELETED` | An admin deletes a subject |

### Course Management

| Action | Triggered by |
|---|---|
| `COURSE_CREATED` | An admin creates a new course |
| `COURSE_UPDATED` | An admin updates course fields |
| `COURSE_PUBLISHED` | An admin sets a course to published |
| `COURSE_UNPUBLISHED` | An admin sets a course to draft |
| `COURSE_TREE_PUBLISHED` | An admin publishes a course with all nested modules/lessons/tasks |
| `COURSE_DELETED` | An admin deletes a course and all its content |

### Module Management

| Action | Triggered by |
|---|---|
| `MODULE_CREATED` | An admin creates a module within a course |
| `MODULE_UPDATED` | An admin updates a module |
| `MODULE_PUBLISHED` | An admin sets a module to published |
| `MODULE_UNPUBLISHED` | An admin sets a module to draft |
| `MODULE_DELETED` | An admin deletes a module and all its lessons and tasks |

### Lesson Management

| Action | Triggered by |
|---|---|
| `LESSON_CREATED` | An admin creates a lesson within a module |
| `LESSON_UPDATED` | An admin updates lesson content or settings |
| `LESSON_PUBLISHED` | An admin sets a lesson to published |
| `LESSON_UNPUBLISHED` | An admin sets a lesson to draft |
| `LESSON_DELETED` | An admin deletes a lesson and all associated tasks |

### Task Management

| Action | Triggered by |
|---|---|
| `TASK_CREATED` | An admin creates a task (question) |
| `TASK_UPDATED` | An admin edits an existing task |
| `TASK_DELETED` | An admin deletes a task |

### Flashcard Management

| Action | Triggered by |
|---|---|
| `FLASHCARD_CREATED` | An admin creates a flashcard via `POST /api/flashcards` |
| `FLASHCARD_UPDATED` | An admin updates a flashcard via `PUT /api/flashcards/:id` |
| `FLASHCARD_DELETED` | An admin deletes a flashcard via `DELETE /api/flashcards/:id` |

### Tag Management

| Action | Triggered by |
|---|---|
| `TAG_CREATED` | An admin creates a tag via `POST /api/tags` |
| `TAG_UPDATED` | An admin renames or modifies a tag via `PUT /api/tags/:id` |
| `TAG_DELETED` | An admin deletes a tag via `DELETE /api/tags/:id` |

### Media Management

| Action | Triggered by |
|---|---|
| `MEDIA_UPLOADED` | An admin uploads a media file |
| `MEDIA_DELETED` | An admin deletes media file |

### Pro and AI Features

| Action | Triggered by |
|---|---|
| `USER_PRO_LESSON_ASSISTANT` | A Pro user asks the lesson assistant (`POST /api/lesson-assistant`) |
| `ADMIN_USER_PRO_UPDATED` | An admin updates a user's Pro flag (`PATCH /api/admin/users/:id`) |

---

## Each Log Entry Contains

| Field | Description |
|---|---|
| `id` | Unique CUID identifier for the log entry |
| `timestamp` | UTC timestamp of when the action occurred |
| `action` | One of the action type constants listed above |
| `actorUserId` | Prisma User ID of the user who performed the action |
| `actorEmail` | Email address of the actor, denormalized for fast display |
| `resourceType` | The type of resource affected (e.g. `course`, `lesson`, `user`) |
| `resourceId` | The ID of the affected resource |
| `metadata` | Optional JSON object with additional context (e.g. resource title) |
| `createdAt` | Row creation timestamp (equal to `timestamp` for new entries) |

---

## How the Logging Mechanism Works

### Database Table

The `activity_logs` table is defined in `prisma/schema.prisma` under the `ActivityLog` model and managed through Prisma migrations in `prisma/migrations`.

Indexes are maintained on `timestamp`, `actorUserId`, `action`, and `resourceType` to support efficient filtered queries.

### Logging Service

The central logging utility lives in `lib/activity-log.ts`. It exports:

- `ActivityAction` — a frozen object of all supported action type constants.
- `logActivity(params)` — the main logging function.

`logActivity` is **fire-and-forget**: it calls `prisma.activityLog.create(...)` without being awaited by the caller. Any database error is silently caught and written to the application logger at the `WARNING` level. This design ensures that a logging failure never disrupts the primary operation being performed.

Usage example:

```ts
import { logActivity, ActivityAction } from '@/lib/activity-log'

logActivity({
  action:       ActivityAction.COURSE_CREATED,
  actorUserId:  admin.id,
  actorEmail:   admin.email,
  resourceType: 'course',
  resourceId:   String(course.id),
  metadata:     { title: course.title },
})
```

### Integration Points

Logging calls are placed after the primary database operation succeeds in the following files:

| File | Operations logged |
|---|---|
| `app/auth/register/route.ts` | USER_REGISTERED |
| `auth.ts` | USER_LOGIN, USER_LOGIN_FAILED, USER_LOGOUT |
| `app/auth/login/route.ts` | USER_LOGIN |
| `app/auth/logout/route.ts` | USER_LOGOUT |
| `app/(admin)/admin/actions/courses.ts` | COURSE_CREATED, COURSE_UPDATED, COURSE_PUBLISHED, COURSE_UNPUBLISHED, COURSE_TREE_PUBLISHED, COURSE_DELETED |
| `app/(admin)/admin/actions/modules.ts` | MODULE_CREATED, MODULE_UPDATED, MODULE_PUBLISHED, MODULE_UNPUBLISHED, MODULE_DELETED |
| `app/(admin)/admin/actions/lessons.ts` | LESSON_CREATED, LESSON_UPDATED, LESSON_PUBLISHED, LESSON_UNPUBLISHED, LESSON_DELETED |
| `app/(admin)/admin/actions/tasks.ts` | TASK_CREATED, TASK_UPDATED, TASK_DELETED |
| `app/api/subjects/route.ts` | SUBJECT_CREATED, SUBJECT_UPDATED, SUBJECT_DELETED |
| `app/api/flashcards/route.ts` | FLASHCARD_CREATED |
| `app/api/flashcards/[id]/route.ts` | FLASHCARD_UPDATED, FLASHCARD_DELETED |
| `app/api/tags/route.ts` | TAG_CREATED |
| `app/api/tags/[id]/route.ts` | TAG_UPDATED, TAG_DELETED |
| `app/api/media/upload/route.ts` | MEDIA_UPLOADED |
| `app/(admin)/admin/actions/media.ts` | MEDIA_DELETED |
| `app/api/lesson-assistant/route.ts` | USER_PRO_LESSON_ASSISTANT |
| `app/api/admin/users/[id]/route.ts` | ADMIN_USER_PRO_UPDATED |
| `lib/ai-agent/generation.ts` | COURSE_CREATED (source: ai-agent) |

---

## Viewing Logs in the Admin Panel

1. Sign in, then open the admin logs page at `/admin/logs`.
2. In the left sidebar, click **Logs**.
3. The logs page displays a paginated table of all recorded activity.

### Filtering

| Filter | Description |
|---|---|
| Action | Select a specific action type from the dropdown |
| User ID | Enter a Prisma User ID to filter by actor |
| Start date | Show only entries on or after this date |
| End date | Show only entries on or before this date |

Click **Apply** to submit the filters. Click **Reset** to clear all filters and return to the unfiltered list.

Filters are reflected in the URL query string, making filtered views bookmarkable and shareable.

### Pagination

Results are shown in pages of 20 entries by default. Use the **Previous** and **Next** buttons to navigate. The current page and total result count are always visible.

---

## Adding New Log Points

To log a new action type in a new part of the codebase:

1. Add a constant to the `ActivityAction` object in `lib/activity-log.ts`.
2. Import `logActivity` and `ActivityAction` where needed.
3. Call `logActivity(...)` after the primary operation completes.

No schema changes are required — the `action` column is a plain text field.

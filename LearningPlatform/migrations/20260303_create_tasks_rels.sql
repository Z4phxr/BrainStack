-- Migration: Create payload.tasks_rels relationship table
-- Date: 2026-03-03
-- Purpose: Payload CMS v3 stores hasMany relationship fields (tasks.lesson) in a
--          dedicated _rels table. This table was never created by earlier migrations,
--          causing "relation payload.tasks_rels does not exist" errors at runtime.

CREATE TABLE IF NOT EXISTS "payload"."tasks_rels" (
  "id"         serial       PRIMARY KEY,
  "order"      integer,
  "parent_id"  varchar      NOT NULL,
  "path"       varchar      NOT NULL,
  "lessons_id" varchar
);

CREATE INDEX IF NOT EXISTS "tasks_rels_order_idx"      ON "payload"."tasks_rels" ("order");
CREATE INDEX IF NOT EXISTS "tasks_rels_parent_idx"     ON "payload"."tasks_rels" ("parent_id");
CREATE INDEX IF NOT EXISTS "tasks_rels_path_idx"       ON "payload"."tasks_rels" ("path");
CREATE INDEX IF NOT EXISTS "tasks_rels_lessons_id_idx" ON "payload"."tasks_rels" ("lessons_id");

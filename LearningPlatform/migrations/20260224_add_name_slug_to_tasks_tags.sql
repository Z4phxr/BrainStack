-- Add name and slug columns to payload.tasks_tags and populate from legacy `tag`
ALTER TABLE IF EXISTS "payload"."tasks_tags"
  ADD COLUMN IF NOT EXISTS "name" varchar;

ALTER TABLE IF EXISTS "payload"."tasks_tags"
  ADD COLUMN IF NOT EXISTS "slug" varchar;

-- Populate name from existing `tag` column where present
UPDATE "payload"."tasks_tags"
SET "name" = COALESCE("name", "tag")
WHERE COALESCE("name", '') = '' AND COALESCE("tag", '') <> '';

-- Populate slug from name (lowercase, replace non-alphanumerics with '-')
UPDATE "payload"."tasks_tags"
SET "slug" = LOWER(REGEXP_REPLACE(COALESCE("name", ''), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE COALESCE("slug", '') = '';

-- Note: leave legacy `tag` column in place to be safe; a later migration can drop it

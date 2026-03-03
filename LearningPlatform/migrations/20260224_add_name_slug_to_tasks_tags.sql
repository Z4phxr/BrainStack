-- Add name and slug columns to payload.tasks_tags
ALTER TABLE IF EXISTS "payload"."tasks_tags"
  ADD COLUMN IF NOT EXISTS "name" varchar;

ALTER TABLE IF EXISTS "payload"."tasks_tags"
  ADD COLUMN IF NOT EXISTS "slug" varchar;

-- Populate name from existing `tag` column ONLY if that column exists (legacy DBs only)
DO $$
BEGIN
  IF EXISTS (
    SELECT 1 FROM information_schema.columns
    WHERE table_schema = 'payload'
      AND table_name   = 'tasks_tags'
      AND column_name  = 'tag'
  ) THEN
    UPDATE "payload"."tasks_tags"
    SET "name" = COALESCE("name", "tag")
    WHERE COALESCE("name", '') = '' AND COALESCE("tag", '') <> '';
  END IF;
END $$;

-- Populate slug from name
UPDATE "payload"."tasks_tags"
SET "slug" = LOWER(REGEXP_REPLACE(COALESCE("name", ''), '[^a-zA-Z0-9]+', '-', 'g'))
WHERE COALESCE("slug", '') = '';

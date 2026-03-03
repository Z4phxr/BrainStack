-- Migration: Add tag_id column to payload.tasks_tags
-- Date: 2026-02-28
-- Purpose: Link tasks_tags to canonical Prisma Tag.id for shared taxonomy

-- Step 1: Add tag_id column (nullable initially, will populate then make NOT NULL)
ALTER TABLE payload.tasks_tags 
ADD COLUMN IF NOT EXISTS tag_id TEXT;

-- Step 2: Create index on tag_id for performance
CREATE INDEX IF NOT EXISTS idx_tasks_tags_tagid ON payload.tasks_tags(tag_id);

-- Step 3: Backfill tag_id from existing name/slug by matching with public.tags
-- This attempts to match existing task tags to Prisma tags
UPDATE payload.tasks_tags tt
SET tag_id = t.id
FROM public.tags t
WHERE tt.tag_id IS NULL 
  AND (
    LOWER(COALESCE(tt.slug, '')) = LOWER(COALESCE(t.slug, ''))
    OR LOWER(COALESCE(tt.name, '')) = LOWER(COALESCE(t.name, ''))
  );

-- Step 4: Report any orphaned entries (tasks_tags without matching Prisma tag)
DO $$
DECLARE
  orphan_count INT;
BEGIN
  SELECT COUNT(*) INTO orphan_count 
  FROM payload.tasks_tags 
  WHERE tag_id IS NULL;
  
  IF orphan_count > 0 THEN
    RAISE NOTICE 'Found % task-tag entries without matching Prisma tag. These will need manual resolution or deletion.', orphan_count;
  END IF;
END $$;

-- Note: We intentionally leave tag_id nullable to allow manual cleanup of orphaned entries.
-- After cleanup, you can optionally run:
-- ALTER TABLE payload.tasks_tags ALTER COLUMN tag_id SET NOT NULL;

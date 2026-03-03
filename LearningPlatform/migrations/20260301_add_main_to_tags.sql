-- Add 'main' field to tags table
-- Default is false for all existing tags

ALTER TABLE public.tags 
ADD COLUMN IF NOT EXISTS main BOOLEAN NOT NULL DEFAULT false;

-- Create index for better query performance when filtering by main
CREATE INDEX IF NOT EXISTS idx_tags_main ON public.tags(main);

-- Optional: Comment for documentation
COMMENT ON COLUMN public.tags.main IS 'Indicates if this tag is marked as a main/featured tag';

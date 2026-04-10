-- Ensure Payload subjects IDs auto-generate on insert.
-- Some environments ended up with payload.subjects.id UUID without a default,
-- which causes content import to fail with NULL id constraint errors.

CREATE EXTENSION IF NOT EXISTS pgcrypto;

ALTER TABLE IF EXISTS payload.subjects
  ALTER COLUMN id SET DEFAULT gen_random_uuid();


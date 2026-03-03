-- Migration: add auto_grade column to Payload tasks table
-- Run this against the application's Postgres database.

BEGIN;

-- Add the auto_grade boolean column if it doesn't already exist
ALTER TABLE IF EXISTS payload.tasks
ADD COLUMN IF NOT EXISTS auto_grade boolean DEFAULT false;

-- Ensure default for existing rows
UPDATE payload.tasks SET auto_grade = false WHERE auto_grade IS NULL;

COMMIT;

-- Usage:
-- psql "$DATABASE_URL" -f CourseManagementPlatform/migrations/20260224_add_auto_grade_to_tasks.sql
-- or use your DB admin tool to run the above SQL.

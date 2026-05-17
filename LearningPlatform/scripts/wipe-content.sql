-- Wipe all courses, modules, lessons, tasks (Payload CMS) and flashcards (Prisma).
-- Keeps: users, media, subjects, tags, admin accounts.
--
-- Docker:
--   docker exec -i learningplatform-postgres-1 psql -U postgres -d exam_prep_db -v ON_ERROR_STOP=1 < scripts/wipe-content.sql
-- Or from LearningPlatform/:
--   Get-Content scripts/wipe-content.sql | docker exec -i learningplatform-postgres-1 psql -U postgres -d exam_prep_db -v ON_ERROR_STOP=1

BEGIN;

-- Prisma: student progress + flashcards
TRUNCATE TABLE
  public.task_attempt_tags,
  public.task_attempts,
  public.task_progress_tags,
  public.task_progress,
  public.lesson_progress,
  public.course_progress,
  public.user_flashcard_progress,
  public.flashcards,
  public.user_standalone_flashcard_decks,
  public.flashcard_decks
RESTART IDENTITY CASCADE;

-- Payload CMS: all tables except auth, media, subjects, migrations, preferences
DO $$
DECLARE
  r RECORD;
  keep_tables text[] := ARRAY[
    'payload_migrations',
    'payload_users',
    'media',
    'subjects',
    'payload_locked_documents',
    'payload_locked_documents_rels',
    'payload_preferences',
    'payload_preferences_rels'
  ];
BEGIN
  FOR r IN
    SELECT tablename
    FROM pg_tables
    WHERE schemaname = 'payload'
      AND tablename <> ALL (keep_tables)
      AND tablename NOT LIKE 'subjects%'
  LOOP
    EXECUTE format('TRUNCATE TABLE payload.%I RESTART IDENTITY CASCADE', r.tablename);
    RAISE NOTICE 'Truncated payload.%', r.tablename;
  END LOOP;
END $$;

COMMIT;

SELECT 'courses' AS item, COUNT(*)::text AS remaining FROM payload.courses
UNION ALL SELECT 'modules', COUNT(*)::text FROM payload.modules
UNION ALL SELECT 'lessons', COUNT(*)::text FROM payload.lessons
UNION ALL SELECT 'tasks', COUNT(*)::text FROM payload.tasks
UNION ALL SELECT 'flashcards', COUNT(*)::text FROM public.flashcards
UNION ALL SELECT 'flashcard_decks', COUNT(*)::text FROM public.flashcard_decks;

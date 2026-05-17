/**
 * Remove all CMS courses (modules, lessons, tasks cascade via Payload hooks)
 * and all Prisma flashcard decks/cards/progress.
 *
 * Does NOT delete: users, media, subjects, tags, creative spaces.
 *
 * Usage (app root):
 *   npx tsx --tsconfig tsconfig.scripts.json ./scripts/wipe-content.ts --confirm
 *
 * Docker (recommended — Payload scripts often fail in the production image):
 *   Get-Content scripts/wipe-content.sql | docker exec -i learningplatform-postgres-1 psql -U postgres -d exam_prep_db -v ON_ERROR_STOP=1
 *   Or: npm run content:wipe:docker
 */
import 'dotenv/config'
import { getPayload } from 'payload'
import config from '../src/payload/payload.config.js'
import { prisma } from '../lib/prisma.js'

const PAGE_SIZE = 100

type CollectionSlug = 'courses' | 'modules' | 'lessons' | 'tasks'

async function deleteAllInCollection(
  payload: Awaited<ReturnType<typeof getPayload>>,
  collection: CollectionSlug,
): Promise<number> {
  let deleted = 0
  for (;;) {
    const res = await payload.find({
      collection,
      limit: PAGE_SIZE,
      page: 1,
      depth: 0,
      overrideAccess: true,
    })
    if (res.docs.length === 0) break
    for (const doc of res.docs) {
      await payload.delete({
        collection,
        id: doc.id,
        overrideAccess: true,
      })
      deleted += 1
      console.log(`[DELETE] ${collection} ${doc.id}`)
    }
  }
  return deleted
}

async function wipeFlashcards(): Promise<{
  progress: number
  flashcards: number
  enrollments: number
  decks: number
}> {
  const progress = (
    await prisma.userFlashcardProgress.deleteMany()
  ).count
  const flashcards = (await prisma.flashcard.deleteMany()).count
  const enrollments = (
    await prisma.userStandaloneFlashcardDeck.deleteMany()
  ).count
  const decks = (await prisma.flashcardDeck.deleteMany()).count
  return { progress, flashcards, enrollments, decks }
}

async function wipeCourseProgress(): Promise<number> {
  return (await prisma.courseProgress.deleteMany()).count
}

async function main() {
  const confirmed =
    process.argv.includes('--confirm') ||
    process.env.WIPE_CONTENT_CONFIRM === '1'

  if (!confirmed) {
    console.error(
      '[ERROR] Destructive wipe aborted. Re-run with --confirm or WIPE_CONTENT_CONFIRM=1',
    )
    process.exit(1)
  }

  if (!process.env.DATABASE_URL && !process.env.PAYLOAD_DATABASE_URL) {
    console.error('[ERROR] Set DATABASE_URL or PAYLOAD_DATABASE_URL')
    process.exit(1)
  }

  console.log('[INFO] Wiping flashcards (Prisma)...')
  const flashSummary = await wipeFlashcards()
  console.log('[INFO] Flashcards removed:', flashSummary)

  console.log('[INFO] Wiping Payload CMS content (courses → modules → lessons → tasks)...')
  const payload = await getPayload({ config })

  const deletedCourses = await deleteAllInCollection(payload, 'courses')
  const deletedModules = await deleteAllInCollection(payload, 'modules')
  const deletedLessons = await deleteAllInCollection(payload, 'lessons')
  const deletedTasks = await deleteAllInCollection(payload, 'tasks')

  console.log('[INFO] Wiping orphaned course progress (Prisma)...')
  const deletedProgress = await wipeCourseProgress()

  console.log('\n[INFO] Wipe complete:', {
    flashcards: flashSummary,
    payload: {
      courses: deletedCourses,
      modules: deletedModules,
      lessons: deletedLessons,
      tasks: deletedTasks,
    },
    courseProgress: deletedProgress,
  })
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})

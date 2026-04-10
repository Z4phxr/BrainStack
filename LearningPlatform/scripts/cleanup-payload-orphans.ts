/**
 * One-off / maintenance: remove Payload rows left behind after courses or modules
 * were deleted without cascade (legacy behavior). Safe to re-run.
 *
 * Order: orphan tasks (broken lesson link) → orphan lessons → orphan modules.
 * Deletions use the Payload Local API with overrideAccess so hooks run (TaskProgress, etc.).
 *
 * Usage (app root):
 *   npx tsx --tsconfig tsconfig.scripts.json ./scripts/cleanup-payload-orphans.ts
 * Docker:
 *   docker compose --env-file .env exec app npx tsx --tsconfig tsconfig.scripts.json ./scripts/cleanup-payload-orphans.ts
 */
import 'dotenv/config'
import pg from 'pg'
import { getPayload } from 'payload'
import config from '../src/payload/payload.config.js'

const { Pool } = pg

async function selectIds(pool: pg.Pool, sql: string): Promise<string[]> {
  const { rows } = await pool.query<{ id: string }>(sql)
  return rows.map((r) => String(r.id))
}

async function main() {
  const url = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  if (!url) {
    console.error('[ERROR] Set DATABASE_URL or PAYLOAD_DATABASE_URL')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('sslmode') ? { rejectUnauthorized: false } : false,
  })

  const payload = await getPayload({ config })

  let deletedTasks = 0
  let deletedLessons = 0
  let deletedModules = 0

  try {
    console.log('[INFO] Finding orphan tasks (tasks_rels.lessons_id → missing lesson)...')
    const orphanTaskIds = await selectIds(
      pool,
      `
      SELECT DISTINCT t.id
      FROM payload.tasks t
      INNER JOIN payload.tasks_rels r ON r.parent_id = t.id AND r.lessons_id IS NOT NULL
      LEFT JOIN payload.lessons l ON l.id = r.lessons_id
      WHERE l.id IS NULL
      `,
    )

    for (const id of orphanTaskIds) {
      await payload.delete({
        collection: 'tasks',
        id,
        overrideAccess: true,
      })
      deletedTasks += 1
      console.log(`[DELETE] task ${id}`)
    }

    console.log('[INFO] Finding orphan lessons (missing module or broken course_id)...')
    const orphanLessonIds = await selectIds(
      pool,
      `
      SELECT l.id
      FROM payload.lessons l
      LEFT JOIN payload.modules m ON m.id = l.module_id
      LEFT JOIN payload.courses c ON c.id = l.course_id
      WHERE m.id IS NULL
         OR (l.course_id IS NOT NULL AND c.id IS NULL)
      `,
    )

    for (const id of orphanLessonIds) {
      await payload.delete({
        collection: 'lessons',
        id,
        overrideAccess: true,
      })
      deletedLessons += 1
      console.log(`[DELETE] lesson ${id}`)
    }

    console.log('[INFO] Finding orphan modules (missing course)...')
    const orphanModuleIds = await selectIds(
      pool,
      `
      SELECT m.id
      FROM payload.modules m
      LEFT JOIN payload.courses c ON c.id = m.course_id
      WHERE c.id IS NULL
      `,
    )

    for (const id of orphanModuleIds) {
      await payload.delete({
        collection: 'modules',
        id,
        overrideAccess: true,
      })
      deletedModules += 1
      console.log(`[DELETE] module ${id}`)
    }

    console.log('\n[INFO] Summary:', { deletedTasks, deletedLessons, deletedModules })
  } finally {
    await pool.end()
  }
}

main().catch((err) => {
  console.error('[ERROR]', err)
  process.exit(1)
})

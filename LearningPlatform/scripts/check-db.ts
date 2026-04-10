/**
 * Quick diagnostic: course count in Payload (payload.courses), not Prisma.
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function main() {
  const url = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  if (!url) {
    console.error('[ERROR] PAYLOAD_DATABASE_URL or DATABASE_URL is required')
    process.exit(1)
  }

  const pool = new Pool({
    connectionString: url,
    ssl: url.includes('sslmode') ? { rejectUnauthorized: false } : false,
  })

  try {
    console.log('[INFO] Checking database…')
    console.log('[INFO] URL:', url ? 'set' : 'not set')

    const countRes = await pool.query<{ c: string }>(
      'SELECT COUNT(*)::text AS c FROM payload.courses',
    )
    const courseCount = Number.parseInt(countRes.rows[0]?.c ?? '0', 10)
    console.log(`[INFO] Courses (payload.courses): ${courseCount}`)

    const sample = await pool.query<{ title: string | null }>(
      'SELECT title FROM payload.courses ORDER BY slug LIMIT 5',
    )
    sample.rows.forEach((row) => {
      console.log(`  - ${row.title ?? '(no title)'}`)
    })

    process.exit(0)
  } catch (e) {
    console.error('[ERROR]', e)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

main()

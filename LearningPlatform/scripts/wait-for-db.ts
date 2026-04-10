/**
 * Wait until PostgreSQL accepts connections (Docker / slow-start DB).
 * Uses DATABASE_URL or PAYLOAD_DATABASE_URL from the environment.
 */
import pg from 'pg'

const url = process.env.DATABASE_URL || process.env.PAYLOAD_DATABASE_URL
if (!url) {
  console.error('[wait-for-db] DATABASE_URL or PAYLOAD_DATABASE_URL is required')
  process.exit(1)
}

const maxAttempts = Number(process.env.WAIT_FOR_DB_ATTEMPTS || '45')
const delayMs = Number(process.env.WAIT_FOR_DB_DELAY_MS || '2000')

async function main() {
  const { Client } = pg
  for (let i = 1; i <= maxAttempts; i++) {
    const client = new Client({ connectionString: url })
    try {
      await client.connect()
      await client.query('SELECT 1')
      await client.end()
      console.log(`[wait-for-db] Ready after ${i} attempt(s)`)
      process.exit(0)
    } catch {
      try {
        await client.end()
      } catch {
        /* ignore */
      }
      console.log(`[wait-for-db] Attempt ${i}/${maxAttempts} — database not ready, waiting ${delayMs}ms...`)
      await new Promise((r) => setTimeout(r, delayMs))
    }
  }
  console.error('[wait-for-db] Timed out waiting for PostgreSQL')
  process.exit(1)
}

void main()

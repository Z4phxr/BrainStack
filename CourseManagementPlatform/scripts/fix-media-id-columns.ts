/**
 * Direct SQL Fix: Convert media ID columns from integer to varchar
 * 
 * This script connects directly to the database and fixes the column types
 * without going through Payload's migration system (which triggers interactive prompts)
 */
import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function fixMediaIdColumns() {
  const databaseUrl = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('[ERROR] No database URL set')
    process.exit(1)
  }

  const pool = new Pool({ connectionString: databaseUrl })

  try {
    console.log('[INFO] Fixing media ID column types...')
    console.log('')

    // Check current column types
    console.log('[INFO] Current column types:')
    const checkQuery = `
      SELECT column_name, data_type, character_maximum_length
      FROM information_schema.columns
      WHERE table_schema = 'payload'
        AND table_name = 'tasks'
        AND column_name IN ('question_media_id', 'solution_media_id')
      ORDER BY column_name
    `
    const currentTypes = await pool.query(checkQuery)
    currentTypes.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`)
    })

    // Convert question_media_id from integer to varchar
    console.log('')
    console.log('[INFO] Converting question_media_id to VARCHAR...')
    await pool.query(`
      ALTER TABLE "payload"."tasks" 
      ALTER COLUMN "question_media_id" TYPE varchar USING "question_media_id"::varchar;
    `)
    console.log('   [SUCCESS] question_media_id converted')

    // Convert solution_media_id from integer to varchar
    console.log('[INFO] Converting solution_media_id to VARCHAR...')
    await pool.query(`
      ALTER TABLE "payload"."tasks" 
      ALTER COLUMN "solution_media_id" TYPE varchar USING "solution_media_id"::varchar;
    `)
    console.log('   [SUCCESS] solution_media_id converted')

    // Verify the changes
    console.log('')
    console.log('[SUCCESS] Verifying column types after conversion:')
    const verifyTypes = await pool.query(checkQuery)
    verifyTypes.rows.forEach(row => {
      console.log(`   ${row.column_name}: ${row.data_type}${row.character_maximum_length ? `(${row.character_maximum_length})` : ''}`)
    })

    console.log('')
    console.log('[SUCCESS] Media ID columns successfully converted to VARCHAR')
    console.log('[SUCCESS] The application should now work correctly')

  } catch (error) {
    console.error('')
    console.error('[ERROR] Failed to fix media ID columns:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

fixMediaIdColumns()

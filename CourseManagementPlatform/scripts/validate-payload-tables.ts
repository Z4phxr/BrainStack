/**
 * Validate Payload CMS tables exist after migration
 * 
 * This script checks that all expected Payload collection tables
 * were created in the 'payload' schema.
 * 
 * Usage:
 *   npx tsx scripts/validate-payload-tables.ts
 * 
 * Exit codes:
 *   0 - All tables exist
 *   1 - Some tables missing or database error
 */

import 'dotenv/config'
import pg from 'pg'

const { Pool } = pg

async function validateTables() {
  console.log('[INFO] Validating Payload CMS tables...')
  console.log('')
  
  const databaseUrl = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
  
  if (!databaseUrl) {
    console.error('[ERROR] No database URL set')
    process.exit(1)
  }
  
  const pool = new Pool({ connectionString: databaseUrl })
  
  try {
    // Get all tables in payload schema
    const result = await pool.query(`
      SELECT table_name
      FROM information_schema.tables
      WHERE table_schema = 'payload'
      ORDER BY table_name
    `)
    
    const allTables = result.rows.map(r => r.table_name)
    
    console.log(`[INFO] Tables in "payload" schema (${allTables.length} total):`)
    if (allTables.length > 0) {
      allTables.forEach(t => console.log(`   - ${t}`))
    } else {
      console.log('   (no tables found)')
    }
    console.log('')
    
    // Check for expected collection tables
    const expectedTables = [
      'courses',
      'modules', 
      'lessons',
      'tasks',
      'media',
      'payload_users'
    ]
    
    const foundTables = new Set(allTables)
    const missingTables: string[] = []
    
    console.log('[INFO] Expected collection tables:')
    expectedTables.forEach(table => {
      const exists = foundTables.has(table)
      console.log(`   ${table.padEnd(20)} ${exists ? '[SUCCESS] EXISTS' : '[ERROR] MISSING'}`)
      if (!exists) missingTables.push(table)
    })
    
    console.log('')
    
    if (missingTables.length === 0) {
      console.log('[SUCCESS] All expected tables exist')
      process.exit(0)
    } else {
      console.error('[ERROR] Missing tables:', missingTables.join(', '))
      console.error('')
      console.error('[INFO] TO FIX:')
      console.error('   1. Generate migration: npm run payload:migrate:create')
      console.error('   2. Commit migration file to repo')
      console.error('   3. Run migration: npm run payload:migrate')
      console.error('')
      process.exit(1)
    }
  } catch (error) {
    console.error('[ERROR] Validation failed:', error)
    process.exit(1)
  } finally {
    await pool.end()
  }
}

validateTables()

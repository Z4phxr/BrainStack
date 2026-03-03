/**
 * Payload utility functions for safe operations
 */

import { prisma } from '@/lib/prisma'

// Module-level cache: once a table is confirmed to exist it won't disappear
// during the lifetime of the process, so we skip the DB round-trip on repeat calls.
const _tableExistsCache = new Set<string>()
// Track tables confirmed NOT to exist so we don't hammer the DB either.
// These are cleared after 30 s so a migration in the background is picked up.
const _tableMissingCache = new Map<string, number>()
const TABLE_MISSING_TTL_MS = 30_000

/**
 * Check if a Payload table exists in the database.
 * Positive results are cached permanently (per process); negative results for 30 s.
 *
 * @param tableName - The name of the table to check (e.g., 'courses', 'lessons')
 * @returns true if table exists, false otherwise
 */
export async function payloadTableExists(tableName: string): Promise<boolean> {
  // Fast path: already confirmed existing
  if (_tableExistsCache.has(tableName)) return true

  // Fast path: recently confirmed missing
  const missingAt = _tableMissingCache.get(tableName)
  if (missingAt !== undefined && Date.now() - missingAt < TABLE_MISSING_TTL_MS) return false

  try {
    const result = await prisma.$queryRaw<Array<{ table_name: string }>>`
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'payload' 
      AND table_name = ${tableName}
    `

    if (result.length > 0) {
      _tableExistsCache.add(tableName)
      return true
    } else {
      _tableMissingCache.set(tableName, Date.now())
      return false
    }
  } catch (error) {
    console.error(`Error checking table existence for ${tableName}:`, error)
    return false
  }
}

// Cached result for payloadSchemaInitialized to avoid repeated COUNT queries.
let _schemaInitializedCache: boolean | null = null
let _schemaInitializedAt = 0
const SCHEMA_CACHE_TTL_MS = 30_000

/**
 * Check if Payload schema is initialized (any tables exist).
 * Result is cached for 30 s.
 *
 * @returns true if Payload schema has at least one table
 */
export async function payloadSchemaInitialized(): Promise<boolean> {
  if (_schemaInitializedCache !== null && Date.now() - _schemaInitializedAt < SCHEMA_CACHE_TTL_MS) {
    return _schemaInitializedCache
  }

  try {
    const result = await prisma.$queryRaw<Array<{ count: number }>>`
      SELECT COUNT(*) as count
      FROM information_schema.tables 
      WHERE table_schema = 'payload'
    `

    _schemaInitializedCache = Number(result[0]?.count) > 0
    _schemaInitializedAt = Date.now()
    return _schemaInitializedCache
  } catch (error) {
    console.error('Error checking Payload schema:', error)
    return false
  }
}

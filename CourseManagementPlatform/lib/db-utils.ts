/**
 * Database URL utilities shared across Prisma and Payload configurations.
 */

/**
 * Sanitize a Postgres connection URL that may be malformed.
 *
 * Handles two Railway-specific quirks:
 *  1. Missing '?' before query params — Railway sometimes provides
 *     "...host/db&schema=public&sslmode=require" instead of "...?schema=...".
 *     Prisma/pg will connect to the wrong schema without this fix.
 *  2. pg v8+ treats `sslmode=require` as `verify-full` (requires CA cert).
 *     Railway internal Postgres uses a self-signed cert, so we append
 *     `uselibpqcompat=true` to restore the old sslmode=require behaviour.
 */
export function sanitizeDatabaseUrl(url: string): string {
  // Fix missing '?' before query params
  let fixed = !url.includes('?') && url.includes('&') ? url.replace('&', '?') : url

  // Append uselibpqcompat so sslmode=require does not enforce CA verification
  if (fixed.includes('sslmode') && !fixed.includes('uselibpqcompat')) {
    fixed += '&uselibpqcompat=true'
  }

  return fixed
}

/**
 * SINGLE SOURCE OF TRUTH FOR ALL PAYLOAD PATHS (v3 - force rebuild)
 * 
 * This module solves the Render CWD anomaly problem by finding the project root
 * independently of process.cwd(), __dirname, or import.meta.url.
 * 
 * PROBLEM:
 * - Render sets process.cwd() to /opt/render/project/src (inside /src/)
 * - This caused __dirname to be /opt/render/project/src/src/payload (double /src/)
 * 
 * SOLUTION:
 * - Find project root by locating package.json
 * - Calculate all paths relative to that root
 * - Works identically locally and on Render
 */

import fs from 'fs'
import path from 'path'
import { logger } from '@/lib/logger'

/**
 * Find project root by walking up directory tree until we find package.json
 * 
 * @param startDir - Directory to start searching from (defaults to CWD)
 * @returns Absolute path to project root
 * @throws Error if package.json not found (should never happen in valid project)
 */
function findProjectRoot(startDir?: string): string {
  // Start from current working directory
  // On Render: CWD = /opt/render/project/src, we'll walk up to find package.json
  let currentDir = startDir || process.cwd()
  
  logger.debug('[paths.ts] Finding project root...', `Starting from: ${currentDir}`)
  
  // Walk up maximum 10 levels (safety limit)
  for (let i = 0; i < 10; i++) {
    const packageJsonPath = path.join(currentDir, 'package.json')
    logger.debug(`[paths.ts] Level ${i}`, `Checking: ${packageJsonPath}`)
    
    const exists = fs.existsSync(packageJsonPath)
    logger.debug(`[paths.ts] Level ${i}`, `Exists: ${exists}`)
    
    if (exists) {
      logger.debug('[paths.ts] Found package.json', currentDir)
      return currentDir
    }
    
    const parentDir = path.dirname(currentDir)
    logger.debug(`[paths.ts] Level ${i}`, `Moving up to: ${parentDir}`)
    
    // Reached filesystem root
    if (parentDir === currentDir) {
      logger.warning('[paths.ts] Reached filesystem root')
      break
    }
    
    currentDir = parentDir
  }
  
  logger.error('[paths.ts] package.json NOT FOUND!')
  throw new Error(
    'Could not find project root (package.json not found). ' +
    `Started from: ${startDir || process.cwd()}`
  )
}

/**
 * Check if running on Render (detected by Render-specific env vars)
 * MUST be defined BEFORE PROJECT_ROOT uses it
 */
export const IS_RENDER = Boolean(
  process.env.RENDER ||
  process.env.RENDER_SERVICE_NAME ||
  process.env.RENDER_EXTERNAL_URL
)
/**
 * Project root directory (contains package.json)
 * Determine by searching upwards for `package.json` so paths are
 * consistent between local and Render environments.
 */
export const PROJECT_ROOT = (() => {
  try {
    const root = findProjectRoot()
    logger.debug('[paths.ts] Project root found', root)
    return root
  } catch {
    logger.warning('[paths.ts] findProjectRoot failed, falling back to CWD', process.cwd())
    return process.cwd()
  }
})()

/**
 * Payload source directory
 * On Render standalone: payload is directly in CWD
 * Locally: payload is in src/payload
 */
// Resolve payload directory: prefer `payload/` at project root, else `src/payload`.
export const PAYLOAD_DIR = (() => {
  const candidates = [
    path.join(PROJECT_ROOT, 'payload'),
    path.join(PROJECT_ROOT, 'src', 'payload'),
    path.join(process.cwd(), 'payload'),
    path.join(process.cwd(), 'src', 'payload'),
    path.join(PROJECT_ROOT, '..', 'payload'),
    path.join(PROJECT_ROOT, '..', 'src', 'payload'),
  ]

  for (const c of candidates) {
    try {
      if (fs.existsSync(c)) {
        logger.debug('[paths.ts] Using payload dir candidate', c)
        return c
      }
    } catch {
      // ignore
    }
  }

  const fallback = path.join(PROJECT_ROOT, 'src', 'payload')
  logger.warning('[paths.ts] Could not find payload dir; falling back to', fallback)
  return fallback
})()

/**
 * Payload migrations directory
 */
export const MIGRATION_DIR = path.join(PAYLOAD_DIR, 'migrations')

/**
 * Payload TypeScript types output file
 * Example: /opt/render/project/src/payload/payload-types.ts
 */
export const OUTPUT_FILE = path.join(PAYLOAD_DIR, 'payload-types.ts')

// IS_RENDER already defined above, no need to redefine
// export const IS_RENDER = ...

/**
 * Runtime environment identifier
 */
export const RUNTIME_ENV = process.env.NODE_ENV || 'development'

// Log paths on module load (server-side only)
if (typeof window === 'undefined') {
  logger.debug('[paths.ts] Payload Paths initialized', {
    PROJECT_ROOT,
    PAYLOAD_DIR,
    MIGRATION_DIR,
    IS_RENDER,
    RUNTIME_ENV,
    'process.cwd()': process.cwd(),
  })
}

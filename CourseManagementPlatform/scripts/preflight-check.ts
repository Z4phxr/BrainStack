#!/usr/bin/env tsx
/**
 * Preflight Check Script
 * 
 * DEPLOYMENT GATE - Must pass before deploying to staging/production
 * 
 * Checks:
 * 1. No direct SQL queries to payload.* tables (architectural violation)
 * 2. No Prisma queries to payload.* tables (must use Payload API)
 * 3. Server/Client Component boundaries (no onClick/useState in Server Components)
 * 4. Required environment variables structure
 * 5. TypeScript compilation (implicitly via build)
 * 
 * Usage:
 *   npm run preflight              # Run all checks
 *   npm run preflight:check-sql    # Run only SQL check
 * 
 * Exit codes:
 *   0 = All checks passed
 *   1 = Checks failed (deployment should be blocked)
 */

import { readdirSync, readFileSync, statSync } from 'fs'
import { join, extname } from 'path'

interface PreflightResult {
  name: string
  passed: boolean
  errors: string[]
  warnings: string[]
}

const COLORS = {
  reset: '\x1b[0m',
  red: '\x1b[31m',
  green: '\x1b[32m',
  yellow: '\x1b[33m',
  blue: '\x1b[34m',
  cyan: '\x1b[36m',
}

function log(color: keyof typeof COLORS, message: string) {
  console.log(`${COLORS[color]}${message}${COLORS.reset}`)
}

/**
 * Check 1: No direct SQL queries to payload.* tables
 * 
 * Forbidden patterns:
 * - SELECT ... FROM payload.*
 * - INSERT INTO payload.*
 * - UPDATE payload.*
 * - DELETE FROM payload.*
 * - pool.query('...payload.*')
 * - prisma.$queryRaw`...payload.*`
 * 
 * Allowed exceptions:
 * - scripts/check-payload-tables.ts (checks metadata via information_schema)
 * - scripts/drop-payload-schema.ts (development only)
 * - docs/* (documentation)
 */
function checkNoDirectSQLToPayload(): PreflightResult {
  const result: PreflightResult = {
    name: 'No Direct SQL to Payload Tables',
    passed: true,
    errors: [],
    warnings: [],
  }

  const forbiddenPatterns = [
    /pool\.query\s*\(\s*['"`].*payload\.\w+/gi,
    /prisma\.\$queryRaw.*payload\.\w+/gi,
    /\$queryRawUnsafe.*payload\.\w+/gi,
    /SELECT\s+.*\s+FROM\s+["'`]?payload["'`]?\./gi,
    /INSERT\s+INTO\s+["'`]?payload["'`]?\./gi,
    /UPDATE\s+["'`]?payload["'`]?\./gi,
    /DELETE\s+FROM\s+["'`]?payload["'`]?\./gi,
  ]

  const allowedFiles = [
    'scripts/check-payload-tables.ts',     // Checks information_schema
    'scripts/drop-payload-schema.ts',      // Dev-only utility
    'docs/PAYLOAD-API-USAGE.md',           // Documentation
    'scripts/preflight-check.ts',          // This file (contains patterns)
    'src/payload/migrations/',             // Migration files need DDL operations
    'src/payload/seed.ts',                 // Seed needs to check table existence
  ]

  const sourceFiles = findSourceFiles('.')
  
  for (const file of sourceFiles) {
    // Skip allowed files
    if (allowedFiles.some(allowed => file.includes(allowed.replace(/\//g, '\\')))) {
      continue
    }

    const content = readFileSync(file, 'utf-8')
    
    for (const pattern of forbiddenPatterns) {
      const matches = content.match(pattern)
      if (matches) {
        result.passed = false
        result.errors.push(
          `${file}: Found direct SQL to payload.* tables\n` +
          `  Pattern: ${pattern}\n` +
          `  [ERROR] Use Payload API instead: await payload.find({ collection: '...' })`
        )
      }
    }
  }

  return result
}

/**
 * Check 2: Server/Client Component boundaries
 * 
 * Checks for common mistakes:
 * - onClick handlers in files without 'use client'
 * - useState/useEffect in files without 'use client'
 * - window.location in files without 'use client'
 * 
 * Exception: Components that are already marked 'use client'
 */
function checkServerClientBoundaries(): PreflightResult {
  const result: PreflightResult = {
    name: 'Server/Client Component Boundaries',
    passed: true,
    errors: [],
    warnings: [],
  }

  const clientPatterns = [
    { pattern: /onClick\s*=\s*{/, name: 'onClick handler' },
    { pattern: /useState\s*\(/, name: 'useState hook' },
    { pattern: /useEffect\s*\(/, name: 'useEffect hook' },
    { pattern: /window\.location/, name: 'window.location' },
  ]

  const componentFiles = findSourceFiles('.').filter(file => 
    file.match(/\/(app|components)\/.*\.(tsx|jsx)$/) &&
    !file.includes('node_modules')
  )

  for (const file of componentFiles) {
    const content = readFileSync(file, 'utf-8')
    const hasUseClient = /['"]use client['"]/.test(content)

    if (!hasUseClient) {
      for (const { pattern, name } of clientPatterns) {
        if (pattern.test(content)) {
          // Check if it's in a separate client component wrapper
          const isInWrapper = content.includes('ReloadButton') || content.includes('ClientWrapper')
          
          if (!isInWrapper) {
            result.warnings.push(
              `${file}: Contains ${name} but missing 'use client' directive\n` +
              `  [WARNING] This may cause "Event handlers cannot be passed to Client Component props" error\n` +
              `  [INFO] Add 'use client' at top of file or extract to Client Component`
            )
          }
        }
      }
    }
  }

  return result
}

/**
 * Check 3: Required environment variables documented
 * 
 * Ensures .env.example exists and contains all required variables
 */
function checkEnvDocumentation(): PreflightResult {
  const result: PreflightResult = {
    name: 'Environment Variables Documentation',
    passed: true,
    errors: [],
    warnings: [],
  }

  const requiredEnvVars = [
    'DATABASE_URL',
    'PAYLOAD_SECRET',
    'AUTH_SECRET',
    'NEXTAUTH_URL',
  ]

  try {
    const envExample = readFileSync('.env.example', 'utf-8')
    
    for (const envVar of requiredEnvVars) {
      if (!envExample.includes(envVar)) {
        result.warnings.push(
          `.env.example missing ${envVar}\n` +
          `  [INFO] Add example for documentation`
        )
      }
    }
  } catch {
    result.warnings.push(
      `.env.example not found\n` +
      `  [INFO] Create .env.example with all required environment variables`
    )
  }

  return result
}

/**
 * Helper: Recursively find all source files
 */
function findSourceFiles(dir: string, baseDir: string = dir): string[] {
  const excludeDirs = ['node_modules', '.next', '.git', 'dist', 'build', 'coverage']
  const includeExts = ['.ts', '.tsx', '.js', '.jsx']
  
  const files: string[] = []
  
  try {
    const entries = readdirSync(dir)
    
    for (const entry of entries) {
      const fullPath = join(dir, entry)
      const stat = statSync(fullPath)
      
      if (stat.isDirectory()) {
        if (!excludeDirs.includes(entry)) {
          files.push(...findSourceFiles(fullPath, baseDir))
        }
      } else {
        if (includeExts.includes(extname(entry))) {
          files.push(fullPath)
        }
      }
    }
  } catch {
    // Ignore permission errors
  }
  
  return files
}

/**
 * Main preflight execution
 */
async function runPreflight() {
  log('cyan', '\n' + '='.repeat(60))
  log('cyan', '  [INFO] PREFLIGHT CHECK - Deployment Gate')
  log('cyan', '='.repeat(60) + '\n')

  const checks: PreflightResult[] = [
    checkNoDirectSQLToPayload(),
    checkServerClientBoundaries(),
    checkEnvDocumentation(),
  ]

  let allPassed = true
  let totalErrors = 0
  let totalWarnings = 0

  for (const check of checks) {
    const icon = check.passed && check.errors.length === 0 ? '[SUCCESS]' : '[ERROR]'
    const color = check.passed && check.errors.length === 0 ? 'green' : 'red'
    
    log(color, `\n${icon} ${check.name}`)
    
    if (check.errors.length > 0) {
      allPassed = false
      totalErrors += check.errors.length
      log('red', '\n  ERRORS:')
      check.errors.forEach(err => {
        console.log('  ' + err.split('\n').join('\n  '))
      })
    }
    
    if (check.warnings.length > 0) {
      totalWarnings += check.warnings.length
      log('yellow', '\n  WARNINGS:')
      check.warnings.forEach(warn => {
        console.log('  ' + warn.split('\n').join('\n  '))
      })
    }
    
    if (check.errors.length === 0 && check.warnings.length === 0) {
      log('green', '  All checks passed!')
    }
  }

  log('cyan', '\n' + '='.repeat(60))
  
  if (allPassed) {
    log('green', `\n[SUCCESS] PREFLIGHT PASSED - Ready to deploy!`)
    log('cyan', `\n   Errors: ${totalErrors}`)
    log('yellow', `   Warnings: ${totalWarnings}`)
    log('cyan', '\n' + '='.repeat(60) + '\n')
    process.exit(0)
  } else {
    log('red', `\n[ERROR] PREFLIGHT FAILED - Deployment blocked!`)
    log('cyan', `\n   Errors: ${totalErrors}`)
    log('yellow', `   Warnings: ${totalWarnings}`)
    log('red', '\n   Fix errors before deploying to staging/production')
    log('cyan', '\n' + '='.repeat(60) + '\n')
    process.exit(1)
  }
}

// Run immediately
runPreflight()

export { runPreflight, checkNoDirectSQLToPayload, checkServerClientBoundaries }

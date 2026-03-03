import { NextResponse, NextRequest } from 'next/server'
import { prisma } from '@/lib/prisma'
import { payloadTableExists } from '@/lib/payload-utils'
import { requireAdmin } from '@/lib/auth-helpers'

interface HealthCheckResult {
  status: 'ok' | 'error'
  timestamp: string
  environment: string
  version: string
  checks: {
    database: 'connected' | 'disconnected' | 'error'
    payload: 'ok' | 'error' | 'not-ready'
    courses: 'accessible' | 'not-accessible' | 'error'
    requiredEnv: 'complete' | 'missing'
  }
  dbIdentity?: {
    database: string
    user: string
    serverAddr: string | null
    serverPort: number | null
  }
  tableCheck?: {
    courses: string | null
    users: string | null
    modules: string | null
  }
  missingEnv?: string[]
  errors?: string[]
  verbose?: {
    dbPing?: string
    payloadInit?: string
    coursesCheck?: string
  }
}

/**
 * Health Check Endpoint
 * 
 * Deployment Gate - checks if the app is ready:
 * - Database connection (SELECT 1 ping)
 * - Payload CMS initialized
 * - Access to the courses collection (via Payload API)
 * - Required environment variables
 * 
 * Query params:
 * - ?verbose=1 - Returns additional technical details
 * 
 * Status codes:
 * - 200: All checks passed, app ready
 * - 500: Missing required environment variables
 * - 503: Service unavailable (DB/Payload error)
 */
export async function GET(request: NextRequest) {
  const searchParams = request.nextUrl.searchParams
  const verbose = searchParams.get('verbose') === '1'

  // Verbose mode exposes internal DB details — restrict to authenticated admins
  if (verbose) {
    try {
      await requireAdmin()
    } catch {
      return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
    }
  }

  const result: HealthCheckResult = {
    status: 'ok',
    timestamp: new Date().toISOString(),
    // environment and version are only exposed to authenticated admins (or verbose mode)
    environment: verbose ? (process.env.NODE_ENV || 'development') : undefined as unknown as string,
    version: verbose ? (process.env.npm_package_version || '1.0.0') : undefined as unknown as string,
    checks: {
      database: 'disconnected',
      payload: 'not-ready',
      courses: 'not-accessible',
      requiredEnv: 'missing',
    },
    errors: [],
  }

  if (verbose) {
    result.verbose = {}
  }

  // 1. Check required environment variables
  // NEXTAUTH_URL is intentionally excluded — Railway auto-assigns a public domain
  // and the app functions without it being explicitly set at startup.
  const requiredEnv = [
    'DATABASE_URL',
    'PAYLOAD_SECRET',
    'AUTH_SECRET',
  ]
  const missingEnv = requiredEnv.filter(key => !process.env[key])
  
  if (missingEnv.length > 0) {
    result.status = 'error'
    result.checks.requiredEnv = 'missing'
    result.missingEnv = missingEnv
    result.errors?.push(`Missing required environment variables: ${missingEnv.join(', ')}`)
    
    console.error('[ERROR] Health check failed: Missing environment variables', missingEnv)
    
    return NextResponse.json(result, { status: 500 })
  }
  result.checks.requiredEnv = 'complete'

  // 2. Database ping check (independent of Payload)
  // Simple SELECT 1 to verify database connectivity
  try {
    await prisma.$queryRaw`SELECT 1`
    result.checks.database = 'connected'

    // Only expose DB identity and table details in verbose (admin-authenticated) mode
    if (verbose) {
      const identity = await prisma.$queryRaw<Array<{
        current_database: string
        current_user: string
        server_addr: string | null
        server_port: number | null
      }>>`
        SELECT
          current_database() as current_database,
          current_user as current_user,
          inet_server_addr()::text as server_addr,
          inet_server_port() as server_port
      `
      result.dbIdentity = {
        database: identity[0].current_database,
        user: identity[0].current_user,
        serverAddr: identity[0].server_addr,
        serverPort: identity[0].server_port,
      }

      const tables = await prisma.$queryRaw<Array<{
        courses: string | null
        users: string | null
        modules: string | null
      }>>`
        SELECT
          to_regclass('payload.courses')::text as courses,
          to_regclass('payload.payload_users')::text as users,
          to_regclass('payload.modules')::text as modules
      `
      result.tableCheck = tables[0]
      result.verbose!.dbPing = 'Database ping successful (SELECT 1)'
    }

    console.log('[SUCCESS] Database ping: OK')
  } catch (error) {
    result.status = 'error'
    result.checks.database = 'error'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors?.push(`Database connection failed: ${errorMessage}`)
    
    console.error('[ERROR] Database ping failed:', errorMessage)
    
    return NextResponse.json(result, { status: 503 })
  }

  // 3. Payload CMS check (via Payload API)
  try {
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    const payload = await getPayload({ config })
    result.checks.payload = 'ok'
    
    if (verbose) {
      result.verbose!.payloadInit = 'Payload CMS initialized successfully'
    }
    
    console.log('[SUCCESS] Payload CMS: OK')

    // 4. Check if Payload tables exist (via information_schema - metadata only)
    // This prevents SQL errors when tables don't exist yet
    try {
      const tableExists = await payloadTableExists('courses')
      
      if (!tableExists) {
        // Tables don't exist yet - not an error, just needs migration
        result.checks.courses = 'not-accessible'
        result.errors?.push('Payload tables not found - run migrations: npm run payload:migrate')
        
        if (verbose) {
          result.verbose!.coursesCheck = 'Payload schema exists but courses table not found (needs migration)'
        }
        
        console.log('[WARNING] Payload tables not found (needs migration)')
      } else {
        // Tables exist - now safe to use Payload API
        try {
          const coursesResult = await payload.find({
            collection: 'courses',
            limit: 1,
            depth: 0,
          })
          result.checks.courses = 'accessible'
          
          if (verbose) {
            result.verbose!.coursesCheck = `Courses collection accessible (${coursesResult.totalDocs} total docs)`
          }
          
          console.log('[SUCCESS] Courses collection accessible:', coursesResult.totalDocs, 'docs')
        } catch (error) {
          result.checks.courses = 'error'
          const errorMessage = error instanceof Error ? error.message : 'Unknown error'
          result.errors?.push(`Courses collection error: ${errorMessage}`)
          
          console.error('[ERROR] Courses collection check failed:', errorMessage)
        }
      }
    } catch (error) {
      // information_schema check failed - likely no payload schema at all
      result.checks.courses = 'not-accessible'
      const errorMessage = error instanceof Error ? error.message : 'Unknown error'
      result.errors?.push(`Payload schema check failed: ${errorMessage}. Run migrations: npm run payload:migrate`)
      
      if (verbose) {
        result.verbose!.coursesCheck = 'Payload schema not found (needs migration)'
      }
      
      console.error('[ERROR] Payload schema check failed:', errorMessage)
    }

    // Return OK if database and Payload work, even if courses not accessible yet
    // This allows health check to pass during initial setup
    if (result.checks.database === 'connected' && result.checks.payload === 'ok') {
      result.status = 'ok'
      
      console.log('[SUCCESS] Health check passed:', {
        database: result.checks.database,
        payload: result.checks.payload,
        courses: result.checks.courses,
      })
      
      return NextResponse.json(result, { status: 200 })
    } else {
      result.status = 'error'
      return NextResponse.json(result, { status: 503 })
    }

  } catch (error) {
    result.status = 'error'
    result.checks.payload = 'error'
    const errorMessage = error instanceof Error ? error.message : 'Unknown error'
    result.errors?.push(`Payload initialization failed: ${errorMessage}`)

    console.error('[ERROR] Payload check failed:', {
      error: errorMessage,
      checks: result.checks,
    })

    return NextResponse.json(result, { status: 503 })
  }
}

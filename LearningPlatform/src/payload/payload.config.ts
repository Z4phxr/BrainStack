import { postgresAdapter } from '@payloadcms/db-postgres'
import { lexicalEditor } from '@payloadcms/richtext-lexical'
import { buildConfig } from 'payload'
import sharp from 'sharp'

import { Courses } from './collections/Courses'
import { Lessons } from './collections/Lessons'
import { Media } from './collections/Media'
import { Modules } from './collections/Modules'
import { Tasks } from './collections/Tasks'
import { Subjects } from './collections/Subjects'

// Import stable path resolution (works identically locally and on Render)
import { MIGRATION_DIR, OUTPUT_FILE } from './paths'
import { logger } from '@/lib/logger'
import { sanitizeDatabaseUrl } from '@/lib/db-utils'

// Validate database connection string
const rawDatabaseUrl = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
if (!rawDatabaseUrl) {
  throw new Error(
    'Database connection string not found. Set either PAYLOAD_DATABASE_URL or DATABASE_URL environment variable.'
  )
}
const databaseUrl = sanitizeDatabaseUrl(rawDatabaseUrl)

// Validate PAYLOAD_SECRET
const payloadSecret = process.env.PAYLOAD_SECRET
if (!payloadSecret) {
  throw new Error(
    'PAYLOAD_SECRET environment variable is required. Generate one with: openssl rand -base64 32'
  )
}
if (payloadSecret === 'YOUR-SECRET-HERE' || payloadSecret.length < 16) {
  throw new Error(
    'PAYLOAD_SECRET is too weak. Generate a strong secret with: openssl rand -base64 32'
  )
}

// Log which DB URL is being used (only on server)
if (typeof window === 'undefined') {
  logger.debug('Payload config initialized', {
    'PAYLOAD_DATABASE_URL': process.env.PAYLOAD_DATABASE_URL ? 'SET' : 'NOT SET',
    'DATABASE_URL': process.env.DATABASE_URL ? 'SET' : 'NOT SET',
    'PAYLOAD_SECRET': payloadSecret ? 'SET' : 'NOT SET',
    'Using': databaseUrl.split('@')[1]?.split('/')[0] || 'REDACTED',
    'Migration Dir': MIGRATION_DIR,
    'Output File': OUTPUT_FILE,
    'Schema Name': 'payload',
  })
}

export default buildConfig({
  admin: {
    user: 'payload-users',
    disable: true, // Disable default Payload admin UI - using custom admin panel
    meta: {
      titleSuffix: '- Learning CMS',
    },
  },
  collections: [
    // User collection for Payload admin authentication
    {
      slug: 'payload-users',
      auth: true,
      access: {
        read: () => true,
        // Allow creation if: 1) authenticated admin OR 2) no user context (seed scripts)
        create: ({ req }) => {
          if (req.user?.role === 'ADMIN') return true
          if (!req.user) return true // Allow programmatic creation (seeds)
          return false
        },
        update: ({ req: { user } }) => user?.role === 'ADMIN',
        delete: ({ req: { user } }) => user?.role === 'ADMIN',
      },
      fields: [
        {
          name: 'role',
          type: 'select',
          required: true,
          defaultValue: 'ADMIN',
          options: [
            {
              label: 'Admin',
              value: 'ADMIN',
            },
            {
              label: 'Student',
              value: 'STUDENT',
            },
          ],
        },
      ],
    },
    Courses,
    Subjects,
    Modules,
    Lessons,
    Tasks,
    Media,
  ],
  editor: lexicalEditor({}),
  secret: payloadSecret,
  typescript: {
    outputFile: OUTPUT_FILE,
  },
  db: postgresAdapter({
    pool: {
      connectionString: databaseUrl,
      // Railway internal Postgres uses a self-signed certificate; disable CA verification.
      ssl: databaseUrl.includes('sslmode') ? { rejectUnauthorized: false } : false,
    },
    // Use UUIDs (string) for all primary IDs instead of serial integers
    idType: 'uuid',
    schemaName: 'payload',
    migrationDir: MIGRATION_DIR,
    // Drizzle `pushDevSchema` emits ALTERs without USING; legacy varchar/serial columns
    // then break Payload init in dev. Schema is evolved via `src/payload/migrations/` +
    // `npm run payload:migrate` instead.
    push: false,
  }),
  sharp,
  plugins: [],
})

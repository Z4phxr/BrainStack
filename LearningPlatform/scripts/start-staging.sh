#!/bin/bash
set -e

echo "🚀 Starting BrainStack on Render (Staging)"
echo "========================================="

# 0. Normalize database environment variables
echo "🔧 Normalizing database environment variables..."
export DATABASE_URL="${DATABASE_URL:-$PAYLOAD_DATABASE_URL}"

if [ -z "$DATABASE_URL" ]; then
  echo "❌ ERROR: No database URL set (neither DATABASE_URL nor PAYLOAD_DATABASE_URL)"
  exit 1
fi

# CRITICAL FIX: Add search_path=payload,public to PAYLOAD_DATABASE_URL
# This ensures Payload sees 'payload' schema by default
# Prisma uses DATABASE_URL without search_path (uses 'public' schema)
if [[ "$DATABASE_URL" =~ "options=" ]]; then
  # Already has options, append search_path
  export PAYLOAD_DATABASE_URL="${DATABASE_URL}&options=-c%20search_path=payload,public"
else
  # No options yet, add search_path
  if [[ "$DATABASE_URL" =~ "?" ]]; then
    export PAYLOAD_DATABASE_URL="${DATABASE_URL}&options=-c%20search_path=payload,public"
  else
    export PAYLOAD_DATABASE_URL="${DATABASE_URL}?options=-c%20search_path=payload,public"
  fi
fi

echo "✅ Database URLs synchronized"
echo "   DATABASE_URL (Prisma): ${DATABASE_URL:0:20}..."
echo "   PAYLOAD_DATABASE_URL (with search_path): ${PAYLOAD_DATABASE_URL:0:20}..."

# 1. Verify database configuration
bash scripts/verify-db-config.sh || exit 1

# 2. Run Prisma migrations FIRST
echo ""
echo "🔧 Step 1/4: Running Prisma migrations..."
if npx prisma migrate deploy; then
  echo "✅ Prisma migrations completed"
else
  echo "❌ Prisma migrations failed"
  exit 1
fi

# 3. Run Payload migrations SECOND
echo ""
echo "🔧 Step 2/4: Running Payload CMS migrations..."
if npm run payload:migrate; then
  echo "✅ Payload migrations completed"
  
  # Validate tables were created
  echo ""
  echo "🔍 Validating Payload tables..."
  if npm run validate:payload-tables; then
    echo "✅ All Payload tables verified"
  else
    echo "⚠️  Payload table validation failed (tables may be missing)"
    echo "   Check migration files in src/payload/migrations/"
    exit 1
  fi
else
  echo "❌ Payload migrations failed"
  exit 1
fi

# 4. Seed database THIRD (only if empty)
echo ""
echo "🌱 Step 3/4: Checking if database needs seeding..."

TSX='npx tsx --tsconfig tsconfig.scripts.json'

if ! $TSX scripts/check-seed.ts; then
  echo "   → Running CMS seed (NextAuth user + Payload admin)..."
  if npm run cms:seed; then
    echo "   ✅ CMS seed completed"
  else
    echo "   ❌ CMS seed failed (check SEED_ADMIN_PASSWORD, PAYLOAD_SECRET, migrations)"
    exit 1
  fi
else
  echo "   ✅ public.User already has rows"
fi

if ! $TSX scripts/check-courses-empty.ts; then
  echo "   → No courses in payload.courses — running CMS seed (bootstrap only)..."
  if npm run cms:seed; then
    echo "   ✅ CMS seed completed"
  else
    echo "   ⚠️  CMS seed failed (tables may not exist yet)"
    echo "   This may be OK — migrations can run on next deploy"
  fi
else
  echo "   ✅ At least one course exists in Payload"
fi

echo ""
echo "✅ Database setup completed"

# 5. Start the application FOURTH
echo ""
echo "🎬 Step 4/4: Starting Next.js server..."
echo "   Hostname: 0.0.0.0 (Render requirement)"
echo "   Port: ${PORT:-10000}"
echo "   NODE_ENV: ${NODE_ENV:-production}"
echo ""

exec npm run start

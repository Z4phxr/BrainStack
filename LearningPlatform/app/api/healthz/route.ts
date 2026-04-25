import { NextResponse } from 'next/server'
import { prisma } from '@/lib/prisma'

/**
 * Lightweight public readiness probe for login precheck.
 * Returns only ok/error without exposing internal diagnostics.
 */
export async function GET() {
  try {
    await prisma.$queryRaw`SELECT 1`
    return NextResponse.json({ ok: true }, { status: 200 })
  } catch {
    return NextResponse.json({ ok: false }, { status: 503 })
  }
}

import { NextResponse } from 'next/server'

/**
 * Minimal liveness probe — no DB, no env checks, no Payload.
 * Used as the Railway healthcheck target so we can confirm the
 * Next.js server is actually binding and accepting requests.
 */
export async function GET() {
  return NextResponse.json({ ok: true, ts: Date.now() })
}

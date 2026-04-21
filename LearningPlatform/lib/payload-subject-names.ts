import { Prisma } from '@prisma/client'
import { getPayload } from 'payload'
import config from '@payload-config'
import { prisma } from '@/lib/prisma'

const OA = { overrideAccess: true as const }

/** Resolve Payload `subjects` names by id (batch). */
export async function subjectNamesByIds(ids: string[]): Promise<Map<string, string>> {
  const uniq = [...new Set(ids.map(String).filter(Boolean))]
  const map = new Map<string, string>()
  if (uniq.length === 0) return map

  try {
    const rows = await prisma.$queryRaw<Array<{ id: string; name: string }>>`
      SELECT s.id::text AS id, s.name::text AS name
      FROM payload.subjects s
      WHERE s.id::text IN (${Prisma.join(uniq)})
    `
    for (const r of rows) {
      map.set(String(r.id), String(r.name ?? ''))
    }
    if (map.size === uniq.length) return map
  } catch {
    // fall through to Payload
  }

  try {
    const payload = await getPayload({ config })
    for (const id of uniq) {
      if (map.has(id)) continue
      try {
        const doc = await payload.findByID({
          collection: 'subjects',
          id,
          depth: 0,
          ...OA,
        })
        map.set(String(doc.id), String(doc.name ?? ''))
      } catch {
        // missing id
      }
    }
  } catch {
    // Payload unavailable
  }
  return map
}

export async function subjectExistsById(id: string): Promise<boolean> {
  const trimmed = id.trim()
  if (!trimmed) return false
  try {
    const rows = await prisma.$queryRaw<Array<{ ok: number }>>`
      SELECT 1 AS ok FROM payload.subjects s WHERE s.id::text = ${trimmed} LIMIT 1
    `
    if (rows.length > 0) return true
  } catch {
    // fall through
  }
  try {
    const payload = await getPayload({ config })
    await payload.findByID({
      collection: 'subjects',
      id: trimmed,
      depth: 0,
      ...OA,
    })
    return true
  } catch {
    return false
  }
}

import path from 'path'
import type { Payload } from 'payload'
import { isResolvablePayloadMediaId } from '@/lib/valid-payload-media-id'

export { isResolvablePayloadMediaId } from '@/lib/valid-payload-media-id'

type MediaDoc = {
  id?: string | number
  url?: string | null
  filename?: string | null
}

function docToPublicUrl(doc: MediaDoc): string | null {
  // Prefer our serve URL built from filename so we never return stale hosts, broken
  // Payload `url` values, or signed URLs that fail under the app CSP for `<img>`.
  if (typeof doc.filename === 'string' && doc.filename.trim().length > 0) {
    const base = path.posix.basename(doc.filename.replace(/\\/g, '/'))
    if (base && base !== '.' && base !== '..') {
      return `/api/media/serve/${encodeURIComponent(base)}`
    }
  }

  if (typeof doc.url === 'string' && doc.url.trim().length > 0) {
    const u = doc.url.trim()
    if (u.startsWith('/api/media/serve/')) return u
    if (u.startsWith('/media/')) {
      const base = path.posix.basename(u.replace(/^\/media\//, ''))
      if (base) return `/api/media/serve/${encodeURIComponent(base)}`
    }
    if (u.startsWith('/')) return u
    try {
      const parsed = new URL(u, 'http://local.invalid')
      if (parsed.pathname.startsWith('/media/')) {
        const base = path.posix.basename(parsed.pathname)
        if (base) return `/api/media/serve/${encodeURIComponent(base)}`
      }
    } catch {
      /* ignore */
    }
    return u
  }

  return null
}

async function getPayloadClient(): Promise<Payload> {
  const { getPayload } = await import('payload')
  const config = (await import('@payload-config')).default
  return getPayload({ config })
}

/** Build id → public URL for Payload `media` docs (student-safe paths like `/api/media/serve/...`). */
export async function resolvePayloadMediaUrlMap(ids: (string | null | undefined)[]): Promise<Map<string, string>> {
  const unique = [
    ...new Set(ids.filter((x): x is string => Boolean(x && String(x).trim()))),
  ].filter(isResolvablePayloadMediaId)

  const map = new Map<string, string>()
  if (unique.length === 0) return map

  const payload = await getPayloadClient()

  try {
    const { docs } = await payload.find({
      collection: 'media',
      where: { id: { in: unique } },
      depth: 0,
      limit: unique.length,
      pagination: false,
    })
    for (const raw of docs) {
      const doc = raw as MediaDoc
      const url = docToPublicUrl(doc)
      if (url && doc.id !== undefined && doc.id !== null) {
        map.set(String(doc.id), url)
      }
    }
  } catch {
    /* batch query failed — fall back to per-id so one bad id does not drop every URL */
    await Promise.all(
      unique.map(async (id) => {
        try {
          const raw = await payload.findByID({ collection: 'media', id, depth: 0 })
          const doc = raw as MediaDoc
          const url = docToPublicUrl(doc)
          if (url && doc.id !== undefined && doc.id !== null) {
            map.set(String(doc.id), url)
          }
        } catch {
          /* missing row or DB error — skip */
        }
      }),
    )
  }

  return map
}

function pickUrl(map: Map<string, string>, id: string | null): string | null {
  if (!id) return null
  if (!isResolvablePayloadMediaId(id)) return null
  return map.get(id) ?? map.get(String(id)) ?? null
}

type CardImageIds = {
  questionImageId: string | null
  answerImageId: string | null
}

/** Attach `questionImageUrl` / `answerImageUrl` for study payloads (no admin-only media list). */
export async function attachResolvedMediaUrls<T extends CardImageIds>(
  cards: T[],
): Promise<Array<T & { questionImageUrl: string | null; answerImageUrl: string | null }>> {
  try {
    const ids = cards.flatMap((c) => [c.questionImageId, c.answerImageId])
    const urlMap = await resolvePayloadMediaUrlMap(ids)
    return cards.map((c) => ({
      ...c,
      questionImageUrl: pickUrl(urlMap, c.questionImageId),
      answerImageUrl: pickUrl(urlMap, c.answerImageId),
    }))
  } catch (err) {
    console.error('[attachResolvedMediaUrls]', err)
    return cards.map((c) => ({
      ...c,
      questionImageUrl: null,
      answerImageUrl: null,
    }))
  }
}

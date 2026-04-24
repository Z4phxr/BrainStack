import type { Payload } from 'payload'
import { isResolvablePayloadMediaId } from '@/lib/valid-payload-media-id'

export { isResolvablePayloadMediaId } from '@/lib/valid-payload-media-id'

type MediaDoc = {
  id?: string | number
  url?: string | null
  filename?: string | null
}

function docToPublicUrl(doc: MediaDoc): string | null {
  if (typeof doc.url === 'string' && doc.url.length > 0) return doc.url
  if (typeof doc.filename === 'string' && doc.filename.length > 0) {
    return `/api/media/serve/${encodeURIComponent(doc.filename)}`
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

  // Per-id lookup only: avoids `WHERE id IN ($1)` with a bad cast if validation ever regresses,
  // and errors stay local to one id.
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

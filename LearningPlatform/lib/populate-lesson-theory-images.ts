import type { Payload } from 'payload'

/**
 * Ensures theory `image` blocks have a populated `{ filename, alt, … }` object.
 * Payload sometimes returns only a media id for nested block uploads unless depth is high enough;
 * the student renderer requires `filename` to build `/api/media/serve/...` URLs.
 */
export async function lessonWithPopulatedTheoryImages<L extends Record<string, unknown>>(
  lesson: L | null,
  payload: Payload,
): Promise<L | null> {
  if (!lesson || !Array.isArray(lesson.theoryBlocks)) return lesson

  const blocks = lesson.theoryBlocks as Array<Record<string, unknown>>
  const ids = new Set<string>()
  for (const b of blocks) {
    if (b?.blockType !== 'image') continue
    const img = b.image
    if (typeof img === 'number') ids.add(String(img))
    else if (typeof img === 'string' && /^\d+$/.test(img)) ids.add(img)
  }
  if (ids.size === 0) return lesson

  const byId: Record<string, { id: string | number; filename: string; alt?: string | null }> = {}
  for (const id of ids) {
    try {
      const doc = await payload.findByID({ collection: 'media', id })
      if (doc && typeof doc === 'object' && 'filename' in doc && typeof (doc as { filename?: unknown }).filename === 'string') {
        byId[id] = doc as (typeof byId)[string]
      }
    } catch {
      // missing media
    }
  }

  return {
    ...lesson,
    theoryBlocks: blocks.map((b) => {
      if (b?.blockType !== 'image') return b
      const img = b.image
      const key =
        typeof img === 'number' ? String(img) : typeof img === 'string' && /^\d+$/.test(img) ? img : ''
      if (key && byId[key]) return { ...b, image: byId[key] }
      return b
    }),
  } as L
}

import { isResolvablePayloadMediaId } from '@/lib/valid-payload-media-id'

/** `null` = clear relation; otherwise keep (including valid strings / polymorphic shapes). */
function stripInvalidMediaRelation(value: unknown): unknown {
  if (value == null) return value
  if (typeof value === 'number') {
    return isResolvablePayloadMediaId(String(value)) ? value : null
  }
  if (typeof value === 'string') {
    const t = value.trim()
    if (!t) return null
    return isResolvablePayloadMediaId(t) ? value : null
  }
  if (typeof value === 'object' && 'value' in (value as object)) {
    const inner = (value as { value: unknown }).value
    if (typeof inner === 'string' && inner.trim() && !isResolvablePayloadMediaId(inner)) {
      return null
    }
  }
  return value
}

function applyStripped(target: Record<string, unknown>, key: string) {
  const cur = target[key]
  const next = stripInvalidMediaRelation(cur)
  if (next === null) target[key] = null
}

/** Tasks: `questionMedia` / `solutionMedia` (+ snake_case if present). */
export function sanitizeTasksMediaRefs(doc: unknown) {
  if (!doc || typeof doc !== 'object') return
  const d = doc as Record<string, unknown>
  for (const key of ['questionMedia', 'solutionMedia', 'question_media_id', 'solution_media_id'] as const) {
    if (key in d) applyStripped(d, key)
  }
}

/** Lessons: attachment `file`, theory `image` blocks. */
export function sanitizeLessonsMediaRefs(doc: unknown) {
  if (!doc || typeof doc !== 'object') return
  const d = doc as Record<string, unknown>
  const atts = d.attachments
  if (Array.isArray(atts)) {
    for (const row of atts) {
      if (!row || typeof row !== 'object') continue
      const a = row as Record<string, unknown>
      if ('file' in a) applyStripped(a, 'file')
    }
  }
  const blocks = d.theoryBlocks
  if (Array.isArray(blocks)) {
    for (const block of blocks) {
      if (!block || typeof block !== 'object') continue
      const b = block as Record<string, unknown>
      if (b.blockType === 'image' && 'image' in b) applyStripped(b, 'image')
    }
  }
}

/** Courses: `coverImage`. */
export function sanitizeCoursesMediaRefs(doc: unknown) {
  if (!doc || typeof doc !== 'object') return
  const d = doc as Record<string, unknown>
  if ('coverImage' in d) applyStripped(d, 'coverImage')
}

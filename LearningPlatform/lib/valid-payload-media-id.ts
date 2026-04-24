const UUID_RE =
  /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i

/**
 * Payload `media.id` in Postgres is uuid. Reject import placeholders (`__IMPORT_PLACEHOLDER_IMAGE__`, etc.)
 * and any non-UUID so relation population / `findByID` never sends bad values to SQL.
 */
export function isResolvablePayloadMediaId(id: string | null | undefined): id is string {
  if (id == null) return false
  let t = String(id).trim()
  try {
    t = t.normalize('NFKC').replace(/[\u200B-\u200D\uFEFF]/g, '')
  } catch {
    /* ignore */
  }
  if (t.length !== 36) return false
  if (!UUID_RE.test(t)) return false
  const lower = t.toLowerCase()
  if (lower.includes('placeholder')) return false
  if (lower.includes('import')) return false
  if (t.includes('__')) return false
  return true
}

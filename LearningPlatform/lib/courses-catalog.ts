/** Published courses catalog: URL params, Payload where, and query serialization. */

export const COURSES_CATALOG_PAGE_SIZE = 15

const LEVEL_VALUES = ['BEGINNER', 'INTERMEDIATE', 'ADVANCED'] as const

export type CatalogLevel = (typeof LEVEL_VALUES)[number]

export type CatalogSort =
  | '-updatedAt'
  | 'updatedAt'
  | '-createdAt'
  | 'createdAt'
  | 'title'
  | '-title'

const SORT_VALUES: CatalogSort[] = [
  '-updatedAt',
  'updatedAt',
  '-createdAt',
  'createdAt',
  'title',
  '-title',
]

export type CatalogFilters = {
  q: string
  level: '' | CatalogLevel
  subject: string
  sort: CatalogSort
  page: number
}

function firstString(v: string | string[] | undefined): string {
  if (typeof v === 'string') return v
  if (Array.isArray(v) && typeof v[0] === 'string') return v[0]
  return ''
}

export function isCatalogLevel(s: string): s is CatalogLevel {
  return (LEVEL_VALUES as readonly string[]).includes(s)
}

export function isCatalogSort(s: string): s is CatalogSort {
  return (SORT_VALUES as readonly string[]).includes(s)
}

export function parseCatalogSearchParams(
  raw: Record<string, string | string[] | undefined>,
): CatalogFilters {
  const q = firstString(raw.q).trim()
  const levelRaw = firstString(raw.level)
  const level = isCatalogLevel(levelRaw) ? levelRaw : ''
  const subject = firstString(raw.subject).trim()
  const sortRaw = firstString(raw.sort)
  const sort: CatalogSort = isCatalogSort(sortRaw) ? sortRaw : '-updatedAt'
  const pageRaw = parseInt(firstString(raw.page), 10)
  const page = Number.isFinite(pageRaw) && pageRaw >= 1 ? pageRaw : 1
  return { q, level, subject, sort, page }
}

/**
 * Payload `where` for published courses + optional filters (student access still applies).
 * Typed loosely so `payload.find({ collection: 'courses', where })` accepts the clause across Payload versions.
 */
export function buildCoursesCatalogWhere(
  filters: Pick<CatalogFilters, 'q' | 'level' | 'subject'>,
  // eslint-disable-next-line @typescript-eslint/no-explicit-any
): any {
  const and: Record<string, unknown>[] = [{ isPublished: { equals: true } }]

  if (filters.level) {
    and.push({ level: { equals: filters.level } })
  }
  if (filters.subject) {
    and.push({ subject: { equals: filters.subject } })
  }
  if (filters.q) {
    and.push({ title: { contains: filters.q } })
  }

  return and.length === 1 ? and[0] : { and }
}

/** Serialize filters for pagination / filter links (omit empty values). */
export function serializeCatalogQuery(filters: CatalogFilters, pageOverride?: number): string {
  const u = new URLSearchParams()
  if (filters.q) u.set('q', filters.q)
  if (filters.level) u.set('level', filters.level)
  if (filters.subject) u.set('subject', filters.subject)
  if (filters.sort !== '-updatedAt') u.set('sort', filters.sort)
  const page = pageOverride ?? filters.page
  if (page > 1) u.set('page', String(page))
  return u.toString()
}

export const CATALOG_SORT_LABELS: { value: CatalogSort; label: string }[] = [
  { value: '-updatedAt', label: 'Last updated (newest)' },
  { value: 'updatedAt', label: 'Last updated (oldest)' },
  { value: '-createdAt', label: 'Created (newest)' },
  { value: 'createdAt', label: 'Created (oldest)' },
  { value: 'title', label: 'Title (A–Z)' },
  { value: '-title', label: 'Title (Z–A)' },
]

export const CATALOG_LEVEL_OPTIONS: { value: string; label: string }[] = [
  { value: '', label: 'All levels' },
  { value: 'BEGINNER', label: 'Beginner' },
  { value: 'INTERMEDIATE', label: 'Intermediate' },
  { value: 'ADVANCED', label: 'Advanced' },
]

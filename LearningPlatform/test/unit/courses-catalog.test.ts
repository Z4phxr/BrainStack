import { describe, it, expect } from 'vitest'
import {
  parseCatalogSearchParams,
  buildCoursesCatalogWhere,
  serializeCatalogQuery,
  isCatalogSort,
} from '@/lib/courses-catalog'

describe('courses-catalog', () => {
  it('parseCatalogSearchParams applies defaults', () => {
    expect(parseCatalogSearchParams({})).toEqual({
      q: '',
      level: '',
      subject: '',
      sort: '-updatedAt',
      page: 1,
    })
  })

  it('parseCatalogSearchParams coerces invalid sort and page', () => {
    expect(
      parseCatalogSearchParams({
        sort: 'invalid',
        page: '0',
        q: '  hello ',
        level: 'BEGINNER',
        subject: 'sub-1',
      }),
    ).toEqual({
      q: 'hello',
      level: 'BEGINNER',
      subject: 'sub-1',
      sort: '-updatedAt',
      page: 1,
    })
  })

  it('isCatalogSort accepts known values', () => {
    expect(isCatalogSort('title')).toBe(true)
    expect(isCatalogSort('nope')).toBe(false)
  })

  it('buildCoursesCatalogWhere builds and clause', () => {
    const w = buildCoursesCatalogWhere({
      q: 'math',
      level: 'BEGINNER',
      subject: 's1',
    })
    expect(w).toEqual({
      and: [
        { isPublished: { equals: true } },
        { level: { equals: 'BEGINNER' } },
        { subject: { equals: 's1' } },
        { title: { contains: 'math' } },
      ],
    })
  })

  it('buildCoursesCatalogWhere only published when no filters', () => {
    expect(buildCoursesCatalogWhere({ q: '', level: '', subject: '' })).toEqual({
      isPublished: { equals: true },
    })
  })

  it('serializeCatalogQuery omits defaults', () => {
    const q = serializeCatalogQuery({
      q: '',
      level: '',
      subject: '',
      sort: '-updatedAt',
      page: 1,
    })
    expect(q).toBe('')
  })

  it('serializeCatalogQuery preserves filters and page', () => {
    const q = serializeCatalogQuery(
      {
        q: 'a',
        level: 'ADVANCED',
        subject: 'x',
        sort: 'title',
        page: 3,
      },
      3,
    )
    expect(q).toContain('q=a')
    expect(q).toContain('level=ADVANCED')
    expect(q).toContain('subject=x')
    expect(q).toContain('sort=title')
    expect(q).toContain('page=3')
  })
})

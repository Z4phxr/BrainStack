/**
 * Unit tests — lib/public-routes.ts
 *
 * Validates the shape and contents of the PUBLIC_PATHS and
 * PUBLIC_PATH_PREFIXES allow-lists used by middleware and auth.
 */

import { describe, it, expect } from 'vitest'
import { PUBLIC_PATHS, PUBLIC_PATH_PREFIXES } from '@/lib/public-routes'

describe('PUBLIC_PATHS', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(PUBLIC_PATHS)).toBe(true)
    expect(PUBLIC_PATHS.length).toBeGreaterThan(0)
  })

  it('every entry is an absolute path starting with "/"', () => {
    for (const path of PUBLIC_PATHS) {
      expect(path.startsWith('/')).toBe(true)
    }
  })

  it('contains the root landing page', () => {
    expect(PUBLIC_PATHS).toContain('/')
  })

  it('contains /login and /register for unauthenticated access', () => {
    expect(PUBLIC_PATHS).toContain('/login')
    expect(PUBLIC_PATHS).toContain('/register')
  })

  it('contains /api/ping for health-check automation', () => {
    expect(PUBLIC_PATHS).toContain('/api/ping')
  })

  it('has no duplicate entries', () => {
    const unique = new Set(PUBLIC_PATHS)
    expect(unique.size).toBe(PUBLIC_PATHS.length)
  })
})

describe('PUBLIC_PATH_PREFIXES', () => {
  it('is a non-empty array', () => {
    expect(Array.isArray(PUBLIC_PATH_PREFIXES)).toBe(true)
    expect(PUBLIC_PATH_PREFIXES.length).toBeGreaterThan(0)
  })

  it('every entry is a string starting with "/"', () => {
    for (const prefix of PUBLIC_PATH_PREFIXES) {
      expect(prefix.startsWith('/')).toBe(true)
    }
  })

  it('includes /api/auth to allow NextAuth internal callbacks', () => {
    expect(PUBLIC_PATH_PREFIXES).toContain('/api/auth')
  })

  it('includes /api/subjects so course discovery works without login', () => {
    expect(PUBLIC_PATH_PREFIXES).toContain('/api/subjects')
  })

  it('includes /media for public asset delivery', () => {
    expect(PUBLIC_PATH_PREFIXES).toContain('/media')
  })

  it('has no duplicate entries', () => {
    const unique = new Set(PUBLIC_PATH_PREFIXES)
    expect(unique.size).toBe(PUBLIC_PATH_PREFIXES.length)
  })
})

/**
 * Unit tests — lib/db-utils.ts
 *
 * Tests for sanitizeDatabaseUrl() which normalises malformed Postgres
 * connection strings produced by some hosting providers (Railway).
 */

import { describe, it, expect } from 'vitest'
import { sanitizeDatabaseUrl } from '@/lib/db-utils'

describe('sanitizeDatabaseUrl', () => {
  // ── Missing '?' before query parameters ───────────────────────────────────

  describe('fixes missing "?" before query parameters', () => {
    it('replaces the first "&" with "?" when no "?" is present', () => {
      const input = 'postgresql://user:pass@host/db&schema=public&sslmode=require'
      const result = sanitizeDatabaseUrl(input)
      expect(result).toContain('?schema=public')
      expect(result).not.toMatch(/\/db&/)
    })

    it('leaves a well-formed URL with "?" unchanged', () => {
      const input = 'postgresql://user:pass@host/db?schema=public'
      const result = sanitizeDatabaseUrl(input)
      expect(result).toContain('?schema=public')
      // No duplicate '?'
      expect(result.split('?').length - 1).toBe(1)
    })

    it('does not modify a URL that has no query parameters at all', () => {
      const input = 'postgresql://user:pass@host/db'
      const result = sanitizeDatabaseUrl(input)
      expect(result).toBe(input)
    })
  })

  // ── uselibpqcompat appended for sslmode URLs ───────────────────────────────

  describe('appends uselibpqcompat for sslmode URLs', () => {
    it('appends uselibpqcompat=true when sslmode is present but the flag is absent', () => {
      const input = 'postgresql://user:pass@host/db?sslmode=require'
      const result = sanitizeDatabaseUrl(input)
      expect(result).toContain('uselibpqcompat=true')
    })

    it('does not append uselibpqcompat when it is already present', () => {
      const input = 'postgresql://user:pass@host/db?sslmode=require&uselibpqcompat=true'
      const result = sanitizeDatabaseUrl(input)
      const occurrences = result.split('uselibpqcompat').length - 1
      expect(occurrences).toBe(1)
    })

    it('does not append uselibpqcompat when sslmode is absent', () => {
      const input = 'postgresql://user:pass@host/db?schema=public'
      const result = sanitizeDatabaseUrl(input)
      expect(result).not.toContain('uselibpqcompat')
    })
  })

  // ── Combined fixes ─────────────────────────────────────────────────────────

  describe('applies both fixes together', () => {
    it('fixes missing "?" and appends uselibpqcompat on a Railway-style URL', () => {
      const input = 'postgresql://user:pass@host/db&schema=public&sslmode=require'
      const result = sanitizeDatabaseUrl(input)
      expect(result).toContain('?schema=public')
      expect(result).toContain('uselibpqcompat=true')
    })
  })

  // ── Idempotency ────────────────────────────────────────────────────────────

  describe('idempotency', () => {
    it('produces the same output when called twice on the result', () => {
      const input = 'postgresql://user:pass@host/db&schema=public&sslmode=require'
      const once = sanitizeDatabaseUrl(input)
      const twice = sanitizeDatabaseUrl(once)
      expect(twice).toBe(once)
    })
  })
})

import { describe, it, expect } from 'vitest'
import { toSlug } from '@/lib/utils'

describe('toSlug utility', () => {
  describe('Basic transformations', () => {
    it('should convert uppercase to lowercase', () => {
      expect(toSlug('Hello World')).toBe('hello-world')
      expect(toSlug('UPPERCASE')).toBe('uppercase')
    })

    it('should replace spaces with hyphens', () => {
      expect(toSlug('multiple   spaces')).toBe('multiple-spaces')
      expect(toSlug('single space')).toBe('single-space')
    })

    it('should remove leading and trailing hyphens',  () => {
      expect(toSlug(' leading space')).toBe('leading-space')
      expect(toSlug('trailing space ')).toBe('trailing-space')
      expect(toSlug(' both sides ')).toBe('both-sides')
    })
  })

  describe('Special characters handling', () => {
    it('should remove non-alphanumeric characters', () => {
      expect(toSlug('hello@world!')).toBe('hello-world')
      expect(toSlug('test&value')).toBe('test-value')
      expect(toSlug('price: $100')).toBe('price-100')
    })

    it('should handle diacritics/accents', () => {
      expect(toSlug('café')).toBe('cafe')
      expect(toSlug('naïve')).toBe('naive')
      expect(toSlug('résumé')).toBe('resume')
    })

    it('should handle underscores', () => {
      expect(toSlug('hello_world')).toBe('hello-world')
      expect(toSlug('snake_case_text')).toBe('snake-case-text')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty string', () => {
      expect(toSlug('')).toBe('')
    })

    it('should handle string with only special characters', () => {
      expect(toSlug('!!!')).toBe('')
      expect(toSlug('@@@')).toBe('')
    })

    it('should handle consecutive special characters', () => {
      expect(toSlug('hello---world')).toBe('hello-world')
      expect(toSlug('test!!!value')).toBe('test-value')
    })

    it('should preserve numbers', () => {
      expect(toSlug('Course 101')).toBe('course-101')
      expect(toSlug('2024 Update')).toBe('2024-update')
    })

    it('should handle very long strings', () => {
      const long = 'This is a very long title that might need to be slugified for a course'
      const result = toSlug(long)
      expect(result).toBe('this-is-a-very-long-title-that-might-need-to-be-slugified-for-a-course')
      expect(result).not.toContain(' ')
      expect(result).not.toMatch(/[A-Z]/)
    })
  })

  describe('Real-world course titles', () => {
    it('should handle typical course titles', () => {
      expect(toSlug('Introduction to Web Development')).toBe('introduction-to-web-development')
      expect(toSlug('JavaScript: The Complete Guide')).toBe('javascript-the-complete-guide')
      expect(toSlug('Python 3.9 - Advanced Features')).toBe('python-3-9-advanced-features')
    })

    it('should handle titles with parentheses', () => {
      expect(toSlug('React (Hooks & Context)')).toBe('react-hooks-context')
      expect(toSlug('Database Design (SQL)')).toBe('database-design-sql')
    })
  })
})

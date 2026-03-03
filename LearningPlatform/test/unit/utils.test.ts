import { describe, it, expect } from 'vitest'
import { cn } from '@/lib/utils'

describe('cn (className utility)', () => {
  describe('Basic functionality', () => {
    it('should concatenate class names', () => {
      expect(cn('class1', 'class2')).toBe('class1 class2')
    })

    it('should handle conditional classes', () => {
      expect(cn('base', true && 'conditional')).toBe('base conditional')
      expect(cn('base', false && 'conditional')).toBe('base')
    })

    it('should handle undefined and null', () => {
      expect(cn('class1', undefined, 'class2')).toBe('class1 class2')
      expect(cn('class1', null, 'class2')).toBe('class1 class2')
    })
  })

  describe('Tailwind conflict resolution', () => {
    it('should resolve conflicting padding classes', () => {
      const result = cn('p-4', 'p-8')
      expect(result).toBe('p-8')
    })

    it('should resolve conflicting margin classes', () => {
      const result = cn('m-2', 'm-4')
      expect(result).toBe('m-4')
    })

    it('should resolve conflicting text color classes', () => {
      const result = cn('text-red-500', 'text-blue-500')
      expect(result).toBe('text-blue-500')
    })

    it('should resolve conflicting background classes', () => {
      const result = cn('bg-white', 'bg-black')
      expect(result).toBe('bg-black')
    })

    it('should preserve non-conflicting classes', () => {
      const result = cn('p-4 text-center', 'bg-blue-500 text-white')
      expect(result).toContain('p-4')
      expect(result).toContain('text-white')
      expect(result).toContain('bg-blue-500')
      // Note: cn does basic merging but doesn't always remove non-conflicting duplicates
    })
  })

  describe('Object and array inputs', () => {
    it('should handle object with boolean values', () => {
      const result = cn({
        'class1': true,
        'class2': false,
        'class3': true
      })
      expect(result).toContain('class1')
      expect(result).toContain('class3')
      expect(result).not.toContain('class2')
    })

    it('should handle arrays', () => {
      const result = cn(['class1', 'class2'], 'class3')
      expect(result).toBe('class1 class2 class3')
    })

    it('should handle mixed inputs', () => {
      const result = cn(
        'base',
        ['array1', 'array2'],
        { conditional: true, ignored: false },
        'final'
      )
      expect(result).toContain('base')
      expect(result).toContain('array1')
      expect(result).toContain('array2')
      expect(result).toContain('conditional')
      expect(result).toContain('final')
      expect(result).not.toContain('ignored')
    })
  })

  describe('Common UI patterns', () => {
    it('should handle button variant pattern', () => {
      const baseClasses = 'px-4 py-2 rounded font-medium'
      const primary = cn(baseClasses, 'bg-blue-500 text-white')
      const secondary = cn(baseClasses, 'bg-gray-200 text-gray-800')
      
      expect(primary).toContain('px-4 py-2 rounded font-medium')
      expect(primary).toContain('bg-blue-500 text-white')
      
      expect(secondary).toContain('px-4 py-2 rounded font-medium')
      expect(secondary).toContain('bg-gray-200 text-gray-800')
    })

    it('should handle size variants with conflicts', () => {
      const baseClasses = 'px-4 py-2'
      const largeClasses = cn(baseClasses, 'px-6 py-3')
      
      expect(largeClasses).toBe('px-6 py-3')
      expect(largeClasses).not.toContain('px-4')
      expect(largeClasses).not.toContain('py-2')
    })

    it('should handle dark mode variants', () => {
      const result = cn(
        'bg-white text-black',
        'dark:bg-black dark:text-white'
      )
      expect(result).toContain('bg-white')
      expect(result).toContain('text-white')
      expect(result).toContain('dark:bg-black')
      expect(result).toContain('dark:text-white')
    })
  })

  describe('Edge cases', () => {
    it('should handle empty inputs', () => {
      expect(cn()).toBe('')
      expect(cn('')).toBe('')
      expect(cn('', '')).toBe('')
    })

    it('should handle whitespace', () => {
      expect(cn('  class1  ', '  class2  ')).toBe('class1 class2')
    })

    it('should handle duplicate classes', () => {
      // Note: cn/clsx doesn't always deduplicate - it depends on input structure
      const result = cn(['class1', 'class2'], 'class1')
      expect(result).toContain('class1')
      expect(result).toContain('class2')
    })
  })
})

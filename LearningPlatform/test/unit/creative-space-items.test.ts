import { describe, it, expect } from 'vitest'
import { CREATIVE_ITEM_TYPES } from '@/lib/creative-space'

describe('creative-space item types', () => {
  it('exports a fixed set of block types', () => {
    expect(CREATIVE_ITEM_TYPES).toContain('TEXT')
    expect(CREATIVE_ITEM_TYPES).toContain('FLASHCARD')
    expect(CREATIVE_ITEM_TYPES).toContain('DECK')
    expect(new Set(CREATIVE_ITEM_TYPES).size).toBe(CREATIVE_ITEM_TYPES.length)
  })
})

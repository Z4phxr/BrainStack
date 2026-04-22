import { describe, it, expect } from 'vitest'
import {
  appearanceForBoardHex,
  isPresetBoardHex,
  luminanceBasedChrome,
  normalizeHexColor,
} from '@/lib/creative-space-board-surface'
import { parseBoardPatternId, BOARD_PATTERN_PICKER_ORDER } from '@/lib/creative-space-board-pattern'
import { creativeSpaceSurfaceStyle } from '@/lib/creative-space-surface-vars'

describe('creative-space-board-surface', () => {
  it('normalizeHexColor accepts 6-digit hex and lowercases', () => {
    expect(normalizeHexColor('#ABCDEF')).toBe('#abcdef')
    expect(normalizeHexColor('  #aabbcc  ')).toBe('#aabbcc')
  })

  it('normalizeHexColor rejects invalid input', () => {
    expect(normalizeHexColor('')).toBeNull()
    expect(normalizeHexColor('#fff')).toBeNull()
    expect(normalizeHexColor('blue')).toBeNull()
  })

  it('isPresetBoardHex recognizes light and dark presets', () => {
    expect(isPresetBoardHex('#ffffff')).toBe(true)
    expect(isPresetBoardHex('#171717')).toBe(true)
    expect(isPresetBoardHex('#336699')).toBe(false)
  })

  it('appearanceForBoardHex maps presets and luminance for custom colors', () => {
    expect(appearanceForBoardHex('#ffffff')).toBe('light')
    expect(appearanceForBoardHex('#171717')).toBe('dark')
    expect(['light', 'dark']).toContain(appearanceForBoardHex('#808080'))
  })

  it('luminanceBasedChrome returns light or dark', () => {
    expect(['light', 'dark']).toContain(luminanceBasedChrome('#000000'))
    expect(['light', 'dark']).toContain(luminanceBasedChrome('#ffffff'))
  })
})

describe('creative-space-board-pattern', () => {
  it('parseBoardPatternId accepts known ids', () => {
    for (const id of BOARD_PATTERN_PICKER_ORDER) {
      expect(parseBoardPatternId(id)).toBe(id)
    }
  })

  it('parseBoardPatternId falls back to none for unknown', () => {
    expect(parseBoardPatternId('nope')).toBe('none')
    expect(parseBoardPatternId(null)).toBe('none')
    expect(parseBoardPatternId(undefined)).toBe('none')
  })
})

describe('creative-space-surface-vars', () => {
  it('creativeSpaceSurfaceStyle sets colorScheme', () => {
    expect(creativeSpaceSurfaceStyle('light').colorScheme).toBe('light')
    expect(creativeSpaceSurfaceStyle('dark').colorScheme).toBe('dark')
  })

  it('creativeSpaceSurfaceStyle exposes CSS variables', () => {
    const light = creativeSpaceSurfaceStyle('light') as Record<string, unknown>
    expect(String(light['--background'])).toContain('oklch')
  })
})

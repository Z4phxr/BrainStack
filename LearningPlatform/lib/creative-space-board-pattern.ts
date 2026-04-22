import type { CSSProperties } from 'react'

/** 10 choices: none + lines/grid/dots × small / medium / large gap. */
export type BoardPatternId =
  | 'none'
  | 'lines-s'
  | 'lines-m'
  | 'lines-l'
  | 'grid-s'
  | 'grid-m'
  | 'grid-l'
  | 'dots-s'
  | 'dots-m'
  | 'dots-l'

export const BOARD_PATTERN_STORAGE_KEY = 'creative-space-board-pattern'

/** Picker layout: two rows × five columns (left → right, top → bottom). */
export const BOARD_PATTERN_PICKER_ORDER: BoardPatternId[] = [
  'none',
  'lines-s',
  'lines-m',
  'lines-l',
  'grid-s',
  'grid-m',
  'grid-l',
  'dots-s',
  'dots-m',
  'dots-l',
]

/** Dots (“spots”) — keep current rhythm. */
const GAP_PX_DOTS: Record<'s' | 'm' | 'l', number> = {
  s: 16,
  m: 28,
  l: 44,
}

/** Horizontal lines + grid — slightly wider cells than dots at each size. */
const GAP_PX_LINES_GRID: Record<'s' | 'm' | 'l', number> = {
  s: 20,
  m: 34,
  l: 54,
}

function gapPxForPattern(patternId: Exclude<BoardPatternId, 'none'>): number {
  const size = patternId.slice(-1) as 's' | 'm' | 'l'
  if (patternId.startsWith('dots')) return GAP_PX_DOTS[size] ?? GAP_PX_DOTS.m
  return GAP_PX_LINES_GRID[size] ?? GAP_PX_LINES_GRID.m
}

const ALL_IDS: BoardPatternId[] = [...BOARD_PATTERN_PICKER_ORDER]

export function parseBoardPatternId(raw: string | null | undefined): BoardPatternId {
  if (raw && (ALL_IDS as string[]).includes(raw)) return raw as BoardPatternId
  return 'none'
}

export function boardPatternPickerLabel(id: BoardPatternId): string {
  switch (id) {
    case 'none':
      return 'No pattern — solid board only'
    case 'lines-s':
      return 'Horizontal lines, small gap'
    case 'lines-m':
      return 'Horizontal lines, medium gap'
    case 'lines-l':
      return 'Horizontal lines, large gap'
    case 'grid-s':
      return 'Grid, small gap'
    case 'grid-m':
      return 'Grid, medium gap'
    case 'grid-l':
      return 'Grid, large gap'
    case 'dots-s':
      return 'Dots, small gap'
    case 'dots-m':
      return 'Dots, medium gap'
    case 'dots-l':
      return 'Dots, large gap'
    default:
      return 'Board pattern'
  }
}

function patternStroke(surfaceDark: boolean): string {
  return surfaceDark ? 'rgba(255,255,255,0.34)' : 'rgba(15,23,42,0.28)'
}

function lineThickness(size: 's' | 'm' | 'l'): number {
  return size === 's' ? 1.5 : size === 'm' ? 2 : 2.5
}

function dotRadius(size: 's' | 'm' | 'l'): number {
  return size === 's' ? 1.75 : size === 'm' ? 2.25 : 2.75
}

function patternLayers(
  patternId: Exclude<BoardPatternId, 'none'>,
  surfaceDark: boolean,
  gapPx: number,
  lineTPx: number,
  dotRPx: number,
): CSSProperties {
  const stroke = patternStroke(surfaceDark)
  const t = Math.max(1, lineTPx)

  if (patternId.startsWith('lines')) {
    return {
      backgroundImage: `linear-gradient(to bottom, ${stroke} 0, ${stroke} ${t}px, transparent ${t}px)`,
      backgroundSize: `100% ${gapPx}px`,
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat',
    }
  }

  if (patternId.startsWith('grid')) {
    const h = `linear-gradient(to bottom, ${stroke} 0, ${stroke} ${t}px, transparent ${t}px)`
    const v = `linear-gradient(to right, ${stroke} 0, ${stroke} ${t}px, transparent ${t}px)`
    return {
      backgroundImage: `${h}, ${v}`,
      backgroundSize: `100% ${gapPx}px, ${gapPx}px 100%`,
      backgroundPosition: '0 0, 0 0',
      backgroundRepeat: 'repeat, repeat',
    }
  }

  if (patternId.startsWith('dots')) {
    const r = Math.max(1.2, dotRPx)
    return {
      backgroundImage: `radial-gradient(circle at center, ${stroke} ${r}px, transparent ${r + 0.5}px)`,
      backgroundSize: `${gapPx}px ${gapPx}px`,
      backgroundPosition: '0 0',
      backgroundRepeat: 'repeat',
    }
  }

  return {}
}

/** Full-size overlay on the board (real gap sizes). */
export function boardPatternOverlayStyle(
  patternId: BoardPatternId,
  surfaceDark: boolean,
): CSSProperties {
  if (patternId === 'none') return {}

  const size = patternId.slice(-1) as 's' | 'm' | 'l'
  const gap = gapPxForPattern(patternId)
  return patternLayers(patternId, surfaceDark, gap, lineThickness(size), dotRadius(size))
}

/**
 * Mini preview inside a square tile (~48px). Scales gaps and stroke so the motif reads at a glance.
 */
export function boardPatternThumbnailStyle(
  patternId: BoardPatternId,
  surfaceDark: boolean,
  cellPx: number,
): CSSProperties {
  if (patternId === 'none') return {}

  const size = patternId.slice(-1) as 's' | 'm' | 'l'
  const fullGap = gapPxForPattern(patternId)
  const previewGap = Math.max(
    5,
    Math.min(Math.round(fullGap * (cellPx / 70)), Math.round(cellPx / 4.2)),
  )
  const scale = Math.max(0.72, Math.min(1.05, cellPx / 52))
  const lineT = Math.max(1, Math.round(lineThickness(size) * scale * 10) / 10)
  const dotR = Math.max(1.35, Math.min(2.5, dotRadius(size) * scale, previewGap * 0.14))

  return patternLayers(patternId, surfaceDark, previewGap, lineT, dotR)
}

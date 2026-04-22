export function normalizeHexColor(raw: string): string | null {
  const t = raw.trim()
  if (!/^#[0-9A-Fa-f]{6}$/.test(t)) return null
  return t.toLowerCase()
}

export const CREATIVE_SPACE_LIGHT_BOARD_PRESETS = [
  { id: 'white', label: 'White', hex: '#ffffff' },
  { id: 'beige', label: 'Beige', hex: '#f5f0e6' },
  { id: 'light-grey', label: 'Light grey', hex: '#e5e7eb' },
] as const

export const CREATIVE_SPACE_DARK_BOARD_PRESETS = [
  { id: 'black', label: 'Black', hex: '#171717' },
  { id: 'dark-grey', label: 'Dark grey', hex: '#27272a' },
  { id: 'midnight-blue', label: 'Midnight blue', hex: '#0f172a' },
] as const

const LIGHT_HEX = new Set<string>(
  CREATIVE_SPACE_LIGHT_BOARD_PRESETS.map((p) => p.hex),
)
const DARK_HEX = new Set<string>(CREATIVE_SPACE_DARK_BOARD_PRESETS.map((p) => p.hex))

function relativeLuminance(hex: string): number | null {
  const n = normalizeHexColor(hex)
  if (!n) return null
  const v = parseInt(n.slice(1), 16)
  const rs = (v >> 16) & 0xff
  const gs = (v >> 8) & 0xff
  const bs = v & 0xff
  const lin = (c: number) => {
    const s = c / 255
    return s <= 0.03928 ? s / 12.92 : ((s + 0.055) / 1.055) ** 2.4
  }
  const r = lin(rs)
  const g = lin(gs)
  const b = lin(bs)
  return 0.2126 * r + 0.7152 * g + 0.0722 * b
}

export function isPresetBoardHex(hex: string): boolean {
  const n = normalizeHexColor(hex)
  if (!n) return false
  return LIGHT_HEX.has(n) || DARK_HEX.has(n)
}

/** Light/dark chrome from board luminance only (used for custom color + “Auto”). */
export function luminanceBasedChrome(hex: string): 'light' | 'dark' {
  const n = normalizeHexColor(hex)
  if (!n) return 'light'
  const L = relativeLuminance(n)
  if (L == null) return 'light'
  return L < 0.45 ? 'dark' : 'light'
}

/** Maps board paint to the creative-space page chrome (presets fixed; other hex → luminance). */
export function appearanceForBoardHex(hex: string): 'light' | 'dark' {
  const n = normalizeHexColor(hex)
  if (!n) return 'light'
  if (LIGHT_HEX.has(n)) return 'light'
  if (DARK_HEX.has(n)) return 'dark'
  return luminanceBasedChrome(hex)
}

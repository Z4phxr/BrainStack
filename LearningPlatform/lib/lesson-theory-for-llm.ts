import { lexicalStateToMarkdown, tableToGFMMarkdown } from '@/lib/lexical-to-markdown'

/** Default cap keeps Haiku context and cost predictable. */
export const DEFAULT_LESSON_THEORY_MAX_CHARS = 48_000

export function courseLevelLabel(level: string | undefined): string {
  switch (level) {
    case 'BEGINNER':
      return 'Beginner'
    case 'INTERMEDIATE':
      return 'Intermediate'
    case 'ADVANCED':
      return 'Advanced'
    default:
      return level?.trim() ? level : 'Unknown'
  }
}

function legacyContentToMarkdown(content: unknown): string {
  if (typeof content === 'string') return content
  return lexicalStateToMarkdown(content) ?? ''
}

function calloutLabel(variant: unknown): string {
  if (variant === 'warning') return 'Warning'
  if (variant === 'tip') return 'Tip'
  return 'Info'
}

function imageBlockDescription(block: Record<string, unknown>): string {
  const img = block.image
  if (img && typeof img === 'object') {
    const o = img as { alt?: string; filename?: string }
    if (o.alt?.trim()) return o.alt.trim()
    if (o.filename?.trim()) return o.filename.trim()
  }
  return 'Image'
}

function theoryBlockToMarkdown(block: Record<string, unknown>): string {
  const bt = block.blockType
  switch (bt) {
    case 'text': {
      return (lexicalStateToMarkdown(block.content) ?? '').trim()
    }
    case 'callout': {
      const label = calloutLabel(block.variant)
      const title = typeof block.title === 'string' && block.title.trim() ? block.title.trim() : ''
      const head = title ? `**${label}: ${title}**` : `**${label}**`
      const body = lexicalStateToMarkdown(block.content) ?? ''
      return [head, body].filter((s) => s.trim().length > 0).join('\n\n')
    }
    case 'math': {
      const latex = String(block.latex ?? '')
      const display = Boolean(block.displayMode)
      const note = typeof block.note === 'string' && block.note.trim() ? `\n\n_Note:_ ${block.note.trim()}` : ''
      const wrapped = display ? `$$\n${latex}\n$$` : `$${latex}$`
      return `**Math** (${display ? 'display' : 'inline'})\n\n${wrapped}${note}`
    }
    case 'image': {
      const desc = imageBlockDescription(block)
      const cap =
        typeof block.caption === 'string' && block.caption.trim() ? `**Caption:** ${block.caption.trim()}` : ''
      return ['**Image**', cap, `_(${desc})_`].filter((s) => s.length > 0).join('\n')
    }
    case 'video': {
      const title = typeof block.title === 'string' && block.title.trim() ? block.title.trim() : ''
      const url = String(block.videoUrl ?? '')
      const cap =
        typeof block.caption === 'string' && block.caption.trim() ? block.caption.trim() : ''
      const lines = ['**Video**']
      if (title) lines.push(title)
      if (url) lines.push(url)
      if (cap) lines.push(cap)
      return lines.join('\n')
    }
    case 'table': {
      const caption = typeof block.caption === 'string' ? block.caption : undefined
      const hasHeaders = Boolean(block.hasHeaders)
      const headers = Array.isArray(block.headers) ? (block.headers as string[]) : []
      const rows = Array.isArray(block.rows) ? (block.rows as string[][]) : []
      if (rows.length === 0 && headers.length === 0) return ''
      return tableToGFMMarkdown(caption, hasHeaders, headers, rows)
    }
    default:
      return ''
  }
}

/**
 * Serialize lesson theory (blocks or legacy rich text) into one markdown-ish document for the LLM.
 */
export function serializeLessonTheoryForLlm(input: {
  theoryBlocks?: unknown[] | null
  content?: unknown
}): string {
  const parts: string[] = []

  if (input.theoryBlocks && input.theoryBlocks.length > 0) {
    for (const raw of input.theoryBlocks) {
      if (!raw || typeof raw !== 'object') continue
      const chunk = theoryBlockToMarkdown(raw as Record<string, unknown>).trim()
      if (chunk) parts.push(chunk)
    }
  } else if (input.content != null) {
    const legacy = legacyContentToMarkdown(input.content).trim()
    if (legacy) parts.push(legacy)
  }

  return parts.join('\n\n---\n\n')
}

export function truncateTheoryText(
  text: string,
  maxChars: number,
): { text: string; truncated: boolean } {
  if (text.length <= maxChars) return { text, truncated: false }
  const cut = text.slice(0, maxChars)
  return {
    text: `${cut}\n\n[… content truncated for length …]`,
    truncated: true,
  }
}

export function buildLessonTheoryForLlm(
  input: { theoryBlocks?: unknown[] | null; content?: unknown },
  maxChars: number = DEFAULT_LESSON_THEORY_MAX_CHARS,
): { body: string; truncated: boolean } {
  const raw = serializeLessonTheoryForLlm(input)
  const { text, truncated } = truncateTheoryText(raw, maxChars)
  return { body: text, truncated }
}

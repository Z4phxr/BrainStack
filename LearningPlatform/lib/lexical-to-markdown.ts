/**
 * Serialize Payload / Lexical rich-text JSON to a Markdown string so we can render
 * with react-markdown (GFM: tables, strikethrough, task lists, autolinks, etc.).
 */

type LexNode = Record<string, unknown>

function escapeCell(s: string): string {
  return s.replace(/\|/g, '\\|').replace(/\n/g, ' ')
}

function inlineChildrenToMd(children: LexNode[] | undefined): string {
  if (!children?.length) return ''
  return children.map((c) => inlineNodeToMd(c)).join('')
}

function inlineNodeToMd(child: LexNode): string {
  const t = child.type as string | undefined
  if (t === 'linebreak') return '  \n'
  if (t === 'link') {
    const url = String(child.url ?? '')
    const inner = inlineChildrenToMd(child.children as LexNode[] | undefined)
    return `[${inner}](${url})`
  }
  if (t === 'autolink' || t === 'auto-link') {
    const url = String((child.fields as { url?: string } | undefined)?.url ?? child.url ?? '')
    return url ? `<${url}>` : ''
  }
  const text = child.text != null ? String(child.text) : ''
  if (!text && t && t !== 'text') return ''
  let out = text
  const fmt = typeof child.format === 'number' ? (child.format as number) : 0
  const isBold = !!(child.bold || fmt & 1)
  const isItalic = !!(child.italic || fmt & 2)
  const isStrike = !!(child.strikethrough || fmt & 4)
  const isCode = !!(child.code || fmt & 8)
  if (isCode) out = '`' + out.replace(/`/g, '\\`') + '`'
  if (isBold) out = `**${out}**`
  if (isItalic) out = `*${out}*`
  if (isStrike) out = `~~${out}~~`
  return out
}

function listItemToMd(item: LexNode): string {
  const ch = item.children as LexNode[] | undefined
  if (!ch?.length) return ''
  return ch
    .map((node) => {
      if (node.type === 'paragraph') {
        return inlineChildrenToMd(node.children as LexNode[] | undefined)
      }
      if (node.type === 'list') {
        return '\n' + blockNodeToMd(node)
      }
      if (node.text != null) return String(node.text)
      return ''
    })
    .join('')
}

function blockNodeToMd(node: LexNode): string {
  const t = node.type as string | undefined
  const children = node.children as LexNode[] | undefined

  if (t === 'listitem' || t === 'list-item') {
    return listItemToMd(node)
  }

  if (t === 'paragraph') {
    return inlineChildrenToMd(children)
  }

  if (t === 'heading') {
    const tag = (node.tag as string | undefined) || 'h2'
    const n = Math.min(6, Math.max(1, Number.parseInt(tag.replace(/^h/i, ''), 10) || 2))
    const hashes = '#'.repeat(n)
    return `${hashes} ${inlineChildrenToMd(children)}`
  }

  if (t === 'list') {
    const listType = node.listType as string | undefined
    const ordered = listType === 'number'
    if (!children?.length) return ''
    return children
      .map((item, i) => {
        const body = listItemToMd(item).trim()
        const prefix = ordered ? `${i + 1}. ` : '- '
        return prefix + body.replace(/\n/g, '\n  ')
      })
      .join('\n')
  }

  if (t === 'quote') {
    const inner =
      children
        ?.map((ch) => {
          if (ch.type === 'paragraph') {
            return inlineChildrenToMd(ch.children as LexNode[] | undefined)
          }
          return ''
        })
        .filter(Boolean)
        .join('\n\n') ?? ''
    return inner
      .split('\n')
      .map((line) => (line.trim() ? `> ${line}` : '>'))
      .join('\n')
  }

  if (t === 'horizontalrule') {
    return '---'
  }

  // Fenced code (Lexical / Payload)
  if (t === 'code' || t === 'codeblock' || t === 'code-highlight') {
    const lang = String((node.language as string | undefined) || '')
    const codeText = extractPlainFromLexicalChildren(children).replace(/\u00a0/g, ' ')
    return '```' + lang + '\n' + codeText + '\n```'
  }

  return ''
}

function extractPlainFromLexicalChildren(nodes: LexNode[] | undefined): string {
  if (!nodes?.length) return ''
  return nodes
    .map((n) => {
      const typ = n.type as string | undefined
      if (typ === 'text' || typ === undefined) {
        return n.text != null ? String(n.text) : ''
      }
      if (n.children) return extractPlainFromLexicalChildren(n.children as LexNode[])
      return ''
    })
    .join('')
}

/**
 * Returns markdown or null if the payload is not a Lexical document root.
 */
export function lexicalStateToMarkdown(content: unknown): string | null {
  if (!content || typeof content !== 'object') return null
  const root = (content as { root?: { children?: LexNode[] } }).root
  if (!root || !Array.isArray(root.children)) return null

  const parts = root.children.map((n) => blockNodeToMd(n as LexNode)).filter((s) => s.trim().length > 0)

  if (parts.length === 0) return ''

  return parts.join('\n\n')
}

/**
 * If table cells contain markdown-like markers, render better as markdown by wrapping rows.
 * Plain text cells stay valid markdown.
 */
export function tableToGFMMarkdown(
  caption: string | undefined,
  _hasHeaders: boolean,
  headers: string[],
  rows: string[][],
): string {
  const lines: string[] = []
  if (caption?.trim()) {
    lines.push(caption.trim(), '')
  }

  const cols = Math.max(headers.length, rows.reduce((m, r) => Math.max(m, r.length), 0))
  if (cols === 0) return lines.join('\n')

  const pad = (cells: string[]) => {
    const next = [...cells]
    while (next.length < cols) next.push('')
    return next.slice(0, cols).map((c) => escapeCell((c ?? '').trim()))
  }

  let headRow: string[]
  let bodyRows: string[][]

  if (headers.length > 0) {
    headRow = headers
    bodyRows = rows
  } else if (rows.length > 0) {
    headRow = rows[0] ?? []
    bodyRows = rows.slice(1)
  } else {
    return lines.join('\n')
  }

  const h = pad(headRow)
  lines.push(`| ${h.join(' | ')} |`)
  lines.push(`| ${h.map(() => '---').join(' | ')} |`)

  for (const row of bodyRows) {
    lines.push(`| ${pad(row).join(' | ')} |`)
  }

  return lines.join('\n')
}

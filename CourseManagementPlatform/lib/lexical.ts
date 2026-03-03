/**
 * Utilities for working with Payload CMS Lexical rich-text JSON.
 */

/**
 * Extract plain text from a Payload Lexical rich-text node tree.
 * Walks children/root recursively and joins all leaf text nodes.
 *
 * @param content - A Lexical JSON node, a plain string, or null/undefined.
 * @returns A single trimmed string of all leaf text.
 */
export function extractText(content: unknown): string {
  if (!content) return ''
  if (typeof content === 'string') return content

  const texts: string[] = []

  function walk(node: any) {
    if (!node) return
    if (node?.text) texts.push(String(node.text))
    if (Array.isArray(node?.children)) node.children.forEach(walk)
    if (node?.root) walk(node.root)
  }

  walk(content)
  return texts.join(' ').trim()
}

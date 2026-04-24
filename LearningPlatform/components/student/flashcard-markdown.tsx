'use client'

import {
  Children,
  cloneElement,
  Fragment,
  isValidElement,
  useEffect,
  useMemo,
  useState,
  type ReactElement,
  type ReactNode,
} from 'react'
import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import katex from 'katex'
import 'katex/dist/katex.min.css'
import { cn } from '@/lib/utils'
import {
  LESSON_THEORY_TEXT_SIZE_EVENT,
  readLessonTheoryTextSizeFromStorage,
  type LessonTheoryTextSize,
} from '@/lib/lesson-theory-text-size'
import { theoryMarkdownComponents } from '@/components/student/markdown-theory-body'

function katexToHtml(tex: string, displayMode: boolean): string {
  try {
    return katex.renderToString(tex, { displayMode, throwOnError: false })
  } catch {
    return tex
  }
}

function splitInlineDollars(s: string): ReactNode[] {
  const out: ReactNode[] = []
  let pos = 0
  while (pos < s.length) {
    const start = s.indexOf('$', pos)
    if (start === -1) {
      if (pos < s.length) out.push(s.slice(pos))
      break
    }
    if (start > pos) out.push(s.slice(pos, start))
    if (s[start + 1] === '$') {
      out.push('$$')
      pos = start + 2
      continue
    }
    const end = s.indexOf('$', start + 1)
    if (end === -1) {
      out.push(s.slice(start))
      break
    }
    const tex = s.slice(start + 1, end)
    out.push(
      <span
        key={`katex-i-${start}`}
        className="[&_.katex]:text-inherit"
        dangerouslySetInnerHTML={{ __html: katexToHtml(tex, false) }}
      />,
    )
    pos = end + 1
  }
  return out
}

function splitDisplayThenInline(s: string): ReactNode[] {
  const out: ReactNode[] = []
  let pos = 0
  while (pos < s.length) {
    const d = s.indexOf('$$', pos)
    if (d === -1) {
      out.push(...splitInlineDollars(s.slice(pos)))
      break
    }
    if (d > pos) out.push(...splitInlineDollars(s.slice(pos, d)))
    const dEnd = s.indexOf('$$', d + 2)
    if (dEnd === -1) {
      out.push(s.slice(d))
      break
    }
    const tex = s.slice(d + 2, dEnd).trim()
    out.push(
      <span
        key={`katex-d-${d}`}
        className="my-2 block max-w-full overflow-x-auto [&_.katex-display]:my-0"
        dangerouslySetInnerHTML={{ __html: katexToHtml(tex, true) }}
      />,
    )
    pos = dEnd + 2
  }
  return out
}

function mapChildrenWithMath(children: ReactNode): ReactNode {
  return Children.map(children, (child, index) => {
    if (child == null || typeof child === 'boolean') return child
    if (typeof child === 'string' || typeof child === 'number') {
      const parts = splitDisplayThenInline(String(child))
      if (parts.length === 1 && typeof parts[0] === 'string') return parts[0]
      return <Fragment key={`t-${index}`}>{parts}</Fragment>
    }
    if (!isValidElement(child)) return child
    const el = child as ReactElement<{ children?: ReactNode }>
    if (el.type === 'code' || el.type === 'pre') return el
    return cloneElement(el, { key: el.key ?? `n-${index}`, children: mapChildrenWithMath(el.props.children) })
  })
}

function wrapMarkdownComponentsWithMath(base: Components): Components {
  const out: Record<string, unknown> = { ...base }
  for (const key of Object.keys(base)) {
    const orig = base[key as keyof Components]
    if (typeof orig !== 'function') continue
    const fn = orig as (props: Record<string, unknown> & { children?: ReactNode }) => ReactNode
    out[key] = (props: Record<string, unknown> & { children?: ReactNode }) =>
      fn({ ...props, children: mapChildrenWithMath(props.children) })
  }
  return out as Components
}

export interface FlashcardRichTextProps {
  markdown: string
  /** Slightly larger on question vs answer in study UI. */
  variant?: 'question' | 'answer'
  className?: string
}

/**
 * GitHub-flavored Markdown (same stack as lesson theory) plus `$…$` / `$$…$$` KaTeX
 * in text nodes (skipped inside `code` / `pre` so fenced blocks stay literal).
 */
export function FlashcardRichText({ markdown, variant = 'question', className }: FlashcardRichTextProps) {
  const [tier, setTier] = useState<LessonTheoryTextSize>(() => readLessonTheoryTextSizeFromStorage())

  useEffect(() => {
    const sync = () => setTier(readLessonTheoryTextSizeFromStorage())
    sync()
    window.addEventListener(LESSON_THEORY_TEXT_SIZE_EVENT, sync)
    return () => window.removeEventListener(LESSON_THEORY_TEXT_SIZE_EVENT, sync)
  }, [])

  const components = useMemo(
    () => wrapMarkdownComponentsWithMath(theoryMarkdownComponents(tier)),
    [tier],
  )

  if (!markdown.trim()) return null

  return (
    <div
      className={cn(
        'min-w-0 max-w-none text-foreground [&_thead_th]:text-foreground [&_tbody_td]:text-foreground',
        variant === 'question' ? 'text-lg leading-relaxed' : 'text-base leading-relaxed',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={components}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

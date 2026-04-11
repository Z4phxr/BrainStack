'use client'

import type { Components } from 'react-markdown'
import ReactMarkdown from 'react-markdown'
import remarkGfm from 'remark-gfm'
import { cn } from '@/lib/utils'
import {
  lessonTheorySizeClasses,
  type LessonTheoryTextSize,
} from '@/lib/lesson-theory-text-size'

export interface TheoryMarkdownProps {
  markdown: string
  tier: LessonTheoryTextSize
  className?: string
}

function markdownComponents(tier: LessonTheoryTextSize): Components {
  const sc = lessonTheorySizeClasses(tier)

  return {
    p: ({ children }) => (
      <p className={cn('mb-3 last:mb-0 leading-relaxed', sc.body)}>{children}</p>
    ),
    h1: ({ children }) => (
      <h1 className={cn('mb-3 mt-6 font-bold tracking-tight first:mt-0', sc.theoryH1)}>{children}</h1>
    ),
    h2: ({ children }) => (
      <h2 className={cn('mb-2 mt-5 font-bold tracking-tight first:mt-0', sc.theoryH2)}>{children}</h2>
    ),
    h3: ({ children }) => (
      <h3 className={cn('mb-2 mt-4 font-semibold tracking-tight first:mt-0', sc.body, 'text-[1.1em]')}>
        {children}
      </h3>
    ),
    h4: ({ children }) => (
      <h4 className={cn('mb-2 mt-3 font-semibold first:mt-0', sc.body, 'text-[1.05em]')}>{children}</h4>
    ),
    ul: ({ children }) => (
      <ul className={cn('mb-3 list-disc space-y-1 pl-6 marker:text-foreground/80', sc.body)}>{children}</ul>
    ),
    ol: ({ children }) => (
      <ol className={cn('mb-3 list-decimal space-y-1 pl-6 marker:text-foreground/80', sc.body)}>{children}</ol>
    ),
    li: ({ children }) => <li className="leading-relaxed">{children}</li>,
    blockquote: ({ children }) => (
      <blockquote
        className={cn(
          'my-4 border-l-4 border-muted-foreground/40 pl-4 italic text-muted-foreground',
          sc.body,
        )}
      >
        {children}
      </blockquote>
    ),
    hr: () => <hr className="my-6 border-border" />,
    a: ({ href, children }) => (
      <a
        href={href}
        className="font-medium text-blue-600 underline-offset-2 hover:underline dark:text-blue-400"
        target="_blank"
        rel="noopener noreferrer"
      >
        {children}
      </a>
    ),
    strong: ({ children }) => <strong className="font-semibold text-foreground">{children}</strong>,
    em: ({ children }) => <em className="italic">{children}</em>,
    del: ({ children }) => <del className="line-through opacity-90">{children}</del>,
    code: ({ className, children, ...props }) => {
      const isBlock = /language-/.test(className ?? '')
      if (isBlock) {
        return (
          <code className={cn(sc.codeBlock, className)} {...props}>
            {children}
          </code>
        )
      }
      return (
        <code className={cn(sc.codeInline, 'text-foreground')} {...props}>
          {children}
        </code>
      )
    },
    pre: ({ children }) => (
      <pre
        className={cn(
          'my-4 max-w-full overflow-x-auto rounded-lg border border-border bg-muted/40 p-4 dark:bg-muted/25',
          sc.codeBlock,
        )}
      >
        {children}
      </pre>
    ),
    table: ({ children }) => (
      <div className="my-4 w-full max-w-full overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className={cn('w-full min-w-0 border-collapse', sc.table)}>{children}</table>
      </div>
    ),
    thead: ({ children }) => <thead className="bg-muted/70 dark:bg-muted/40">{children}</thead>,
    tbody: ({ children }) => <tbody>{children}</tbody>,
    tr: ({ children }) => (
      <tr className="border-t border-border odd:bg-background even:bg-muted/15 dark:even:bg-muted/10">{children}</tr>
    ),
    th: ({ children }) => (
      <th
        scope="col"
        className="border-b-2 border-border px-4 py-3 text-left font-semibold text-foreground first:rounded-tl-lg last:rounded-tr-lg"
      >
        {children}
      </th>
    ),
    td: ({ children }) => (
      <td className="border-r border-border px-4 py-3 align-top last:border-r-0 whitespace-normal break-words">
        {children}
      </td>
    ),
  }
}

/** Renders GFM markdown with lesson reading-size typography (tables, bold, lists, fenced code, etc.). */
export function TheoryMarkdown({ markdown, tier, className }: TheoryMarkdownProps) {
  if (!markdown.trim()) return null

  return (
    <div
      className={cn(
        'min-w-0 max-w-none text-foreground [&_thead_th]:text-foreground [&_tbody_td]:text-foreground',
        className,
      )}
    >
      <ReactMarkdown remarkPlugins={[remarkGfm]} components={markdownComponents(tier)}>
        {markdown}
      </ReactMarkdown>
    </div>
  )
}

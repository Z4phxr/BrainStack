'use client'

import React from 'react'
import { cn } from '@/lib/utils'
import type { LessonTheoryTextSize } from '@/lib/lesson-theory-text-size'
import { lexicalStateToMarkdown } from '@/lib/lexical-to-markdown'
import { TheoryMarkdown } from '@/components/student/markdown-theory-body'

export type LexicalRichTextTier = LessonTheoryTextSize | 'task'

function typographyForTier(tier: LexicalRichTextTier) {
  if (tier === 'task') {
    return {
      wrap: 'prose prose-sm max-w-none text-foreground',
      h2: 'text-xl font-bold mt-4 mb-2',
      h3: 'text-lg font-semibold mt-3 mb-2',
      p: 'mb-2',
    }
  }
  switch (tier) {
    case 'small':
      return {
        wrap: 'max-w-none text-base leading-relaxed text-foreground',
        h2: 'text-xl font-bold mt-4 mb-2',
        h3: 'text-lg font-semibold mt-3 mb-2',
        p: 'mb-2',
      }
    case 'large':
      return {
        wrap: 'max-w-none text-xl leading-relaxed text-foreground',
        h2: 'text-3xl font-bold mt-4 mb-2',
        h3: 'text-2xl font-semibold mt-3 mb-2',
        p: 'mb-2',
      }
    default:
      return {
        wrap: 'max-w-none text-lg leading-relaxed text-foreground',
        h2: 'text-2xl font-bold mt-4 mb-2',
        h3: 'text-xl font-semibold mt-3 mb-2',
        p: 'mb-2',
      }
  }
}

function renderTextWithLineBreaks(text?: string): React.ReactNode {
  if (!text) return null
  const parts = text.split('\n')
  return parts.map((part, idx) => (
    <React.Fragment key={idx}>
      {part}
      {idx < parts.length - 1 && <br />}
    </React.Fragment>
  ))
}

function renderInlineChildren(nodeChildren: Array<Record<string, unknown>> | undefined): React.ReactNode {
  if (!nodeChildren?.length) return null
  return nodeChildren.map((child, j) => {
    const childText = child.text as string | undefined
    const childType = child.type as string | undefined
    if (childType === 'linebreak') return <br key={j} />
    if (child.bold) return <strong key={j}>{renderTextWithLineBreaks(childText)}</strong>
    if (child.italic) return <em key={j}>{renderTextWithLineBreaks(childText)}</em>
    if (childType === 'link') {
      const childUrl = child.url as string | undefined
      const linkChildren = child.children as Array<Record<string, unknown>> | undefined
      return (
        <a
          key={j}
          href={childUrl}
          className="text-blue-600 hover:underline dark:text-blue-400"
          target="_blank"
          rel="noopener noreferrer"
        >
          {linkChildren?.map((c, k) => (
            <React.Fragment key={k}>{renderTextWithLineBreaks(c.text as string | undefined)}</React.Fragment>
          ))}
        </a>
      )
    }
    return <span key={j}>{renderTextWithLineBreaks(childText)}</span>
  })
}

function renderListItemContent(item: Record<string, unknown>): React.ReactNode {
  const itemChildren = item.children as Array<Record<string, unknown>> | undefined
  if (!itemChildren?.length) return null
  return itemChildren.map((child, k) => {
    if (child.type === 'paragraph') {
      const paragraphChildren = child.children as Array<Record<string, unknown>> | undefined
      return <span key={k}>{renderInlineChildren(paragraphChildren)}</span>
    }
    if (child.text != null) return <span key={k}>{String(child.text)}</span>
    return null
  })
}

export interface LexicalRichTextProps {
  content: unknown
  /** Default `task` matches task cards; lesson theory passes a reading-size tier. */
  tier?: LexicalRichTextTier
  className?: string
}

function renderLexicalStructuredTree(content: unknown, tier: LexicalRichTextTier, className?: string) {
  const typo = typographyForTier(tier)

  if (!content) return null

  if (typeof content === 'string') {
    return (
      <div className={cn(typo.wrap, className)}>
        <p className="whitespace-pre-wrap">{renderTextWithLineBreaks(content)}</p>
      </div>
    )
  }

  if (typeof content === 'object' && content !== null) {
    const root = (content as { root?: { children?: Array<Record<string, unknown>> } }).root
    if (root && Array.isArray(root.children)) {
      return (
        <div className={cn(typo.wrap, className)}>
          {root.children.map((node, i) => {
            const nodeType = node.type as string | undefined
            const nodeChildren = node.children as Array<Record<string, unknown>> | undefined
            if (nodeType === 'heading') {
              const level = (node.tag as string | undefined) || 'h2'
              const Tag = level as 'h1' | 'h2' | 'h3' | 'h4' | 'h5' | 'h6'
              const headingClass = level === 'h1' || level === 'h2' ? typo.h2 : typo.h3
              return (
                <Tag key={i} className={headingClass}>
                  {renderInlineChildren(nodeChildren)}
                </Tag>
              )
            }
            if (nodeType === 'paragraph') {
              return (
                <p key={i} className={typo.p}>
                  {renderInlineChildren(nodeChildren)}
                </p>
              )
            }
            if (nodeType === 'list') {
              const listType = node.listType as string | undefined
              const ListTag = listType === 'number' ? 'ol' : 'ul'
              return (
                <ListTag
                  key={i}
                  className={
                    listType === 'number'
                      ? 'mb-2 list-decimal space-y-1 pl-6'
                      : 'mb-2 list-disc space-y-1 pl-6'
                  }
                >
                  {nodeChildren?.map((item, j) => (
                    <li key={j} className="leading-relaxed">
                      {renderListItemContent(item)}
                    </li>
                  ))}
                </ListTag>
              )
            }
            if (nodeType === 'quote') {
              return (
                <blockquote
                  key={i}
                  className="border-muted-foreground/40 text-muted-foreground my-4 border-l-4 pl-4 italic"
                >
                  {nodeChildren?.map((child, j) => {
                    if (child.type === 'paragraph') {
                      const pc = child.children as Array<Record<string, unknown>> | undefined
                      return (
                        <p key={j} className={typo.p}>
                          {renderInlineChildren(pc)}
                        </p>
                      )
                    }
                    return null
                  })}
                </blockquote>
              )
            }
            if (nodeType === 'horizontalrule') {
              return <hr key={i} className="border-border my-6" />
            }
            return null
          })}
        </div>
      )
    }
  }

  if (Array.isArray(content)) {
    return (
      <div className={cn(typo.wrap, className)}>
        {(content as Record<string, unknown>[]).map((nodeItem, i) => {
          if (nodeItem.type === 'paragraph') {
            return (
              <p key={i} className={typo.p}>
                {(nodeItem.children as Array<Record<string, unknown>> | undefined)?.map((child, j) => (
                  <span key={j}>{child.text as string | undefined}</span>
                ))}
              </p>
            )
          }
          return null
        })}
      </div>
    )
  }

  return <p className="text-muted-foreground text-sm">Content in an unrecognized format</p>
}

/**
 * Renders Payload Lexical rich-text JSON (or plain string) to styled React nodes.
 * For lesson reading tiers, content is converted to Markdown and rendered with GFM (bold, lists, tables, code fences).
 */
export function LexicalRichText({ content, tier = 'task', className }: LexicalRichTextProps) {
  if (!content) return null

  if (tier !== 'task') {
    const lessonTier = tier as LessonTheoryTextSize
    if (typeof content === 'string') {
      return <TheoryMarkdown markdown={content} tier={lessonTier} className={className} />
    }
    const md = lexicalStateToMarkdown(content)
    if (md !== null && md.trim().length > 0) {
      return <TheoryMarkdown markdown={md} tier={lessonTier} className={className} />
    }
  }

  return renderLexicalStructuredTree(content, tier, className)
}

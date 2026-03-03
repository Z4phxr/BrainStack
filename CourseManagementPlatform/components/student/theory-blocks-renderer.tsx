'use client'

import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Alert, AlertDescription, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle, Lightbulb } from 'lucide-react'
import Image from 'next/image'

interface TextBlockData {
  blockType: 'text'
  content: unknown // Lexical JSON
}

interface ImageBlockData {
  blockType: 'image'
  image: {
    id: string | number
    filename: string
    alt?: string
    url?: string
  } | string | number
  caption?: string
  align: 'left' | 'center' | 'right'
  width: 'sm' | 'md' | 'lg' | 'full'
}

interface MathBlockData {
  blockType: 'math'
  latex: string
  displayMode: boolean
  note?: string
}

interface CalloutBlockData {
  blockType: 'callout'
  variant: 'info' | 'warning' | 'tip'
  title?: string
  content: unknown // Lexical JSON
}

interface VideoBlockData {
  blockType: 'video'
  videoUrl: string
  provider?: 'YOUTUBE' | 'VIMEO' | 'OTHER'
  title?: string
  caption?: string
  aspectRatio: '16:9' | '4:3'
}

interface TableBlockData {
  blockType: 'table'
  caption?: string
  hasHeaders?: boolean
  headers?: string[]
  rows?: string[][]
}

type TheoryBlock = TextBlockData | ImageBlockData | MathBlockData | CalloutBlockData | VideoBlockData | TableBlockData

interface TheoryBlocksRendererProps {
  blocks?: Array<TheoryBlock | Record<string, unknown>>
}

function renderLexicalContent(content: unknown): string {
  // Simple Lexical renderer - extracts text from Lexical JSON
  if (!content) return ''
  
  try {
    if (typeof content === 'string') return content
    
    if (typeof content === 'object' && content !== null) {
      const root = (content as { root?: { children?: Array<Record<string, unknown>> } }).root
      if (root?.children) {
        return root.children
          .map((node) => {
            const nodeType = node.type as string | undefined
            const nodeChildren = node.children as Array<Record<string, unknown>> | undefined
            if (nodeType === 'paragraph' || nodeType === 'heading') {
              return nodeChildren?.map((child) => (child.text as string) || '').join('') || ''
            }
            return ''
          })
          .join('\n\n')
      }
    }
    
    return JSON.stringify(content)
  } catch {
    return String(content)
  }
}

function MathBlockComponent({ latex, displayMode, note }: { latex: string; displayMode: boolean; note?: string }) {
  let html = ''
  try {
    html = katex.renderToString(latex, {
      displayMode,
      throwOnError: false,
      output: 'html',
    })
  } catch (e) {
    html = `<span style="color: red;">LaTeX formula error: ${(e as Error).message}</span>`
  }

  return (
    <div className={`my-4 ${displayMode ? 'text-center' : 'inline-block'}`}>
      <div 
        className={`${displayMode ? 'text-2xl p-4 bg-blue-50 dark:bg-gray-800 rounded-lg' : ''} dark:[&_.katex]:!text-gray-100`}
        dangerouslySetInnerHTML={{ __html: html }} 
      />
      {note && (
        <p className="text-sm text-gray-600 dark:text-gray-400 italic mt-2">{note}</p>
      )}
    </div>
  )
}

function CalloutBlockComponent({ variant, title, content }: CalloutBlockData) {
  const icons = {
    info: <Info className="h-5 w-5" />,
    warning: <AlertTriangle className="h-5 w-5" />,
    tip: <Lightbulb className="h-5 w-5" />,
  }

  const variants = {
    info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/18 dark:border-blue-600 dark:text-blue-200',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/18 dark:border-yellow-600 dark:text-yellow-200',
    tip: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/18 dark:border-green-600 dark:text-green-200',
  }

  return (
    <Alert className={`my-4 ${variants[variant]}`}>
      <div className="flex gap-2">
        {icons[variant]}
        <div className="flex-1">
          {title && <AlertTitle className="mb-2">{title}</AlertTitle>}
          <AlertDescription>
            <div className="prose prose-sm max-w-none whitespace-pre-wrap">
              {renderLexicalContent(content)}
            </div>
          </AlertDescription>
        </div>
      </div>
    </Alert>
  )
}

function ImageBlockComponent({ image, caption, align, width }: ImageBlockData) {
  const imageUrl = typeof image === 'object' && image !== null && 'filename' in image
    ? `/api/media/serve/${encodeURIComponent(image.filename)}`
    : typeof image === 'string'
    ? image
    : ''

  const imageAlt = typeof image === 'object' && image !== null && 'alt' in image
    ? image.alt || 'Image'
    : 'Image'

  const widthMap = {
    sm: 'max-w-sm', // 384px
    md: 'max-w-2xl', // 672px
    lg: 'max-w-4xl', // 896px
    full: 'w-full',
  }

  const alignMap = {
    left: 'mr-auto',
    center: 'mx-auto',
    right: 'ml-auto',
  }

  if (!imageUrl) return null

  return (
    <figure className={`my-6 ${widthMap[width]} ${alignMap[align]}`}>
      <div className="relative w-full">
        <Image
          src={imageUrl}
          alt={imageAlt}
          width={1200}
          height={800}
          unoptimized
          sizes="100vw"
          className="w-full h-auto rounded-lg shadow-md"
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function TextBlockComponent({ content }: TextBlockData) {
  return (
    <div className="prose max-w-none my-4 whitespace-pre-wrap">
      {renderLexicalContent(content)}
    </div>
  )
}

// ── Table block ────────────────────────────────────────────────────────────

function TableBlockComponent({ caption, hasHeaders = true, headers = [], rows = [] }: TableBlockData) {
  if (rows.length === 0 && headers.length === 0) return null

  const colCount = headers.length || (rows[0]?.length ?? 0)

  // Normalise – pad short rows so every row has exactly colCount cells
  const normalisedRows = rows.map((row) => {
    if (row.length >= colCount) return row
    return [...row, ...Array(colCount - row.length).fill('')]
  })

  return (
    <figure className="my-6">
      {caption && (
        <figcaption className="mb-2 text-sm text-center font-medium text-muted-foreground italic">
          {caption}
        </figcaption>
      )}

      {/* Responsive scrollable wrapper */}
      <div className="w-full overflow-x-auto rounded-lg border border-border shadow-sm">
        <table className="w-full border-collapse text-sm">
          {hasHeaders && headers.length > 0 && (
            <thead>
              <tr className="bg-muted/70 dark:bg-muted/40">
                {headers.map((header, colIdx) => (
                  <th
                    key={colIdx}
                    scope="col"
                    className="
                      px-4 py-3
                      text-left font-semibold
                      text-foreground/90 dark:text-foreground
                      whitespace-normal break-words
                      border-b-2 border-border
                      first:rounded-tl-lg last:rounded-tr-lg
                    "
                  >
                    {header}
                  </th>
                ))}
              </tr>
            </thead>
          )}

          <tbody>
            {normalisedRows.map((row, rowIdx) => (
              <tr
                key={rowIdx}
                className="
                  border-t border-border
                  odd:bg-background even:bg-muted/20
                  dark:odd:bg-background dark:even:bg-muted/10
                  hover:bg-primary/5 dark:hover:bg-primary/10
                  transition-colors duration-100
                "
              >
                {row.map((cell, colIdx) => (
                  <td
                    key={colIdx}
                    className="
                      px-4 py-3
                      text-foreground dark:text-foreground
                      whitespace-normal break-words
                      align-top
                      border-r border-border last:border-r-0
                    "
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </figure>
  )
}

function VideoBlockComponent({ videoUrl, provider, title, caption, aspectRatio }: VideoBlockData) {
  const resolvedProvider = provider || 'YOUTUBE'
  // Convert URL to embed format
  const getEmbedUrl = (url: string, provider: string): string => {
    try {
      if (provider === 'YOUTUBE') {
        // Handle various YouTube URL formats
        if (url.includes('youtube.com/watch')) {
          const videoId = new URL(url).searchParams.get('v')
          return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url
        } else if (url.includes('youtu.be/')) {
          const videoId = url.split('youtu.be/')[1]?.split('?')[0]
          return videoId ? `https://www.youtube-nocookie.com/embed/${videoId}` : url
        }
      } else if (provider === 'VIMEO') {
        // Handle Vimeo URLs
        const vimeoId = url.match(/vimeo\.com\/(\d+)/)?.[1]
        return vimeoId ? `https://player.vimeo.com/video/${vimeoId}` : url
      }
      return url
    } catch {
      return url
    }
  }

  const embedUrl = getEmbedUrl(videoUrl, resolvedProvider)
  const aspectPaddingClass = aspectRatio === '4:3' ? 'pb-[75%]' : 'pb-[56.25%]' // 16:9 default

  // Security: only allow embeds from trusted domains
  const isAllowedDomain = 
    embedUrl.includes('youtube-nocookie.com') || 
    embedUrl.includes('youtube.com') || 
    embedUrl.includes('player.vimeo.com')

  if (resolvedProvider === 'OTHER' && !isAllowedDomain) {
    return (
      <div className="my-6 p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
        <p className="text-sm font-medium text-yellow-800 mb-2">⚠️ External video</p>
        <p className="text-sm text-gray-700 mb-3">
          For security reasons, we cannot embed content from this domain.
          Use the link below to watch the video:
        </p>
        <a 
          href={videoUrl} 
          target="_blank" 
          rel="noopener noreferrer" 
          className="text-blue-600 hover:underline text-sm font-medium"
        >
          {title || 'Open video in a new tab →'}
        </a>
      </div>
    )
  }

  return (
    <figure className="my-6">
      {title && (
        <figcaption className="mb-2 text-lg font-semibold text-blue-900">
          {title}
        </figcaption>
      )}
      <div className="relative w-full overflow-hidden rounded-lg block-bg" style={{ paddingBottom: aspectPaddingClass.includes('75') ? '75%' : '56.25%' }}>
        <iframe
          src={embedUrl}
          className="absolute top-0 left-0 w-full h-full border-0"
          allowFullScreen
          allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
          title={title || 'Video'}
        />
      </div>
      {caption && (
        <figcaption className="mt-2 text-sm text-center text-gray-600 italic">
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export function TheoryBlocksRenderer({ blocks }: TheoryBlocksRendererProps) {
  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-gray-500 italic py-4">
        No theory content yet
      </div>
    )
  }

  return (
    <div className="space-y-4">
      {blocks.map((block, index) => {
        const typedBlock = block as TheoryBlock
        switch (typedBlock.blockType) {
          case 'text':
            return <TextBlockComponent key={index} {...typedBlock} />
          case 'image':
            return <ImageBlockComponent key={index} {...typedBlock} />
          case 'math':
            return <MathBlockComponent key={index} {...typedBlock} />
          case 'callout':
            return <CalloutBlockComponent key={index} {...typedBlock} />
          case 'video':
            return <VideoBlockComponent key={index} {...typedBlock} />
          case 'table':
            return <TableBlockComponent key={index} {...(typedBlock as TableBlockData)} />
          default:
            return null
        }
      })}
    </div>
  )
}

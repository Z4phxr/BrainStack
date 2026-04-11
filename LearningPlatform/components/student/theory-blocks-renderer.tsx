'use client'

import katex from 'katex'
import 'katex/dist/katex.min.css'
import { Alert, AlertTitle } from '@/components/ui/alert'
import { Info, AlertTriangle, Lightbulb } from 'lucide-react'
import Image from 'next/image'
import { cn } from '@/lib/utils'
import type { LessonTheoryTextSize } from '@/lib/lesson-theory-text-size'
import { lessonTheorySizeClasses, useLessonTheoryTextSize } from '@/lib/lesson-theory-text-size'
import { LexicalRichText } from '@/components/student/lexical-rich-text'
import { TheoryMarkdown } from '@/components/student/markdown-theory-body'
import { tableToGFMMarkdown } from '@/lib/lexical-to-markdown'

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

function MathBlockComponent({
  latex,
  displayMode,
  note,
  mathDisplayClass,
  mathNoteClass,
  mathInlineClass,
}: {
  latex: string
  displayMode: boolean
  note?: string
  mathDisplayClass: string
  mathNoteClass: string
  mathInlineClass: string
}) {
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
    <div className={cn('my-4', displayMode ? 'text-center' : 'inline-block')}>
      <div
        className={cn(
          displayMode && cn('p-4 bg-blue-50 dark:bg-gray-800 rounded-lg', mathDisplayClass),
          !displayMode && cn(mathInlineClass, 'dark:[&_.katex]:!text-gray-100'),
          displayMode && 'dark:[&_.katex]:!text-gray-100',
        )}
        dangerouslySetInnerHTML={{ __html: html }}
      />
      {note && <p className={mathNoteClass}>{note}</p>}
    </div>
  )
}

function CalloutBlockComponent({
  variant,
  title,
  content,
  tier,
}: CalloutBlockData & { tier: LessonTheoryTextSize }) {
  const sc = lessonTheorySizeClasses(tier)

  const variants = {
    info: 'border-blue-500 bg-blue-50 text-blue-900 dark:bg-blue-900/18 dark:border-blue-600 dark:text-blue-200',
    warning: 'border-yellow-500 bg-yellow-50 text-yellow-900 dark:bg-yellow-900/18 dark:border-yellow-600 dark:text-yellow-200',
    tip: 'border-green-500 bg-green-50 text-green-900 dark:bg-green-900/18 dark:border-green-600 dark:text-green-200',
  }

  const iconClass = cn('shrink-0', sc.calloutIcon)
  const icons = {
    info: <Info className={iconClass} />,
    warning: <AlertTriangle className={iconClass} />,
    tip: <Lightbulb className={iconClass} />,
  }

  return (
    <Alert className={cn('my-4 text-foreground [&>svg]:hidden', variants[variant])}>
      <div className="flex gap-3">
        {icons[variant]}
        <div className="min-w-0 flex-1">
          {title && <AlertTitle className={cn('mb-2 leading-snug', sc.calloutTitle)}>{title}</AlertTitle>}
          <div className={cn('min-w-0 max-w-none [&_p]:mb-2 [&_p:last-child]:mb-0', sc.callout)}>
            <LexicalRichText content={content} tier={tier} className="min-w-0 max-w-none" />
          </div>
        </div>
      </div>
    </Alert>
  )
}

function ImageBlockComponent({
  image,
  caption,
  align,
  width,
  captionClass,
}: ImageBlockData & { captionClass: string }) {
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
        <figcaption className={cn('mt-2 text-center text-gray-600 dark:text-gray-400 italic', captionClass)}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

function TextBlockComponent({
  content,
  tier,
}: TextBlockData & { tier: LessonTheoryTextSize }) {
  return (
    <div className="mb-4 min-w-0 max-w-none last:mb-0">
      <LexicalRichText content={content} tier={tier} />
    </div>
  )
}

// ── Table block ────────────────────────────────────────────────────────────

function TableBlockComponent({
  caption,
  hasHeaders = true,
  headers = [],
  rows = [],
  tier,
}: TableBlockData & { tier: LessonTheoryTextSize }) {
  if (rows.length === 0 && headers.length === 0) return null

  const colCount = headers.length || (rows[0]?.length ?? 0)

  const normalisedRows = rows.map((row) => {
    if (row.length >= colCount) return row
    return [...row, ...Array(colCount - row.length).fill('')]
  })

  const md = tableToGFMMarkdown(caption, hasHeaders, headers, normalisedRows)
  if (!md.trim()) return null

  return (
    <figure className="my-6 min-w-0">
      <TheoryMarkdown markdown={md} tier={tier} className="min-w-0" />
    </figure>
  )
}

function VideoBlockComponent({
  videoUrl,
  provider,
  title,
  caption,
  aspectRatio,
  captionClass,
  videoTitleClass,
}: VideoBlockData & { captionClass: string; videoTitleClass: string }) {
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
        <figcaption className={cn('mb-2 font-semibold text-blue-900 dark:text-blue-200', videoTitleClass)}>
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
        <figcaption className={cn('mt-2 text-center text-gray-600 dark:text-gray-400 italic', captionClass)}>
          {caption}
        </figcaption>
      )}
    </figure>
  )
}

export function TheoryBlocksRenderer({ blocks }: TheoryBlocksRendererProps) {
  const tier = useLessonTheoryTextSize()
  const sc = lessonTheorySizeClasses(tier)

  if (!blocks || blocks.length === 0) {
    return (
      <div className="text-gray-500 italic py-4">
        No theory content yet
      </div>
    )
  }

  return (
    <div className="min-w-0 space-y-4 [&>*:first-child]:mt-0">
      {blocks.map((block, index) => {
        const typedBlock = block as TheoryBlock
        switch (typedBlock.blockType) {
          case 'text':
            return <TextBlockComponent key={index} {...typedBlock} tier={tier} />
          case 'image':
            return <ImageBlockComponent key={index} {...typedBlock} captionClass={sc.imageCaption} />
          case 'math':
            return (
              <MathBlockComponent
                key={index}
                {...typedBlock}
                mathDisplayClass={sc.mathDisplay}
                mathNoteClass={sc.mathNote}
                mathInlineClass={sc.mathInline}
              />
            )
          case 'callout':
            return <CalloutBlockComponent key={index} {...typedBlock} tier={tier} />
          case 'video':
            return (
              <VideoBlockComponent
                key={index}
                {...typedBlock}
                captionClass={sc.imageCaption}
                videoTitleClass={sc.videoTitle}
              />
            )
          case 'table':
            return (
              <TableBlockComponent key={index} {...(typedBlock as TableBlockData)} tier={tier} />
            )
          default:
            return null
        }
      })}
    </div>
  )
}

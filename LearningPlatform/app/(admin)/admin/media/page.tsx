import { getPayload } from 'payload'
import config from '@payload-config'
import { Card, CardContent } from '@/components/ui/card'
import { cn } from '@/lib/utils'
import { adminGlassCard } from '@/lib/student-glass-styles'
import { Badge } from '@/components/ui/badge'
import { Image as ImageIcon, Video, FileText, ExternalLink, ChevronLeft, ChevronRight } from 'lucide-react'
import Link from 'next/link'
import { payloadTableExists } from '@/lib/payload-utils'
import { ReloadButton } from '@/components/ui/reload-button'
import Image from 'next/image'
import { MediaDeleteButton } from '@/components/admin/media-delete-button'
import { MediaDeleteUnusedButton } from '@/components/admin/media-delete-unused-button'
import { MediaUploader } from '@/components/admin/media-uploader'
import {
  getMediaUsageForIds,
  isMediaInUse,
  mediaUsageTotal,
  type MediaUsage,
} from '@/lib/media-usage'

export const dynamic = 'force-dynamic'

const MEDIA_PER_PAGE = 20

interface PageProps {
  searchParams: Promise<{ page?: string }>
}

interface Media {
  id: number | string
  filename: string
  mimeType: string
  alt?: string
  filesize?: number
  createdAt: string
  url: string
}

export default async function AdminMediaPage({ searchParams }: PageProps) {
  const sp = await searchParams
  const requestedPage = Math.max(1, parseInt(sp.page || '1', 10) || 1)

  let media: Media[] = []
  let mediaWithUsage: Array<Media & { usage: MediaUsage }> = []
  let error: string | null = null
  let totalDocs = 0
  let page = requestedPage
  let totalPages = 1

  try {
    const tableExists = await payloadTableExists('media')
    if (!tableExists) {
      error = '⚠️ The database is not initialized. Run migrations: npm run payload:migrate'
    } else {
      const payload = await getPayload({ config })

      let findResult = await payload.find({
        collection: 'media',
        sort: '-createdAt',
        limit: MEDIA_PER_PAGE,
        page: requestedPage,
      })

      totalDocs = typeof findResult.totalDocs === 'number' ? findResult.totalDocs : findResult.docs.length
      totalPages = Math.max(1, Math.ceil(totalDocs / MEDIA_PER_PAGE))
      page = Math.min(requestedPage, totalPages)

      if (page !== requestedPage && totalDocs > 0) {
        findResult = await payload.find({
          collection: 'media',
          sort: '-createdAt',
          limit: MEDIA_PER_PAGE,
          page,
        })
      }

      media = findResult.docs.map((item) => {
        const mediaItem = item as Record<string, unknown>
        return {
          id: mediaItem.id as number | string,
          filename: mediaItem.filename as string,
          mimeType: mediaItem.mimeType as string,
          alt: mediaItem.alt as string | undefined,
          filesize: mediaItem.filesize as number | undefined,
          createdAt: mediaItem.createdAt as string,
          url: mediaItem.url as string,
        }
      })

      const usageMap = await getMediaUsageForIds(media.map((m) => m.id))
      mediaWithUsage = media.map((item: Media) => ({
        ...item,
        usage: usageMap.get(String(item.id)) ?? {
          lessonsCount: 0,
          tasksCount: 0,
          coursesCount: 0,
          flashcardsCount: 0,
          lessonRefs: [],
          taskRefs: [],
          courseRefs: [],
        },
      }))
    }
  } catch (err) {
    console.error('Failed to fetch media:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)

    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      error = '⚠️ The database is not initialized. Run migrations: npm run payload:migrate'
    } else {
      error = 'Unable to load media. Please refresh the page.'
    }
  }

  const formatFileSize = (bytes: number): string => {
    if (bytes < 1024) return `${bytes} B`
    if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`
    return `${(bytes / (1024 * 1024)).toFixed(1)} MB`
  }

  const getMediaType = (mimeType: string): 'image' | 'video' | 'other' => {
    if (mimeType.startsWith('image/')) return 'image'
    if (mimeType.startsWith('video/')) return 'video'
    return 'other'
  }

  const totalUsed = mediaWithUsage.filter((m) => isMediaInUse(m.usage)).length

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-foreground">
      <div className="flex flex-col justify-between gap-4 sm:flex-row sm:items-end">
        <div>
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Media library</h1>
          <p className="mt-2 text-base text-muted-foreground md:text-lg">
            {!error &&
              (totalDocs > 0
                ? `All uploaded files • ${totalDocs.toLocaleString()} total • Page ${page} of ${totalPages} • ${totalUsed} in use on this page`
                : 'All uploaded files')}
          </p>
        </div>
        <div className="flex shrink-0 flex-wrap items-center gap-2">
          <MediaDeleteUnusedButton />
          <MediaUploader />
        </div>
      </div>

      {error ? (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-600 font-medium">{error}</p>
              <ReloadButton />
            </div>
          </CardContent>
        </Card>
      ) : media.length === 0 ? (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <ImageIcon className="mb-4 h-16 w-16 text-muted-foreground" />
              <p className="text-lg font-medium text-foreground mb-2">No media yet</p>
              <p className="text-sm text-muted-foreground">Upload a file from a lesson or task editor.</p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mediaWithUsage.map((item) => {
              const mediaType = getMediaType(item.mimeType)
              const isUsed = isMediaInUse(item.usage)
              const usageTotal = mediaUsageTotal(item.usage)

              return (
                <Card
                  key={item.id}
                  className={cn('overflow-hidden border-0 shadow-none transition-shadow hover:shadow-lg', adminGlassCard)}
                >
                  <a
                    href={`/api/media/serve/${encodeURIComponent(item.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="relative block h-36 w-full overflow-hidden bg-slate-100/80 dark:bg-black/40"
                  >
                    {mediaType === 'image' && (
                      <Image
                        src={`/api/media/serve/${encodeURIComponent(item.filename)}`}
                        alt={item.alt || item.filename}
                        fill
                        unoptimized
                        sizes="(max-width: 1024px) 50vw, 25vw"
                        className="object-cover"
                      />
                    )}
                    {mediaType === 'video' && (
                      <div className="relative w-full h-full bg-black flex items-center justify-center">
                        <Video className="h-12 w-12 text-white opacity-80" />
                      </div>
                    )}
                    {mediaType === 'other' && (
                      <div className="flex flex-col items-center text-muted-foreground">
                        <FileText className="h-16 w-16 mb-2" />
                        <span className="text-xs">{item.mimeType.split('/')[1]?.toUpperCase()}</span>
                      </div>
                    )}

                    <Badge variant="secondary" className="absolute top-2 right-2">
                      {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Other'}
                    </Badge>

                    {isUsed && (
                      <Badge variant="outline" className="absolute top-2 left-2">
                        In use
                      </Badge>
                    )}
                  </a>

                  <CardContent className="p-3 space-y-2 text-foreground">
                    <div>
                      <p className="font-medium truncate text-foreground" title={item.filename}>
                        {item.filename}
                      </p>
                      {item.alt && (
                        <p className="text-xs text-muted-foreground truncate" title={item.alt}>
                          {item.alt}
                        </p>
                      )}
                    </div>

                    <div className="flex items-center justify-between">
                      <span className="text-xs text-muted-foreground">Actions</span>
                      <MediaDeleteButton mediaId={item.id} filename={item.filename} usageCount={usageTotal} />
                    </div>

                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.filesize ? formatFileSize(item.filesize) : 'N/A'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('en-US')}</span>
                    </div>

                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-4 text-sm flex-wrap">
                        {item.usage.lessonsCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            📚 {item.usage.lessonsCount} {item.usage.lessonsCount === 1 ? 'lesson' : 'lessons'}
                          </Badge>
                        )}
                        {item.usage.tasksCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            ❓ {item.usage.tasksCount} {item.usage.tasksCount === 1 ? 'task' : 'tasks'}
                          </Badge>
                        )}
                        {item.usage.coursesCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            🎓 {item.usage.coursesCount}{' '}
                            {item.usage.coursesCount === 1 ? 'course cover' : 'course covers'}
                          </Badge>
                        )}
                        {item.usage.flashcardsCount > 0 && (
                          <Badge variant="outline" className="text-xs">
                            🃏 {item.usage.flashcardsCount}{' '}
                            {item.usage.flashcardsCount === 1 ? 'flashcard' : 'flashcards'}
                          </Badge>
                        )}
                        {!isUsed && (
                          <Badge variant="secondary" className="text-xs text-muted-foreground">
                            Unused
                          </Badge>
                        )}
                      </div>

                      {(item.usage.lessonRefs.length > 0 ||
                        item.usage.taskRefs.length > 0 ||
                        item.usage.courseRefs.length > 0) && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Used in:</p>

                          {item.usage.courseRefs.map((ref) => (
                            <Link
                              key={`course-${ref.id}`}
                              href={`/admin/courses/${ref.id}/edit`}
                              className="flex items-center gap-2 text-xs text-foreground hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate">Course cover: {ref.title}</span>
                            </Link>
                          ))}

                          {item.usage.lessonRefs.map((ref) => (
                            <Link
                              key={`lesson-${ref.id}`}
                              href={`/admin/lessons/${ref.id}/builder`}
                              className="flex items-center gap-2 text-xs text-foreground hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate">{ref.title}</span>
                            </Link>
                          ))}

                          {item.usage.taskRefs.map((ref) => (
                            <Link
                              key={`task-${ref.id}`}
                              href={`/admin/lessons/${ref.lessonId}/builder`}
                              className="flex items-center gap-2 text-xs text-foreground hover:underline"
                            >
                              <ExternalLink className="h-3 w-3" />
                              <span className="truncate">Task in: {ref.lessonTitle}</span>
                            </Link>
                          ))}

                          {usageTotal > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              ...and {usageTotal - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {totalPages > 1 && (
            <nav
              className="flex flex-wrap items-center justify-center gap-2 py-4"
              aria-label="Media library pagination"
            >
              {page <= 1 ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </span>
              ) : (
                <Link
                  href={`/admin/media?page=${page - 1}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  <ChevronLeft className="h-4 w-4" />
                  Previous
                </Link>
              )}
              <span className="px-3 text-sm text-muted-foreground">
                Page {page} of {totalPages}
              </span>
              {page >= totalPages ? (
                <span className="inline-flex items-center gap-1 rounded-md border border-transparent px-3 py-2 text-sm font-medium text-muted-foreground opacity-50">
                  Next
                  <ChevronRight className="h-4 w-4" />
                </span>
              ) : (
                <Link
                  href={`/admin/media?page=${page + 1}`}
                  className="inline-flex items-center gap-1 rounded-md border border-border bg-background px-3 py-2 text-sm font-medium transition-colors hover:bg-accent hover:text-accent-foreground"
                >
                  Next
                  <ChevronRight className="h-4 w-4" />
                </Link>
              )}
            </nav>
          )}

          <div className="text-sm text-muted-foreground text-center py-6 border-t">
            <p className="mb-2 text-xs uppercase tracking-wide text-muted-foreground/80">
              {totalDocs > MEDIA_PER_PAGE ? 'This page' : 'Library'}
            </p>
            <div className="flex flex-wrap items-center justify-center gap-8">
              <div>
                <span className="font-semibold text-foreground">{media.length}</span>
                <span className="ml-1">shown</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div>
                <span className="font-semibold text-foreground">
                  {media.filter((m) => m.mimeType.startsWith('image/')).length}
                </span>
                <span className="ml-1">images</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div>
                <span className="font-semibold text-foreground">
                  {media.filter((m) => m.mimeType.startsWith('video/')).length}
                </span>
                <span className="ml-1">videos</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div>
                <span className="font-semibold text-foreground">{totalUsed}</span>
                <span className="ml-1">in use</span>
              </div>
            </div>
          </div>
        </>
      )}
    </div>
  )
}

import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Card, CardContent } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Image as ImageIcon, Video, FileText, ExternalLink } from 'lucide-react'
import Link from 'next/link'
import { payloadTableExists } from '@/lib/payload-utils'
import { ReloadButton } from '@/components/ui/reload-button'
import Image from 'next/image'
import { MediaDeleteButton } from '@/components/admin/media-delete-button'
import { MediaUploader } from '@/components/admin/media-uploader'

export const dynamic = 'force-dynamic'

interface Media {
  id: number | string
  filename: string
  mimeType: string
  alt?: string
  filesize?: number
  createdAt: string
  url: string
}

interface MediaUsage {
  lessonsCount: number
  tasksCount: number
  lessonRefs: Array<{ id: number; title: string }>
  taskRefs: Array<{ id: number; lessonId: number; lessonTitle: string }>
}

type LessonDoc = {
  id: number
  title: string
  theoryBlocks?: Array<Record<string, unknown>>
}

// PERFORMANCE: Cache the two heavy collection scans (1000 lessons + 5000 tasks).
// These don't change on every page load — revalidate every 30 s is plenty.
const getCachedLessonsAndTasks = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const [lessonsResult, tasksResult] = await Promise.all([
      payload.find({ collection: 'lessons', limit: 1000, depth: 0 }),
      payload.find({ collection: 'tasks',   limit: 5000, depth: 1 }),
    ])
    return { lessons: lessonsResult.docs, tasks: tasksResult.docs }
  },
  ['admin-media-usage-data'],
  { revalidate: 30 },
)

// PERFORMANCE FIX: Build usage map for ALL media at once (not per-item)
// This prevents fetching 1000 lessons × 100 media = 100,000 fetches!
async function getAllMediaUsage(mediaIds: Array<number | string>): Promise<Map<string, MediaUsage>> {
  const usageMap = new Map<string, MediaUsage>()
  
  // Initialize all media with zero usage
  for (const id of mediaIds) {
    usageMap.set(String(id), {
      lessonsCount: 0,
      tasksCount: 0,
      lessonRefs: [],
      taskRefs: [],
    })
  }

  // Use the cached fetch — avoids re-querying 1000 lessons + 5000 tasks on every page render
  const { lessons, tasks } = await getCachedLessonsAndTasks()
  
  // Build lesson usage map
  for (const lesson of lessons as LessonDoc[]) {
    if (lesson.theoryBlocks && Array.isArray(lesson.theoryBlocks)) {
      for (const block of lesson.theoryBlocks) {
        const typedBlock = block as { blockType?: string; image?: number | { id?: number } | string }
        if (typedBlock.blockType === 'image') {
          const imageId = typeof typedBlock.image === 'number'
            ? String(typedBlock.image)
            : typeof typedBlock.image === 'string'
            ? typedBlock.image
            : String(typedBlock.image?.id)
          
          const usage = usageMap.get(imageId)
          if (usage) {
            usage.lessonsCount++
            if (usage.lessonRefs.length < 3) {
              usage.lessonRefs.push({
                id: lesson.id as number,
                title: lesson.title,
              })
            }
          }
        }
      }
    }
  }
  
  // Build task usage map
  for (const task of tasks) {
    const taskItem = task as Record<string, unknown>
    const questionMediaId = String(taskItem.questionMedia ?? '')
    const solutionMediaId = String(taskItem.solutionMedia ?? '')
    const lessonValue = taskItem.lesson as { id?: number; title?: string } | number | undefined
    
    const taskRef = {
      id: taskItem.id as number,
      lessonId: typeof lessonValue === 'number' ? lessonValue : lessonValue?.id ?? 0,
      lessonTitle: typeof lessonValue === 'object' ? lessonValue?.title ?? 'Untitled' : 'Untitled',
    }
    
    if (questionMediaId && usageMap.has(questionMediaId)) {
      const usage = usageMap.get(questionMediaId)!
      usage.tasksCount++
      if (usage.taskRefs.length < 3) {
        usage.taskRefs.push(taskRef)
      }
    }
    
    if (solutionMediaId && solutionMediaId !== questionMediaId && usageMap.has(solutionMediaId)) {
      const usage = usageMap.get(solutionMediaId)!
      usage.tasksCount++
      if (usage.taskRefs.length < 3) {
        usage.taskRefs.push(taskRef)
      }
    }
  }
  
  return usageMap
}

export default async function AdminMediaPage() {
  let media: Media[] = []
  let mediaWithUsage: Array<Media & { usage: MediaUsage }> = []
  let error: string | null = null

  try {
    // Check if table exists before querying
    const tableExists = await payloadTableExists('media')
    if (!tableExists) {
      error = '⚠️ The database is not initialized. Run migrations: npm run payload:migrate'
    } else {
      const payload = await getPayload({ config })

      const { docs: mediaData } = await payload.find({
        collection: 'media',
        sort: '-createdAt',
        limit: 100,
      })

      // Cast to proper Media type
      media = mediaData.map((item) => {
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

      // PERFORMANCE FIX: Get usage stats for ALL media at once (not per-item)
      // This reduces: 100 queries × 1000 lessons = 100,000 fetches → just 2 queries total!
      const usageMap = await getAllMediaUsage(media.map(m => m.id))
      mediaWithUsage = media.map((item: Media) => ({
        ...item,
        usage: usageMap.get(String(item.id)) || {
          lessonsCount: 0,
          tasksCount: 0,
          lessonRefs: [],
          taskRefs: [],
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

  const totalUsed = mediaWithUsage.filter(m => 
    m.usage.lessonsCount > 0 || m.usage.tasksCount > 0
  ).length

  return (
    <div className="space-y-6 text-foreground">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-foreground">Media library</h1>
          <p className="text-muted-foreground mt-1">
            {!error && `All uploaded files • ${totalUsed} of ${media.length} in use`}
          </p>
        </div>
        <div className="flex items-center">
          <MediaUploader />
        </div>
      </div>

      {error ? (
        <Card>
          <CardContent className="py-12">
            <div className="text-center space-y-4">
              <p className="text-red-600 font-medium">{error}</p>
              <ReloadButton />
            </div>
          </CardContent>
        </Card>
      ) : media.length === 0 ? (
        <Card>
          <CardContent className="py-12">
            <div className="flex flex-col items-center text-center">
              <ImageIcon className="h-16 w-16 text-muted-foreground mb-4" />
              <p className="text-lg font-medium text-foreground mb-2">
                No media yet
              </p>
              <p className="text-sm text-muted-foreground">
                Upload a file from a lesson or task editor.
              </p>
            </div>
          </CardContent>
        </Card>
      ) : (
        <>
          <div className="grid grid-cols-2 md:grid-cols-4 gap-6">
            {mediaWithUsage.map((item) => {
              const mediaType = getMediaType(item.mimeType)
              const isUsed = item.usage.lessonsCount > 0 || item.usage.tasksCount > 0

              return (
                <Card key={item.id} className="overflow-hidden hover:shadow-lg transition-shadow block-contrast">
                  {/* Preview */}
                  <a
                    href={`/api/media/serve/${encodeURIComponent(item.filename)}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="block relative h-36 w-full overflow-hidden block-bg"
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
                    
                    {/* Type badge */}
                    <Badge
                      variant="secondary"
                      className="absolute top-2 right-2"
                    >
                      {mediaType === 'image' ? 'Image' : mediaType === 'video' ? 'Video' : 'Other'}
                    </Badge>

                    {/* Usage badge */}
                    {isUsed && (
                        <Badge
                          variant="outline"
                          className="absolute top-2 left-2"
                        >
                          In use
                        </Badge>
                    )}
                  </a>

                  <CardContent className="p-3 space-y-2 text-foreground">
                    {/* Filename */}
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
                      <MediaDeleteButton
                        mediaId={item.id}
                        filename={item.filename}
                        usageCount={item.usage.lessonsCount + item.usage.tasksCount}
                      />
                    </div>

                    {/* File info */}
                    <div className="flex items-center justify-between text-xs text-muted-foreground">
                      <span>{item.filesize ? formatFileSize(item.filesize) : 'N/A'}</span>
                      <span>{new Date(item.createdAt).toLocaleDateString('en-US')}</span>
                    </div>

                    {/* Usage info */}
                    <div className="pt-3 border-t space-y-2">
                      <div className="flex items-center gap-4 text-sm">
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
                        {!isUsed && (
                          <Badge variant="secondary" className="text-xs text-muted-foreground">
                            Unused
                          </Badge>
                        )}
                      </div>

                      {/* References */}
                      {(item.usage.lessonRefs.length > 0 || item.usage.taskRefs.length > 0) && (
                        <div className="space-y-1">
                          <p className="text-xs font-medium text-foreground">Used in:</p>
                          
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

                          {item.usage.lessonsCount + item.usage.tasksCount > 3 && (
                            <p className="text-xs text-muted-foreground italic">
                              ...and {item.usage.lessonsCount + item.usage.tasksCount - 3} more
                            </p>
                          )}
                        </div>
                      )}
                    </div>

                    {/* click the preview to open the media in a new tab */}
                  </CardContent>
                </Card>
              )
            })}
          </div>

          {/* Summary */}
          <div className="text-sm text-muted-foreground text-center py-6 border-t">
            <div className="flex items-center justify-center gap-8">
              <div>
                <span className="font-semibold text-foreground">{media.length}</span>
                <span className="ml-1">total</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div>
                <span className="font-semibold text-foreground">{media.filter(m => m.mimeType.startsWith('image/')).length}</span>
                <span className="ml-1">images</span>
              </div>
              <div className="h-4 w-px bg-[var(--border)]" />
              <div>
                <span className="font-semibold text-foreground">{media.filter(m => m.mimeType.startsWith('video/')).length}</span>
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

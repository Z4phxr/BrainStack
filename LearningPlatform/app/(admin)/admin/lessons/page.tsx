import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Card, CardContent, CardHeader } from '@/components/ui/card'
import Link from 'next/link'
import { cn } from '@/lib/utils'
import { adminGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import { payloadTableExists } from '@/lib/payload-utils'
import { ReloadButton } from '@/components/ui/reload-button'
import { LessonActions } from '@/components/admin/lesson-actions'

export const dynamic = 'force-dynamic'

// Cache the lessons list for 20 s — avoids re-querying Payload on every navigation
const getCachedLessons = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const result = await payload.find({
      collection: 'lessons',
      sort: '-createdAt',
      limit: 200,
      depth: 1,
    })
    return result.docs
  },
  ['admin-lessons-list'],
  { revalidate: 20 },
)

interface LessonSummary {
  id: string | number
  title: string
  createdAt: string
  updatedAt?: string | null
  isPublished: boolean
  lastUpdatedBy?: string | null
  course?: unknown
  module?: unknown
}

interface CourseSummary {
  id?: string | number
  title?: string
}

interface ModuleSummary {
  id?: string | number
  title?: string
}

function isCourse(v: unknown): v is CourseSummary {
  return typeof v === 'object' && v !== null && 'title' in (v as Record<string, unknown>)
}

function isModule(v: unknown): v is ModuleSummary {
  return typeof v === 'object' && v !== null && 'title' in (v as Record<string, unknown>)
}

export default async function AdminLessonsPage() {
  let lessons: LessonSummary[] = []
  let error: string | null = null

  try {
    // Check if Payload tables exist before querying
    const tableExists = await payloadTableExists('lessons')
    if (!tableExists) {
      error = 'The database is not initialized. Run migrations: npm run payload:migrate'
    } else {
      lessons = (await getCachedLessons()) as LessonSummary[]
    }
  } catch (err) {
    console.error('Failed to fetch lessons:', err)
    const errorMessage = err instanceof Error ? err.message : String(err)
    
    if (errorMessage.includes('relation') && errorMessage.includes('does not exist')) {
      error = '⚠️ The database is not initialized. Run migrations: npm run payload:migrate'
    } else {
      error = 'Unable to load lessons. Please refresh the page.'
    }
  }

  return (
    <div className="mx-auto max-w-6xl space-y-8 text-foreground">
      <div>
        <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Lessons</h1>
        <p className="mt-2 text-base text-muted-foreground md:text-lg">All lessons in the system</p>
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
      ) : lessons.length === 0 ? (
        <Card className={cn('border-0 shadow-none', adminGlassCard)}>
          <CardContent className="py-12">
            <p className="text-center text-muted-foreground">
              No lessons yet. Create a course and add lessons.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="space-y-3">
          {lessons.map((lesson) => {
            const course = isCourse(lesson.course) ? lesson.course : null
            const courseModule = isModule(lesson.module) ? lesson.module : null
            
            return (
                <Card
                  key={lesson.id}
                  className={cn('overflow-hidden border-0 shadow-none transition-shadow hover:shadow-md', adminGlassCard)}
                >
                <CardHeader className="py-4">
                  <div className="flex items-center justify-between">
                    <div className="flex-1">
                      <div className="mb-2 flex items-center gap-3">
                        <h3 className="text-lg font-semibold text-foreground">{lesson.title}</h3>
                        <span
                          className={cn(
                            studentGlassPill,
                            lesson.isPublished ? 'text-emerald-800 dark:text-emerald-200' : 'opacity-90',
                          )}
                        >
                          {lesson.isPublished ? 'Published' : 'Draft'}
                        </span>
                      </div>
                      
                      <div className="flex items-center gap-4 text-sm text-muted-foreground">
                        {course && (
                          <span className="flex items-center gap-1">
                            <strong>Course:</strong> {course.title}
                          </span>
                        )}
                        {courseModule && (
                          <span className="flex items-center gap-1">
                            <strong>Module:</strong> {courseModule.title}
                          </span>
                        )}
                      </div>

                      <div className="flex items-center gap-4 mt-2 text-xs text-muted-foreground">
                        <span>Created: {new Date(lesson.createdAt).toLocaleDateString('en-US')}</span>
                        {lesson.updatedAt && (
                          <span>Updated: {new Date(lesson.updatedAt).toLocaleDateString('en-US')}</span>
                        )}
                        <span>
                          Updated by: {lesson.lastUpdatedBy || 'Unknown'}
                        </span>
                      </div>
                    </div>

                    <LessonActions
                      lessonId={lesson.id}
                      lessonTitle={lesson.title}
                      isPublished={lesson.isPublished}
                    />
                  </div>
                </CardHeader>
              </Card>
            )
          })}
        </div>
      )}

      <div className="text-sm text-muted-foreground text-center py-4">
        Total: <strong className="text-foreground">{lessons.length}</strong> {lessons.length === 1 ? 'lesson' : 'lessons'}
      </div>
    </div>
  )
}

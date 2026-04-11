import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import { TheoryBlocksRenderer } from '@/components/student/theory-blocks-renderer'
import { LessonLegacyContent } from '@/components/student/lesson-legacy-content'
import { TaskCard } from '@/components/student/task-card'
import { auth } from '@/auth'
import { updateLesson } from '@/app/(admin)/admin/actions'
import { revalidatePath } from 'next/cache'
import { prisma } from '@/lib/prisma'
import { markLessonComplete } from '@/app/actions/progress'
import { lessonWithPopulatedTheoryImages } from '@/lib/populate-lesson-theory-images'

export default async function LessonPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string; lessonId: string }>
  searchParams?: Promise<{ preview?: string }>
}) {
  const { slug, lessonId } = await params
  const { preview } = (await searchParams) ?? {}
  const isPreview = preview === '1'
  const payload = await getPayload({ config })

  async function togglePublishAction(formData: FormData) {
    'use server'
    const nextState = formData.get('nextState')
    const targetLessonId = formData.get('lessonId')
    const targetSlug = formData.get('slug')
    if (typeof nextState !== 'string' || typeof targetLessonId !== 'string' || typeof targetSlug !== 'string') {
      return
    }
    await updateLesson(targetLessonId, { isPublished: nextState === 'true' })
    revalidatePath(`/courses/${targetSlug}/lessons/${targetLessonId}`)
  }

  async function markCompleteAction() {
    'use server'
    await markLessonComplete(lessonId, slug)
  }

  // ─── Batch 1: auth + lesson in parallel ─────────────────────────────────────
  const [session, lessonRaw] = await Promise.all([
    auth(),
    payload.findByID({ collection: 'lessons', id: lessonId, depth: 2 }).catch(() => null),
  ])

  const lesson = lessonRaw
    ? await lessonWithPopulatedTheoryImages(lessonRaw, payload)
    : null

  const isAdmin = session?.user?.role === 'ADMIN'

  if (!lesson) notFound()
  if (!lesson.isPublished && !isAdmin) notFound()

  // Extract IDs from relationships (can be objects or IDs)
  const courseId = typeof lesson.course === 'object' ? lesson.course.id : lesson.course
  const moduleId = typeof lesson.module === 'object' ? lesson.module.id : lesson.module
  const navFilter = isAdmin && isPreview ? {} : { isPublished: { equals: true } }

  // ─── Batch 2: all secondary queries in parallel ──────────────────────────────
  // depth:1 on tasks auto-populates questionMedia + solutionMedia — eliminates N+1!
  const [course, courseModule, tasksResult, modulesForNav, allLessonsForNav] = await Promise.all([
    payload.findByID({ collection: 'courses', id: String(courseId) }).catch(() => null),
    payload.findByID({ collection: 'modules', id: String(moduleId) }).catch(() => null),
    payload.find({
      collection: 'tasks',
      where: { lesson: { equals: lessonId } },
      sort: 'order',
      depth: 1,
    }),
    payload.find({
      collection: 'modules',
      where: { course: { equals: courseId }, ...navFilter } as any,
      sort: 'order',
      depth: 0,
      limit: 1000,
    }),
    payload.find({
      collection: 'lessons',
      where: { course: { equals: courseId }, ...navFilter } as any,
      depth: 0,
      limit: 2000,
    }),
  ])

  if (!isAdmin && (!course || !course.isPublished || !courseModule || !courseModule.isPublished)) {
    notFound()
  }

  const tasks = tasksResult.docs
  const modules = modulesForNav.docs
  const allLessons = allLessonsForNav.docs

  // ─── Batch 3: progress queries in parallel (students only) ───────────────────
  const taskProgressMap = new Map<string, any>()
  let lessonProgress = null

  if (session?.user?.id && !isAdmin) {
    const taskIds = tasks.map((t: any) => String(t.id))
    const [taskProgressRecords, lessonProgressRecord] = await Promise.all([
      prisma.taskProgress.findMany({
        where: { userId: session.user.id, taskId: { in: taskIds } },
      }),
      prisma.lessonProgress.findUnique({
        where: { userId_lessonId: { userId: session.user.id, lessonId } },
      }),
    ])
    taskProgressRecords.forEach((tp) => taskProgressMap.set(tp.taskId, tp))
    lessonProgress = lessonProgressRecord
  }

  const hasNoTasks = tasks.length === 0
  const isLessonCompleted = lessonProgress?.status === 'COMPLETED'

  const moduleIndex = new Map<string, number>()
  modules.forEach((m: any, i: number) => moduleIndex.set(String(m.id), i))

  const orderedLessons = [...allLessons].sort((a: any, b: any) => {
    const aModule = typeof a.module === 'object' ? String(a.module.id) : String(a.module)
    const bModule = typeof b.module === 'object' ? String(b.module.id) : String(b.module)
    const aModuleOrder = moduleIndex.has(aModule) ? moduleIndex.get(aModule)! : 0
    const bModuleOrder = moduleIndex.has(bModule) ? moduleIndex.get(bModule)! : 0
    if (aModuleOrder !== bModuleOrder) return aModuleOrder - bModuleOrder
    const aOrder = (a.order ?? 0) - (b.order ?? 0)
    return aOrder
  })

  const currentIndex = orderedLessons.findIndex((l: any) => String(l.id) === String(lessonId))
  const prevLesson = currentIndex > 0 ? orderedLessons[currentIndex - 1] : null
  const nextLesson = currentIndex >= 0 && currentIndex < orderedLessons.length - 1 ? orderedLessons[currentIndex + 1] : null
  return (
    <div className="container mx-auto max-w-7xl px-5 py-8 sm:px-8">
      {/* Breadcrumb */}
      <div className="mb-6 text-sm text-muted-foreground">
            <Link href="/courses" className="hover:text-primary">Courses</Link>
        {' / '}
            <Link href={`/courses/${slug}`} className="hover:text-primary">
              {course?.title}
        </Link>
        {' / '}
            <span className="text-foreground">{lesson.title}</span>
      </div>

      {/* Lesson Header */}
      <div className="mb-8">
        <h1 className="text-4xl font-bold text-foreground mb-4">{lesson.title}</h1>
        {courseModule && (
          <Badge variant="outline" className="text-sm">
            {courseModule.title}
          </Badge>
        )}
        {isAdmin && isPreview && (
          <div className="mt-4 flex flex-wrap gap-2">
            <Link href={`/admin/lessons/${lessonId}/builder`}>
              <Button variant="outline">Back to editor</Button>
            </Link>
            <form action={togglePublishAction}>
              <input type="hidden" name="lessonId" value={lessonId} />
              <input type="hidden" name="slug" value={slug} />
              <input type="hidden" name="nextState" value={lesson.isPublished ? 'false' : 'true'} />
              <Button type="submit">
                {lesson.isPublished ? 'Hide' : 'Publish'}
              </Button>
            </form>
          </div>
        )}
      </div>

      {/* Lesson Content */}
      {(lesson.theoryBlocks && lesson.theoryBlocks.length > 0) || lesson.content ? (
        <Card className="mb-8 gap-0 py-0 shadow-sm">
          <CardContent className="px-8 py-8 sm:px-10 sm:py-8 md:px-12">
            {lesson.theoryBlocks && lesson.theoryBlocks.length > 0 ? (
              <TheoryBlocksRenderer blocks={lesson.theoryBlocks as Array<Record<string, unknown>> | undefined} />
            ) : (
              <LessonLegacyContent content={lesson.content} />
            )}
          </CardContent>
        </Card>
      ) : null}

      {/* Attachments */}
      {lesson.attachments && lesson.attachments.length > 0 && (
        <Card className="mb-8">
          <CardHeader>
            <CardTitle className="text-xl text-foreground">Downloadable materials</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-2">
              {(lesson.attachments as Array<{ description?: string }>).map((attachment, index) => (
                <div key={index} className="flex items-center justify-between p-3 block-bg rounded-lg">
                  <span className="text-sm text-foreground">{attachment.description || `Attachment ${index + 1}`}</span>
                  <Button variant="outline" size="sm">Download</Button>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>
      )}

      <Separator className="my-8" />

      {/* Tasks */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-foreground">Practice tasks</h2>

        {tasks.length === 0 ? (
            <Card>
            <CardContent className="pt-6">
              <p className="text-center text-muted-foreground">
                No tasks for this lesson
              </p>
              {!isAdmin && hasNoTasks && !isLessonCompleted && (
                <div className="flex justify-center">
                  <form action={markCompleteAction}>
                    <Button type="submit" className="bg-green-600 hover:bg-green-700">
                      Mark lesson as complete
                    </Button>
                  </form>
                </div>
              )}
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {tasks.map((task, index) => {
              const taskId = String((task as Record<string, unknown>).id ?? index)
              const userProgress = taskProgressMap.get(taskId)
              
              return (
                <TaskCard
                  key={taskId}
                  task={task as Parameters<typeof TaskCard>[0]['task']}
                  index={index}
                  lessonId={lessonId}
                  courseSlug={slug}
                  userProgress={userProgress}
                />
              )
            })}
          </div>
        )}
      </div>

      {/* Navigation */}
      <div className="mt-8 flex justify-between">
        <Link href={`/courses/${slug}`}>
          <Button variant="outline">← Back to course</Button>
        </Link>

        <div className="flex gap-2">
          {prevLesson ? (
            <Link href={`/courses/${slug}/lessons/${String(prevLesson.id)}`}>
              <Button variant="outline">← Previous</Button>
            </Link>
          ) : (
            <Button variant="outline" disabled>← Previous</Button>
          )}

          {nextLesson ? (
            <Link href={`/courses/${slug}/lessons/${String(nextLesson.id)}`}>
              <Button className="bg-blue-600 hover:bg-blue-700 text-white dark:text-white">
                {'Next lesson →'}
              </Button>
            </Link>
          ) : (
            <Button disabled className="bg-gray-400 text-white">Next →</Button>
          )}
        </div>
      </div>
    </div>
  )
}

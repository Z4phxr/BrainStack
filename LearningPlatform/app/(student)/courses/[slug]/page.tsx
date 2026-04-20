import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { Brain, Check, Layers, Zap } from 'lucide-react'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import Link from 'next/link'
import Image from 'next/image'
import { auth } from '@/auth'
import { prisma } from '@/lib/prisma'
import { CourseHeroTitle } from '@/components/courses/course-hero-title'
import { studentGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

type DeckStats = { total: number; newCards: number; due: number }

function emptyDeckStats(): DeckStats {
  return { total: 0, newCards: 0, due: 0 }
}

/** Avoid “Module 1: Module 1: …” when CMS titles already include a module prefix. */
function moduleDisplayTitle(orderIndex: number, rawTitle?: string | null): string {
  const rest = (rawTitle ?? '').trim().replace(/^module\s*\d+\s*:\s*/i, '').trim()
  if (!rest) return `Module ${orderIndex + 1}`
  return `Module ${orderIndex + 1}: ${rest}`
}

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
  const session = await auth()
  const payload = await getPayload({ config })

  // Fetch course from Payload CMS
  const { docs: courses } = await payload.find({
    collection: 'courses',
    where: {
      slug: {
        equals: slug,
      },
      isPublished: {
        equals: true,
      },
    },
    depth: 1,
  })

  if (!courses || courses.length === 0) {
    notFound()
  }

  const course = courses[0]

  // Fetch modules and lessons in PARALLEL (lessons filtered by course, not module IDs)
  const [{ docs: modules }, { docs: allLessons }] = await Promise.all([
    payload.find({
      collection: 'modules',
      where: { course: { equals: course.id }, isPublished: { equals: true } },
      sort: 'order',
    }),
    payload.find({
      collection: 'lessons',
      where: { course: { equals: course.id }, isPublished: { equals: true } },
      sort: 'order',
      limit: 1000,
    }),
  ])

  // Group lessons by module
  const lessonsByModule = allLessons.reduce((acc, lesson) => {
    const moduleId = typeof lesson.module === 'object' ? lesson.module.id : lesson.module
    if (!acc[String(moduleId)]) {
      acc[String(moduleId)] = []
    }
    acc[String(moduleId)].push(lesson)
    return acc
  }, {} as Record<string, typeof allLessons>)

  interface ModuleWithLessons {
    id: string | number
    title?: string
    lessons: typeof allLessons
    [key: string]: unknown
  }

  // Attach lessons to modules
  const modulesWithLessons: ModuleWithLessons[] = modules.map(courseModule => ({
    ...courseModule,
    lessons: lessonsByModule[String(courseModule.id)] || [],
  }))

  const lessonIds = allLessons.map((l) => String(l.id))
  const completedLessonIds = new Set<string>()
  if (session?.user?.id && lessonIds.length > 0) {
    const rows = await prisma.lessonProgress.findMany({
      where: {
        userId: session.user.id,
        lessonId: { in: lessonIds },
        status: 'COMPLETED',
      },
      select: { lessonId: true },
    })
    for (const r of rows) {
      completedLessonIds.add(r.lessonId)
    }
  }

  const courseId = String(course.id)
  const moduleIds = modulesWithLessons.map((m) => String(m.id))
  const mainDeck = await prisma.flashcardDeck.findFirst({
    where: { courseId, parentDeckId: null },
    select: { id: true, name: true, slug: true },
  })

  const subdecks = mainDeck
    ? await prisma.flashcardDeck.findMany({
        where: { parentDeckId: mainDeck.id, moduleId: { in: moduleIds } },
        select: { id: true, name: true, slug: true, moduleId: true },
      })
    : []

  const trackedDeckIds = [...new Set([...(mainDeck ? [mainDeck.id] : []), ...subdecks.map((d) => d.id)])]
  const statsByDeckId = new Map<string, DeckStats>()
  for (const id of trackedDeckIds) statsByDeckId.set(id, emptyDeckStats())

  if (trackedDeckIds.length > 0) {
    const flashcardProgressUserId = session?.user?.id ?? '__anonymous__'
    const flashcardRows = await prisma.flashcard.findMany({
      where: { deckId: { in: trackedDeckIds } },
      select: {
        id: true,
        deckId: true,
        userProgress: { where: { userId: flashcardProgressUserId }, select: { state: true, nextReviewAt: true } },
      },
    })
    const now = new Date()
    for (const row of flashcardRows) {
      const target = statsByDeckId.get(row.deckId)
      if (!target) continue
      target.total += 1
      const progress = row.userProgress[0]
      const state = progress?.state ?? 'NEW'
      if (state === 'NEW') {
        target.newCards += 1
      } else if (progress?.nextReviewAt && progress.nextReviewAt <= now) {
        target.due += 1
      }
    }
  }

  const subdeckByModuleId = new Map<string, { id: string; name: string; slug: string; stats: DeckStats }>()
  for (const subdeck of subdecks) {
    if (!subdeck.moduleId) continue
    subdeckByModuleId.set(subdeck.moduleId, {
      id: subdeck.id,
      name: subdeck.name,
      slug: subdeck.slug,
      stats: statsByDeckId.get(subdeck.id) ?? emptyDeckStats(),
    })
  }

  const combinedDeckStats = emptyDeckStats()
  if (mainDeck) {
    const mainOwn = statsByDeckId.get(mainDeck.id) ?? emptyDeckStats()
    combinedDeckStats.total += mainOwn.total
    combinedDeckStats.newCards += mainOwn.newCards
    combinedDeckStats.due += mainOwn.due
    for (const subdeck of subdecks) {
      const stats = statsByDeckId.get(subdeck.id) ?? emptyDeckStats()
      combinedDeckStats.total += stats.total
      combinedDeckStats.newCards += stats.newCards
      combinedDeckStats.due += stats.due
    }
  }

  return (
    <div className="container mx-auto max-w-5xl space-y-8 px-5 py-7 md:px-6 md:py-8">
      {/* Hero — same liquid glass language as the student dashboard */}
      <Card className={cn('overflow-hidden border-0 p-0 shadow-none', studentGlassCard)}>
        {course.coverImage && typeof course.coverImage === 'object' && (
          <div className="relative h-52 w-full overflow-hidden sm:h-56 md:h-64">
            <Image
              src={`/api/media/serve/${encodeURIComponent(course.coverImage.filename)}`}
              alt={course.coverImage.alt || course.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}

        <div className="space-y-4 px-5 pb-6 pt-5 text-center sm:px-6 sm:pt-6">
          <div className="flex flex-wrap items-center justify-center gap-2">
            {course.level ? (
              <span className={cn(studentGlassPill, 'text-sm uppercase')}>{course.level}</span>
            ) : null}
            {typeof course.subject === 'string' && course.subject ? (
              <span className={cn(studentGlassPill, 'text-sm font-medium normal-case tracking-tight')}>
                {course.subject}
              </span>
            ) : (course.subject as { name?: string } | null)?.name ? (
              <span className={cn(studentGlassPill, 'text-sm font-medium normal-case tracking-tight')}>
                {(course.subject as { name?: string }).name}
              </span>
            ) : null}
          </div>

          <CourseHeroTitle>{course.title}</CourseHeroTitle>

          {course.description && (
            <div className="mx-auto max-w-3xl text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
              {typeof course.description === 'string' ? (
                <p>{course.description}</p>
              ) : (
                <p>Explore the full set of topics covered in this course.</p>
              )}
            </div>
          )}
        </div>
      </Card>

      {/* Modules and lessons */}
      <section className="space-y-5">
        <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
          Course modules
        </h2>

        {modulesWithLessons.length === 0 ? (
          <Card className={cn('border-0 shadow-none', studentGlassCard)}>
            <CardContent className="px-5 py-10 text-center sm:px-6">
              <p className="text-base text-gray-600 dark:text-gray-400 md:text-lg">
                Course content is being prepared. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modulesWithLessons.map((courseModule, index) => (
              <Card
                key={courseModule.id}
                className={cn('gap-0 border-0 py-0 shadow-none sm:gap-0', studentGlassCard)}
              >
                <CardHeader className="space-y-1 px-5 pb-3 pt-5 sm:px-6 sm:pt-6">
                  <CardTitle className="text-left text-xl font-semibold tracking-tight text-gray-900 dark:text-gray-100 md:text-2xl">
                    {moduleDisplayTitle(index, String(courseModule.title ?? ''))}
                  </CardTitle>
                </CardHeader>
                <CardContent className="space-y-2 px-5 pb-5 sm:px-6 sm:pb-6">
                  {courseModule.lessons.length === 0 ? (
                    <p className="text-sm text-gray-600 dark:text-gray-400">No lessons available</p>
                  ) : (
                    <div className="space-y-2.5">
                      {courseModule.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${slug}/lessons/${lesson.id}`}
                          className="group block rounded-xl outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <div
                            className={cn(
                              'flex min-h-[3.25rem] items-center gap-3 rounded-xl border p-3 shadow-sm backdrop-blur-md transition-[border-color,background-color,box-shadow] duration-200',
                              'border-slate-300/45 bg-white/[0.28] group-hover:border-slate-400/55 group-hover:bg-white/[0.38] group-hover:shadow-md',
                              'dark:border-white/12 dark:bg-white/[0.06] dark:shadow-none dark:group-hover:border-white/18 dark:group-hover:bg-white/[0.1] dark:group-hover:shadow-lg dark:group-hover:shadow-black/20',
                            )}
                          >
                            <div
                              className={cn(
                                'flex h-8 w-8 shrink-0 items-center justify-center rounded-full text-sm font-semibold transition-colors',
                                'bg-primary/12 text-primary group-hover:bg-primary/18',
                                'dark:bg-primary/25 dark:text-white dark:group-hover:bg-primary/35',
                              )}
                            >
                              {lesson.order}
                            </div>
                            <span className="min-w-0 flex-1 text-left font-medium text-gray-900 dark:text-gray-100">
                              {lesson.title}
                            </span>
                            {completedLessonIds.has(String(lesson.id)) && (
                              <span
                                className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-emerald-500/35 bg-emerald-500/[0.12] text-emerald-600 dark:border-emerald-400/40 dark:bg-emerald-400/15 dark:text-emerald-400"
                                aria-label="Lesson completed"
                              >
                                <Check className="h-4 w-4" strokeWidth={2.75} aria-hidden />
                              </span>
                            )}
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}

                  {(() => {
                    const moduleSubdeck = subdeckByModuleId.get(String(courseModule.id))
                    if (!moduleSubdeck) return null
                    const subdeckSlugQ = encodeURIComponent(moduleSubdeck.slug)
                    return (
                      <div className="rounded-xl border border-dashed border-primary/35 bg-primary/[0.08] p-3 dark:border-primary/40 dark:bg-primary/[0.14]">
                        <div className="flex flex-wrap items-center justify-between gap-2">
                          <div>
                            <p className="text-sm font-semibold text-gray-900 dark:text-gray-100">
                              Module subdeck: {moduleSubdeck.name}
                            </p>
                            <p className="text-xs text-gray-600 dark:text-gray-400">
                              Due {moduleSubdeck.stats.due} · New {moduleSubdeck.stats.newCards} · Total {moduleSubdeck.stats.total}
                            </p>
                          </div>
                          <div className="flex flex-wrap gap-2">
                            <Link href={`/dashboard/flashcards/study?mode=srs&subdeckSlug=${subdeckSlugQ}`}>
                              <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 text-xs normal-case tracking-tight')}>
                                <Brain className="h-3.5 w-3.5" />
                                SRS learn
                              </span>
                            </Link>
                            <Link href={`/dashboard/flashcards/study?mode=free&subdeckSlug=${subdeckSlugQ}`}>
                              <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 text-xs normal-case tracking-tight')}>
                                <Zap className="h-3.5 w-3.5" />
                                Free learn
                              </span>
                            </Link>
                          </div>
                        </div>
                      </div>
                    )
                  })()}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </section>

      {mainDeck && (
        <section className="space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Deck info
          </h2>
          <Card className={cn('border-0 shadow-none', studentGlassCard)}>
            <CardContent className="space-y-4 px-5 py-5 sm:px-6 sm:py-6">
              <div className="flex flex-wrap items-center gap-2">
                <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 normal-case tracking-tight')}>
                  <Layers className="h-3.5 w-3.5" />
                  {mainDeck.name}
                </span>
                <span className="text-sm text-gray-600 dark:text-gray-400">
                  Due {combinedDeckStats.due} · New {combinedDeckStats.newCards} · Total {combinedDeckStats.total}
                </span>
              </div>
              <div className="flex flex-wrap gap-2">
                <Link href={`/dashboard/flashcards/study?mode=srs&mainDeckSlug=${encodeURIComponent(mainDeck.slug)}`}>
                  <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 normal-case tracking-tight')}>
                    <Brain className="h-3.5 w-3.5" />
                    Start SRS learn
                  </span>
                </Link>
                <Link href={`/dashboard/flashcards/study?mode=free&mainDeckSlug=${encodeURIComponent(mainDeck.slug)}`}>
                  <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 normal-case tracking-tight')}>
                    <Zap className="h-3.5 w-3.5" />
                    Start free learn
                  </span>
                </Link>
                <Link href={`/dashboard/flashcards?courseSlug=${encodeURIComponent(slug)}`}>
                  <span className={cn(studentGlassPill, 'inline-flex items-center gap-1 normal-case tracking-tight')}>
                    Open deck tree
                  </span>
                </Link>
              </div>
            </CardContent>
          </Card>
        </section>
      )}
    </div>
  )
}

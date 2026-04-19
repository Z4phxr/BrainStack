'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { DashboardHorizontalScroll } from '@/components/dashboard/dashboard-horizontal-scroll'
import { studentGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

export type CourseCarouselItem = {
  id: string | number
  title?: string
  slug?: string
  description?: string | object | null
  coverImage?: { filename: string; alt?: string } | null
  level?: string
  subject?: string | { name?: string } | null
}

export type CourseProgressSnapshot = {
  progressPercentage: number
  completedLessons: number
  totalLessons: number
  hasStarted: boolean
}

const defaultProgress: CourseProgressSnapshot = {
  progressPercentage: 0,
  completedLessons: 0,
  totalLessons: 0,
  hasStarted: false,
}

function CourseCarouselCard({
  course,
  progress,
}: {
  course: CourseCarouselItem
  progress: CourseProgressSnapshot
}) {
  const { progressPercentage, completedLessons, totalLessons, hasStarted } = progress

  const subjectLabel =
    typeof course.subject === 'string'
      ? course.subject
      : (course.subject as { name?: string } | null)?.name ?? ''

  return (
    <Card
      className={cn(
        'flex h-full flex-col overflow-hidden border-0 shadow-none transition-shadow hover:brightness-[1.02] dark:hover:brightness-[1.03]',
        studentGlassCard,
      )}
    >
      {course.coverImage && typeof course.coverImage === 'object' && (
        <div className="relative h-44 w-full overflow-hidden">
          <Image
            src={`/api/media/serve/${encodeURIComponent(course.coverImage.filename)}`}
            alt={(course.coverImage.alt || course.title) ?? ''}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <CardHeader className="flex-grow">
        <div className="mb-2 flex flex-wrap gap-2">
          {course.level ? (
            <span className={cn(studentGlassPill, 'text-sm uppercase')}>{String(course.level)}</span>
          ) : null}
          {subjectLabel ? (
            <span className={cn(studentGlassPill, 'text-sm font-medium normal-case tracking-tight')}>
              {subjectLabel}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-xl font-bold tracking-tight text-blue-900 dark:text-white md:text-2xl">
          {course.title}
        </CardTitle>
        <CardDescription className="line-clamp-2 text-lg leading-relaxed md:text-xl">
          {course.description && typeof course.description === 'object'
            ? 'Explore the curriculum and learning goals'
            : course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="space-y-3">
        {hasStarted && (
          <div className="space-y-2">
            <div className="flex items-center justify-between text-base md:text-lg">
              <span className="text-muted-foreground">
                {completedLessons} of {totalLessons} lessons
              </span>
              <span className="font-semibold text-blue-700 dark:text-sky-300">{progressPercentage}%</span>
            </div>
            <div
              role="progressbar"
              aria-valuenow={progressPercentage}
              aria-valuemin={0}
              aria-valuemax={100}
              aria-label={`${progressPercentage}% of lessons complete`}
              className="h-3 w-full overflow-hidden rounded-full border border-slate-300/50 bg-slate-950/[0.06] shadow-[inset_0_1px_2px_rgba(15,23,42,0.08)] dark:border-white/15 dark:bg-white/[0.12] dark:shadow-[inset_0_1px_2px_rgba(0,0,0,0.35)]"
            >
              <div
                className="h-full min-w-0 rounded-full bg-gradient-to-r from-blue-600 to-indigo-600 transition-[width] duration-500 ease-out dark:from-sky-500 dark:to-indigo-400"
                style={{ width: `${progressPercentage}%` }}
              />
            </div>
          </div>
        )}
        {!hasStarted && (
          <div className="py-2 text-center text-base text-gray-500 md:text-lg">Not started yet</div>
        )}
        <Link href={`/courses/${course.slug}`}>
          <Button variant="hero" className="auth-hero-cta w-full text-sm md:text-base" size="default">
            {hasStarted ? 'Continue learning' : 'Start course'}
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

export function CourseCarousel({
  courses,
  progressByCourseId,
  scrollAriaLabel = 'Your courses',
}: {
  courses: CourseCarouselItem[]
  progressByCourseId: Record<string, CourseProgressSnapshot>
  /** Passed to the horizontal scroller for accessibility. */
  scrollAriaLabel?: string
}) {
  if (courses.length === 0) return null

  const progressFor = (course: CourseCarouselItem) =>
    progressByCourseId[String(course.id)] ?? defaultProgress

  /** Same pattern as `FlashcardBlocksCarousel`: one card is centered, not a strip with arrows. */
  if (courses.length === 1) {
    const course = courses[0]
    return (
      <div className="flex w-full justify-center px-1">
        <div className="w-full max-w-md">
          <CourseCarouselCard course={course} progress={progressFor(course)} />
        </div>
      </div>
    )
  }

  return (
    <DashboardHorizontalScroll
      aria-label={scrollAriaLabel}
      scrollArrows
      itemClassName="w-[min(92vw,22rem)] sm:w-[24rem] md:w-[26rem]"
    >
      {courses.map((course) => (
        <CourseCarouselCard
          key={course.id}
          course={course}
          progress={progressFor(course)}
        />
      ))}
    </DashboardHorizontalScroll>
  )
}

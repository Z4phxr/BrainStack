'use client'

import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import { DashboardHorizontalScroll } from '@/components/dashboard/dashboard-horizontal-scroll'

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

export function CourseCarousel({
  courses,
  progressByCourseId,
}: {
  courses: CourseCarouselItem[]
  progressByCourseId: Record<string, CourseProgressSnapshot>
}) {
  return (
    <DashboardHorizontalScroll
      aria-label="Your courses"
      scrollArrows
      itemClassName="w-[min(92vw,22rem)] sm:w-[24rem] md:w-[26rem]"
    >
      {courses.map((course) => {
        const courseId = String(course.id)
        const progress = progressByCourseId[courseId] ?? {
          progressPercentage: 0,
          completedLessons: 0,
          totalLessons: 0,
          hasStarted: false,
        }
        const { progressPercentage, completedLessons, totalLessons, hasStarted } = progress

        return (
          <Card
            key={course.id}
            className="flex h-full flex-col overflow-hidden rounded-xl border-0 shadow-md ring-1 ring-black/5 transition-shadow hover:shadow-lg dark:ring-white/10"
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
              <div className="mb-2 flex gap-2">
                <Badge variant="secondary" className="text-sm font-normal">
                  {course.level}
                </Badge>
                <Badge variant="outline" className="text-sm font-normal">
                  {typeof course.subject === 'string'
                    ? course.subject
                    : (course.subject as { name?: string } | null)?.name ?? ''}
                </Badge>
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
                    <span className="text-gray-600 dark:text-gray-300">
                      {completedLessons} of {totalLessons} lessons
                    </span>
                    <span className="font-semibold text-blue-600">{progressPercentage}%</span>
                  </div>
                  <div className="h-3 w-full rounded-full bg-gray-200">
                    <div
                      className="h-3 rounded-full bg-blue-600 transition-all duration-500"
                      style={{ width: `${progressPercentage}%` }}
                    />
                  </div>
                </div>
              )}
              {!hasStarted && (
                <div className="py-2 text-center text-base text-gray-500 md:text-lg">Not started yet</div>
              )}
              <Link href={`/courses/${course.slug}`}>
                <Button className="w-full bg-blue-600 text-sm hover:bg-blue-700 md:text-base" size="default">
                  {hasStarted ? 'Continue learning' : 'Start course'}
                </Button>
              </Link>
            </CardContent>
          </Card>
        )
      })}
    </DashboardHorizontalScroll>
  )
}

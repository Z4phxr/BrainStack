import Link from 'next/link'
import Image from 'next/image'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { studentGlassCard, studentGlassPill } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

type SubjectRel = string | { name?: string } | null | undefined

const LEVEL_LABEL: Record<string, string> = {
  BEGINNER: 'Beginner',
  INTERMEDIATE: 'Intermediate',
  ADVANCED: 'Advanced',
}

export type CourseCatalogCardDoc = {
  id: string | number
  title?: string
  slug?: string
  description?: string | object | null
  coverImage?: { filename: string; alt?: string } | null
  level?: string
  subject?: SubjectRel
}

export function CourseCatalogCard({ course }: { course: CourseCatalogCardDoc }) {
  const coverImage =
    course.coverImage && typeof course.coverImage === 'object' && 'filename' in course.coverImage
      ? (course.coverImage as { filename: string; alt?: string })
      : null

  const subjectLabel =
    typeof course.subject === 'string'
      ? course.subject
      : (course.subject as { name?: string } | null)?.name ?? ''

  const levelLabel = course.level ? (LEVEL_LABEL[course.level] ?? course.level) : ''

  return (
    <Card
      className={cn(
        'h-full border-0 shadow-none transition-shadow hover:brightness-[1.02] dark:hover:brightness-[1.03]',
        studentGlassCard,
      )}
    >
      {coverImage && (
        <div className="relative h-48 w-full shrink-0 overflow-hidden rounded-t-lg">
          <Image
            src={`/api/media/serve/${encodeURIComponent(coverImage.filename)}`}
            alt={coverImage.alt || course.title || ''}
            fill
            unoptimized
            className="object-cover"
          />
        </div>
      )}
      <CardHeader>
        <div className="mb-2 flex flex-wrap gap-2">
          {levelLabel ? (
            <span className={cn(studentGlassPill, 'text-[0.7rem] uppercase sm:text-xs')}>{levelLabel}</span>
          ) : null}
          {subjectLabel ? (
            <span className={cn(studentGlassPill, 'text-[0.7rem] font-medium normal-case tracking-tight sm:text-xs')}>
              {subjectLabel}
            </span>
          ) : null}
        </div>
        <CardTitle className="text-xl text-blue-900 dark:text-blue-400">{course.title}</CardTitle>
        <CardDescription className="text-pretty">
          {course.description && typeof course.description === 'object'
            ? 'Explore the curriculum and learning goals'
            : course.description}
        </CardDescription>
      </CardHeader>
      <CardContent className="mt-auto shrink-0 pt-0">
        <Link href={`/courses/${course.slug}`} className="block">
          <Button variant="hero" className="auth-hero-cta w-full">
            View course
          </Button>
        </Link>
      </CardContent>
    </Card>
  )
}

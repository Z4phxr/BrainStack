import { redirect } from 'next/navigation'
import Link from 'next/link'
import { getPayload } from 'payload'
import config from '@payload-config'
import { Card, CardContent } from '@/components/ui/card'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  buildCoursesCatalogWhere,
  CATALOG_LEVEL_OPTIONS,
  CATALOG_SORT_LABELS,
  COURSES_CATALOG_PAGE_SIZE,
  parseCatalogSearchParams,
  serializeCatalogQuery,
} from '@/lib/courses-catalog'
import { CourseCatalogCard } from '@/components/courses/course-catalog-card'
import { CatalogPagination } from '@/components/courses/catalog-pagination'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

export const dynamic = 'force-dynamic'

type PageProps = {
  searchParams: Promise<Record<string, string | string[] | undefined>>
}

export default async function CoursesPage({ searchParams }: PageProps) {
  const raw = await searchParams
  const filters = parseCatalogSearchParams(raw)
  const payload = await getPayload({ config })

  const [{ docs: subjectDocs }, coursesResult] = await Promise.all([
    payload.find({
      collection: 'subjects',
      sort: 'name',
      limit: 500,
      depth: 0,
    }),
    payload.find({
      collection: 'courses',
      where: buildCoursesCatalogWhere(filters),
      sort: filters.sort,
      limit: COURSES_CATALOG_PAGE_SIZE,
      page: filters.page,
      depth: 1,
    }),
  ])

  const courses = coursesResult.docs
  const totalDocs =
    typeof coursesResult.totalDocs === 'number' ? coursesResult.totalDocs : courses.length

  const lastPage = Math.max(1, Math.ceil(totalDocs / COURSES_CATALOG_PAGE_SIZE))
  if (filters.page > lastPage && totalDocs > 0) {
    const qs = serializeCatalogQuery({ ...filters, page: lastPage }, lastPage)
    redirect(qs ? `/courses?${qs}` : '/courses')
  }

  return (
    <div className="container mx-auto px-6 py-8 md:px-8">
      <div className="mx-auto mb-10 max-w-3xl text-center">
        <h1 className="mb-3 text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
          Available courses
        </h1>
        <p className="text-lg text-gray-600 dark:text-gray-400 md:text-xl">
          Choose a course to start learning
        </p>
      </div>

      <form
        action="/courses"
        method="get"
        className={cn('mb-10 grid gap-4 p-4 shadow-none md:grid-cols-2 md:p-6 lg:grid-cols-12 lg:items-end', studentGlassCard)}
      >
        <div className="flex flex-col gap-1.5 lg:col-span-3">
          <label htmlFor="catalog-q" className="text-sm font-medium text-foreground">
            Search by title
          </label>
          <Input
            id="catalog-q"
            name="q"
            type="search"
            placeholder="Type a course name…"
            defaultValue={filters.q}
            autoComplete="off"
            className={cn(
              // Match native selects: Input component still adds dark:bg-input/30 unless overridden here.
              'h-10 w-full border border-input bg-background text-sm text-foreground shadow-xs dark:bg-background',
              'placeholder:text-muted-foreground',
              'focus-visible:border-ring focus-visible:ring-2 focus-visible:ring-ring/50 focus-visible:ring-offset-2 focus-visible:ring-offset-background',
            )}
          />
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-2">
          <label htmlFor="catalog-level" className="text-sm font-medium text-foreground">
            Level
          </label>
          <select
            id="catalog-level"
            name="level"
            defaultValue={filters.level}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {CATALOG_LEVEL_OPTIONS.map((opt) => (
              <option key={opt.value || 'all'} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-3">
          <label htmlFor="catalog-subject" className="text-sm font-medium text-foreground">
            Subject
          </label>
          <select
            id="catalog-subject"
            name="subject"
            defaultValue={filters.subject}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            <option value="">All subjects</option>
            {subjectDocs.map((s) => (
              <option key={String(s.id)} value={String(s.id)}>
                {String(s.name ?? '')}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-3">
          <label htmlFor="catalog-sort" className="text-sm font-medium text-foreground">
            Sort by
          </label>
          <select
            id="catalog-sort"
            name="sort"
            defaultValue={filters.sort}
            className="flex h-10 w-full rounded-md border border-input bg-background px-3 py-2 text-sm text-foreground ring-offset-background focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2"
          >
            {CATALOG_SORT_LABELS.map((opt) => (
              <option key={opt.value} value={opt.value}>
                {opt.label}
              </option>
            ))}
          </select>
        </div>
        <div className="flex flex-col gap-1.5 lg:col-span-1">
          <span className="invisible select-none text-sm font-medium text-foreground" aria-hidden>
            Apply
          </span>
          <Button
            type="submit"
            variant="hero"
            size="lg"
            className="auth-hero-cta h-10 w-full shrink-0 px-4 lg:w-auto"
          >
            Apply
          </Button>
        </div>
      </form>

      {courses.length === 0 ? (
        <Card className={cn('border-0 shadow-none', studentGlassCard)}>
          <CardContent className="space-y-3 pt-8 pb-8">
            <p className="text-center text-gray-600 dark:text-gray-400">
              {filters.q || filters.level || filters.subject
                ? 'No courses match your filters. Try adjusting search, level, or subject.'
                : 'No courses available yet. Check back soon.'}
            </p>
            {(filters.q || filters.level || filters.subject) && (
              <p className="text-center">
                <Link
                  href="/courses"
                  className="text-sm font-medium text-blue-600 underline-offset-4 hover:underline dark:text-blue-400"
                >
                  Clear all filters
                </Link>
              </p>
            )}
          </CardContent>
        </Card>
      ) : (
        <>
          <p className="mb-4 text-center text-sm text-muted-foreground md:text-left">
            Showing {(filters.page - 1) * COURSES_CATALOG_PAGE_SIZE + 1}–
            {Math.min(filters.page * COURSES_CATALOG_PAGE_SIZE, totalDocs)} of {totalDocs} courses
          </p>
          <div className="grid grid-cols-1 gap-6 md:grid-cols-2 lg:grid-cols-3">
            {courses.map((course) => (
              <CourseCatalogCard key={String(course.id)} course={course} />
            ))}
          </div>
          <CatalogPagination filters={filters} totalDocs={totalDocs} />
        </>
      )}
    </div>
  )
}

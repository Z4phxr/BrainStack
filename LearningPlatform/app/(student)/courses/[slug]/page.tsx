import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'

export const dynamic = 'force-dynamic'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Separator } from '@/components/ui/separator'
import Link from 'next/link'
import Image from 'next/image'

export default async function CoursePage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params
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

  return (
    <div className="container mx-auto py-8 px-4 max-w-4xl">
      {/* Course Header */}
      <div className="mb-8 text-center">
        {course.coverImage && typeof course.coverImage === 'object' && (
          <div className="relative h-64 w-full overflow-hidden rounded-lg mb-6">
            <Image
              src={`/api/media/serve/${encodeURIComponent(course.coverImage.filename)}`}
              alt={course.coverImage.alt || course.title}
              fill
              unoptimized
              className="object-cover"
            />
          </div>
        )}
        
        <div className="flex items-center justify-center gap-2 mb-4">
          <Badge variant="secondary" className="text-sm">{course.level}</Badge>
          <Badge variant="outline" className="text-sm">{typeof course.subject === 'string' ? course.subject : (course.subject as any)?.name ?? ''}</Badge>
        </div>

        <h1 className="text-4xl font-bold text-primary dark:text-white mb-4">{course.title}</h1>

        {course.description && (
          <div className="text-gray-700 dark:text-gray-200 prose max-w-none mx-auto">
            {typeof course.description === 'string' 
              ? <p>{course.description}</p>
              : <div>Explore the full set of topics covered in this course.</div>}
          </div>
        )}
      </div>

      <Separator className="my-8" />

      {/* Modules and Lessons */}
      <div className="space-y-6">
        <h2 className="text-2xl font-bold text-primary dark:text-gray-100 text-center">Course modules</h2>

        {modulesWithLessons.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                Course content is being prepared. Check back soon!
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="space-y-4">
            {modulesWithLessons.map((courseModule, index) => (
              <Card key={courseModule.id} className="block-contrast">
                <CardHeader>
                    <CardTitle className="text-xl text-primary dark:text-gray-100">
                    Module {index + 1}: {courseModule.title ?? ''}
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  {courseModule.lessons.length === 0 ? (
                    <p className="text-gray-500 text-sm dark:text-gray-400">No lessons available</p>
                  ) : (
                    <div className="space-y-2">
                      {courseModule.lessons.map((lesson) => (
                        <Link
                          key={lesson.id}
                          href={`/courses/${slug}/lessons/${lesson.id}`}
                          className="group block rounded-lg outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background"
                        >
                          <div className="flex items-center gap-3 rounded-lg border border-border/60 bg-muted/25 p-3 shadow-sm transition-[border-color,background-color,box-shadow] duration-200 group-hover:border-primary/35 group-hover:bg-muted/70 group-hover:shadow-md dark:border-white/10 dark:bg-white/[0.04] dark:shadow-none dark:group-hover:border-primary/45 dark:group-hover:bg-white/[0.09] dark:group-hover:shadow-lg dark:group-hover:shadow-black/25">
                            <div className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-primary/10 text-sm font-semibold text-primary transition-colors group-hover:bg-primary/15 dark:bg-primary/30 dark:text-white dark:group-hover:bg-primary/40">
                              {lesson.order}
                            </div>
                            <span className="min-w-0 flex-1 font-medium text-foreground dark:text-gray-100">
                              {lesson.title}
                            </span>
                          </div>
                        </Link>
                      ))}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))}
          </div>
        )}
      </div>
    </div>
  )
}

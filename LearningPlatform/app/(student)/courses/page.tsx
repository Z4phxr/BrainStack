import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card'
import { Badge } from '@/components/ui/badge'
import { Button } from '@/components/ui/button'
import Link from 'next/link'
import Image from 'next/image'

export const dynamic = 'force-dynamic'

const getPublishedCourses = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const { docs } = await payload.find({
      collection: 'courses',
      where: { isPublished: { equals: true } },
      sort: '-createdAt',
    })
    return docs
  },
  ['student-courses-list'],
  { revalidate: 30 },
)

export default async function CoursesPage() {
  const courses = await getPublishedCourses()

  return (
    <div className="container mx-auto px-6 md:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100 mb-2">Available courses</h1>
        <p className="text-gray-600 dark:text-gray-400">
          Choose a course to start learning
        </p>
      </div>

      {courses.length === 0 ? (
        <Card>
          <CardContent className="pt-6">
            <p className="text-center text-gray-500 dark:text-gray-400">
              No courses available yet. Check back soon.
            </p>
          </CardContent>
        </Card>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {courses.map((course) => {
            // Type guard for coverImage
            const coverImage = course.coverImage && typeof course.coverImage === 'object' && 'filename' in course.coverImage
              ? course.coverImage as { filename: string; alt?: string }
              : null

            return (
              <Card key={course.id} className="hover:shadow-lg transition-shadow dark:border-gray-700">
                {coverImage && (
                  <div className="relative h-48 w-full overflow-hidden rounded-t-lg">
                    <Image
                      src={`/api/media/serve/${encodeURIComponent(coverImage.filename)}`}
                      alt={coverImage.alt || course.title}
                      fill
                      unoptimized
                      className="object-cover"
                    />
                  </div>
                )}
                <CardHeader>
                  <div className="flex gap-2 mb-2">
                    <Badge variant="secondary">{course.level}</Badge>
                    <Badge variant="outline">{typeof course.subject === 'string' ? course.subject : (course.subject as any)?.name ?? ''}</Badge>
                  </div>
                  <CardTitle className="text-xl text-blue-900 dark:text-blue-400">{course.title}</CardTitle>
                  <CardDescription>
                    {course.description && typeof course.description === 'object' 
                      ? 'Explore the curriculum and learning goals'
                      : course.description}
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <Link href={`/courses/${course.slug}`}>
                    <Button className="w-full bg-blue-600 hover:bg-blue-700">
                      View course
                    </Button>
                  </Link>
                </CardContent>
              </Card>
            )
          })}
        </div>
      )}
    </div>
  )
}

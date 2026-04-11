import { getCourses } from '../actions'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'
import { ReloadButton } from '@/components/ui/reload-button'
import { CoursesList } from '@/components/admin/courses-list'
import { AddCourseButton } from '@/components/admin/add-course-button'
import { BookOpen, Users, GraduationCap } from 'lucide-react'

export const dynamic = 'force-dynamic'

type Course = {
  id: string
  title: string
  slug: string
  subject: string
  level: string
  isPublished: boolean
  updatedAt: string
}

export default async function AdminDashboardPage() {
  const isBuildTime = process.env.NEXT_PHASE === 'phase-production-build'

  let courses: Course[] = []
  let error: string | null = null

  if (!isBuildTime) {
    try {
      const coursesData = await getCourses()
      courses = coursesData.map((c: any) => ({
        id: String(c.id),
        title: c.title,
        slug: c.slug,
        subject: typeof c.subject === 'string' ? c.subject : c.subject?.name ?? '',
        level: c.level,
        isPublished: Boolean(c.isPublished),
        updatedAt: c.updatedAt,
      }))
    } catch (err) {
      console.error('Failed to fetch courses:', err)
      const msg = err instanceof Error ? err.message : String(err)
      if (msg.includes('Payload tables not initialized') || (msg.includes('relation') && msg.includes('does not exist'))) {
        error = '⚠️ The database is not initialized. Run migrations: npm run payload:migrate'
      } else {
        error = 'Unable to load courses. Please refresh the page.'
      }
    }
  }

  const stats = {
    totalCourses: courses.length,
    publishedCourses: courses.filter((x) => x.isPublished).length,
    draftCourses: courses.filter((x) => !x.isPublished).length,
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-4xl font-bold text-gray-900 dark:text-gray-100">Dashboard</h1>
          <p className="text-lg text-gray-600 dark:text-gray-400">Manage courses and content</p>
        </div>
        <div className="flex items-center space-x-2">
          <AddCourseButton />
          <ReloadButton />
        </div>
      </div>

      <div className="grid gap-4 md:grid-cols-3">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">All courses</CardTitle>
            <BookOpen className="h-5 w-5 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.totalCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Published</CardTitle>
            <GraduationCap className="h-5 w-5 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.publishedCourses}</div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-base font-medium">Drafts</CardTitle>
            <Users className="h-5 w-5 text-gray-600" />
          </CardHeader>
          <CardContent>
            <div className="text-3xl font-bold">{stats.draftCourses}</div>
          </CardContent>
        </Card>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="text-2xl">Courses</CardTitle>
        </CardHeader>
        <CardContent>
          {error ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-base text-red-600">{error}</p>
              <ReloadButton />
            </div>
          ) : courses.length === 0 ? (
            <div className="py-8 text-center">
              <p className="mb-4 text-base text-gray-500">No courses yet.</p>
            </div>
          ) : (
            <CoursesList courses={courses} />
          )}
        </CardContent>
      </Card>
    </div>
  )
}

import { auth } from '@/auth';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic'
import config from '@payload-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import Link from 'next/link';
import Image from 'next/image';
import { ReloadButton } from '@/components/ui/reload-button';
import { timeAsync } from '@/lib/utils';
import { getUserStats, getAllCourseProgress } from '@/app/actions/progress';
import { FlashcardDashboardSection } from '@/components/dashboard/flashcard-section';
import { RecommendedPracticeCard } from '@/components/dashboard/recommended-practice-card';

export default async function DashboardPage() {
  const session = await auth();
  
  // Fetch courses with error handling
  interface CourseSummary {
    id: string | number
    title?: string
    slug?: string
    description?: string | object | null
    coverImage?: { filename: string; alt?: string } | null
    level?: string
    subject?: string
  }

  let courses: CourseSummary[] = []
  let error: string | null = null
  let userStats = { completedLessons: 0, totalPoints: 0, activeCourses: 0 }
  const courseProgressMap = new Map<string, any>()
  
  try {
    const payload = await getPayload({ config });

    // Fetch published courses from Payload CMS
    const { result } = await timeAsync('student-dashboard:courses', () =>
      payload.find({
        collection: 'courses',
        where: {
          isPublished: {
            equals: true,
          },
        },
        sort: '-createdAt',
        limit: 20,
      })
    );
    
    courses = result.docs as CourseSummary[]

    // Fetch user stats and progress
    if (session?.user?.id) {
      const [stats, allProgress] = await Promise.all([
        getUserStats(),
        getAllCourseProgress()
      ])
      
      userStats = stats
      
      // Create a map of courseId -> progress
      allProgress.forEach(progress => {
        courseProgressMap.set(progress.courseId, progress)
      })
    }
  } catch (err) {
    error = 'Unable to load courses. Please refresh the page.'
  }

  return (
    <div className="container mx-auto px-6 md:px-8 py-8">
      <div className="mb-8 text-center">
        <h1 className="text-3xl font-bold text-gray-900 dark:text-gray-100">
          Welcome, {session?.user?.name || session?.user?.email}!
        </h1>
        <p className="mt-2 text-gray-600 dark:text-gray-400">
          Ready for your next learning session?
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid gap-6 md:grid-cols-3 mb-8 max-w-4xl mx-auto">
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-base">Completed lessons</CardDescription>
            <CardTitle className="text-4xl text-purple-600 mt-2">
              {userStats.completedLessons}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-base">Total points earned</CardDescription>
            <CardTitle className="text-4xl text-green-600 mt-2">
              {userStats.totalPoints}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-base">Active courses</CardDescription>
            <CardTitle className="text-4xl text-blue-600 mt-2">
              {userStats.activeCourses}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recommended Practice */}
      <div className="mb-8">
        <RecommendedPracticeCard />
      </div>

      {/* Courses Section */}
      <div className="mb-8">
        <div className="mb-4 text-center">
          <h2 className="text-2xl font-bold text-gray-900 dark:text-gray-100">Your courses</h2>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-red-600 dark:text-red-400 mb-4">{error}</p>
              <div className="flex justify-center">
                <ReloadButton />
              </div>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-gray-500 dark:text-gray-400">
                No courses available yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3 max-w-6xl mx-auto">
            {courses.map((course) => {
              const courseId = String(course.id)
              const progress = courseProgressMap.get(courseId)
              const progressPercentage = progress?.progressPercentage || 0
              const completedLessons = progress?.completedLessons || 0
              const totalLessons = progress?.totalLessons || 0
              const hasStarted = !!progress
              
              return (
                <Card key={course.id} className="hover:shadow-lg transition-shadow flex flex-col">
                  {course.coverImage && typeof course.coverImage === 'object' && (
                    <div className="relative h-40 w-full overflow-hidden rounded-t-lg">
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
                    <div className="flex gap-2 mb-2">
                      <Badge variant="secondary" className="text-xs">{course.level}</Badge>
                      <Badge variant="outline" className="text-xs">
                        {typeof course.subject === 'string' ? course.subject : (course.subject as any)?.name ?? ''}
                      </Badge>
                    </div>
                    <CardTitle className="text-lg text-blue-900 dark:text-white">{course.title}</CardTitle>
                    <CardDescription className="line-clamp-2">
                      {course.description && typeof course.description === 'object' 
                        ? 'Explore the curriculum and learning goals'
                        : course.description}
                    </CardDescription>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    {/* Progress Bar */}
                    {hasStarted && (
                      <div className="space-y-2">
                        <div className="flex items-center justify-between text-sm">
                          <span className="text-gray-600 dark:text-gray-300">
                            {completedLessons} of {totalLessons} lessons
                          </span>
                          <span className="font-semibold text-blue-600">
                            {progressPercentage}%
                          </span>
                        </div>
                        <div className="w-full bg-gray-200 rounded-full h-2.5">
                          <div 
                            className="bg-blue-600 h-2.5 rounded-full transition-all duration-500"
                            style={{ width: `${progressPercentage}%` }}
                          ></div>
                        </div>
                      </div>
                    )}
                    {!hasStarted && (
                      <div className="text-sm text-gray-500 text-center py-2">
                        Not started yet
                      </div>
                    )}
                    
                    <Link href={`/courses/${course.slug}`}>
                      <Button 
                        className="w-full bg-blue-600 hover:bg-blue-700" 
                        size="sm"
                      >
                        {hasStarted ? 'Continue learning' : 'Start course'}
                      </Button>
                    </Link>
                  </CardContent>
                </Card>
              )
            })}
          </div>
        )}
      </div>

      {/* ── Flashcards section ── */}
      <div className="mt-12">
        <FlashcardDashboardSection />
      </div>
    </div>
  );
}

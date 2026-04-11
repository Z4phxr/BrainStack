import { auth } from '@/auth';
import { getPayload } from 'payload';

export const dynamic = 'force-dynamic'
import config from '@payload-config';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { ReloadButton } from '@/components/ui/reload-button';
import { timeAsync } from '@/lib/utils';
import { getUserStats, getAllCourseProgress } from '@/app/actions/progress';
import { FlashcardDashboardSection } from '@/components/dashboard/flashcard-section';
import { RecommendedPracticeCard } from '@/components/dashboard/recommended-practice-card';
import {
  CourseCarousel,
  type CourseProgressSnapshot,
} from '@/components/dashboard/course-carousel';

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
        depth: 1,
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

  const progressByCourseId: Record<string, CourseProgressSnapshot> = {}
  for (const [id, p] of courseProgressMap.entries()) {
    progressByCourseId[id] = {
      progressPercentage: p?.progressPercentage ?? 0,
      completedLessons: p?.completedLessons ?? 0,
      totalLessons: p?.totalLessons ?? 0,
      hasStarted: !!p,
    }
  }

  return (
    <div className="container mx-auto px-6 py-8 md:px-8">
      {/* One column width for every section (matches “Your courses”). */}
      <div className="mx-auto w-full max-w-6xl space-y-10">
      <div className="text-center">
        <h1 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
          Welcome, {session?.user?.name || session?.user?.email}!
        </h1>
        <p className="mt-3 text-lg leading-relaxed text-gray-600 dark:text-gray-400 md:text-xl">
          Ready for your next learning session?
        </p>
      </div>

      {/* Global Stats */}
      <div className="grid w-full gap-6 md:grid-cols-3">
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Completed lessons
            </CardDescription>
            <CardTitle className="mt-2 text-4xl font-bold text-purple-600 md:text-5xl">
              {userStats.completedLessons}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Total points earned
            </CardDescription>
            <CardTitle className="mt-2 text-4xl font-bold text-green-600 md:text-5xl">
              {userStats.totalPoints}
            </CardTitle>
          </CardHeader>
        </Card>
        <Card>
          <CardHeader className="pb-3 text-center">
            <CardDescription className="text-lg leading-relaxed text-muted-foreground md:text-xl">
              Active courses
            </CardDescription>
            <CardTitle className="mt-2 text-4xl font-bold text-blue-600 md:text-5xl">
              {userStats.activeCourses}
            </CardTitle>
          </CardHeader>
        </Card>
      </div>

      {/* Recommended Practice */}
      <div className="w-full">
        <RecommendedPracticeCard />
      </div>

      {/* Courses — same horizontal bounds as stats / recommended practice (no extra nested container). */}
      <div className="w-full">
        <div className="mb-5 text-center md:mb-6">
          <h2 className="text-4xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-5xl">
            Your courses
          </h2>
        </div>

        {error ? (
          <Card>
            <CardContent className="pt-6">
              <p className="mb-4 text-center text-lg leading-relaxed text-red-600 dark:text-red-400 md:text-xl">
                {error}
              </p>
              <div className="flex justify-center">
                <ReloadButton />
              </div>
            </CardContent>
          </Card>
        ) : courses.length === 0 ? (
          <Card>
            <CardContent className="pt-6">
              <p className="text-center text-lg leading-relaxed text-gray-500 dark:text-gray-400 md:text-xl">
                No courses available yet. Check back soon.
              </p>
            </CardContent>
          </Card>
        ) : (
          <CourseCarousel courses={courses} progressByCourseId={progressByCourseId} />
        )}
      </div>

      {/* ── Flashcards section ── */}
      <div className="w-full pt-2">
        <FlashcardDashboardSection />
      </div>
      </div>
    </div>
  );
}

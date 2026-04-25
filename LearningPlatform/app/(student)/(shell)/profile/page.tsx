import { auth } from '@/auth'
import { getPayload } from 'payload'
import config from '@payload-config'
import { redirect } from 'next/navigation'
import { prisma } from '@/lib/prisma'
import { Card, CardContent } from '@/components/ui/card'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import { CourseCarousel, type CourseProgressSnapshot } from '@/components/dashboard/course-carousel'
import { FlashcardDeckCarousel } from '@/components/dashboard/flashcard-deck-carousel'
import { UnarchiveCourseButton, UnarchiveDeckButton } from '@/components/profile/archive-actions'

export const dynamic = 'force-dynamic'

type DeckStats = { total: number; newCards: number; due: number }

export default async function ProfilePage() {
  const session = await auth()
  const userId = session?.user?.id
  if (!userId) redirect('/login')

  const payload = await getPayload({ config })
  const [archivedCourses, archivedDeckEnrollments] = await Promise.all([
    prisma.courseProgress.findMany({
      where: { userId, archivedAt: { not: null } },
      orderBy: { archivedAt: 'desc' },
      select: { courseId: true, completedLessons: true, totalLessons: true, progressPercentage: true },
    }),
    prisma.userStandaloneFlashcardDeck.findMany({
      where: { userId, archivedAt: { not: null } },
      orderBy: { archivedAt: 'desc' },
      select: {
        deck: {
          select: {
            id: true,
            name: true,
            slug: true,
            description: true,
            subjectId: true,
            courseId: true,
            parentDeckId: true,
            tags: { select: { name: true } },
          },
        },
      },
    }),
  ])

  const archivedCourseIds = archivedCourses.map((c) => c.courseId)
  const courseDocs = archivedCourseIds.length
    ? (await payload.find({
        collection: 'courses',
        where: { id: { in: archivedCourseIds }, isPublished: { equals: true } },
        limit: archivedCourseIds.length,
        depth: 1,
      })).docs
    : []
  const courseById = new Map(courseDocs.map((c) => [String(c.id), c]))

  const archivedCourseItems = archivedCourseIds
    .map((id) => {
      const doc = courseById.get(id)
      if (!doc) return null
      return {
        id,
        title: doc.title,
        slug: doc.slug,
        description: doc.description,
        coverImage: typeof doc.coverImage === 'object' ? (doc.coverImage as { filename: string; alt?: string }) : null,
        level: doc.level,
        subject: doc.subject as string | { name?: string } | null,
      }
    })
    .filter((v): v is NonNullable<typeof v> => Boolean(v))

  const archivedProgressByCourseId: Record<string, CourseProgressSnapshot> = {}
  for (const row of archivedCourses) {
    archivedProgressByCourseId[row.courseId] = {
      progressPercentage: row.progressPercentage,
      completedLessons: row.completedLessons,
      totalLessons: row.totalLessons,
      hasStarted: row.totalLessons > 0 || row.completedLessons > 0,
    }
  }

  const rootDecks = archivedDeckEnrollments
    .map((row) => row.deck)
    .filter((d) => d && !d.parentDeckId)
  const rootDeckIds = rootDecks.map((d) => d.id)
  const allDeckIds = new Set(rootDeckIds)
  let layer = [...rootDeckIds]
  for (let depth = 0; depth < 16 && layer.length > 0; depth++) {
    const kids = await prisma.flashcardDeck.findMany({
      where: { parentDeckId: { in: layer } },
      select: { id: true },
    })
    layer = []
    for (const k of kids) {
      if (!allDeckIds.has(k.id)) {
        allDeckIds.add(k.id)
        layer.push(k.id)
      }
    }
  }
  const statsByRootId = new Map<string, DeckStats>()
  for (const id of rootDeckIds) statsByRootId.set(id, { total: 0, newCards: 0, due: 0 })
  if (allDeckIds.size > 0) {
    const deckRows = await prisma.flashcardDeck.findMany({
      where: { id: { in: [...allDeckIds] } },
      select: { id: true, parentDeckId: true },
    })
    const parentById = new Map(deckRows.map((d) => [d.id, d.parentDeckId]))
    const rootByDeckId = new Map<string, string>()
    for (const d of deckRows) {
      let cursor: string | null = d.id
      while (cursor) {
        const parent: string | null = parentById.get(cursor) ?? null
        if (!parent) {
          rootByDeckId.set(d.id, cursor)
          break
        }
        cursor = parent
      }
    }
    const flashcards = await prisma.flashcard.findMany({
      where: { deckId: { in: [...allDeckIds] } },
      select: {
        deckId: true,
        userProgress: { where: { userId }, select: { state: true, nextReviewAt: true } },
      },
    })
    const now = new Date()
    for (const row of flashcards) {
      const rootId = rootByDeckId.get(row.deckId)
      if (!rootId) continue
      const stats = statsByRootId.get(rootId)
      if (!stats) continue
      stats.total += 1
      const progress = row.userProgress[0]
      const state = progress?.state ?? 'NEW'
      if (state === 'NEW') stats.newCards += 1
      else if (progress?.nextReviewAt && progress.nextReviewAt <= now) stats.due += 1
    }
  }

  const archivedDeckRows = rootDecks.map((deck) => ({
    id: deck.id,
    name: deck.name,
    subtitle:
      deck.courseId != null
        ? 'Course-linked deck'
        : deck.tags?.length
          ? deck.tags.map((t) => t.name).join(' · ')
          : deck.description ?? '',
    openHref:
      deck.courseId != null
        ? '/dashboard/flashcards'
        : `/dashboard/flashcards?standaloneDeckSlug=${encodeURIComponent(deck.slug)}`,
    stats: statsByRootId.get(deck.id) ?? { total: 0, newCards: 0, due: 0 },
  }))

  return (
    <div className="container mx-auto px-5 py-7 md:px-6 md:py-8">
      <div className="mx-auto w-full max-w-5xl space-y-8">
        <div className="text-center">
          <h1 className="text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">Your profile</h1>
          <p className="mt-2 text-base leading-relaxed text-gray-600 dark:text-gray-400 md:text-lg">
            Manage archived courses and flashcard decks.
          </p>
        </div>

        <section className="space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Archived courses
          </h2>
          {archivedCourseItems.length > 0 ? (
            <CourseCarousel
              courses={archivedCourseItems}
              progressByCourseId={archivedProgressByCourseId}
              compact
              footerActionByCourseId={Object.fromEntries(
                archivedCourseItems.map((course) => [course.id, <UnarchiveCourseButton key={course.id} courseId={String(course.id)} />]),
              )}
            />
          ) : (
            <Card className={cn('border-0 shadow-none', studentGlassCard)}>
              <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">No archived courses yet.</CardContent>
            </Card>
          )}
        </section>

        <section className="space-y-4">
          <h2 className="text-center text-3xl font-bold tracking-tight text-gray-900 dark:text-gray-100 md:text-4xl">
            Archived flashcards
          </h2>
          {archivedDeckRows.length > 0 ? (
            <FlashcardDeckCarousel
              rows={archivedDeckRows}
              compact
              actionByDeckId={Object.fromEntries(
                archivedDeckRows.map((row) => [row.id, <UnarchiveDeckButton key={row.id} deckId={row.id} />]),
              )}
            />
          ) : (
            <Card className={cn('border-0 shadow-none', studentGlassCard)}>
              <CardContent className="py-8 text-center text-gray-600 dark:text-gray-400">No archived flashcard decks yet.</CardContent>
            </Card>
          )}
        </section>
      </div>
    </div>
  )
}

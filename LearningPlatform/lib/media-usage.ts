import { getPayload } from 'payload'
import config from '@payload-config'
import { unstable_cache } from 'next/cache'
import { prisma } from '@/lib/prisma'

export interface MediaUsage {
  lessonsCount: number
  tasksCount: number
  coursesCount: number
  flashcardsCount: number
  lessonRefs: Array<{ id: number; title: string }>
  taskRefs: Array<{ id: number; lessonId: number; lessonTitle: string }>
  courseRefs: Array<{ id: number | string; title: string }>
}

type LessonDoc = {
  id: number
  title: string
  theoryBlocks?: Array<Record<string, unknown>>
}

function emptyUsage(): MediaUsage {
  return {
    lessonsCount: 0,
    tasksCount: 0,
    coursesCount: 0,
    flashcardsCount: 0,
    lessonRefs: [],
    taskRefs: [],
    courseRefs: [],
  }
}

export function isMediaInUse(usage: MediaUsage): boolean {
  return (
    usage.lessonsCount > 0 ||
    usage.tasksCount > 0 ||
    usage.coursesCount > 0 ||
    usage.flashcardsCount > 0
  )
}

export function mediaUsageTotal(usage: MediaUsage): number {
  return usage.lessonsCount + usage.tasksCount + usage.coursesCount + usage.flashcardsCount
}

function coverMediaIdFromCourse(course: Record<string, unknown>): string {
  const ci = course.coverImage
  if (ci == null || ci === '') return ''
  if (typeof ci === 'number' || typeof ci === 'string') return String(ci)
  if (typeof ci === 'object' && ci !== null && 'id' in ci) return String((ci as { id: unknown }).id)
  return ''
}

const getCachedLessonsTasksCourses = unstable_cache(
  async () => {
    const payload = await getPayload({ config })
    const [lessonsResult, tasksResult, coursesResult] = await Promise.all([
      payload.find({ collection: 'lessons', limit: 1000, depth: 0 }),
      payload.find({ collection: 'tasks', limit: 5000, depth: 1 }),
      payload.find({ collection: 'courses', limit: 500, depth: 0 }),
    ])
    return { lessons: lessonsResult.docs, tasks: tasksResult.docs, courses: coursesResult.docs }
  },
  ['admin-media-usage-data-v2'],
  { revalidate: 30 },
)

async function getFlashcardMediaRefCounts(): Promise<Map<string, number>> {
  const cards = await prisma.flashcard.findMany({
    where: {
      OR: [{ questionImageId: { not: null } }, { answerImageId: { not: null } }],
    },
    select: { questionImageId: true, answerImageId: true },
  })
  const counts = new Map<string, number>()
  for (const card of cards) {
    if (card.questionImageId) {
      counts.set(card.questionImageId, (counts.get(card.questionImageId) ?? 0) + 1)
    }
    if (card.answerImageId) {
      counts.set(card.answerImageId, (counts.get(card.answerImageId) ?? 0) + 1)
    }
  }
  return counts
}

/** All media ids referenced by lessons, tasks, course covers, or flashcards. */
export async function collectUsedMediaIds(): Promise<Set<string>> {
  const used = new Set<string>()
  const [{ lessons, tasks, courses }, flashcardCounts] = await Promise.all([
    getCachedLessonsTasksCourses(),
    getFlashcardMediaRefCounts(),
  ])

  for (const id of flashcardCounts.keys()) used.add(id)

  for (const lesson of lessons as LessonDoc[]) {
    if (!lesson.theoryBlocks || !Array.isArray(lesson.theoryBlocks)) continue
    for (const block of lesson.theoryBlocks) {
      const typedBlock = block as { blockType?: string; image?: number | { id?: number } | string }
      if (typedBlock.blockType !== 'image') continue
      const imageId =
        typeof typedBlock.image === 'number'
          ? String(typedBlock.image)
          : typeof typedBlock.image === 'string'
            ? typedBlock.image
            : String(typedBlock.image?.id ?? '')
      if (imageId) used.add(imageId)
    }
  }

  for (const task of tasks) {
    const taskItem = task as Record<string, unknown>
    const questionMediaId = String(taskItem.questionMedia ?? '')
    const solutionMediaId = String(taskItem.solutionMedia ?? '')
    if (questionMediaId) used.add(questionMediaId)
    if (solutionMediaId) used.add(solutionMediaId)
  }

  for (const course of courses as Array<Record<string, unknown>>) {
    const coverId = coverMediaIdFromCourse(course)
    if (coverId) used.add(coverId)
  }

  return used
}

/** Per-media usage details for the given ids (admin media library cards). */
export async function getMediaUsageForIds(
  mediaIds: Array<number | string>,
): Promise<Map<string, MediaUsage>> {
  const usageMap = new Map<string, MediaUsage>()
  for (const id of mediaIds) {
    usageMap.set(String(id), emptyUsage())
  }

  const [{ lessons, tasks, courses }, flashcardCounts] = await Promise.all([
    getCachedLessonsTasksCourses(),
    getFlashcardMediaRefCounts(),
  ])

  for (const lesson of lessons as LessonDoc[]) {
    if (!lesson.theoryBlocks || !Array.isArray(lesson.theoryBlocks)) continue
    for (const block of lesson.theoryBlocks) {
      const typedBlock = block as { blockType?: string; image?: number | { id?: number } | string }
      if (typedBlock.blockType !== 'image') continue
      const imageId =
        typeof typedBlock.image === 'number'
          ? String(typedBlock.image)
          : typeof typedBlock.image === 'string'
            ? typedBlock.image
            : String(typedBlock.image?.id ?? '')
      const usage = usageMap.get(imageId)
      if (!usage) continue
      usage.lessonsCount++
      if (usage.lessonRefs.length < 3) {
        usage.lessonRefs.push({ id: lesson.id as number, title: lesson.title })
      }
    }
  }

  for (const task of tasks) {
    const taskItem = task as Record<string, unknown>
    const questionMediaId = String(taskItem.questionMedia ?? '')
    const solutionMediaId = String(taskItem.solutionMedia ?? '')
    const lessonValue = taskItem.lesson as { id?: number; title?: string } | number | undefined

    const taskRef = {
      id: taskItem.id as number,
      lessonId: typeof lessonValue === 'number' ? lessonValue : (lessonValue?.id ?? 0),
      lessonTitle: typeof lessonValue === 'object' ? (lessonValue?.title ?? 'Untitled') : 'Untitled',
    }

    if (questionMediaId && usageMap.has(questionMediaId)) {
      const usage = usageMap.get(questionMediaId)!
      usage.tasksCount++
      if (usage.taskRefs.length < 3) usage.taskRefs.push(taskRef)
    }

    if (solutionMediaId && solutionMediaId !== questionMediaId && usageMap.has(solutionMediaId)) {
      const usage = usageMap.get(solutionMediaId)!
      usage.tasksCount++
      if (usage.taskRefs.length < 3) usage.taskRefs.push(taskRef)
    }
  }

  for (const course of courses as Array<Record<string, unknown>>) {
    const coverId = coverMediaIdFromCourse(course)
    if (!coverId || !usageMap.has(coverId)) continue
    const usage = usageMap.get(coverId)!
    usage.coursesCount++
    if (usage.courseRefs.length < 3) {
      usage.courseRefs.push({
        id: course.id as number | string,
        title: String(course.title ?? 'Course'),
      })
    }
  }

  for (const mediaId of mediaIds) {
    const key = String(mediaId)
    const count = flashcardCounts.get(key)
    if (!count) continue
    const usage = usageMap.get(key)
    if (usage) usage.flashcardsCount = count
  }

  return usageMap
}

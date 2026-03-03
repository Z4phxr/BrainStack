import { getPayload } from 'payload'
import config from '@payload-config'
import { notFound } from 'next/navigation'
import { LessonBuilder } from '@/components/admin/lesson-builder'

// Type definitions
interface Lesson {
  id: string
  title: string
  content?: unknown
  theoryBlocks?: unknown[]
  isPublished: boolean
  course: unknown
  module: unknown
}

interface Task {
  id: string
  type: string
  prompt: string
  choices?: Array<{ text: string }>
  correctAnswer?: string
  solution?: string
  points: number
  order: number
  isPublished: boolean
}

export default async function LessonBuilderPage({
  params,
}: {
  params: Promise<{ lessonId: string }>
}) {
  const { lessonId } = await params
  const payload = await getPayload({ config })

  let lesson: Lesson | null = null
  let tasks: Task[] = []

  try {
    const lessonData = await payload.findByID({
      collection: 'lessons',
      id: lessonId,
      depth: 2,
    })

    if (!lessonData) {
      notFound()
    }

    const { docs: tasksData } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          equals: lessonId,
        },
      },
      sort: 'order',
      depth: 2,
    })

    lesson = {
      id: String(lessonData.id),
      title: lessonData.title as string,
      content: lessonData.content,
      theoryBlocks: lessonData.theoryBlocks as unknown[] | undefined,
      isPublished: lessonData.isPublished as boolean,
      course: lessonData.course,
      module: lessonData.module,
    }

    tasks = tasksData.map((task) => {
      const taskItem = task as Record<string, unknown>
      return {
        id: String(taskItem.id),
        type: taskItem.type as string,
        prompt: taskItem.prompt as string,
        choices: taskItem.choices as Array<{ text: string }> | undefined,
        correctAnswer: taskItem.correctAnswer as string | undefined,
        solution: taskItem.solution as string | undefined,
        points: taskItem.points as number,
        order: taskItem.order as number,
        isPublished: taskItem.isPublished as boolean,
      }
    })
  } catch (error) {
    console.error('Error loading lesson:', error)
    notFound()
  }

  if (!lesson) {
    notFound()
  }

  return <LessonBuilder lesson={lesson} tasks={tasks} />
}


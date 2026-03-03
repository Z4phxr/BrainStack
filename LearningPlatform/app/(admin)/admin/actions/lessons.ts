'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { lessonFormSchema } from '../schemas'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { logActivity, ActivityAction } from '@/lib/activity-log'

export async function getLessonsByModule(moduleId: string) {
  await requireAdmin()
  const payload = await getPayload({ config })

  const { docs } = await payload.find({
    collection: 'lessons',
    where: { module: { equals: moduleId } },
    sort: 'order',
  })

  return docs
}

export async function getLessonById(id: string) {
  await requireAdmin()
  const payload = await getPayload({ config })

  const lesson = await payload.findByID({
    collection: 'lessons',
    id,
  })

  return lesson
}

export async function createLesson(data: z.infer<typeof lessonFormSchema>) {
  const adminUser = await requireAdmin()
  const validated = lessonFormSchema.parse(data)
  const payload = await getPayload({ config })

  const lesson = await payload.create({
    collection: 'lessons',
    data: {
      title: validated.title,
      course: String(validated.course),
      module: String(validated.module),
      content: validated.content,
      order: validated.order,
      isPublished: false,
      lastUpdatedBy: adminUser.email,
    },
  })

  logActivity({
    action:       ActivityAction.LESSON_CREATED,
    actorUserId:  adminUser.id,
    actorEmail:   adminUser.email,
    resourceType: 'lesson',
    resourceId:   String(lesson.id),
    metadata:     { title: lesson.title, moduleId: String(validated.module) },
  })

  revalidatePath('/admin/dashboard')
  return lesson
}

export async function updateLesson(
  id: string,
  data: Partial<z.infer<typeof lessonFormSchema> & { isPublished?: boolean; theoryBlocks?: unknown[] }>
) {
  const adminUser = await requireAdmin()
  const payload = await getPayload({ config })

  // Clean up the data to only include defined fields
  const updateData: Record<string, unknown> = {}
  if (data.title !== undefined) updateData.title = data.title
  if (data.content !== undefined) updateData.content = data.content
  if (data.course !== undefined) updateData.course = data.course
  if (data.module !== undefined) updateData.module = data.module
  if (data.order !== undefined) updateData.order = data.order
  if (data.isPublished !== undefined) updateData.isPublished = data.isPublished
  if (data.theoryBlocks !== undefined) updateData.theoryBlocks = data.theoryBlocks
  updateData.lastUpdatedBy = adminUser.email

  const lesson = await payload.update({
    collection: 'lessons',
    id: String(id),
    data: updateData,
  })

  logActivity({
    action:       ActivityAction.LESSON_UPDATED,
    actorUserId:  adminUser.id,
    actorEmail:   adminUser.email,
    resourceType: 'lesson',
    resourceId:   String(id),
    metadata:     { title: lesson.title },
  })

  revalidatePath('/admin/lessons')
  revalidatePath(`/admin/lessons/${id}`)
  return lesson
}

export async function toggleLessonPublish(id: string, isPublished: boolean) {
  const adminUser = await requireAdmin()
  const payload = await getPayload({ config })

  const lesson = await payload.update({
    collection: 'lessons',
    id: String(id),
    data: { isPublished },
  })

  logActivity({
    action:       isPublished ? ActivityAction.LESSON_PUBLISHED : ActivityAction.LESSON_UNPUBLISHED,
    actorUserId:  adminUser.id,
    actorEmail:   adminUser.email,
    resourceType: 'lesson',
    resourceId:   String(id),
    metadata:     { title: lesson.title },
  })

  revalidatePath('/admin/dashboard')
  revalidatePath(`/admin/lessons/${id}`)
  return lesson
}

export async function deleteLesson(id: string) {
  const adminUser = await requireAdmin()
  const payload = await getPayload({ config })

  try {
    // Fetch lesson record so we know its module for renumbering after deletion
    const lesson = await payload.findByID({ collection: 'lessons', id: String(id) })
    if (!lesson) throw new Error('Lesson not found')

    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: { lesson: { equals: id } },
    })

    const taskIds = tasks.map(t => String(t.id))

    // Delete all Prisma progress records first
    logger.info(`Deleting progress records for lesson ${id}...`)

    if (taskIds.length > 0) {
      const deletedTasks = await prisma.taskProgress.deleteMany({
        where: { taskId: { in: taskIds } },
      })
      logger.info(`Deleted ${deletedTasks.count} task progress records`)
    }

    const deletedLessons = await prisma.lessonProgress.deleteMany({
      where: { lessonId: id },
    })
    logger.info(`Deleted ${deletedLessons.count} lesson progress records`)

    // Now safe to delete Payload CMS records
    logger.info(`Deleting Payload CMS records for lesson ${id}...`)

    for (const task of tasks) {
      await payload.delete({ collection: 'tasks', id: String(task.id) })
    }
    logger.info(`Deleted ${tasks.length} tasks`)

    await payload.delete({ collection: 'lessons', id: String(id) })
    logger.info(`Lesson ${id} deleted`)

    logActivity({
      action:       ActivityAction.LESSON_DELETED,
      actorUserId:  adminUser.id,
      actorEmail:   adminUser.email,
      resourceType: 'lesson',
      resourceId:   String(id),
    })

    // After deleting a lesson, re-number remaining lessons in the same module
    try {
      const moduleId = typeof lesson.module === 'object' && lesson.module !== null
        ? String((lesson.module as any).id)
        : String(lesson.module)

      const { docs: remaining } = await payload.find({
        collection: 'lessons',
        where: { module: { equals: moduleId } },
        sort: 'order',
      })

      for (let i = 0; i < remaining.length; i++) {
        const l = remaining[i]
        const desiredOrder = i + 1
        if (Number(l.order) !== desiredOrder) {
          await payload.update({ collection: 'lessons', id: String(l.id), data: { order: desiredOrder } })
        }
      }
    } catch (err) {
      logger.warning('Failed to renumber lessons after deletion', { error: err })
    }

    revalidatePath('/admin/dashboard')
    revalidatePath('/admin/lessons')
    logger.info(`Lesson ${id} deleted successfully`)
  } catch (error) {
    logger.error('Failed to delete lesson', { error })
    throw new Error(`Failed to delete lesson: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

/** Move a lesson up or down within its module by swapping order with adjacent lesson. */
export async function moveLesson(id: string, direction: 'up' | 'down') {
  await requireAdmin()
  const payload = await getPayload({ config })

  const lesson = await payload.findByID({ collection: 'lessons', id: String(id) })
  if (!lesson) throw new Error('Lesson not found')

  const moduleId = typeof lesson.module === 'object' && lesson.module !== null
    ? String((lesson.module as any).id)
    : String(lesson.module)

  const currentOrder = Number(lesson.order) || 1
  const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
  if (targetOrder < 1) return null

  // Find the lesson currently at targetOrder and swap
  const { docs: others } = await payload.find({
    collection: 'lessons',
    where: {
      module: { equals: moduleId },
      order: { equals: targetOrder },
    },
  })

  if (others.length > 0) {
    const other = others[0]
    await payload.update({ collection: 'lessons', id: String(other.id), data: { order: currentOrder } })
  }

  await payload.update({ collection: 'lessons', id: String(id), data: { order: targetOrder } })

  // Re-number to ensure consistency (in case of gaps)
  try {
    const { docs: remaining } = await payload.find({
      collection: 'lessons',
      where: { module: { equals: moduleId } },
      sort: 'order',
    })
    for (let i = 0; i < remaining.length; i++) {
      const l = remaining[i]
      const desiredOrder = i + 1
      if (Number(l.order) !== desiredOrder) {
        await payload.update({ collection: 'lessons', id: String(l.id), data: { order: desiredOrder } })
      }
    }
  } catch (err) {
    logger.warning('Failed to renumber lessons after move', { error: err })
  }

  revalidatePath('/admin/dashboard')
  return true
}

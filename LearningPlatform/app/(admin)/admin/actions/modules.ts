'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { z } from 'zod'
import { moduleFormSchema } from '../schemas'
import { prisma } from '@/lib/prisma'
import { logger } from '@/lib/logger'
import { logActivity, ActivityAction } from '@/lib/activity-log'

export async function getModuleById(id: string) {
  await requireAdmin()
  const payload = await getPayload({ config })

  const courseModule = await payload.findByID({
    collection: 'modules',
    id,
  })

  return courseModule
}

export async function getModulesByCourse(courseId: string) {
  await requireAdmin()
  const payload = await getPayload({ config })

  const { docs: modules } = await payload.find({
    collection: 'modules',
    where: { course: { equals: courseId } },
    sort: 'order',
  })

  const moduleIds = modules.map(m => String(m.id))

  if (moduleIds.length === 0) {
    return modules
  }

  const { docs: lessons } = await payload.find({
    collection: 'lessons',
    where: { module: { in: moduleIds } },
    sort: 'order',
  })

  // Attach lessons to their respective modules
  const modulesWithLessons = modules.map(module => {
    const moduleLessons = lessons.filter(lesson => {
      const lessonModuleId = typeof lesson.module === 'object' && lesson.module !== null
        ? String((lesson.module as any).id)
        : String(lesson.module)
      return lessonModuleId === String(module.id)
    })
    return { ...module, lessons: moduleLessons }
  })

  return modulesWithLessons
}

export async function createModule(data: z.infer<typeof moduleFormSchema>) {
  const admin = await requireAdmin()
  const validated = moduleFormSchema.parse(data)
  const payload = await getPayload({ config })

  const courseModule = await payload.create({
    collection: 'modules',
    data: {
      title: validated.title,
      course: String(validated.course),
      order: validated.order,
      isPublished: false,
    },
  })

  logActivity({
    action:       ActivityAction.MODULE_CREATED,
    actorUserId:  admin.id,
    actorEmail:   admin.email,
    resourceType: 'module',
    resourceId:   String(courseModule.id),
    metadata:     { title: courseModule.title, courseId: String(validated.course) },
  })

  revalidatePath('/admin/dashboard')
  return courseModule
}

export async function updateModule(id: string, data: Partial<z.infer<typeof moduleFormSchema>>) {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })

  const courseModule = await payload.update({
    collection: 'modules',
    id,
    data,
  })

  logActivity({
    action:       ActivityAction.MODULE_UPDATED,
    actorUserId:  admin.id,
    actorEmail:   admin.email,
    resourceType: 'module',
    resourceId:   String(id),
    metadata:     { title: courseModule.title },
  })

  revalidatePath('/admin/dashboard')
  return courseModule
}

export async function toggleModulePublish(id: string, isPublished: boolean) {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })

  const courseModule = await payload.update({
    collection: 'modules',
    id,
    data: { isPublished },
  })

  logActivity({
    action:       isPublished ? ActivityAction.MODULE_PUBLISHED : ActivityAction.MODULE_UNPUBLISHED,
    actorUserId:  admin.id,
    actorEmail:   admin.email,
    resourceType: 'module',
    resourceId:   String(id),
    metadata:     { title: courseModule.title },
  })

  revalidatePath('/admin/dashboard')
  return courseModule
}

export async function deleteModule(id: string) {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })

  try {
    // 1. Find all lessons in this module
    const { docs: lessons } = await payload.find({
      collection: 'lessons',
      where: { module: { equals: id } },
    })

    const lessonIds = lessons.map(l => String(l.id))

    // 2. Find all tasks for these lessons
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: { lesson: { in: lessonIds } },
    })

    const taskIds = tasks.map(t => String(t.id))

    // Delete all Prisma progress records first
    logger.info(`Deleting progress records for module ${id}...`)

    if (taskIds.length > 0) {
      const deletedTasks = await prisma.taskProgress.deleteMany({
        where: { taskId: { in: taskIds } },
      })
      logger.info(`Deleted ${deletedTasks.count} task progress records`)
    }

    if (lessonIds.length > 0) {
      const deletedLessons = await prisma.lessonProgress.deleteMany({
        where: { lessonId: { in: lessonIds } },
      })
      logger.info(`Deleted ${deletedLessons.count} lesson progress records`)
    }

    // Now safe to delete Payload CMS records
    logger.info(`Deleting Payload CMS records for module ${id}...`)

    for (const task of tasks) {
      await payload.delete({ collection: 'tasks', id: String(task.id) })
    }

    for (const lesson of lessons) {
      await payload.delete({ collection: 'lessons', id: String(lesson.id) })
    }

    await payload.delete({ collection: 'modules', id })

    logActivity({
      action:       ActivityAction.MODULE_DELETED,
      actorUserId:  admin.id,
      actorEmail:   admin.email,
      resourceType: 'module',
      resourceId:   String(id),
    })

    revalidatePath('/admin/dashboard')
    logger.info(`Module ${id} deleted successfully`)
  } catch (error) {
    logger.error('Failed to delete module', { error })
    throw new Error(`Failed to delete module: ${error instanceof Error ? error.message : 'Unknown error'}`)
  }
}

export async function moveModule(id: string, direction: 'up' | 'down') {
  await requireAdmin()
  const payload = await getPayload({ config })

  const courseModule = await payload.findByID({ collection: 'modules', id: String(id) })
  if (!courseModule) throw new Error('Module not found')

  const courseId = typeof courseModule.course === 'object' && courseModule.course !== null
    ? String((courseModule.course as any).id)
    : String(courseModule.course)

  const currentOrder = Number(courseModule.order) || 1
  const targetOrder = direction === 'up' ? currentOrder - 1 : currentOrder + 1
  if (targetOrder < 1) return null

  const { docs: others } = await payload.find({
    collection: 'modules',
    where: {
      course: { equals: courseId },
      order: { equals: targetOrder },
    },
  })

  if (others.length > 0) {
    const other = others[0]
    await payload.update({ collection: 'modules', id: String(other.id), data: { order: currentOrder } })
  }

  await payload.update({ collection: 'modules', id: String(id), data: { order: targetOrder } })

  try {
    const { docs: remaining } = await payload.find({
      collection: 'modules',
      where: { course: { equals: courseId } },
      sort: 'order',
    })
    for (let i = 0; i < remaining.length; i++) {
      const m = remaining[i]
      const desiredOrder = i + 1
      if (Number(m.order) !== desiredOrder) {
        await payload.update({ collection: 'modules', id: String(m.id), data: { order: desiredOrder } })
      }
    }
  } catch (err) {
    logger.warning('Failed to renumber modules after move', { error: err })
  }

  revalidatePath('/admin/dashboard')
  return true
}

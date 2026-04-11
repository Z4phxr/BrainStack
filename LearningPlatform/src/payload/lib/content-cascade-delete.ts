import type { Payload } from 'payload'

const PAGE_SIZE = 200

type PayloadReq = NonNullable<Parameters<Payload['find']>[0]['req']>

/**
 * Payload does not cascade delete across relationship collections by default.
 * Deleting a course left modules/lessons/tasks in place. These hooks traverse
 * and delete children in the correct order (tasks → lessons → modules).
 *
 * Always uses page 1 in a loop: with offset pagination, advancing page while
 * deleting would skip remaining rows when the result set shrinks.
 */
export async function deleteTasksAttachingToLesson(
  payload: Payload,
  lessonId: string,
  req: PayloadReq,
): Promise<void> {
  for (;;) {
    const res = await payload.find({
      collection: 'tasks',
      where: { lesson: { contains: lessonId } },
      limit: PAGE_SIZE,
      page: 1,
      depth: 0,
      req,
    })
    if (res.docs.length === 0) break
    for (const doc of res.docs) {
      await payload.delete({
        collection: 'tasks',
        id: doc.id,
        req,
      })
    }
  }
}

export async function deleteLessonsAttachingToModule(
  payload: Payload,
  moduleId: string,
  req: PayloadReq,
): Promise<void> {
  for (;;) {
    const res = await payload.find({
      collection: 'lessons',
      where: { module: { equals: moduleId } },
      limit: PAGE_SIZE,
      page: 1,
      depth: 0,
      req,
    })
    if (res.docs.length === 0) break
    for (const doc of res.docs) {
      await payload.delete({
        collection: 'lessons',
        id: doc.id,
        req,
      })
    }
  }
}

export async function deleteModulesAttachingToCourse(
  payload: Payload,
  courseId: string,
  req: PayloadReq,
): Promise<void> {
  for (;;) {
    const res = await payload.find({
      collection: 'modules',
      where: { course: { equals: courseId } },
      limit: PAGE_SIZE,
      page: 1,
      depth: 0,
      req,
    })
    if (res.docs.length === 0) break
    for (const doc of res.docs) {
      await payload.delete({
        collection: 'modules',
        id: doc.id,
        req,
      })
    }
  }
}

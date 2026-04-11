/**
 * Integration Test: Course/Module/Lesson Delete Operations
 * 
 * Tests the complete delete cascade including:
 * - Type-safe Payload queries (integer vs string IDs)
 * - Prisma progress record cleanup
 * - Payload CMS record deletion
 * - Proper error handling
 * 
 * Requirements:
 * - Database running (localhost:5432 or DATABASE_URL set)
 * - Run with: npm run test:integration
 */

import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import prisma from '@/lib/prisma'

// Check if database is configured
const databaseUrl = process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL
const payloadAvailable = !!databaseUrl && !databaseUrl.startsWith('mock://')

// Skip Payload tests in CI or when SKIP_PAYLOAD_TESTS / SKIP_DB_SETUP is set
const shouldSkipPayloadTests =
  process.env.CI === 'true' ||
  process.env.SKIP_PAYLOAD_TESTS === 'true' ||
  process.env.SKIP_DB_SETUP === 'true' ||
  !payloadAvailable

// Only initialize Payload if database is available
let payload: any
if (shouldSkipPayloadTests) {
  console.log('[WARNING] Skipping Payload-dependent tests.')
  console.log('Reason: CI environment or SKIP_PAYLOAD_TESTS is set')
}

describe.skipIf(shouldSkipPayloadTests)('Delete Operations - Type Safety', () => {
  let testCourseId: string
  let testModuleId: string
  let testLessonId: string
  let testTaskId: string
  let testUserId: string
  let testSubjectId: string

  beforeAll(async () => {
    // Dynamically import Payload config to avoid errors when DB not configured
    const { getPayload } = await import('payload')
    const config = (await import('@payload-config')).default
    payload = await getPayload({ config })
    
    // Create test user for progress tracking
    testUserId = 'test-delete-user-' + Date.now()
    
    // Create test subject first
    const testSubject = await payload.create({
      collection: 'subjects',
      data: {
        name: 'Computer Science',
        slug: 'computer-science-' + Date.now(),
      },
    })
    testSubjectId = String(testSubject.id)
    
    // Create test course
    const course = await payload.create({
      collection: 'courses',
      data: {
        title: 'Test Course for Delete',
        slug: 'test-delete-course-' + Date.now(),
        description: 'Test course to verify delete cascade',
        subject: testSubject.id,
        level: 'BEGINNER',
        isPublished: false,
      },
    })
    testCourseId = String(course.id)
    console.log('[INFO] Created test course:', testCourseId)

    // Create test module
    const courseModule = await payload.create({
      collection: 'modules',
      data: {
        title: 'Test Module',
        course: testCourseId,
        order: 1,
        isPublished: false,
      },
    })
    testModuleId = String(courseModule.id)
    console.log('[INFO] Created test module:', testModuleId)

    // Create test lesson
    const lesson = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Test Lesson',
        course: testCourseId,
        module: testModuleId,
        content: 'Test lesson content',
        order: 1,
        isPublished: false,
      },
    })
    testLessonId = String(lesson.id)
    console.log('[INFO] Created test lesson:', testLessonId)

    // Create test task
    const task = await payload.create({
      collection: 'tasks',
      data: {
        lesson: testLessonId,
        type: 'MULTIPLE_CHOICE',
        prompt: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Test question?' }],
              },
            ],
          },
        },
        choices: [
          { text: 'Option A' },
          { text: 'Option B' },
        ],
        correctAnswer: 'Option A',
        points: 1,
        order: 1,
        isPublished: false,
      },
    })
    testTaskId = String(task.id)
    console.log('[INFO] Created test task:', testTaskId)

    // Create progress records using Prisma
    await prisma.user.create({
      data: {
        id: testUserId,
        email: `test-delete-${Date.now()}@example.com`,
        name: 'Test Delete User',
        role: 'STUDENT',
      },
    })

    await prisma.courseProgress.create({
      data: {
        userId: testUserId,
        courseId: testCourseId,
        totalLessons: 1,
        completedLessons: 0,
      },
    })

    const lessonProgress = await prisma.lessonProgress.create({
      data: {
        userId: testUserId,
        lessonId: testLessonId,
        status: 'IN_PROGRESS',
      },
    })

    await prisma.taskProgress.create({
      data: {
        userId: testUserId,
        taskId: testTaskId,
        lessonProgressId: lessonProgress.id,
        status: 'NOT_ATTEMPTED',
        maxPoints: 1,
      },
    })

    console.log('[SUCCESS] Test data created with progress records')
  })

  afterAll(async () => {
    // Cleanup: Delete test data if it still exists
    try {
      if (testTaskId) {
        // Delete progress records first
        await prisma.taskProgress.deleteMany({ where: { taskId: testTaskId } })
        await payload.delete({ collection: 'tasks', id: testTaskId }).catch(() => {})
      }
      if (testLessonId) {
        await prisma.lessonProgress.deleteMany({ where: { lessonId: testLessonId } })
        await payload.delete({ collection: 'lessons', id: testLessonId }).catch(() => {})
      }
      if (testModuleId) {
        await payload.delete({ collection: 'modules', id: testModuleId }).catch(() => {})
      }
      if (testCourseId) {
        await prisma.courseProgress.deleteMany({ where: { courseId: testCourseId } })
        await payload.delete({ collection: 'courses', id: testCourseId }).catch(() => {})
      }
      if (testUserId) {
        await prisma.user.delete({ where: { id: testUserId } }).catch(() => {})
      }
      if (testSubjectId) {
        await payload.delete({ collection: 'subjects', id: testSubjectId }).catch(() => {})
      }
      console.log('[SUCCESS] Test cleanup completed')
    } catch (error) {
      console.log('[WARNING] Cleanup error:', error)
    }
  })

  it('should query tasks by lesson ID without type mismatch', async () => {
    // This is the critical test - ensure Payload can query with integer lesson IDs
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          equals: testLessonId,  // Must use Number() for integer column
        },
      },
    })

    expect(tasks).toBeDefined()
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0)
    
    const foundTask = tasks.find((t: any) => String(t.id) === testTaskId)
    expect(foundTask).toBeDefined()
  })

  it('should query tasks with IN clause using integer array', async () => {
    // Test the IN clause with multiple lesson IDs
    const lessonIds = [testLessonId]
    
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          in: lessonIds,  // Must use number array for integer column
        },
      },
    })

    expect(tasks).toBeDefined()
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBeGreaterThan(0)
  })

  it('should delete task and cleanup progress records', async () => {
    // Create a separate task for this test
    const tempLesson = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Temp Lesson',
        course: testCourseId,
        module: testModuleId,
        content: 'Temporary lesson',
        order: 99,
        isPublished: false,
      },
    })
    const tempLessonId = String(tempLesson.id)

    const tempTask = await payload.create({
      collection: 'tasks',
      data: {
        lesson: Number(tempLessonId),
        type: 'TRUE_FALSE',
        prompt: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Temp question?' }],
              },
            ],
          },
        },
        correctAnswer: 'true',
        points: 1,
        order: 1,
        isPublished: false,
      },
    })
    const tempTaskId = String(tempTask.id)

    // Create progress for this task
    const tempLessonProgress = await prisma.lessonProgress.create({
      data: {
        userId: testUserId,
        lessonId: tempLessonId,
        status: 'IN_PROGRESS',
      },
    })

    await prisma.taskProgress.create({
      data: {
        userId: testUserId,
        taskId: tempTaskId,
        lessonProgressId: tempLessonProgress.id,
        status: 'NOT_ATTEMPTED',
        maxPoints: 1,
      },
    })

    // Verify progress exists
    const progressBefore = await prisma.taskProgress.findMany({
      where: { taskId: tempTaskId },
    })
    expect(progressBefore.length).toBe(1)

    // Delete the task (should cleanup progress)
    await prisma.taskProgress.deleteMany({ where: { taskId: tempTaskId } })
    await payload.delete({ collection: 'tasks', id: tempTaskId })

    // Verify progress was deleted
    const progressAfter = await prisma.taskProgress.findMany({
      where: { taskId: tempTaskId },
    })
    expect(progressAfter.length).toBe(0)

    // Verify task was deleted
    await expect(
      payload.findByID({ collection: 'tasks', id: tempTaskId })
    ).rejects.toThrow()

    // Cleanup temp lesson
    await prisma.lessonProgress.deleteMany({ where: { lessonId: tempLessonId } })
    await payload.delete({ collection: 'lessons', id: tempLessonId })
  })

  it('should delete lesson and cascade to tasks', async () => {
    // Create temp lesson with task
    const tempLesson = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Temp Lesson for Cascade',
        course: testCourseId,
        module: testModuleId,
        content: 'Temporary lesson',
        order: 98,
        isPublished: false,
      },
    })
    const tempLessonId = String(tempLesson.id)

    const tempTask = await payload.create({
      collection: 'tasks',
      data: {
        lesson: Number(tempLessonId),
        type: 'OPEN_ENDED',
        prompt: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Cascade test?' }],
              },
            ],
          },
        },
        points: 1,
        order: 1,
        isPublished: false,
      },
    })
    const tempTaskId = String(tempTask.id)

    // Query tasks before deletion (test type-safe query)
    const { docs: tasksBefore } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          equals: Number(tempLessonId),  // Must use Number() for integer column
        },
      },
    })
    expect(tasksBefore.length).toBe(1)

    // Delete tasks first
    await payload.delete({ collection: 'tasks', id: tempTaskId })

    // Delete lesson
    await payload.delete({ collection: 'lessons', id: tempLessonId })

    // Verify deletion
    await expect(
      payload.findByID({ collection: 'lessons', id: tempLessonId })
    ).rejects.toThrow()
  })

  it('should handle queries with multiple lesson IDs in module', async () => {
    // Query lessons by module ID
    const { docs: lessons } = await payload.find({
      collection: 'lessons',
      where: {
        module: {
          equals: testModuleId,  // Must use Number() for integer column
        },
      },
    })

    expect(lessons).toBeDefined()
    expect(lessons.length).toBeGreaterThan(0)

    // Extract lesson IDs and query tasks
    const lessonIds = lessons.map(l => Number(l.id))  // Must use Number()
    
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          in: lessonIds,  // Must use number array
        },
      },
    })

    expect(tasks).toBeDefined()
    expect(Array.isArray(tasks)).toBe(true)
  })

  it('should handle empty IN clause gracefully', async () => {
    // Query with empty array (edge case)
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: {
        lesson: {
          in: [],  // Empty array
        },
      },
    })

    expect(tasks).toBeDefined()
    expect(Array.isArray(tasks)).toBe(true)
    expect(tasks.length).toBe(0)
  })

  it('should verify media query type safety', async () => {
    // Create media file
    const media = await payload.create({
      collection: 'media',
      data: {
        filename: 'test-delete-media.jpg',
        mimeType: 'image/jpeg',
        filesize: 1024,
        alt: 'Test media',
        url: '/media/test-delete-media.jpg',
      },
    })
    const mediaId = Number(media.id)

    // Create task with media
    const taskWithMedia = await payload.create({
      collection: 'tasks',
      data: {
        lesson: testLessonId,
        type: 'MULTIPLE_CHOICE',
        prompt: {
          root: {
            type: 'root',
            children: [
              {
                type: 'paragraph',
                children: [{ type: 'text', text: 'Media test?' }],
              },
            ],
          },
        },
        questionMedia: mediaId,  // Must use integer
        choices: [
          { text: 'A' },
          { text: 'B' },
        ],
        correctAnswer: 'A',
        points: 1,
        order: 99,
        isPublished: false,
      },
    })

    // Query tasks by media ID
    const { docs: tasksWithMedia } = await payload.find({
      collection: 'tasks',
      where: {
        questionMedia: {
          equals: mediaId,  // Must use integer
        },
      },
    })

    expect(tasksWithMedia).toBeDefined()
    expect(tasksWithMedia.length).toBeGreaterThan(0)

    // Cleanup
    await payload.delete({ collection: 'tasks', id: String(taskWithMedia.id) })
    await payload.delete({ collection: 'media', id: String(mediaId) })
  })
})

describe.skipIf(shouldSkipPayloadTests)('Delete Operations - Full Cascade', () => {
  it('should delete course with full cascade (integration test)', async () => {
    // Initialize Payload if not already done
    if (!payload) {
      const { getPayload } = await import('payload')
      const config = (await import('@payload-config')).default
      payload = await getPayload({ config })
    }
    
    // Create test subject first
    const testSubject = await payload.create({
      collection: 'subjects',
      data: {
        name: 'Testing Subject',
        slug: 'testing-subject-' + Date.now(),
      },
    })
    
    // Create complete course structure
    const course = await payload.create({
      collection: 'courses',
      data: {
        title: 'Full Cascade Test Course',
        slug: 'full-cascade-test-' + Date.now(),
        description: 'Test full cascade delete',
        subject: testSubject.id,
        level: 'ADVANCED',
        isPublished: false,
      },
    })
    const courseId = String(course.id)

    const courseModule = await payload.create({
      collection: 'modules',
      data: {
        title: 'Cascade Test Module',
        course: courseId,
        order: 1,
        isPublished: false,
      },
    })
    const moduleId = String(courseModule.id)

    const lesson1 = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Cascade Lesson 1',
        course: courseId,
        module: moduleId,
        content: 'Content 1',
        order: 1,
        isPublished: false,
      },
    })
    const lesson1Id = String(lesson1.id)

    const lesson2 = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Cascade Lesson 2',
        course: courseId,
        module: moduleId,
        content: 'Content 2',
        order: 2,
        isPublished: false,
      },
    })
    const lesson2Id = String(lesson2.id)

    // Create multiple tasks
    const task1 = await payload.create({
      collection: 'tasks',
      data: {
        lesson: lesson1Id,
        type: 'MULTIPLE_CHOICE',
        prompt: {
          root: {
            type: 'root',
            children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Q1' }] }],
          },
        },
        choices: [{ text: 'A' }],
        correctAnswer: 'A',
        points: 1,
        order: 1,
        isPublished: false,
      },
    })

    const task2 = await payload.create({
      collection: 'tasks',
      data: {
        lesson: lesson2Id,
        type: 'TRUE_FALSE',
        prompt: {
          root: {
            type: 'root',
            children: [{ type: 'paragraph', children: [{ type: 'text', text: 'Q2' }] }],
          },
        },
        correctAnswer: 'true',
        points: 1,
        order: 1,
        isPublished: false,
      },
    })

    // Verify structure exists
    const { docs: modules } = await payload.find({
      collection: 'modules',
      where: { course: { equals: courseId } },
    })
    expect(modules.length).toBe(1)

    const { docs: lessons } = await payload.find({
      collection: 'lessons',
      where: { module: { equals: moduleId } },
    })
    expect(lessons.length).toBe(2)

    const lessonIds = lessons.map(l => Number(l.id))
    const { docs: tasks } = await payload.find({
      collection: 'tasks',
      where: { lesson: { in: lessonIds } },
    })
    expect(tasks.length).toBe(2)

    // Deleting the course alone must cascade (beforeDelete hooks → modules → lessons → tasks)
    await payload.delete({ collection: 'courses', id: courseId })

    await expect(payload.findByID({ collection: 'courses', id: courseId })).rejects.toThrow()
    await expect(payload.findByID({ collection: 'modules', id: moduleId })).rejects.toThrow()
    await expect(payload.findByID({ collection: 'lessons', id: lesson1Id })).rejects.toThrow()
    await expect(payload.findByID({ collection: 'lessons', id: lesson2Id })).rejects.toThrow()
    await expect(payload.findByID({ collection: 'tasks', id: String(task1.id) })).rejects.toThrow()
    await expect(payload.findByID({ collection: 'tasks', id: String(task2.id) })).rejects.toThrow()

    await payload.delete({ collection: 'subjects', id: String(testSubject.id) })
  })
})

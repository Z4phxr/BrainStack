import { describe, it, expect, beforeAll, afterAll } from 'vitest'
import { config } from 'dotenv'

// Load environment variables before Payload import
config()

// Only import Payload if DB URL is available
let payload: any
let payloadAvailable = false

try {
  if (process.env.PAYLOAD_DATABASE_URL || process.env.DATABASE_URL) {
    const { getPayload } = require('payload')
    const payloadConfig = require('@payload-config')
    payloadAvailable = true
    
    beforeAll(async () => {
      payload = await getPayload({ config: payloadConfig.default })
    })
  }
} catch (error) {
  console.warn('[WARNING] Payload not available for testing. Skipping media type tests.')
}

/**
 * Integration Test: Media ID Type Mismatch Prevention
 * 
 * This test verifies that media IDs are properly converted to strings
 * before being passed to Payload queries, preventing the PostgreSQL error:
 * "operator does not exist: integer = character varying"
 * 
 * Context: Payload CMS uses string IDs, but the migration created question_media_id
 * and solution_media_id columns as integers. When querying, we must convert
 * integer media IDs to strings to match Payload's expected type.
 * 
 * Requirements:
 * - Database must be running (localhost:5432 or DATABASE_URL set)
 * - Run with: npm run test:integration
 */

describe.skipIf(!payloadAvailable)('Media ID Type Mismatch Prevention', () => {
  let testLessonId: string
  let testTaskId: string

  afterAll(async () => {
    // Cleanup test data
    if (testTaskId && payload) {
      await payload.delete({ collection: 'tasks', id: testTaskId }).catch(() => {})
    }
    if (testLessonId && payload) {
      await payload.delete({ collection: 'lessons', id: testLessonId }).catch(() => {})
    }
  })

  it('should handle media ID queries without type mismatch errors', async () => {
    // Skip this test if no media exists in the database
    const { docs: existingMedia } = await payload.find({
      collection: 'media',
      limit: 1,
    })

    if (existingMedia.length === 0) {
      console.log('[WARNING] No media found in database, skipping media query test')
      return
    }

    const media = existingMedia[0]
    const mediaIdStr = String(media.id)

    // Verify media ID type
    expect(media.id).toBeDefined()
    expect(typeof media.id === 'string' || typeof media.id === 'number').toBe(true)

    // This query should NOT throw "operator does not exist: integer = character varying"
    const { docs: tasksWithQuestionMedia } = await payload.find({
      collection: 'tasks',
      where: {
        questionMedia: { equals: mediaIdStr },
      },
      limit: 10,
    })

    // Query should succeed even if no tasks found
    expect(tasksWithQuestionMedia).toBeDefined()
    expect(Array.isArray(tasksWithQuestionMedia)).toBe(true)

    // Test OR query (both questionMedia and solutionMedia)
    const { docs: tasksWithMedia } = await payload.find({
      collection: 'tasks',
      where: {
        or: [
          { questionMedia: { equals: mediaIdStr } },
          { solutionMedia: { equals: mediaIdStr } },
        ],
      },
      limit: 10,
    })

    expect(tasksWithMedia).toBeDefined()
    expect(Array.isArray(tasksWithMedia)).toBe(true)
  })

  it('should create task with media IDs as strings', async () => {
    // Skip if no existing media or courses
    const { docs: existingMedia } = await payload.find({
      collection: 'media',
      limit: 1,
    })
    const { docs: courses } = await payload.find({
      collection: 'courses',
      limit: 1,
    })

    if (existingMedia.length === 0 || courses.length === 0) {
      console.log('[WARNING] Insufficient test data (media/courses), skipping task creation test')
      return
    }

    const media = existingMedia[0]
    const testCourse = courses[0]
    const mediaIdStr = String(media.id)

    // Create test lesson
    const lesson = await payload.create({
      collection: 'lessons',
      data: {
        title: 'Test Lesson for Media Type Test',
        course: String(testCourse.id),
        order: 999,
        isPublished: false,
      },
    })
    testLessonId = String(lesson.id)

    // Create task with media IDs (must be strings)
    const task = await payload.create({
      collection: 'tasks',
      data: {
        lesson: testLessonId,
        type: 'MULTIPLE_CHOICE',
        prompt: {
          root: {
            type: 'root',
            children: [{
              type: 'paragraph',
              children: [{ type: 'text', text: 'Test question with media' }]
            }]
          }
        },
        questionMedia: mediaIdStr, // Must be string, not number
        solutionMedia: mediaIdStr, // Must be string, not number
        choices: [
          { text: 'Option A' },
          { text: 'Option B' },
          { text: 'Option C' },
        ],
        correctAnswer: 'Option A',
        points: 1,
        order: 1,
        isPublished: false,
      },
    })
    testTaskId = String(task.id)

    // Verify task was created
    expect(task.id).toBeDefined()

    // Verify we can query by media ID without errors
    const { docs: tasksFound } = await payload.find({
      collection: 'tasks',
      where: {
        questionMedia: { equals: mediaIdStr },
      },
      limit: 10,
    })

    const foundTask = tasksFound.find((t: any) => String(t.id) === testTaskId)
    expect(foundTask).toBeDefined()
    expect(String(foundTask?.questionMedia)).toBe(mediaIdStr)
  })

  it('should handle numeric media IDs converted to strings in queries', async () => {
    // Simulate passing a numeric media ID (common mistake)
    const numericMediaId = 12345
    const stringMediaId = String(numericMediaId)

    // This should NOT throw type mismatch error
    const { docs } = await payload.find({
      collection: 'tasks',
      where: {
        or: [
          { questionMedia: { equals: stringMediaId } },
          { solutionMedia: { equals: stringMediaId } },
        ],
      },
      limit: 1,
    })

    // Query should succeed even if no matches found
    expect(docs).toBeDefined()
    expect(Array.isArray(docs)).toBe(true)
  })

  it('should validate media usage counting works with string IDs', async () => {
    // Use any existing media or a fake ID
    const { docs: existingMedia } = await payload.find({
      collection: 'media',
      limit: 1,
    })

    const mediaIdStr = existingMedia.length > 0 
      ? String(existingMedia[0].id) 
      : '999999' // Non-existent ID for testing query

    // Find tasks using this media (must use string)
    const { docs: tasksWithMedia } = await payload.find({
      collection: 'tasks',
      where: {
        or: [
          { questionMedia: { equals: mediaIdStr } },
          { solutionMedia: { equals: mediaIdStr } },
        ],
      },
      limit: 1000,
    })

    // Should not throw error (even if count is 0)
    expect(tasksWithMedia).toBeDefined()
    expect(Array.isArray(tasksWithMedia)).toBe(true)
  })
})

/**
 * POST /api/lesson-assistant — auth and access control
 */

import { describe, it, expect, vi, beforeEach } from 'vitest'

process.env.SKIP_DB_SETUP = '1'

vi.mock('@/auth', () => ({ auth: vi.fn() }))
vi.mock('@/lib/rate-limit', () => ({
  checkRateLimit: vi.fn().mockResolvedValue({ allowed: true, retryAfter: 0 }),
}))
vi.mock('payload', () => ({ getPayload: vi.fn() }))
vi.mock('@payload-config', () => ({ default: {} }))
vi.mock('@anthropic-ai/sdk', () => ({
  default: class MockAnthropic {
    messages = {
      create: vi.fn().mockResolvedValue({
        content: [{ type: 'text', text: 'Assistant reply.' }],
      }),
    }
  },
}))

vi.mock('@/lib/activity-log', () => ({
  logActivity: vi.fn(),
  ActivityAction: { USER_PRO_LESSON_ASSISTANT: 'USER_PRO_LESSON_ASSISTANT' },
}))

const { POST } = await import('@/app/api/lesson-assistant/route')
const { auth } = await import('@/auth')
const { getPayload } = await import('payload')
const mockedAuth = vi.mocked(auth)
const mockedGetPayload = vi.mocked(getPayload)

function jsonRequest(body: unknown): Request {
  return new Request('http://localhost/api/lesson-assistant', {
    method: 'POST',
    headers: { 'Content-Type': 'application/json' },
    body: JSON.stringify(body),
  })
}

describe('POST /api/lesson-assistant', () => {
  beforeEach(() => {
    vi.clearAllMocks()
    process.env.ANTHROPIC_API_KEY = 'test-key'
  })

  it('returns 401 when not logged in', async () => {
    mockedAuth.mockResolvedValue(null)
    const res = await POST(
      jsonRequest({ lessonId: '1', courseSlug: 'c', question: 'Why?' }),
    )
    expect(res.status).toBe(401)
  })

  it('returns 403 when logged in but not Pro', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT', isPro: false, name: 'N' },
    } as any)
    const res = await POST(
      jsonRequest({ lessonId: '1', courseSlug: 'c', question: 'Why?' }),
    )
    expect(res.status).toBe(403)
  })

  it('returns 400 for invalid body', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT', isPro: true, name: 'N' },
    } as any)
    const res = await POST(
      jsonRequest({ lessonId: '', courseSlug: 'c', question: 'x' }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 400 for invalid modelPreset', async () => {
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT', isPro: true, name: 'N' },
    } as any)
    const res = await POST(
      jsonRequest({
        lessonId: 'les',
        courseSlug: 'c',
        question: 'Q?',
        modelPreset: 'opus',
      }),
    )
    expect(res.status).toBe(400)
  })

  it('returns 503 when API key missing', async () => {
    delete process.env.ANTHROPIC_API_KEY
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT', isPro: true, name: 'N' },
    } as any)
    const res = await POST(
      jsonRequest({ lessonId: 'les', courseSlug: 'slug', question: 'Q?' }),
    )
    expect(res.status).toBe(503)
  })

  it('returns 200 with answer when lesson is valid', async () => {
    process.env.ANTHROPIC_API_KEY = 'test-key'
    mockedAuth.mockResolvedValue({
      user: { id: 'u1', email: 'a@b.com', role: 'STUDENT', isPro: true, name: 'N' },
    } as any)

    mockedGetPayload.mockResolvedValue({
      findByID: vi.fn().mockImplementation(({ collection, id }: { collection: string; id: string }) => {
        if (collection === 'lessons') {
          return Promise.resolve({
            id,
            title: 'Lesson',
            isPublished: true,
            theoryBlocks: [],
            content: null,
            course: {
              slug: 'my-course',
              title: 'Course',
              level: 'BEGINNER',
              isPublished: true,
            },
            module: { isPublished: true },
          })
        }
        return Promise.resolve(null)
      }),
    } as any)

    const res = await POST(
      jsonRequest({ lessonId: 'les-1', courseSlug: 'my-course', question: 'What is this?' }),
    )
    expect(res.status).toBe(200)
    const data = (await res.json()) as { answer: string }
    expect(data.answer).toContain('Assistant reply')
  })
})

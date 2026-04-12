import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { getPayload } from 'payload'
import config from '@payload-config'
import { requireProUser } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { buildLessonTheoryForLlm, courseLevelLabel } from '@/lib/lesson-theory-for-llm'
import { LESSON_ASSISTANT_SYSTEM_PROMPT } from '@/lib/lesson-assistant-prompt'
import { logActivity, ActivityAction } from '@/lib/activity-log'
import {
  type LessonAssistantModelPreset,
  resolveLessonAssistantModelId,
} from '@/lib/lesson-assistant-models'

const bodySchema = z.object({
  lessonId: z.string().min(1),
  courseSlug: z.string().min(1),
  question: z.string().min(1).max(4000),
  selectedText: z.string().max(8000).optional(),
  /** Default: haiku (faster / cheaper). */
  modelPreset: z.enum(['haiku', 'sonnet']).optional(),
})

export async function POST(req: Request) {
  try {
    const user = await requireProUser()

    const rate = await checkRateLimit({
      request: req,
      key: 'lesson-assistant',
      limit: 20,
      windowMs: 60_000,
      identityFallback: user.id,
    })
    if (!rate.allowed) {
      const sec = Math.max(1, Math.ceil(rate.retryAfter / 1000))
      return NextResponse.json(
        { error: 'Too many requests', retryAfterMs: rate.retryAfter },
        { status: 429, headers: { 'Retry-After': String(sec) } },
      )
    }

    let json: unknown
    try {
      json = await req.json()
    } catch {
      return NextResponse.json({ error: 'Invalid JSON' }, { status: 400 })
    }

    const parsed = bodySchema.safeParse(json)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { lessonId, courseSlug, question, selectedText, modelPreset: rawPreset } = parsed.data
    const modelPreset: LessonAssistantModelPreset = rawPreset ?? 'haiku'
    const model = resolveLessonAssistantModelId(modelPreset)

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({ error: 'Lesson assistant is not configured' }, { status: 503 })
    }

    const payload = await getPayload({ config })
    const lesson = await payload
      .findByID({
        collection: 'lessons',
        id: lessonId,
        depth: 2,
      })
      .catch(() => null)

    if (!lesson || !lesson.isPublished) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const courseRel = lesson.course
    const course =
      typeof courseRel === 'object' && courseRel && 'slug' in courseRel
        ? courseRel
        : await payload
            .findByID({ collection: 'courses', id: String(courseRel) })
            .catch(() => null)

    if (!course || !course.isPublished || String(course.slug) !== courseSlug) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const modRel = lesson.module
    const mod =
      typeof modRel === 'object' && modRel && 'isPublished' in modRel
        ? modRel
        : await payload
            .findByID({ collection: 'modules', id: String(modRel) })
            .catch(() => null)

    if (!mod || !mod.isPublished) {
      return NextResponse.json({ error: 'Lesson not found' }, { status: 404 })
    }

    const { body: theoryBody, truncated } = buildLessonTheoryForLlm({
      theoryBlocks: lesson.theoryBlocks as unknown[] | undefined,
      content: lesson.content,
    })

    const levelLabel = courseLevelLabel(String(course.level ?? ''))
    const courseTitle = String(course.title ?? '')
    const lessonTitle = String(lesson.title ?? '')

    let userMsg = `Course: ${courseTitle} (level: ${levelLabel})\nLesson: ${lessonTitle}\n\n`
    userMsg += `--- Lesson theory ${truncated ? '(truncated) ' : ''}---\n${theoryBody}\n\n`

    const trimmedSelection = selectedText?.trim()
    if (trimmedSelection) {
      userMsg += `--- User-selected excerpt ---\n${trimmedSelection}\n\n`
    }
    userMsg +=
      `--- Question ---\n${question.trim()}\n\n` +
      `(Answer directly; use lesson context when it helps. Tangential or unrelated questions are fine—still answer helpfully.)`

    const client = new Anthropic({ apiKey })
    let resp
    try {
      resp = await client.messages.create({
        model,
        max_tokens: 4096,
        system: LESSON_ASSISTANT_SYSTEM_PROMPT,
        messages: [{ role: 'user', content: userMsg }],
      })
    } catch (err) {
      console.error('[POST /api/lesson-assistant] Anthropic error', err)
      return NextResponse.json({ error: 'Assistant temporarily unavailable' }, { status: 502 })
    }

    const answer = resp.content
      .filter((b): b is TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    logActivity({
      action: ActivityAction.USER_PRO_LESSON_ASSISTANT,
      actorUserId: user.id,
      actorEmail: user.email,
      resourceType: 'lesson',
      resourceId: lessonId,
      metadata: { courseSlug, lessonId, modelPreset },
    })

    return NextResponse.json(
      { answer },
      { headers: { 'Cache-Control': 'private, no-store' } },
    )
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    console.error('[POST /api/lesson-assistant]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}

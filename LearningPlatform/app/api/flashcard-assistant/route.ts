import { NextResponse } from 'next/server'
import { z } from 'zod'
import Anthropic from '@anthropic-ai/sdk'
import type { TextBlock } from '@anthropic-ai/sdk/resources/messages'
import { requireProUser } from '@/lib/auth-helpers'
import { checkRateLimit } from '@/lib/rate-limit'
import { FLASHCARD_ASSISTANT_SYSTEM_PROMPT } from '@/lib/flashcard-assistant-prompt'
import {
  type LessonAssistantModelPreset,
  resolveLessonAssistantModelId,
} from '@/lib/lesson-assistant-models'

const bodySchema = z.object({
  question: z.string().min(1).max(4000),
  cardFront: z.string().min(1).max(12000),
  cardBack: z.string().min(1).max(12000),
  modelPreset: z.enum(['haiku', 'sonnet']).optional(),
})

export async function POST(req: Request) {
  try {
    const user = await requireProUser()
    const rate = await checkRateLimit({
      request: req,
      key: 'flashcard-assistant',
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

    const payload = await req.json().catch(() => null)
    const parsed = bodySchema.safeParse(payload)
    if (!parsed.success) {
      return NextResponse.json({ error: 'Invalid request' }, { status: 400 })
    }

    const { question, cardFront, cardBack, modelPreset: rawPreset } = parsed.data
    const modelPreset: LessonAssistantModelPreset = rawPreset ?? 'haiku'
    const model = resolveLessonAssistantModelId(modelPreset)

    const apiKey = process.env.ANTHROPIC_API_KEY?.trim()
    if (!apiKey) {
      return NextResponse.json({ error: 'Flashcard assistant is not configured' }, { status: 503 })
    }

    let userMsg = `--- Flashcard front ---\n${cardFront.trim()}\n\n--- Flashcard back ---\n${cardBack.trim()}\n\n`
    userMsg += `--- Question ---\n${question.trim()}`

    const client = new Anthropic({ apiKey })
    const resp = await client.messages.create({
      model,
      max_tokens: 4096,
      system: FLASHCARD_ASSISTANT_SYSTEM_PROMPT,
      messages: [{ role: 'user', content: userMsg }],
    })

    const answer = resp.content
      .filter((b): b is TextBlock => b.type === 'text')
      .map((b) => b.text)
      .join('\n')
      .trim()

    return NextResponse.json({ answer }, { headers: { 'Cache-Control': 'private, no-store' } })
  } catch (error) {
    if (error instanceof Error) {
      if (error.message === 'Unauthorized') {
        return NextResponse.json({ error: 'Unauthorized' }, { status: 401 })
      }
      if (error.message === 'Forbidden') {
        return NextResponse.json({ error: 'Forbidden' }, { status: 403 })
      }
    }
    console.error('[POST /api/flashcard-assistant]', error)
    return NextResponse.json({ error: 'Internal server error' }, { status: 500 })
  }
}


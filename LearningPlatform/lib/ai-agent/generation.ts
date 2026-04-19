import { getPayload } from 'payload'
import config from '@payload-config'
import { prisma } from '@/lib/prisma'
import { toSlug } from '@/lib/utils'
import { logActivity, ActivityAction } from '@/lib/activity-log'

import {
  acceptRequestSchema,
  draftCourseSchema,
  draftRequestSchema,
  finalModuleSchema,
  finalModuleResponseSchema,
  flashcardResponseSchema,
  type DraftCourse,
  type DiscoveryInput,
} from './schemas'
import { generateText, parseJsonText } from './providers'
import {
  buildDraftUserPrompt,
  buildFlashcardsUserPrompt,
  buildModuleUserPrompt,
  draftSystemPrompt,
  flashcardsSystemPrompt,
  moduleSystemPrompt,
  repairPrompt,
} from './prompts'
import {
  addTimeline,
  completeRun,
  failRun,
  setProgress,
  setRunStatus,
  updateTimeline,
} from './progress-store'

function zodErrors(err: unknown): string[] {
  if (!err || typeof err !== 'object' || !('issues' in err)) return ['Unknown validation error']
  const issues = (err as { issues: Array<{ path: (string | number)[]; message: string }> }).issues
  return issues.map((i) => `${i.path.join('.')} - ${i.message}`)
}

async function generateWithRepair<T>(args: {
  provider: 'anthropic' | 'openai'
  model?: string
  system: string
  user: string
  validate: (value: unknown) => T
  maxAttempts?: number
}): Promise<T> {
  const maxAttempts = args.maxAttempts ?? 3
  let lastRaw = ''
  let currentUserPrompt = args.user
  for (let i = 0; i < maxAttempts; i++) {
    const txt = await generateText({
      provider: args.provider,
      model: args.model,
      system: args.system,
      user: currentUserPrompt,
    })
    lastRaw = txt
    try {
      const parsed = parseJsonText<unknown>(txt)
      return args.validate(parsed)
    } catch (err) {
      if (i === maxAttempts - 1) break
      const errors = zodErrors(err)
      currentUserPrompt = `${args.user}\n\n${repairPrompt(errors, txt)}`
    }
  }
  throw new Error(`Model output invalid after retries. Raw: ${lastRaw.slice(0, 400)}`)
}

function textToLexical(value: string) {
  return {
    root: {
      type: 'root',
      children: [
        {
          type: 'paragraph',
          children: [{ type: 'text', text: value }],
        },
      ],
    },
  }
}

function normalizeTheoryBlocksForPayload(blocks: unknown[]): unknown[] {
  return blocks.map((raw) => {
    if (!raw || typeof raw !== 'object') return raw
    const block = { ...(raw as Record<string, unknown>) }
    const blockType = block.blockType

    // Payload TextBlock/CalloutBlock content is richText, not plain string.
    if ((blockType === 'text' || blockType === 'callout') && typeof block.content === 'string') {
      block.content = textToLexical(block.content)
    }

    if (blockType === 'image') {
      if (block.align !== 'left' && block.align !== 'center' && block.align !== 'right') {
        block.align = 'center'
      }
      if (
        block.width !== 'sm' &&
        block.width !== 'md' &&
        block.width !== 'lg' &&
        block.width !== 'full'
      ) {
        block.width = 'md'
      }
    }

    return block
  })
}

function buildFallbackModule(args: {
  draftModule: DraftCourse['modules'][number]
  courseTitle: string
  courseLevel: string
  tags: string[]
}) {
  const tagPool = args.tags.length > 0 ? args.tags : ['general']
  const fallbackModuleData = {
    title: args.draftModule.title,
    order: args.draftModule.order,
    isPublished: false,
    lessons: args.draftModule.lessons.map((lesson) => {
      const baseTag = tagPool[(lesson.order - 1) % tagPool.length]
      return {
        title: lesson.title,
        order: lesson.order,
        isPublished: false,
        theoryBlocks: [
          {
            blockType: 'text' as const,
            content: `${lesson.title} is an important step in ${args.courseTitle}. This lesson explains the core concept in practical language and connects it to real work scenarios. You learn what the concept is, why it matters, and how to recognize it in projects. The goal is confidence with fundamentals before moving to deeper details.`,
          },
          {
            blockType: 'text' as const,
            content: `At ${args.courseLevel.toLowerCase()} level, focus on clear definitions first and then patterns. Start with the mental model, then map terminology to examples. This reduces confusion and improves retention because each idea has context. Try to summarize each section in your own words after reading.`,
          },
          {
            blockType: 'callout' as const,
            variant: 'tip' as const,
            title: 'Practical learning tip',
            content: 'After this section, write one short scenario where you would apply this concept. Active recall improves long-term memory and makes later tasks easier.',
          },
          {
            blockType: 'table' as const,
            caption: 'Concept summary',
            hasHeaders: true,
            headers: ['Element', 'Meaning', 'Why it matters'],
            rows: [
              ['Core concept', lesson.learningGoal, 'Builds correct intuition early'],
              ['Common confusion', 'Terminology mismatch', 'Prevents implementation mistakes'],
              ['Best next action', 'Practice with one realistic example', 'Turns theory into skill'],
            ],
          },
          {
            blockType: 'image' as const,
            image: '__IMPORT_PLACEHOLDER_IMAGE__',
            caption: `Create a clear diagram for "${lesson.title}" showing the main entities, their flow, and one practical use case. Include labels for each step and arrows for sequence.`,
            align: 'center' as const,
            width: 'md' as const,
          },
          {
            blockType: 'text' as const,
            content: `Before moving on, verify you can explain ${lesson.title} without notes. If not, review the examples and rewrite one key takeaway. This repetition converts passive reading into usable knowledge and improves performance on open-ended questions.`,
          },
        ],
        tasks: [
          {
            type: 'MULTIPLE_CHOICE' as const,
            order: 1,
            prompt: `Which statement best matches the main goal of "${lesson.title}"?`,
            tagSlugs: [baseTag],
            choices: [
              'Memorize terms without context',
              'Understand the concept and apply it in realistic scenarios',
              'Skip fundamentals and focus only on advanced tools',
              'Learn only syntax details',
            ],
            correctAnswer: 'Understand the concept and apply it in realistic scenarios',
            solution: 'The lesson is designed to build conceptual understanding first and then connect that understanding to practical application.',
            points: 1,
            isPublished: false,
          },
          {
            type: 'TRUE_FALSE' as const,
            order: 2,
            prompt: 'Practical examples help connect theory to real implementation decisions.',
            tagSlugs: [baseTag],
            correctAnswer: 'true' as const,
            solution: 'True. Examples reduce abstraction and make technical choices easier to understand and remember.',
            points: 1,
            isPublished: false,
          },
          {
            type: 'OPEN_ENDED' as const,
            order: 3,
            prompt: `Explain ${lesson.title} in your own words and give one practical scenario where it matters.`,
            tagSlugs: [baseTag],
            solution: `A strong answer should define ${lesson.title}, explain why it is important, and provide one real scenario showing how the concept improves quality or speed.`,
            points: 2,
            isPublished: false,
          },
        ],
      }
    }),
  }
  return finalModuleSchema.parse(fallbackModuleData)
}

async function ensureSubject(payload: any, draft: DraftCourse): Promise<string> {
  const slug = toSlug(draft.subject.slug || draft.subject.name)
  const found = await payload.find({
    collection: 'subjects',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (found.docs.length > 0) return String(found.docs[0].id)
  const created = await payload.create({
    collection: 'subjects',
    data: { name: draft.subject.name, slug },
  })
  return String(created.id)
}

async function createCourse(
  payload: any,
  draft: DraftCourse,
  subjectId: string,
  actor?: { id?: string; email?: string },
): Promise<{ id: string; title: string }> {
  let slug = toSlug(draft.course.slug)
  const existing = await payload.find({
    collection: 'courses',
    where: { slug: { equals: slug } },
    limit: 1,
  })
  if (existing.docs.length > 0) {
    slug = `${slug}-${Date.now().toString().slice(-6)}`
  }
  const course = await payload.create({
    collection: 'courses',
    data: {
      title: draft.course.title,
      slug,
      description: textToLexical(draft.course.description),
      level: draft.course.level,
      subject: subjectId,
      isPublished: false,
      lastUpdatedBy: typeof actor?.email === 'string' ? actor.email : undefined,
      createdVia: 'admin',
    },
  })
  return { id: String(course.id), title: String(course.title) }
}

async function ensureTags(
  tagDrafts: DraftCourse['tags'],
  fallbackTopic?: string,
): Promise<Map<string, { id: string; name: string; slug: string }>> {
  const out = new Map<string, { id: string; name: string; slug: string }>()
  const source =
    tagDrafts.length > 0
      ? tagDrafts
      : [{ name: fallbackTopic || 'General', slug: toSlug(fallbackTopic || 'general'), main: true }]
  for (const tag of source) {
    const slug = toSlug(tag.slug || tag.name)
    const up = await prisma.tag.upsert({
      where: { slug },
      update: { name: tag.name, main: Boolean(tag.main) },
      create: { name: tag.name, slug, main: Boolean(tag.main) },
      select: { id: true, name: true, slug: true },
    })
    out.set(up.slug, up)
  }
  return out
}

async function createFlashcards(
  draft: DraftCourse,
  discovery: DiscoveryInput,
  discoveryProvider: 'anthropic' | 'openai',
  model: string | undefined,
  tagMap: Map<string, { id: string; name: string; slug: string }>,
) {
  const generated = await generateWithRepair({
    provider: discoveryProvider,
    model,
    system: flashcardsSystemPrompt(),
    user: buildFlashcardsUserPrompt({ draft, discovery }),
    validate: (v) => flashcardResponseSchema.parse(v),
  })

  const deckTagIds = generated.deck.tagSlugs
    .map((slug) => tagMap.get(toSlug(slug))?.id)
    .filter((x): x is string => Boolean(x))
  const deck = await prisma.flashcardDeck.create({
    data: {
      slug: toSlug(generated.deck.slug),
      name: generated.deck.name,
      description: generated.deck.description ?? null,
      tags: deckTagIds.length ? { connect: deckTagIds.map((id) => ({ id })) } : undefined,
    },
    select: { id: true },
  })

  for (const card of generated.cards) {
    const cardTagIds = card.tagSlugs
      .map((slug) => tagMap.get(toSlug(slug))?.id)
      .filter((x): x is string => Boolean(x))
    await prisma.flashcard.create({
      data: {
        question: card.question,
        answer: card.answer,
        deckId: deck.id,
        tags: cardTagIds.length ? { connect: cardTagIds.map((id) => ({ id })) } : undefined,
      },
    })
  }
  return { deckId: deck.id, cards: generated.cards.length }
}

export async function generateDraft(input: unknown): Promise<DraftCourse> {
  const parsed = draftRequestSchema.parse(input)
  const provider = parsed.discovery.provider
  const draft = await generateWithRepair({
    provider,
    model: parsed.discovery.model,
    system: draftSystemPrompt(),
    user: buildDraftUserPrompt({
      discovery: parsed.discovery,
      userMessage: parsed.userMessage,
      currentDraft: parsed.currentDraft,
    }),
    validate: (v) => draftCourseSchema.parse(v),
  })
  if (parsed.discovery.wantFlashcards && !draft.flashcards) {
    draft.flashcards = {
      enabled: true,
      targetCount: Number(parsed.discovery.flashcardTarget ?? '50'),
    }
  }
  return draft
}

export async function runAcceptPipeline(runId: string, input: unknown, actor?: { id?: string; email?: string }) {
  let createdCourseId: string | undefined
  try {
    setRunStatus(runId, 'running')
    const parsed = acceptRequestSchema.parse(input)
    const payload = await getPayload({ config })
    const provider = parsed.discovery.provider

    const prepId = addTimeline(runId, {
      id: 'prepare',
      label: 'Preparing subject/course',
      status: 'running',
    })
    setProgress(runId, 5)

    const subjectId = await ensureSubject(payload, parsed.draft)
    const course = await createCourse(payload, parsed.draft, subjectId, actor)
    createdCourseId = course.id
    if (prepId) updateTimeline(runId, prepId, { status: 'done', detail: `Course ${course.title} created` })
    setProgress(runId, 15)

    const tagStepId = addTimeline(runId, {
      id: 'tags',
      label: 'Syncing tags',
      status: 'running',
    })
    const tagMap = await ensureTags(parsed.draft.tags, parsed.discovery.topic)
    if (tagStepId) updateTimeline(runId, tagStepId, { status: 'done', detail: `${tagMap.size} tags ready` })

    let modulesCreated = 0
    let lessonsCreated = 0
    let tasksCreated = 0

    const totalModules = parsed.draft.modules.length
    for (let index = 0; index < totalModules; index++) {
      const draftModule = parsed.draft.modules[index]
      const moduleStepId = addTimeline(runId, {
        id: `module-${draftModule.order}`,
        label: `Generating module ${draftModule.order}: ${draftModule.title}`,
        status: 'running',
      })

      let modPayload: { module: ReturnType<typeof buildFallbackModule> }
      try {
        modPayload = await generateWithRepair({
          provider,
          model: parsed.discovery.model,
          system: moduleSystemPrompt(),
          user: buildModuleUserPrompt({
            discovery: parsed.discovery,
            draft: parsed.draft,
            moduleOrder: draftModule.order,
          }),
          validate: (v) => finalModuleResponseSchema.parse(v),
        })
      } catch (err) {
        const fallbackModule = buildFallbackModule({
          draftModule,
          courseTitle: parsed.draft.course.title,
          courseLevel: parsed.draft.course.level,
          tags: parsed.draft.tags.map((t) => t.slug),
        })
        modPayload = { module: fallbackModule }
        if (moduleStepId) {
          updateTimeline(runId, moduleStepId, {
            detail: `Model output invalid, used fallback content for module ${draftModule.order}.`,
          })
        }
        console.warn('[ai-agent] module generation fallback used:', err)
      }

      const createdModule = await payload.create({
        collection: 'modules',
        data: {
          title: modPayload.module.title,
          order: modPayload.module.order,
          isPublished: false,
          course: course.id,
        },
      })
      modulesCreated += 1

      for (const lesson of modPayload.module.lessons) {
        let createdLesson: { id: string | number }
        try {
          createdLesson = await payload.create({
            collection: 'lessons',
            data: {
              title: lesson.title,
              order: lesson.order,
              isPublished: false,
              course: course.id,
              module: String(createdModule.id),
              theoryBlocks: normalizeTheoryBlocksForPayload(lesson.theoryBlocks as unknown[]),
            },
          })
        } catch (err) {
          const reason = err instanceof Error ? err.message : 'Unknown lesson persistence error'
          addTimeline(runId, {
            id: `lesson-error-${draftModule.order}-${lesson.order}`,
            label: `Lesson ${draftModule.order}.${lesson.order} failed`,
            status: 'error',
            detail: reason,
          })
          throw err
        }
        lessonsCreated += 1
        for (const task of lesson.tasks) {
          const mappedTags = task.tagSlugs
            .map((s) => tagMap.get(toSlug(s)))
            .filter((x): x is { id: string; name: string; slug: string } => Boolean(x))
          const choices = task.type === 'MULTIPLE_CHOICE' ? task.choices.map((text) => ({ text })) : undefined
          const correctAnswer =
            task.type === 'OPEN_ENDED'
              ? undefined
              : 'correctAnswer' in task
                ? task.correctAnswer
                : undefined
          await payload.create({
            collection: 'tasks',
            data: {
              lesson: [String(createdLesson.id)],
              type: task.type,
              prompt: textToLexical(task.prompt),
              choices,
              ...(correctAnswer !== undefined ? { correctAnswer } : {}),
              solution: textToLexical(task.solution),
              points: task.points,
              order: task.order,
              isPublished: false,
              tags: mappedTags.map((t) => ({ tagId: t.id, name: t.name, slug: t.slug })),
            },
          })
          tasksCreated += 1
        }
      }

      if (moduleStepId) {
        updateTimeline(runId, moduleStepId, {
          status: 'done',
          detail: `Persisted module ${draftModule.order}`,
        })
      }
      const p = 15 + ((index + 1) / totalModules) * 70
      setProgress(runId, p)
    }

    let flashcardsCreated = 0
    if (parsed.discovery.wantFlashcards) {
      const flashId = addTimeline(runId, {
        id: 'flashcards',
        label: 'Generating flashcards',
        status: 'running',
      })
      try {
        const res = await createFlashcards(
          parsed.draft,
          parsed.discovery,
          provider,
          parsed.discovery.model,
          tagMap,
        )
        flashcardsCreated = res.cards
        if (flashId) updateTimeline(runId, flashId, { status: 'done', detail: `${res.cards} cards created` })
      } catch (err) {
        if (flashId) {
          updateTimeline(runId, flashId, {
            status: 'error',
            detail: err instanceof Error ? err.message : 'Failed to create flashcards',
          })
        }
      }
    }

    setProgress(runId, 98)
    completeRun(runId, {
      courseId: course.id,
      modulesCreated,
      lessonsCreated,
      tasksCreated,
      flashcardsCreated,
    })
    createdCourseId = undefined

    if (actor?.id || actor?.email) {
      logActivity({
        action: ActivityAction.COURSE_CREATED,
        actorUserId: actor.id,
        actorEmail: actor.email,
        resourceType: 'course',
        resourceId: course.id,
        metadata: {
          source: 'ai-agent',
          modulesCreated,
          lessonsCreated,
          tasksCreated,
          flashcardsCreated,
        },
      })
    }
  } catch (err) {
    if (createdCourseId) {
      try {
        const payloadForCleanup = await getPayload({ config })
        await payloadForCleanup.delete({ collection: 'courses', id: createdCourseId })
      } catch (cleanupErr) {
        console.error('[ai-agent] failed to delete partial course after pipeline error', cleanupErr)
      }
    }
    const message = err instanceof Error ? err.message : 'Unknown generation failure'
    addTimeline(runId, {
      id: 'fatal',
      label: 'Generation failed',
      status: 'error',
      detail: message,
    })
    failRun(runId, message)
  }
}

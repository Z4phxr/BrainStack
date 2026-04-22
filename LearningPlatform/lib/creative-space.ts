import type { CreativeEventType } from '@prisma/client'
import { prisma } from '@/lib/prisma'

export const CREATIVE_ITEM_TYPES = [
  'TEXT',
  'IMAGE',
  'VIDEO',
  'LINK',
  'COURSE',
  'FLASHCARD',
  'DECK',
] as const

export async function getOwnedCreativeSpace(userId: string, spaceId: string) {
  return prisma.creativeSpace.findFirst({
    where: { id: spaceId, userId },
    select: {
      id: true,
      userId: true,
      title: true,
      createdAt: true,
      updatedAt: true,
      lastEditedAt: true,
      courseId: true,
      moduleId: true,
      lessonId: true,
    },
  })
}

export async function logCreativeActivity(input: {
  userId: string
  spaceId: string
  eventType: CreativeEventType
  itemId?: string | null
  metadata?: unknown
}) {
  await prisma.creativeActivityEvent.create({
    data: {
      userId: input.userId,
      spaceId: input.spaceId,
      eventType: input.eventType,
      itemId: input.itemId ?? null,
      metadata: (input.metadata ?? null) as any,
    },
  })
}

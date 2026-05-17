'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { logActivity, ActivityAction } from '@/lib/activity-log'
import { collectUsedMediaIds } from '@/lib/media-usage'

const MEDIA_PAGE_SIZE = 100

async function listAllMediaIds(): Promise<string[]> {
  const payload = await getPayload({ config })
  const ids: string[] = []
  let page = 1

  while (true) {
    const result = await payload.find({
      collection: 'media',
      limit: MEDIA_PAGE_SIZE,
      page,
      depth: 0,
    })
    for (const doc of result.docs) {
      ids.push(String(doc.id))
    }
    if (!result.hasNextPage) break
    page++
  }

  return ids
}

export async function countUnusedMedia(): Promise<number> {
  await requireAdmin()
  const [allIds, usedIds] = await Promise.all([listAllMediaIds(), collectUsedMediaIds()])
  return allIds.filter((id) => !usedIds.has(id)).length
}

export async function deleteMedia(id: string) {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'media',
    id: String(id),
  })

  logActivity({
    action: ActivityAction.MEDIA_DELETED,
    actorUserId: admin.id,
    actorEmail: admin.email,
    resourceType: 'media',
    resourceId: String(id),
  })

  revalidatePath('/admin/media')
}

export async function deleteAllUnusedMedia(): Promise<{ deleted: number }> {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })
  const [allIds, usedIds] = await Promise.all([listAllMediaIds(), collectUsedMediaIds()])
  const unusedIds = allIds.filter((id) => !usedIds.has(id))

  let deleted = 0
  for (const id of unusedIds) {
    await payload.delete({ collection: 'media', id })
    deleted++
  }

  if (deleted > 0) {
    logActivity({
      action: ActivityAction.MEDIA_DELETED,
      actorUserId: admin.id,
      actorEmail: admin.email,
      resourceType: 'media',
      resourceId: 'bulk-unused',
      metadata: { count: deleted, mediaIds: unusedIds.slice(0, 50) },
    })
  }

  revalidatePath('/admin/media')
  return { deleted }
}

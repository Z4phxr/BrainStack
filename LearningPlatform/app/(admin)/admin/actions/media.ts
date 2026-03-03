'use server'

import { getPayload } from 'payload'
import config from '@payload-config'
import { requireAdmin } from '@/lib/auth-helpers'
import { revalidatePath } from 'next/cache'
import { logActivity, ActivityAction } from '@/lib/activity-log'

export async function deleteMedia(id: string) {
  const admin = await requireAdmin()
  const payload = await getPayload({ config })

  await payload.delete({
    collection: 'media',
    id: String(id),
  })

  logActivity({
    action:       ActivityAction.MEDIA_DELETED,
    actorUserId:  admin.id,
    actorEmail:   admin.email,
    resourceType: 'media',
    resourceId:   String(id),
  })

  revalidatePath('/admin/media')
}

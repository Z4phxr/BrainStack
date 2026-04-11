/**
 * Aggregates how many Payload tasks reference each Prisma Tag (via payload.tasks_tags).
 * Used only for the admin tags list; callers should cache (e.g. unstable_cache).
 *
 * Kept as raw SQL for performance (single GROUP BY). Documented exception in preflight-check.
 */
import { prisma } from '@/lib/prisma'

export async function getTaskCountsByPrismaTagId(): Promise<Map<string, number>> {
  const rows = await prisma.$queryRaw<{ tag_id: string | null; cnt: bigint }[]>`
    SELECT tag_id, COUNT(*)::bigint AS cnt
    FROM payload.tasks_tags
    WHERE tag_id IS NOT NULL
    GROUP BY tag_id
  `
  const map = new Map<string, number>()
  for (const r of rows) {
    if (r.tag_id) map.set(String(r.tag_id), Number(r.cnt))
  }
  return map
}

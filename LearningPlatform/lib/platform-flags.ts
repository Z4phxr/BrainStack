import { prisma } from '@/lib/prisma'

const PLATFORM_ROW_ID = 'platform'

type CacheEntry = { value: boolean; at: number }
let activityLoggingCache: CacheEntry | null = null
const CACHE_TTL_MS = 3000

export function invalidateActivityLoggingCache(): void {
  activityLoggingCache = null
}

/**
 * Whether new activity log rows should be written. Defaults to true when no row exists.
 * Short-lived cache to avoid an extra query on every high-frequency log call.
 */
export async function getActivityLoggingEnabled(): Promise<boolean> {
  const now = Date.now()
  if (activityLoggingCache && now - activityLoggingCache.at < CACHE_TTL_MS) {
    return activityLoggingCache.value
  }
  try {
    const row = await prisma.platformFlags.findUnique({
      where: { id: PLATFORM_ROW_ID },
      select: { activityLoggingEnabled: true },
    })
    const value = row?.activityLoggingEnabled ?? true
    activityLoggingCache = { value, at: now }
    return value
  } catch {
    return true
  }
}

export async function setActivityLoggingEnabled(enabled: boolean): Promise<void> {
  await prisma.platformFlags.upsert({
    where: { id: PLATFORM_ROW_ID },
    create: {
      id: PLATFORM_ROW_ID,
      activityLoggingEnabled: enabled,
    },
    update: { activityLoggingEnabled: enabled },
  })
  invalidateActivityLoggingCache()
}

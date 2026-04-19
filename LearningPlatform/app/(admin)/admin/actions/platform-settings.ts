'use server'

import { requireAdmin } from '@/lib/auth-helpers'
import { getActivityLoggingEnabled, setActivityLoggingEnabled } from '@/lib/platform-flags'

export async function getActivityLoggingSetting(): Promise<boolean> {
  await requireAdmin()
  return getActivityLoggingEnabled()
}

export async function setActivityLoggingSetting(
  enabled: boolean,
): Promise<{ ok: true } | { ok: false; error: string }> {
  await requireAdmin()
  try {
    await setActivityLoggingEnabled(enabled)
    return { ok: true }
  } catch {
    return { ok: false, error: 'Could not save setting.' }
  }
}

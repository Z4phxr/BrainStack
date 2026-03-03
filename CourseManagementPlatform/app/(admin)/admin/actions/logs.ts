'use server'

import { requireAdmin } from '@/lib/auth-helpers'
import { prisma } from '@/lib/prisma'
import { ActivityAction } from '@/lib/activity-log'
import { LOGS_PAGE_SIZE } from '@/lib/logs-types'
import type { GetLogsParams, GetLogsResult, LogEntry } from '@/lib/logs-types'

export async function getLogs(params: GetLogsParams = {}): Promise<GetLogsResult> {
  await requireAdmin()

  const {
    action,
    actorUserId,
    startDate,
    endDate,
    page = 1,
    pageSize = LOGS_PAGE_SIZE,
  } = params

  const where: Record<string, unknown> = {}

  const validActions = new Set<string>(Object.values(ActivityAction))
  if (action && validActions.has(action)) {
    where.action = action
  }

  if (actorUserId?.trim()) {
    where.actorUserId = actorUserId.trim()
  }

  if (startDate || endDate) {
    const range: Record<string, Date> = {}
    if (startDate) {
      const d = new Date(startDate)
      if (!isNaN(d.getTime())) range.gte = d
    }
    if (endDate) {
      const d = new Date(endDate)
      if (!isNaN(d.getTime())) {
        d.setHours(23, 59, 59, 999)
        range.lte = d
      }
    }
    if (Object.keys(range).length > 0) {
      where.timestamp = range
    }
  }

  const safePage     = Math.max(1, page)
  const safePageSize = Math.min(100, Math.max(1, pageSize))

  const [logs, total] = await Promise.all([
    prisma.activityLog.findMany({
      where,
      orderBy: { timestamp: 'desc' },
      skip: (safePage - 1) * safePageSize,
      take: safePageSize,
    }),
    prisma.activityLog.count({ where }),
  ])

  return {
    logs: logs as LogEntry[],
    total,
    page: safePage,
    pageSize: safePageSize,
    totalPages: Math.ceil(total / safePageSize),
  }
}

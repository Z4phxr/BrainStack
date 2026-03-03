import { Suspense } from 'react'
import { getLogs } from '../actions/logs'
import { LogsTable } from '@/components/admin/logs-table'
import { ActivityAction } from '@/lib/activity-log'

export const dynamic = 'force-dynamic'

interface PageProps {
  searchParams: Promise<{
    action?: string
    actorUserId?: string
    startDate?: string
    endDate?: string
    page?: string
    pageSize?: string
  }>
}

const ACTION_TYPES = Object.values(ActivityAction)

export default async function LogsPage({ searchParams }: PageProps) {
  const sp = await searchParams

  const page     = Math.max(1, parseInt(sp.page     || '1',  10))
  const pageSize = Math.max(1, parseInt(sp.pageSize || '20', 10))

  const result = await getLogs({
    action:      sp.action,
    actorUserId: sp.actorUserId,
    startDate:   sp.startDate,
    endDate:     sp.endDate,
    page,
    pageSize,
  })

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold tracking-tight">Activity Logs</h1>
        <p className="mt-1 text-sm text-muted-foreground">
          Platform activity log ({result.total.toLocaleString()} total{' '}
          {result.total === 1 ? 'entry' : 'entries'})
        </p>
      </div>

      <Suspense>
        <LogsTable
          logs={result.logs}
          total={result.total}
          page={result.page}
          pageSize={result.pageSize}
          totalPages={result.totalPages}
          actionTypes={ACTION_TYPES}
          filters={{
            action:      sp.action      || '',
            actorUserId: sp.actorUserId || '',
            startDate:   sp.startDate   || '',
            endDate:     sp.endDate     || '',
          }}
        />
      </Suspense>
    </div>
  )
}

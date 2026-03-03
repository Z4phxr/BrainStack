'use client'

import { useState, useTransition } from 'react'
import { useRouter, usePathname, useSearchParams } from 'next/navigation'
import { Button } from '@/components/ui/button'
import { Input } from '@/components/ui/input'
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from '@/components/ui/select'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import type { LogEntry } from '@/lib/logs-types'

interface LogsTableProps {
  logs: LogEntry[]
  total: number
  page: number
  pageSize: number
  totalPages: number
  actionTypes: string[]
  filters: {
    action: string
    actorUserId: string
    startDate: string
    endDate: string
  }
}

export function LogsTable({
  logs,
  total,
  page,
  pageSize,
  totalPages,
  actionTypes,
  filters,
}: LogsTableProps) {
  const router     = useRouter()
  const pathname   = usePathname()
  const searchParams = useSearchParams()
  const [, startTransition] = useTransition()

  const [action,      setAction]      = useState(filters.action)
  const [actorUserId, setActorUserId] = useState(filters.actorUserId)
  const [startDate,   setStartDate]   = useState(filters.startDate)
  const [endDate,     setEndDate]     = useState(filters.endDate)

  function buildUrl(overrides: Record<string, string | number | undefined>) {
    const params = new URLSearchParams(searchParams.toString())
    const merged: Record<string, string | number | undefined> = {
      action,
      actorUserId,
      startDate,
      endDate,
      page: 1,
      pageSize,
      ...overrides,
    }
    for (const [key, value] of Object.entries(merged)) {
      if (value !== undefined && value !== '') {
        params.set(key, String(value))
      } else {
        params.delete(key)
      }
    }
    return `${pathname}?${params.toString()}`
  }

  function applyFilters() {
    startTransition(() => { router.push(buildUrl({ page: 1 })) })
  }

  function resetFilters() {
    setAction('')
    setActorUserId('')
    setStartDate('')
    setEndDate('')
    startTransition(() => { router.push(pathname) })
  }

  function goToPage(p: number) {
    startTransition(() => { router.push(buildUrl({ page: p })) })
  }

  function formatTimestamp(ts: Date | string) {
    const d = typeof ts === 'string' ? new Date(ts) : ts
    return d.toLocaleString('en-GB', {
      year:   'numeric',
      month:  '2-digit',
      day:    '2-digit',
      hour:   '2-digit',
      minute: '2-digit',
      second: '2-digit',
    })
  }

  const startEntry = (page - 1) * pageSize + 1
  const endEntry   = Math.min(page * pageSize, total)

  return (
    <div className="space-y-4">
      <div className="flex flex-wrap gap-3 items-end rounded-lg border bg-card p-4">
        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Action</label>
          <Select
            value={action || '__ALL__'}
            onValueChange={(v) => setAction(v === '__ALL__' ? '' : v)}
          >
            <SelectTrigger className="w-52">
              <SelectValue placeholder="All actions" />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="__ALL__">All actions</SelectItem>
              {actionTypes.map((a) => (
                <SelectItem key={a} value={a}>
                  {a.replace(/_/g, ' ')}
                </SelectItem>
              ))}
            </SelectContent>
          </Select>
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">User ID</label>
          <Input
            className="w-56"
            placeholder="Filter by user ID"
            value={actorUserId}
            onChange={(e) => setActorUserId(e.target.value)}
            onKeyDown={(e) => { if (e.key === 'Enter') applyFilters() }}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">Start date</label>
          <Input
            type="date"
            className="w-40"
            value={startDate}
            onChange={(e) => setStartDate(e.target.value)}
          />
        </div>

        <div className="flex flex-col gap-1">
          <label className="text-xs font-medium text-muted-foreground">End date</label>
          <Input
            type="date"
            className="w-40"
            value={endDate}
            onChange={(e) => setEndDate(e.target.value)}
          />
        </div>

        <div className="flex gap-2">
          <Button size="sm" onClick={applyFilters}>Apply</Button>
          <Button size="sm" variant="outline" onClick={resetFilters}>Reset</Button>
        </div>
      </div>

      <div className="rounded-lg border overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead className="w-44">Timestamp</TableHead>
              <TableHead>User</TableHead>
              <TableHead>Action</TableHead>
              <TableHead>Resource type</TableHead>
              <TableHead>Resource ID</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {logs.length === 0 ? (
              <TableRow>
                <TableCell
                  colSpan={5}
                  className="py-10 text-center text-sm text-muted-foreground"
                >
                  No log entries found.
                </TableCell>
              </TableRow>
            ) : (
              logs.map((log) => (
                <TableRow key={log.id}>
                  <TableCell className="whitespace-nowrap font-mono text-xs">
                    {formatTimestamp(log.timestamp)}
                  </TableCell>

                  <TableCell className="text-sm">
                    {log.actorEmail ? (
                      <span className="font-medium">{log.actorEmail}</span>
                    ) : log.actorUserId ? (
                      <span className="font-mono text-xs text-muted-foreground">
                        {log.actorUserId}
                      </span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>

                  <TableCell>
                    <span className="inline-flex items-center rounded-full bg-blue-50 px-2 py-0.5 text-xs font-medium text-blue-700 dark:bg-blue-900/30 dark:text-blue-300">
                      {log.action.replace(/_/g, ' ')}
                    </span>
                  </TableCell>

                  <TableCell className="text-sm text-muted-foreground">
                    {log.resourceType ?? '—'}
                  </TableCell>

                  <TableCell className="max-w-36 truncate font-mono text-xs text-muted-foreground">
                    {log.resourceId ?? '—'}
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex items-center justify-between">
        <p className="text-sm text-muted-foreground">
          {total === 0
            ? 'No results'
            : `Showing ${startEntry}–${endEntry} of ${total}`}
        </p>

        {totalPages > 1 && (
          <div className="flex items-center gap-2">
            <Button
              size="sm"
              variant="outline"
              disabled={page <= 1}
              onClick={() => goToPage(page - 1)}
            >
              <ChevronLeft className="h-4 w-4" />
              Previous
            </Button>
            <span className="text-sm text-muted-foreground">
              Page {page} of {totalPages}
            </span>
            <Button
              size="sm"
              variant="outline"
              disabled={page >= totalPages}
              onClick={() => goToPage(page + 1)}
            >
              Next
              <ChevronRight className="h-4 w-4" />
            </Button>
          </div>
        )}
      </div>
    </div>
  )
}

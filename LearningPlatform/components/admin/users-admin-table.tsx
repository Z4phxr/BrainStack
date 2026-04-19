'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'
import { cn } from '@/lib/utils'
import { adminGlassCard, adminGlassOutlineButton, studentGlassPill } from '@/lib/student-glass-styles'

type UserRow = {
  id: string
  email: string
  name: string | null
  role: string
  isPro: boolean
  createdAt: string
}

const PAGE_SIZE = 20

interface UsersAdminTableProps {
  currentUserId: string | null
}

export function UsersAdminTable({ currentUserId }: UsersAdminTableProps) {
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  /** `${userId}:pro` | `${userId}:role` while a PATCH is in flight */
  const [pendingKey, setPendingKey] = useState<string | null>(null)

  const load = useCallback(async (p: number) => {
    setLoading(true)
    setError(null)
    try {
      const res = await fetch(`/api/admin/users?page=${p}&limit=${PAGE_SIZE}`)
      const data = (await res.json().catch(() => ({}))) as {
        users?: UserRow[]
        total?: number
        page?: number
        error?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Failed to load users')
        return
      }
      setUsers(data.users ?? [])
      setTotal(data.total ?? 0)
      if (data.page && data.page !== p) setPage(data.page)
    } catch {
      setError('Network error')
    } finally {
      setLoading(false)
    }
  }, [])

  useEffect(() => {
    void load(page)
  }, [page, load])

  const totalPages = Math.max(1, Math.ceil(total / PAGE_SIZE))

  const patchUser = async (
    userId: string,
    slot: 'pro' | 'role',
    body: Record<string, unknown>,
  ) => {
    setPendingKey(`${userId}:${slot}`)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify(body),
      })
      const data = (await res.json().catch(() => ({}))) as {
        error?: string
        isPro?: boolean
        role?: string
      }
      if (!res.ok) {
        setError(data.error ?? 'Update failed')
        return
      }
      setUsers((prev) =>
        prev.map((u) => {
          if (u.id !== userId) return u
          return {
            ...u,
            ...(typeof data.isPro === 'boolean' ? { isPro: data.isPro } : {}),
            ...(typeof data.role === 'string' ? { role: data.role } : {}),
          }
        }),
      )
    } catch {
      setError('Network error')
    } finally {
      setPendingKey(null)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className={cn('overflow-hidden rounded-xl border-0 shadow-none', adminGlassCard)}>
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pro</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="min-w-[220px] text-right">Credentials</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {loading ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  Loading…
                </TableCell>
              </TableRow>
            ) : users.length === 0 ? (
              <TableRow>
                <TableCell colSpan={6} className="text-center text-muted-foreground">
                  No users
                </TableCell>
              </TableRow>
            ) : (
              users.map((u) => (
                <TableRow key={u.id}>
                  <TableCell className="max-w-[200px] truncate font-medium">{u.email}</TableCell>
                  <TableCell className="max-w-[140px] truncate text-muted-foreground">
                    {u.name ?? '—'}
                  </TableCell>
                  <TableCell>
                    <span
                      className={cn(
                        studentGlassPill,
                        u.role === 'ADMIN' ? 'text-primary' : 'opacity-90',
                      )}
                    >
                      {u.role}
                    </span>
                  </TableCell>
                  <TableCell>
                    {u.isPro ? (
                      <span className={cn(studentGlassPill, 'text-violet-900 dark:text-violet-200')}>Pro</span>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-normal">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <div className="flex flex-wrap items-center justify-end gap-2">
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(adminGlassOutlineButton)}
                        disabled={pendingKey === `${u.id}:pro`}
                        onClick={() => patchUser(u.id, 'pro', { isPro: !u.isPro })}
                      >
                        {u.isPro ? 'Revoke Pro' : 'Grant Pro'}
                      </Button>
                      <Button
                        type="button"
                        variant="outline"
                        size="sm"
                        className={cn(adminGlassOutlineButton)}
                        disabled={
                          pendingKey === `${u.id}:role` ||
                          (u.role === 'ADMIN' && u.id === currentUserId)
                        }
                        title={
                          u.role === 'ADMIN' && u.id === currentUserId
                            ? 'You cannot remove your own admin role'
                            : undefined
                        }
                        onClick={() =>
                          patchUser(u.id, 'role', {
                            role: u.role === 'ADMIN' ? 'STUDENT' : 'ADMIN',
                          })
                        }
                      >
                        {u.role === 'ADMIN' ? 'Revoke admin' : 'Grant admin'}
                      </Button>
                    </div>
                  </TableCell>
                </TableRow>
              ))
            )}
          </TableBody>
        </Table>
      </div>

      <div className="flex flex-wrap items-center justify-between gap-2">
        <p className="text-sm text-muted-foreground">
          Page {page} of {totalPages} · {total} users
        </p>
        <div className="flex gap-2">
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(adminGlassOutlineButton)}
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
            className={cn(adminGlassOutlineButton)}
            disabled={page >= totalPages || loading}
            onClick={() => setPage((p) => p + 1)}
          >
            Next
          </Button>
        </div>
      </div>
    </div>
  )
}

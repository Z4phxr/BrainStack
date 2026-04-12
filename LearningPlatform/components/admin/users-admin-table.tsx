'use client'

import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Badge } from '@/components/ui/badge'
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from '@/components/ui/table'

type UserRow = {
  id: string
  email: string
  name: string | null
  role: string
  isPro: boolean
  createdAt: string
}

const PAGE_SIZE = 20

export function UsersAdminTable() {
  const [page, setPage] = useState(1)
  const [users, setUsers] = useState<UserRow[]>([])
  const [total, setTotal] = useState(0)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [pendingId, setPendingId] = useState<string | null>(null)

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

  const togglePro = async (userId: string, next: boolean) => {
    setPendingId(userId)
    try {
      const res = await fetch(`/api/admin/users/${userId}`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ isPro: next }),
      })
      if (!res.ok) {
        const data = (await res.json().catch(() => ({}))) as { error?: string }
        setError(data.error ?? 'Update failed')
        return
      }
      setUsers((prev) => prev.map((u) => (u.id === userId ? { ...u, isPro: next } : u)))
    } catch {
      setError('Network error')
    } finally {
      setPendingId(null)
    }
  }

  return (
    <div className="space-y-4">
      {error ? (
        <p className="text-sm text-destructive" role="alert">
          {error}
        </p>
      ) : null}

      <div className="rounded-lg border dark:border-gray-700">
        <Table>
          <TableHeader>
            <TableRow>
              <TableHead>Email</TableHead>
              <TableHead>Name</TableHead>
              <TableHead>Role</TableHead>
              <TableHead>Pro</TableHead>
              <TableHead>Joined</TableHead>
              <TableHead className="text-right">Access</TableHead>
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
                    <Badge variant={u.role === 'ADMIN' ? 'default' : 'secondary'}>{u.role}</Badge>
                  </TableCell>
                  <TableCell>
                    {u.isPro ? (
                      <Badge className="bg-violet-600 hover:bg-violet-600">Pro</Badge>
                    ) : (
                      <span className="text-muted-foreground">—</span>
                    )}
                  </TableCell>
                  <TableCell className="text-muted-foreground whitespace-normal">
                    {new Date(u.createdAt).toLocaleDateString()}
                  </TableCell>
                  <TableCell className="text-right">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      disabled={pendingId === u.id}
                      onClick={() => togglePro(u.id, !u.isPro)}
                    >
                      {u.isPro ? 'Revoke Pro' : 'Grant Pro'}
                    </Button>
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
            disabled={page <= 1 || loading}
            onClick={() => setPage((p) => Math.max(1, p - 1))}
          >
            Previous
          </Button>
          <Button
            type="button"
            variant="outline"
            size="sm"
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

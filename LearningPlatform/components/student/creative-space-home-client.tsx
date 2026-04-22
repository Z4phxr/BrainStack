'use client'

import Link from 'next/link'
import { useCallback, useEffect, useState } from 'react'
import { Button } from '@/components/ui/button'
import { Card, CardContent, CardHeader, CardTitle } from '@/components/ui/card'

type CreativeSpace = {
  id: string
  title: string
  updatedAt: string
}

export function CreativeSpaceHomeClient() {
  const [spaces, setSpaces] = useState<CreativeSpace[]>([])

  const loadSpaces = useCallback(async () => {
    const res = await fetch('/api/creative-spaces')
    if (!res.ok) return
    const data = (await res.json()) as { spaces: CreativeSpace[] }
    setSpaces(data.spaces ?? [])
  }, [])

  useEffect(() => {
    void loadSpaces()
  }, [loadSpaces])

  const createSpace = useCallback(async () => {
    const name = window.prompt('Creative space name')
    if (!name) return
    const res = await fetch('/api/creative-spaces', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ title: name }),
    })
    if (!res.ok) return
    await loadSpaces()
  }, [loadSpaces])

  return (
    <div className="container mx-auto max-w-6xl space-y-6 px-4 py-6 md:px-6">
      <Card className="py-4">
        <CardHeader className="flex flex-row items-center justify-between pb-3">
          <CardTitle className="text-xl">Creative Spaces</CardTitle>
          <Button onClick={() => void createSpace()}>Create Creative Space</Button>
        </CardHeader>
        <CardContent className="space-y-2">
          {spaces.length === 0 ? (
            <p className="text-sm text-muted-foreground">No creative spaces yet.</p>
          ) : (
            spaces.map((space) => (
              <div
                key={space.id}
                className="flex items-center justify-between rounded-md border border-border/70 bg-card px-3 py-2"
              >
                <div>
                  <p className="text-sm font-semibold">{space.title}</p>
                  <p className="text-xs text-muted-foreground">
                    Updated {new Date(space.updatedAt).toLocaleString()}
                  </p>
                </div>
                <Button asChild variant="outline" size="sm">
                  <Link href={`/creative-space/${space.id}`}>Open Whiteboard</Link>
                </Button>
              </div>
            ))
          )}
        </CardContent>
      </Card>
    </div>
  )
}

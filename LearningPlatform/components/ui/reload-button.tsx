'use client'

import { Button } from './button'

export function ReloadButton() {
  return (
    <Button onClick={() => window.location.reload()} variant="outline">
      Refresh page
    </Button>
  )
}

'use client'

import { RefreshCw } from 'lucide-react'
import { adminGlassOutlineButton } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'
import { Button } from './button'

export function ReloadButton({ variant = 'outline' }: { variant?: 'outline' | 'hero' }) {
  return (
    <Button
      onClick={() => window.location.reload()}
      variant={variant === 'hero' ? 'hero' : 'outline'}
      className={cn(variant === 'hero' ? 'auth-hero-cta' : adminGlassOutlineButton)}
    >
      <RefreshCw className="mr-2 h-4 w-4" />
      Refresh page
    </Button>
  )
}

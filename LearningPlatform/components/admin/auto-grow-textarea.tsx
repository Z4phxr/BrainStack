'use client'

import { useCallback, useLayoutEffect, useRef } from 'react'
import { Textarea } from '@/components/ui/textarea'
import { cn } from '@/lib/utils'

const LINE_PX = 22

export type AutoGrowTextareaProps = React.ComponentProps<typeof Textarea> & {
  /** Minimum visible rows before growth (default 4). */
  minRows?: number
}

/**
 * Textarea that grows with content (no inner scroll) up to optional maxHeight.
 */
export function AutoGrowTextarea({
  className,
  value,
  onChange,
  minRows = 4,
  maxHeight,
  ...props
}: AutoGrowTextareaProps & { maxHeight?: number }) {
  const ref = useRef<HTMLTextAreaElement>(null)

  const sync = useCallback(() => {
    const el = ref.current
    if (!el) return
    const minH = minRows * LINE_PX + 16
    el.style.height = '0px'
    const natural = Math.max(minH, el.scrollHeight)
    const next = maxHeight != null ? Math.min(maxHeight, natural) : natural
    el.style.height = `${next}px`
    el.style.overflowY = maxHeight != null && el.scrollHeight > maxHeight ? 'auto' : 'hidden'
  }, [minRows, maxHeight])

  useLayoutEffect(() => {
    sync()
  }, [value, sync])

  return (
    <Textarea
      ref={ref}
      rows={1}
      value={value}
      onChange={(e) => {
        onChange?.(e)
        requestAnimationFrame(sync)
      }}
      className={cn('!min-h-0 resize-none py-2', className)}
      style={{ minHeight: minRows * LINE_PX + 16 }}
      {...props}
    />
  )
}

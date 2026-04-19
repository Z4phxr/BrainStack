'use client'

import {
  Children,
  isValidElement,
  useCallback,
  useEffect,
  useRef,
  useState,
  type ReactNode,
} from 'react'
import { ChevronLeft, ChevronRight } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { cn } from '@/lib/utils'

/**
 * Horizontal row of children: touch/trackpad scroll, optional prev/next arrows when content overflows.
 */
export function DashboardHorizontalScroll({
  children,
  className,
  itemClassName,
  scrollArrows = false,
  'aria-label': ariaLabel = 'Scrollable list',
}: {
  children: ReactNode
  className?: string
  /** Override width on each slide (e.g. wider course cards). */
  itemClassName?: string
  /** When true, scrollbar is hidden and arrows appear only if the row overflows. */
  scrollArrows?: boolean
  'aria-label'?: string
}) {
  const nodes = Children.toArray(children).filter(Boolean)
  const scrollRef = useRef<HTMLDivElement>(null)
  const listRef = useRef<HTMLUListElement>(null)
  const [canScrollLeft, setCanScrollLeft] = useState(false)
  const [canScrollRight, setCanScrollRight] = useState(false)
  const [hasOverflow, setHasOverflow] = useState(false)

  const updateScrollState = useCallback(() => {
    const el = scrollRef.current
    if (!el) return
    const { scrollLeft, scrollWidth, clientWidth } = el
    const overflow = scrollWidth > clientWidth + 2
    setHasOverflow(overflow)
    if (!overflow) {
      setCanScrollLeft(false)
      setCanScrollRight(false)
      return
    }
    setCanScrollLeft(scrollLeft > 2)
    setCanScrollRight(scrollLeft < scrollWidth - clientWidth - 2)
  }, [])

  useEffect(() => {
    const el = scrollRef.current
    if (!el) return
    updateScrollState()
    el.addEventListener('scroll', updateScrollState, { passive: true })
    const ro = new ResizeObserver(() => updateScrollState())
    ro.observe(el)
    const ul = listRef.current
    if (ul) ro.observe(ul)
    window.addEventListener('resize', updateScrollState)
    return () => {
      el.removeEventListener('scroll', updateScrollState)
      window.removeEventListener('resize', updateScrollState)
      ro.disconnect()
    }
  }, [updateScrollState, nodes.length])

  const scrollByDir = (dir: -1 | 1) => {
    const el = scrollRef.current
    if (!el) return
    const delta = Math.max(240, Math.round(el.clientWidth * 0.8))
    el.scrollBy({ left: dir * delta, behavior: 'smooth' })
  }

  if (nodes.length === 0) return null

  const scrollbarStyles = scrollArrows
    ? '[-ms-overflow-style:none] [scrollbar-width:none] [&::-webkit-scrollbar]:hidden'
    : cn(
        'pb-1 [-ms-overflow-style:none] [scrollbar-width:thin]',
        '[&::-webkit-scrollbar]:h-2 [&::-webkit-scrollbar-thumb]:rounded-full',
        '[&::-webkit-scrollbar-thumb]:bg-muted-foreground/30 hover:[&::-webkit-scrollbar-thumb]:bg-muted-foreground/50',
        '[&::-webkit-scrollbar-track]:bg-transparent',
      )

  const scrollPane = (
    <div
      ref={scrollRef}
      role="region"
      aria-label={ariaLabel}
      className={cn(
        'w-full min-w-0 overflow-x-auto overflow-y-visible scroll-smooth',
        scrollbarStyles,
      )}
    >
      <ul
        ref={listRef}
        className={cn(
          'flex w-max flex-nowrap items-stretch gap-4 px-0.5',
          'snap-x snap-mandatory md:snap-none',
        )}
      >
        {Children.map(nodes, (child, i) => (
          <li
            key={isValidElement(child) && child.key != null ? child.key : i}
            className={cn(
              'flex w-[min(88vw,18rem)] shrink-0 snap-start flex-col sm:w-80',
              itemClassName,
            )}
          >
            {child}
          </li>
        ))}
      </ul>
    </div>
  )

  if (!scrollArrows) {
    return <div className={cn('w-full min-w-0', className)}>{scrollPane}</div>
  }

  /** Full-width track (aligns with other dashboard cards); arrows sit outside via translate. */
  const arrowBtn =
    'auth-hero-cta h-9 w-9 sm:h-10 sm:w-10 motion-safe:hover:-translate-y-0.5 motion-safe:active:translate-y-0'

  return (
    <div className={cn('relative w-full min-w-0 overflow-visible', className)}>
      {scrollPane}
      {hasOverflow ? (
        <>
          <div className="pointer-events-none absolute left-0 top-1/2 z-10 -translate-y-1/2 -translate-x-[calc(100%+0.5rem)] sm:-translate-x-[calc(100%+0.625rem)]">
            <Button
              type="button"
              variant="hero"
              size="icon"
              className={cn(arrowBtn, 'pointer-events-auto')}
              disabled={!canScrollLeft}
              aria-label="Scroll left"
              onClick={() => scrollByDir(-1)}
            >
              <ChevronLeft className="size-5" />
            </Button>
          </div>
          <div className="pointer-events-none absolute right-0 top-1/2 z-10 -translate-y-1/2 translate-x-[calc(100%+0.5rem)] sm:translate-x-[calc(100%+0.625rem)]">
            <Button
              type="button"
              variant="hero"
              size="icon"
              className={cn(arrowBtn, 'pointer-events-auto')}
              disabled={!canScrollRight}
              aria-label="Scroll right"
              onClick={() => scrollByDir(1)}
            >
              <ChevronRight className="size-5" />
            </Button>
          </div>
        </>
      ) : null}
    </div>
  )
}

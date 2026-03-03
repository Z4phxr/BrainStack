'use client'

import { useEffect, useRef } from 'react'
import { usePathname } from 'next/navigation'

export function NavigationMetrics() {
  const pathname = usePathname()
  const lastPath = useRef<string | null>(null)
  const navStart = useRef<number | null>(null)

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    const handleClick = (event: MouseEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      const link = target.closest('a') as HTMLAnchorElement | null
      if (!link || !link.href) return
      if (link.origin !== window.location.origin) return
      navStart.current = performance.now()
    }

    document.addEventListener('click', handleClick, true)
    return () => document.removeEventListener('click', handleClick, true)
  }, [])

  useEffect(() => {
    if (process.env.NODE_ENV === 'production') return

    if (lastPath.current && lastPath.current !== pathname) {
      const end = performance.now()
      const start = navStart.current
      if (start) {
        console.log(`[perf] route transition ${lastPath.current} -> ${pathname}: ${(end - start).toFixed(1)}ms`)
      } else {
        console.log(`[perf] route transition to ${pathname}`)
      }
    }
    lastPath.current = pathname
  }, [pathname])

  return null
}

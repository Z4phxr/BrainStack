'use client'

import useIsDark from '@/components/useIsDark'
import { heroMarketingGlassText } from '@/lib/hero-marketing-classes'
import { cn } from '@/lib/utils'

/** Course page H1 using the same gradient glass text as BrainStack in the navbar. */
export function CourseHeroTitle({
  children,
  className,
}: {
  children: React.ReactNode
  className?: string
}) {
  const isDark = useIsDark()
  return (
    <h1
      className={cn(
        'font-hero text-balance text-3xl font-bold tracking-tight md:text-4xl',
        heroMarketingGlassText(isDark),
        className,
      )}
    >
      {children}
    </h1>
  )
}

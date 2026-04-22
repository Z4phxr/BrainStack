import Link from 'next/link'
import { LayoutDashboard } from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { studentGlassCard } from '@/lib/student-glass-styles'
import { cn } from '@/lib/utils'

/**
 * Compact dashboard promo (no WebGL / liquid). Full width of the dashboard column; shorter than AllCoursesPromo.
 */
export function CreativeSpaceDashboardPromo() {
  return (
    <Card
      className={cn(
        'w-full border-0 shadow-none transition-shadow hover:brightness-[1.01] dark:hover:brightness-[1.02]',
        studentGlassCard,
      )}
    >
      <CardContent className="flex flex-col items-center gap-4 px-5 py-6 text-center sm:gap-5 sm:px-6 sm:py-5 md:px-8">
        <div className="mx-auto flex max-w-xl flex-col gap-1.5">
          <p className="text-[0.65rem] font-semibold uppercase tracking-widest text-muted-foreground">
            Creative Space
          </p>
          <h3 className="text-lg font-bold tracking-tight text-foreground sm:text-xl">
            Plan and learn on your own boards
          </h3>
          <p className="text-sm leading-relaxed text-muted-foreground sm:text-[0.9375rem]">
            Notes, decks, flashcards, and sketches on an infinite canvas—separate from your course flow, tuned
            the way you like.
          </p>
        </div>
        <div className="flex w-full shrink-0 justify-center">
          <Button asChild variant="hero" size="default" className="auth-hero-cta gap-2 px-5">
            <Link href="/creative-space">
              <LayoutDashboard className="size-4 shrink-0 opacity-90" aria-hidden />
              Open Creative Space
            </Link>
          </Button>
        </div>
      </CardContent>
    </Card>
  )
}

'use client'

import { useEffect, useState } from 'react'
import Link from 'next/link'
import { ArrowRight, Sparkles } from 'lucide-react'
import useIsDark from '@/components/useIsDark'
import { buttonVariants } from '@/components/ui/button'
import { cn } from '@/lib/utils'
import LiquidEther from '@/components/LiquidEther'

// LiquidEther’s props typing is incomplete vs runtime (see DarkBackground).
// eslint-disable-next-line @typescript-eslint/no-explicit-any
const LiquidEtherAny = LiquidEther as any

/** Same hues as `.student-app-shell` / flashcard glass cards (not paper white). */
const STUDENT_SHELL_LIGHT_BG =
  'linear-gradient(168deg, #eef1f8 0%, #e7edf6 35%, #e2e9f3 60%, #ebeff8 100%)'

/**
 * WebGL liquid is opt-in after mount so SSR matches first paint, and stays off when reduced motion is requested.
 */
function useCatalogPromoLiquidEnabled() {
  const [enabled, setEnabled] = useState(false)
  useEffect(() => {
    const mq = window.matchMedia('(prefers-reduced-motion: reduce)')
    const sync = () => setEnabled(!mq.matches)
    sync()
    mq.addEventListener('change', sync)
    return () => mq.removeEventListener('change', sync)
  }, [])
  return enabled
}

/**
 * In-column promo for `/courses`, same width as the rest of the dashboard (max-w-5xl parent).
 * WebGL liquid (same sim as login/register) only in this block; static shell gradient when reduced motion is on.
 */
export function AllCoursesPromo() {
  const isDark = useIsDark()
  const useLiquid = useCatalogPromoLiquidEnabled()

  return (
    <Link
      href="/courses"
      className={cn(
        'group relative isolate flex min-h-[11rem] w-full flex-col items-center justify-center gap-4 overflow-hidden rounded-2xl px-5 py-10 text-center sm:min-h-[12rem] sm:gap-5 sm:px-6 sm:py-11 md:py-12',
        'motion-safe:scroll-mt-4',
        'outline-none transition-[filter,transform,box-shadow] duration-300 motion-safe:active:brightness-[0.99]',
        'focus-visible:ring-2 focus-visible:ring-offset-2',
        !useLiquid &&
          (isDark
            ? 'bg-gradient-to-br from-slate-950 via-indigo-950 to-violet-950'
            : /* reduced-motion light: same shell family + whisper of indigo at the tail (still reads lavender) */
              'bg-[linear-gradient(168deg,#eef1f8_0%,#e7edf6_34%,#e4e8f7_58%,#ebeff8_100%)]'),
        isDark
          ? [
              'text-white',
              'shadow-md ring-1 ring-white/10',
              'motion-safe:hover:brightness-[1.02] motion-safe:hover:shadow-lg',
              'focus-visible:ring-white/90 focus-visible:ring-offset-background',
            ]
          : [
              /* No 1px border: on light shells it often reads as a gray/black hairline next to the ring */
              'text-slate-950',
              'shadow-md ring-1 ring-indigo-200/45',
              'motion-safe:hover:ring-indigo-300/55 motion-safe:hover:shadow-lg motion-safe:hover:brightness-[1.02]',
              'focus-visible:ring-indigo-400/55 focus-visible:ring-offset-[#e7edf6]',
            ],
      )}
    >
        {useLiquid ? (
          <div
            className="pointer-events-none absolute inset-0 z-0 overflow-hidden rounded-2xl"
            aria-hidden
          >
            <div
              className="absolute inset-0"
              style={{ background: isDark ? '#020617' : STUDENT_SHELL_LIGHT_BG }}
            />
            <div className="absolute inset-0 h-full min-h-full w-full">
              <LiquidEtherAny
                colors={['#5227FF', '#FF9FFC', '#B19EEF']}
                mouseForce={20}
                cursorSize={100}
                isViscous={false}
                viscous={30}
                iterationsViscous={16}
                iterationsPoisson={16}
                resolution={0.35}
                isBounce={false}
                autoDemo={false}
                autoSpeed={0.5}
                autoIntensity={2.2}
                takeoverDuration={0.25}
                autoResumeDelay={800}
                autoRampDuration={0.6}
                color0="#5227FF"
                color1="#FF9FFC"
                color2="#B19EEF"
              />
            </div>
          </div>
        ) : null}

        {useLiquid ? (
          <div
            className={cn(
              'pointer-events-none absolute inset-0 z-[1]',
              isDark
                ? 'bg-gradient-to-br from-slate-950/80 via-indigo-950/74 to-violet-950/80'
                : /* shell base + tame indigo/violet (like dark’s wash, very low chroma) */
                  'bg-gradient-to-br from-[#eef1f8]/62 via-indigo-50/22 to-violet-100/26',
            )}
            aria-hidden
          />
        ) : null}

        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1] opacity-90',
            isDark
              ? 'bg-[radial-gradient(ellipse_90%_55%_at_50%_-10%,rgba(255,255,255,0.28),transparent_55%)]'
              : useLiquid
                ? 'bg-[radial-gradient(ellipse_88%_52%_at_50%_-8%,rgba(238,241,248,0.5),transparent_58%),radial-gradient(ellipse_72%_58%_at_100%_100%,rgba(199,210,254,0.16),transparent_52%)]'
                : 'bg-[radial-gradient(ellipse_88%_52%_at_50%_-8%,rgba(238,241,248,0.35),transparent_58%),radial-gradient(ellipse_70%_55%_at_95%_100%,rgba(199,210,254,0.12),transparent_50%)]',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute -left-20 top-1/2 z-[1] h-72 w-72 -translate-y-1/2 rounded-full blur-3xl motion-safe:transition-opacity motion-safe:group-hover:opacity-90',
            isDark
              ? 'bg-sky-400/25'
              : useLiquid
                ? 'bg-indigo-400/12'
                : 'bg-sky-500/28',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute -right-16 bottom-0 z-[1] h-56 w-56 translate-y-1/4 rounded-full blur-3xl',
            isDark
              ? 'bg-fuchsia-400/20'
              : useLiquid
                ? 'bg-violet-400/11'
                : 'bg-fuchsia-500/22',
          )}
          aria-hidden
        />
        <div
          className={cn(
            'pointer-events-none absolute inset-0 z-[1]',
            isDark
              ? 'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.06)_0%,transparent_40%,rgba(0,0,0,0.35)_100%)]'
              : useLiquid
                ? 'bg-[linear-gradient(to_bottom,rgba(238,241,248,0.32)_0%,transparent_46%,rgba(226,232,252,0.38)_72%,rgba(199,210,254,0.14)_100%)]'
                : 'bg-[linear-gradient(to_bottom,rgba(255,255,255,0.12)_0%,transparent_40%,rgba(224,231,255,0.22)_72%,rgba(99,102,241,0.08)_100%)]',
          )}
          aria-hidden
        />

        <div className="relative z-10 flex max-w-3xl flex-col items-center gap-3 sm:gap-4">
          <div
            className={cn(
              'inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold uppercase tracking-widest sm:text-sm',
              isDark
                ? 'border-white/15 bg-white/5 text-indigo-100/95'
                : 'border-indigo-400/45 bg-indigo-950/[0.08] text-indigo-950 shadow-sm backdrop-blur-md',
            )}
          >
            <Sparkles
              className={cn(
                'size-3.5 shrink-0 sm:size-4',
                isDark ? 'opacity-90' : 'text-indigo-700 opacity-95',
              )}
              aria-hidden
            />
            Full catalog
          </div>

          <div className="flex flex-col items-center gap-3 sm:gap-4">
            <h3
              className={cn(
                'font-hero text-center text-2xl font-extrabold leading-tight tracking-tight sm:text-3xl md:text-4xl',
                !isDark && 'text-slate-950',
              )}
            >
              Every course, one place.
            </h3>
          </div>

          <p
            className={cn(
              'max-w-xl text-pretty text-base leading-relaxed sm:text-lg md:text-xl',
              isDark ? 'text-indigo-100/85' : 'text-slate-800',
            )}
          >
            Browse the complete library with structured paths, lessons, and hands-on tasks. Find your
            next topic and keep building momentum.
          </p>

          <span
            className={cn(
              buttonVariants({ variant: 'hero', size: 'lg' }),
              'auth-hero-cta mt-1 inline-flex h-auto min-h-11 items-center gap-2 rounded-full border-0 px-5 py-2.5 text-base font-semibold sm:mt-2 sm:min-h-12 sm:px-6 sm:py-3 sm:text-lg',
            )}
          >
            Explore all courses
            <ArrowRight
              className="size-5 shrink-0 motion-safe:transition-transform motion-safe:duration-300 motion-safe:group-hover:translate-x-1"
              aria-hidden
            />
          </span>
        </div>
    </Link>
  )
}

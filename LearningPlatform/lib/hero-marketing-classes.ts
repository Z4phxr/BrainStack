import { cn } from '@/lib/utils'

/** Glass fill + rim/glow — BrainStack and auth marketing headings (keep in sync manually if tweaked). */
export function heroMarketingGlassText(isDark: boolean): string {
  if (isDark) {
    return [
      'bg-clip-text text-transparent antialiased',
      'bg-[linear-gradient(165deg,rgba(255,255,255,0.9)_0%,rgba(224,242,254,0.62)_34%,rgba(221,214,254,0.58)_66%,rgba(255,255,255,0.88)_100%)]',
      'drop-shadow-[0_0_1px_rgba(255,255,255,0.5)]',
      'drop-shadow-[0_1px_0_rgba(255,255,255,0.58)]',
      'drop-shadow-[0_2px_4px_rgba(0,0,0,0.55)]',
      'drop-shadow-[0_0_28px_rgba(147,197,253,0.26)]',
    ].join(' ')
  }
  return [
    'bg-clip-text text-transparent antialiased',
    'bg-[linear-gradient(165deg,rgba(96,165,250,0.4)_0%,rgba(15,37,71,0.78)_34%,rgba(36,27,92,0.8)_66%,rgba(129,140,248,0.34)_100%)]',
    'drop-shadow-[0_0_1px_rgba(255,255,255,0.75)]',
    'drop-shadow-[0_1px_0_rgba(255,255,255,0.68)]',
    'drop-shadow-[0_2px_6px_rgba(2,6,23,0.35)]',
    'drop-shadow-[0_0_22px_rgba(59,130,246,0.22)]',
  ].join(' ')
}

export const heroMarketingTitleFont = 'font-hero font-extrabold tracking-tight'

/** Login/register inputs in dark mode: glass text + visible caret (`text-transparent` otherwise hides caret). */
export function heroMarketingAuthInputClass(isDark: boolean): string {
  return isDark
    ? cn('bg-transparent caret-white', heroMarketingGlassText(true))
    : 'bg-transparent text-slate-900 placeholder:text-slate-500'
}

/** Hero subtitle: Platform for courses… — also used for auth descriptions, labels, and secondary lines. */
export function heroMarketingBodyClass(
  isDark: boolean,
  align: 'center' | 'left' = 'center',
): string {
  return cn(
    'text-xl font-medium',
    align === 'center' ? 'text-center' : 'text-left',
    isDark ? 'text-muted-foreground' : 'text-slate-800',
  )
}

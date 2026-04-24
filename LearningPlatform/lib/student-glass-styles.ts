/** Student shell: frosted glass. Light = stronger frost + blur so panels read “liquid” on the tinted shell; dark unchanged. */
export const studentGlassCard =
  'rounded-xl border border-slate-300/45 bg-white/[0.34] shadow-[0_10px_36px_-12px_rgba(15,23,42,0.08),0_1px_0_rgba(255,255,255,0.65)_inset] backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-white/10 dark:shadow-none dark:backdrop-saturate-100 dark:backdrop-blur-lg'

export const studentGlassNav =
  'border-b border-slate-200/80 bg-white/[0.72] shadow-sm backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-white/10 dark:shadow-none dark:backdrop-blur-lg dark:backdrop-saturate-100'

/** Capsule chips (level, subject, “Adaptive”, …) on glass cards—extra frost + rim. */
export const studentGlassPill =
  'inline-flex items-center rounded-full border px-3 py-1 text-xs font-semibold tracking-wide shadow-sm backdrop-blur-md ' +
  'border-slate-300/55 bg-white/[0.42] text-slate-800 ring-1 ring-white/50 dark:border-white/20 dark:bg-white/[0.12] dark:text-gray-100 dark:ring-white/10 dark:shadow-none'

/** Admin shell: same liquid glass as student navbar, used for top bar. */
export const adminGlassTopbar = studentGlassNav

/** Admin sidebar: vertical rim + frost (pairs with `adminGlassTopbar`). */
export const adminGlassSidebar =
  'border-r border-slate-200/80 bg-white/[0.72] shadow-sm backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-white/10 dark:shadow-none dark:backdrop-blur-lg dark:backdrop-saturate-100'

/** Right-edge sheet (e.g. flashcard editor) — same frost as sidebar, left rim. */
export const adminGlassSheet =
  'border-l border-slate-200/80 bg-white/[0.72] shadow-2xl backdrop-blur-xl backdrop-saturate-150 dark:border-white/20 dark:bg-white/10 dark:backdrop-blur-lg dark:backdrop-saturate-100'

/** Admin content cards — same panel treatment as student `studentGlassCard`. */
export const adminGlassCard = studentGlassCard

/** Secondary / toolbar buttons on glass (matches admin course row actions). */
export const adminGlassOutlineButton =
  'border-white/25 bg-white/10 backdrop-blur-sm hover:bg-white/15 dark:border-white/20 dark:bg-white/5 dark:hover:bg-white/10'

/**
 * Student dashboard (e.g. Your Flashcards strip): secondary nav on glass.
 * Light: bright frost + slate rim + lift shadow. Dark: same *shape* inverted — neutral frost
 * (`white/8` on shell), soft rim, depth shadow — no extra hue bands (matches glass cards).
 */
export const studentGlassFooterNavButton =
  'border-slate-400/55 bg-white/[0.72] text-slate-900 shadow-[0_12px_34px_-10px_rgba(15,23,42,0.22),0_1px_0_rgba(255,255,255,0.75)_inset] backdrop-blur-md ' +
  'hover:bg-white/[0.92] hover:border-slate-400/70 hover:shadow-[0_16px_40px_-10px_rgba(15,23,42,0.26)] ' +
  'dark:border-white/18 dark:bg-white/[0.08] dark:text-gray-100 dark:backdrop-blur-md ' +
  'dark:shadow-[0_12px_36px_-12px_rgba(0,0,0,0.55),inset_0_1px_0_rgba(255,255,255,0.055)] ' +
  'dark:hover:border-white/24 dark:hover:bg-white/[0.11] dark:hover:shadow-[0_14px_40px_-12px_rgba(0,0,0,0.6),inset_0_1px_0_rgba(255,255,255,0.07)]'

/** Compact icon / sort control on glass surfaces. */
export const adminGlassIconToggleInactive =
  'border-slate-300/50 bg-white/20 text-muted-foreground hover:bg-white/35 hover:text-foreground dark:border-white/15 dark:bg-white/[0.08] dark:hover:bg-white/[0.12]'

export const adminGlassIconToggleActive =
  'border-primary/40 bg-primary/15 text-primary shadow-sm dark:border-primary/35 dark:bg-primary/20 dark:text-primary'


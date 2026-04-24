'use client'

import { useThemeIsDark } from '@/components/theme-preference-provider'

/** Mirrors `<html class="dark">` and shared cookie/LS resolution — must run under `ThemePreferenceProvider`. */
export default function useIsDark() {
  return useThemeIsDark()
}

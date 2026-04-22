'use client'

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useState,
} from 'react'
import { creativeSpaceSurfaceStyle } from '@/lib/creative-space-surface-vars'

/** Legacy global key (migrated once per board into `:${spaceId}`). */
export const CREATIVE_SPACE_SURFACE_APPEARANCE_KEY = 'creative-space-surface-appearance'

function surfaceStorageKey(spaceId: string) {
  return `${CREATIVE_SPACE_SURFACE_APPEARANCE_KEY}:${spaceId}`
}

type CreativeSpaceSurfaceAppearance = 'light' | 'dark'

type CreativeSpaceSurfaceContextValue = {
  appearance: CreativeSpaceSurfaceAppearance
  setAppearance: (next: CreativeSpaceSurfaceAppearance) => void
}

const CreativeSpaceSurfaceContext = createContext<CreativeSpaceSurfaceContextValue | null>(null)

export function useCreativeSpaceSurface() {
  const ctx = useContext(CreativeSpaceSurfaceContext)
  if (!ctx) {
    throw new Error('useCreativeSpaceSurface must be used within CreativeSpaceSurfaceProvider')
  }
  return ctx
}

export function CreativeSpaceSurfaceProvider({
  spaceId,
  children,
}: {
  spaceId: string
  children: React.ReactNode
}) {
  const [appearance, setAppearanceState] = useState<CreativeSpaceSurfaceAppearance>('light')
  const storageKey = surfaceStorageKey(spaceId)

  useEffect(() => {
    try {
      let raw = window.localStorage.getItem(storageKey)
      if (raw !== 'dark' && raw !== 'light') {
        const legacy = window.localStorage.getItem(CREATIVE_SPACE_SURFACE_APPEARANCE_KEY)
        if (legacy === 'dark' || legacy === 'light') {
          raw = legacy
          window.localStorage.setItem(storageKey, legacy)
        }
      }
      if (raw === 'dark' || raw === 'light') setAppearanceState(raw)
      else setAppearanceState('light')
    } catch {
      // ignore
    }
    const onStorage = (e: StorageEvent) => {
      if (e.key !== storageKey) return
      if (e.newValue === 'dark' || e.newValue === 'light') setAppearanceState(e.newValue)
    }
    window.addEventListener('storage', onStorage)
    return () => window.removeEventListener('storage', onStorage)
  }, [storageKey])

  const setAppearance = useCallback(
    (next: CreativeSpaceSurfaceAppearance) => {
      setAppearanceState(next)
      try {
        window.localStorage.setItem(storageKey, next)
      } catch {
        // ignore
      }
    },
    [storageKey],
  )

  const value = useMemo(
    () => ({
      appearance,
      setAppearance,
    }),
    [appearance, setAppearance],
  )

  const surfaceStyle = useMemo(() => creativeSpaceSurfaceStyle(appearance), [appearance])

  return (
    <CreativeSpaceSurfaceContext.Provider value={value}>
      <div
        data-creative-surface={appearance}
        className="creative-space-surface relative flex h-full min-h-0 flex-col overflow-hidden bg-background text-foreground"
        style={surfaceStyle}
      >
        <div className="relative min-h-0 flex-1 overflow-hidden">{children}</div>
      </div>
    </CreativeSpaceSurfaceContext.Provider>
  )
}

'use client'

import Link from 'next/link'
import { useRouter } from 'next/navigation'
import {
  Fragment,
  type ComponentType,
  useCallback,
  useEffect,
  useLayoutEffect,
  useMemo,
  useRef,
  useState,
} from 'react'
import {
  ArrowLeft,
  Brain,
  BookOpen,
  CirclePlus,
  Hand,
  Edit3,
  Image as ImageIcon,
  MoreHorizontal,
  PenLine,
  PenTool,
  Eraser,
  List,
  Minus,
  Move,
  Plus,
  Search,
  Settings2,
  Palette,
  StickyNote,
  Video,
  X,
  Zap,
} from 'lucide-react'
import { Button } from '@/components/ui/button'
import { Card, CardContent } from '@/components/ui/card'
import { Input } from '@/components/ui/input'
import { useCreativeSpaceSurface } from '@/components/student/creative-space-surface-context'
import {
  BOARD_PATTERN_PICKER_ORDER,
  BOARD_PATTERN_STORAGE_KEY,
  boardPatternOverlayStyle,
  boardPatternPickerLabel,
  boardPatternThumbnailStyle,
  parseBoardPatternId,
  type BoardPatternId,
} from '@/lib/creative-space-board-pattern'
import {
  appearanceForBoardHex,
  CREATIVE_SPACE_DARK_BOARD_PRESETS,
  CREATIVE_SPACE_LIGHT_BOARD_PRESETS,
  isPresetBoardHex,
  luminanceBasedChrome,
  normalizeHexColor,
} from '@/lib/creative-space-board-surface'
import { cn } from '@/lib/utils'

/** Stable options objects so `removeEventListener` matches `addEventListener`. */
const BOARD_PAN_WINDOW_MOVE_OPTS: AddEventListenerOptions = { capture: true, passive: false }
const BOARD_PAN_WINDOW_UP_OPTS: AddEventListenerOptions = { capture: true }

type CreativeItemType = 'TEXT' | 'IMAGE' | 'VIDEO' | 'LINK' | 'COURSE' | 'FLASHCARD' | 'DECK'
type SidebarTool = CreativeItemType | 'DRAW' | 'HAND'

type CreativeItem = {
  id: string
  type: CreativeItemType
  x: number
  y: number
  width: number
  height: number
  zIndex: number
  payload: Record<string, unknown> | null
}

type DrawingStroke = {
  id: string
  points: Array<{ x: number; y: number }>
  color: string
  width: number
}

type MediaDoc = {
  id: string
  filename: string
  alt?: string
  url?: string
}

type CreativeDeckResult = {
  id: string
  slug: string
  name: string
  description: string | null
  cardCount: number
}

type SystemDeckResult = {
  id: string
  slug: string
  name: string
  description: string | null
  kind: 'course' | 'standalone'
  cardCount: number
  childDeckCount: number
  course: { title: string; slug: string } | null
}

type CourseSearchResult = {
  id: string
  title: string
  slug: string
  description: string
  subject: string
  coverImage: { filename: string; alt: string } | null
  progressPercentage: number
  completedLessons: number
  totalLessons: number
}

const BOARD_WIDTH = 7200
const BOARD_HEIGHT = 4400
const BOARD_ZOOM_STORAGE_KEY = 'creative-space-board-zoom'
const BOARD_ZOOM_MIN = 0.35
const BOARD_ZOOM_MAX = 2.5

/** Map screen position to board coordinates (handles CSS `zoom` / non-uniform rect). */
function clientToBoardPixel(boardRect: DOMRect, clientX: number, clientY: number) {
  const rw = boardRect.width || 1
  const rh = boardRect.height || 1
  const x = ((clientX - boardRect.left) / rw) * BOARD_WIDTH
  const y = ((clientY - boardRect.top) / rh) * BOARD_HEIGHT
  return { x, y }
}

function clientToCanvasPixel(canvas: HTMLCanvasElement, clientX: number, clientY: number) {
  const rect = canvas.getBoundingClientRect()
  const rw = rect.width || 1
  const rh = rect.height || 1
  return {
    x: ((clientX - rect.left) / rw) * canvas.width,
    y: ((clientY - rect.top) / rh) * canvas.height,
  }
}

const DEFAULT_NOTE_SIZE = { width: 280, height: 220 }
const DEFAULT_IMAGE_SIZE = { width: 320, height: 240 }
const DECK_CARDS_PREVIEW_ROWS = 10
const FLASHCARD_DRAG_MIME = 'application/x-creative-flashcard'
/** translateY (px) for deck quick-action bubbles: single row on a shallow arc (middle dips). */
const DECK_ACTION_ARC_Y_PX = [3, 11, 11, 3] as const

const DRAW_PRESET_COLORS = ['#171717', '#1d4ed8', '#dc2626', '#16a34a', '#9333ea', '#ea580c'] as const
const DRAW_WIDTH_PRESETS = [2, 4, 8, 14] as const
const DRAW_CUSTOM_COLORS_STORAGE_KEY = 'creative-space-draw-custom-colors'
const MAX_CUSTOM_DRAW_COLORS = 12
const BOARD_BACKGROUND_STORAGE_KEY = 'creative-space-board-background'
const BOARD_CUSTOM_CHROME_STORAGE_KEY = 'creative-space-custom-chrome'

function boardPrefsStorageKey(spaceId: string, baseKey: string) {
  return `${baseKey}:${spaceId}`
}

type CustomBoardChromeMode = 'auto' | 'light' | 'dark'

function readStoredCustomDrawColors(): string[] {
  if (typeof window === 'undefined') return []
  try {
    const raw = window.localStorage.getItem(DRAW_CUSTOM_COLORS_STORAGE_KEY)
    if (!raw) return []
    const parsed = JSON.parse(raw) as unknown
    if (!Array.isArray(parsed)) return []
    return parsed
      .map((c) => (typeof c === 'string' ? normalizeHexColor(c) : null))
      .filter((c): c is string => Boolean(c))
      .filter((c, i, a) => a.indexOf(c) === i)
      .slice(0, MAX_CUSTOM_DRAW_COLORS)
  } catch {
    return []
  }
}

type DrawCanvasTool = 'pen' | 'eraser'

function distancePointToSegment(
  px: number,
  py: number,
  ax: number,
  ay: number,
  bx: number,
  by: number,
): number {
  const abx = bx - ax
  const aby = by - ay
  const apx = px - ax
  const apy = py - ay
  const ab2 = abx * abx + aby * aby
  if (ab2 === 0) return Math.hypot(apx, apy)
  let t = (apx * abx + apy * aby) / ab2
  t = Math.max(0, Math.min(1, t))
  const cx = ax + t * abx
  const cy = ay + t * aby
  return Math.hypot(px - cx, py - cy)
}

function minDistancePointToStroke(px: number, py: number, stroke: DrawingStroke): number {
  const pts = stroke.points
  if (pts.length === 0) return Infinity
  if (pts.length === 1) return Math.hypot(px - pts[0].x, py - pts[0].y)
  let min = Infinity
  for (let i = 0; i < pts.length - 1; i++) {
    min = Math.min(
      min,
      distancePointToSegment(px, py, pts[i].x, pts[i].y, pts[i + 1].x, pts[i + 1].y),
    )
  }
  return min
}

function strokeEraseHitRadius(stroke: DrawingStroke): number {
  return Math.max(12, stroke.width * 3)
}

type DeckFlashcardDragData = {
  flashcardId: string
  sourceDeckId: string
  frontText: string
  backText: string
}

export function CreativeSpaceClient({ spaceId }: { spaceId: string }) {
  const router = useRouter()
  const { appearance, setAppearance } = useCreativeSpaceSurface()
  const surfaceDark = appearance === 'dark'
  const [items, setItems] = useState<CreativeItem[]>([])
  const [drawMode, setDrawMode] = useState(false)
  const [strokes, setStrokes] = useState<DrawingStroke[]>([])
  const [settingsOpen, setSettingsOpen] = useState(false)
  const [spellCheckEnabled, setSpellCheckEnabled] = useState(false)
  const [boardBackgroundColor, setBoardBackgroundColor] = useState('#ffffff')
  const [boardPatternId, setBoardPatternId] = useState<BoardPatternId>('none')
  const [boardZoom, setBoardZoom] = useState(1)
  const [customBoardChromeMode, setCustomBoardChromeMode] = useState<CustomBoardChromeMode>('auto')

  const [mediaPickerItemId, setMediaPickerItemId] = useState<string | null>(null)
  const [mediaDocs, setMediaDocs] = useState<MediaDoc[]>([])
  const [mediaLoading, setMediaLoading] = useState(false)
  const [mediaUploading, setMediaUploading] = useState(false)
  const [mediaQuery, setMediaQuery] = useState('')
  const [coursePickerItemId, setCoursePickerItemId] = useState<string | null>(null)
  const [courseQuery, setCourseQuery] = useState('')
  const [courseResults, setCourseResults] = useState<CourseSearchResult[]>([])
  const [courseLoading, setCourseLoading] = useState(false)
  const [flashcardMenuOpen, setFlashcardMenuOpen] = useState(false)
  const [deckCreateOpen, setDeckCreateOpen] = useState(false)
  const [deckSelectOpen, setDeckSelectOpen] = useState(false)
  const [deckName, setDeckName] = useState('')
  const [deckDescription, setDeckDescription] = useState('')
  const [deckSubmitting, setDeckSubmitting] = useState(false)
  const [deckQuery, setDeckQuery] = useState('')
  const [creativeDeckList, setCreativeDeckList] = useState<CreativeDeckResult[]>([])
  const [systemDeckList, setSystemDeckList] = useState<SystemDeckResult[]>([])
  const [deckLoading, setDeckLoading] = useState(false)
  const [deckFlashcardModal, setDeckFlashcardModal] = useState<{
    itemId: string
    deckId: string
    deckName: string
  } | null>(null)
  const [deckFlashcardFront, setDeckFlashcardFront] = useState('')
  const [deckFlashcardBack, setDeckFlashcardBack] = useState('')
  const [deckFlashcardSubmitting, setDeckFlashcardSubmitting] = useState(false)
  const [deckActionsItemId, setDeckActionsItemId] = useState<string | null>(null)
  const [deckActionsView, setDeckActionsView] = useState<'menu' | 'cards'>('menu')
  const [deckActionCards, setDeckActionCards] = useState<
    Array<{ id: string; frontText: string; backText: string }>
  >([])
  const [deckActionCardsLoading, setDeckActionCardsLoading] = useState(false)
  const [deckActionSourceDeckId, setDeckActionSourceDeckId] = useState<string | null>(null)
  const [flippedFlashcardById, setFlippedFlashcardById] = useState<Record<string, boolean>>({})
  const [drawCanvasTool, setDrawCanvasTool] = useState<DrawCanvasTool>('pen')
  const [drawPenColor, setDrawPenColor] = useState<string>('#1d4ed8')
  const [drawPenWidth, setDrawPenWidth] = useState<number>(4)
  const [drawToolsPanelOpen, setDrawToolsPanelOpen] = useState(true)
  const [customDrawColors, setCustomDrawColors] = useState<string[]>([])
  const [boardPanning, setBoardPanning] = useState(false)
  const skipFirstCustomDrawPersist = useRef(true)
  const skipFirstBoardBackgroundPersist = useRef(true)
  const skipFirstCustomChromePersist = useRef(true)
  const skipFirstBoardPatternPersist = useRef(true)
  const skipFirstBoardZoomPersist = useRef(true)
  const boardZoomRef = useRef(1)
  const boardPanDocCleanupRef = useRef<(() => void) | null>(null)

  const boardPanPointerRef = useRef<{
    pointerId: number
    startClientX: number
    startClientY: number
    startScrollLeft: number
    startScrollTop: number
  } | null>(null)
  /** True after the user changes the value in the native color UI (avoids saving on dismiss without picking). */
  const addSavedColorPickerDirtyRef = useRef(false)
  /** True while the “+” saved-color `<input type="color">` is in a picker session (focus → dismiss). */
  const addSavedColorPickerSessionRef = useRef(false)
  const addSavedColorInputRef = useRef<HTMLInputElement | null>(null)
  /** Sidebar + drawing-tools column — clicks inside do not finalize via document capture. */
  const creativeDrawUiRef = useRef<HTMLDivElement | null>(null)
  const settingsPanelRef = useRef<HTMLDivElement | null>(null)
  const settingsTriggerRef = useRef<HTMLDivElement | null>(null)
  /** After closing the color picker by clicking the board, skip one canvas pointerdown (no stroke, tools stay open). */
  const suppressNextCanvasPointerAfterColorPickerRef = useRef(false)

  const boardRef = useRef<HTMLDivElement | null>(null)
  const scrollRef = useRef<HTMLDivElement | null>(null)
  /** Root for wheel routing — document capture listener must only run over this surface (not the whole tab). */
  const creativeWheelRootRef = useRef<HTMLDivElement | null>(null)
  /** True while Z is held (outside fields) — wheel zooms the board without using Ctrl (Chrome tab zoom). */
  const boardZoomZKeyHeldRef = useRef(false)
  const canvasRef = useRef<HTMLCanvasElement | null>(null)
  const dragRef = useRef<{
    itemId: string
    itemType: CreativeItemType
    dx: number
    dy: number
    startClientX: number
    startClientY: number
    moved: boolean
    pointerId: number
  } | null>(null)
  /** Coalesce item drag position updates to one setState per animation frame (reduces jank over video embeds). */
  const itemDragRafRef = useRef<number | null>(null)
  const itemDragPendingRef = useRef<{ itemId: string; x: number; y: number } | null>(null)
  const suppressNextFlashcardClickRef = useRef(false)
  const resizeRef = useRef<{
    itemId: string
    type: CreativeItemType
    startX: number
    startY: number
    startWidth: number
    startHeight: number
    aspectRatio: number
  } | null>(null)
  const drawingDraftRef = useRef<DrawingStroke | null>(null)
  const eraserDraggingRef = useRef(false)
  const saveTimersRef = useRef<Map<string, number>>(new Map())
  const drawSaveTimerRef = useRef<number | null>(null)
  const flashcardMenuRef = useRef<HTMLDivElement | null>(null)

  const toolMeta: Array<{ id: SidebarTool; label: string; icon: ComponentType<{ className?: string }> }> =
    useMemo(
      () => [
        { id: 'HAND', label: 'Pan board', icon: Hand },
        { id: 'DRAW', label: 'Draw mode', icon: PenLine },
        { id: 'TEXT', label: 'Text note', icon: StickyNote },
        { id: 'IMAGE', label: 'Image card', icon: ImageIcon },
        { id: 'VIDEO', label: 'Video card', icon: Video },
        { id: 'FLASHCARD', label: 'Creative flashcard', icon: PenTool },
        { id: 'COURSE', label: 'Course card', icon: BookOpen },
      ],
      [],
    )

  const boardPatternLayerStyle = useMemo(
    () => boardPatternOverlayStyle(boardPatternId, surfaceDark),
    [boardPatternId, surfaceDark],
  )

  const boardScrollSurfaceStyle = useMemo(() => {
    return {
      backgroundColor: boardBackgroundColor,
      ...boardPatternLayerStyle,
    }
  }, [boardBackgroundColor, boardPatternLayerStyle])

  useEffect(() => {
    try {
      const raw = window.localStorage.getItem('creative-space-note-spellcheck')
      if (raw === 'on') setSpellCheckEnabled(true)
      if (raw === 'off') setSpellCheckEnabled(false)
    } catch {
      // ignore storage errors
    }
  }, [])

  useEffect(() => {
    try {
      const key = boardPrefsStorageKey(spaceId, BOARD_BACKGROUND_STORAGE_KEY)
      let raw = window.localStorage.getItem(key)
      if (!raw) {
        const legacy = window.localStorage.getItem(BOARD_BACKGROUND_STORAGE_KEY)
        if (legacy) {
          raw = legacy
          window.localStorage.setItem(key, legacy)
        }
      }
      const n = raw ? normalizeHexColor(raw) : null
      if (n) setBoardBackgroundColor(n)
    } catch {
      // ignore storage errors
    }
  }, [spaceId])

  useEffect(() => {
    try {
      const key = boardPrefsStorageKey(spaceId, BOARD_CUSTOM_CHROME_STORAGE_KEY)
      let raw = window.localStorage.getItem(key)
      if (!raw) {
        const legacy = window.localStorage.getItem(BOARD_CUSTOM_CHROME_STORAGE_KEY)
        if (legacy === 'light' || legacy === 'dark' || legacy === 'auto') {
          raw = legacy
          window.localStorage.setItem(key, legacy)
        }
      }
      if (raw === 'light' || raw === 'dark' || raw === 'auto') setCustomBoardChromeMode(raw)
    } catch {
      // ignore storage errors
    }
  }, [spaceId])

  useEffect(() => {
    try {
      const key = boardPrefsStorageKey(spaceId, BOARD_PATTERN_STORAGE_KEY)
      let raw = window.localStorage.getItem(key)
      if (raw == null || raw === '') {
        const legacy = window.localStorage.getItem(BOARD_PATTERN_STORAGE_KEY)
        if (legacy) {
          raw = legacy
          window.localStorage.setItem(key, legacy)
        }
      }
      setBoardPatternId(parseBoardPatternId(raw))
    } catch {
      // ignore storage errors
    }
  }, [spaceId])

  useEffect(() => {
    if (isPresetBoardHex(boardBackgroundColor)) {
      setAppearance(appearanceForBoardHex(boardBackgroundColor))
      return
    }
    if (customBoardChromeMode === 'auto') {
      setAppearance(luminanceBasedChrome(boardBackgroundColor))
    } else {
      setAppearance(customBoardChromeMode)
    }
  }, [boardBackgroundColor, customBoardChromeMode, setAppearance])

  useEffect(() => {
    if (skipFirstCustomChromePersist.current) {
      skipFirstCustomChromePersist.current = false
      return
    }
    try {
      window.localStorage.setItem(
        boardPrefsStorageKey(spaceId, BOARD_CUSTOM_CHROME_STORAGE_KEY),
        customBoardChromeMode,
      )
    } catch {
      // ignore storage errors
    }
  }, [customBoardChromeMode, spaceId])

  useEffect(() => {
    if (skipFirstBoardPatternPersist.current) {
      skipFirstBoardPatternPersist.current = false
      return
    }
    try {
      window.localStorage.setItem(boardPrefsStorageKey(spaceId, BOARD_PATTERN_STORAGE_KEY), boardPatternId)
    } catch {
      // ignore storage errors
    }
  }, [boardPatternId, spaceId])

  useEffect(() => {
    boardZoomRef.current = boardZoom
  }, [boardZoom])

  useEffect(() => {
    try {
      const key = boardPrefsStorageKey(spaceId, BOARD_ZOOM_STORAGE_KEY)
      let raw = window.localStorage.getItem(key)
      if (raw == null || raw === '') {
        const legacy = window.localStorage.getItem(BOARD_ZOOM_STORAGE_KEY)
        if (legacy) {
          raw = legacy
          window.localStorage.setItem(key, legacy)
        }
      }
      const n = raw ? Number.parseFloat(raw) : Number.NaN
      if (!Number.isFinite(n)) return
      const z = Math.min(BOARD_ZOOM_MAX, Math.max(BOARD_ZOOM_MIN, n))
      boardZoomRef.current = z
      setBoardZoom(z)
    } catch {
      // ignore storage errors
    }
  }, [spaceId])

  useEffect(() => {
    if (skipFirstBoardZoomPersist.current) {
      skipFirstBoardZoomPersist.current = false
      return
    }
    try {
      window.localStorage.setItem(boardPrefsStorageKey(spaceId, BOARD_ZOOM_STORAGE_KEY), String(boardZoom))
    } catch {
      // ignore storage errors
    }
  }, [boardZoom, spaceId])

  useLayoutEffect(() => {
    const isEditableTarget = (t: EventTarget | null) =>
      t instanceof Element &&
      Boolean(t.closest('textarea, input, select, [contenteditable="true"]'))

    const onKeyDown = (e: KeyboardEvent) => {
      if (e.key !== 'z' && e.key !== 'Z') return
      if (isEditableTarget(e.target)) return
      boardZoomZKeyHeldRef.current = true
    }
    const onKeyUp = (e: KeyboardEvent) => {
      if (e.key !== 'z' && e.key !== 'Z') return
      boardZoomZKeyHeldRef.current = false
    }
    const clearZ = () => {
      boardZoomZKeyHeldRef.current = false
    }
    const onVisibility = () => {
      if (document.visibilityState === 'hidden') boardZoomZKeyHeldRef.current = false
    }
    window.addEventListener('keydown', onKeyDown, true)
    window.addEventListener('keyup', onKeyUp, true)
    window.addEventListener('blur', clearZ)
    document.addEventListener('visibilitychange', onVisibility)
    return () => {
      window.removeEventListener('keydown', onKeyDown, true)
      window.removeEventListener('keyup', onKeyUp, true)
      window.removeEventListener('blur', clearZ)
      document.removeEventListener('visibilitychange', onVisibility)
    }
  }, [])

  useLayoutEffect(() => {
    const clampZoom = (z: number) => Math.min(BOARD_ZOOM_MAX, Math.max(BOARD_ZOOM_MIN, z))
    const anchorScroll = (scrollEl: HTMLDivElement, prevZ: number, nextZ: number, vx: number, vy: number) => {
      const boardX = (scrollEl.scrollLeft + vx) / prevZ
      const boardY = (scrollEl.scrollTop + vy) / prevZ
      requestAnimationFrame(() => {
        const sc = scrollRef.current
        if (!sc) return
        const maxL = Math.max(0, sc.scrollWidth - sc.clientWidth)
        const maxT = Math.max(0, sc.scrollHeight - sc.clientHeight)
        sc.scrollLeft = Math.max(0, Math.min(maxL, boardX * nextZ - vx))
        sc.scrollTop = Math.max(0, Math.min(maxT, boardY * nextZ - vy))
      })
    }
    const wheelDeltaPixels = (ev: WheelEvent, primary: 'x' | 'y') => {
      const v = primary === 'x' ? ev.deltaX : ev.deltaY
      if (ev.deltaMode === WheelEvent.DOM_DELTA_LINE) return v * 16
      if (ev.deltaMode === WheelEvent.DOM_DELTA_PAGE) {
        const sc = scrollRef.current
        const page = primary === 'x' ? sc?.clientWidth ?? 400 : sc?.clientHeight ?? 400
        return v * page
      }
      return v
    }

    const opts: AddEventListenerOptions = { capture: true, passive: false }

    const onWheel = (e: WheelEvent) => {
      const root = creativeWheelRootRef.current
      const node = e.target as Node | null
      if (!root || !node || !root.contains(node)) return
      if (node instanceof Element && node.closest('textarea, input, select, [contenteditable="true"]')) return

      const sc = scrollRef.current
      if (!sc) return

      if (e.shiftKey) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const maxL = Math.max(0, sc.scrollWidth - sc.clientWidth)
        const dx =
          Math.abs(e.deltaX) > Math.abs(e.deltaY) ? wheelDeltaPixels(e, 'x') : wheelDeltaPixels(e, 'y')
        sc.scrollLeft = Math.max(0, Math.min(maxL, sc.scrollLeft + dx))
        return
      }

      /*
       * Board zoom: hold Z + wheel (not Ctrl — Chrome uses Ctrl+wheel for tab zoom and it is unreliable to override).
       * Z is ignored while typing in inputs (see key listeners). Capture + preventDefault applies zoom only here.
       */
      if (boardZoomZKeyHeldRef.current) {
        e.preventDefault()
        e.stopImmediatePropagation()
        const rect = sc.getBoundingClientRect()
        const vx = e.clientX - rect.left
        const vy = e.clientY - rect.top
        const prev = boardZoomRef.current
        const dy = wheelDeltaPixels(e, 'y')
        const next = clampZoom(prev * (dy > 0 ? 0.92 : 1.08))
        if (next === prev) return
        boardZoomRef.current = next
        setBoardZoom(next)
        anchorScroll(sc, prev, next, vx, vy)
        return
      }

      /* Plain wheel: do not cancel — native vertical scroll on the board scroller. */
    }

    document.addEventListener('wheel', onWheel, opts)
    return () => document.removeEventListener('wheel', onWheel, opts)
  }, [])

  const adjustBoardZoomFromControl = useCallback((factor: number) => {
    const sc = scrollRef.current
    if (!sc) return
    const prev = boardZoomRef.current
    const next = Math.min(BOARD_ZOOM_MAX, Math.max(BOARD_ZOOM_MIN, prev * factor))
    if (next === prev) return
    const vx = sc.clientWidth / 2
    const vy = sc.clientHeight / 2
    const boardX = (sc.scrollLeft + vx) / prev
    const boardY = (sc.scrollTop + vy) / prev
    boardZoomRef.current = next
    setBoardZoom(next)
    requestAnimationFrame(() => {
      const sc2 = scrollRef.current
      if (!sc2) return
      const maxL = Math.max(0, sc2.scrollWidth - sc2.clientWidth)
      const maxT = Math.max(0, sc2.scrollHeight - sc2.clientHeight)
      sc2.scrollLeft = Math.max(0, Math.min(maxL, boardX * next - vx))
      sc2.scrollTop = Math.max(0, Math.min(maxT, boardY * next - vy))
    })
  }, [])

  useEffect(() => {
    if (skipFirstBoardBackgroundPersist.current) {
      skipFirstBoardBackgroundPersist.current = false
      return
    }
    try {
      window.localStorage.setItem(
        boardPrefsStorageKey(spaceId, BOARD_BACKGROUND_STORAGE_KEY),
        boardBackgroundColor,
      )
    } catch {
      // ignore storage errors
    }
  }, [boardBackgroundColor, spaceId])

  useEffect(() => {
    try {
      window.localStorage.setItem(
        'creative-space-note-spellcheck',
        spellCheckEnabled ? 'on' : 'off',
      )
    } catch {
      // ignore storage errors
    }
  }, [spellCheckEnabled])

  useEffect(() => {
    setCustomDrawColors(readStoredCustomDrawColors())
  }, [])

  useEffect(() => {
    if (skipFirstCustomDrawPersist.current) {
      skipFirstCustomDrawPersist.current = false
      return
    }
    try {
      window.localStorage.setItem(DRAW_CUSTOM_COLORS_STORAGE_KEY, JSON.stringify(customDrawColors))
    } catch {
      // ignore storage errors
    }
  }, [customDrawColors])

  useEffect(() => {
    if (!flashcardMenuOpen) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as Node | null
      if (!target) return
      if (flashcardMenuRef.current?.contains(target)) return
      setFlashcardMenuOpen(false)
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [flashcardMenuOpen])

  useEffect(() => {
    if (!deckActionsItemId) return
    const onPointerDown = (event: PointerEvent) => {
      const target = event.target as HTMLElement | null
      if (!target) return
      if (target.closest('[data-deck-actions-menu]')) return
      setDeckActionsItemId(null)
      setDeckActionsView('menu')
    }
    window.addEventListener('pointerdown', onPointerDown)
    return () => window.removeEventListener('pointerdown', onPointerDown)
  }, [deckActionsItemId])

  const hydrateDeckPayloadCounts = useCallback(async (rawItems: CreativeItem[]): Promise<CreativeItem[]> => {
    const deckIds = [
      ...new Set(
        rawItems
          .filter((item) => item.type === 'DECK')
          .map((item) => String((item.payload as Record<string, unknown> | null)?.deckId ?? '').trim())
          .filter((id) => id.length > 0),
      ),
    ]
    if (deckIds.length === 0) return rawItems

    try {
      const res = await fetch('/api/creative-decks/select-options')
      if (!res.ok) return rawItems
      const data = (await res.json()) as {
        creativeDecks: CreativeDeckResult[]
        systemDecks: SystemDeckResult[]
      }
      const cardCountByDeckId = new Map<string, number>()
      const slugByDeckId = new Map<string, string>()
      ;(data.creativeDecks ?? []).forEach((deck) => {
        cardCountByDeckId.set(deck.id, Number(deck.cardCount ?? 0))
        if (deck.slug) slugByDeckId.set(deck.id, deck.slug)
      })
      ;(data.systemDecks ?? []).forEach((deck) => {
        cardCountByDeckId.set(deck.id, Number(deck.cardCount ?? 0))
        if (deck.slug) slugByDeckId.set(deck.id, deck.slug)
      })

      return rawItems.map((item) => {
        if (item.type !== 'DECK') return item
        const payload = (item.payload ?? {}) as Record<string, unknown>
        const deckId = String(payload.deckId ?? '').trim()
        if (!deckId) return item
        const latestCount = cardCountByDeckId.get(deckId)
        const nextPayload = { ...payload }
        let changed = false
        if (typeof latestCount === 'number' && Number(payload.flashcardCount ?? 0) !== latestCount) {
          nextPayload.flashcardCount = latestCount
          changed = true
        }
        const knownSlug = slugByDeckId.get(deckId)
        if (knownSlug && !String(payload.deckSlug ?? '').trim()) {
          nextPayload.deckSlug = knownSlug
          changed = true
        }
        if (!changed) return item
        return {
          ...item,
          payload: nextPayload,
        }
      })
    } catch {
      return rawItems
    }
  }, [])

  const loadData = useCallback(async () => {
    const [itemsRes, drawingsRes] = await Promise.all([
      fetch(`/api/creative-spaces/${spaceId}/items`),
      fetch(`/api/creative-spaces/${spaceId}/drawings`),
    ])

    if (itemsRes.ok) {
      const data = (await itemsRes.json()) as { items: CreativeItem[] }
      const hydratedItems = await hydrateDeckPayloadCounts(data.items ?? [])
      setItems(hydratedItems)
    }
    if (drawingsRes.ok) {
      const data = (await drawingsRes.json()) as { drawing: { strokes?: DrawingStroke[] } | null }
      setStrokes(Array.isArray(data.drawing?.strokes) ? data.drawing!.strokes! : [])
    }
  }, [hydrateDeckPayloadCounts, spaceId])

  useEffect(() => {
    void loadData()
  }, [loadData])

  const getViewportCenterOnBoard = useCallback(
    (width = DEFAULT_NOTE_SIZE.width, height = DEFAULT_NOTE_SIZE.height) => {
      const viewport = scrollRef.current
      const board = boardRef.current
      if (!viewport || !board) {
        return { x: 160, y: 120 }
      }
      const vr = viewport.getBoundingClientRect()
      const br = board.getBoundingClientRect()
      const cx = vr.left + vr.width / 2
      const cy = vr.top + vr.height / 2
      const { x: centerX, y: centerY } = clientToBoardPixel(br, cx, cy)
      return {
        x: Math.max(0, Math.min(BOARD_WIDTH - width, centerX - width / 2)),
        y: Math.max(0, Math.min(BOARD_HEIGHT - height, centerY - height / 2)),
      }
    },
    [],
  )

  const persistDrawing = useCallback(() => {
    if (drawSaveTimerRef.current) window.clearTimeout(drawSaveTimerRef.current)
    drawSaveTimerRef.current = window.setTimeout(async () => {
      await fetch(`/api/creative-spaces/${spaceId}/drawings`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ strokes, version: 1 }),
      })
    }, 2200)
  }, [spaceId, strokes])

  const eraseAllDrawings = useCallback(async () => {
    if (strokes.length === 0) return
    if (!window.confirm('Erase every drawing on this board? This cannot be undone.')) return
    if (drawSaveTimerRef.current) {
      window.clearTimeout(drawSaveTimerRef.current)
      drawSaveTimerRef.current = null
    }
    const res = await fetch(`/api/creative-spaces/${spaceId}/drawings`, {
      method: 'PATCH',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({ strokes: [], version: 1 }),
    })
    if (!res.ok) {
      window.alert('Could not erase drawings. Please try again.')
      return
    }
    drawingDraftRef.current = null
    eraserDraggingRef.current = false
    setStrokes([])
  }, [spaceId, strokes])

  const eraseStrokesNearClientPoint = useCallback((clientX: number, clientY: number) => {
    const canvas = canvasRef.current
    if (!canvas) return
    const { x: px, y: py } = clientToCanvasPixel(canvas, clientX, clientY)
    setStrokes((prev) => {
      const toRemove = new Set<string>()
      for (const s of prev) {
        if (minDistancePointToStroke(px, py, s) <= strokeEraseHitRadius(s)) {
          toRemove.add(s.id)
        }
      }
      if (toRemove.size === 0) return prev
      return prev.filter((s) => !toRemove.has(s.id))
    })
  }, [])

  useEffect(() => {
    if (!drawMode) {
      drawingDraftRef.current = null
      eraserDraggingRef.current = false
      document.body.classList.remove('creative-dragging')
      return
    }
    setDrawToolsPanelOpen(true)
  }, [drawMode])

  useEffect(() => {
    if (drawCanvasTool === 'pen') {
      eraserDraggingRef.current = false
      return
    }
    const draft = drawingDraftRef.current
    if (!draft) return
    drawingDraftRef.current = null
    setStrokes((prev) => prev.filter((s) => s.id !== draft.id))
  }, [drawCanvasTool])

  const redrawCanvas = useCallback(() => {
    const canvas = canvasRef.current
    if (!canvas) return
    const ctx = canvas.getContext('2d')
    if (!ctx) return
    ctx.clearRect(0, 0, canvas.width, canvas.height)
    for (const stroke of strokes) {
      if (!stroke.points.length) continue
      ctx.beginPath()
      ctx.lineWidth = stroke.width
      ctx.strokeStyle = stroke.color
      ctx.lineCap = 'round'
      ctx.lineJoin = 'round'
      ctx.moveTo(stroke.points[0].x, stroke.points[0].y)
      for (const point of stroke.points.slice(1)) ctx.lineTo(point.x, point.y)
      ctx.stroke()
    }
  }, [strokes])

  useEffect(() => {
    redrawCanvas()
  }, [redrawCanvas])

  const createItem = useCallback(
    async (
      type: CreativeItemType,
      payload: Record<string, unknown>,
      opts?: { width?: number; height?: number; x?: number; y?: number },
    ): Promise<CreativeItem | null> => {
      const width = opts?.width ?? DEFAULT_NOTE_SIZE.width
      const height = opts?.height ?? DEFAULT_NOTE_SIZE.height
      const center = getViewportCenterOnBoard(width, height)
      const res = await fetch(`/api/creative-spaces/${spaceId}/items`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          type,
          payload,
          width,
          height,
          x: opts?.x ?? center.x,
          y: opts?.y ?? center.y,
        }),
      })
      if (!res.ok) return null
      setDrawMode(false)
      const data = (await res.json()) as { item: CreativeItem }
      setItems((prev) => [...prev, data.item])
      return data.item
    },
    [getViewportCenterOnBoard, spaceId, setDrawMode],
  )

  const scheduleItemSave = useCallback(
    (itemId: string, patch: Partial<CreativeItem>) => {
      const prev = saveTimersRef.current.get(itemId)
      if (prev) window.clearTimeout(prev)
      const timer = window.setTimeout(async () => {
        await fetch(`/api/creative-spaces/${spaceId}/items/${itemId}`, {
          method: 'PATCH',
          headers: { 'Content-Type': 'application/json' },
          body: JSON.stringify(patch),
        })
      }, 700)
      saveTimersRef.current.set(itemId, timer)
    },
    [spaceId],
  )

  const updateItem = useCallback(
    (itemId: string, patch: Partial<CreativeItem>) => {
      setItems((prev) => prev.map((item) => (item.id === itemId ? { ...item, ...patch } : item)))
      scheduleItemSave(itemId, patch)
    },
    [scheduleItemSave],
  )

  const bringItemToFront = useCallback(
    (itemId: string) => {
      const maxZ = items.reduce((max, item) => (item.zIndex > max ? item.zIndex : max), 0)
      const target = items.find((item) => item.id === itemId)
      if (!target) return
      if (target.zIndex >= maxZ) return
      updateItem(itemId, { zIndex: maxZ + 1 })
    },
    [items, updateItem],
  )

  const toVideoEmbedUrl = useCallback((rawUrl: string | null | undefined): string | null => {
    if (!rawUrl) return null
    const url = rawUrl.trim()
    if (!url) return null
    try {
      const parsed = new URL(url)
      const host = parsed.hostname.replace(/^www\./, '')
      if (host === 'youtube.com' || host === 'm.youtube.com') {
        if (parsed.pathname === '/watch') {
          const id = parsed.searchParams.get('v')
          return id ? `https://www.youtube.com/embed/${id}` : null
        }
        if (parsed.pathname.startsWith('/shorts/')) {
          const id = parsed.pathname.split('/')[2]
          return id ? `https://www.youtube.com/embed/${id}` : null
        }
        if (parsed.pathname.startsWith('/embed/')) return url
      }
      if (host === 'youtu.be') {
        const id = parsed.pathname.replace('/', '')
        return id ? `https://www.youtube.com/embed/${id}` : null
      }
      if (host === 'vimeo.com') {
        const id = parsed.pathname.replace('/', '')
        return id ? `https://player.vimeo.com/video/${id}` : null
      }
      if (parsed.pathname.includes('/embed/')) return url
      return null
    } catch {
      return null
    }
  }, [])

  const onPointerDownItem = useCallback(
    (item: CreativeItem, e: React.PointerEvent<HTMLDivElement>) => {
      if (drawMode) return
      const target = e.target as HTMLElement
      if (
        target.closest('input') ||
        target.closest('textarea') ||
        (target.closest('button') &&
          !target.closest('[data-allow-drag]') &&
          !target.closest('[data-block-drag-handle]')) ||
        target.closest('a') ||
        target.closest('[data-no-drag]') ||
        target.closest('[data-resize-handle]')
      ) {
        return
      }
      const pLoad = item.payload ?? {}
      if (
        item.type === 'VIDEO' &&
        toVideoEmbedUrl(String((pLoad as Record<string, unknown>).url ?? '')) &&
        !target.closest('[data-block-drag-handle]')
      ) {
        return
      }
      // `preventDefault` on pointerdown suppresses the synthetic `click` (breaks flashcard flip).
      if (item.type !== 'FLASHCARD') e.preventDefault()
      bringItemToFront(item.id)
      document.body.classList.add('creative-dragging')
      const board = boardRef.current
      if (!board) return
      const rect = board.getBoundingClientRect()
      const p = clientToBoardPixel(rect, e.clientX, e.clientY)
      const pointerId = e.pointerId
      dragRef.current = {
        itemId: item.id,
        itemType: item.type,
        dx: p.x - item.x,
        dy: p.y - item.y,
        startClientX: e.clientX,
        startClientY: e.clientY,
        moved: false,
        pointerId,
      }
      /*
       * Flashcards: defer `setPointerCapture` until the user actually drags. Immediate capture retargets
       * pointer events to the board and the synthetic `click` never reaches the card (flip breaks).
       */
      if (item.type !== 'FLASHCARD') {
        try {
          board.setPointerCapture(pointerId)
        } catch {
          // ignore (e.g. pointer not eligible)
        }
      }
    },
    [drawMode, toVideoEmbedUrl],
  )

  const onBoardPointerDownCapture = useCallback((e: React.PointerEvent<HTMLDivElement>) => {
    const t = e.target as HTMLElement | null
    const board = boardRef.current
    if (!t || !board || !board.contains(t)) return
    if (t.closest('textarea')) return
    const ae = document.activeElement
    if (ae instanceof HTMLTextAreaElement && board.contains(ae)) ae.blur()
  }, [])

  const onPointerMoveBoard = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      const board = boardRef.current
      if (!board) return
      const rect = board.getBoundingClientRect()

      if (resizeRef.current) {
        const active = resizeRef.current
        const dx = e.clientX - active.startX
        const dy = e.clientY - active.startY
        const minWidth = active.type === 'DECK' ? 260 : 180
        const minHeight = active.type === 'DECK' ? 160 : 120
        let width = Math.max(minWidth, active.startWidth + dx)
        let height = Math.max(minHeight, active.startHeight + dy)

        // Hold Ctrl while resizing image/video blocks to keep aspect ratio.
        if (e.ctrlKey && (active.type === 'IMAGE' || active.type === 'VIDEO')) {
          const byWidth = Math.max(120, width / active.aspectRatio)
          const byHeight = Math.max(180, height * active.aspectRatio)
          const widthDelta = Math.abs(byHeight - width)
          const heightDelta = Math.abs(byWidth - height)
          if (widthDelta < heightDelta) {
            width = byHeight
          } else {
            height = byWidth
          }
        }

        updateItem(active.itemId, { width, height })
        return
      }

      const drag = dragRef.current
      if (!drag) return
      if (e.pointerId !== drag.pointerId) return
      if (!drag.moved) {
        const movedDistance = Math.hypot(e.clientX - drag.startClientX, e.clientY - drag.startClientY)
        if (movedDistance > 5) {
          drag.moved = true
          suppressNextFlashcardClickRef.current = true
          if (drag.itemType === 'FLASHCARD') {
            try {
              board.setPointerCapture(drag.pointerId)
            } catch {
              // ignore
            }
          }
        }
      }
      const p = clientToBoardPixel(rect, e.clientX, e.clientY)
      const x = Math.max(0, Math.min(BOARD_WIDTH - 140, p.x - drag.dx))
      const y = Math.max(0, Math.min(BOARD_HEIGHT - 100, p.y - drag.dy))
      itemDragPendingRef.current = { itemId: drag.itemId, x, y }
      if (itemDragRafRef.current == null) {
        itemDragRafRef.current = window.requestAnimationFrame(() => {
          itemDragRafRef.current = null
          const pending = itemDragPendingRef.current
          const active = dragRef.current
          if (!pending || !active || pending.itemId !== active.itemId) return
          updateItem(pending.itemId, { x: pending.x, y: pending.y })
        })
      }
    },
    [updateItem],
  )

  const flushItemDragPending = useCallback(() => {
    if (itemDragRafRef.current != null) {
      window.cancelAnimationFrame(itemDragRafRef.current)
      itemDragRafRef.current = null
    }
    const pending = itemDragPendingRef.current
    const drag = dragRef.current
    itemDragPendingRef.current = null
    if (pending && drag && pending.itemId === drag.itemId) {
      updateItem(pending.itemId, { x: pending.x, y: pending.y })
    }
  }, [updateItem])

  const endItemPointerCapture = useCallback(() => {
    const drag = dragRef.current
    const board = boardRef.current
    if (board && drag != null) {
      try {
        if (board.hasPointerCapture(drag.pointerId)) {
          board.releasePointerCapture(drag.pointerId)
        }
      } catch {
        // ignore
      }
    }
  }, [])

  const onPointerUpBoard = useCallback(() => {
    flushItemDragPending()
    endItemPointerCapture()
    dragRef.current = null
    resizeRef.current = null
    document.body.classList.remove('creative-dragging')
  }, [endItemPointerCapture, flushItemDragPending])

  const onLostPointerCaptureBoard = useCallback(() => {
    flushItemDragPending()
    dragRef.current = null
    resizeRef.current = null
    document.body.classList.remove('creative-dragging')
  }, [flushItemDragPending])

  /** Do not end item drag on leave — moving over a video iframe used to fire leave and drop pointer tracking. */
  const onPointerLeaveBoardResizeOnly = useCallback(() => {
    resizeRef.current = null
  }, [])

  const onBoardPanPointerDown = useCallback(
    (e: React.PointerEvent<HTMLDivElement>) => {
      if (drawMode) return
      const sc = scrollRef.current
      if (!sc) return
      e.preventDefault()
      e.stopPropagation()
      const pointerId = e.pointerId
      const startClientX = e.clientX
      const startClientY = e.clientY
      const startScrollLeft = sc.scrollLeft
      const startScrollTop = sc.scrollTop
      boardPanPointerRef.current = {
        pointerId,
        startClientX,
        startClientY,
        startScrollLeft,
        startScrollTop,
      }

      const onMove = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        ev.preventDefault()
        const el = scrollRef.current
        if (!el) return
        const nextLeft = startScrollLeft - (ev.clientX - startClientX)
        const nextTop = startScrollTop - (ev.clientY - startClientY)
        const maxL = Math.max(0, el.scrollWidth - el.clientWidth)
        const maxT = Math.max(0, el.scrollHeight - el.clientHeight)
        el.scrollLeft = Math.max(0, Math.min(maxL, nextLeft))
        el.scrollTop = Math.max(0, Math.min(maxT, nextTop))
      }
      const onUp = (ev: PointerEvent) => {
        if (ev.pointerId !== pointerId) return
        window.removeEventListener('pointermove', onMove, BOARD_PAN_WINDOW_MOVE_OPTS)
        window.removeEventListener('pointerup', onUp, BOARD_PAN_WINDOW_UP_OPTS)
        window.removeEventListener('pointercancel', onUp, BOARD_PAN_WINDOW_UP_OPTS)
        boardPanDocCleanupRef.current = null
        boardPanPointerRef.current = null
        setBoardPanning(false)
      }
      window.addEventListener('pointermove', onMove, BOARD_PAN_WINDOW_MOVE_OPTS)
      window.addEventListener('pointerup', onUp, BOARD_PAN_WINDOW_UP_OPTS)
      window.addEventListener('pointercancel', onUp, BOARD_PAN_WINDOW_UP_OPTS)
      boardPanDocCleanupRef.current = () => {
        window.removeEventListener('pointermove', onMove, BOARD_PAN_WINDOW_MOVE_OPTS)
        window.removeEventListener('pointerup', onUp, BOARD_PAN_WINDOW_UP_OPTS)
        window.removeEventListener('pointercancel', onUp, BOARD_PAN_WINDOW_UP_OPTS)
      }
      setBoardPanning(true)
    },
    [drawMode],
  )

  const toggleFlashcardFace = useCallback((itemId: string) => {
    if (suppressNextFlashcardClickRef.current) {
      suppressNextFlashcardClickRef.current = false
      return
    }
    setFlippedFlashcardById((prev) => ({ ...prev, [itemId]: !prev[itemId] }))
  }, [])

  const addSavedDrawColor = useCallback((raw: string) => {
    const c = normalizeHexColor(raw)
    if (!c) return
    setCustomDrawColors((prev) => {
      if (prev.includes(c)) return prev
      if (prev.length >= MAX_CUSTOM_DRAW_COLORS) {
        window.alert('Saved color limit reached. Remove one with × to add another.')
        return prev
      }
      return [...prev, c]
    })
  }, [])

  const removeSavedDrawColor = useCallback((index: number) => {
    setCustomDrawColors((prev) => prev.filter((_, i) => i !== index))
  }, [])

  const onAddSavedColorPickerFocus = useCallback(() => {
    addSavedColorPickerSessionRef.current = true
    addSavedColorPickerDirtyRef.current = false
  }, [])

  const markAddSavedColorPickerDirty = useCallback(() => {
    addSavedColorPickerDirtyRef.current = true
  }, [])

  const finalizeAddSavedColorPicker = useCallback((blurRelatedTarget: Node | null | undefined) => {
    if (!addSavedColorPickerSessionRef.current) return
    addSavedColorPickerSessionRef.current = false
    const input = addSavedColorInputRef.current
    if (addSavedColorPickerDirtyRef.current && input) {
      addSavedColorPickerDirtyRef.current = false
      const v = input.value
      addSavedDrawColor(v)
      const n = normalizeHexColor(v)
      if (n) setDrawPenColor(n)
    } else {
      addSavedColorPickerDirtyRef.current = false
    }
    const ui = creativeDrawUiRef.current
    const rt = blurRelatedTarget
    if (rt == null || !ui?.contains(rt)) {
      suppressNextCanvasPointerAfterColorPickerRef.current = true
    }
  }, [addSavedDrawColor])

  useEffect(() => {
    const onDocPointerDownCapture = (e: PointerEvent) => {
      if (!addSavedColorPickerSessionRef.current) return
      const target = e.target as Node | null
      if (!target || creativeDrawUiRef.current?.contains(target)) return
      finalizeAddSavedColorPicker(undefined)
      addSavedColorInputRef.current?.blur()
      e.preventDefault()
      e.stopPropagation()
    }
    document.addEventListener('pointerdown', onDocPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onDocPointerDownCapture, true)
  }, [finalizeAddSavedColorPicker])

  useEffect(() => {
    if (!settingsOpen) return
    const onPointerDownCapture = (e: PointerEvent) => {
      const target = e.target as Node | null
      if (!target) return
      if (settingsPanelRef.current?.contains(target)) return
      if (settingsTriggerRef.current?.contains(target)) return
      setSettingsOpen(false)
    }
    document.addEventListener('pointerdown', onPointerDownCapture, true)
    return () => document.removeEventListener('pointerdown', onPointerDownCapture, true)
  }, [settingsOpen])

  useEffect(() => {
    const clearDragState = () => {
      const dragSnap = dragRef.current
      const board = boardRef.current
      if (board && dragSnap) {
        try {
          if (board.hasPointerCapture(dragSnap.pointerId)) {
            board.releasePointerCapture(dragSnap.pointerId)
          }
        } catch {
          // ignore
        }
      }
      if (itemDragRafRef.current != null) {
        window.cancelAnimationFrame(itemDragRafRef.current)
        itemDragRafRef.current = null
      }
      const pending = itemDragPendingRef.current
      itemDragPendingRef.current = null
      if (pending && dragSnap && pending.itemId === dragSnap.itemId) {
        updateItem(pending.itemId, { x: pending.x, y: pending.y })
      }
      dragRef.current = null
      resizeRef.current = null
      drawingDraftRef.current = null
      eraserDraggingRef.current = false
      document.body.classList.remove('creative-dragging')
      if (boardPanPointerRef.current) {
        boardPanDocCleanupRef.current?.()
        boardPanDocCleanupRef.current = null
        boardPanPointerRef.current = null
        setBoardPanning(false)
      }
    }
    window.addEventListener('pointerup', clearDragState)
    window.addEventListener('pointercancel', clearDragState)
    window.addEventListener('blur', clearDragState)
    return () => {
      window.removeEventListener('pointerup', clearDragState)
      window.removeEventListener('pointercancel', clearDragState)
      window.removeEventListener('blur', clearDragState)
    }
  }, [updateItem])

  const startResize = useCallback(
    (item: CreativeItem, e: React.PointerEvent<HTMLButtonElement>) => {
      e.preventDefault()
      e.stopPropagation()
      bringItemToFront(item.id)
      document.body.classList.add('creative-dragging')
      resizeRef.current = {
        itemId: item.id,
        type: item.type,
        startX: e.clientX,
        startY: e.clientY,
        startWidth: item.width,
        startHeight: item.height,
        aspectRatio: item.height > 0 ? item.width / item.height : 1,
      }
    },
    [bringItemToFront],
  )

  const onPointerDownCanvas = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawMode) return
      if (suppressNextCanvasPointerAfterColorPickerRef.current) {
        suppressNextCanvasPointerAfterColorPickerRef.current = false
        e.preventDefault()
        return
      }
      e.preventDefault()
      setDrawToolsPanelOpen(false)
      document.body.classList.add('creative-dragging')
      const canvas = canvasRef.current
      if (!canvas) return
      const p0 = clientToCanvasPixel(canvas, e.clientX, e.clientY)
      if (drawCanvasTool === 'eraser') {
        eraserDraggingRef.current = true
        try {
          canvas.setPointerCapture(e.pointerId)
        } catch {
          // ignore if capture unsupported
        }
        eraseStrokesNearClientPoint(e.clientX, e.clientY)
        return
      }
      drawingDraftRef.current = {
        id: crypto.randomUUID(),
        points: [{ x: p0.x, y: p0.y }],
        color: drawPenColor,
        width: drawPenWidth,
      }
      try {
        canvas.setPointerCapture(e.pointerId)
      } catch {
        // ignore
      }
    },
    [drawCanvasTool, drawMode, drawPenColor, drawPenWidth, eraseStrokesNearClientPoint],
  )

  const onPointerMoveCanvas = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawMode) return
      if (drawCanvasTool === 'eraser') {
        if (eraserDraggingRef.current && (e.buttons & 1)) {
          eraseStrokesNearClientPoint(e.clientX, e.clientY)
        }
        return
      }
      const draft = drawingDraftRef.current
      if (!draft) return
      const canvas = canvasRef.current
      if (!canvas) return
      const p = clientToCanvasPixel(canvas, e.clientX, e.clientY)
      draft.points.push({ x: p.x, y: p.y })
      setStrokes((prev) => {
        const withoutDraft = prev.filter((stroke) => stroke.id !== draft.id)
        return [...withoutDraft, draft]
      })
    },
    [drawCanvasTool, drawMode, eraseStrokesNearClientPoint],
  )

  const onPointerUpCanvas = useCallback(
    (e: React.PointerEvent<HTMLCanvasElement>) => {
      if (!drawMode) return
      const hadPenDraft = Boolean(drawingDraftRef.current)
      const hadEraserDrag = eraserDraggingRef.current
      drawingDraftRef.current = null
      eraserDraggingRef.current = false
      document.body.classList.remove('creative-dragging')
      const canvas = canvasRef.current
      if (canvas) {
        try {
          canvas.releasePointerCapture(e.pointerId)
        } catch {
          // ignore
        }
      }
      if (hadPenDraft || hadEraserDrag) {
        persistDrawing()
      }
    },
    [drawMode, persistDrawing],
  )

  const removeItem = useCallback(
    async (itemId: string) => {
      await fetch(`/api/creative-spaces/${spaceId}/items/${itemId}`, { method: 'DELETE' })
      setItems((prev) => prev.filter((item) => item.id !== itemId))
    },
    [spaceId],
  )

  const openMediaPicker = useCallback(async (itemId: string) => {
    setMediaPickerItemId(itemId)
    setMediaLoading(true)
    try {
      const res = await fetch('/api/creative-media/list')
      if (!res.ok) return
      const data = (await res.json()) as { media: MediaDoc[] }
      setMediaDocs(data.media ?? [])
    } finally {
      setMediaLoading(false)
    }
  }, [])

  const attachMediaToItem = useCallback(
    (media: MediaDoc) => {
      if (!mediaPickerItemId) return
      updateItem(mediaPickerItemId, {
        payload: {
          mediaId: media.id,
          filename: media.filename,
          url: `/api/media/serve/${encodeURIComponent(media.filename)}`,
          alt: media.alt ?? media.filename,
        },
      })
      setMediaPickerItemId(null)
      setMediaQuery('')
    },
    [mediaPickerItemId, updateItem],
  )

  const uploadMedia = useCallback(async (file: File) => {
    setMediaUploading(true)
    try {
      const formData = new FormData()
      formData.append('file', file)
      const res = await fetch('/api/creative-media/upload', {
        method: 'POST',
        body: formData,
      })
      if (!res.ok) return
      const data = (await res.json()) as { id: string; filename: string }
      const media: MediaDoc = { id: data.id, filename: data.filename, alt: data.filename }
      setMediaDocs((prev) => [media, ...prev])
      attachMediaToItem(media)
    } finally {
      setMediaUploading(false)
    }
  }, [attachMediaToItem])

  const filteredMedia = useMemo(() => {
    const q = mediaQuery.trim().toLowerCase()
    if (!q) return mediaDocs
    return mediaDocs.filter((m) => (m.filename || '').toLowerCase().includes(q))
  }, [mediaDocs, mediaQuery])

  useEffect(() => {
    if (!coursePickerItemId) return
    const timeoutId = window.setTimeout(async () => {
      setCourseLoading(true)
      try {
        const res = await fetch(`/api/creative-courses/search?q=${encodeURIComponent(courseQuery.trim())}`)
        if (!res.ok) return
        const data = (await res.json()) as { courses: CourseSearchResult[] }
        setCourseResults(data.courses ?? [])
      } finally {
        setCourseLoading(false)
      }
    }, 220)
    return () => window.clearTimeout(timeoutId)
  }, [coursePickerItemId, courseQuery])

  const applyCourseToItem = useCallback(
    (itemId: string, course: CourseSearchResult) => {
      updateItem(itemId, {
        payload: {
          courseId: course.id,
          courseSlug: course.slug,
          title: course.title,
          subject: course.subject,
          description: course.description,
          coverImage: course.coverImage,
          progressPercentage: course.progressPercentage,
          completedLessons: course.completedLessons,
          totalLessons: course.totalLessons,
        },
        width: 420,
        height: 310,
      })
      setCoursePickerItemId(null)
      setCourseQuery('')
      setCourseResults([])
    },
    [updateItem],
  )

  const runToolAction = useCallback(async (tool: SidebarTool) => {
    // Do not close here when toggling FLASHCARD — that would fight the toggle and trap the menu open.
    if (tool !== 'FLASHCARD') setFlashcardMenuOpen(false)

    const wasDrawing = drawMode
    if (wasDrawing && tool !== 'DRAW') {
      setDrawMode(false)
    }

    if (tool === 'HAND') {
      setDrawMode(false)
      setSettingsOpen(false)
      return
    }

    switch (tool) {
      case 'TEXT':
        await createItem('TEXT', { text: '' }, DEFAULT_NOTE_SIZE)
        break
      case 'COURSE':
      {
        const item = await createItem(
          'COURSE',
          {
            courseId: '',
            courseSlug: '',
            title: '',
            subject: '',
            description: '',
            progressPercentage: 0,
            completedLessons: 0,
            totalLessons: 0,
            coverImage: null,
          },
          { width: 420, height: 310 },
        )
        if (item?.id) {
          setCoursePickerItemId(item.id)
          setCourseQuery('')
          setCourseResults([])
        }
        break
      }
      case 'IMAGE':
        await createItem('IMAGE', { mediaId: null, url: null, filename: null }, DEFAULT_IMAGE_SIZE)
        break
      case 'VIDEO':
        await createItem('VIDEO', { url: '' }, { width: 320, height: 190 })
        break
      case 'FLASHCARD': {
        setFlashcardMenuOpen((v) => !v)
        break
      }
      case 'DRAW':
        if (!drawMode) {
          setSettingsOpen(false)
          setDrawMode(true)
          break
        }
        if (!drawToolsPanelOpen) {
          setSettingsOpen(false)
          setDrawToolsPanelOpen(true)
          break
        }
        // Tools already open — stay in draw mode (use Hand to pan / exit draw).
        break
      default:
        break
    }
  }, [createItem, spaceId, drawMode, drawToolsPanelOpen])

  const fetchDecks = useCallback(async () => {
    setDeckLoading(true)
    try {
      const res = await fetch('/api/creative-decks/select-options')
      if (!res.ok) return
      const data = (await res.json()) as {
        creativeDecks: CreativeDeckResult[]
        systemDecks: SystemDeckResult[]
      }
      setCreativeDeckList(data.creativeDecks ?? [])
      setSystemDeckList(data.systemDecks ?? [])
    } finally {
      setDeckLoading(false)
    }
  }, [])

  const createDeckCard = useCallback(
    async (deck: CreativeDeckResult) => {
      await createItem(
        'DECK',
        {
          deckId: deck.id,
          deckSlug: deck.slug,
          name: deck.name,
          description: deck.description ?? '',
          flashcardCount: Number(deck.cardCount ?? 0),
          dueCount: 0,
          newCount: 0,
          source: 'creative',
        },
        { width: 300, height: 170 },
      )
    },
    [createItem],
  )

  const createSystemDeckCard = useCallback(
    async (deck: SystemDeckResult) => {
      await createItem(
        'DECK',
        {
          deckId: deck.id,
          deckSlug: deck.slug,
          name: deck.name,
          description: deck.description ?? '',
          flashcardCount: Number(deck.cardCount ?? 0),
          dueCount: 0,
          newCount: 0,
          source: 'system',
          kind: deck.kind,
          courseTitle: deck.course?.title ?? null,
          courseSlug: deck.course?.slug ?? null,
          childDeckCount: Number(deck.childDeckCount ?? 0),
        },
        { width: 300, height: 170 },
      )
    },
    [createItem],
  )

  const submitNewDeck = useCallback(async () => {
    const trimmedName = deckName.trim()
    if (!trimmedName) return
    setDeckSubmitting(true)
    try {
      const res = await fetch('/api/creative-decks/create-standalone', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          name: trimmedName,
          description: deckDescription.trim() || null,
        }),
      })
      if (!res.ok) return
      const data = (await res.json()) as {
        deck: {
          id: string
          slug: string
          name: string
          description: string | null
          cardCount: number
        }
      }
      const normalized: CreativeDeckResult = {
        id: data.deck.id,
        slug: data.deck.slug,
        name: data.deck.name,
        description: data.deck.description ?? null,
        cardCount: Number(data.deck.cardCount ?? 0),
      }
      await createDeckCard(normalized)
      setDeckCreateOpen(false)
      setFlashcardMenuOpen(false)
      setDeckName('')
      setDeckDescription('')
    } finally {
      setDeckSubmitting(false)
    }
  }, [createDeckCard, deckDescription, deckName])

  const filteredCreativeDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase()
    if (!q) return creativeDeckList
    return creativeDeckList.filter((deck) => deck.name.toLowerCase().includes(q))
  }, [creativeDeckList, deckQuery])

  const filteredSystemDecks = useMemo(() => {
    const q = deckQuery.trim().toLowerCase()
    if (!q) return systemDeckList
    return systemDeckList.filter((deck) => {
      const courseText = deck.course?.title?.toLowerCase() ?? ''
      return deck.name.toLowerCase().includes(q) || courseText.includes(q)
    })
  }, [systemDeckList, deckQuery])

  const submitDeckFlashcard = useCallback(async () => {
    if (!deckFlashcardModal) return
    const frontText = deckFlashcardFront.trim()
    const backText = deckFlashcardBack.trim()
    if (!frontText || !backText) return
    setDeckFlashcardSubmitting(true)
    try {
      const res = await fetch(`/api/creative-decks/${deckFlashcardModal.deckId}/flashcards`, {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ frontText, backText }),
      })
      if (!res.ok) {
        let message = 'Failed to create flashcard'
        try {
          const data = (await res.json()) as { error?: string }
          if (data.error) message = data.error
        } catch {
          // ignore
        }
        window.alert(message)
        return
      }

      const deckItem = items.find((item) => item.id === deckFlashcardModal.itemId)
      const currentPayload = (deckItem?.payload ?? {}) as Record<string, unknown>
      const nextCount = Number(currentPayload.flashcardCount ?? 0) + 1
      updateItem(deckFlashcardModal.itemId, {
        payload: {
          ...currentPayload,
          flashcardCount: nextCount,
        },
      })

      setDeckFlashcardModal(null)
      setDeckFlashcardFront('')
      setDeckFlashcardBack('')
      setDeckActionsItemId(null)
      setDeckActionsView('menu')
    } finally {
      setDeckFlashcardSubmitting(false)
    }
  }, [deckFlashcardBack, deckFlashcardFront, deckFlashcardModal, items, updateItem])

  const openDeckCardsPreview = useCallback(async (itemId: string, deckId: string) => {
    setDeckActionsItemId(itemId)
    setDeckActionsView('cards')
    setDeckActionSourceDeckId(deckId)
    setDeckActionCards([])
    setDeckActionCardsLoading(true)
    try {
      const res = await fetch(`/api/creative-decks/${deckId}/flashcards`)
      if (!res.ok) return
      const data = (await res.json()) as {
        flashcards: Array<{ id: string; frontText: string; backText: string }>
      }
      setDeckActionCards(data.flashcards ?? [])
    } finally {
      setDeckActionCardsLoading(false)
    }
  }, [])

  const parseDeckFlashcardDrag = useCallback((event: React.DragEvent) => {
    if (!event.dataTransfer.types.includes(FLASHCARD_DRAG_MIME)) return null
    try {
      const raw = event.dataTransfer.getData(FLASHCARD_DRAG_MIME)
      if (!raw) return null
      return JSON.parse(raw) as DeckFlashcardDragData
    } catch {
      return null
    }
  }, [])

  const onDragOverBoard = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(FLASHCARD_DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'copy'
  }, [])

  const onDropFlashcardFromDeck = useCallback(
    async (e: React.DragEvent<HTMLDivElement>) => {
      if (!e.dataTransfer.types.includes(FLASHCARD_DRAG_MIME)) return
      e.preventDefault()

      const payload = parseDeckFlashcardDrag(e)
      if (!payload) return
      if (!payload.frontText?.trim() || !payload.backText?.trim()) return

      const board = boardRef.current
      if (!board) return
      const rect = board.getBoundingClientRect()
      const width = 260
      const height = 160
      const p = clientToBoardPixel(rect, e.clientX, e.clientY)
      const x = Math.max(0, Math.min(BOARD_WIDTH - width, p.x - width / 2))
      const y = Math.max(0, Math.min(BOARD_HEIGHT - height, p.y - height / 2))

      await createItem(
        'FLASHCARD',
        {
          front: payload.frontText,
          back: payload.backText,
        },
        { width, height, x, y },
      )
    },
    [createItem, parseDeckFlashcardDrag],
  )

  const onDragOverDeckDropZone = useCallback((e: React.DragEvent<HTMLDivElement>) => {
    if (!e.dataTransfer.types.includes(FLASHCARD_DRAG_MIME)) return
    e.preventDefault()
    e.dataTransfer.dropEffect = 'move'
  }, [])

  const onDropToDeck = useCallback(
    async (e: React.DragEvent<HTMLDivElement>, targetDeckId: string) => {
      const payload = parseDeckFlashcardDrag(e)
      if (!payload) return
      e.preventDefault()
      e.stopPropagation()

      if (!payload.sourceDeckId || !targetDeckId || payload.sourceDeckId === targetDeckId) return
      const res = await fetch(`/api/creative-decks/${payload.sourceDeckId}/flashcards`, {
        method: 'PATCH',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          flashcardId: payload.flashcardId,
          targetDeckId,
        }),
      })
      if (!res.ok) {
        let message = 'Failed to move flashcard'
        try {
          const data = (await res.json()) as { error?: string }
          if (data.error) message = data.error
        } catch {
          // ignore
        }
        window.alert(message)
        return
      }

      setDeckActionCards((prev) => prev.filter((card) => card.id !== payload.flashcardId))
      setItems((prev) =>
        prev.map((item) => {
          if (item.type !== 'DECK') return item
          const deckPayload = (item.payload ?? {}) as Record<string, unknown>
          const deckId = String(deckPayload.deckId ?? '')
          if (!deckId) return item
          if (deckId !== payload.sourceDeckId && deckId !== targetDeckId) return item
          const currentCount = Number(deckPayload.flashcardCount ?? 0)
          const nextCount =
            deckId === payload.sourceDeckId
              ? Math.max(0, currentCount - 1)
              : currentCount + 1
          return {
            ...item,
            payload: {
              ...deckPayload,
              flashcardCount: nextCount,
            },
          }
        }),
      )
    },
    [parseDeckFlashcardDrag],
  )

  return (
    <div
      ref={creativeWheelRootRef}
      className="relative flex h-full min-h-0 flex-col overflow-hidden bg-background"
    >
      <div
        ref={creativeDrawUiRef}
        className="fixed left-3 top-3 z-50 flex flex-col items-start gap-2 sm:left-4 sm:top-4"
      >
        <Button
          asChild
          variant="outline"
          size="sm"
          className="h-8 gap-1.5 px-2.5 text-xs font-medium shadow-md ring-1 ring-border/60 bg-background/95 backdrop-blur-sm"
        >
          <Link href="/creative-space" title="Creative Spaces — your boards list">
            <ArrowLeft className="h-3.5 w-3.5 shrink-0" aria-hidden />
            Back to menu
          </Link>
        </Button>

        <div className="flex items-start gap-2">
        <Card className="py-2">
          <CardContent className="flex flex-col gap-2 px-2">
            {toolMeta.map((tool, toolIndex) => {
              const Icon = tool.icon
              const selected =
                tool.id === 'HAND'
                  ? !drawMode
                  : tool.id === 'DRAW'
                    ? drawMode
                    : tool.id === 'FLASHCARD'
                      ? flashcardMenuOpen
                      : false
              return (
                <Fragment key={tool.id}>
                  {toolIndex === 2 ? (
                    <div
                      aria-hidden
                      className="mt-1 border-t border-border/70 pt-2"
                    />
                  ) : null}
                  <div
                    className="relative"
                    ref={tool.id === 'FLASHCARD' ? flashcardMenuRef : undefined}
                  >
                  <Button
                    variant={selected ? 'default' : 'outline'}
                    size="icon"
                    title={
                      tool.id === 'HAND'
                        ? drawMode
                          ? 'Pan board (exit draw mode)'
                          : 'Pan board — drag to move · wheel: vertical · Shift+wheel: horizontal · hold Z + wheel: zoom'
                        : tool.id === 'DRAW'
                          ? !drawMode
                            ? 'Draw on board'
                            : !drawToolsPanelOpen
                              ? 'Show drawing tools'
                              : 'Drawing — use Hand to pan or exit draw'
                          : tool.label
                    }
                    onClick={async () => {
                      if (tool.id !== 'FLASHCARD') setFlashcardMenuOpen(false)
                      await runToolAction(tool.id)
                    }}
                  >
                    <Icon className="h-4 w-4" />
                  </Button>
                  {tool.id === 'FLASHCARD' && flashcardMenuOpen ? (
                    <div className="pointer-events-none absolute left-full top-1/2 ml-3 -translate-y-1/2">
                      <button
                        type="button"
                        title="Create new deck"
                        className="pointer-events-auto inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                        onClick={() => {
                          setDeckCreateOpen(true)
                          setFlashcardMenuOpen(false)
                        }}
                      >
                        <CirclePlus className="h-4 w-4" />
                      </button>
                      <button
                        type="button"
                        title="Select existing deck"
                        className="pointer-events-auto mt-2 inline-flex h-9 w-9 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                        onClick={() => {
                          setDeckSelectOpen(true)
                          setFlashcardMenuOpen(false)
                          setDeckQuery('')
                          void fetchDecks()
                        }}
                      >
                        <Search className="h-4 w-4" />
                      </button>
                    </div>
                  ) : null}
                </div>
                </Fragment>
              )
            })}
            <div className="mt-1 flex flex-col gap-2 border-t border-border/70 pt-2">
              <div ref={settingsTriggerRef}>
                <Button
                  variant={settingsOpen ? 'default' : 'outline'}
                  size="icon"
                  title="Whiteboard settings"
                  onClick={() =>
                    setSettingsOpen((v) => {
                      const next = !v
                      if (next) setDrawToolsPanelOpen(false)
                      return next
                    })
                  }
                >
                  <Settings2 className="h-4 w-4" />
                </Button>
              </div>
            </div>
          </CardContent>
        </Card>

        {settingsOpen ? (
          <div ref={settingsPanelRef} className="shrink-0">
            <Card className="w-[22rem] max-w-[calc(100vw-6rem)] py-2 sm:w-80">
            <CardContent className="space-y-3 px-3">
              <p className="text-sm font-semibold">Whiteboard settings</p>
              <div className="flex items-center justify-between gap-3 rounded-md border border-border/70 p-2">
                <div>
                  <p className="text-sm font-medium">Note spellcheck</p>
                  <p className="text-xs text-muted-foreground">Toggle red spelling highlights in notes.</p>
                </div>
                <Button
                  variant={spellCheckEnabled ? 'default' : 'outline'}
                  size="sm"
                  onClick={() => setSpellCheckEnabled((v) => !v)}
                >
                  {spellCheckEnabled ? 'On' : 'Off'}
                </Button>
              </div>
              <div className="space-y-2 rounded-md border border-border/70 p-2">
                <div>
                  <p className="text-sm font-medium">Board color</p>
                  <p className="text-xs text-muted-foreground">
                    Light swatches use a light page chrome here; dark swatches use a dark chrome. Your global app theme
                    is not changed.
                  </p>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Light</p>
                  <div className="flex flex-wrap gap-2">
                    {CREATIVE_SPACE_LIGHT_BOARD_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        title={p.label}
                        aria-label={p.label}
                        aria-pressed={boardBackgroundColor.toLowerCase() === p.hex}
                        onClick={() => {
                          setCustomBoardChromeMode('auto')
                          setBoardBackgroundColor(p.hex)
                        }}
                        className={cn(
                          'h-8 w-8 shrink-0 rounded-md border-2 shadow-sm transition-transform hover:scale-105',
                          boardBackgroundColor.toLowerCase() === p.hex
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border',
                        )}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>
                <div className="space-y-1.5">
                  <p className="text-[11px] font-medium uppercase tracking-wide text-muted-foreground">Dark</p>
                  <div className="flex flex-wrap gap-2">
                    {CREATIVE_SPACE_DARK_BOARD_PRESETS.map((p) => (
                      <button
                        key={p.id}
                        type="button"
                        title={p.label}
                        aria-label={p.label}
                        aria-pressed={boardBackgroundColor.toLowerCase() === p.hex}
                        onClick={() => {
                          setCustomBoardChromeMode('auto')
                          setBoardBackgroundColor(p.hex)
                        }}
                        className={cn(
                          'h-8 w-8 shrink-0 rounded-md border-2 shadow-sm transition-transform hover:scale-105',
                          boardBackgroundColor.toLowerCase() === p.hex
                            ? 'border-primary ring-2 ring-primary/30'
                            : 'border-border',
                        )}
                        style={{ backgroundColor: p.hex }}
                      />
                    ))}
                  </div>
                </div>
                <div className="flex flex-col gap-2 border-t border-border/40 pt-2">
                  <div className="flex items-center gap-2">
                    <span className="shrink-0 text-xs font-medium text-muted-foreground">Custom</span>
                    <input
                      type="color"
                      value={boardBackgroundColor}
                      onChange={(e) => {
                        const n = normalizeHexColor(e.target.value)
                        if (n) setBoardBackgroundColor(n)
                      }}
                      className="h-8 min-w-0 flex-1 cursor-pointer rounded-md border border-input bg-background"
                      aria-label="Custom board color"
                    />
                  </div>
                  {!isPresetBoardHex(boardBackgroundColor) ? (
                    <div className="space-y-1.5">
                      <p className="text-xs text-muted-foreground">Toolbar & panels (this whiteboard only)</p>
                      <div className="flex gap-1">
                        <Button
                          type="button"
                          size="sm"
                          variant={customBoardChromeMode === 'light' ? 'default' : 'outline'}
                          className="min-w-0 flex-1 px-1.5 text-xs"
                          onClick={() => setCustomBoardChromeMode('light')}
                        >
                          Light
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={customBoardChromeMode === 'dark' ? 'default' : 'outline'}
                          className="min-w-0 flex-1 px-1.5 text-xs"
                          onClick={() => setCustomBoardChromeMode('dark')}
                        >
                          Dark
                        </Button>
                        <Button
                          type="button"
                          size="sm"
                          variant={customBoardChromeMode === 'auto' ? 'default' : 'outline'}
                          className="min-w-0 flex-1 px-1.5 text-xs"
                          onClick={() => setCustomBoardChromeMode('auto')}
                        >
                          Auto
                        </Button>
                      </div>
                      <p className="text-[11px] leading-snug text-muted-foreground">
                        For this board only: Auto follows board color brightness; Light / Dark stay until you change
                        them.
                      </p>
                    </div>
                  ) : null}
                </div>
              </div>
              <div className="space-y-2 rounded-md border border-border/70 p-2">
                <div>
                  <p className="text-sm font-medium">Board pattern</p>
      
                </div>
                <div className="grid grid-cols-5 gap-1.5">
                  {BOARD_PATTERN_PICKER_ORDER.map((id) => {
                    const selected = boardPatternId === id
                    return (
                      <button
                        key={id}
                        type="button"
                        title={boardPatternPickerLabel(id)}
                        aria-label={boardPatternPickerLabel(id)}
                        aria-pressed={selected}
                        onClick={() => setBoardPatternId(id)}
                        className={cn(
                          'group relative aspect-square w-full min-w-0 overflow-hidden rounded-md border-2 bg-muted/20 p-0.5 shadow-sm transition-transform hover:scale-[1.03] hover:shadow-md focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-ring focus-visible:ring-offset-2 focus-visible:ring-offset-background',
                          selected
                            ? 'border-primary ring-2 ring-primary/35'
                            : 'border-border hover:border-primary/40',
                        )}
                      >
                        <div
                          className="absolute inset-[3px] overflow-hidden rounded-[4px]"
                          style={{ backgroundColor: boardBackgroundColor }}
                        />
                        {id !== 'none' ? (
                          <div
                            className="absolute inset-[3px] rounded-[4px]"
                            style={boardPatternThumbnailStyle(id, surfaceDark, 42)}
                          />
                        ) : null}
                      </button>
                    )
                  })}
                </div>
              </div>
            </CardContent>
          </Card>
          </div>
        ) : null}

        {drawMode && drawToolsPanelOpen ? (
          <Card className="w-[15.5rem] py-2">
            <CardContent className="space-y-3 px-3">
              <p className="text-sm font-semibold">Drawing tools</p>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant={drawCanvasTool === 'pen' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setDrawCanvasTool('pen')}
                >
                  <PenLine className="h-4 w-4" />
                  Pen
                </Button>
                <Button
                  type="button"
                  variant={drawCanvasTool === 'eraser' ? 'default' : 'outline'}
                  size="sm"
                  className="flex-1 gap-1"
                  onClick={() => setDrawCanvasTool('eraser')}
                >
                  <Eraser className="h-4 w-4" />
                  Eraser
                </Button>
              </div>
              {drawCanvasTool === 'pen' ? (
                <>
                  <div>
                    <div className="mb-1.5 flex items-center justify-between gap-2">
                      <p className="text-xs font-medium text-muted-foreground">Color</p>
                      <label
                        className="relative flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center rounded-md border border-input bg-background shadow-sm hover:bg-accent hover:text-accent-foreground"
                        title="Color picker — choose any pen color"
                      >
                        <input
                          type="color"
                          value={drawPenColor}
                          onChange={(ev) => setDrawPenColor(ev.target.value)}
                          onInput={(ev) => setDrawPenColor((ev.target as HTMLInputElement).value)}
                          className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                          aria-label="Pen color"
                        />
                        <Palette className="pointer-events-none h-3.5 w-3.5" />
                      </label>
                    </div>
                    <div className="mt-1 grid grid-cols-6 gap-1.5">
                      {DRAW_PRESET_COLORS.map((c) => (
                        <button
                          key={c}
                          type="button"
                          title={c}
                          aria-label={`Use color ${c}`}
                          onClick={() => setDrawPenColor(c)}
                          className={cn(
                            'mx-auto h-7 w-7 shrink-0 rounded-full border-2 shadow-sm transition-transform hover:scale-105',
                            drawPenColor.toLowerCase() === c.toLowerCase()
                              ? 'border-primary ring-2 ring-primary/30'
                              : 'border-border',
                          )}
                          style={{ backgroundColor: c }}
                        />
                      ))}
                      {customDrawColors.map((c, index) => (
                        <div key={`${c}-${index}`} className="relative mx-auto h-7 w-7 shrink-0">
                          <button
                            type="button"
                            title={c}
                            aria-label={`Use saved color ${c}`}
                            onClick={() => setDrawPenColor(c)}
                            className={cn(
                              'h-7 w-7 rounded-full border-2 shadow-sm transition-transform hover:scale-105',
                              drawPenColor.toLowerCase() === c.toLowerCase()
                                ? 'border-primary ring-2 ring-primary/30'
                                : 'border-border',
                            )}
                            style={{ backgroundColor: c }}
                          />
                          <button
                            type="button"
                            title="Remove saved color"
                            aria-label="Remove saved color"
                            onClick={(ev) => {
                              ev.stopPropagation()
                              removeSavedDrawColor(index)
                            }}
                            className="absolute -right-1 -top-1 z-10 flex h-3.5 w-3.5 items-center justify-center rounded-full border border-border bg-background text-muted-foreground shadow-sm hover:border-destructive hover:bg-destructive hover:text-destructive-foreground"
                          >
                            <X className="h-2 w-2" strokeWidth={3} />
                          </button>
                        </div>
                      ))}
                      {customDrawColors.length < MAX_CUSTOM_DRAW_COLORS ? (
                        <label
                          className="relative mx-auto flex h-7 w-7 shrink-0 cursor-pointer items-center justify-center overflow-hidden rounded-full border-2 border-dashed border-muted-foreground/50 bg-muted/40 text-[10px] font-medium text-muted-foreground hover:bg-muted/70"
                          title="Pick a color — saved when you close the picker (drawing tools or board)"
                        >
                          <span className="pointer-events-none">+</span>
                          <input
                            ref={addSavedColorInputRef}
                            key={customDrawColors.length}
                            type="color"
                            defaultValue={normalizeHexColor(drawPenColor) ?? '#2563eb'}
                            className="absolute inset-0 h-full w-full cursor-pointer opacity-0"
                            aria-label="Add a saved color"
                            onFocus={onAddSavedColorPickerFocus}
                            onInput={markAddSavedColorPickerDirty}
                            onChange={markAddSavedColorPickerDirty}
                            onBlur={(ev) => finalizeAddSavedColorPicker(ev.relatedTarget)}
                          />
                        </label>
                      ) : null}
                    </div>
                  </div>
                  <div>
                    <p className="mb-1.5 text-xs font-medium text-muted-foreground">Stroke width</p>
                    <div className="flex gap-1">
                      {DRAW_WIDTH_PRESETS.map((w) => (
                        <Button
                          key={w}
                          type="button"
                          size="sm"
                          variant={drawPenWidth === w ? 'default' : 'outline'}
                          className="min-w-0 flex-1 px-0 text-xs tabular-nums"
                          onClick={() => setDrawPenWidth(w)}
                        >
                          {w}px
                        </Button>
                      ))}
                    </div>
                  </div>
                </>
              ) : (
                <div className="space-y-3">
                  <p className="text-xs leading-relaxed text-muted-foreground">
                    Tap or drag across ink. Each stroke is removed entirely when the eraser touches it.
                  </p>
                  <Button
                    type="button"
                    variant="destructive"
                    size="sm"
                    className="w-full"
                    disabled={strokes.length === 0}
                    onClick={() => void eraseAllDrawings()}
                  >
                    Erase all
                  </Button>
                </div>
              )}
            </CardContent>
          </Card>
        ) : null}
        </div>
      </div>

      <div
        className="fixed right-5 top-5 z-50 sm:right-6 sm:top-6"
        title="Wheel: scroll vertically · Shift+wheel: horizontal · hold Z + wheel: zoom the board (avoids Chrome Ctrl+zoom)"
      >
        <Card className="py-2 shadow-md">
          <CardContent className="flex flex-row flex-nowrap items-center justify-center gap-1.5 px-2 py-0">
            <span className="shrink-0 text-[10px] font-medium text-muted-foreground">Zoom</span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              title="Zoom out — or hold Z and scroll on the board"
              onClick={() => adjustBoardZoomFromControl(1 / 1.12)}
            >
              <Minus className="h-4 w-4" />
            </Button>
            <span className="min-w-[2.25rem] shrink-0 select-none text-center text-[10px] font-semibold tabular-nums text-foreground">
              {Math.round(boardZoom * 100)}%
            </span>
            <Button
              type="button"
              variant="outline"
              size="icon"
              className="h-8 w-8 shrink-0"
              title="Zoom in — or hold Z and scroll on the board"
              onClick={() => adjustBoardZoomFromControl(1.12)}
            >
              <Plus className="h-4 w-4" />
            </Button>
          </CardContent>
        </Card>
      </div>

      <div
        ref={scrollRef}
        className={cn(
          'min-h-0 flex-1 overflow-auto overscroll-contain',
          !drawMode && (boardPanning ? 'cursor-grabbing' : 'cursor-grab'),
        )}
        style={boardScrollSurfaceStyle}
      >
        {/* Explicit size so overflow/scrollHeight match zoomed board (CSS `zoom` alone can under-report height). */}
        <div
          className="relative"
          style={{
            width: BOARD_WIDTH * boardZoom,
            height: BOARD_HEIGHT * boardZoom,
          }}
        >
        <div
          ref={boardRef}
          className={cn('relative select-none', drawMode && 'cursor-crosshair')}
          style={{
            width: BOARD_WIDTH,
            height: BOARD_HEIGHT,
            backgroundColor: boardBackgroundColor,
            zoom: boardZoom,
          }}
          onDragOver={onDragOverBoard}
          onDrop={onDropFlashcardFromDeck}
          onPointerDownCapture={onBoardPointerDownCapture}
          onPointerMove={onPointerMoveBoard}
          onPointerUp={onPointerUpBoard}
          onPointerLeave={onPointerLeaveBoardResizeOnly}
          onLostPointerCapture={onLostPointerCaptureBoard}
        >
          {boardPatternId !== 'none' ? (
            <div
              className="pointer-events-none absolute inset-0 z-[1]"
              style={boardPatternLayerStyle}
              aria-hidden
            />
          ) : null}
          <canvas
            ref={canvasRef}
            width={BOARD_WIDTH}
            height={BOARD_HEIGHT}
            className="absolute inset-0 z-10"
            style={{ pointerEvents: drawMode ? 'auto' : 'none' }}
            onPointerDown={onPointerDownCanvas}
            onPointerMove={onPointerMoveCanvas}
            onPointerUp={onPointerUpCanvas}
            onPointerLeave={onPointerUpCanvas}
          />

          {!drawMode ? (
            <div
              className="absolute inset-0 z-[15] touch-none"
              aria-hidden
              onPointerDown={onBoardPanPointerDown}
            />
          ) : null}

          {items.map((item) => {
            const payload = item.payload ?? {}
            const imageUrl = item.type === 'IMAGE' ? String(payload.url ?? '') : ''
            const videoUrl = item.type === 'VIDEO' ? String(payload.url ?? '') : ''
            const videoEmbedUrl = item.type === 'VIDEO' ? toVideoEmbedUrl(videoUrl) : null
            const hasSelectedVisual =
              (item.type === 'IMAGE' && Boolean(imageUrl)) ||
              (item.type === 'VIDEO' && Boolean(videoEmbedUrl))
            const showDefaultHeader =
              !hasSelectedVisual && item.type !== 'COURSE' && item.type !== 'DECK' && item.type !== 'FLASHCARD'
            return (
              <div
                key={item.id}
                className={cn(
                  'group absolute rounded-lg border border-border bg-card shadow-sm',
                  item.type === 'DECK' ? 'overflow-visible' : 'overflow-hidden',
                  hasSelectedVisual ? 'p-0' : item.type === 'FLASHCARD' ? 'p-0' : 'p-2',
                  item.type === 'FLASHCARD' &&
                    cn(
                      'rounded-xl border-2 border-primary/40 bg-background shadow-md ring-1 ring-border/80',
                      surfaceDark && 'border-primary/50',
                    ),
                )}
                style={{
                  left: item.x,
                  top: item.y,
                  width: item.width,
                  height: item.height,
                  zIndex: 20 + (item.zIndex ?? 0),
                }}
                onPointerDownCapture={() => bringItemToFront(item.id)}
                onPointerDown={(e) => onPointerDownItem(item, e)}
                onDragOver={item.type === 'DECK' ? onDragOverDeckDropZone : undefined}
                onDrop={
                  item.type === 'DECK'
                    ? (e) => onDropToDeck(e, String((payload as Record<string, unknown>).deckId ?? ''))
                    : undefined
                }
              >
                {hasSelectedVisual ? (
                  <>
                    {item.type === 'IMAGE' ? (
                      <>
                        {/* Full drag layer over images; video uses a handle so the iframe stays clickable. */}
                        <div className="absolute inset-0 z-10 cursor-move" />
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={imageUrl}
                          alt={String(payload.alt ?? 'Image')}
                          className="h-full w-full object-cover"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      </>
                    ) : (
                      <iframe
                        src={videoEmbedUrl ?? undefined}
                        className="relative z-0 h-full w-full border-0"
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        title="Embedded video"
                      />
                    )}
                    <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/60 text-white hover:bg-black/70"
                        onClick={() => {
                          if (item.type === 'IMAGE') {
                            void openMediaPicker(item.id)
                          } else {
                            const next = window.prompt('Paste video URL', videoUrl)
                            if (next !== null) {
                              updateItem(item.id, { payload: { ...payload, url: next.trim() } })
                            }
                          }
                        }}
                        aria-label="Edit media"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/60 text-white hover:bg-black/70"
                        aria-label="Delete block"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    {item.type === 'VIDEO' ? (
                      <button
                        type="button"
                        data-block-drag-handle
                        className="absolute bottom-1 right-5 z-30 flex h-3.5 w-3.5 cursor-grab items-center justify-center rounded-sm border border-border bg-muted/70 text-foreground shadow-sm hover:bg-muted active:cursor-grabbing"
                        aria-label="Drag to move video block"
                        title="Drag here to move — click the video to play"
                      >
                        <Move className="pointer-events-none h-2.5 w-2.5" />
                      </button>
                    ) : null}
                  </>
                ) : showDefaultHeader ? (
                  <div className="mb-1 flex items-center justify-between gap-2">
                    <div className="flex items-center gap-1 text-muted-foreground">
                      {item.type === 'TEXT' ? <StickyNote className="h-3.5 w-3.5" /> : null}
                      {item.type === 'IMAGE' ? <ImageIcon className="h-3.5 w-3.5" /> : null}
                    </div>
                    <button
                      type="button"
                      onClick={() => void removeItem(item.id)}
                      className="inline-flex h-5 w-5 items-center justify-center rounded hover:bg-muted"
                      aria-label="Close block"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                  </div>
                ) : null}

                {item.type === 'TEXT' && (
                  <textarea
                    value={String(payload.text ?? '')}
                    onChange={(e) => updateItem(item.id, { payload: { ...payload, text: e.target.value } })}
                    placeholder="Write..."
                    spellCheck={spellCheckEnabled}
                    autoCorrect={spellCheckEnabled ? 'on' : 'off'}
                    autoCapitalize={spellCheckEnabled ? 'sentences' : 'off'}
                    className="h-[calc(100%-1.75rem)] w-full resize-none border-0 bg-transparent p-1 text-sm outline-none"
                  />
                )}

                {item.type === 'IMAGE' && !hasSelectedVisual && (
                  <div className="flex h-[calc(100%-1.75rem)] flex-col gap-2">
                    {payload.url ? (
                      // eslint-disable-next-line @next/next/no-img-element
                      <img
                        src={imageUrl}
                        alt={String(payload.alt ?? 'Image')}
                        className="h-full w-full rounded-md object-cover"
                        draggable={false}
                        onDragStart={(e) => e.preventDefault()}
                      />
                    ) : (
                      <div className="flex h-full items-center justify-center rounded-md border border-dashed border-border">
                        <Button variant="outline" size="sm" onClick={() => void openMediaPicker(item.id)}>
                          Select image
                        </Button>
                      </div>
                    )}
                    {payload.url ? (
                      <Button variant="outline" size="sm" onClick={() => void openMediaPicker(item.id)}>
                        Change image
                      </Button>
                    ) : null}
                  </div>
                )}

                {item.type === 'LINK' && (
                  <div className="space-y-2">
                    <Input
                      value={String(payload.title ?? '')}
                      onChange={(e) => updateItem(item.id, { payload: { ...payload, title: e.target.value } })}
                      placeholder="Link title"
                    />
                    <Input
                      value={String(payload.url ?? '')}
                      onChange={(e) => updateItem(item.id, { payload: { ...payload, url: e.target.value } })}
                      placeholder="https://..."
                    />
                  </div>
                )}

                {item.type === 'COURSE' && (
                  <div className="relative h-full overflow-hidden">
                    <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/55 text-white hover:bg-black/70"
                        onClick={() => {
                          setCoursePickerItemId(item.id)
                          setCourseQuery(String(payload.title ?? ''))
                          setCourseResults([])
                        }}
                        aria-label="Change course"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/55 text-white hover:bg-black/70"
                        aria-label="Delete block"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div
                      className="h-full w-full p-2 text-left"
                      title="Course card"
                    >
                      {payload.coverImage && typeof payload.coverImage === 'object' ? (
                        // eslint-disable-next-line @next/next/no-img-element
                        <img
                          src={`/api/media/serve/${encodeURIComponent(String((payload.coverImage as { filename?: string }).filename ?? ''))}`}
                          alt={String((payload.coverImage as { alt?: string }).alt ?? payload.title ?? 'Course')}
                          className="h-24 w-full object-cover"
                          draggable={false}
                          onDragStart={(e) => e.preventDefault()}
                        />
                      ) : null}
                      <div className="space-y-2 p-3">
                        {String(payload.courseSlug ?? '').trim() ? (
                          <Link
                            href={`/courses/${String(payload.courseSlug)}`}
                            data-no-drag
                            className={cn(
                              'line-clamp-2 text-base font-semibold underline-offset-2 hover:underline',
                              surfaceDark ? 'text-sky-300' : 'text-blue-700',
                            )}
                          >
                            {String(payload.title || 'Select a course')}
                          </Link>
                        ) : (
                          <p className="line-clamp-2 text-base font-semibold">
                            {String(payload.title || 'Select a course')}
                          </p>
                        )}
                        <p className="text-xs text-muted-foreground">
                          {String(payload.subject || 'Subject')}
                        </p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {String(payload.description || 'Click the edit icon to choose a course.')}
                        </p>
                        <div className="space-y-1 pt-1">
                          <div className="flex items-center justify-between text-[11px] text-muted-foreground">
                            <span>
                              {Number(payload.completedLessons ?? 0)} / {Number(payload.totalLessons ?? 0)} lessons
                            </span>
                            <span className="font-medium">
                              {Math.round(Number(payload.progressPercentage ?? 0))}%
                            </span>
                          </div>
                          <div
                            className={cn(
                              'h-2 w-full overflow-hidden rounded-full border',
                              surfaceDark
                                ? 'border-white/15 bg-white/[0.12]'
                                : 'border-slate-300/50 bg-slate-950/[0.06]',
                            )}
                          >
                            <div
                              className={cn(
                                'h-full rounded-full bg-gradient-to-r transition-[width] duration-500 ease-out',
                                surfaceDark ? 'from-sky-500 to-indigo-400' : 'from-blue-600 to-indigo-600',
                              )}
                              style={{ width: `${Math.max(0, Math.min(100, Number(payload.progressPercentage ?? 0)))}%` }}
                            />
                          </div>
                        </div>
                      </div>
                    </div>
                  </div>
                )}

                {item.type === 'VIDEO' && !hasSelectedVisual && (
                  <Input
                    value={videoUrl}
                    onChange={(e) => updateItem(item.id, { payload: { ...payload, url: e.target.value } })}
                    placeholder="Video URL"
                  />
                )}

                {item.type === 'DECK' && (
                  <div className="relative h-full">
                    <div className="absolute right-2 top-2 z-20 flex gap-1 opacity-0 transition-opacity group-hover:opacity-100">
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/55 text-white hover:bg-black/70"
                        onClick={() => {
                          setDeckSelectOpen(true)
                          setDeckQuery(String(payload.name ?? ''))
                          void fetchDecks()
                        }}
                        aria-label="Change deck"
                      >
                        <Edit3 className="h-3.5 w-3.5" />
                      </button>
                      <button
                        type="button"
                        onClick={() => void removeItem(item.id)}
                        className="inline-flex h-7 w-7 items-center justify-center rounded bg-black/55 text-white hover:bg-black/70"
                        aria-label="Delete deck card"
                      >
                        <X className="h-3.5 w-3.5" />
                      </button>
                    </div>
                    <div className="flex h-full flex-col justify-between p-1 pb-4 text-center">
                      <div className="space-y-1">
                        <p className="line-clamp-2 text-sm font-semibold">{String(payload.name ?? 'Deck')}</p>
                        {String(payload.kind ?? '') === 'course' && String(payload.courseSlug ?? '').trim() ? (
                          <p className="text-[11px] text-muted-foreground">
                            This deck belongs to the course:{' '}
                            <Link
                              href={`/courses/${String(payload.courseSlug)}`}
                              className={cn(
                                'font-medium underline-offset-2 hover:underline',
                                surfaceDark ? 'text-sky-300' : 'text-blue-700',
                              )}
                              data-no-drag
                            >
                              {String(payload.courseTitle ?? 'Open course')}
                            </Link>
                          </p>
                        ) : null}
                        <p className="line-clamp-2 text-xs text-muted-foreground">
                          {String(payload.description ?? 'Standalone deck')}
                        </p>
                      </div>
                      <div className="grid w-full grid-cols-3 gap-1.5 pt-2">
                        <div className="min-w-0 rounded-md border border-border/70 bg-muted/30 px-1 py-1">
                          <p className="text-sm font-semibold leading-none">{Number(payload.dueCount ?? 0)}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">due</p>
                        </div>
                        <div className="min-w-0 rounded-md border border-border/70 bg-muted/30 px-1 py-1">
                          <p className="text-sm font-semibold leading-none">{Number(payload.newCount ?? 0)}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">new</p>
                        </div>
                        <div className="min-w-0 rounded-md border border-border/70 bg-muted/30 px-1 py-1">
                          <p className="text-sm font-semibold leading-none">{Number(payload.flashcardCount ?? 0)}</p>
                          <p className="mt-0.5 text-[10px] uppercase tracking-wide text-muted-foreground">total</p>
                        </div>
                      </div>

                    </div>

                    <div
                      className="absolute bottom-0 left-1/2 z-30 -translate-x-1/2 translate-y-[62%]"
                      data-deck-actions-menu
                    >
                      <button
                        type="button"
                        className="inline-flex h-7 w-7 items-center justify-center rounded-full border border-border/70 bg-background shadow-sm hover:bg-muted"
                        onClick={() => {
                          setDeckActionsItemId((current) => (current === item.id ? null : item.id))
                          setDeckActionsView('menu')
                        }}
                        aria-label="Deck actions"
                        title="Deck actions"
                      >
                        <MoreHorizontal className="h-4 w-4" />
                      </button>

                      {deckActionsItemId === item.id ? (
                        deckActionsView === 'menu' ? (
                          <div
                            className="absolute left-1/2 top-full z-40 mt-2 flex -translate-x-1/2 flex-nowrap items-center justify-center gap-2"
                            style={{ paddingBottom: '10px' }}
                          >
                            {String(payload.kind ?? 'standalone') !== 'course' ? (
                              <span
                                style={{ transform: `translateY(${DECK_ACTION_ARC_Y_PX[0]}px)` }}
                                className="inline-flex shrink-0"
                              >
                                <button
                                  type="button"
                                  className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                                  onClick={() => {
                                    const deckId = String(payload.deckId ?? '')
                                    if (!deckId) return
                                    setDeckFlashcardModal({
                                      itemId: item.id,
                                      deckId,
                                      deckName: String(payload.name ?? 'Deck'),
                                    })
                                    setDeckFlashcardFront('')
                                    setDeckFlashcardBack('')
                                    setDeckActionsItemId(null)
                                  }}
                                  title="Add new flashcard"
                                  aria-label="Add new flashcard"
                                >
                                  <CirclePlus className="h-4 w-4" />
                                </button>
                              </span>
                            ) : (
                              <span
                                style={{ transform: `translateY(${DECK_ACTION_ARC_Y_PX[0]}px)` }}
                                className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full border border-border bg-muted/40 text-muted-foreground"
                              >
                                <CirclePlus className="h-4 w-4" />
                              </span>
                            )}
                            <span
                              style={{ transform: `translateY(${DECK_ACTION_ARC_Y_PX[1]}px)` }}
                              className="inline-flex shrink-0"
                            >
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted"
                                onClick={() => {
                                  const deckId = String(payload.deckId ?? '')
                                  if (!deckId) return
                                  void openDeckCardsPreview(item.id, deckId)
                                }}
                                title="View cards"
                                aria-label="View cards"
                              >
                                <List className="h-4 w-4" />
                              </button>
                            </span>
                            <span
                              style={{ transform: `translateY(${DECK_ACTION_ARC_Y_PX[2]}px)` }}
                              className="inline-flex shrink-0"
                            >
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-40"
                                disabled={Number(payload.flashcardCount ?? 0) === 0}
                                onClick={() => {
                                  const slug = String(payload.deckSlug ?? '').trim()
                                  if (!slug) {
                                    window.alert(
                                      'Deck slug is missing; try removing this card and adding the deck again.',
                                    )
                                    return
                                  }
                                  if (Number(payload.flashcardCount ?? 0) === 0) return
                                  setDeckActionsItemId(null)
                                  router.push(
                                    `/dashboard/flashcards/study?mode=srs&mainDeckSlug=${encodeURIComponent(slug)}`,
                                  )
                                }}
                                title="SRS Learn — spaced repetition session"
                                aria-label="SRS Learn"
                              >
                                <Brain className="h-4 w-4" />
                              </button>
                            </span>
                            <span
                              style={{ transform: `translateY(${DECK_ACTION_ARC_Y_PX[3]}px)` }}
                              className="inline-flex shrink-0"
                            >
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-full border border-border bg-background shadow-sm hover:bg-muted disabled:opacity-40"
                                disabled={Number(payload.flashcardCount ?? 0) === 0}
                                onClick={() => {
                                  const slug = String(payload.deckSlug ?? '').trim()
                                  if (!slug) {
                                    window.alert(
                                      'Deck slug is missing; try removing this card and adding the deck again.',
                                    )
                                    return
                                  }
                                  if (Number(payload.flashcardCount ?? 0) === 0) return
                                  setDeckActionsItemId(null)
                                  router.push(
                                    `/dashboard/flashcards/study?mode=free&mainDeckSlug=${encodeURIComponent(slug)}`,
                                  )
                                }}
                                title="Free Learn — study all cards in this deck"
                                aria-label="Free Learn"
                              >
                                <Zap className="h-4 w-4" />
                              </button>
                            </span>
                          </div>
                        ) : (
                          <div className="absolute left-1/2 top-full z-40 mt-2 w-56 -translate-x-1/2 rounded-md border border-border bg-background p-2 shadow-md">
                            <div className="mb-2 flex items-center justify-between">
                              <p className="text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                                Deck cards
                              </p>
                              <button
                                type="button"
                                className="inline-flex h-6 w-6 items-center justify-center rounded hover:bg-muted"
                                onClick={() => setDeckActionsView('menu')}
                                aria-label="Back to actions"
                              >
                                <X className="h-3.5 w-3.5" />
                              </button>
                            </div>
                            <div
                              className="overflow-y-auto rounded border border-border/70"
                              style={{ height: `${DECK_CARDS_PREVIEW_ROWS * 28}px` }}
                            >
                              {deckActionCardsLoading ? (
                                <p className="p-2 text-xs text-muted-foreground">Loading cards...</p>
                              ) : deckActionCards.length === 0 ? (
                                <p className="p-2 text-xs text-muted-foreground">No flashcards yet.</p>
                              ) : (
                                <div className="divide-y divide-border/70">
                                  {deckActionCards.map((card) => (
                                    <button
                                      key={card.id}
                                      type="button"
                                      draggable
                                      onDragStart={(event) => {
                                        event.dataTransfer.effectAllowed = 'copyMove'
                                        event.dataTransfer.setData(
                                          FLASHCARD_DRAG_MIME,
                                          JSON.stringify({
                                            flashcardId: card.id,
                                            sourceDeckId: deckActionSourceDeckId ?? '',
                                            frontText: card.frontText,
                                            backText: card.backText,
                                          }),
                                        )
                                        event.dataTransfer.setData('text/plain', card.frontText)
                                      }}
                                      className="flex h-7 w-full items-center px-2 text-left text-xs hover:bg-muted/60"
                                      title="Drag to board to copy, or to another deck to move"
                                    >
                                      {card.frontText.length > 80
                                        ? `${card.frontText.slice(0, 80)}...`
                                        : card.frontText}
                                    </button>
                                  ))}
                                </div>
                              )}
                            </div>
                          </div>
                        )
                      ) : null}
                    </div>
                  </div>
                )}

                {item.type === 'FLASHCARD' && (
                  <div
                    className="relative flex h-full cursor-pointer select-none flex-col border-l-[3px] border-primary/70 bg-background px-3 pb-3 pl-[0.65rem] pt-2.5 text-center"
                    onClick={() => toggleFlashcardFace(item.id)}
                    title="Click to flip"
                    role="button"
                    aria-label={
                      flippedFlashcardById[item.id]
                        ? 'Answer side. Click to show question.'
                        : 'Question side. Click to show answer.'
                    }
                  >
                    {/* Which side: left segment = question, right = answer (no text). */}
                    <div className="mb-2 flex h-1.5 gap-0.5 overflow-hidden rounded-full bg-muted p-px">
                      <span
                        className={cn(
                          'h-full min-w-0 flex-1 rounded-l-full transition-all duration-200',
                          !flippedFlashcardById[item.id]
                            ? cn(
                                'bg-primary',
                                surfaceDark
                                  ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                                  : 'shadow-[0_0_0_1px_rgba(0,0,0,0.06)]',
                              )
                            : 'bg-transparent',
                        )}
                        aria-hidden
                      />
                      <span
                        className={cn(
                          'h-full min-w-0 flex-1 rounded-r-full transition-all duration-200',
                          flippedFlashcardById[item.id]
                            ? cn(
                                'bg-primary',
                                surfaceDark
                                  ? 'shadow-[0_0_0_1px_rgba(255,255,255,0.08)]'
                                  : 'shadow-[0_0_0_1px_rgba(0,0,0,0.06)]',
                              )
                            : 'bg-transparent',
                        )}
                        aria-hidden
                      />
                    </div>
                    <button
                      type="button"
                      onClick={(e) => {
                        e.stopPropagation()
                        void removeItem(item.id)
                      }}
                      className="absolute right-1 top-2 z-10 inline-flex h-6 w-6 items-center justify-center rounded-md border border-white/20 bg-black/55 text-white opacity-0 shadow-sm transition-opacity hover:bg-black/70 group-hover:opacity-100"
                      aria-label="Delete flashcard block"
                    >
                      <X className="h-3.5 w-3.5" />
                    </button>
                    <p className="line-clamp-6 flex flex-1 items-center justify-center whitespace-pre-wrap px-0.5 text-sm leading-snug text-foreground">
                      {flippedFlashcardById[item.id]
                        ? String(payload.back ?? '')
                        : String(payload.front ?? '')}
                    </p>
                    <div className="pointer-events-none mt-1 flex items-center justify-center gap-1.5" aria-hidden>
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full border border-primary/40 transition-colors',
                          !flippedFlashcardById[item.id] ? 'bg-primary' : 'bg-transparent',
                        )}
                      />
                      <span
                        className={cn(
                          'h-1.5 w-1.5 rounded-full border border-primary/40 transition-colors',
                          flippedFlashcardById[item.id] ? 'bg-primary' : 'bg-transparent',
                        )}
                      />
                    </div>
                  </div>
                )}

                <button
                  type="button"
                  data-resize-handle
                  onPointerDown={(e) => startResize(item, e)}
                  className="absolute bottom-1 right-1 z-30 h-3.5 w-3.5 cursor-se-resize rounded-sm border border-border bg-muted/70"
                  aria-label="Resize block"
                />
              </div>
            )
          })}
        </div>
        </div>
      </div>

      {mediaPickerItemId ? (
        <div className="fixed inset-0 z-[90] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-4xl py-3">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Choose image</h3>
                <Button size="icon" variant="ghost" onClick={() => setMediaPickerItemId(null)}>
                  <X className="h-4 w-4" />
                </Button>
              </div>

              <div className="flex flex-wrap items-center gap-2">
                <Input
                  placeholder="Search image..."
                  value={mediaQuery}
                  onChange={(e) => setMediaQuery(e.target.value)}
                  className="max-w-xs"
                />
                <label className="inline-flex cursor-pointer items-center rounded-md border border-border px-3 py-2 text-sm">
                  {mediaUploading ? 'Uploading...' : 'Upload new'}
                  <input
                    type="file"
                    accept="image/*"
                    className="hidden"
                    disabled={mediaUploading}
                    onChange={(e) => {
                      const file = e.target.files?.[0]
                      if (file) void uploadMedia(file)
                      e.currentTarget.value = ''
                    }}
                  />
                </label>
              </div>

              <div className="max-h-[55vh] overflow-auto rounded-md border border-border p-2">
                {mediaLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">Loading images...</p>
                ) : filteredMedia.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No images found.</p>
                ) : (
                  <div className="grid grid-cols-2 gap-2 sm:grid-cols-3 md:grid-cols-4">
                    {filteredMedia.map((media) => (
                      <button
                        key={media.id}
                        type="button"
                        onClick={() => attachMediaToItem(media)}
                        className="group overflow-hidden rounded-md border border-border text-left"
                      >
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={`/api/media/serve/${encodeURIComponent(media.filename)}`}
                          alt={media.alt ?? media.filename}
                          className="h-28 w-full object-cover transition-transform group-hover:scale-[1.02]"
                        />
                        <p className="truncate px-2 py-1 text-xs">{media.filename}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {coursePickerItemId ? (
        <div className="fixed inset-0 z-[95] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-2xl py-3">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Choose course</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setCoursePickerItemId(null)
                    setCourseQuery('')
                    setCourseResults([])
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Type course name..."
                value={courseQuery}
                onChange={(e) => setCourseQuery(e.target.value)}
                autoFocus
              />
              <div className="max-h-[50vh] overflow-auto rounded-md border border-border p-2">
                {courseLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">Searching courses...</p>
                ) : courseResults.length === 0 ? (
                  <p className="p-3 text-sm text-muted-foreground">No courses found.</p>
                ) : (
                  <div className="space-y-2">
                    {courseResults.map((course) => (
                      <button
                        key={course.id}
                        type="button"
                        className="w-full rounded-md border border-border/70 p-3 text-left hover:bg-muted/40"
                        onClick={() => {
                          if (coursePickerItemId) applyCourseToItem(coursePickerItemId, course)
                        }}
                      >
                        <p className="text-sm font-semibold">{course.title}</p>
                        <p className="text-xs text-muted-foreground">{course.subject}</p>
                        <p className="line-clamp-2 text-xs text-muted-foreground">{course.description}</p>
                      </button>
                    ))}
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {deckCreateOpen ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-lg py-3">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Create new deck</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeckCreateOpen(false)
                    setDeckName('')
                    setDeckDescription('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <Input
                  placeholder="Deck name"
                  value={deckName}
                  onChange={(e) => setDeckName(e.target.value)}
                />
                <textarea
                  placeholder="Deck description (optional)"
                  value={deckDescription}
                  onChange={(e) => setDeckDescription(e.target.value)}
                  className="min-h-24 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeckCreateOpen(false)
                    setDeckName('')
                    setDeckDescription('')
                  }}
                >
                  Cancel
                </Button>
                <Button onClick={() => void submitNewDeck()} disabled={deckSubmitting || !deckName.trim()}>
                  {deckSubmitting ? 'Creating...' : 'Create deck'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {deckSelectOpen ? (
        <div className="fixed inset-0 z-[96] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-2xl py-3">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">Select existing deck</h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeckSelectOpen(false)
                    setDeckQuery('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <Input
                placeholder="Type deck name..."
                value={deckQuery}
                onChange={(e) => setDeckQuery(e.target.value)}
                autoFocus
              />
              <div className="max-h-[50vh] overflow-auto rounded-md border border-border p-2">
                {deckLoading ? (
                  <p className="p-3 text-sm text-muted-foreground">Loading decks...</p>
                ) : (
                  <div className="grid gap-3 md:grid-cols-2">
                    <div className="space-y-2">
                      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Creative decks
                      </p>
                      {filteredCreativeDecks.length === 0 ? (
                        <p className="rounded-md border border-border/70 p-3 text-xs text-muted-foreground">
                          No creative decks.
                        </p>
                      ) : (
                        filteredCreativeDecks.map((deck) => (
                          <button
                            key={deck.id}
                            type="button"
                            className="w-full rounded-md border border-border/70 p-3 text-left hover:bg-muted/40"
                            onClick={() => {
                              void createDeckCard(deck)
                              setDeckSelectOpen(false)
                              setDeckQuery('')
                            }}
                          >
                            <p className="text-sm font-semibold">{deck.name}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {deck.description || 'No description'}
                            </p>
                            <p className="text-xs text-muted-foreground">Cards: {deck.cardCount}</p>
                          </button>
                        ))
                      )}
                    </div>
                    <div className="space-y-2">
                      <p className="px-1 text-xs font-semibold uppercase tracking-wide text-muted-foreground">
                        Your decks
                      </p>
                      {filteredSystemDecks.length === 0 ? (
                        <p className="rounded-md border border-border/70 p-3 text-xs text-muted-foreground">
                          No system decks.
                        </p>
                      ) : (
                        filteredSystemDecks.map((deck) => (
                          <div
                            key={deck.id}
                            className="w-full rounded-md border border-border/70 p-3 text-left hover:bg-muted/40"
                            onClick={() => {
                              void createSystemDeckCard(deck)
                              setDeckSelectOpen(false)
                              setDeckQuery('')
                            }}
                            onKeyDown={(e) => {
                              if (e.key === 'Enter' || e.key === ' ') {
                                e.preventDefault()
                                void createSystemDeckCard(deck)
                                setDeckSelectOpen(false)
                                setDeckQuery('')
                              }
                            }}
                            role="button"
                            tabIndex={0}
                          >
                            <p className="text-sm font-semibold">{deck.name}</p>
                            <p className="line-clamp-2 text-xs text-muted-foreground">
                              {deck.description || (deck.kind === 'course' ? 'Course-linked deck' : 'Standalone deck')}
                            </p>
                            <p className="text-xs text-muted-foreground">Cards: {deck.cardCount}</p>
                          </div>
                        ))
                      )}
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}

      {deckFlashcardModal ? (
        <div className="fixed inset-0 z-[97] flex items-center justify-center bg-black/45 p-4">
          <Card className="w-full max-w-lg py-3">
            <CardContent className="space-y-3 px-4">
              <div className="flex items-center justify-between">
                <h3 className="text-base font-semibold">
                  Add flashcard to {deckFlashcardModal.deckName}
                </h3>
                <Button
                  size="icon"
                  variant="ghost"
                  onClick={() => {
                    setDeckFlashcardModal(null)
                    setDeckFlashcardFront('')
                    setDeckFlashcardBack('')
                  }}
                >
                  <X className="h-4 w-4" />
                </Button>
              </div>
              <div className="space-y-2">
                <textarea
                  placeholder="Front text"
                  value={deckFlashcardFront}
                  onChange={(e) => setDeckFlashcardFront(e.target.value)}
                  className="min-h-20 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none"
                />
                <textarea
                  placeholder="Back text"
                  value={deckFlashcardBack}
                  onChange={(e) => setDeckFlashcardBack(e.target.value)}
                  className="min-h-28 w-full resize-none rounded-md border border-input bg-transparent px-3 py-2 text-sm outline-none"
                />
              </div>
              <div className="flex justify-end gap-2">
                <Button
                  variant="outline"
                  onClick={() => {
                    setDeckFlashcardModal(null)
                    setDeckFlashcardFront('')
                    setDeckFlashcardBack('')
                  }}
                >
                  Cancel
                </Button>
                <Button
                  onClick={() => void submitDeckFlashcard()}
                  disabled={deckFlashcardSubmitting || !deckFlashcardFront.trim() || !deckFlashcardBack.trim()}
                >
                  {deckFlashcardSubmitting ? 'Adding...' : 'Add flashcard'}
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      ) : null}
    </div>
  )
}

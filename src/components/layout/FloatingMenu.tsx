import { useCallback, useEffect, useLayoutEffect, useRef, useState } from 'react'
import { NavLink, useLocation } from 'react-router'
import {
  ChevronDown,
  ChevronUp,
  FileText,
  GripVertical,
  LayoutDashboard,
  Settings,
  Users,
} from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Pièces du dossier', href: '/pieces', icon: FileText },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

type Position = { right: number; bottom: number }
type PanelLayout = { direction: 'up' | 'down'; maxHeight?: number; alignLeft: boolean }

const STORAGE_KEY = 'trackpro.floatingMenu.position'
const DEFAULT_POSITION: Position = { right: 32, bottom: 32 }
const MARGIN = 8 // marge avec les bords de la fenêtre
const GAP = 12 // espace entre la barre et le panneau
const PANEL_WIDTH = 248
const DRAG_THRESHOLD = 4 // px avant de considérer un glissement

const isFiniteNumber = (v: unknown): v is number => typeof v === 'number' && Number.isFinite(v)
const clamp = (v: number, min: number, max: number) => Math.min(Math.max(v, min), Math.max(min, max))

function readPosition(): Position | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const p = JSON.parse(raw)
    if (p && isFiniteNumber(p.right) && isFiniteNumber(p.bottom) && p.right >= 0 && p.bottom >= 0) {
      return { right: p.right, bottom: p.bottom }
    }
  } catch {
    /* localStorage indisponible ou JSON invalide : position par défaut */
  }
  return null
}

function writePosition(p: Position) {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify(p))
  } catch {
    /* ignoré */
  }
}

export function FloatingMenu() {
  const { pathname } = useLocation()
  const [isOpen, setIsOpen] = useState(false)
  const [position, setPosition] = useState<Position | null>(readPosition)
  const [dragging, setDragging] = useState(false)
  const [panel, setPanel] = useState<PanelLayout>({ direction: 'up', alignLeft: false })

  // Le conteneur ne contient QUE la barre : sa taille ne change jamais.
  const wrapperRef = useRef<HTMLDivElement>(null)
  const panelRef = useRef<HTMLElement>(null)
  const raf = useRef<number | null>(null)
  const drag = useRef({
    active: false,
    pointerId: -1,
    startX: 0,
    startY: 0,
    startLeft: 0,
    startTop: 0,
    barW: 0,
    barH: 0,
    moved: false,
    dx: 0,
    dy: 0,
  })

  const clampPosition = useCallback((p: Position): Position => {
    const el = wrapperRef.current
    if (!el) return p
    const { width, height } = el.getBoundingClientRect()
    if (width === 0) return p // masqué (mobile)
    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    const next = {
      right: clamp(p.right, MARGIN, cw - width - MARGIN),
      bottom: clamp(p.bottom, MARGIN, ch - height - MARGIN),
    }
    return next.right === p.right && next.bottom === p.bottom ? p : next
  }, [])

  // Sens d'ouverture, hauteur max et alignement du panneau, mesurés sur la BARRE.
  const updatePanel = useCallback(() => {
    const bar = wrapperRef.current
    const panelEl = panelRef.current
    if (!bar || !panelEl) return
    const r = bar.getBoundingClientRect()
    if (r.width === 0) return
    const ch = document.documentElement.clientHeight
    const natural = panelEl.scrollHeight + 2 // + bordures
    const above = r.top - GAP - MARGIN
    const below = ch - r.bottom - GAP - MARGIN
    const direction: 'up' | 'down' =
      above >= natural || (below < natural && above >= below) ? 'up' : 'down'
    const space = direction === 'up' ? above : below
    const next: PanelLayout = {
      direction,
      maxHeight: space < natural ? Math.max(96, Math.floor(space)) : undefined,
      alignLeft: r.right - PANEL_WIDTH < MARGIN,
    }
    setPanel((prev) =>
      prev.direction === next.direction &&
      prev.maxHeight === next.maxHeight &&
      prev.alignLeft === next.alignLeft
        ? prev
        : next,
    )
  }, [])

  useLayoutEffect(() => {
    if (isOpen) updatePanel()
  }, [isOpen, position, updatePanel])

  // Recadre une position enregistrée qui sortirait de la fenêtre.
  useLayoutEffect(() => {
    setPosition((p) => (p ? clampPosition(p) : p))
  }, [clampPosition])

  useEffect(() => {
    const onResize = () => {
      if (drag.current.active) return
      setPosition((p) => (p ? clampPosition(p) : p))
      updatePanel()
    }
    window.addEventListener('resize', onResize)
    return () => window.removeEventListener('resize', onResize)
  }, [clampPosition, updatePanel])

  useEffect(() => {
    if (!isOpen) return
    const onKey = (e: KeyboardEvent) => {
      if (e.key === 'Escape') setIsOpen(false)
    }
    document.addEventListener('keydown', onKey)
    return () => document.removeEventListener('keydown', onKey)
  }, [isOpen])

  useEffect(
    () => () => {
      if (raf.current !== null) cancelAnimationFrame(raf.current)
      document.body.style.userSelect = ''
    },
    [],
  )

  // ---- Drag ----------------------------------------------------------------

  const onGripPointerDown = (e: React.PointerEvent<HTMLButtonElement>) => {
    if (e.button !== 0) return
    const el = wrapperRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    drag.current = {
      active: true,
      pointerId: e.pointerId,
      startX: e.clientX,
      startY: e.clientY,
      startLeft: r.left,
      startTop: r.top,
      barW: r.width,
      barH: r.height,
      moved: false,
      dx: 0,
      dy: 0,
    }
    e.currentTarget.setPointerCapture(e.pointerId)
  }

  const onGripPointerMove = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    // Ignore tout mouvement sans drag actif (survol) ou venant d'un autre pointeur.
    if (!d.active || e.pointerId !== d.pointerId) return

    const dx = e.clientX - d.startX
    const dy = e.clientY - d.startY
    if (!d.moved) {
      if (Math.hypot(dx, dy) < DRAG_THRESHOLD) return
      d.moved = true
      setIsOpen(false)
      setDragging(true)
      document.body.style.userSelect = 'none'
    }

    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    const left = clamp(d.startLeft + dx, MARGIN, cw - d.barW - MARGIN)
    const top = clamp(d.startTop + dy, MARGIN, ch - d.barH - MARGIN)
    d.dx = left - d.startLeft
    d.dy = top - d.startTop
    if (!isFiniteNumber(d.dx) || !isFiniteNumber(d.dy)) return

    if (raf.current === null) {
      raf.current = requestAnimationFrame(() => {
        raf.current = null
        const el = wrapperRef.current
        if (el) el.style.transform = `translate3d(${drag.current.dx}px, ${drag.current.dy}px, 0)`
      })
    }
  }

  const endDrag = (e: React.PointerEvent<HTMLButtonElement>) => {
    const d = drag.current
    if (!d.active || e.pointerId !== d.pointerId) return

    d.active = false
    d.pointerId = -1
    if (raf.current !== null) {
      cancelAnimationFrame(raf.current)
      raf.current = null
    }
    document.body.style.userSelect = ''
    try {
      e.currentTarget.releasePointerCapture(e.pointerId)
    } catch {
      /* déjà libéré */
    }

    const el = wrapperRef.current
    if (el) el.style.transform = ''

    if (d.moved && el) {
      const cw = document.documentElement.clientWidth
      const ch = document.documentElement.clientHeight
      const next: Position = {
        right: cw - (d.startLeft + d.dx + d.barW),
        bottom: ch - (d.startTop + d.dy + d.barH),
      }
      if (isFiniteNumber(next.right) && isFiniteNumber(next.bottom)) {
        setPosition(next)
        writePosition(next)
      }
    }
    d.moved = false
    d.dx = 0
    d.dy = 0
    setDragging(false)
  }

  // ---- Clavier sur la poignée ----------------------------------------------

  const onGripKeyDown = (e: React.KeyboardEvent<HTMLButtonElement>) => {
    if (drag.current.active) return
    if (!['ArrowUp', 'ArrowDown', 'ArrowLeft', 'ArrowRight'].includes(e.key)) return
    e.preventDefault()
    const el = wrapperRef.current
    if (!el) return
    const r = el.getBoundingClientRect()
    const cw = document.documentElement.clientWidth
    const ch = document.documentElement.clientHeight
    const step = e.shiftKey ? 32 : 8

    let right = cw - r.right
    let bottom = ch - r.bottom
    if (e.key === 'ArrowLeft') right += step
    if (e.key === 'ArrowRight') right -= step
    if (e.key === 'ArrowUp') bottom += step
    if (e.key === 'ArrowDown') bottom -= step

    const next: Position = {
      right: clamp(right, MARGIN, cw - r.width - MARGIN),
      bottom: clamp(bottom, MARGIN, ch - r.height - MARGIN),
    }
    setPosition(next)
    writePosition(next)
  }

  // ---- Rendu ---------------------------------------------------------------

  const current = NAV_ITEMS.find((i) => (i.href === '/' ? pathname === '/' : pathname.startsWith(i.href)))
  const CurrentIcon = current?.icon ?? LayoutDashboard
  const pos = position ?? DEFAULT_POSITION
  const showChevronUp = panel.direction === 'up' ? !isOpen : isOpen
  const ringClass = 'focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-[var(--primary)]'

  return (
    <>
      {isOpen && <div className="fixed inset-0 z-30" aria-hidden="true" onClick={() => setIsOpen(false)} />}

      <div
        ref={wrapperRef}
        className="fixed z-40 hidden md:block"
        style={{ right: pos.right, bottom: pos.bottom }}
      >
        {isOpen && (
          <nav
            id="floating-menu-panel"
            ref={panelRef}
            aria-label="Navigation principale"
            className={`absolute flex w-[248px] flex-col gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] p-2 shadow-2xl ${
              panel.alignLeft ? 'left-0' : 'right-0'
            }`}
            style={{
              ...(panel.direction === 'up'
                ? { bottom: `calc(100% + ${GAP}px)` }
                : { top: `calc(100% + ${GAP}px)` }),
              maxHeight: panel.maxHeight,
              overflowY: panel.maxHeight !== undefined ? 'auto' : undefined,
            }}
          >
            {NAV_ITEMS.map(({ label, href, icon: Icon }) => (
              <NavLink
                key={href}
                to={href}
                end={href === '/'}
                onClick={() => setIsOpen(false)}
                className={({ isActive }) =>
                  `flex items-center gap-3 rounded-[10px] px-3.5 py-3 text-[15px] font-medium transition-colors ${ringClass} ${
                    isActive
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                  }`
                }
              >
                <Icon className="size-5 shrink-0" aria-hidden="true" />
                {label}
              </NavLink>
            ))}
          </nav>
        )}

        <div className="flex h-[52px] items-center gap-1 rounded-2xl border border-[var(--border)] bg-[var(--card)] px-2 shadow-xl">
          <button
            type="button"
            aria-label="Déplacer le menu"
            title="Glissez pour déplacer le menu"
            onPointerDown={onGripPointerDown}
            onPointerMove={onGripPointerMove}
            onPointerUp={endDrag}
            onPointerCancel={endDrag}
            onKeyDown={onGripKeyDown}
            className={`flex h-9 w-8 touch-none select-none items-center justify-center rounded-lg text-[var(--muted-foreground)] hover:bg-[var(--input)] ${ringClass} ${
              dragging ? 'cursor-grabbing' : 'cursor-grab'
            }`}
          >
            <GripVertical className="size-[18px]" aria-hidden="true" />
          </button>

          <button
            type="button"
            aria-expanded={isOpen}
            aria-controls="floating-menu-panel"
            onClick={() => setIsOpen((o) => !o)}
            className={`flex h-9 min-w-[152px] items-center gap-2.5 rounded-[10px] pl-1.5 pr-2.5 text-[15px] font-semibold text-[var(--foreground)] hover:bg-[var(--input)] ${ringClass}`}
          >
            <span className="flex size-7 items-center justify-center rounded-lg bg-[var(--primary)] text-white">
              <CurrentIcon className="size-4" aria-hidden="true" />
            </span>
            Menu
            {showChevronUp ? (
              <ChevronUp className="ml-auto size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            ) : (
              <ChevronDown className="ml-auto size-4 text-[var(--muted-foreground)]" aria-hidden="true" />
            )}
          </button>
        </div>
      </div>
    </>
  )
}
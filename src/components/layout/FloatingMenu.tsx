import { useState, useRef, useEffect } from 'react'
import { NavLink, useLocation } from 'react-router'
import { GripVertical, ChevronUp, ChevronDown, LayoutDashboard, FileText, BarChart3, Users, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Pièces du dossier', href: '/pieces', icon: FileText },
  { label: 'Statistiques', href: '/statistiques', icon: BarChart3 },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

interface Position {
  x: number
  y: number
}

const STORAGE_KEY = 'floatingMenuPosition'
// Default position: bottom-right corner
const DEFAULT_POSITION = { x: window.innerWidth - 32 - 60, y: window.innerHeight - 32 - 60 }

export function FloatingMenu() {
  const location = useLocation()
  const [isOpen, setIsOpen] = useState(true)
  const [position, setPosition] = useState<Position>(DEFAULT_POSITION)
  const [isDragging, setIsDragging] = useState(false)
  const [dragOffset, setDragOffset] = useState({ x: 0, y: 0 })
  const [panelDirection, setPanelDirection] = useState<'up' | 'down'>('up')
  const containerRef = useRef<HTMLDivElement>(null)
  const gripRef = useRef<HTMLButtonElement>(null)

  // Load position from localStorage on mount
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY)
      if (saved) {
        const parsed = JSON.parse(saved)
        setPosition(parsed)
      }
    } catch (e) {
      console.error('Failed to load position:', e)
    }
  }, [])

  // Save position to localStorage when it changes
  useEffect(() => {
    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(position))
    } catch (e) {
      console.error('Failed to save position:', e)
    }
  }, [position])

  // Determine panel direction based on available space
  useEffect(() => {
    if (!containerRef.current || !isOpen) return

    const rect = containerRef.current.getBoundingClientRect()
    const panelHeight = 48 * NAV_ITEMS.length + 16 // 48px per item + padding
    const spaceAbove = rect.top
    const spaceBelow = window.innerHeight - rect.bottom

    // When menu is at BOTTOM: open UP (panelDirection = 'up')
    // When menu is at TOP: open DOWN (panelDirection = 'down')
    // So: if spaceAbove > spaceBelow → menu is at bottom → open up
    setPanelDirection(spaceAbove > spaceBelow ? 'up' : 'down')
  }, [isOpen, position])

  // Handle mouse drag
  const handleGripMouseDown = (e: React.MouseEvent) => {
    e.preventDefault()
    setIsDragging(true)
    setDragOffset({
      x: e.clientX - position.x,
      y: e.clientY - position.y,
    })
  }

  useEffect(() => {
    if (!isDragging) return

    const handleMouseMove = (e: MouseEvent) => {
      const newX = e.clientX - dragOffset.x
      const newY = e.clientY - dragOffset.y

      // Clamp to window boundaries (with 32px margin)
      // Menu width ~60px, but panel is 240px (w-60), so limit X to prevent panel overflow
      const clampedX = Math.max(32, Math.min(newX, window.innerWidth - 32 - 240))
      const clampedY = Math.max(32, Math.min(newY, window.innerHeight - 32 - 52))

      setPosition({ x: clampedX, y: clampedY })
    }

    const handleMouseUp = () => {
      setIsDragging(false)
    }

    document.addEventListener('mousemove', handleMouseMove)
    document.addEventListener('mouseup', handleMouseUp)

    return () => {
      document.removeEventListener('mousemove', handleMouseMove)
      document.removeEventListener('mouseup', handleMouseUp)
    }
  }, [isDragging, dragOffset])
    }
  }, [isDragging, dragOffset])

  // Handle keyboard navigation on grip
  const handleGripKeyDown = (e: React.KeyboardEvent) => {
    const step = 10
    let newX = position.x
    let newY = position.y

    switch (e.key) {
      case 'ArrowUp':
        e.preventDefault()
        newY = Math.max(32, newY - step)
        break
      case 'ArrowDown':
        e.preventDefault()
        newY = Math.min(window.innerHeight - 32 - 52, newY + step)
        break
      case 'ArrowLeft':
        e.preventDefault()
        newX = Math.max(32, newX - step)
        break
      case 'ArrowRight':
        e.preventDefault()
        newX = Math.min(window.innerWidth - 32 - 52, newX + step)
        break
      default:
        return
    }

    setPosition({ x: newX, y: newY })
  }

  // Close on Escape
  useEffect(() => {
    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape' && isOpen) {
        setIsOpen(false)
      }
    }

    document.addEventListener('keydown', handleEscape)
    return () => document.removeEventListener('keydown', handleEscape)
  }, [isOpen])

  const currentRoute = NAV_ITEMS.find((item) => item.href === location.pathname)

  return (
    <>
      {/* Floating Menu Bar */}
      <div
        ref={containerRef}
        className="fixed z-40 pointer-events-auto"
        style={{
          left: `${position.x}px`,
          top: `${position.y}px`,
        }}
      >
        <div className={`flex gap-2 ${panelDirection === 'up' ? 'flex-col-reverse' : 'flex-col'}`}>
          {/* Panel (opens above or below bar) */}
          {isOpen && (
            <div
              className="w-60 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg overflow-hidden"
              role="navigation"
              aria-label="Navigation principale"
            >
              <nav className="py-1">
                {NAV_ITEMS.map((item) => {
                  const Icon = item.icon
                  const isActive = location.pathname === item.href

                  return (
                    <NavLink
                      key={item.href}
                      to={item.href}
                      end={item.href === '/'}
                      onClick={() => setIsOpen(false)}
                      className={({ isActive }) =>
                        `flex items-center gap-3 px-4 py-3 text-sm transition-colors ${
                          isActive
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                        }`
                      }
                    >
                      <Icon className="w-5 h-5 flex-shrink-0" />
                      <span>{item.label}</span>
                    </NavLink>
                  )
                })}
              </nav>
            </div>
          )}

          {/* Menu Bar (always visible) */}
          <div
            className="h-13 bg-[var(--card)] border border-[var(--border)] rounded-2xl shadow-lg flex items-center gap-2 px-3 flex-shrink-0"
          >
            {/* Grip handle */}
            <button
              ref={gripRef}
              onMouseDown={handleGripMouseDown}
              onKeyDown={handleGripKeyDown}
              tabIndex={0}
              className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors cursor-grab active:cursor-grabbing"
              aria-label="Déplacer le menu"
              title="Glissez pour déplacer le menu"
            >
              <GripVertical className="w-5 h-5 text-[var(--muted)]" />
            </button>

            {/* Current page icon badge */}
            {currentRoute && (
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center flex-shrink-0">
                {currentRoute.icon && <currentRoute.icon className="w-5 h-5" />}
              </div>
            )}

            {/* Menu label + toggle button */}
            <button
              onClick={() => setIsOpen(!isOpen)}
              aria-expanded={isOpen}
              className="flex items-center gap-2 px-2 py-1 hover:bg-[var(--input)] rounded-lg transition-colors"
              aria-label="Ouvrir/fermer le menu de navigation"
            >
              <span className="text-sm font-medium text-[var(--foreground)]">Menu</span>
              {isOpen ? (
                <ChevronUp className="w-4 h-4 text-[var(--muted)]" />
              ) : (
                <ChevronDown className="w-4 h-4 text-[var(--muted)]" />
              )}
            </button>
          </div>
        </div>
      </div>

      {/* Backdrop when panel is open */}
      {isOpen && (
        <div
          className="fixed inset-0 z-30"
          onClick={() => setIsOpen(false)}
        />
      )}
    </>
  )
}

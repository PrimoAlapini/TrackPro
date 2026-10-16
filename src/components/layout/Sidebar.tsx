import { NavLink } from 'react-router'
import {
  LayoutDashboard,
  FileText,
  BarChart3,
  Users,
  Settings,
  X,
} from 'lucide-react'
import { Card, CardContent } from '@/components/ui/Card'
import { clsx } from 'clsx'

const navItems = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Pièces du dossier', href: '/pieces', icon: FileText },
  { label: 'Statistiques', href: '/statistiques', icon: BarChart3 },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

interface SidebarProps {
  isOpen?: boolean
  onClose?: () => void
}

export function Sidebar({ isOpen = true, onClose }: SidebarProps) {
  return (
    <aside
      className={clsx(
        'fixed top-0 left-0 h-screen bg-[var(--sidebar)] border-r border-[var(--border)] flex flex-col z-30 transition-transform duration-300 lg:translate-x-0',
        !isOpen && '-translate-x-full'
      )}
      style={{ width: '248px' }}
    >
      {/* Logo */}
      <div className="p-6 border-b border-[var(--border)]">
        <h1 className="text-2xl font-bold text-[var(--primary)]">TrackPro</h1>
      </div>

      {/* Navigation */}
      <nav className="flex-1 overflow-y-auto p-4 space-y-2">
        {navItems.map((item) => {
          const Icon = item.icon

          return (
            <NavLink
              key={item.href}
              to={item.href}
              end={item.href === '/'}
              onClick={onClose}
              className={({ isActive }) =>
                clsx(
                  'flex items-center gap-3 px-4 py-3 rounded-lg transition-colors',
                  isActive
                    ? 'bg-[var(--primary)] text-white'
                    : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                )
              }
              aria-label={`Aller à ${item.label}`}
            >
              <Icon className="w-5 h-5" />
              <span className="text-sm font-medium">{item.label}</span>
            </NavLink>
          )
        })}
      </nav>

      {/* Bottom Card */}
      <div className="p-4">
        <Card className="bg-gradient-to-br from-[var(--primary)] to-[var(--primary)] bg-opacity-20">
          <CardContent>
            <p className="text-xs text-[var(--foreground)] leading-relaxed">
              Chaque étape vous rapproche de votre objectif.
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Close button for mobile */}
      {onClose && (
        <button
          onClick={onClose}
          className="lg:hidden absolute top-4 right-4 text-[var(--muted)] hover:text-[var(--foreground)]"
          aria-label="Fermer le menu"
        >
          <X className="w-5 h-5" />
        </button>
      )}
    </aside>
  )
}

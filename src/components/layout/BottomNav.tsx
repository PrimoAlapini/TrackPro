import { NavLink, useLocation } from 'react-router'
import { LayoutDashboard, FileText, BarChart3, Users, Settings } from 'lucide-react'

const NAV_ITEMS = [
  { label: 'Tableau de bord', href: '/', icon: LayoutDashboard },
  { label: 'Pièces du dossier', href: '/pieces', icon: FileText },
  { label: 'Statistiques', href: '/statistiques', icon: BarChart3 },
  { label: 'Membres', href: '/membres', icon: Users },
  { label: 'Paramètres', href: '/parametres', icon: Settings },
]

export function BottomNav() {
  const location = useLocation()

  return (
    <nav
      className="fixed bottom-0 left-0 right-0 h-[72px] bg-[var(--card)] border-t border-[var(--border)] z-40 flex items-center justify-around px-0 safe-area-inset-bottom"
      style={{
        paddingBottom: 'env(safe-area-inset-bottom)',
      }}
    >
      {NAV_ITEMS.map((item) => {
        const Icon = item.icon
        const isActive = location.pathname === item.href

        return (
          <NavLink
            key={item.href}
            to={item.href}
            end={item.href === '/'}
            className={({ isActive: navIsActive }) =>
              `flex flex-col items-center justify-center w-full h-full relative transition-colors ${
                navIsActive
                  ? 'text-[var(--primary)]'
                  : 'text-[var(--muted)] hover:text-[var(--foreground)]'
              }`
            }
            aria-label={item.label}
            title={item.label}
          >
            {/* Icon badge (active: primary pill 48x40, rayon 12) */}
            <div
              className={`flex items-center justify-center transition-all ${
                isActive
                  ? 'w-12 h-10 rounded-[12px] bg-[var(--primary)] text-white'
                  : 'w-8 h-8 rounded-lg'
              }`}
            >
              <Icon className="w-6 h-6" />
            </div>
          </NavLink>
        )
      })}
    </nav>
  )
}

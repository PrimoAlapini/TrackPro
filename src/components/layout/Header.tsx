import {Bell, ChevronDown, LogOut, Moon, Sun } from 'lucide-react'
import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useDossiers } from '@/features/dossiers/api'
import { useDossier } from '@/contexts/DossierContext'
import { useAuth } from '@/contexts/AuthContext'
import { useTheme } from '@/contexts/ThemeContext'
import { Button } from '@/components/ui/Button'

interface HeaderProps {
  onNewDossier: () => void
}

export function Header({ onNewDossier }: HeaderProps) {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const { data: dossiers = [] } = useDossiers()
  const { activeDossierId, setActiveDossierId } = useDossier()
  const { theme, setTheme } = useTheme()
  const [showDossierMenu, setShowDossierMenu] = useState(false)
  const [showUserMenu, setShowUserMenu] = useState(false)
  const [isLoading, setIsLoading] = useState(false)

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)

  const handleSignOut = async () => {
    setIsLoading(true)
    try {
      await signOut()
      navigate('/login')
    } catch (error) {
      console.error('Sign out error:', error)
    } finally {
      setIsLoading(false)
    }
  }

  const getTRKCode = (id: string) => {
    return `TRK-${id.slice(0, 3).toUpperCase()}`
  }

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--card)] border-b border-[var(--border)] z-20">
      <div className="h-full max-w-7xl mx-auto px-0 lg:px-0 flex items-center gap-4">
        {/* Logo + brand (left) */}
        <a href="/" className="flex-shrink-0 flex items-center gap-2 hover:opacity-80 transition-opacity">
          <img
            src="/logo.png"
            alt="TrackPro"
            className="h-10 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </a>

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section: Dossier selector, Bell, User menu */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Dossier selector */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowDossierMenu(!showDossierMenu)}
              className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--input)] transition-colors"
              aria-label="Sélectionner un dossier"
            >
              {/* Desktop: full label + name */}
              <div className="hidden sm:flex flex-col items-start min-w-0">
                <p className="text-xs text-[var(--muted)]">Dossier actif</p>
                <p className="font-semibold text-[var(--foreground)] truncate">
                  {activeDossier ? `${activeDossier.nom} · ${getTRKCode(activeDossier.id)}` : 'Aucun dossier'}
                </p>
              </div>
              {/* Mobile: compact TRK-xxx only */}
              <span className="sm:hidden font-semibold text-[var(--foreground)]">
                {activeDossier ? getTRKCode(activeDossier.id) : 'TRK-?'}
              </span>
              <ChevronDown className={`w-4 h-4 text-[var(--muted)] flex-shrink-0 transition-transform ${showDossierMenu ? 'rotate-180' : ''}`} />
            </button>

            {/* Dropdown menu */}
            {showDossierMenu && (
              <>
                <div className="absolute top-full right-0 mt-2 w-80 max-h-96 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-40 overflow-hidden flex flex-col">
                  {/* Dossiers list */}
                  <div className="overflow-y-auto flex-1">
                    {dossiers.length === 0 ? (
                      <div className="p-4 text-center text-sm text-[var(--muted)]">
                        Aucun dossier. Créez-en un pour commencer.
                      </div>
                    ) : (
                      dossiers.map((dossier) => (
                        <button
                          key={dossier.id}
                          onClick={() => {
                            setActiveDossierId(dossier.id)
                            setShowDossierMenu(false)
                          }}
                          className={`w-full flex flex-col items-start px-4 py-3 text-sm transition-colors border-b border-[var(--border)] last:border-b-0 ${
                            activeDossierId === dossier.id
                              ? 'bg-[var(--primary)] text-white'
                              : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                          }`}
                        >
                          <p className="font-medium">{dossier.nom} · {getTRKCode(dossier.id)}</p>
                          <p className={`text-xs ${activeDossierId === dossier.id ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                            {dossier.description}
                          </p>
                        </button>
                      ))
                    )}
                  </div>

                  {/* Actions */}
                  <div className="border-t border-[var(--border)] p-2 bg-[var(--input)] bg-opacity-30">
                    <button
                      onClick={() => {
                        onNewDossier()
                        setShowDossierMenu(false)
                      }}
                      className="w-full px-3 py-2 text-sm text-[var(--foreground)] hover:bg-[var(--primary)] hover:text-white rounded-lg transition-colors font-medium"
                    >
                      + Nouveau dossier
                    </button>
                  </div>
                </div>

                {/* Backdrop */}
                <div
                  className="fixed inset-0 z-30"
                  onClick={() => setShowDossierMenu(false)}
                />
              </>
            )}
          </div>

          {/* Bell (inactive) */}
          <button
            className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors opacity-50 cursor-not-allowed flex-shrink-0"
            aria-label="Notifications"
            title="Notifications disponibles en version future"
          >
            <Bell className="w-5 h-5 text-[var(--foreground)]" />
          </button>

          {/* User menu */}
          <div className="relative flex-shrink-0">
            <button
              onClick={() => setShowUserMenu(!showUserMenu)}
              className="flex items-center gap-2 px-2 py-1 rounded-lg hover:bg-[var(--input)] transition-colors"
              aria-label="Menu utilisateur"
              aria-expanded={showUserMenu}
            >
              {/* Desktop: avatar + Admin label + chevron */}
              <div className="w-8 h-8 rounded-lg bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold flex-shrink-0">
                AD
              </div>
              <div className="hidden sm:flex items-center gap-1">
                <span className="text-sm text-[var(--foreground)]">Admin</span>
                <ChevronDown className={`w-4 h-4 text-[var(--muted)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
              </div>
              {/* Mobile: chevron only */}
              <ChevronDown className={`sm:hidden w-4 h-4 text-[var(--muted)] transition-transform ${showUserMenu ? 'rotate-180' : ''}`} />
            </button>

            {showUserMenu && (
              <div className="absolute right-0 top-12 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
                <div className="p-4 space-y-3">
                  {/* Theme Selector */}
                  <div className="space-y-2">
                    <p className="text-xs font-semibold text-[var(--muted)] px-2">THÈME</p>
                    <div className="space-y-1">
                      <button
                        onClick={() => setTheme('light')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === 'light'
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                        }`}
                      >
                        <Sun className="w-4 h-4" />
                        Clair
                      </button>
                      <button
                        onClick={() => setTheme('dark')}
                        className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                          theme === 'dark'
                            ? 'bg-[var(--primary)] text-white'
                            : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                        }`}
                      >
                        <Moon className="w-4 h-4" />
                        Sombre
                      </button>
                    </div>
                  </div>

                  {/* Divider */}
                  <div className="border-t border-[var(--border)]" />

                  {/* Sign Out */}
                  <Button
                    onClick={handleSignOut}
                    disabled={isLoading}
                    variant="danger"
                    size="sm"
                    className="w-full justify-center"
                  >
                    <LogOut className="w-4 h-4 mr-2" />
                    Se déconnecter
                  </Button>
                </div>
              </div>
            )}

            {/* Backdrop */}
            {showUserMenu && (
              <div
                className="fixed inset-0 z-40"
                onClick={() => setShowUserMenu(false)}
              />
            )}
          </div>
        </div>
      </div>
    </header>
  )
}

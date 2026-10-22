import { useState, useEffect } from 'react'
import { useNavigate } from 'react-router'
import { usePublicDossiers } from '@/hooks/usePublicData'
import { useDossier } from '@/contexts/DossierContext'
import { DossierProvider } from '@/contexts/DossierContext'
import { Button } from '@/components/ui/Button'
import { ChevronDown, LogIn, Sun, Moon } from 'lucide-react'
import { useTheme } from '@/contexts/ThemeContext'

interface PublicDashboardLayoutProps {
  children: React.ReactNode
}

export function PublicDashboardLayout({ children }: PublicDashboardLayoutProps) {
  const navigate = useNavigate()
  const { data: dossiers = [] } = usePublicDossiers()
  const { activeDossierId, setActiveDossierId } = useDossier()
  const [showDossierDropdown, setShowDossierDropdown] = useState(false)
  const { isDark, toggleTheme } = useTheme()

  // Auto-select first dossier if none selected
  useEffect(() => {
    if (dossiers.length > 0 && !activeDossierId) {
      setActiveDossierId(dossiers[0].id)
    }
  }, [dossiers, activeDossierId, setActiveDossierId])

  return (
    <DossierProvider>
      <div className="min-h-screen flex flex-col bg-[var(--background)] text-[var(--foreground)]">
        {/* Header */}
        <header className="border-b border-[var(--border)] bg-[var(--card)]">
          <div className="max-w-7xl mx-auto px-4 py-4 flex items-center justify-between">
            {/* Logo */}
            <div className="flex items-center gap-2">
              <img src="/trackPro_logo.png" alt="TrackPro Logo" className="h-10 w-auto" />
            </div>

            {/* Middle: Dossier selector */}
            <div className="flex-1 mx-8">
              <div className="relative">
                <button
                  onClick={() => setShowDossierDropdown(!showDossierDropdown)}
                  className="flex items-center gap-2 px-4 py-2 rounded-lg border border-[var(--border)] hover:bg-[var(--input)] transition-colors"
                >
                  <span className="text-sm">Sélectionner un dossier</span>
                  <ChevronDown className="w-4 h-4" />
                </button>

                {showDossierDropdown && (
                  <>
                    <div className="absolute top-full left-0 mt-2 w-64 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50 py-2">
                      {dossiers.length === 0 ? (
                        <p className="px-4 py-2 text-sm text-[var(--muted)]">Aucun dossier disponible</p>
                      ) : (
                        dossiers.map((dossier) => (
                          <button
                            key={dossier.id}
                            onClick={() => {
                              setActiveDossierId(dossier.id)
                              setShowDossierDropdown(false)
                            }}
                            className="w-full text-left px-4 py-2 hover:bg-[var(--input)] transition-colors text-sm"
                          >
                            {dossier.nom}
                          </button>
                        ))
                      )}
                    </div>
                    <div
                      className="fixed inset-0 z-40"
                      onClick={() => setShowDossierDropdown(false)}
                    />
                  </>
                )}
              </div>
            </div>

            {/* Right: Theme toggle and Login button */}
            <div className="flex items-center gap-3">
              <button
                onClick={toggleTheme}
                className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors"
                aria-label="Basculer le thème"
              >
                {isDark ? (
                  <Sun className="w-5 h-5 text-[var(--warning)]" />
                ) : (
                  <Moon className="w-5 h-5 text-[var(--info)]" />
                )}
              </button>
              <Button
                variant="primary"
                size="sm"
                onClick={() => navigate('/login')}
                icon={<LogIn className="w-4 h-4" />}
              >
                Se connecter
              </Button>
            </div>
          </div>
        </header>

        {/* Content */}
        <main className="flex-1 max-w-7xl mx-auto px-4 py-8 w-full">
          {children}
        </main>

        {/* Footer */}
        <footer className="border-t border-[var(--border)] bg-[var(--card)] mt-auto w-full">
          <div className="max-w-7xl mx-auto px-4 py-6 text-center text-sm text-[var(--muted)]">
            <p>© {new Date().getFullYear()} TrackPro - Tous droits réservés. Par Lit~dev</p>
          </div>
        </footer>
      </div>
    </DossierProvider>
  )
}
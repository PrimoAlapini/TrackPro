import { Menu, Search, Bell, ChevronDown } from 'lucide-react'
import { useState } from 'react'
import { useDossiers } from '@/features/dossiers/api'
import { useDossier } from '@/contexts/DossierContext'
import { UserMenu } from './UserMenu'

interface HeaderProps {
  onMenuClick: () => void
  onNewDossier: () => void
}

export function Header({ onMenuClick, onNewDossier }: HeaderProps) {
  const { data: dossiers = [] } = useDossiers()
  const { activeDossierId, setActiveDossierId } = useDossier()
  const [showDossierMenu, setShowDossierMenu] = useState(false)

  const activeDossier = dossiers.find((d) => d.id === activeDossierId)

  return (
    <header className="fixed top-0 left-0 right-0 h-16 bg-[var(--card)] border-b border-[var(--border)] z-20">
      <div className="h-full px-4 lg:px-6 flex items-center gap-4 lg:ml-64">
        {/* Mobile menu button */}
        <button
          onClick={onMenuClick}
          className="lg:hidden p-2 hover:bg-[var(--input)] rounded-lg transition-colors flex-shrink-0"
          aria-label="Ouvrir le menu"
        >
          <Menu className="w-5 h-5 text-[var(--foreground)]" />
        </button>

        {/* Dossier selector on left (mobile + desktop) */}
        <div className="relative flex-shrink-0">
          <button
            onClick={() => setShowDossierMenu(!showDossierMenu)}
            className="flex items-center gap-2 px-3 py-2 rounded-lg text-sm hover:bg-[var(--input)] transition-colors group"
            aria-label="Sélectionner un dossier"
          >
            <div className="text-left min-w-0">
              <p className="font-semibold text-base text-[var(--foreground)] truncate">
                {activeDossier?.nom || 'Aucun dossier'}
              </p>
              <p className="text-xs text-[var(--muted)] truncate">
                {activeDossier?.description || 'Sélectionnez un dossier'}
              </p>
            </div>
            <ChevronDown className={`w-4 h-4 text-[var(--muted)] flex-shrink-0 transition-transform ${showDossierMenu ? 'rotate-180' : ''}`} />
          </button>

          {/* Dropdown menu */}
          {showDossierMenu && (
            <>
              <div className="absolute top-full left-0 mt-2 w-80 max-h-96 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-xl z-40 overflow-hidden flex flex-col">
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
                        <p className="font-medium">{dossier.nom}</p>
                        {dossier.description && (
                          <p className={`text-xs ${activeDossierId === dossier.id ? 'text-white/70' : 'text-[var(--muted)]'}`}>
                            {dossier.description}
                          </p>
                        )}
                      </button>
                    ))
                  )}
                </div>

                {/* Actions */}
                <div className="border-t border-[var(--border)] p-2 space-y-1 bg-[var(--input)] bg-opacity-30">
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

        {/* Spacer */}
        <div className="flex-1" />

        {/* Right section */}
        <div className="flex items-center gap-2 lg:gap-4">
          {/* Search (inactive) */}
          <button
            className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors opacity-50 cursor-not-allowed"
            aria-label="Rechercher"
            title="Fonction de recherche disponible en version future"
          >
            <Search className="w-5 h-5 text-[var(--foreground)]" />
          </button>

          {/* Notifications (inactive) */}
          <button
            className="p-2 hover:bg-[var(--input)] rounded-lg transition-colors opacity-50 cursor-not-allowed relative"
            aria-label="Notifications"
            title="Notifications disponibles en version future"
          >
            <Bell className="w-5 h-5 text-[var(--foreground)]" />
            <span className="absolute top-1 right-1 w-2 h-2 bg-[var(--warning)] rounded-full" />
          </button>

          {/* User menu */}
          <UserMenu />
        </div>
      </div>
    </header>
  )
}

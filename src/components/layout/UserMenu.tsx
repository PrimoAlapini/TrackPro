import { useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { applyTheme, getCurrentTheme, type Theme } from '@/lib/theme'
import { LogOut, Moon, Sun, Monitor } from 'lucide-react'

export function UserMenu() {
  const navigate = useNavigate()
  const { signOut } = useAuth()
  const [showMenu, setShowMenu] = useState(false)
  const [theme, setTheme] = useState<Theme>(getCurrentTheme())
  const [isLoading, setIsLoading] = useState(false)

  const handleThemeChange = (newTheme: Theme) => {
    applyTheme(newTheme)
    setTheme(newTheme)
  }

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

  return (
    <div className="relative">
      <button
        onClick={() => setShowMenu(!showMenu)}
        className="flex items-center justify-center w-10 h-10 rounded-lg hover:bg-[var(--input)] transition-colors"
        aria-label="Menu utilisateur"
      >
        <div className="w-6 h-6 rounded-full bg-[var(--primary)] text-white flex items-center justify-center text-sm font-semibold">
          A
        </div>
      </button>

      {showMenu && (
        <div className="absolute right-0 top-12 w-48 bg-[var(--card)] border border-[var(--border)] rounded-lg shadow-lg z-50">
          <div className="p-4 space-y-3">
            {/* Theme Selector */}
            <div className="space-y-2">
              <p className="text-xs font-semibold text-[var(--muted)] px-2">THÈME</p>
              <div className="space-y-1">
                <button
                  onClick={() => handleThemeChange('light')}
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
                  onClick={() => handleThemeChange('dark')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'dark'
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                  }`}
                >
                  <Moon className="w-4 h-4" />
                  Sombre
                </button>
                <button
                  onClick={() => handleThemeChange('system')}
                  className={`w-full flex items-center gap-2 px-3 py-2 rounded-lg text-sm transition-colors ${
                    theme === 'system'
                      ? 'bg-[var(--primary)] text-white'
                      : 'text-[var(--foreground)] hover:bg-[var(--input)]'
                  }`}
                >
                  <Monitor className="w-4 h-4" />
                  Système
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
      {showMenu && (
        <div
          className="fixed inset-0 z-40"
          onClick={() => setShowMenu(false)}
        />
      )}
    </div>
  )
}

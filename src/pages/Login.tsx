import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Card, CardContent } from '@/components/ui/Card'

export function Login() {
  const navigate = useNavigate()
  const { user, signIn, isLoading: authLoading } = useAuth()
  const [email, setEmail] = useState('')
  const [password, setPassword] = useState('')
  const [error, setError] = useState('')
  const [isLoading, setIsLoading] = useState(false)

  // Redirect if already logged in
  useEffect(() => {
    if (user && !authLoading) {
      navigate('/')
    }
  }, [user, authLoading, navigate])

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault()
    setError('')
    setIsLoading(true)

    try {
      await signIn(email, password)
      navigate('/')
    } catch (err) {
      setError(
        err instanceof Error ? err.message : 'Erreur de connexion. Vérifiez vos identifiants.'
      )
    } finally {
      setIsLoading(false)
    }
  }

  if (authLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--foreground)]">Chargement...</div>
      </div>
    )
  }

  return (
    <div className="min-h-screen flex flex-col items-center justify-center bg-[var(--background)] px-4 py-6 lg:py-12">
      <div className="w-full max-w-md">
        {/* Logo */}
        <div className="flex justify-center mb-6 lg:mb-8">
          <img
            src={
              document.documentElement.classList.contains('dark')
                ? '/logo.svg'
                : '/logo-light.svg'
            }
            alt="TrackPro"
            className="h-12 w-auto"
            onError={(e) => {
              e.currentTarget.style.display = 'none'
            }}
          />
        </div>

        {/* Title */}
        <h1 className="text-2xl lg:text-3xl font-bold text-center text-[var(--foreground)] mb-2">
          TrackPro
        </h1>
        <p className="text-center text-[var(--muted)] mb-6 lg:mb-8 text-sm lg:text-base">
          Vos dossiers, notre priorité
        </p>

        {/* Form Card */}
        <Card>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div>
                <label
                  htmlFor="email"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Email
                </label>
                <Input
                  id="email"
                  type="email"
                  placeholder="admin@example.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              <div>
                <label
                  htmlFor="password"
                  className="block text-sm font-medium text-[var(--foreground)] mb-2"
                >
                  Mot de passe
                </label>
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                />
              </div>

              {error && (
                <div className="bg-[var(--danger)] bg-opacity-10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg text-sm">
                  {error}
                </div>
              )}

              <Button
                type="submit"
                variant="primary"
                className="w-full"
                isLoading={isLoading}
              >
                {isLoading ? 'Connexion...' : 'Se connecter'}
              </Button>
            </form>
          </CardContent>
        </Card>

        {/* Help text */}
        <p className="text-center text-xs text-[var(--muted)] mt-4 lg:mt-6">
          Cette plateforme est réservée aux administrateurs autorisés.
        </p>
      </div>
    </div>
  )
}

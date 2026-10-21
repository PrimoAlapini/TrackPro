import { useEffect, useState } from 'react'
import { useNavigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { Button } from '@/components/ui/Button'
import { Input } from '@/components/ui/Input'
import { Mail, Lock } from 'lucide-react'
import { DocumentLoader } from '@/components/ui/DocumentLoader'

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
        <DocumentLoader size="lg" />
      </div>
    )
  }

  return (
    <div className="min-h-screen flex items-center justify-center bg-[var(--background)] px-4 py-6 lg:py-12">
      <div className="w-full max-w-md">
        {/* Card with border */}
        <div className="bg-[var(--card)] border border-[var(--border)] rounded-[20px] p-8 space-y-6">
          {/* Logo + Tagline */}
          <div className="space-y-3">
            <div className="flex items-center justify-center gap-3">
              <img
                src="/trackPro_logo.png"
                alt="TrackPro"
                className="h-15 w-auto"
                onError={(e) => {
                  e.currentTarget.style.display = 'none'
                }}
              />
            </div>
            {/* <p className="text-center text-sm text-[var(--muted)]">
              Vos dossiers, notre priorité
            </p> */}
          </div>

          {/* Title + Subtitle */}
          <div className="space-y-2 text-center">
            <h2 className="text-3xl font-bold text-[var(--foreground)]">Connexion</h2>
            <p className="text-sm text-[var(--muted)]">
              Accès réservé à l'administrateur
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Email */}
            <div>
              <label
                htmlFor="email"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Adresse e-mail
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <Input
                  id="email"
                  type="email"
                  placeholder="vous@exemple.com"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Password */}
            <div>
              <label
                htmlFor="password"
                className="block text-sm font-semibold text-[var(--foreground)] mb-2"
              >
                Mot de passe
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-[var(--muted)]" />
                <Input
                  id="password"
                  type="password"
                  placeholder="••••••••"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  disabled={isLoading}
                  required
                  className="pl-10"
                />
              </div>
            </div>

            {/* Error Message */}
            {error && (
              <div className="bg-[var(--danger)] bg-opacity-10 border border-[var(--danger)] text-[var(--danger)] px-4 py-3 rounded-lg text-sm">
                {error}
              </div>
            )}

            {/* Submit Button */}
            <Button
              type="submit"
              variant="primary"
              className="w-full h-12 text-base font-semibold rounded-[12px]"
              isLoading={isLoading}
            >
              {isLoading ? 'Connexion...' : 'Se connecter'}
            </Button>
          </form>

          {/* Footer Text */}
          <p className="text-center text-xs text-[var(--muted)]">
            Ensemble vers la réussite.
          </p>
        </div>
      </div>
    </div>
  )
}

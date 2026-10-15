import { useAuth } from '@/contexts/AuthContext'
import { ChangePasswordForm } from '@/features/auth/ChangePasswordForm'
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card'

export function SettingsPage() {
  const { user } = useAuth()

  return (
    <div className="space-y-4 lg:space-y-6">
      {/* Page Header */}
      <div>
        <h1 className="text-[30px] font-bold text-[var(--foreground)]">Paramètres</h1>
        <p className="text-[var(--muted)] mt-1 text-sm lg:text-base">
          Gérez votre compte et votre mot de passe.
        </p>
      </div>

      {/* Account & Password Section - stacked on mobile, side-by-side on lg if needed */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Account */}
        <Card>
          <CardHeader>
            <CardTitle>Compte</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-[var(--foreground)] mb-1">
                  Email
                </label>
                <p className="text-[var(--muted)]">{user?.email}</p>
              </div>
              <div>
                <p className="text-xs text-[var(--muted)]">
                  Compte créé le {user?.created_at ? new Date(user.created_at).toLocaleDateString('fr-FR') : 'N/A'}
                </p>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Change Password */}
        <ChangePasswordForm />
      </div>
    </div>
  )
}

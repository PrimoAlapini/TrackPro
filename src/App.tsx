import { useEffect, useState } from 'react'
import { BrowserRouter, Routes, Route, Navigate } from 'react-router'
import { QueryClientProvider } from '@tanstack/react-query'
import { queryClient } from '@/lib/queryClient'
import { AuthProvider, useAuth } from '@/contexts/AuthContext'
import { DossierProvider } from '@/contexts/DossierContext'
import { DialogProvider } from '@/contexts/DialogContext'
import { ThemeProvider } from '@/contexts/ThemeContext'
import { initTheme } from '@/lib/theme'
import { Login } from '@/pages/Login'
import { Dashboard } from '@/pages/Dashboard'
import { Pieces } from '@/pages/Pieces'
import { Members } from '@/pages/Members'
import { SettingsPage } from '@/pages/Settings'
import { ComponentsTest } from '@/pages/ComponentsTest'
import { AuthGuard } from '@/app/AuthGuard'
import { AppLayout } from '@/app/AppLayout'
import { PublicDashboardLayout } from '@/app/PublicDashboardLayout'
import { DossierForm } from '@/features/dossiers/DossierForm'
import { useCreateDossier, useDossiers } from '@/features/dossiers/api'

// Root layout
function RootLayout() {
  useEffect(() => {
    initTheme()
  }, [])

  return null
}

function ProtectedRoute({ children }: { children: React.ReactNode }) {
  const [showDossierForm, setShowDossierForm] = useState(false)
  const [editingDossierId, setEditingDossierId] = useState<string | null>(null)
  const createDossier = useCreateDossier()
  const { data: dossiers = [] } = useDossiers()

  const editingDossier = dossiers.find((d) => d.id === editingDossierId)

  const handleDossierSubmit = async (data: any) => {
    try {
      if (editingDossierId) {
        // TODO: Implement update
        console.log('Update dossier:', editingDossierId, data)
      } else {
        const result = await createDossier.mutateAsync({
          nom: data.nom,
          description: data.description || null,
          date_debut: data.date_debut,
          date_limite: data.date_limite,
          responsable_collecte: data.responsable_collecte || null,
          responsable_revue: data.responsable_revue || null,
        })
        console.log('Dossier créé:', result)
      }
    } catch (error) {
      console.error('Erreur création dossier:', error)
      throw error
    }
  }

  return (
    <>
      <AuthGuard>
        <AppLayout
          onNewDossier={() => {
            setEditingDossierId(null)
            setShowDossierForm(true)
          }}
        >
          {children}
        </AppLayout>
      </AuthGuard>

      <DossierForm
        isOpen={showDossierForm}
        onClose={() => {
          setShowDossierForm(false)
          setEditingDossierId(null)
        }}
        onSubmit={handleDossierSubmit}
        isLoading={createDossier.isPending}
        initialData={
          editingDossier
            ? {
                nom: editingDossier.nom,
                description: editingDossier.description || undefined,
                date_debut: editingDossier.date_debut,
                date_limite: editingDossier.date_limite,
                responsable_collecte: editingDossier.responsable_collecte || undefined,
                responsable_revue: editingDossier.responsable_revue || undefined,
              }
            : undefined
        }
        title={editingDossierId ? 'Modifier le dossier' : 'Créer un dossier'}
      />
    </>
  )
}

// Home route - shows private dashboard for authenticated users, public dashboard otherwise
function HomeRoute() {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-[var(--background)]">
        <div className="text-[var(--foreground)]">Chargement...</div>
      </div>
    )
  }

  // Si connecté, affiche le dashboard privé
  if (user) {
    return (
      <ProtectedRoute>
        <Dashboard isPublic={false} />
      </ProtectedRoute>
    )
  }

  // Si non connecté, affiche le dashboard public
  return (
    <PublicDashboardLayout>
      <Dashboard isPublic={true} />
    </PublicDashboardLayout>
  )
}



function App() {
  return (
    <QueryClientProvider client={queryClient}>
      <ThemeProvider>
        <BrowserRouter>
          <AuthProvider>
            <DossierProvider>
              <DialogProvider>
                <RootLayout />
                <Routes>
                  {/* Public routes */}
                  <Route path="/login" element={<Login />} />
                  <Route path="/components-test" element={<ComponentsTest />} />
                  <Route
                    path="/public/dashboard"
                    element={
                      <PublicDashboardLayout>
                        <Dashboard isPublic={true} />
                      </PublicDashboardLayout>
                    }
                  />

                  {/* Home route - shows private dashboard for authenticated users, public otherwise */}
                  <Route path="/" element={<HomeRoute />} />

                  {/* Protected routes */}
                  <Route
                    path="/pieces"
                    element={
                      <ProtectedRoute>
                        <Pieces />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/membres"
                    element={
                      <ProtectedRoute>
                        <Members />
                      </ProtectedRoute>
                    }
                  />
                  <Route
                    path="/parametres"
                    element={
                      <ProtectedRoute>
                        <SettingsPage />
                      </ProtectedRoute>
                    }
                  />

                  {/* Catch all */}
                  <Route path="*" element={<Navigate to="/" replace />} />
                </Routes>
              </DialogProvider>
            </DossierProvider>
          </AuthProvider>
        </BrowserRouter>
      </ThemeProvider>
    </QueryClientProvider>
  )
}

export default App

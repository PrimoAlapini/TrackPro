import { type ReactNode } from 'react'
import { Navigate } from 'react-router'
import { useAuth } from '@/contexts/AuthContext'
import { DocumentLoader } from '@/components/ui/DocumentLoader'

interface AuthGuardProps {
  children: ReactNode
}

export function AuthGuard({ children }: AuthGuardProps) {
  const { user, isLoading } = useAuth()

  if (isLoading) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-(--background)">
        <DocumentLoader size="lg" />
      </div>
    )
  }

  if (!user) {
    return <Navigate to="/login" replace />
  }

  return <>{children}</>
}

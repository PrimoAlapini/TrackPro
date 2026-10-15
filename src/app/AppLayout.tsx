import { useState, type ReactNode } from 'react'
import { Sidebar } from '@/components/layout/Sidebar'
import { Header } from '@/components/layout/Header'

interface AppLayoutProps {
  children: ReactNode
  onNewDossier?: () => void
}

export function AppLayout({ children, onNewDossier }: AppLayoutProps) {
  const [sidebarOpen, setSidebarOpen] = useState(false)

  const handleCloseSidebar = () => setSidebarOpen(false)

  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Sidebar */}
      <Sidebar isOpen={sidebarOpen} onClose={handleCloseSidebar} />

      {/* Backdrop for mobile */}
      {sidebarOpen && (
        <div
          className="fixed inset-0 bg-black/50 z-20 lg:hidden"
          onClick={handleCloseSidebar}
        />
      )}

      {/* Header */}
      <Header
        onMenuClick={() => setSidebarOpen(!sidebarOpen)}
        onNewDossier={onNewDossier || (() => {})}
      />

      {/* Main content */}
      <main className="pt-16 lg:ml-64 min-h-screen bg-[var(--background)]">
        <div className="p-4 lg:p-6">{children}</div>
      </main>
    </div>
  )
}

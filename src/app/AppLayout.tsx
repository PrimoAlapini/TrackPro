import { type ReactNode } from 'react'
import { Header } from '@/components/layout/Header'
import { FloatingMenu } from '@/components/layout/FloatingMenu'
import { BottomNav } from '@/components/layout/BottomNav'

interface AppLayoutProps {
  children: ReactNode
  onNewDossier?: () => void
}

export function AppLayout({ children, onNewDossier }: AppLayoutProps) {
  return (
    <div className="min-h-screen bg-[var(--background)]">
      {/* Header */}
      <Header
        onMenuClick={() => {}} // Not used anymore (no sidebar toggle)
        onNewDossier={onNewDossier || (() => {})}
      />

      {/* Main content - full width on desktop, with safe margins for FloatingMenu and BottomNav */}
      <main className="pt-16 min-h-screen bg-[var(--background)] pb-[120px] lg:pb-[104px]">
        <div className="p-4 lg:p-6">{children}</div>
      </main>

      {/* FloatingMenu (desktop only) */}
      <div className="hidden lg:block">
        <FloatingMenu />
      </div>

      {/* BottomNav (mobile only) */}
      <div className="lg:hidden">
        <BottomNav />
      </div>
    </div>
  )
}

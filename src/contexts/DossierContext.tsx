import {
  createContext,
  useContext,
  useState,
  useEffect,
  type ReactNode,
} from 'react'

interface DossierContextType {
  activeDossierId: string | null
  setActiveDossierId: (id: string | null) => void
}

const DossierContext = createContext<DossierContextType | undefined>(undefined)

export function DossierProvider({ children }: { children: ReactNode }) {
  const [activeDossierId, setActiveDossierIdState] = useState<string | null>(null)

  // Load from localStorage on mount
  useEffect(() => {
    const stored = localStorage.getItem('activeDossierId')
    if (stored) setActiveDossierIdState(stored)
  }, [])

  // Save to localStorage when changes
  const setActiveDossierId = (id: string | null) => {
    setActiveDossierIdState(id)
    if (id) {
      localStorage.setItem('activeDossierId', id)
    } else {
      localStorage.removeItem('activeDossierId')
    }
  }

  return (
    <DossierContext.Provider value={{ activeDossierId, setActiveDossierId }}>
      {children}
    </DossierContext.Provider>
  )
}

export function useDossier() {
  const context = useContext(DossierContext)
  if (!context) {
    throw new Error('useDossier must be used within DossierProvider')
  }
  return context
}

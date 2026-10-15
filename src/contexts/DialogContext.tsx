import { createContext, useContext, useState, useCallback, type ReactNode } from 'react'
import { ConfirmDialog } from '@/components/ui/ConfirmDialog'
import { AlertDialog } from '@/components/ui/AlertDialog'

interface DialogContextType {
  confirm: (options: ConfirmOptions) => Promise<boolean>
  alert: (options: AlertOptions) => Promise<void>
}

interface ConfirmOptions {
  title: string
  message: string
  confirmText?: string
  cancelText?: string
  variant?: 'normal' | 'danger'
}

interface AlertOptions {
  title: string
  message: string
  variant?: 'error' | 'warning' | 'success' | 'info'
  actionText?: string
}

const DialogContext = createContext<DialogContextType | undefined>(undefined)

export function DialogProvider({ children }: { children: ReactNode }) {
  const [confirmState, setConfirmState] = useState<{
    isOpen: boolean
    options: ConfirmOptions
    resolve: ((value: boolean) => void) | null
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  })

  const [alertState, setAlertState] = useState<{
    isOpen: boolean
    options: AlertOptions
    resolve: ((value: void) => void) | null
  }>({
    isOpen: false,
    options: { title: '', message: '' },
    resolve: null,
  })

  const confirm = useCallback((options: ConfirmOptions): Promise<boolean> => {
    return new Promise((resolve) => {
      setConfirmState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const alert = useCallback((options: AlertOptions): Promise<void> => {
    return new Promise((resolve) => {
      setAlertState({
        isOpen: true,
        options,
        resolve,
      })
    })
  }, [])

  const handleConfirmClose = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(false)
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }, [confirmState.resolve])

  const handleConfirmConfirm = useCallback(() => {
    if (confirmState.resolve) {
      confirmState.resolve(true)
    }
    setConfirmState((prev) => ({ ...prev, isOpen: false }))
  }, [confirmState.resolve])

  const handleAlertClose = useCallback(() => {
    if (alertState.resolve) {
      alertState.resolve()
    }
    setAlertState((prev) => ({ ...prev, isOpen: false }))
  }, [alertState.resolve])

  return (
    <DialogContext.Provider value={{ confirm, alert }}>
      {children}

      <ConfirmDialog
        isOpen={confirmState.isOpen}
        onClose={handleConfirmClose}
        onConfirm={handleConfirmConfirm}
        title={confirmState.options.title}
        message={confirmState.options.message}
        confirmText={confirmState.options.confirmText}
        cancelText={confirmState.options.cancelText}
        variant={confirmState.options.variant}
      />

      <AlertDialog
        isOpen={alertState.isOpen}
        onClose={handleAlertClose}
        title={alertState.options.title}
        message={alertState.options.message}
        variant={alertState.options.variant}
        actionText={alertState.options.actionText}
        onAction={handleAlertClose}
      />
    </DialogContext.Provider>
  )
}

export function useConfirm() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useConfirm must be used within DialogProvider')
  }
  return context.confirm
}

export function useAlert() {
  const context = useContext(DialogContext)
  if (!context) {
    throw new Error('useAlert must be used within DialogProvider')
  }
  return context.alert
}

import { forwardRef, type HTMLAttributes, type ReactNode, useEffect } from 'react'
import { X, AlertCircle } from 'lucide-react'
import { clsx } from 'clsx'

interface ConfirmDialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  onConfirm: () => void
  title: string
  message: ReactNode
  confirmText?: string
  cancelText?: string
  variant?: 'normal' | 'danger'
  isLoading?: boolean
}

export const ConfirmDialog = forwardRef<HTMLDivElement, ConfirmDialogProps>(
  (
    {
      isOpen,
      onClose,
      onConfirm,
      title,
      message,
      confirmText = 'Confirmer',
      cancelText = 'Annuler',
      variant = 'normal',
      isLoading = false,
      className,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      const handleKeyDown = (e: KeyboardEvent) => {
        if (e.key === 'Escape' && isOpen) {
          onClose()
        }
      }

      if (isOpen) {
        document.body.style.overflow = 'hidden'
        document.addEventListener('keydown', handleKeyDown)
      }

      return () => {
        document.body.style.overflow = 'unset'
        document.removeEventListener('keydown', handleKeyDown)
      }
    }, [isOpen, onClose])

    if (!isOpen) return null

    const isDanger = variant === 'danger'

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Dialog */}
        <div
          ref={ref}
          className={clsx(
            'relative bg-[var(--card)] border border-[var(--border)] rounded-[20px] shadow-lg p-6 w-96 max-h-[90vh] overflow-y-auto',
            className
          )}
          role="alertdialog"
          aria-modal="true"
          aria-labelledby="confirm-title"
          {...props}
        >
          {/* Header with icon */}
          <div className="flex items-start gap-4 mb-4">
            {isDanger && (
              <div className="flex-shrink-0 p-2 rounded-lg bg-[var(--danger)] bg-opacity-10">
                <AlertCircle className="w-6 h-6 text-[var(--danger)]" />
              </div>
            )}
            <div className="flex-1 min-w-0">
              <h2 id="confirm-title" className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-[var(--input)] rounded-lg transition-colors"
              aria-label="Fermer"
              disabled={isLoading}
            >
              <X className="w-5 h-5 text-[var(--muted)]" />
            </button>
          </div>

          {/* Message */}
          <div className="mb-6 text-sm text-[var(--foreground)]">
            {message}
          </div>

          {/* Actions */}
          <div className="flex gap-2 justify-end pt-4 border-t border-[var(--border)]">
            <button
              onClick={onClose}
              disabled={isLoading}
              className="px-4 py-2 rounded-lg border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--input)] transition-colors disabled:opacity-50 disabled:cursor-not-allowed font-medium text-sm"
              autoFocus
            >
              {cancelText}
            </button>
            <button
              onClick={onConfirm}
              disabled={isLoading}
              className={clsx(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors disabled:opacity-50 disabled:cursor-not-allowed text-white',
                isDanger
                  ? 'bg-[var(--danger)] hover:bg-[var(--danger)] hover:opacity-90'
                  : 'bg-[var(--primary)] hover:bg-[var(--primary)] hover:opacity-90'
              )}
            >
              {isLoading ? 'En cours...' : confirmText}
            </button>
          </div>
        </div>
      </div>
    )
  }
)

ConfirmDialog.displayName = 'ConfirmDialog'

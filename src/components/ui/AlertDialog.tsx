import { forwardRef, type HTMLAttributes, type ReactNode, useEffect } from 'react'
import { X, AlertCircle, AlertTriangle, CheckCircle2, Info } from 'lucide-react'
import { clsx } from 'clsx'

interface AlertDialogProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  title: string
  message: ReactNode
  variant?: 'error' | 'warning' | 'success' | 'info'
  actionText?: string
  onAction?: () => void
}

const VARIANT_CONFIG = {
  error: {
    icon: AlertCircle,
    bgColor: 'bg-[var(--danger)] bg-opacity-10',
    iconColor: 'text-[var(--danger)]',
    actionColor: 'bg-[var(--danger)] hover:opacity-90',
  },
  warning: {
    icon: AlertTriangle,
    bgColor: 'bg-[var(--warning)] bg-opacity-10',
    iconColor: 'text-[var(--warning)]',
    actionColor: 'bg-[var(--warning)] hover:opacity-90',
  },
  success: {
    icon: CheckCircle2,
    bgColor: 'bg-[var(--success)] bg-opacity-10',
    iconColor: 'text-[var(--success)]',
    actionColor: 'bg-[var(--success)] hover:opacity-90',
  },
  info: {
    icon: Info,
    bgColor: 'bg-[var(--info)] bg-opacity-10',
    iconColor: 'text-[var(--info)]',
    actionColor: 'bg-[var(--info)] hover:opacity-90',
  },
}

export const AlertDialog = forwardRef<HTMLDivElement, AlertDialogProps>(
  (
    {
      isOpen,
      onClose,
      title,
      message,
      variant = 'info',
      actionText = 'Fermer',
      onAction,
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

    const config = VARIANT_CONFIG[variant]
    const Icon = config.icon

    const handleAction = () => {
      onAction?.()
      onClose()
    }

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
          aria-labelledby="alert-title"
          {...props}
        >
          {/* Header with icon */}
          <div className="flex items-start gap-4 mb-4">
            <div className={clsx('flex-shrink-0 p-2 rounded-lg', config.bgColor)}>
              <Icon className={clsx('w-6 h-6', config.iconColor)} />
            </div>
            <div className="flex-1 min-w-0">
              <h2 id="alert-title" className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
            </div>
            <button
              onClick={onClose}
              className="flex-shrink-0 p-1 hover:bg-[var(--input)] rounded-lg transition-colors"
              aria-label="Fermer"
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
              onClick={handleAction}
              autoFocus
              className={clsx(
                'px-4 py-2 rounded-lg font-medium text-sm transition-colors text-white',
                config.actionColor
              )}
            >
              {actionText}
            </button>
          </div>
        </div>
      </div>
    )
  }
)

AlertDialog.displayName = 'AlertDialog'

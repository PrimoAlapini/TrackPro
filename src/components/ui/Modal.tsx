import { forwardRef, type HTMLAttributes, type ReactNode, useEffect } from 'react'
import { X } from 'lucide-react'
import { clsx } from 'clsx'

interface ModalProps extends HTMLAttributes<HTMLDivElement> {
  isOpen: boolean
  onClose: () => void
  children: ReactNode
  title?: string
  size?: 'sm' | 'md' | 'lg'
}

export const Modal = forwardRef<HTMLDivElement, ModalProps>(
  (
    {
      isOpen,
      onClose,
      children,
      title,
      size = 'md',
      className,
      ...props
    },
    ref
  ) => {
    useEffect(() => {
      if (isOpen) {
        document.body.style.overflow = 'hidden'
      } else {
        document.body.style.overflow = 'unset'
      }

      return () => {
        document.body.style.overflow = 'unset'
      }
    }, [isOpen])

    if (!isOpen) return null

    const sizeClasses = {
      sm: 'w-96',
      md: 'w-[540px]',
      lg: 'w-[640px]',
    }

    return (
      <div className="fixed inset-0 z-50 flex items-center justify-center">
        {/* Backdrop */}
        <div
          className="absolute inset-0 bg-black/50 transition-opacity"
          onClick={onClose}
        />

        {/* Modal */}
        <div
          ref={ref}
          className={clsx(
            'relative bg-[var(--card)] border border-[var(--border)] rounded-[20px] shadow-lg p-6 max-h-[90vh] overflow-y-auto',
            sizeClasses[size],
            className
          )}
          role="dialog"
          aria-modal="true"
          aria-labelledby={title ? 'modal-title' : undefined}
          {...props}
        >
          {/* Header */}
          {title && (
            <div className="flex items-center justify-between mb-4">
              <h2 id="modal-title" className="text-lg font-semibold text-[var(--foreground)]">
                {title}
              </h2>
              <button
                onClick={onClose}
                className="p-1 hover:bg-[var(--input)] rounded-lg transition-colors"
                aria-label="Fermer"
              >
                <X className="w-5 h-5 text-[var(--muted)]" />
              </button>
            </div>
          )}

          {/* Content */}
          {children}
        </div>
      </div>
    )
  }
)

Modal.displayName = 'Modal'

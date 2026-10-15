import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface EmptyStateProps extends HTMLAttributes<HTMLDivElement> {
  icon?: ReactNode
  title: string
  description?: string
  action?: ReactNode
}

export const EmptyState = forwardRef<HTMLDivElement, EmptyStateProps>(
  ({ icon, title, description, action, className, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'flex flex-col items-center justify-center py-12 px-4 text-center',
        className
      )}
      {...props}
    >
      {icon && <div className="mb-4 text-[var(--muted)]">{icon}</div>}
      <h3 className="text-lg font-semibold text-[var(--foreground)] mb-2">
        {title}
      </h3>
      {description && (
        <p className="text-sm text-[var(--muted)] mb-6 max-w-sm">
          {description}
        </p>
      )}
      {action && <div>{action}</div>}
    </div>
  )
)

EmptyState.displayName = 'EmptyState'

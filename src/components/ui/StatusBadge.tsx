import { forwardRef, type HTMLAttributes } from 'react'
import { CheckCircle, Clock, XCircle } from 'lucide-react'
import { clsx } from 'clsx'

type Status = 'deposee' | 'en_cours' | 'non_deposee'

interface StatusBadgeProps extends HTMLAttributes<HTMLDivElement> {
  status: Status
}

export const StatusBadge = forwardRef<HTMLDivElement, StatusBadgeProps>(
  ({ status, className, ...props }, ref) => {
    const statusConfig: Record<
      Status,
      {
        label: string
        icon: React.ReactNode
        fgColor: string
        bgColor: string
      }
    > = {
      deposee: {
        label: 'Déposée',
        icon: <CheckCircle className="w-4 h-4" />,
        fgColor: 'text-[var(--badge-success-fg)]',
        bgColor: 'bg-[var(--badge-success-bg)]',
      },
      en_cours: {
        label: 'En cours',
        icon: <Clock className="w-4 h-4" />,
        fgColor: 'text-[var(--badge-progress-fg)]',
        bgColor: 'bg-[var(--badge-progress-bg)]',
      },
      non_deposee: {
        label: 'Non déposée',
        icon: <XCircle className="w-4 h-4" />,
        fgColor: 'text-[var(--badge-danger-fg)]',
        bgColor: 'bg-[var(--badge-danger-bg)]',
      },
    }

    const config = statusConfig[status]

    return (
      <div
        ref={ref}
        className={clsx(
          'inline-flex items-center gap-2 px-3 py-1 rounded-full text-sm font-medium',
          config.bgColor,
          config.fgColor,
          className
        )}
        {...props}
      >
        {config.icon}
        {config.label}
      </div>
    )
  }
)

StatusBadge.displayName = 'StatusBadge'

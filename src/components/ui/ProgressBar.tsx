import { forwardRef, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface ProgressBarProps extends HTMLAttributes<HTMLDivElement> {
  value: number // 0-100
  color?: 'success' | 'secondary' | 'primary' | 'warning'
}

export const ProgressBar = forwardRef<HTMLDivElement, ProgressBarProps>(
  ({ value, color = 'primary', className, ...props }, ref) => {
    const colorClasses = {
      success: 'bg-[var(--success)]',
      secondary: 'bg-[var(--secondary)]',
      primary: 'bg-[var(--primary)]',
      warning: 'bg-[var(--warning)]',
    }

    const percentage = Math.min(Math.max(value, 0), 100)

    return (
      <div
        ref={ref}
        className={clsx(
          'w-full h-[7px] bg-[var(--track)] rounded-full overflow-hidden',
          className
        )}
        {...props}
      >
        <div
          className={clsx('h-full rounded-full transition-all duration-300', colorClasses[color])}
          style={{ width: `${percentage}%` }}
        />
      </div>
    )
  }
)

ProgressBar.displayName = 'ProgressBar'

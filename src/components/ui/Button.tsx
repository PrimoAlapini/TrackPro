import { forwardRef, type ButtonHTMLAttributes, type ReactNode } from 'react'
import { cva, type VariantProps } from 'class-variance-authority'
import { clsx } from 'clsx'
import { Spinner } from './Spinner'

const buttonVariants = cva(
  'inline-flex items-center justify-center font-medium transition-colors focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-offset-2 disabled:opacity-50 disabled:cursor-not-allowed gap-2',
  {
    variants: {
      variant: {
        primary:
          'bg-[var(--primary)] text-white hover:bg-opacity-90 focus-visible:ring-[var(--primary)]',
        secondary:
          'border border-[var(--border)] bg-transparent text-[var(--foreground)] hover:bg-[var(--input)] focus-visible:ring-[var(--primary)]',
        danger:
          'bg-[var(--danger)] text-white hover:bg-opacity-90 focus-visible:ring-[var(--danger)]',
      },
      size: {
        sm: 'h-9 px-3 text-sm rounded-lg',
        md: 'h-11 px-4 text-sm rounded-lg',
        lg: 'h-12 px-6 text-base rounded-xl',
      },
    },
    defaultVariants: {
      variant: 'primary',
      size: 'md',
    },
  }
)

interface ButtonProps
  extends ButtonHTMLAttributes<HTMLButtonElement>,
    VariantProps<typeof buttonVariants> {
  children: ReactNode
  isLoading?: boolean
  icon?: ReactNode
}

export const Button = forwardRef<HTMLButtonElement, ButtonProps>(
  ({ className, variant, size, isLoading, children, disabled, icon, ...props }, ref) => (
    <button
      ref={ref}
      className={clsx(buttonVariants({ variant, size, className }))}
      disabled={disabled || isLoading}
      {...props}
    >
      {isLoading && <Spinner size="sm" />}
      {!isLoading && icon && icon}
      {children}
    </button>
  )
)

Button.displayName = 'Button'

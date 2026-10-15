import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface InputProps extends InputHTMLAttributes<HTMLInputElement> {}

export const Input = forwardRef<HTMLInputElement, InputProps>(
  ({ className, type, ...props }, ref) => (
    <input
      ref={ref}
      type={type}
      className={clsx(
        'h-[46px] w-full px-4 rounded-[12px] border border-[var(--border)] bg-[var(--input)] text-[var(--foreground)] placeholder:text-[var(--muted)] transition-colors focus:outline-none focus:ring-2 focus:ring-[var(--primary)] focus:ring-offset-0 disabled:opacity-50 disabled:cursor-not-allowed',
        className
      )}
      {...props}
    />
  )
)

Input.displayName = 'Input'

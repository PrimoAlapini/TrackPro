import { forwardRef, type InputHTMLAttributes } from 'react'
import { clsx } from 'clsx'

interface CheckboxProps extends InputHTMLAttributes<HTMLInputElement> {
  label?: string
}

export const Checkbox = forwardRef<HTMLInputElement, CheckboxProps>(
  ({ className, label, ...props }, ref) => (
    <div className="flex items-center gap-2">
      <input
        ref={ref}
        type="checkbox"
        className={clsx(
          'w-4 h-4 rounded border border-[var(--border)] bg-[var(--input)] text-[var(--primary)] cursor-pointer focus:ring-2 focus:ring-[var(--primary)] accent-[var(--primary)]',
          className
        )}
        {...props}
      />
      {label && <label className="text-sm text-[var(--foreground)]">{label}</label>}
    </div>
  )
)

Checkbox.displayName = 'Checkbox'

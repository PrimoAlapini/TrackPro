import { forwardRef, type HTMLAttributes } from 'react'
import { clsx } from 'clsx'

const colorMap: Record<string, { bg: string; text: string }> = {
  primary: {
    bg: 'bg-[var(--primary)]',
    text: 'text-white',
  },
  secondary: {
    bg: 'bg-[var(--secondary)]',
    text: 'text-[#0F172A]',
  },
  success: {
    bg: 'bg-[var(--success)]',
    text: 'text-[#0F172A]',
  },
  warning: {
    bg: 'bg-[var(--warning)]',
    text: 'text-[#0F172A]',
  },
}

interface AvatarProps extends HTMLAttributes<HTMLDivElement> {
  initials: string
  color?: keyof typeof colorMap
  size?: 'sm' | 'md' | 'lg'
}

export const Avatar = forwardRef<HTMLDivElement, AvatarProps>(
  ({ initials, color = 'primary', size = 'md', className, ...props }, ref) => {
    const colors = colorMap[color] || colorMap.primary
    const sizeClasses = {
      sm: 'h-8 w-8 text-xs',
      md: 'h-10 w-10 text-sm',
      lg: 'h-12 w-12 text-base',
    }

    return (
      <div
        ref={ref}
        className={clsx(
          'inline-flex items-center justify-center font-semibold rounded-full',
          colors.bg,
          colors.text,
          sizeClasses[size],
          className
        )}
        {...props}
      >
        {initials.toUpperCase()}
      </div>
    )
  }
)

Avatar.displayName = 'Avatar'

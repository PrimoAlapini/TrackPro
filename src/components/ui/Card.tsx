import { forwardRef, type HTMLAttributes, type ReactNode } from 'react'
import { clsx } from 'clsx'

interface CardProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const Card = forwardRef<HTMLDivElement, CardProps>(
  ({ className, children, ...props }, ref) => (
    <div
      ref={ref}
      className={clsx(
        'bg-[var(--card)] border border-[var(--border)] rounded-[16px] p-5',
        className
      )}
      {...props}
    >
      {children}
    </div>
  )
)

Card.displayName = 'Card'

interface CardHeaderProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardHeader = forwardRef<HTMLDivElement, CardHeaderProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('pb-4 border-b border-[var(--border)]', className)} {...props}>
      {children}
    </div>
  )
)

CardHeader.displayName = 'CardHeader'

interface CardTitleProps extends HTMLAttributes<HTMLHeadingElement> {
  children: ReactNode
}

export const CardTitle = forwardRef<HTMLHeadingElement, CardTitleProps>(
  ({ className, children, ...props }, ref) => (
    <h2
      ref={ref}
      className={clsx(
        'text-[17px] font-semibold text-[var(--foreground)]',
        className
      )}
      {...props}
    >
      {children}
    </h2>
  )
)

CardTitle.displayName = 'CardTitle'

interface CardContentProps extends HTMLAttributes<HTMLDivElement> {
  children: ReactNode
}

export const CardContent = forwardRef<HTMLDivElement, CardContentProps>(
  ({ className, children, ...props }, ref) => (
    <div ref={ref} className={clsx('space-y-4', className)} {...props}>
      {children}
    </div>
  )
)

CardContent.displayName = 'CardContent'

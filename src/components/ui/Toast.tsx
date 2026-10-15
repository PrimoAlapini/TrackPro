import { useEffect, useState } from 'react'
import { AlertCircle, CheckCircle, XCircle } from 'lucide-react'

export type ToastType = 'success' | 'error' | 'info'

export interface ToastProps {
  type: ToastType
  message: string
  duration?: number
  onClose?: () => void
}

const icons: Record<ToastType, React.ReactNode> = {
  success: <CheckCircle className="w-5 h-5" />,
  error: <XCircle className="w-5 h-5" />,
  info: <AlertCircle className="w-5 h-5" />,
}

const colors: Record<ToastType, string> = {
  success: 'bg-[var(--success)] text-white',
  error: 'bg-[var(--danger)] text-white',
  info: 'bg-[var(--primary)] text-white',
}

export function Toast({
  type,
  message,
  duration = 5000,
  onClose,
}: ToastProps) {
  const [isVisible, setIsVisible] = useState(true)

  useEffect(() => {
    const timer = setTimeout(() => {
      setIsVisible(false)
      onClose?.()
    }, duration)

    return () => clearTimeout(timer)
  }, [duration, onClose])

  if (!isVisible) return null

  return (
    <div
      className={`fixed bottom-4 right-4 ${colors[type]} px-4 py-3 rounded-lg shadow-lg flex items-center gap-3 animate-slideIn z-50`}
      role="alert"
    >
      {icons[type]}
      <span className="text-sm font-medium">{message}</span>
    </div>
  )
}

import { useState, useCallback, useEffect } from 'react'
import { IconCheck, IconX, IconAlertTriangle, IconInfoCircle } from '@tabler/icons-react'

const icons = {
  success: <IconCheck size={18} className="text-green-500" />,
  error: <IconX size={18} className="text-red-500" />,
  warning: <IconAlertTriangle size={18} className="text-amber-500" />,
  info: <IconInfoCircle size={18} className="text-blue-500" />,
}

const colors = {
  success: 'border-l-green-500',
  error: 'border-l-red-500',
  warning: 'border-l-amber-500',
  info: 'border-l-blue-500',
}

let toastFn = null

export function ToastContainer() {
  const [toasts, setToasts] = useState([])

  useEffect(() => {
    toastFn = (msg, type = 'info', duration = 3500) => {
      const id = Date.now()
      setToasts(prev => [...prev, { id, msg, type }])
      setTimeout(() => setToasts(prev => prev.filter(t => t.id !== id)), duration)
    }
    return () => { toastFn = null }
  }, [])

  return (
    <div className="fixed bottom-20 sm:bottom-6 right-4 z-[100] flex flex-col gap-2 pointer-events-none">
      {toasts.map(t => (
        <div key={t.id} className={`bg-white shadow-lg rounded-xl border-l-4 ${colors[t.type]} px-4 py-3 flex items-center gap-3 min-w-[240px] max-w-[320px] pointer-events-auto animate-in slide-in-from-right`}>
          {icons[t.type]}
          <span className="text-sm font-medium text-gray-800">{t.msg}</span>
        </div>
      ))}
    </div>
  )
}

export const toast = {
  success: (msg) => toastFn?.(msg, 'success'),
  error: (msg) => toastFn?.(msg, 'error'),
  warning: (msg) => toastFn?.(msg, 'warning'),
  info: (msg) => toastFn?.(msg, 'info'),
}

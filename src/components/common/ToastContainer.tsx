'use client'

import { useState, useEffect, useCallback } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { setToastHandlers, type Toast, type ToastType } from '@/src/lib/toast'

interface ToastItem extends Toast {
  id: string
}

export default function ToastContainer() {
  const [toasts, setToasts] = useState<ToastItem[]>([])

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id))
  }, [])

  const showToast = useCallback(
    (toastData: Toast) => {
      const id = toastData.id
      setToasts((prev) => [...prev, toastData])

      if (toastData.duration !== Infinity) {
        const timer = setTimeout(() => {
          removeToast(id)
        }, toastData.duration ?? 3000)
        return () => clearTimeout(timer)
      }
      return undefined
    },
    [removeToast]
  )

  useEffect(() => {
    setToastHandlers(showToast, removeToast)
  }, [showToast, removeToast])

  const toastBgColor: Record<ToastType, string> = {
    success: 'bg-green-500',
    error: 'bg-red-500',
    info: 'bg-blue-500',
    warning: 'bg-yellow-500',
  }

  const toastIcon: Record<ToastType, string> = {
    success: '✓',
    error: '✕',
    info: 'ⓘ',
    warning: '⚠',
  }

  return (
    <div className="fixed bottom-4 right-4 z-50 pointer-events-none">
      <AnimatePresence>
        {toasts.map((toast) => (
          <motion.div
            key={toast.id}
            initial={{ opacity: 0, y: 20, x: 400 }}
            animate={{ opacity: 1, y: 0, x: 0 }}
            exit={{ opacity: 0, y: -20, x: 400 }}
            transition={{ duration: 0.3 }}
            className={`${toastBgColor[toast.type]} text-white rounded-lg shadow-lg p-4 mb-3 max-w-sm pointer-events-auto flex items-center gap-3`}
            onClick={() => removeToast(toast.id)}
            role="alert"
            aria-live="polite"
          >
            <span className="text-lg font-bold">{toastIcon[toast.type]}</span>
            <span className="flex-1">{toast.message}</span>
            <button
              onClick={(e) => {
                e.stopPropagation()
                removeToast(toast.id)
              }}
              className="text-white opacity-75 hover:opacity-100"
              aria-label="Close notification"
            >
              ✕
            </button>
          </motion.div>
        ))}
      </AnimatePresence>
    </div>
  )
}

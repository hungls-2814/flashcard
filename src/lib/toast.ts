import { ReactNode } from 'react'

export type ToastType = 'success' | 'error' | 'info' | 'warning'

export interface Toast {
  id: string
  type: ToastType
  message: string | ReactNode
  duration?: number
}

// Toast store (singleton)
let toastId = 0
let showToast: (toast: Toast) => void = () => {}
let removeToast: (id: string) => void = () => {}

export const setToastHandlers = (
  show: (toast: Toast) => void,
  remove: (id: string) => void
) => {
  showToast = show
  removeToast = remove
}

export const toast = {
  success: (message: string | ReactNode, duration = 3000) => {
    const id = `toast-${++toastId}`
    showToast({ id, type: 'success', message, duration })
    return id
  },
  error: (message: string | ReactNode, duration = 5000) => {
    const id = `toast-${++toastId}`
    showToast({ id, type: 'error', message, duration })
    return id
  },
  info: (message: string | ReactNode, duration = 3000) => {
    const id = `toast-${++toastId}`
    showToast({ id, type: 'info', message, duration })
    return id
  },
  warning: (message: string | ReactNode, duration = 4000) => {
    const id = `toast-${++toastId}`
    showToast({ id, type: 'warning', message, duration })
    return id
  },
  dismiss: (id: string) => removeToast(id),
}

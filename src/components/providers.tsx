'use client'

import { ReactNode } from 'react'
import ToastContainer from '@/src/components/common/ToastContainer'

export default function ClientProviders({ children }: { children: ReactNode }) {
  return (
    <>
      {children}
      <ToastContainer />
    </>
  )
}

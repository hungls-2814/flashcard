'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'

interface StudyControlsProps {
  onQuality: (quality: 0 | 1 | 2 | 4 | 5) => void
  disabled?: boolean
  loading?: boolean
}

const qualityButtons = [
  {
    quality: 0,
    label: 'Again',
    description: 'Forgot it',
    color: 'bg-red-500 hover:bg-red-600 focus:ring-red-500',
    shortcut: '1',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M16.023 9.348h4.992v-.001M2.985 19.644v-4.992m0 0h4.992m-4.993 0l3.181 3.183a8.25 8.25 0 0013.803-3.7M4.031 9.865a8.25 8.25 0 0113.803-3.7l3.181 3.182m0-4.991v4.99" />
      </svg>
    ),
    ariaLabel: 'Answer: Again - I forgot this (keyboard: 1)',
  },
  {
    quality: 1,
    label: 'Hard',
    description: 'Struggled',
    color: 'bg-orange-500 hover:bg-orange-600 focus:ring-orange-500',
    shortcut: '2',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M12 9v3.75m-9.303 3.376c-.866 1.5.217 3.374 1.948 3.374h14.71c1.73 0 2.813-1.874 1.948-3.374L13.949 3.378c-.866-1.5-3.032-1.5-3.898 0L2.697 16.126zM12 15.75h.007v.008H12v-.008z" />
      </svg>
    ),
    ariaLabel: 'Answer: Hard - This was difficult (keyboard: 2)',
  },
  {
    quality: 4,
    label: 'Good',
    description: 'Recalled',
    color: 'bg-indigo-500 hover:bg-indigo-600 focus:ring-indigo-500',
    shortcut: '4',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
      </svg>
    ),
    ariaLabel: 'Answer: Good - I remembered this (keyboard: 4)',
  },
  {
    quality: 5,
    label: 'Easy',
    description: 'Instant',
    color: 'bg-emerald-500 hover:bg-emerald-600 focus:ring-emerald-500',
    shortcut: '5',
    icon: (
      <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
        <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
      </svg>
    ),
    ariaLabel: 'Answer: Easy - This was very easy (keyboard: 5)',
  },
]

export default function StudyControls({
  onQuality,
  disabled = false,
  loading = false,
}: StudyControlsProps) {
  useEffect(() => {
    const handleKeyPress = (e: KeyboardEvent) => {
      if (disabled || loading) return
      
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (e.key === '1') {
        e.preventDefault()
        onQuality(0)
      } else if (e.key === '2') {
        e.preventDefault()
        onQuality(1)
      } else if (e.key === '4') {
        e.preventDefault()
        onQuality(4)
      } else if (e.key === '5') {
        e.preventDefault()
        onQuality(5)
      }
    }

    window.addEventListener('keydown', handleKeyPress)
    return () => window.removeEventListener('keydown', handleKeyPress)
  }, [onQuality, disabled, loading])

  return (
    <div className="space-y-6" role="region" aria-label="Study controls">
      <div>
        <h3 className="text-2xl font-bold text-gray-900 mb-2">How easy was it to recall?</h3>
        <p className="text-sm text-gray-600">
          Choose based on how quickly and confidently you remembered the answer
        </p>
      </div>

      <div
        className="grid grid-cols-2 md:grid-cols-4 gap-4"
        role="group"
        aria-label="Quality response options"
      >
        {qualityButtons.map((btn, idx) => (
          <motion.button
            key={btn.quality}
            onClick={() => onQuality(btn.quality as any)}
            disabled={disabled || loading}
            initial={{ opacity: 0, scale: 0.9 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: idx * 0.05 }}
            whileHover={{ scale: 1.03, y: -2 }}
            whileTap={{ scale: 0.97 }}
            className={`relative flex cursor-pointer flex-col items-center justify-center gap-2 rounded-2xl px-4 py-5 text-white shadow-md transition-all hover:shadow-lg focus:outline-none focus:ring-2 focus:ring-offset-2 disabled:cursor-not-allowed disabled:opacity-50 ${btn.color}`}
            title={`${btn.label} (press ${btn.shortcut})`}
            aria-label={btn.ariaLabel}
          >
            {btn.icon}
            <div className="text-center">
              <div className="text-sm font-bold">{btn.label}</div>
              <div className="text-xs opacity-80">{btn.description}</div>
            </div>
            <kbd className="absolute right-2 top-2 rounded-md bg-white/20 px-1.5 py-0.5 font-mono text-xs">{btn.shortcut}</kbd>
          </motion.button>
        ))}
      </div>

      <div className="flex items-start gap-3 rounded-xl border border-indigo-200 bg-indigo-50 p-4">
        <svg className="mt-0.5 h-5 w-5 flex-shrink-0 text-indigo-500" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M6.75 7.5l3 2.25-3 2.25m4.5 0h3m-9 8.25h13.5A2.25 2.25 0 0021 18V6a2.25 2.25 0 00-2.25-2.25H5.25A2.25 2.25 0 003 6v12a2.25 2.25 0 002.25 2.25z" />
        </svg>
        <div>
          <p className="font-semibold text-indigo-900 text-sm">Keyboard Shortcuts</p>
          <p className="text-xs text-indigo-700 mt-1">
            Press <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono">1</kbd> (Again),
            <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono ml-1">2</kbd> (Hard),
            <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono ml-1">4</kbd> (Good), or
            <kbd className="px-2 py-0.5 bg-white border border-blue-300 rounded text-xs font-mono ml-1">5</kbd> (Easy)
          </p>
        </div>
      </div>
    </div>
  )
}

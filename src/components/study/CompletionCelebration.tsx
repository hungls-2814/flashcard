'use client'

import { useEffect } from 'react'
import { motion } from 'framer-motion'
import Link from 'next/link'
import confetti from 'canvas-confetti'

interface CompletionCelebrationProps {
  show: boolean
  cardCount: number
  sessionDuration?: number | undefined // in seconds
}

export default function CompletionCelebration({
  show,
  cardCount,
  sessionDuration,
}: CompletionCelebrationProps) {
  useEffect(() => {
    if (!show) return

    // Trigger multiple confetti bursts
    const duration = 3 * 1000
    const animationEnd = Date.now() + duration
    const defaults = { startVelocity: 30, spread: 360, ticks: 60, zIndex: 0 }

    const randomInRange = (min: number, max: number) => {
      return Math.random() * (max - min) + min
    }

    const interval = setInterval(() => {
      const timeLeft = animationEnd - Date.now()
      if (timeLeft <= 0) {
        return clearInterval(interval)
      }

      const particleCount = Math.ceil((timeLeft / duration) * 100)
      confetti(
        Object.assign({}, defaults, {
          particleCount,
          origin: { x: randomInRange(0.1, 0.9), y: Math.random() - 0.2 },
        })
      )
    }, 250)

    return () => clearInterval(interval)
  }, [show])

  if (!show) return null

  const minutes = sessionDuration ? Math.floor(sessionDuration / 60) : 0
  const seconds = sessionDuration ? sessionDuration % 60 : 0
  const avgPerCard = sessionDuration ? Math.round(sessionDuration / cardCount) : 0

  return (
    <div className="fixed inset-0 bg-black/40 backdrop-blur-sm flex items-center justify-center z-50 p-4">
      <motion.div
        initial={{ opacity: 0, scale: 0.5, rotateZ: -10 }}
        animate={{ opacity: 1, scale: 1, rotateZ: 0 }}
        exit={{ opacity: 0, scale: 0.5 }}
        transition={{ type: 'spring', stiffness: 100, damping: 15 }}
        className="bg-white rounded-3xl shadow-2xl p-8 max-w-md w-full overflow-hidden"
      >
        {/* Animated Background */}
        <div className="absolute inset-0 bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 opacity-50" />

        {/* Content */}
        <div className="relative z-10 space-y-8">
          {/* Celebration Icon */}
          <motion.div
            animate={{ scale: [1, 1.2, 1], rotate: [0, 10, -10, 0] }}
            transition={{ duration: 2, repeat: Infinity }}
            className="text-7xl text-center"
          >
            🎉
          </motion.div>

          {/* Title */}
          <div className="text-center space-y-2">
            <h2 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-emerald-600 bg-clip-text text-transparent">
              Perfect!
            </h2>
            <p className="text-gray-600 text-lg">
              You&apos;ve completed your study session
            </p>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-3 gap-4">
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2 }}
              className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4 text-center border border-blue-200"
            >
              <p className="text-sm font-semibold text-blue-600 uppercase">Cards</p>
              <p className="text-3xl font-bold text-blue-900 mt-2">{cardCount}</p>
            </motion.div>

            {sessionDuration !== undefined && (
              <>
                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.3 }}
                  className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4 text-center border border-green-200"
                >
                  <p className="text-sm font-semibold text-green-600 uppercase">Time</p>
                  <p className="text-2xl font-bold text-green-900 mt-2">
                    {minutes}:{seconds.toString().padStart(2, '0')}
                  </p>
                </motion.div>

                <motion.div
                  initial={{ opacity: 0, y: 20 }}
                  animate={{ opacity: 1, y: 0 }}
                  transition={{ delay: 0.4 }}
                  className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4 text-center border border-purple-200"
                >
                  <p className="text-sm font-semibold text-purple-600 uppercase">Avg</p>
                  <p className="text-2xl font-bold text-purple-900 mt-2">
                    {avgPerCard}s
                  </p>
                </motion.div>
              </>
            )}
          </div>

          {/* Motivational Message */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
            className="bg-amber-50 border-l-4 border-amber-400 p-4 rounded"
          >
            <p className="text-sm text-amber-900 font-medium">
              💡 Great effort! Keep this up and you&apos;ll master these concepts in no time.
            </p>
          </motion.div>

          {/* Action Buttons */}
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.6 }}
            className="space-y-3"
          >
            <Link
              href="/dashboard"
              className="block w-full px-6 py-3 bg-gradient-to-r from-green-600 to-emerald-600 text-white font-bold rounded-xl hover:from-green-700 hover:to-emerald-700 transition-all transform hover:scale-105 active:scale-95 text-center"
            >
              📊 Back to Dashboard
            </Link>
            <button
              onClick={() => window.location.reload()}
              className="w-full px-6 py-3 border-2 border-gray-300 text-gray-700 font-semibold rounded-xl hover:bg-gray-50 transition-all"
            >
              🔄 Study Again
            </button>
          </motion.div>
        </div>
      </motion.div>
    </div>
  )
}

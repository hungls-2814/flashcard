'use client'

import { useState, useEffect } from 'react'
import { motion } from 'framer-motion'
import type { Database } from '@/src/types/database'

type Card = Database['public']['Tables']['cards']['Row']

interface FlashCardProps {
  card: Card | null | undefined
  onFlip?: (isFlipped: boolean) => void
}

export default function FlashCard({ card, onFlip }: FlashCardProps) {
  const [isFlipped, setIsFlipped] = useState(false)

  // Add keyboard support for flipping (Space/Arrow keys) - MUST be before conditional returns
  useEffect(() => {
    if (!card) return

    const handleKeyDown = (e: KeyboardEvent) => {
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA'
      ) {
        return
      }

      if (
        e.key === ' ' ||
        e.key === 'ArrowLeft' ||
        e.key === 'ArrowRight'
      ) {
        e.preventDefault()
        setIsFlipped((prev) => {
          const newFlipped = !prev
          onFlip?.(newFlipped)
          return newFlipped
        })
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [onFlip, card])

  if (!card) {
    return (
      <div className="w-full aspect-video bg-gray-200 rounded-3xl flex items-center justify-center text-gray-600">
        No card loaded
      </div>
    )
  }

  const handleFlip = () => {
    const newFlipped = !isFlipped
    setIsFlipped(newFlipped)
    onFlip?.(newFlipped)
  }

  const front = card.front || 'No question'
  const back = card.back || 'No answer'

  return (
    <motion.div
      initial={{ opacity: 0, scale: 0.9 }}
      animate={{ opacity: 1, scale: 1 }}
      exit={{ opacity: 0, scale: 0.9 }}
      transition={{ duration: 0.3 }}
      className="w-full"
    >
      <motion.div
        onClick={handleFlip}
        onKeyDown={(e) => {
          if (e.key === 'Enter' || e.key === ' ') {
            e.preventDefault()
            handleFlip()
          }
        }}
        role="button"
        tabIndex={0}
        aria-pressed={isFlipped}
        aria-label={`Flashcard. Currently showing ${isFlipped ? 'answer' : 'question'}. Press space or click to flip.`}
        style={{
          perspective: '1000px',
          cursor: 'pointer',
        }}
        className="relative w-full focus:outline-none focus:ring-2 focus:ring-offset-2 focus:ring-blue-500 rounded-3xl group"
        whileHover={{ y: -8 }}
      >
        {/* 3D Flip Container */}
        <motion.div
          animate={{
            rotateY: isFlipped ? 180 : 0,
          }}
          transition={{
            duration: 0.6,
            type: 'spring',
            stiffness: 100,
            damping: 15,
          }}
          style={{
            transformStyle: 'preserve-3d',
            width: '100%',
            height: '100%',
          }}
          className="w-full aspect-video"
        >
          {/* Front Side - Question */}
          <motion.div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
            }}
            className="absolute inset-0 bg-gradient-to-br from-blue-600 via-blue-500 to-purple-600 rounded-3xl shadow-2xl group-hover:shadow-2xl transition-all p-8 md:p-12 flex flex-col items-center justify-center text-white"
          >
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 text-white border border-white/30">
              Question
            </span>

            {/* Content */}
            <p className="text-3xl md:text-4xl font-bold text-center leading-relaxed line-clamp-6 mb-8">
              {front}
            </p>

            {/* Footer hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 text-sm opacity-75 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
              <span>Click or press Space to reveal</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </motion.div>
          </motion.div>

          {/* Back Side - Answer */}
          <motion.div
            style={{
              backfaceVisibility: 'hidden',
              WebkitBackfaceVisibility: 'hidden',
              rotateY: 180,
            }}
            className="absolute inset-0 bg-gradient-to-br from-green-600 via-emerald-500 to-teal-600 rounded-3xl shadow-2xl group-hover:shadow-2xl transition-all p-8 md:p-12 flex flex-col items-center justify-center text-white"
          >
            {/* Badge */}
            <span className="inline-block px-4 py-1.5 bg-white/20 backdrop-blur-sm rounded-full text-sm font-semibold mb-6 text-white border border-white/30">
              Answer
            </span>

            {/* Content */}
            <p className="text-3xl md:text-4xl font-bold text-center leading-relaxed line-clamp-6 mb-8">
              {back}
            </p>

            {/* Footer hint */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.3 }}
              className="absolute bottom-6 left-6 right-6 flex items-center justify-center gap-2 text-sm opacity-75 group-hover:opacity-100 transition-opacity"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
              <span>Click or press Space to hide</span>
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M19.5 13.5L12 21m0 0l-7.5-7.5M12 21V3" />
              </svg>
            </motion.div>
          </motion.div>
        </motion.div>

        {/* Shine Effect on Hover */}
        <div className="absolute inset-0 rounded-3xl bg-gradient-to-r from-transparent via-white to-transparent opacity-0 group-hover:opacity-10 transition-opacity pointer-events-none" />
      </motion.div>

      {/* Status Indicator */}
      <motion.div
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2 }}
        className="flex items-center justify-center gap-2 mt-8 text-gray-600"
      >
        <motion.span
          animate={{ rotate: isFlipped ? 0 : 180 }}
          transition={{ duration: 0.6 }}
          className="text-2xl"
        >
          {isFlipped ? 'Answer shown' : 'Question shown'}
        </motion.span>
      </motion.div>
    </motion.div>
  )
}

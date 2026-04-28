'use client'

import { useState } from 'react'
import Link from 'next/link'
import { motion } from 'framer-motion'
import { deleteDeck } from '@/src/actions/deck.actions'
import type { Database } from '@/src/types/database'

type Deck = Database['public']['Tables']['decks']['Row']

interface DeckCardProps {
  deck: Deck
  cardCount?: number
  dueCount?: number
  onDelete?: () => void
}

export default function DeckCard({
  deck,
  cardCount = 0,
  dueCount = 0,
  onDelete,
}: DeckCardProps) {
  const [isDeleting, setIsDeleting] = useState(false)
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteDeck(deck.id)
      if (result.success) {
        onDelete?.()
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to delete deck')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  const progressPercent = cardCount > 0 ? Math.round((dueCount / cardCount) * 100) : 0

  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      transition={{ duration: 0.3 }}
      className="group relative flex h-full flex-col overflow-hidden rounded-2xl bg-white border border-gray-200 shadow-sm hover:shadow-xl transition-all duration-300"
    >
      {/* Gradient Top Bar */}
      <div 
        className="h-2 w-full"
        style={{ background: `linear-gradient(90deg, ${deck.color_code}, ${deck.color_code}dd)` }}
      />

      {/* Header */}
      <div className="px-6 py-5 pb-4">
        <div className="flex items-start justify-between gap-3 mb-2">
          <div className="flex-1 min-w-0">
            <h3 className="text-xl font-bold text-gray-900 truncate group-hover:text-blue-600 transition-colors">
              {deck.title}
            </h3>
            {deck.description && (
              <p className="text-sm text-gray-600 line-clamp-2 mt-1.5">
                {deck.description}
              </p>
            )}
          </div>
          <div
            className="flex-shrink-0 w-11 h-11 rounded-xl flex items-center justify-center transition-transform group-hover:scale-110"
            style={{ backgroundColor: `${deck.color_code}18` }}
          >
            <svg className="h-5 w-5" style={{ color: deck.color_code }} fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
          </div>
        </div>
      </div>

      {/* Stats Section */}
      <div className="flex-1 px-6 py-4 bg-gradient-to-r from-gray-50 to-transparent border-t border-gray-100 space-y-3">
        <div className="grid grid-cols-2 gap-4">
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Total Cards</div>
            <div className="text-2xl font-bold text-gray-900 mt-1">{cardCount}</div>
          </div>
          <div>
            <div className="text-xs font-semibold text-gray-600 uppercase tracking-wider">Due Today</div>
            <div className="text-2xl font-bold" style={{ color: deck.color_code }}>{dueCount}</div>
          </div>
        </div>

        {/* Progress Bar */}
        {cardCount > 0 && (
          <div className="mt-3">
            <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
              <motion.div
                initial={{ width: 0 }}
                animate={{ width: `${progressPercent}%` }}
                transition={{ duration: 0.8, ease: 'easeOut' }}
                className="h-full rounded-full"
                style={{ background: `linear-gradient(90deg, ${deck.color_code}, ${deck.color_code}dd)` }}
              />
            </div>
            <p className="text-xs text-gray-500 mt-1.5 text-right">
              {progressPercent}% to review
            </p>
          </div>
        )}
      </div>

      {/* Actions */}
      <div className="px-5 py-4 flex items-center gap-2 border-t border-gray-100">
        <Link
          href={`/deck/${deck.id}`}
          className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-700 transition-colors hover:bg-gray-200"
        >
          <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M16.862 4.487l1.687-1.688a1.875 1.875 0 112.652 2.652L10.582 16.07a4.5 4.5 0 01-1.897 1.13L6 18l.8-2.685a4.5 4.5 0 011.13-1.897l8.932-8.931zm0 0L19.5 7.125M18 14v4.75A2.25 2.25 0 0115.75 21H5.25A2.25 2.25 0 013 18.75V8.25A2.25 2.25 0 015.25 6H10" />
          </svg>
          Edit
        </Link>

        {cardCount > 0 ? (
          <Link
            href={`/study/${deck.id}`}
            className="flex flex-1 cursor-pointer items-center justify-center gap-1.5 rounded-xl px-4 py-2.5 text-sm font-semibold text-white transition-all hover:brightness-110"
            style={{ background: `linear-gradient(135deg, ${deck.color_code}, ${deck.color_code}cc)` }}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Study
            {dueCount > 0 && (
              <span className="inline-flex min-w-[1.25rem] items-center justify-center rounded-full bg-white/25 px-1.5 py-0.5 text-xs font-bold">
                {dueCount}
              </span>
            )}
          </Link>
        ) : (
          <button
            disabled
            className="flex flex-1 cursor-not-allowed items-center justify-center gap-1.5 rounded-xl bg-gray-100 px-4 py-2.5 text-sm font-semibold text-gray-400"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M5.25 5.653c0-.856.917-1.398 1.667-.986l11.54 6.348a1.125 1.125 0 010 1.971l-11.54 6.347a1.125 1.125 0 01-1.667-.985V5.653z" />
            </svg>
            Study
          </button>
        )}

        {showDeleteConfirm ? (
          <div className="flex gap-1">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-3 bg-red-600 text-white font-semibold rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors text-sm"
              title="Confirm delete"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.5 12.75l6 6 9-13.5" />
              </svg>
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-2.5 bg-gray-200 text-gray-700 font-semibold rounded-xl hover:bg-gray-300 disabled:opacity-50 transition-colors text-sm cursor-pointer"
              title="Cancel"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M6 18L18 6M6 6l12 12" />
              </svg>
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="cursor-pointer rounded-xl p-2.5 text-gray-400 transition-colors hover:bg-red-50 hover:text-red-500"
            title="Delete deck"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M14.74 9l-.346 9m-4.788 0L9.26 9m9.968-3.21c.342.052.682.107 1.022.166m-1.022-.165L18.16 19.673a2.25 2.25 0 01-2.244 2.077H8.084a2.25 2.25 0 01-2.244-2.077L4.772 5.79m14.456 0a48.108 48.108 0 00-3.478-.397m-12 .562c.34-.059.68-.114 1.022-.165m0 0a48.11 48.11 0 013.478-.397m7.5 0v-.916c0-1.18-.91-2.164-2.09-2.201a51.964 51.964 0 00-3.32 0c-1.18.037-2.09 1.022-2.09 2.201v.916m7.5 0a48.667 48.667 0 00-7.5 0" />
            </svg>
          </button>
        )}
      </div>
    </motion.div>
  )
}

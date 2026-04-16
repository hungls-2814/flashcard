'use client'

import { useState } from 'react'
import Link from 'next/link'
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

  return (
    <div
      className="rounded-lg shadow-sm border border-gray-200 overflow-hidden hover:shadow-md transition-shadow"
      style={{ borderTopColor: deck.color_code, borderTopWidth: '4px' }}
    >
      {/* Header */}
      <div
        className="px-6 py-4"
        style={{
          backgroundColor: `${deck.color_code}15`,
          borderBottomColor: `${deck.color_code}30`,
          borderBottomWidth: '1px',
        }}
      >
        <h3 className="text-lg font-semibold text-gray-900">{deck.title}</h3>
        {deck.description && (
          <p className="text-sm text-gray-600 line-clamp-2 mt-1">
            {deck.description}
          </p>
        )}
      </div>

      {/* Stats */}
      <div className="px-6 py-3 bg-gray-50 border-b border-gray-200 flex items-center gap-6">
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold">Total Cards</p>
          <p className="text-lg font-bold text-gray-900">{cardCount}</p>
        </div>
        <div>
          <p className="text-xs text-gray-600 uppercase font-semibold">Due Today</p>
          <p className="text-lg font-bold text-orange-600">{dueCount}</p>
        </div>
      </div>

      {/* Actions */}
      <div className="px-6 py-4 flex items-center gap-3">
        <Link
          href={`/deck/${deck.id}`}
          className="flex-1 px-4 py-2 bg-blue-600 text-white text-sm font-medium rounded-lg hover:bg-blue-700 transition-colors text-center"
        >
          Manage
        </Link>

        {dueCount > 0 && (
          <Link
            href={`/study/${deck.id}`}
            className="flex-1 px-4 py-2 bg-green-600 text-white text-sm font-medium rounded-lg hover:bg-green-700 transition-colors text-center"
          >
            Study
          </Link>
        )}

        {showDeleteConfirm ? (
          <div className="flex gap-2">
            <button
              onClick={handleDelete}
              disabled={isDeleting}
              className="px-3 py-2 bg-red-600 text-white text-sm font-medium rounded-lg hover:bg-red-700 disabled:opacity-50 transition-colors"
            >
              {isDeleting ? 'Deleting...' : 'Confirm'}
            </button>
            <button
              onClick={() => setShowDeleteConfirm(false)}
              disabled={isDeleting}
              className="px-3 py-2 bg-gray-300 text-gray-900 text-sm font-medium rounded-lg hover:bg-gray-400 disabled:opacity-50 transition-colors"
            >
              Cancel
            </button>
          </div>
        ) : (
          <button
            onClick={() => setShowDeleteConfirm(true)}
            className="px-3 py-2 text-red-600 text-sm font-medium rounded-lg hover:bg-red-50 transition-colors"
          >
            🗑️
          </button>
        )}
      </div>
    </div>
  )
}

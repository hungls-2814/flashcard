'use client'

import { useState } from 'react'
import { deleteCard } from '@/src/actions/card.actions'
import EditCardModal from './EditCardModal'
import type { Database } from '@/src/types/database'

type Card = Database['public']['Tables']['cards']['Row']

interface CardItemProps {
  card: Card
  onDelete: (cardId: string) => void
}

export default function CardItem({ card, onDelete }: CardItemProps) {
  const [showDeleteConfirm, setShowDeleteConfirm] = useState(false)
  const [isDeleting, setIsDeleting] = useState(false)
  const [isEditModalOpen, setIsEditModalOpen] = useState(false)
  const [showBack, setShowBack] = useState(false)

  const handleDelete = async () => {
    setIsDeleting(true)
    try {
      const result = await deleteCard(card.id)
      if (result.success) {
        onDelete(card.id)
      } else {
        alert(`Error: ${result.error}`)
      }
    } catch (error) {
      alert('Failed to delete card')
    } finally {
      setIsDeleting(false)
      setShowDeleteConfirm(false)
    }
  }

  return (
    <>
      <div className="border border-gray-200 rounded-lg shadow-sm hover:shadow-md transition-shadow overflow-hidden">
        {/* Card content */}
        <div
          className="p-4 bg-white cursor-pointer hover:bg-gray-50"
          onClick={() => setShowBack(!showBack)}
        >
          {!showBack ? (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Front</p>
              <p className="text-sm text-gray-900 font-medium line-clamp-3">
                {card.front}
              </p>
            </div>
          ) : (
            <div>
              <p className="text-xs text-gray-500 uppercase font-semibold mb-1">Back</p>
              <p className="text-sm text-gray-900 line-clamp-3">
                {card.back}
              </p>
            </div>
          )}
        </div>

        {/* Actions */}
        <div className="px-4 py-3 bg-gray-50 border-t border-gray-200 flex items-center justify-between">
          <button
            onClick={() => setShowBack(!showBack)}
            className="text-xs text-gray-600 hover:text-gray-900 transition-colors"
          >
            {showBack ? '← Show Front' : 'Show Back →'}
          </button>

          <div className="flex items-center gap-2">
            <button
              onClick={() => setIsEditModalOpen(true)}
              className="px-3 py-1 text-xs font-medium text-blue-600 hover:bg-blue-50 rounded transition-colors"
            >
              Edit
            </button>

            {showDeleteConfirm ? (
              <div className="flex gap-1">
                <button
                  onClick={handleDelete}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs font-medium text-white bg-red-600 hover:bg-red-700 rounded disabled:opacity-50 transition-colors"
                >
                  {isDeleting ? '...' : 'Delete'}
                </button>
                <button
                  onClick={() => setShowDeleteConfirm(false)}
                  disabled={isDeleting}
                  className="px-2 py-1 text-xs font-medium text-gray-600 hover:bg-gray-200 rounded disabled:opacity-50 transition-colors"
                >
                  Cancel
                </button>
              </div>
            ) : (
              <button
                onClick={() => setShowDeleteConfirm(true)}
                className="px-2 py-1 text-xs font-medium text-red-600 hover:bg-red-50 rounded transition-colors"
              >
                Delete
              </button>
            )}
          </div>
        </div>
      </div>

      {/* Edit Modal */}
      <EditCardModal
        isOpen={isEditModalOpen}
        card={card}
        onClose={() => setIsEditModalOpen(false)}
        onSuccess={() => {
          setIsEditModalOpen(false)
          // Refresh parent component
          window.location.reload()
        }}
      />
    </>
  )
}

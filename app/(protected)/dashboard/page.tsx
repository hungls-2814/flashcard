'use client'

import { useState } from 'react'
import DeckList from '@/src/components/dashboard/DeckList'
import CreateDeckModal from '@/src/components/dashboard/CreateDeckModal'

export default function DashboardPage() {
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  const handleDeckCreated = () => {
    // Trigger DeckList refresh by changing key
    setRefreshKey((prev) => prev + 1)
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">Your Decks</h1>
          <p className="mt-2 text-gray-600">
            Create and manage your flashcard decks
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="px-6 py-2 bg-blue-600 text-white font-medium rounded-lg hover:bg-blue-700 transition-colors"
        >
          ➕ New Deck
        </button>
      </div>

      <DeckList key={refreshKey} />

      <CreateDeckModal
        isOpen={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
        onSuccess={handleDeckCreated}
      />
    </div>
  )
}

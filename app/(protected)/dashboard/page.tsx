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
          <p className="mt-1.5 text-gray-500">
            Create and manage your flashcard decks
          </p>
        </div>
        <button
          onClick={() => setIsCreateModalOpen(true)}
          className="flex cursor-pointer items-center gap-2 rounded-xl bg-gradient-to-r from-indigo-600 to-purple-600 px-5 py-2.5 font-semibold text-white shadow-lg shadow-indigo-500/30 transition-all hover:scale-[1.02] hover:shadow-indigo-500/50 active:scale-[0.98]"
        >
          <svg className="h-5 w-5" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
          </svg>
          New Deck
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

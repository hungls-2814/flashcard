'use client'

import { useState, useEffect } from 'react'
import Link from 'next/link'
import { useParams } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import CardList from '@/src/components/deck/CardList'
import CreateCardModal from '@/src/components/deck/CreateCardModal'
import type { Database } from '@/src/types/database'

type Deck = Database['public']['Tables']['decks']['Row']

export default function DeckDetailPage() {
  const params = useParams()
  const deckId = params.deckId as string
  const supabase = createClient()

  const [deck, setDeck] = useState<Deck | null>(null)
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const [isCreateCardModalOpen, setIsCreateCardModalOpen] = useState(false)
  const [refreshKey, setRefreshKey] = useState(0)

  useEffect(() => {
    const fetchDeck = async () => {
      try {
        setLoading(true)
        const { data, error: err } = await supabase
          .from('decks')
          .select('*')
          .eq('id', deckId)
          .single()

        if (err) throw err
        setDeck(data)
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load deck')
      } finally {
        setLoading(false)
      }
    }

    fetchDeck()
  }, [deckId, supabase])

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
      </div>
    )
  }

  if (error || !deck) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-red-700">
        {error || 'Deck not found'}
      </div>
    )
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-start justify-between">
        <div>
          <Link
            href="/dashboard"
            className="text-sm text-blue-600 hover:text-blue-700 mb-2 inline-block"
          >
            ← Back to Dashboard
          </Link>
          <h1 className="text-3xl font-bold text-gray-900">{deck.title}</h1>
          {deck.description && (
            <p className="mt-2 text-gray-600">{deck.description}</p>
          )}
        </div>
        <button
          onClick={() => setIsCreateCardModalOpen(true)}
          className="px-6 py-2 bg-green-600 text-white font-medium rounded-lg hover:bg-green-700 transition-colors"
        >
          ➕ Add Card
        </button>
      </div>

      {/* Color indicator */}
      <div
        className="h-2 rounded-full"
        style={{ backgroundColor: deck.color_code }}
      />

      {/* Card list */}
      <CardList key={refreshKey} deckId={deckId} />

      {/* Modal */}
      <CreateCardModal
        isOpen={isCreateCardModalOpen}
        deckId={deckId}
        onClose={() => setIsCreateCardModalOpen(false)}
        onSuccess={() => {
          setRefreshKey((prev) => prev + 1)
        }}
      />
    </div>
  )
}

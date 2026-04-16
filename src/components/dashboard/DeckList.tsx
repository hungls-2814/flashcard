'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import DeckCard from './DeckCard'
import type { Database } from '@/src/types/database'

type Deck = Database['public']['Tables']['decks']['Row']

interface DeckWithStats extends Deck {
  cardCount: number
  dueCount: number
}

export default function DeckList() {
  const [decks, setDecks] = useState<DeckWithStats[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)

  const supabase = createClient()

  useEffect(() => {
    const fetchDecks = async () => {
      try {
        setLoading(true)
        setError(null)

        // Get current user
        const {
          data: { user },
        } = await supabase.auth.getUser()

        if (!user) {
          setError('Not authenticated')
          return
        }

        // Fetch all decks for user
        const { data: decksData, error: decksError } = await supabase
          .from('decks')
          .select('*')
          .eq('user_id', user.id)
          .order('created_at', { ascending: false })

        if (decksError) throw decksError

        // For each deck, fetch card and due card counts
        const decksWithStats = await Promise.all(
          (decksData || []).map(async (deck) => {
            // Get total card count
            const { count: cardCount } = await supabase
              .from('cards')
              .select('*', { count: 'exact', head: true })
              .eq('deck_id', deck.id)

            // Get due cards count (next_review_date <= now)
            const { count: dueCount } = await supabase
              .from('card_progress')
              .select('*', { count: 'exact', head: true })
              .eq('user_id', user.id)
              .filter('id', 'in',
                `(SELECT id FROM card_progress WHERE card_id IN (SELECT id FROM cards WHERE deck_id = '${deck.id}') AND next_review_date <= now())`
              )

            return {
              ...deck,
              cardCount: cardCount || 0,
              dueCount: dueCount || 0,
            }
          })
        )

        setDecks(decksWithStats)
      } catch (err) {
        console.error('Error fetching decks:', err)
        setError(
          err instanceof Error ? err.message : 'Failed to fetch decks'
        )
      } finally {
        setLoading(false)
      }
    }

    fetchDecks()
  }, [supabase])

  const handleDeckDeleted = () => {
    // Refresh decks list
    setDecks(decks.filter((d) => d.id))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="space-y-4 text-center">
          <div className="inline-block animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600"></div>
          <p className="text-gray-600">Loading decks...</p>
        </div>
      </div>
    )
  }

  if (error) {
    return (
      <div className="rounded-lg bg-red-50 p-4 text-sm text-red-700">
        {error}
      </div>
    )
  }

  if (decks.length === 0) {
    return (
      <div className="text-center py-12">
        <p className="text-lg text-gray-600 mb-4">No decks yet</p>
        <p className="text-sm text-gray-500">
          Create your first deck to get started!
        </p>
      </div>
    )
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {decks.map((deck) => (
        <DeckCard
          key={deck.id}
          deck={deck}
          cardCount={deck.cardCount}
          dueCount={deck.dueCount}
          onDelete={handleDeckDeleted}
        />
      ))}
    </div>
  )
}

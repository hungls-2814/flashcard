'use client'

import { useState, useEffect } from 'react'
import { createClient } from '@/utils/supabase/client'
import CardItem from './CardItem'
import type { Database } from '@/src/types/database'

type Card = Database['public']['Tables']['cards']['Row']

interface CardListProps {
  deckId: string
}

export default function CardList({ deckId }: CardListProps) {
  const [cards, setCards] = useState<Card[]>([])
  const [loading, setLoading] = useState(true)
  const [error, setError] = useState<string | null>(null)
  const supabase = createClient()

  useEffect(() => {
    const fetchCards = async () => {
      try {
        setLoading(true)
        setError(null)

        const { data, error: err } = await supabase
          .from('cards')
          .select('*')
          .eq('deck_id', deckId)
          .order('created_at', { ascending: false })

        if (err) throw err
        setCards(data || [])
      } catch (err) {
        setError(err instanceof Error ? err.message : 'Failed to load cards')
      } finally {
        setLoading(false)
      }
    }

    fetchCards()
  }, [deckId, supabase])

  const handleCardDeleted = (cardId: string) => {
    setCards(cards.filter((c) => c.id !== cardId))
  }

  if (loading) {
    return (
      <div className="flex items-center justify-center py-12">
        <div className="inline-block animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
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

  if (cards.length === 0) {
    return (
      <div className="text-center py-12 bg-gray-50 rounded-lg">
        <p className="text-lg text-gray-600 mb-2">No cards yet</p>
        <p className="text-sm text-gray-500">
          Add your first card to get started studying!
        </p>
      </div>
    )
  }

  return (
    <div className="space-y-3">
      <p className="text-sm text-gray-600">
        {cards.length} card{cards.length !== 1 ? 's' : ''}
      </p>
      {cards.map((card) => (
        <CardItem
          key={card.id}
          card={card}
          onDelete={handleCardDeleted}
        />
      ))}
    </div>
  )
}

'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/src/lib/auth'
import type { Database } from '@/src/types/database'

type Card = Database['public']['Tables']['cards']['Row']
type CardProgress = Database['public']['Tables']['card_progress']['Row']

export interface StudySessionData {
  cards: (Card & { progress: CardProgress })[]
  deckTitle: string
}

export async function getStudySession(deckId: string): Promise<{
  success: boolean
  data?: StudySessionData
  error?: string
}> {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Get deck
    const { data: deck, error: deckError } = await supabase
      .from('decks')
      .select('*')
      .eq('id', deckId)
      .eq('user_id', user.id)
      .single()

    if (deckError || !deck) throw new Error('Deck not found')

    // Get all cards for this deck with their progress (no inner join for now)
    const { data: cardsData, error: cardsError } = await supabase
      .from('cards')
      .select('id, front, back, deck_id, user_id, created_at')
      .eq('deck_id', deckId)
      .eq('user_id', user.id)

    if (cardsError) {
      console.error('Cards query error:', cardsError)
      throw cardsError
    }

    console.log('Fetched cards:', cardsData?.length)

    if (!cardsData || cardsData.length === 0) {
      return {
        success: true,
        data: {
          cards: [],
          deckTitle: deck.title,
        },
      }
    }

    // Now get card_progress for these cards separately
    const cardIds = cardsData.map(c => c.id)
    const { data: progressData, error: progressError } = await supabase
      .from('card_progress')
      .select('*')
      .in('card_id', cardIds)
      .eq('user_id', user.id)

    if (progressError) {
      console.error('Card progress query error:', progressError)
      throw progressError
    }

    console.log('Fetched progress records:', progressData?.length)

    // Combine cards with their progress
    const cardsWithProgress = cardsData.map(card => {
      const progress = progressData?.find(p => p.card_id === card.id)
      console.log(`Card ${card.id}: has progress =`, !!progress, progress)
      return {
        ...card,
        card_progress: progress ? [progress] : [],
      }
    })

    // Filter to include new cards (interval_days = 0) AND cards due today
    const now = new Date()
    const dueCards = cardsWithProgress.filter((card: any) => {
      const progress = card.card_progress?.[0]
      if (!progress) {
        console.log(`Card ${card.id}: No progress data, skipping`)
        return false
      }
      
      // Include if: new card (interval_days = 0) OR due for review (next_review_date <= now)
      const isNewCard = progress.interval_days === 0
      const isDueCard = new Date(progress.next_review_date) <= now
      console.log(`Card ${card.id}: isNewCard=${isNewCard}, isDueCard=${isDueCard}, interval=${progress.interval_days}`)
      return isNewCard || isDueCard
    })

    console.log('Due cards after filter:', dueCards.length)

    // Transform: flatten card_progress from array to single object
    const transformedCards = dueCards.map((card: any) => ({
      ...card,
      progress: card.card_progress[0],
    }))

    return {
      success: true,
      data: {
        cards: transformedCards,
        deckTitle: deck.title,
      },
    }
  } catch (error) {
    console.error('Error fetching study session:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to fetch session',
    }
  }
}

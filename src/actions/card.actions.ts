'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/src/lib/auth'
import { z } from 'zod'

// Validation schemas
const createCardSchema = z.object({
  deck_id: z.string().uuid(),
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
})

const updateCardSchema = createCardSchema.partial().omit({ deck_id: true })

export async function createCard(formData: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const data = createCardSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify deck ownership
    const { data: deck } = await supabase
      .from('decks')
      .select('user_id')
      .eq('id', data.deck_id)
      .single()

    if (!deck || deck.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this deck')
    }

    // Create card
    const { data: card, error: cardError } = await supabase
      .from('cards')
      .insert({
        deck_id: data.deck_id,
        user_id: user.id,
        front: data.front,
        back: data.back,
      })
      .select()
      .single()

    if (cardError) throw cardError

    // Initialize card progress (new card with interval_days = 0)
    const { error: progressError } = await supabase
      .from('card_progress')
      .insert({
        card_id: card.id,
        user_id: user.id,
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review_date: new Date().toISOString(),
      })

    if (progressError) throw progressError

    return { success: true, data: card }
  } catch (error) {
    console.error('Error creating card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create card',
    }
  }
}

export async function updateCard(cardId: string, formData: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const data = updateCardSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify ownership
    const { data: card } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', cardId)
      .single()

    if (!card || card.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this card')
    }

    const { error } = await supabase.from('cards').update(data).eq('id', cardId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error updating card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update card',
    }
  }
}

export async function deleteCard(cardId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify ownership
    const { data: card } = await supabase
      .from('cards')
      .select('user_id')
      .eq('id', cardId)
      .single()

    if (!card || card.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this card')
    }

    const { error } = await supabase.from('cards').delete().eq('id', cardId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting card:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete card',
    }
  }
}

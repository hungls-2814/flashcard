'use server'

import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'
import { getCurrentUser } from '@/src/lib/auth'
import { z } from 'zod'

// Validation schemas
const createDeckSchema = z.object({
  title: z.string().min(1).max(200),
  description: z.string().max(1000).nullable(),
  color_code: z.string().regex(/^#[0-9A-F]{6}$/i).default('#3b82f6'),
})

const updateDeckSchema = createDeckSchema.partial()

const createCardSchema = z.object({
  deck_id: z.string().uuid(),
  front: z.string().min(1).max(5000),
  back: z.string().min(1).max(5000),
})

const updateCardSchema = createCardSchema.partial().omit({ deck_id: true })

// Deck Actions
export async function createDeck(formData: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const data = createDeckSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    const { data: deck, error } = await supabase
      .from('decks')
      .insert({
        user_id: user.id,
        title: data.title,
        description: data.description,
        color_code: data.color_code,
      })
      .select()
      .single()

    if (error) throw error
    return { success: true, data: deck }
  } catch (error) {
    console.error('Error creating deck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to create deck',
    }
  }
}

export async function updateDeck(deckId: string, formData: unknown) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const data = updateDeckSchema.parse(formData)
    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify ownership
    const { data: deck } = await supabase
      .from('decks')
      .select('user_id')
      .eq('id', deckId)
      .single()

    if (!deck || deck.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this deck')
    }

    const { error } = await supabase
      .from('decks')
      .update(data)
      .eq('id', deckId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error updating deck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to update deck',
    }
  }
}

export async function deleteDeck(deckId: string) {
  try {
    const user = await getCurrentUser()
    if (!user) throw new Error('Unauthorized')

    const cookieStore = await cookies()
    const supabase = createClient(cookieStore)

    // Verify ownership
    const { data: deck } = await supabase
      .from('decks')
      .select('user_id')
      .eq('id', deckId)
      .single()

    if (!deck || deck.user_id !== user.id) {
      throw new Error('Forbidden: You do not own this deck')
    }

    const { error } = await supabase.from('decks').delete().eq('id', deckId)

    if (error) throw error
    return { success: true }
  } catch (error) {
    console.error('Error deleting deck:', error)
    return {
      success: false,
      error: error instanceof Error ? error.message : 'Failed to delete deck',
    }
  }
}

// Card Actions
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

    // Initialize card progress
    const { error: progressError } = await supabase
      .from('card_progress')
      .insert({
        card_id: card.id,
        user_id: user.id,
        ease_factor: 2.5,
        interval_days: 1,
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

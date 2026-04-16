export type Profile = {
  id: string
  email: string
  full_name: string | null
  created_at: string
  updated_at: string
}

export type Deck = {
  id: string
  user_id: string
  title: string
  description: string | null
  color_code: string
  created_at: string
  updated_at: string
}

export type Card = {
  id: string
  deck_id: string
  user_id: string
  front: string
  back: string
  created_at: string
  updated_at: string
}

export type CardProgress = {
  id: string
  card_id: string
  user_id: string
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_date: string
  last_reviewed_at: string | null
  created_at: string
  updated_at: string
}

export type StudyResponse = {
  card_id: string
  quality: 0 | 1 | 2 | 4 | 5
  timestamp: string
}

export type StudyResponseResult = {
  updated_progress: CardProgress
  next_card: Card | null
  session_status: 'continuing' | 'completed'
  timestamp: string
}

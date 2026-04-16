/**
 * SuperMemo-2 (SM-2) Algorithm Implementation
 * 
 * Based on the original SM-2 formula by Piotr Wozniak
 * Quality scale: 0-5 where:
 *   0: Complete blackout, complete failure to recall
 *   1: Incorrect response, but upon seeing the correct answer it is recalled
 *   2: Incorrect response, but upon seeing the correct answer it seems easy to remember
 *   4: Correct response after a hesitation
 *   5: Perfect response
 */

export interface CardProgressState {
  ease_factor: number
  interval_days: number
  repetitions: number
  next_review_date: Date
}

export interface SM2Result extends CardProgressState {
  last_reviewed_at: Date
}

/**
 * Calculate the new interval and ease factor based on user's quality response
 */
export function calculateSM2(
  currentState: CardProgressState,
  quality: 0 | 1 | 2 | 4 | 5
): SM2Result {
  const now = new Date()
  
  if (quality < 0 || quality > 5) {
    throw new Error('Quality must be between 0 and 5')
  }

  let newEaseFactor = currentState.ease_factor
  let newInterval = currentState.interval_days
  let newRepetitions = currentState.repetitions

  // Calculate new ease factor
  const ef = currentState.ease_factor + (0.1 - (5 - quality) * (0.08 + (5 - quality) * 0.02))
  newEaseFactor = Math.max(1.3, ef) // Minimum ease factor is 1.3

  if (quality < 3) {
    // Quality too low - reset repetitions
    newRepetitions = 0
    newInterval = 1
  } else {
    // Quality acceptable
    newRepetitions += 1

    if (newRepetitions === 1) {
      newInterval = 1
    } else if (newRepetitions === 2) {
      newInterval = 3
    } else {
      // Interval = previousInterval × easeFactor
      newInterval = Math.round(currentState.interval_days * newEaseFactor)
    }
  }

  // Calculate next review date
  const nextReviewDate = new Date(now)
  nextReviewDate.setDate(nextReviewDate.getDate() + newInterval)

  // Reset time to start of day (UTC)
  nextReviewDate.setUTCHours(0, 0, 0, 0)

  return {
    ease_factor: Math.round(newEaseFactor * 100) / 100, // Round to 2 decimals
    interval_days: newInterval,
    repetitions: newRepetitions,
    next_review_date: nextReviewDate,
    last_reviewed_at: now,
  }
}

/**
 * Get cards that are due for review (next_review_date <= now)
 */
export function isDueForReview(nextReviewDate: Date): boolean {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  
  const reviewDate = new Date(nextReviewDate)
  reviewDate.setUTCHours(0, 0, 0, 0)
  
  return reviewDate <= now
}

/**
 * Get days until next review
 */
export function getDaysUntilReview(nextReviewDate: Date): number {
  const now = new Date()
  now.setUTCHours(0, 0, 0, 0)
  
  const reviewDate = new Date(nextReviewDate)
  reviewDate.setUTCHours(0, 0, 0, 0)
  
  return Math.ceil((reviewDate.getTime() - now.getTime()) / (1000 * 60 * 60 * 24))
}

/**
 * Initialize a new card for studying
 */
export function initializeCard(): CardProgressState {
  const tomorrow = new Date()
  tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
  tomorrow.setUTCHours(0, 0, 0, 0)

  return {
    ease_factor: 2.5,
    interval_days: 0,
    repetitions: 0,
    next_review_date: tomorrow,
  }
}

/**
 * Quality response descriptions for reference
 */
export const QUALITY_DESCRIPTIONS = {
  0: 'Complete blackout, complete failure to recall',
  1: 'Incorrect response, but upon seeing the correct answer it is recalled',
  2: 'Incorrect response, but upon seeing the correct answer it seems easy to remember',
  4: 'Correct response after a hesitation',
  5: 'Perfect response',
} as const

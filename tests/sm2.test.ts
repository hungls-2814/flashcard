/**
 * SM-2 Algorithm Unit Tests
 * Validates SM-2 calculation against known reference implementations
 */

import { calculateSM2, isDueForReview, getDaysUntilReview, initializeCard } from '@/src/lib/sm2'
import { CardProgressState } from '@/src/lib/sm2'

describe('SM-2 Algorithm', () => {
  describe('Initialize Card', () => {
    it('should initialize a new card with correct default values', () => {
      const card = initializeCard()
      
      expect(card.ease_factor).toBe(2.5)
      expect(card.interval_days).toBe(0)
      expect(card.repetitions).toBe(0)
      expect(card.next_review_date).toBeDefined()
    })

    it('should set next review date to tomorrow', () => {
      const card = initializeCard()
      const tomorrow = new Date()
      tomorrow.setUTCDate(tomorrow.getUTCDate() + 1)
      tomorrow.setUTCHours(0, 0, 0, 0)
      
      expect(card.next_review_date.getTime()).toBe(tomorrow.getTime())
    })
  })

  describe('Calculate SM-2 - Quality 5 (Perfect)', () => {
    it('should increase interval on first review', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 0,
        repetitions: 0,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 5)

      expect(result.repetitions).toBe(1)
      expect(result.interval_days).toBe(1)
      expect(result.ease_factor).toBe(2.6)
    })

    it('should use interval 3 on second review', () => {
      const state: CardProgressState = {
        ease_factor: 2.6,
        interval_days: 1,
        repetitions: 1,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 5)

      expect(result.repetitions).toBe(2)
      expect(result.interval_days).toBe(3)
    })

    it('should multiply by ease factor on third+ review', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 3,
        repetitions: 2,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 5)

      expect(result.repetitions).toBe(3)
      expect(result.interval_days).toBe(Math.round(3 * 2.5)) // 7-8
    })
  })

  describe('Calculate SM-2 - Quality 0-2 (Fail/Below Threshold)', () => {
    it('should reset repetitions on quality 0', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 7,
        repetitions: 2,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 0)

      expect(result.repetitions).toBe(0)
      expect(result.interval_days).toBe(1)
    })

    it('should reset repetitions on quality 1', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 7,
        repetitions: 2,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 1)

      expect(result.repetitions).toBe(0)
      expect(result.interval_days).toBe(1)
    })

    it('should reset repetitions on quality 2', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 7,
        repetitions: 2,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 2)

      expect(result.repetitions).toBe(0)
      expect(result.interval_days).toBe(1)
    })
  })

  describe('Calculate SM-2 - Quality 4 (Good)', () => {
    it('should progress normally with quality 4', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 1,
        repetitions: 1,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 4)

      expect(result.repetitions).toBe(2)
      expect(result.interval_days).toBe(3)
    })
  })

  describe('Ease Factor Bounds', () => {
    it('should never go below 1.3', () => {
      const state: CardProgressState = {
        ease_factor: 1.3,
        interval_days: 1,
        repetitions: 0,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 0)

      expect(result.ease_factor).toBeGreaterThanOrEqual(1.3)
    })

    it('should increase with quality 5', () => {
      const state: CardProgressState = {
        ease_factor: 2.5,
        interval_days: 7,
        repetitions: 3,
        next_review_date: new Date(),
      }

      const result = calculateSM2(state, 5)

      expect(result.ease_factor).toBeGreaterThan(2.5)
    })
  })

  describe('Is Due For Review', () => {
    it('should return true for past review dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 1)

      expect(isDueForReview(pastDate)).toBe(true)
    })

    it('should return false for future review dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 1)

      expect(isDueForReview(futureDate)).toBe(false)
    })

    it('should return true for today', () => {
      const today = new Date()

      expect(isDueForReview(today)).toBe(true)
    })
  })

  describe('Get Days Until Review', () => {
    it('should return 0 for today', () => {
      const today = new Date()
      expect(getDaysUntilReview(today)).toBe(0)
    })

    it('should return positive number for future dates', () => {
      const futureDate = new Date()
      futureDate.setDate(futureDate.getDate() + 5)
      expect(getDaysUntilReview(futureDate)).toBe(5)
    })

    it('should return negative number for past dates', () => {
      const pastDate = new Date()
      pastDate.setDate(pastDate.getDate() - 3)
      expect(getDaysUntilReview(pastDate)).toBeLessThan(0)
    })
  })
})

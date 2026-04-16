import { z } from 'zod'

/**
 * Deck validation schema
 * Ensures deck data meets business requirements
 */
export const deckSchema = z.object({
  title: z
    .string()
    .min(1, 'Title is required')
    .max(200, 'Title must be 200 characters or less'),
  description: z
    .string()
    .max(1000, 'Description must be 1000 characters or less')
    .nullish(),
  color_code: z
    .string()
    .regex(/^#[0-9A-F]{6}$/i, 'Color code must be a valid hex color')
    .default('#3b82f6'),
})

/**
 * Card validation schema
 * Ensures card content meets requirements
 * Supports Markdown for front and back content
 */
export const cardSchema = z.object({
  front: z
    .string()
    .min(1, 'Front side is required')
    .max(5000, 'Front side must be 5000 characters or less'),
  back: z
    .string()
    .min(1, 'Back side is required')
    .max(5000, 'Back side must be 5000 characters or less'),
})

/**
 * Study response validation schema
 * Validates user's response to a card during study session
 */
export const studyResponseSchema = z.object({
  card_id: z.string().uuid('Invalid card ID'),
  quality: z
    .union([z.literal(0), z.literal(1), z.literal(2), z.literal(4), z.literal(5)])
    .describe('Quality rating: 0-5 scale'),
  timestamp: z
    .string()
    .datetime()
    .describe('ISO 8601 timestamp of the response'),
})

/**
 * Markdown content validation
 * Ensures Markdown content is valid and safe
 */
export const markdownSchema = z
  .string()
  .min(1, 'Content is required')
  .max(5000, 'Content must be 5000 characters or less')
  .refine(
    (content) => {
      // Basic Markdown validation: check for balanced brackets
      const openBrackets = (content.match(/\[/g) || []).length
      const closeBrackets = (content.match(/\]/g) || []).length
      return openBrackets === closeBrackets
    },
    { message: 'Invalid Markdown syntax: unbalanced brackets' }
  )

/**
 * Type exports for use in API handlers and components
 */
export type DeckInput = z.infer<typeof deckSchema>
export type CardInput = z.infer<typeof cardSchema>
export type StudyResponse = z.infer<typeof studyResponseSchema>
export type MarkdownContent = z.infer<typeof markdownSchema>

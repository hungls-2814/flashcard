import { NextRequest, NextResponse } from 'next/server'
import { createServerClient } from '@supabase/ssr'
import { cookies } from 'next/headers'
import { z } from 'zod'
import { calculateSM2 } from '@/src/lib/sm2'

export const runtime = 'edge'

// Request validation
const respondSchema = z.object({
  card_id: z.string().uuid(),
  quality: z.number().int().min(0).max(5),
  timestamp: z.string().datetime().optional(),
})

export async function POST(request: NextRequest) {
  try {
    const body = await request.json()
    const { card_id, quality } = respondSchema.parse(body)

    // Get auth session from cookies
    const cookieStore = await cookies()
    const supabase = createServerClient(
      process.env.NEXT_PUBLIC_SUPABASE_URL!,
      process.env.NEXT_PUBLIC_SUPABASE_PUBLISHABLE_KEY!,
      {
        cookies: {
          getAll() {
            return cookieStore.getAll()
          },
          setAll(cookiesToSet: any[]) {
            cookiesToSet.forEach(({ name, value, options }) => {
              cookieStore.set(name, value, options)
            })
          },
        },
      }
    )

    // Get current user
    const {
      data: { user },
    } = await supabase.auth.getUser()

    if (!user) {
      return NextResponse.json(
        { error: 'Unauthorized' },
        { status: 401 }
      )
    }

    // Get current card progress
    const { data: cardProgress, error: progressError } = await supabase
      .from('card_progress')
      .select('*')
      .eq('card_id', card_id)
      .eq('user_id', user.id)
      .single()

    if (progressError || !cardProgress) {
      return NextResponse.json(
        { error: 'Card not found' },
        { status: 404 }
      )
    }

    // Calculate SM-2 update
    const updated = calculateSM2(
      {
        ease_factor: cardProgress.ease_factor,
        interval_days: cardProgress.interval_days,
        repetitions: cardProgress.repetitions,
        next_review_date: cardProgress.next_review_date,
      },
      quality as 0 | 1 | 2 | 4 | 5
    )

    // Determine next review date
    const nextReviewDate = new Date()
    nextReviewDate.setDate(nextReviewDate.getDate() + updated.interval_days)

    // Update card progress
    const { error: updateError } = await supabase
      .from('card_progress')
      .update({
        ease_factor: updated.ease_factor,
        interval_days: updated.interval_days,
        repetitions: updated.repetitions,
        next_review_date: nextReviewDate.toISOString(),
        last_reviewed_at: new Date().toISOString(),
      })
      .eq('id', cardProgress.id)

    if (updateError) {
      console.error('Update error:', updateError)
      return NextResponse.json(
        { error: 'Failed to update progress' },
        { status: 500 }
      )
    }

    return NextResponse.json({
      success: true,
      updated: {
        ease_factor: updated.ease_factor,
        interval_days: updated.interval_days,
        repetitions: updated.repetitions,
        next_review_date: nextReviewDate.toISOString(),
      },
    })
  } catch (error) {
    console.error('API error:', error)

    if (error instanceof z.ZodError) {
      return NextResponse.json(
        { error: 'Invalid request body', details: error.errors },
        { status: 400 }
      )
    }

    return NextResponse.json(
      { error: 'Internal server error' },
      { status: 500 }
    )
  }
}

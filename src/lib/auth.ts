import { createClient } from '@/utils/supabase/server'
import { cookies } from 'next/headers'

export async function getCurrentUser() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { user },
  } = await supabase.auth.getUser()

  return user
}

export async function getUserSession() {
  const cookieStore = await cookies()
  const supabase = createClient(cookieStore)

  const {
    data: { session },
  } = await supabase.auth.getSession()

  return session
}

export function handleAuthError(error: unknown): string {
  if (error instanceof Error) {
    if (error.message.includes('Invalid login credentials')) {
      return 'Invalid email or password'
    }
    if (error.message.includes('Email not confirmed')) {
      return 'Please confirm your email address'
    }
    if (error.message.includes('User already registered')) {
      return 'An account with this email already exists'
    }
    if (error.message.includes('Password should be')) {
      return 'Password must be at least 6 characters'
    }
    return error.message
  }
  return 'An unexpected error occurred'
}

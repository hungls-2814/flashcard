/**
 * Client-side auth utilities
 * Use only in client components
 */

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

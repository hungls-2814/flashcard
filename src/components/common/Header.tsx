'use client'

import { useRouter } from 'next/navigation'
import { createClient } from '@/utils/supabase/client'
import type { User } from '@supabase/supabase-js'

interface HeaderProps {
  user: User | null
}

export default function Header({ user }: HeaderProps) {
  const router = useRouter()
  const supabase = createClient()

  const handleLogout = async () => {
    await supabase.auth.signOut()
    router.push('/login')
  }

  const userInitials = user?.email?.substring(0, 2).toUpperCase() || '👤'

  return (
    <header className="bg-white border-b border-gray-200 shadow-sm sticky top-0 z-40">
      <div className="flex items-center justify-between px-8 py-4">
        {/* Left Section - Title */}
        <div className="flex-1">
          <h1 className="text-2xl font-bold text-gray-900">Flashcard Mastery</h1>
          <p className="text-sm text-gray-500 mt-0.5">Learn faster, retain longer</p>
        </div>

        {/* Right Section - User Info & Logout */}
        {user && (
          <div className="flex items-center gap-4 ml-8">
            {/* User Profile Card */}
            <div className="flex items-center gap-3 px-4 py-2 rounded-lg bg-gray-50 border border-gray-200 hover:bg-gray-100 transition-colors">
              <div className="w-10 h-10 rounded-full bg-gradient-to-br from-blue-600 to-purple-600 flex items-center justify-center text-white font-semibold text-sm">
                {userInitials}
              </div>
              <div className="text-right hidden sm:block">
                <p className="text-sm font-semibold text-gray-900">
                  {user.user_metadata?.full_name || 'User'}
                </p>
                <p className="text-xs text-gray-500 truncate max-w-32">
                  {user.email}
                </p>
              </div>
            </div>

            {/* Logout Button */}
            <button
              onClick={handleLogout}
              className="flex cursor-pointer items-center gap-1.5 rounded-lg border border-red-200 px-4 py-2 text-sm font-semibold text-red-600 transition-colors hover:border-red-300 hover:bg-red-50"
              title="Sign out"
            >
              <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M15.75 9V5.25A2.25 2.25 0 0013.5 3h-6a2.25 2.25 0 00-2.25 2.25v13.5A2.25 2.25 0 007.5 21h6a2.25 2.25 0 002.25-2.25V15m3 0l3-3m0 0l-3-3m3 3H9" />
              </svg>
              Exit
            </button>
          </div>
        )}
      </div>
    </header>
  )
}

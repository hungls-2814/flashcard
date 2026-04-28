'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  const navItems = [
    {
      href: '/dashboard',
      label: 'Dashboard',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M3 13.125C3 12.504 3.504 12 4.125 12h2.25c.621 0 1.125.504 1.125 1.125v6.75C7.5 20.496 6.996 21 6.375 21h-2.25A1.125 1.125 0 013 19.875v-6.75zM9.75 8.625c0-.621.504-1.125 1.125-1.125h2.25c.621 0 1.125.504 1.125 1.125v11.25c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V8.625zM16.5 4.125c0-.621.504-1.125 1.125-1.125h2.25C20.496 3 21 3.504 21 4.125v15.75c0 .621-.504 1.125-1.125 1.125h-2.25a1.125 1.125 0 01-1.125-1.125V4.125z" />
        </svg>
      ),
    },
  ]

  const actionItems = [
    {
      href: '/dashboard',
      label: 'New Deck',
      icon: (
        <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
          <path strokeLinecap="round" strokeLinejoin="round" d="M12 4.5v15m7.5-7.5h-15" />
        </svg>
      ),
    },
  ]

  return (
    <aside className="w-64 bg-gradient-to-b from-gray-50 to-white border-r border-gray-200 shadow-sm">
      <nav className="p-6 space-y-1">
        {/* Branding */}
        <div className="mb-6 pb-4 border-b border-gray-200">
          <Link href="/dashboard" className="flex items-center gap-2.5 rounded-lg px-3 py-2">
            <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-gradient-to-br from-indigo-500 to-purple-600">
              <svg className="h-4 w-4 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
                <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
              </svg>
            </div>
            <div>
              <h1 className="font-bold text-base text-gray-900">Flashcard</h1>
              <p className="text-xs text-gray-500">Mastery</p>
            </div>
          </Link>
        </div>

        {/* Main Navigation */}
        <div className="space-y-1">
          {navItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
                isActive(item.href) && !isActive('/deck') && !isActive('/study')
                  ? 'bg-indigo-100 text-indigo-900 shadow-sm'
                  : 'text-gray-700 hover:bg-gray-100'
              }`}
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Actions Section */}
        <div className="pt-4 border-t border-gray-200">
          <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Actions
          </p>
          {actionItems.map(item => (
            <Link
              key={item.href}
              href={item.href}
              className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
            >
              {item.icon}
              {item.label}
            </Link>
          ))}
        </div>

        {/* Learn Section */}
        <div className="pt-4 border-t border-gray-200">
          <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Learn
          </p>
          <Link
            href="/dashboard"
            className={`flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm font-medium transition-all ${
              isActive('/study')
                ? 'bg-emerald-100 text-emerald-900 shadow-sm'
                : 'text-gray-700 hover:bg-gray-100'
            }`}
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M12 6.042A8.967 8.967 0 006 3.75c-1.052 0-2.062.18-3 .512v14.25A8.987 8.987 0 016 18c2.305 0 4.408.867 6 2.292m0-14.25a8.966 8.966 0 016-2.292c1.052 0 2.062.18 3 .512v14.25A8.987 8.987 0 0018 18a8.967 8.967 0 00-6 2.292m0-14.25v14.25" />
            </svg>
            Study a Deck
          </Link>
          <p className="px-4 py-2 text-xs text-gray-500">
            Go to Dashboard & select a deck
          </p>
        </div>

        {/* Resources Section */}
        <div className="pt-4 border-t border-gray-200 mt-6">
          <p className="px-4 py-2 text-xs font-bold text-gray-500 uppercase tracking-wider">
            Resources
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="flex items-center gap-2.5 rounded-lg px-3 py-2.5 text-sm text-gray-700 font-medium hover:bg-gray-100 transition-colors"
          >
            <svg className="h-4 w-4" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M13.19 8.688a4.5 4.5 0 011.242 7.244l-4.5 4.5a4.5 4.5 0 01-6.364-6.364l1.757-1.757m13.35-.622l1.757-1.757a4.5 4.5 0 00-6.364-6.364l-4.5 4.5a4.5 4.5 0 001.242 7.244" />
            </svg>
            GitHub
          </a>
        </div>
      </nav>

      {/* Footer */}
      <div className="absolute bottom-0 left-0 right-0 p-6 border-t border-gray-200 bg-gradient-to-t from-white to-transparent">
        <p className="text-xs text-gray-500 text-center">
          © 2024 Flashcard Mastery
        </p>
      </div>
    </aside>
  )
}

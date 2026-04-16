'use client'

import Link from 'next/link'
import { usePathname } from 'next/navigation'

export default function Sidebar() {
  const pathname = usePathname()

  const isActive = (href: string) => pathname.startsWith(href)

  return (
    <aside className="w-64 bg-white border-r border-gray-200 shadow-sm">
      <nav className="p-6 space-y-2">
        <Link
          href="/dashboard"
          className={`block px-4 py-2 rounded-lg text-sm font-medium transition-colors ${
            isActive('/dashboard') && !isActive('/dashboard/') && !isActive('/deck')
              ? 'bg-blue-100 text-blue-900'
              : 'text-gray-700 hover:bg-gray-100'
          }`}
        >
          📊 Dashboard
        </Link>

        <div className="pt-4 border-t border-gray-200">
          <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
            Decks
          </p>
          <Link
            href="/dashboard"
            className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            ➕ New Deck
          </Link>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
            Learn
          </p>
          <a
            href="#study"
            className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🎓 Study Session (disabled)
          </a>
        </div>

        <div className="pt-4 border-t border-gray-200">
          <p className="px-4 py-2 text-xs font-semibold text-gray-600 uppercase">
            Resources
          </p>
          <a
            href="https://github.com"
            target="_blank"
            rel="noopener noreferrer"
            className="block px-4 py-2 rounded-lg text-sm text-gray-700 hover:bg-gray-100 transition-colors"
          >
            🔗 GitHub
          </a>
        </div>
      </nav>
    </aside>
  )
}

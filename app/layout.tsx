import type { Metadata, Viewport } from 'next'
import '@/src/styles/globals.css'

export const metadata: Metadata = {
  title: 'Flashcard Mastery - Spaced Repetition Learning System',
  description: 'Master any subject with intelligent spaced repetition using the SM-2 algorithm',
  keywords: ['flashcards', 'spaced repetition', 'learning', 'sm-2', 'study'],
  authors: [{ name: 'Flashcard Mastery' }],
}

export const viewport: Viewport = {
  width: 'device-width',
  initialScale: 1,
  maximumScale: 5,
}

export default function RootLayout({
  children,
}: {
  children: React.ReactNode
}) {
  return (
    <html lang="en" suppressHydrationWarning>
      <head />
      <body className="bg-gradient-to-br from-gray-50 to-gray-100">
        <div className="min-h-screen w-full">
          {children}
        </div>
      </body>
    </html>
  )
}

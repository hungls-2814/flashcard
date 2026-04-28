'use client'

import { useState, useEffect } from 'react'
import { useParams, useRouter } from 'next/navigation'
import Link from 'next/link'
import { getStudySession } from '@/src/actions/study.actions'
import FlashCard from '@/src/components/study/FlashCard'
import StudyControls from '@/src/components/study/StudyControls'
import CompletionCelebration from '@/src/components/study/CompletionCelebration'
import ConfirmModal from '@/src/components/common/ConfirmModal'
import { toast } from '@/src/lib/toast'
import type { StudySessionData } from '@/src/actions/study.actions'

interface SessionState {
  cards: StudySessionData['cards']
  currentIndex: number
  sessionComplete: boolean
  loading: boolean
  error: string | null
  startTime: number
}

export default function StudyPage() {
  const params = useParams()
  const router = useRouter()
  const deckId = params.deckId as string
  const [session, setSession] = useState<SessionState>({
    cards: [],
    currentIndex: 0,
    sessionComplete: false,
    loading: true,
    error: null,
    startTime: 0,
  })
  const [answering, setAnswering] = useState(false)
  const [showExitConfirm, setShowExitConfirm] = useState(false)

  useEffect(() => {
    const load = async () => {
      try {
        setSession(p => ({ ...p, loading: true }))
        const res = await getStudySession(deckId)
        if (!res.success) throw new Error(res.error)
        const { cards } = res.data!
        if (!cards.length) {
          setSession(p => ({ ...p, loading: false, sessionComplete: true }))
          return
        }
        setSession(p => ({ ...p, cards, loading: false, startTime: Date.now() }))
      } catch (e) {
        setSession(p => ({ ...p, loading: false, error: String(e) }))
      }
    }
    load()
  }, [deckId])

  const card = session.cards[session.currentIndex]

  const handleResponse = async (quality: 0 | 1 | 2 | 4 | 5) => {
    if (!card) return
    setAnswering(true)
    try {
      const res = await fetch('/api/study/respond', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          card_id: card.id,
          quality,
          timestamp: new Date().toISOString(),
        }),
      })
      if (!res.ok) throw new Error('Failed to save response')
      
      if (session.currentIndex < session.cards.length - 1) {
        setSession(p => ({ ...p, currentIndex: p.currentIndex + 1 }))
      } else {
        setSession(p => ({ ...p, sessionComplete: true }))
      }
    } catch (e) {
      toast.error((e as Error).message, 3000)
    } finally {
      setAnswering(false)
    }
  }

  if (session.loading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 flex items-center justify-center">
        <div className="text-center">
          <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4" />
          <p className="text-gray-600 font-medium">Loading study session...</p>
        </div>
      </div>
    )
  }

  if (session.error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-red-50 via-pink-50 to-red-50 p-8">
        <div className="max-w-md mx-auto">
          <div className="bg-white rounded-2xl p-8 shadow-lg border-l-4 border-red-500">
            <div className="flex items-start gap-4">
              <span className="text-4xl">⚠️</span>
              <div className="flex-1">
                <h2 className="text-2xl font-bold text-gray-900 mb-2">Error</h2>
                <p className="text-red-700 mb-6">{session.error}</p>
                <Link href="/dashboard" className="inline-block px-6 py-2 bg-gradient-to-r from-blue-600 to-blue-700 text-white rounded-lg font-medium hover:shadow-lg transition">Back to Dashboard</Link>
              </div>
            </div>
          </div>
        </div>
      </div>
    )
  }

  if (session.sessionComplete && !session.cards.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-emerald-50 via-green-50 to-teal-50 flex items-center justify-center p-8">
        <div className="text-center">
          <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-2xl bg-emerald-100">
            <svg className="h-10 w-10 text-emerald-600" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
              <path strokeLinecap="round" strokeLinejoin="round" d="M9 12.75L11.25 15 15 9.75M21 12a9 9 0 11-18 0 9 9 0 0118 0z" />
            </svg>
          </div>
          <h1 className="text-4xl font-bold text-gray-900 mb-2">All caught up!</h1>
          <p className="text-gray-600 mb-8">You have reviewed all available cards.</p>
          <Link href="/dashboard" className="inline-block px-8 py-3 bg-gradient-to-r from-emerald-600 to-teal-600 text-white rounded-xl font-semibold hover:shadow-lg transition">Back to Dashboard</Link>
        </div>
      </div>
    )
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-purple-50 to-pink-50 p-8">
      <div className="max-w-5xl mx-auto">
        {/* Header */}
        <div className="mb-10 flex justify-between items-center">
          <div>
            <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">Study Session</h1>
            <p className="text-gray-600 mt-1">Master your learning today</p>
          </div>
          <div className="text-right">
            <div className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
              {session.currentIndex + 1} / {session.cards.length}
            </div>
            <p className="text-sm text-gray-600 mt-1">cards reviewed</p>
          </div>
        </div>

        {/* Progress Bar */}
        <div className="mb-8">
          <div className="h-3 bg-gray-200 rounded-full overflow-hidden shadow-md">
            <div
              className="h-full bg-gradient-to-r from-blue-600 via-purple-600 to-pink-600 rounded-full transition-all duration-500"
              style={{ width: `${(session.currentIndex / session.cards.length) * 100}%` }}
            />
          </div>
          <p className="text-xs text-gray-600 mt-2 text-center">Progress: {Math.round((session.currentIndex / session.cards.length) * 100)}%</p>
        </div>

        {/* Main Content Grid */}
        {card && (
          <>
            <div className="grid grid-cols-1 lg:grid-cols-3 gap-8 mb-8">
              {/* Card Area */}
              <div className="lg:col-span-2">
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <FlashCard card={card} />
                </div>
              </div>

              {/* Tips Sidebar */}
              <div className="lg:col-span-1 space-y-6">
                {/* Quick Tips */}
                <div className="bg-white/80 backdrop-blur-sm rounded-2xl p-6 shadow-lg border border-white/20">
                  <h3 className="text-lg font-bold text-gray-900 mb-4 flex items-center gap-2">
                    <svg className="h-5 w-5 text-amber-500" fill="none" viewBox="0 0 24 24" strokeWidth={2} stroke="currentColor">
                      <path strokeLinecap="round" strokeLinejoin="round" d="M12 18v-5.25m0 0a6.01 6.01 0 001.5-.189m-1.5.189a6.01 6.01 0 01-1.5-.189m3.75 7.478a12.06 12.06 0 01-4.5 0m3.75 2.383a14.406 14.406 0 01-3 0M14.25 18v-.192c0-.983.658-1.823 1.508-2.316a7.5 7.5 0 10-7.517 0c.85.493 1.509 1.333 1.509 2.316V18" />
                    </svg>
                    Tips
                  </h3>
                  <ul className="space-y-3 text-sm text-gray-700">
                    <li className="flex items-center gap-2.5">
                      <kbd className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-600 border border-gray-200">SPACE</kbd>
                      <span>to flip card</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <kbd className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-600 border border-gray-200">1,2,4,5</kbd>
                      <span>for answers</span>
                    </li>
                    <li className="flex items-center gap-2.5">
                      <kbd className="rounded bg-gray-100 px-2 py-0.5 font-mono text-xs font-semibold text-gray-600 border border-gray-200">ESC</kbd>
                      <span>to exit</span>
                    </li>
                  </ul>
                </div>

                {/* Stats */}
                <div className="bg-gradient-to-br from-indigo-500 to-indigo-600 rounded-2xl p-6 shadow-lg text-white">
                  <h3 className="text-lg font-bold mb-4">Session Stats</h3>
                  <div className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Remaining</span>
                      <span className="text-2xl font-bold">{session.cards.length - session.currentIndex - 1}</span>
                    </div>
                    <div className="h-px bg-blue-400/30" />
                    <div className="flex justify-between items-center">
                      <span className="text-blue-100">Reviewed</span>
                      <span className="text-2xl font-bold">{session.currentIndex}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            {/* Controls */}
            {!session.sessionComplete && (
              <div className="bg-white/90 backdrop-blur-sm rounded-2xl p-8 shadow-lg border border-white/20">
                <StudyControls
                  onQuality={handleResponse}
                  disabled={answering}
                  loading={answering}
                />
              </div>
            )}
          </>
        )}

        {/* Completion */}
        <CompletionCelebration
          show={session.sessionComplete && session.cards.length > 0}
          cardCount={session.cards.length}
          sessionDuration={
            session.sessionComplete
              ? Math.floor((Date.now() - session.startTime) / 1000)
              : undefined
          }
        />
      </div>

      <ConfirmModal
        isOpen={showExitConfirm}
        title="Exit Study Session?"
        message={<p>Are you sure you want to exit?</p>}
        confirmText="Exit"
        cancelText="Continue"
        onConfirm={() => router.push(`/deck/${deckId}`)}
        onCancel={() => setShowExitConfirm(false)}
        isDangerous
      />
    </div>
  )
}

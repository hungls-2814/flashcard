export default function Home() {
  return (
    <main className="relative flex min-h-screen flex-col items-center justify-center overflow-hidden bg-gradient-to-br from-indigo-950 via-purple-900 to-violet-900 px-4 py-12">
      {/* Blobs */}
      <div aria-hidden="true" className="pointer-events-none absolute inset-0">
        <div className="absolute -top-40 -left-32 h-96 w-96 rounded-full bg-purple-500/25 blur-3xl" />
        <div className="absolute -bottom-40 -right-32 h-96 w-96 rounded-full bg-indigo-400/25 blur-3xl" />
        <div className="absolute top-1/3 right-1/4 h-64 w-64 rounded-full bg-violet-400/15 blur-3xl" />
      </div>

      <div className="relative w-full max-w-2xl text-center">
        {/* Logo */}
        <div className="mx-auto mb-6 flex h-20 w-20 items-center justify-center rounded-3xl bg-white/10 backdrop-blur-sm border border-white/20 shadow-2xl">
          <svg className="h-10 w-10 text-white" fill="none" viewBox="0 0 24 24" strokeWidth={1.5} stroke="currentColor">
            <path strokeLinecap="round" strokeLinejoin="round" d="M4.26 10.147a60.436 60.436 0 00-.491 6.347A48.627 48.627 0 0112 20.904a48.627 48.627 0 018.232-4.41 60.46 60.46 0 00-.491-6.347m-15.482 0a50.57 50.57 0 00-2.658-.813A59.905 59.905 0 0112 3.493a59.902 59.902 0 0110.399 5.84c-.896.248-1.783.52-2.658.814m-15.482 0A50.697 50.697 0 0112 13.489a50.702 50.702 0 017.74-3.342M6.75 15a.75.75 0 100-1.5.75.75 0 000 1.5zm0 0v-3.675A55.378 55.378 0 0112 8.443m-7.007 11.55A5.981 5.981 0 006.75 15.75v-1.5" />
          </svg>
        </div>

        <h1 className="mb-4 text-5xl font-bold text-white">
          Flashcard Mastery
        </h1>
        <p className="mb-10 text-lg text-indigo-200">
          Master any subject with intelligent spaced repetition using the SM-2 algorithm.
        </p>

        {/* Feature pills */}
        <div className="mb-10 flex flex-wrap justify-center gap-3">
          {['SM-2 Algorithm', 'Spaced Repetition', 'Progress Tracking', 'Keyboard Shortcuts'].map((f) => (
            <span key={f} className="rounded-full bg-white/10 px-4 py-1.5 text-sm font-medium text-indigo-100 backdrop-blur-sm border border-white/15">{f}</span>
          ))}
        </div>

        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-xl bg-white px-8 py-3.5 font-semibold text-indigo-700 shadow-lg shadow-black/20 transition-all hover:scale-[1.02] hover:shadow-black/30 active:scale-[0.98]"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="rounded-xl border border-white/30 bg-white/10 px-8 py-3.5 font-semibold text-white backdrop-blur-sm transition-all hover:bg-white/20 hover:scale-[1.02] active:scale-[0.98]"
          >
            Create Account
          </a>
        </div>
      </div>
    </main>
  )
}

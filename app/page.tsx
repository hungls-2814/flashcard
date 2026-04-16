export default function Home() {
  return (
    <main className="flex min-h-screen flex-col items-center justify-center px-4 py-12">
      <div className="w-full max-w-2xl text-center">
        <h1 className="mb-4 text-4xl font-bold text-gray-900">
          Welcome to Flashcard Mastery
        </h1>
        <p className="mb-8 text-lg text-gray-600">
          Master any subject with intelligent spaced repetition using the SM-2 algorithm.
        </p>
        <div className="flex justify-center gap-4">
          <a
            href="/login"
            className="rounded-lg bg-blue-600 px-8 py-3 font-semibold text-white hover:bg-blue-700"
          >
            Sign In
          </a>
          <a
            href="/signup"
            className="rounded-lg border-2 border-blue-600 px-8 py-3 font-semibold text-blue-600 hover:bg-blue-50"
          >
            Create Account
          </a>
        </div>
      </div>
    </main>
  )
}

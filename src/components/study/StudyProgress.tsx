'use client'

interface StudyProgressProps {
  current: number
  total: number
  loading?: boolean
}

export default function StudyProgress({
  current,
  total,
  loading = false,
}: StudyProgressProps) {
  const percentage = total > 0 ? (current / total) * 100 : 0

  return (
    <div className="space-y-3">
      {/* Counter */}
      <div className="flex items-center justify-between">
        <div>
          <p className="text-sm text-gray-600">
            Card {current} of {total}
          </p>
        </div>
        <div>
          {loading && (
            <span className="inline-flex items-center gap-1">
              <span className="inline-block animate-spin rounded-full h-3 w-3 border-b-2 border-blue-600"></span>
              <span className="text-xs text-gray-600">Loading...</span>
            </span>
          )}
        </div>
      </div>

      {/* Progress bar */}
      <div className="w-full bg-gray-200 rounded-full h-2 overflow-hidden">
        <div
          className="bg-gradient-to-r from-blue-500 to-blue-600 h-full transition-all duration-500 ease-out"
          style={{ width: `${percentage}%` }}
        />
      </div>

      {/* Percentage */}
      <p className="text-xs text-gray-500 text-center">
        {Math.round(percentage)}% complete
      </p>
    </div>
  )
}

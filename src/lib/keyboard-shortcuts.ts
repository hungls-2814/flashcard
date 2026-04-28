import { useEffect } from 'react'

export interface KeyboardShortcuts {
  flip?: () => void
  quality0?: () => void // Again
  quality2?: () => void // Hard
  quality4?: () => void // Good
  quality5?: () => void // Easy
  escape?: () => void // Exit/Cancel
}

export function useKeyboardShortcuts(shortcuts: KeyboardShortcuts) {
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      // Prevent shortcuts when typing in input fields
      const target = e.target as HTMLElement
      if (
        target.tagName === 'INPUT' ||
        target.tagName === 'TEXTAREA' ||
        target.contentEditable === 'true'
      ) {
        return
      }

      switch (e.key) {
        case 'ArrowLeft':
        case 'ArrowRight':
        case ' ':
          e.preventDefault()
          shortcuts.flip?.()
          break
        case '0':
          e.preventDefault()
          shortcuts.quality0?.()
          break
        case '1':
          e.preventDefault()
          shortcuts.quality0?.() // 1 maps to Again (quality 0)
          break
        case '2':
          e.preventDefault()
          shortcuts.quality2?.()
          break
        case '3':
          e.preventDefault()
          shortcuts.quality4?.() // 3 maps to Good (quality 4)
          break
        case '4':
          e.preventDefault()
          shortcuts.quality5?.()
          break
        case 'Escape':
          e.preventDefault()
          shortcuts.escape?.()
          break
      }
    }

    window.addEventListener('keydown', handleKeyDown)
    return () => window.removeEventListener('keydown', handleKeyDown)
  }, [shortcuts])
}

// Helper to show keyboard shortcuts hint
export const keyboardShortcutsHints = {
  flip: 'Space or Arrow keys to flip',
  quality0: '1 or 0 to answer "Again"',
  quality2: '2 to answer "Hard"',
  quality4: '3 to answer "Good"',
  quality5: '4 to answer "Easy"',
  escape: 'Esc to exit',
}

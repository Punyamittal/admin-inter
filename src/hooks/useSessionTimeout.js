import { useState, useEffect, useRef, useCallback } from 'react'

const TIMEOUT_MS = 30 * 60 * 1000   // 30 minutes total activity window
const WARNING_MS = 5 * 60 * 1000    // warn user at 5 min remaining mark

export function useSessionTimeout(onTimeout) {
  const [showWarning, setShowWarning] = useState(false)
  const [secondsLeft, setSecondsLeft] = useState(300)
  const timerRef = useRef(null)
  const warningRef = useRef(null)
  const countdownRef = useRef(null)

  const resetTimer = useCallback(() => {
    // Clear everything existing
    clearTimeout(timerRef.current)
    clearTimeout(warningRef.current)
    clearInterval(countdownRef.current)
    setShowWarning(false)
    setSecondsLeft(300)

    // Set warning trigger (at 25 min mark)
    warningRef.current = setTimeout(() => {
      setShowWarning(true)
      startCountdown()
    }, TIMEOUT_MS - WARNING_MS)

    // Set logout trigger (at 30 min mark)
    timerRef.current = setTimeout(() => {
      onTimeout()
    }, TIMEOUT_MS)
  }, [onTimeout])

  const startCountdown = () => {
    let secs = 300
    countdownRef.current = setInterval(() => {
      secs -= 1
      setSecondsLeft(secs)
      if (secs <= 0) clearInterval(countdownRef.current)
    }, 1000)
  }

  useEffect(() => {
    const events = ['mousedown', 'keydown', 'scroll', 'touchstart']
    events.forEach(e => window.addEventListener(e, resetTimer))
    
    // Start timers on initial mount
    resetTimer()

    return () => {
      events.forEach(e => window.removeEventListener(e, resetTimer))
      clearTimeout(timerRef.current)
      clearTimeout(warningRef.current)
      clearInterval(countdownRef.current)
    }
  }, [resetTimer])

  const staySignedIn = () => {
    resetTimer()
    setShowWarning(false)
  }

  return { showWarning, secondsLeft, staySignedIn }
}

// Hook to calculate elapsed time from a start timestamp – placeholder implementation.
import { useState, useEffect } from 'react'

export const useTimer = (startedAt: string) => {
  const [elapsed, setElapsed] = useState('00:00:00')
  useEffect(() => {
    const interval = setInterval(() => {
      const now = new Date()
      const start = new Date(startedAt)
      const diff = Math.floor((now.getTime() - start.getTime()) / 1000)
      setElapsed(diff.toString())
    }, 1000)
    return () => clearInterval(interval)
  }, [startedAt])
  return elapsed
}

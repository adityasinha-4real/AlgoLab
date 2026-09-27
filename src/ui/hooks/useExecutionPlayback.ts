import { useEffect } from 'react'
import { speedToDelayMs, useExecutionStore } from '../state/executionStore'

/**
 * Drives auto-play: while isPlaying, advances the cursor one step at a time
 * on a timer, re-scheduling on every cursor change so speed adjustments take
 * effect on the very next step. Stepping is still just index movement into
 * the precomputed steps array - this never re-runs the algorithm.
 */
export function useExecutionPlayback(): void {
  const isPlaying = useExecutionStore((s) => s.isPlaying)
  const speed = useExecutionStore((s) => s.speed)
  const cursor = useExecutionStore((s) => s.cursor)
  const totalSteps = useExecutionStore((s) => s.result?.steps.length ?? 0)
  const stepForward = useExecutionStore((s) => s.stepForward)
  const pause = useExecutionStore((s) => s.pause)

  useEffect(() => {
    if (!isPlaying) return
    if (cursor >= totalSteps - 1) {
      pause()
      return
    }
    const timer = setTimeout(() => stepForward(), speedToDelayMs(speed))
    return () => clearTimeout(timer)
  }, [isPlaying, speed, cursor, totalSteps, stepForward, pause])
}

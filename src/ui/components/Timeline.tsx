import { useRef, type MouseEvent } from 'react'
import { useExecutionStore } from '../state/executionStore'

export function Timeline() {
  const result = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const jumpTo = useExecutionStore((s) => s.jumpTo)
  const trackRef = useRef<HTMLDivElement>(null)

  const totalSteps = result?.steps.length ?? 0
  const hasResult = totalSteps > 0
  const progress = hasResult ? ((cursor + 1) / totalSteps) * 100 : 0

  const handleTrackClick = (event: MouseEvent<HTMLDivElement>) => {
    if (!hasResult || !trackRef.current) return
    const rect = trackRef.current.getBoundingClientRect()
    const ratio = Math.min(
      1,
      Math.max(0, (event.clientX - rect.left) / rect.width),
    )
    jumpTo(Math.round(ratio * (totalSteps - 1)))
  }

  return (
    <div className="rounded-md border border-border bg-surface-1 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
        <span>Timeline</span>
        <span>
          Step {hasResult ? cursor + 1 : 0} / {totalSteps}
        </span>
      </div>
      <div
        ref={trackRef}
        role="slider"
        aria-label="Execution timeline"
        aria-valuemin={0}
        aria-valuemax={Math.max(0, totalSteps - 1)}
        aria-valuenow={cursor}
        aria-disabled={!hasResult}
        onClick={handleTrackClick}
        className={`h-2 w-full rounded-full bg-surface-2 ${hasResult ? 'cursor-pointer' : ''}`}
      >
        <div
          className="h-2 rounded-full bg-accent"
          style={{ width: `${progress}%` }}
        />
      </div>
    </div>
  )
}

import { useExecutionPlayback } from '../hooks/useExecutionPlayback'
import {
  MAX_SPEED,
  MIN_SPEED,
  useExecutionStore,
} from '../state/executionStore'

export function ControlsBar() {
  useExecutionPlayback()

  const result = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const isPlaying = useExecutionStore((s) => s.isPlaying)
  const speed = useExecutionStore((s) => s.speed)
  const play = useExecutionStore((s) => s.play)
  const pause = useExecutionStore((s) => s.pause)
  const stepForward = useExecutionStore((s) => s.stepForward)
  const stepBackward = useExecutionStore((s) => s.stepBackward)
  const jumpToStart = useExecutionStore((s) => s.jumpToStart)
  const jumpToEnd = useExecutionStore((s) => s.jumpToEnd)
  const setSpeed = useExecutionStore((s) => s.setSpeed)

  const totalSteps = result?.steps.length ?? 0
  const hasResult = totalSteps > 0
  const atStart = cursor === 0
  const atEnd = cursor >= totalSteps - 1

  const buttons = [
    {
      label: 'Jump to start',
      symbol: '⏮',
      onClick: jumpToStart,
      disabled: !hasResult || atStart,
    },
    {
      label: 'Step back',
      symbol: '◀',
      onClick: stepBackward,
      disabled: !hasResult || atStart,
    },
    {
      label: isPlaying ? 'Pause' : 'Play',
      symbol: isPlaying ? '⏸' : '▶',
      onClick: () => (isPlaying ? pause() : play()),
      disabled: !hasResult || atEnd,
    },
    {
      label: 'Step forward',
      symbol: '▶|',
      onClick: stepForward,
      disabled: !hasResult || atEnd,
    },
    {
      label: 'Jump to end',
      symbol: '⏭',
      onClick: jumpToEnd,
      disabled: !hasResult || atEnd,
    },
  ]

  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-1 px-4 py-3">
      <div className="flex items-center gap-2">
        {buttons.map((button) => (
          <button
            key={button.label}
            type="button"
            aria-label={button.label}
            disabled={button.disabled}
            title={button.label}
            onClick={button.onClick}
            className="flex h-9 w-9 items-center justify-center rounded border border-border bg-surface-2 text-sm text-text-primary disabled:cursor-not-allowed disabled:text-text-muted"
          >
            {button.symbol}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-text-muted">
        Speed
        <input
          type="range"
          min={MIN_SPEED}
          max={MAX_SPEED}
          value={speed}
          onChange={(e) => setSpeed(Number(e.target.value))}
          className="accent-accent"
        />
      </label>
    </div>
  )
}

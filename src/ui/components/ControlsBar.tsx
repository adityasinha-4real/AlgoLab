const BUTTONS = [
  { label: 'Jump to start', symbol: '⏮' },
  { label: 'Step back', symbol: '◀' },
  { label: 'Play', symbol: '▶' },
  { label: 'Step forward', symbol: '▶|' },
  { label: 'Jump to end', symbol: '⏭' },
]

export function ControlsBar() {
  return (
    <div className="flex items-center justify-between gap-4 rounded-md border border-border bg-surface-1 px-4 py-3">
      <div className="flex items-center gap-2">
        {BUTTONS.map((button) => (
          <button
            key={button.label}
            type="button"
            aria-label={button.label}
            disabled
            title={`${button.label} (enabled once an algorithm can run)`}
            className="flex h-9 w-9 items-center justify-center rounded border border-border bg-surface-2 text-sm text-text-muted disabled:cursor-not-allowed"
          >
            {button.symbol}
          </button>
        ))}
      </div>
      <label className="flex items-center gap-2 text-sm text-text-muted">
        Speed
        <input
          type="range"
          min={1}
          max={5}
          defaultValue={3}
          disabled
          className="accent-accent"
        />
      </label>
    </div>
  )
}

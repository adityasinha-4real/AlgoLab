export function Timeline() {
  return (
    <div className="rounded-md border border-border bg-surface-1 px-4 py-3">
      <div className="mb-2 flex items-center justify-between text-xs text-text-muted">
        <span>Timeline</span>
        <span>Step 0 / 0</span>
      </div>
      <div
        role="slider"
        aria-label="Execution timeline"
        aria-valuemin={0}
        aria-valuemax={0}
        aria-valuenow={0}
        aria-disabled="true"
        className="h-2 w-full rounded-full bg-surface-2"
      >
        <div className="h-2 w-0 rounded-full bg-accent" />
      </div>
    </div>
  )
}

export function PseudocodePanel() {
  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">Pseudocode</h2>
      <p className="rounded border border-dashed border-border px-2 py-2 text-xs text-text-muted">
        Synchronized pseudocode with line highlighting arrives alongside each
        algorithm, starting with BFS/DFS in M4.
      </p>
    </div>
  )
}

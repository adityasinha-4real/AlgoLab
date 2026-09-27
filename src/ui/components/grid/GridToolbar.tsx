import { useState } from 'react'
import { runAStarGrid } from '../../../core/algorithms/astarGrid'
import { useExecutionStore } from '../../state/executionStore'
import { useGridStore, type PaintMode } from '../../state/gridStore'

const PAINT_MODES: { id: PaintMode; label: string }[] = [
  { id: 'wall', label: 'Walls' },
  { id: 'terrain', label: 'Terrain' },
  { id: 'start', label: 'Start' },
  { id: 'target', label: 'Target' },
]

export function GridToolbar() {
  const paintMode = useGridStore((s) => s.paintMode)
  const setPaintMode = useGridStore((s) => s.setPaintMode)
  const clearWallsAndTerrain = useGridStore((s) => s.clearWallsAndTerrain)
  const resetGrid = useGridStore((s) => s.reset)
  const grid = useGridStore((s) => s.grid)
  const load = useExecutionStore((s) => s.load)
  const [runError, setRunError] = useState<string | null>(null)

  const canRun = Boolean(grid.startId && grid.targetId)

  const handleRun = () => {
    try {
      setRunError(null)
      load(runAStarGrid(grid))
    } catch (error) {
      setRunError(error instanceof Error ? error.message : 'Failed to run A*.')
    }
  }

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm">
      <span className="text-xs text-text-muted">Paint:</span>
      {PAINT_MODES.map((m) => (
        <button
          key={m.id}
          type="button"
          onClick={() => setPaintMode(m.id)}
          className={`rounded border px-2.5 py-1 ${
            paintMode === m.id
              ? 'border-accent text-accent'
              : 'border-border text-text-primary'
          }`}
        >
          {m.label}
        </button>
      ))}

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={clearWallsAndTerrain}
        className="rounded border border-border px-2.5 py-1 text-text-muted"
      >
        Clear walls/terrain
      </button>
      <button
        type="button"
        onClick={resetGrid}
        className="rounded border border-border px-2.5 py-1 text-text-muted"
      >
        Reset grid
      </button>

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={handleRun}
        disabled={!canRun}
        className="rounded border border-accent px-2.5 py-1 font-medium text-accent disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted"
      >
        Run A* (Grid)
      </button>

      {!canRun && (
        <span className="text-xs text-amber-300">
          Set both a start and target cell.
        </span>
      )}
      {runError && <span className="text-xs text-rose-400">{runError}</span>}
    </div>
  )
}

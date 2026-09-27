import { useCallback } from 'react'
import { cellId } from '../../../core/grid'
import { nodeStatus } from '../graph/algorithmOverlay'
import { getCurrentStep, useExecutionStore } from '../../state/executionStore'
import { useGridStore } from '../../state/gridStore'

const STATUS_BG: Record<string, string> = {
  default: '',
  frontier: 'bg-amber-400/25',
  visited: 'bg-accent/20',
  current: 'bg-accent',
  path: 'bg-emerald-400',
}

export function GridCanvas() {
  const grid = useGridStore((s) => s.grid)
  const paintCell = useGridStore((s) => s.paintCell)
  const paintMode = useGridStore((s) => s.paintMode)
  const isPainting = useGridStore((s) => s.isPainting)
  const startPainting = useGridStore((s) => s.startPainting)
  const stopPainting = useGridStore((s) => s.stopPainting)

  const result = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const step = getCurrentStep({ result, cursor })

  const handleCellDown = useCallback(
    (row: number, col: number) => {
      startPainting()
      paintCell(row, col)
    },
    [startPainting, paintCell],
  )

  const handleCellEnter = useCallback(
    (row: number, col: number) => {
      if (isPainting && paintMode === 'wall') paintCell(row, col)
    },
    [isPainting, paintMode, paintCell],
  )

  return (
    <div
      className="h-full min-h-[420px] w-full overflow-auto rounded-md border border-border bg-surface-1 p-3"
      onMouseUp={stopPainting}
      onMouseLeave={stopPainting}
    >
      <div
        className="grid gap-0.5"
        style={{
          gridTemplateColumns: `repeat(${grid.cols}, minmax(24px, 1fr))`,
        }}
      >
        {grid.cells.map((cell) => {
          const id = cellId(cell.row, cell.col)
          const isStart = grid.startId === id
          const isTarget = grid.targetId === id
          const status = nodeStatus(id, step)
          const ring = isStart
            ? 'ring-2 ring-emerald-400'
            : isTarget
              ? 'ring-2 ring-rose-400'
              : ''

          return (
            <button
              key={id}
              type="button"
              aria-label={`Cell ${cell.row},${cell.col}`}
              onMouseDown={() => handleCellDown(cell.row, cell.col)}
              onMouseEnter={() => handleCellEnter(cell.row, cell.col)}
              className={`flex aspect-square items-center justify-center rounded-sm text-[10px] font-medium ${ring} ${
                cell.isWall
                  ? 'bg-surface-0'
                  : (STATUS_BG[status] ?? '') || 'bg-surface-2'
              }`}
            >
              {!cell.isWall && cell.terrainCost > 1 ? cell.terrainCost : ''}
            </button>
          )
        })}
      </div>
    </div>
  )
}

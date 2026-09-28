import { useCallback } from 'react'
import { cellId } from '../../../core/grid'
import { nodeStatus } from '../graph/algorithmOverlay'
import { getCurrentStep, useExecutionStore } from '../../state/executionStore'
import { useGridStore } from '../../state/gridStore'
import { GridCell } from './GridCell'

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
      role="application"
      aria-label="Grid editor canvas"
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
          return (
            <GridCell
              key={id}
              row={cell.row}
              col={cell.col}
              isWall={cell.isWall}
              terrainCost={cell.terrainCost}
              isStart={grid.startId === id}
              isTarget={grid.targetId === id}
              status={nodeStatus(id, step)}
              onCellDown={handleCellDown}
              onCellEnter={handleCellEnter}
            />
          )
        })}
      </div>
    </div>
  )
}

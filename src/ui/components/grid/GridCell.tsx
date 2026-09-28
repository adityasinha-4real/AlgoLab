import { memo } from 'react'
import type { NodeAlgorithmStatus } from '../graph/GraphNodeView'

const STATUS_BG: Record<NodeAlgorithmStatus, string> = {
  default: '',
  frontier: 'bg-amber-400/25',
  visited: 'bg-accent/20',
  current: 'bg-accent',
  path: 'bg-emerald-400',
}

interface GridCellProps {
  row: number
  col: number
  isWall: boolean
  terrainCost: number
  isStart: boolean
  isTarget: boolean
  status: NodeAlgorithmStatus
  onCellDown: (row: number, col: number) => void
  onCellEnter: (row: number, col: number) => void
}

// A grid can have hundreds of cells re-rendered on every paint stroke or
// algorithm step; memoizing means only the cells whose own props actually
// changed re-render instead of the whole grid.
export const GridCell = memo(function GridCell({
  row,
  col,
  isWall,
  terrainCost,
  isStart,
  isTarget,
  status,
  onCellDown,
  onCellEnter,
}: GridCellProps) {
  const ring = isStart
    ? 'ring-2 ring-emerald-400'
    : isTarget
      ? 'ring-2 ring-rose-400'
      : ''

  return (
    <button
      type="button"
      aria-label={`Cell ${row},${col}`}
      onMouseDown={() => onCellDown(row, col)}
      onMouseEnter={() => onCellEnter(row, col)}
      className={`flex aspect-square items-center justify-center rounded-sm text-[10px] font-medium ${ring} ${
        isWall ? 'bg-surface-0' : STATUS_BG[status] || 'bg-surface-2'
      }`}
    >
      {!isWall && terrainCost > 1 ? terrainCost : ''}
    </button>
  )
})

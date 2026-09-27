import { cellId, type Grid, type GridCell } from './types'

export const MAX_TERRAIN_COST = 3

export function createGrid(rows: number, cols: number): Grid {
  const cells: GridCell[] = []
  for (let row = 0; row < rows; row++) {
    for (let col = 0; col < cols; col++) {
      cells.push({ row, col, isWall: false, terrainCost: 1 })
    }
  }
  return { rows, cols, cells, startId: null, targetId: null }
}

function indexOf(grid: Grid, row: number, col: number): number {
  return row * grid.cols + col
}

export function getCell(
  grid: Grid,
  row: number,
  col: number,
): GridCell | undefined {
  if (row < 0 || row >= grid.rows || col < 0 || col >= grid.cols)
    return undefined
  return grid.cells[indexOf(grid, row, col)]
}

function updateCell(
  grid: Grid,
  row: number,
  col: number,
  update: (cell: GridCell) => GridCell,
): Grid {
  const index = indexOf(grid, row, col)
  if (index < 0 || index >= grid.cells.length) return grid
  const cells = [...grid.cells]
  cells[index] = update(cells[index])
  return { ...grid, cells }
}

export function toggleWall(grid: Grid, row: number, col: number): Grid {
  const id = cellId(row, col)
  if (grid.startId === id || grid.targetId === id) return grid
  return updateCell(grid, row, col, (cell) => ({
    ...cell,
    isWall: !cell.isWall,
  }))
}

export function cycleTerrainCost(grid: Grid, row: number, col: number): Grid {
  return updateCell(grid, row, col, (cell) => ({
    ...cell,
    terrainCost: (cell.terrainCost % MAX_TERRAIN_COST) + 1,
  }))
}

export function setStartCell(grid: Grid, row: number, col: number): Grid {
  const id = cellId(row, col)
  const cell = getCell(grid, row, col)
  if (!cell || cell.isWall || id === grid.targetId) return grid
  return { ...grid, startId: id }
}

export function setTargetCell(grid: Grid, row: number, col: number): Grid {
  const id = cellId(row, col)
  const cell = getCell(grid, row, col)
  if (!cell || cell.isWall || id === grid.startId) return grid
  return { ...grid, targetId: id }
}

export function clearWalls(grid: Grid): Grid {
  return { ...grid, cells: grid.cells.map((c) => ({ ...c, isWall: false })) }
}

/** 4-directional neighbors (no diagonals), excluding walls and out-of-bounds -
 * required for the Manhattan heuristic to stay admissible. */
export function gridNeighbors(
  grid: Grid,
  row: number,
  col: number,
): GridCell[] {
  const deltas = [
    [-1, 0],
    [1, 0],
    [0, -1],
    [0, 1],
  ]
  const neighbors: GridCell[] = []
  for (const [dr, dc] of deltas) {
    const cell = getCell(grid, row + dr, col + dc)
    if (cell && !cell.isWall) neighbors.push(cell)
  }
  return neighbors
}

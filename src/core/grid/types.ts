export interface GridCell {
  row: number
  col: number
  isWall: boolean
  /** Cost to move into this cell; always >= 1 so the Manhattan heuristic stays admissible. */
  terrainCost: number
}

export interface Grid {
  rows: number
  cols: number
  cells: GridCell[]
  startId: string | null
  targetId: string | null
}

export function cellId(row: number, col: number): string {
  return `${row},${col}`
}

export function parseCellId(id: string): { row: number; col: number } {
  const [row, col] = id.split(',').map(Number)
  return { row, col }
}

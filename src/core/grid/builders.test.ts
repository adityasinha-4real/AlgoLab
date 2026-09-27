import { describe, expect, it } from 'vitest'
import {
  clearWalls,
  createGrid,
  cycleTerrainCost,
  getCell,
  gridNeighbors,
  MAX_TERRAIN_COST,
  setStartCell,
  setTargetCell,
  toggleWall,
} from './builders'
import { cellId, parseCellId } from './types'

describe('cellId / parseCellId', () => {
  it('round-trips row and col', () => {
    expect(parseCellId(cellId(3, 5))).toEqual({ row: 3, col: 5 })
  })
})

describe('createGrid', () => {
  it('creates the requested dimensions with all cells walkable', () => {
    const grid = createGrid(4, 6)
    expect(grid.rows).toBe(4)
    expect(grid.cols).toBe(6)
    expect(grid.cells).toHaveLength(24)
    expect(grid.cells.every((c) => !c.isWall && c.terrainCost === 1)).toBe(true)
  })
})

describe('toggleWall', () => {
  it('toggles a cell between wall and open', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 1, 1)
    expect(getCell(grid, 1, 1)?.isWall).toBe(true)
    grid = toggleWall(grid, 1, 1)
    expect(getCell(grid, 1, 1)?.isWall).toBe(false)
  })

  it('refuses to wall off the start or target cell', () => {
    let grid = createGrid(3, 3)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 2, 2)
    grid = toggleWall(grid, 0, 0)
    grid = toggleWall(grid, 2, 2)
    expect(getCell(grid, 0, 0)?.isWall).toBe(false)
    expect(getCell(grid, 2, 2)?.isWall).toBe(false)
  })
})

describe('cycleTerrainCost', () => {
  it('cycles 1 -> 2 -> 3 -> 1', () => {
    let grid = createGrid(2, 2)
    expect(getCell(grid, 0, 0)?.terrainCost).toBe(1)
    grid = cycleTerrainCost(grid, 0, 0)
    expect(getCell(grid, 0, 0)?.terrainCost).toBe(2)
    grid = cycleTerrainCost(grid, 0, 0)
    expect(getCell(grid, 0, 0)?.terrainCost).toBe(3)
    grid = cycleTerrainCost(grid, 0, 0)
    expect(getCell(grid, 0, 0)?.terrainCost).toBe(1)
  })

  it('never exceeds MAX_TERRAIN_COST', () => {
    let grid = createGrid(2, 2)
    for (let i = 0; i < 10; i++) grid = cycleTerrainCost(grid, 0, 0)
    expect(getCell(grid, 0, 0)!.terrainCost).toBeLessThanOrEqual(
      MAX_TERRAIN_COST,
    )
    expect(getCell(grid, 0, 0)!.terrainCost).toBeGreaterThanOrEqual(1)
  })
})

describe('setStartCell / setTargetCell', () => {
  it('sets the start and target ids', () => {
    let grid = createGrid(3, 3)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 2, 2)
    expect(grid.startId).toBe(cellId(0, 0))
    expect(grid.targetId).toBe(cellId(2, 2))
  })

  it('refuses to place start/target on a wall', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 1, 1)
    grid = setStartCell(grid, 1, 1)
    expect(grid.startId).toBeNull()
  })

  it('refuses to place start and target on the same cell', () => {
    let grid = createGrid(3, 3)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 0, 0)
    expect(grid.targetId).toBeNull()
  })
})

describe('clearWalls', () => {
  it('removes every wall', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 0, 0)
    grid = toggleWall(grid, 1, 1)
    grid = clearWalls(grid)
    expect(grid.cells.every((c) => !c.isWall)).toBe(true)
  })
})

describe('gridNeighbors', () => {
  it('returns up to 4 orthogonal neighbors, never diagonals', () => {
    const grid = createGrid(3, 3)
    const neighbors = gridNeighbors(grid, 1, 1)
    expect(neighbors).toHaveLength(4)
    expect(neighbors.map((n) => [n.row, n.col]).sort()).toEqual(
      [
        [0, 1],
        [2, 1],
        [1, 0],
        [1, 2],
      ].sort(),
    )
  })

  it('excludes out-of-bounds and wall neighbors', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 0, 1)
    const neighbors = gridNeighbors(grid, 0, 0)
    // corner (0,0) has only 2 in-bounds neighbors: (1,0) and (0,1); (0,1) is walled.
    expect(neighbors).toHaveLength(1)
    expect(neighbors[0]).toMatchObject({ row: 1, col: 0 })
  })
})

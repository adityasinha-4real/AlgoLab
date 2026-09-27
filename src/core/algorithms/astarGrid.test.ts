import { describe, expect, it } from 'vitest'
import {
  createGrid,
  setStartCell,
  setTargetCell,
  toggleWall,
} from '../grid/builders'
import type { Grid } from '../grid/types'
import { runAStarGrid } from './astarGrid'

describe('runAStarGrid', () => {
  it('throws when start or target is missing', () => {
    expect(() => runAStarGrid(createGrid(3, 3))).toThrow(/start and target/)
  })

  it('finds the shortest path on an open grid (Manhattan distance in steps)', () => {
    let grid = createGrid(5, 5)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 4, 4)

    const result = runAStarGrid(grid)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    // Manhattan distance 0,0 -> 4,4 is 8; path includes both endpoints.
    expect(last.state.path).toHaveLength(9)
  })

  it('reports no-path when the target is fully walled off', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 0, 1)
    grid = toggleWall(grid, 1, 1)
    grid = toggleWall(grid, 2, 1)
    grid = setStartCell(grid, 1, 0)
    grid = setTargetCell(grid, 1, 2)

    const result = runAStarGrid(grid)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
  })

  it('finds a path that goes around a partial wall', () => {
    let grid = createGrid(3, 3)
    grid = toggleWall(grid, 0, 1)
    grid = toggleWall(grid, 1, 1)
    // (2,1) stays open, so the path must detour through the bottom row.
    grid = setStartCell(grid, 1, 0)
    grid = setTargetCell(grid, 1, 2)

    const result = runAStarGrid(grid)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    expect(last.state.path).toContain('2,1')
  })

  it('prefers a longer but cheaper route when terrain cost makes the direct path expensive', () => {
    // Middle row, left to right: direct path (1,0)->(1,1)->(1,2) costs 5+1=6
    // (an extreme cost set directly, past the UI's cycling cap, to make the
    // comparison unambiguous). Detouring via row 0 costs 1+1+1+1=4, strictly
    // cheaper despite being two steps longer - correct only if A* is truly
    // weighing terrain cost rather than just minimizing step count.
    const grid: Grid = {
      rows: 3,
      cols: 3,
      startId: '1,0',
      targetId: '1,2',
      cells: [],
    }
    for (let row = 0; row < 3; row++) {
      for (let col = 0; col < 3; col++) {
        grid.cells.push({
          row,
          col,
          isWall: false,
          terrainCost: row === 1 && col === 1 ? 5 : 1,
        })
      }
    }

    const result = runAStarGrid(grid)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    expect(last.state.path).not.toContain('1,1')
    expect(result.metrics.pathCost).toBe(4)
  })

  it('is deterministic across repeated runs on the same grid', () => {
    let grid = createGrid(4, 4)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 3, 3)
    const a = runAStarGrid(grid)
    const b = runAStarGrid(grid)
    const strip = (r: typeof a) =>
      r.steps.map(({ type, pseudocodeLine, explanation, state }) => ({
        type,
        pseudocodeLine,
        explanation,
        state,
      }))
    expect(strip(a)).toEqual(strip(b))
  })

  it('records a heuristic for every node it assigns a distance to', () => {
    let grid = createGrid(3, 3)
    grid = setStartCell(grid, 0, 0)
    grid = setTargetCell(grid, 2, 2)
    const result = runAStarGrid(grid)
    const last = result.steps[result.steps.length - 1]
    for (const id of Object.keys(last.state.distances)) {
      expect(last.state.heuristics[id]).toBeDefined()
    }
  })
})

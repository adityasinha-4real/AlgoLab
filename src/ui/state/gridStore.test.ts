import { beforeEach, describe, expect, it } from 'vitest'
import { getCell } from '../../core/grid'
import { DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS, useGridStore } from './gridStore'

beforeEach(() => {
  useGridStore.getState().reset()
})

describe('gridStore', () => {
  it('starts with a default grid that already has a start and target', () => {
    const { grid } = useGridStore.getState()
    expect(grid.rows).toBe(DEFAULT_GRID_ROWS)
    expect(grid.cols).toBe(DEFAULT_GRID_COLS)
    expect(grid.startId).not.toBeNull()
    expect(grid.targetId).not.toBeNull()
  })

  it('paintCell toggles a wall when paintMode is "wall"', () => {
    useGridStore.getState().setPaintMode('wall')
    useGridStore.getState().paintCell(3, 3)
    expect(getCell(useGridStore.getState().grid, 3, 3)?.isWall).toBe(true)
  })

  it('paintCell cycles terrain cost when paintMode is "terrain"', () => {
    useGridStore.getState().setPaintMode('terrain')
    useGridStore.getState().paintCell(2, 2)
    expect(getCell(useGridStore.getState().grid, 2, 2)?.terrainCost).toBe(2)
  })

  it('paintCell moves the start/target when paintMode is "start"/"target"', () => {
    useGridStore.getState().setPaintMode('start')
    useGridStore.getState().paintCell(0, 0)
    expect(useGridStore.getState().grid.startId).toBe('0,0')

    useGridStore.getState().setPaintMode('target')
    useGridStore.getState().paintCell(1, 1)
    expect(useGridStore.getState().grid.targetId).toBe('1,1')
  })

  it('clearWallsAndTerrain removes walls and resets terrain cost, keeping start/target', () => {
    const { startId, targetId } = useGridStore.getState().grid
    useGridStore.getState().setPaintMode('wall')
    useGridStore.getState().paintCell(5, 5)
    useGridStore.getState().setPaintMode('terrain')
    useGridStore.getState().paintCell(2, 2)

    useGridStore.getState().clearWallsAndTerrain()

    const { grid } = useGridStore.getState()
    expect(grid.cells.every((c) => !c.isWall && c.terrainCost === 1)).toBe(true)
    expect(grid.startId).toBe(startId)
    expect(grid.targetId).toBe(targetId)
  })

  it('reset restores the default grid', () => {
    useGridStore.getState().setPaintMode('wall')
    useGridStore.getState().paintCell(0, 0)
    useGridStore.getState().reset()
    expect(getCell(useGridStore.getState().grid, 0, 0)?.isWall).toBe(false)
  })
})

import { create } from 'zustand'
import {
  clearWalls,
  createGrid,
  cycleTerrainCost,
  setStartCell,
  setTargetCell,
  toggleWall,
} from '../../core/grid'
import type { Grid } from '../../core/grid'

export const DEFAULT_GRID_ROWS = 10
export const DEFAULT_GRID_COLS = 16

export type PaintMode = 'wall' | 'terrain' | 'start' | 'target'

interface GridStoreState {
  grid: Grid
  paintMode: PaintMode
  isPainting: boolean

  setPaintMode: (mode: PaintMode) => void
  paintCell: (row: number, col: number) => void
  startPainting: () => void
  stopPainting: () => void
  clearWallsAndTerrain: () => void
  reset: () => void
}

function defaultGrid(): Grid {
  let grid = createGrid(DEFAULT_GRID_ROWS, DEFAULT_GRID_COLS)
  grid = setStartCell(grid, Math.floor(DEFAULT_GRID_ROWS / 2), 1)
  grid = setTargetCell(
    grid,
    Math.floor(DEFAULT_GRID_ROWS / 2),
    DEFAULT_GRID_COLS - 2,
  )
  return grid
}

export const useGridStore = create<GridStoreState>((set, get) => ({
  grid: defaultGrid(),
  paintMode: 'wall',
  isPainting: false,

  setPaintMode: (mode) => set({ paintMode: mode }),

  paintCell: (row, col) => {
    const { grid, paintMode } = get()
    switch (paintMode) {
      case 'wall':
        set({ grid: toggleWall(grid, row, col) })
        break
      case 'terrain':
        set({ grid: cycleTerrainCost(grid, row, col) })
        break
      case 'start':
        set({ grid: setStartCell(grid, row, col) })
        break
      case 'target':
        set({ grid: setTargetCell(grid, row, col) })
        break
    }
  },

  startPainting: () => set({ isPainting: true }),
  stopPainting: () => set({ isPainting: false }),

  clearWallsAndTerrain: () =>
    set((state) => {
      const cleared = clearWalls(state.grid)
      return {
        grid: {
          ...cleared,
          cells: cleared.cells.map((c) => ({ ...c, terrainCost: 1 })),
        },
      }
    }),

  reset: () => set({ grid: defaultGrid() }),
}))

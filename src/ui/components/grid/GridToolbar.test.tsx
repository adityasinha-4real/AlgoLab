import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useExecutionStore } from '../../state/executionStore'
import { useGridStore } from '../../state/gridStore'
import { GridToolbar } from './GridToolbar'

beforeEach(() => {
  useGridStore.getState().reset()
  useExecutionStore.getState().reset()
})

describe('GridToolbar', () => {
  it('switches paint mode when clicked', () => {
    render(<GridToolbar />)
    fireEvent.click(screen.getByRole('button', { name: 'Terrain' }))
    expect(useGridStore.getState().paintMode).toBe('terrain')
  })

  it('runs A* on the grid and loads a result', () => {
    render(<GridToolbar />)
    fireEvent.click(screen.getByRole('button', { name: 'Run A* (Grid)' }))
    const { result } = useExecutionStore.getState()
    expect(result?.algorithmId).toBe('astar')
    expect(result?.steps.length).toBeGreaterThan(0)
  })

  it('disables Run and shows a hint when start or target is missing', () => {
    useGridStore.setState((state) => ({
      grid: { ...state.grid, targetId: null },
    }))
    render(<GridToolbar />)
    expect(screen.getByRole('button', { name: 'Run A* (Grid)' })).toBeDisabled()
    expect(
      screen.getByText(/Set both a start and target cell/),
    ).toBeInTheDocument()
  })

  it('clearWallsAndTerrain resets walls via the toolbar button', () => {
    useGridStore.getState().setPaintMode('wall')
    useGridStore.getState().paintCell(0, 0)
    render(<GridToolbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear walls/terrain' }))

    expect(useGridStore.getState().grid.cells.every((c) => !c.isWall)).toBe(
      true,
    )
  })
})

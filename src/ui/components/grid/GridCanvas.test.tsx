import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { runAStarGrid } from '../../../core/algorithms/astarGrid'
import { getCell } from '../../../core/grid'
import { useExecutionStore } from '../../state/executionStore'
import { useGridStore } from '../../state/gridStore'
import { GridCanvas } from './GridCanvas'

beforeEach(() => {
  useGridStore.getState().reset()
  useExecutionStore.getState().reset()
})

describe('GridCanvas', () => {
  it('renders one cell button per grid cell', () => {
    render(<GridCanvas />)
    const { grid } = useGridStore.getState()
    expect(screen.getAllByRole('button')).toHaveLength(grid.rows * grid.cols)
  })

  it('toggles a wall on mousedown while in wall paint mode', () => {
    useGridStore.getState().setPaintMode('wall')
    render(<GridCanvas />)

    fireEvent.mouseDown(screen.getByLabelText('Cell 3,3'))

    expect(getCell(useGridStore.getState().grid, 3, 3)?.isWall).toBe(true)
  })

  it('paints additional walls on mouseEnter while dragging', () => {
    useGridStore.getState().setPaintMode('wall')
    render(<GridCanvas />)

    fireEvent.mouseDown(screen.getByLabelText('Cell 1,1'))
    fireEvent.mouseEnter(screen.getByLabelText('Cell 1,2'))

    expect(getCell(useGridStore.getState().grid, 1, 1)?.isWall).toBe(true)
    expect(getCell(useGridStore.getState().grid, 1, 2)?.isWall).toBe(true)
  })

  it('does not drag-paint terrain or start/target modes', () => {
    useGridStore.getState().setPaintMode('terrain')
    render(<GridCanvas />)

    fireEvent.mouseDown(screen.getByLabelText('Cell 1,1'))
    fireEvent.mouseEnter(screen.getByLabelText('Cell 1,2'))

    expect(getCell(useGridStore.getState().grid, 1, 1)?.terrainCost).toBe(2)
    expect(getCell(useGridStore.getState().grid, 1, 2)?.terrainCost).toBe(1)
  })

  it('renders algorithm status colors once a result is loaded', () => {
    const { grid } = useGridStore.getState()
    useExecutionStore.getState().load(runAStarGrid(grid))
    useExecutionStore.getState().jumpToEnd()

    render(<GridCanvas />)

    const startId = grid.startId!.split(',').map(Number)
    const startCellButton = screen.getByLabelText(
      `Cell ${startId[0]},${startId[1]}`,
    )
    expect(startCellButton.className).toContain('bg-emerald-400')
  })
})

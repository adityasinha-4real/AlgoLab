import { fireEvent, render, screen, waitFor } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { useGraphStore } from '../../state/graphStore'
import { GraphToolbar } from './GraphToolbar'

beforeEach(() => {
  useGraphStore.getState().clear()
  useGraphStore.setState({ isAddingNode: false, newEdgeDirected: false })
})

describe('GraphToolbar', () => {
  it('toggles add-node mode when clicked', () => {
    render(<GraphToolbar />)
    const button = screen.getByRole('button', { name: '+ Add node' })

    fireEvent.click(button)

    expect(useGraphStore.getState().isAddingNode).toBe(true)
    expect(screen.getByText('Click canvas to place…')).toBeInTheDocument()
  })

  it('loads a preset graph into the store', () => {
    render(<GraphToolbar />)

    fireEvent.change(screen.getByDisplayValue('Load preset…'), {
      target: { value: 'simple-path' },
    })

    expect(useGraphStore.getState().graph.nodes).toHaveLength(4)
  })

  it('generates a random graph with the default node count', () => {
    render(<GraphToolbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Random graph' }))

    expect(useGraphStore.getState().graph.nodes).toHaveLength(8)
  })

  it('clears the graph', () => {
    useGraphStore.getState().addNodeAt(0, 0)
    render(<GraphToolbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(useGraphStore.getState().graph.nodes).toHaveLength(0)
  })

  it('copies a share link to the clipboard', async () => {
    const writeText = vi.fn().mockResolvedValue(undefined)
    Object.assign(navigator, { clipboard: { writeText } })

    useGraphStore.getState().addNodeAt(0, 0)
    render(<GraphToolbar />)

    fireEvent.click(screen.getByRole('button', { name: 'Copy share link' }))

    await waitFor(() => expect(writeText).toHaveBeenCalledTimes(1))
    expect(writeText.mock.calls[0][0]).toContain('?s=')
    await waitFor(() =>
      expect(
        screen.getByRole('button', { name: 'Link copied!' }),
      ).toBeInTheDocument(),
    )
  })
})

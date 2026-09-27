import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGraphStore } from '../../state/graphStore'
import { SelectionInspector } from './SelectionInspector'

beforeEach(() => {
  useGraphStore.getState().clear()
})

describe('SelectionInspector', () => {
  it('shows a hint when nothing is selected', () => {
    render(<SelectionInspector />)
    expect(
      screen.getByText('Select a node or edge to inspect and edit it.'),
    ).toBeInTheDocument()
  })

  it('shows node controls and marks the node as start', () => {
    const { addNodeAt, select } = useGraphStore.getState()
    addNodeAt(0, 0)
    const node = useGraphStore.getState().graph.nodes[0]
    select({ kind: 'node', id: node.id })

    render(<SelectionInspector />)
    fireEvent.click(screen.getByRole('button', { name: 'Set as start' }))

    expect(useGraphStore.getState().graph.startNodeId).toBe(node.id)
  })

  it('deletes the selected node', () => {
    const { addNodeAt, select } = useGraphStore.getState()
    addNodeAt(0, 0)
    const node = useGraphStore.getState().graph.nodes[0]
    select({ kind: 'node', id: node.id })

    render(<SelectionInspector />)
    fireEvent.click(screen.getByRole('button', { name: 'Delete node' }))

    expect(useGraphStore.getState().graph.nodes).toHaveLength(0)
  })

  it('shows edge controls and updates weight', () => {
    const { addNodeAt, connectNodes, select } = useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    const edge = useGraphStore.getState().graph.edges[0]
    select({ kind: 'edge', id: edge.id })

    render(<SelectionInspector />)
    fireEvent.change(screen.getByRole('spinbutton'), {
      target: { value: '9' },
    })

    expect(useGraphStore.getState().graph.edges[0].weight).toBe(9)
  })
})

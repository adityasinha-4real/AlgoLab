import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { useGraphStore } from '../../state/graphStore'
import { ErrorBanner } from './ErrorBanner'

beforeEach(() => {
  useGraphStore.getState().clear()
})

describe('ErrorBanner', () => {
  it('renders nothing for an empty graph', () => {
    const { container } = render(<ErrorBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('renders nothing once the graph is valid', () => {
    const { addNodeAt, connectNodes, markStart, markTarget } =
      useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    markStart(a.id)
    markTarget(b.id)

    const { container } = render(<ErrorBanner />)
    expect(container).toBeEmptyDOMElement()
  })

  it('reports a missing target', () => {
    useGraphStore.getState().addNodeAt(0, 0)
    render(<ErrorBanner />)
    expect(
      screen.getByText('No target node has been selected.'),
    ).toBeInTheDocument()
  })
})

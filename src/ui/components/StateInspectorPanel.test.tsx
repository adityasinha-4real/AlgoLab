import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { runAStar } from '../../core/algorithms/astar'
import { GRAPH_PRESETS } from '../../core/graph/presets'
import { createFixtureExecutionResult } from '../../test/fixtures'
import { useExecutionStore } from '../state/executionStore'
import { useGraphStore } from '../state/graphStore'
import { StateInspectorPanel } from './StateInspectorPanel'

beforeEach(() => {
  useExecutionStore.getState().reset()
  useGraphStore.getState().clear()
  useGraphStore.setState({
    graph: {
      nodes: [
        { id: 'a', label: 'A', x: 0, y: 0 },
        { id: 'b', label: 'B', x: 0, y: 0 },
      ],
      edges: [],
      startNodeId: 'a',
      targetNodeId: 'b',
    },
  })
})

describe('StateInspectorPanel', () => {
  it('shows a hint when no algorithm has run', () => {
    render(<StateInspectorPanel />)
    expect(screen.getByText(/Run an algorithm to inspect/)).toBeInTheDocument()
  })

  it('renders visited, frontier, and distances using node labels at the current step', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    useExecutionStore.getState().stepForward()

    render(<StateInspectorPanel />)

    expect(screen.getAllByText('A').length).toBeGreaterThan(0)
    expect(screen.getByText('A: 0, B: 1')).toBeInTheDocument()
    expect(screen.getByText('B ← A')).toBeInTheDocument()
  })

  it('renders the final path once the algorithm completes', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    useExecutionStore.getState().jumpToEnd()

    render(<StateInspectorPanel />)

    expect(screen.getByText('A → B')).toBeInTheDocument()
  })

  it('shows a Heuristic/f section only for algorithms that populate it (A*)', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    const result = runAStar(GRAPH_PRESETS['simple-path'].build())
    useExecutionStore.getState().load(result)
    useExecutionStore.getState().jumpToEnd()

    render(<StateInspectorPanel />)

    expect(screen.getByText('Heuristic (h) / f = g + h')).toBeInTheDocument()
  })

  it('omits the Heuristic/f section for algorithms that do not use one (BFS fixture)', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    useExecutionStore.getState().jumpToEnd()

    render(<StateInspectorPanel />)

    expect(screen.queryByText('Heuristic (h) / f = g + h')).toBeNull()
  })
})

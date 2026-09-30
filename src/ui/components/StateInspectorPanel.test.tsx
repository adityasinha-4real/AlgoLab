import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { runAStar } from '../../core/algorithms/astar'
import { runBellmanFord } from '../../core/algorithms/bellmanFord'
import { runFloydWarshall } from '../../core/algorithms/floydWarshall'
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

  it('shows the relaxation pass number for Bellman-Ford', () => {
    const result = runBellmanFord(GRAPH_PRESETS['simple-path'].build())
    useExecutionStore.getState().load(result)
    useExecutionStore.getState().stepForward()

    render(<StateInspectorPanel />)

    expect(screen.getByText('Relaxation pass')).toBeInTheDocument()
  })

  it('omits the relaxation pass section for algorithms that do not use one', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())

    render(<StateInspectorPanel />)

    expect(screen.queryByText('Relaxation pass')).toBeNull()
  })

  it('renders the all-pairs distance matrix for Floyd-Warshall', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    useGraphStore.getState().setGraph(graph)
    useExecutionStore.getState().load(runFloydWarshall(graph))
    useExecutionStore.getState().jumpToEnd()

    render(<StateInspectorPanel />)

    const table = screen.getByRole('table', {
      name: 'All-pairs distance matrix',
    })
    expect(table).toBeInTheDocument()
    expect(screen.getAllByRole('row')).toHaveLength(graph.nodes.length + 1)
  })

  it('omits the distance matrix for other algorithms', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())

    render(<StateInspectorPanel />)

    expect(screen.queryByText('Distance matrix')).toBeNull()
  })
})

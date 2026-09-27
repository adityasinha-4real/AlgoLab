import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GRAPH_PRESETS } from '../../core/graph/presets'
import { useAlgorithmStore } from '../state/algorithmStore'
import { useExecutionStore } from '../state/executionStore'
import { useGraphStore } from '../state/graphStore'
import { AlgorithmPanel } from './AlgorithmPanel'

beforeEach(() => {
  useGraphStore.getState().clear()
  useExecutionStore.getState().reset()
  useAlgorithmStore.setState({ selectedAlgorithmId: 'bfs' })
})

describe('AlgorithmPanel', () => {
  it('renders every supported algorithm by name', () => {
    render(<AlgorithmPanel />)

    expect(screen.getByText('Breadth-First Search')).toBeInTheDocument()
    expect(screen.getByText('Depth-First Search')).toBeInTheDocument()
    expect(screen.getByText("Dijkstra's Algorithm")).toBeInTheDocument()
    expect(screen.getByText('A* Search')).toBeInTheDocument()
    expect(screen.getByText('Bellman-Ford Algorithm')).toBeInTheDocument()
  })

  it('marks no algorithms as "Coming soon" now that all five are implemented', () => {
    render(<AlgorithmPanel />)
    expect(screen.queryByText('Coming soon')).toBeNull()
  })

  it('disables Run when the graph fails validation', () => {
    render(<AlgorithmPanel />)
    expect(screen.getByRole('button', { name: /Run BFS/ })).toBeDisabled()
    expect(screen.getByText(/Fix the graph before running/)).toBeInTheDocument()
  })

  it('runs BFS on a valid graph and loads the result into the execution store', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    render(<AlgorithmPanel />)

    const runButton = screen.getByRole('button', { name: /Run BFS/ })
    expect(runButton).not.toBeDisabled()
    fireEvent.click(runButton)

    const { result } = useExecutionStore.getState()
    expect(result?.algorithmId).toBe('bfs')
    expect(result?.steps.length).toBeGreaterThan(0)
  })

  it('runs DFS when DFS is selected', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    render(<AlgorithmPanel />)

    fireEvent.click(screen.getByText('Depth-First Search').closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: /Run DFS/ }))

    expect(useExecutionStore.getState().result?.algorithmId).toBe('dfs')
  })

  it('runs Dijkstra when Dijkstra is selected', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    render(<AlgorithmPanel />)

    fireEvent.click(screen.getByText("Dijkstra's Algorithm").closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: /Run DIJKSTRA/ }))

    expect(useExecutionStore.getState().result?.algorithmId).toBe('dijkstra')
  })

  it('surfaces an error when running Dijkstra on a graph with negative weights', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['negative-edge'].build())
    render(<AlgorithmPanel />)

    fireEvent.click(screen.getByText("Dijkstra's Algorithm").closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: /Run DIJKSTRA/ }))

    expect(screen.getByText(/negative edge weights/)).toBeInTheDocument()
    expect(useExecutionStore.getState().result).toBeNull()
  })

  it('runs A* when A* is selected, finding the same path as Dijkstra', () => {
    useGraphStore
      .getState()
      .setGraph(GRAPH_PRESETS['triangle-shortcut'].build())
    render(<AlgorithmPanel />)

    fireEvent.click(screen.getByText('A* Search').closest('button')!)
    fireEvent.click(screen.getByRole('button', { name: /Run ASTAR/ }))

    const { result } = useExecutionStore.getState()
    expect(result?.algorithmId).toBe('astar')
    expect(result?.steps[result.steps.length - 1].state.path).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('runs Bellman-Ford when Bellman-Ford is selected, correctly handling a negative edge', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['negative-edge'].build())
    render(<AlgorithmPanel />)

    fireEvent.click(
      screen.getByText('Bellman-Ford Algorithm').closest('button')!,
    )
    fireEvent.click(screen.getByRole('button', { name: /Run BELLMAN-FORD/ }))

    const { result } = useExecutionStore.getState()
    expect(result?.algorithmId).toBe('bellman-ford')
    expect(result?.steps[result.steps.length - 1].type).toBe('path-found')
  })
})

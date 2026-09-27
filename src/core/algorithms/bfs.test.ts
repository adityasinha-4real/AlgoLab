import { describe, expect, it } from 'vitest'
import { GRAPH_PRESETS } from '../graph/presets'
import {
  createEmptyGraph,
  addNode,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { runBFS } from './bfs'

describe('runBFS', () => {
  it('throws when start or target is missing', () => {
    expect(() => runBFS(createEmptyGraph())).toThrow(/start and target/)
  })

  it('finds the fewest-edges path, ignoring edge weight', () => {
    // triangle-shortcut: direct a-c edge (weight 10) vs a-b-c (weight 3+3).
    // BFS must take the 1-hop direct edge despite its higher weight.
    const result = runBFS(GRAPH_PRESETS['triangle-shortcut'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    expect(last.state.path).toEqual(['a', 'c'])
    expect(result.metrics.pathLength).toBe(1)
  })

  it('walks a simple path start to end', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c', 'd'])
    expect(result.metrics.pathLength).toBe(3)
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runBFS(GRAPH_PRESETS['disconnected-pair'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(result.metrics.pathLength).toBeNull()
  })

  it('handles start === target as a trivial single-node path', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    const result = runBFS(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
    expect(result.metrics.pathLength).toBe(0)
  })

  it('starts with an init step and ends with a terminal step', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps[0].type).toBe('init')
    expect(['path-found', 'no-path']).toContain(
      result.steps[result.steps.length - 1].type,
    )
    expect(result.algorithmId).toBe('bfs')
  })

  it('is deterministic across repeated runs on the same graph', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    const a = runBFS(graph)
    const b = runBFS(graph)
    const strip = (r: typeof a) =>
      r.steps.map(({ type, pseudocodeLine, explanation, state }) => ({
        type,
        pseudocodeLine,
        explanation,
        state,
      }))
    expect(strip(a)).toEqual(strip(b))
  })

  it('counts visited nodes and examined edges correctly', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    expect(result.metrics.nodesVisited).toBe(4)
    expect(result.metrics.edgesExamined).toBeGreaterThan(0)
    expect(result.metrics.steps).toBe(result.steps.length)
  })
})

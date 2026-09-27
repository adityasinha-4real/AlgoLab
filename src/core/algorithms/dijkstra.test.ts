import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { GRAPH_PRESETS } from '../graph/presets'
import { runDijkstra } from './dijkstra'

describe('runDijkstra', () => {
  it('throws when start or target is missing', () => {
    expect(() => runDijkstra(createEmptyGraph())).toThrow(/start and target/)
  })

  it('throws on a graph containing a negative weight edge', () => {
    expect(() => runDijkstra(GRAPH_PRESETS['negative-edge'].build())).toThrow(
      /negative edge weights/,
    )
  })

  it('finds the lowest-weight path, unlike BFS (which finds the fewest-edges path)', () => {
    // triangle-shortcut: direct a-c edge costs 10; a-b-c costs 3+3=6.
    const result = runDijkstra(GRAPH_PRESETS['triangle-shortcut'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c'])
    expect(result.metrics.pathCost).toBe(6)
  })

  it('walks a simple path and sums edge weights for the cost', () => {
    const result = runDijkstra(GRAPH_PRESETS['simple-path'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c', 'd'])
    expect(result.metrics.pathCost).toBe(6) // 2 + 3 + 1
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runDijkstra(GRAPH_PRESETS['disconnected-pair'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
  })

  it('handles start === target as a trivial zero-cost path', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    const result = runDijkstra(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
    expect(result.metrics.pathCost).toBe(0)
  })

  it('prefers a cheaper multi-edge route discovered after an initial relaxation', () => {
    // a->b (10), a->c (1), c->b (1): shortest a->b is via c, cost 2.
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 0, y: 0 })
    graph = addNode(graph, { id: 'c', label: 'C', x: 0, y: 0 })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: 10,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'ac',
      source: 'a',
      target: 'c',
      weight: 1,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'cb',
      source: 'c',
      target: 'b',
      weight: 1,
      directed: true,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')

    const result = runDijkstra(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'c', 'b'])
    expect(result.metrics.pathCost).toBe(2)
  })

  it('starts with an init step and ends with a terminal step', () => {
    const result = runDijkstra(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps[0].type).toBe('init')
    expect(['path-found', 'no-path']).toContain(
      result.steps[result.steps.length - 1].type,
    )
    expect(result.algorithmId).toBe('dijkstra')
  })

  it('is deterministic across repeated runs on the same graph', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    const a = runDijkstra(graph)
    const b = runDijkstra(graph)
    const strip = (r: typeof a) =>
      r.steps.map(({ type, pseudocodeLine, explanation, state }) => ({
        type,
        pseudocodeLine,
        explanation,
        state,
      }))
    expect(strip(a)).toEqual(strip(b))
  })
})

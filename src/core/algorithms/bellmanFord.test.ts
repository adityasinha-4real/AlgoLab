import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { GRAPH_PRESETS } from '../graph/presets'
import { runBellmanFord } from './bellmanFord'

describe('runBellmanFord', () => {
  it('throws when start or target is missing', () => {
    expect(() => runBellmanFord(createEmptyGraph())).toThrow(/start and target/)
  })

  it('handles negative edges correctly (unlike Dijkstra) on the negative-edge preset', () => {
    // a->b(4), a->c(2), c->b(-3), b->d(3), c->d(6): shortest a->d is
    // a-c-b-d = 2 + -3 + 3 = 2, cheaper than a-b-d = 4+3=7 or a-c-d = 2+6=8.
    const result = runBellmanFord(GRAPH_PRESETS['negative-edge'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    expect(last.state.path).toEqual(['a', 'c', 'b', 'd'])
    expect(result.metrics.pathCost).toBe(2)
    // Regression: the confirmation pass examines every edge in the graph
    // after the path is already decided, so a stale currentEdgeId from that
    // pass must not leak into the final snapshot (it would render an
    // unrelated edge as still "current" on the canvas).
    expect(last.state.currentEdgeId).toBeNull()
  })

  it('finds the lowest-weight path on a graph with only non-negative weights', () => {
    const result = runBellmanFord(GRAPH_PRESETS['triangle-shortcut'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c'])
    expect(result.metrics.pathCost).toBe(6)
  })

  it('detects a negative cycle created by an undirected negative-weight edge', () => {
    // An undirected negative edge is inherently a 2-cycle (traverse back and
    // forth to decrease cost without bound).
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 0, y: 0 })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: -1,
      directed: false,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')

    const result = runBellmanFord(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('negative-cycle')
    expect(last.state.path).toBeNull()
  })

  it('detects a negative cycle formed by three directed edges', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 0, y: 0 })
    graph = addNode(graph, { id: 'c', label: 'C', x: 0, y: 0 })
    graph = addNode(graph, { id: 'd', label: 'D', x: 0, y: 0 })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'bc',
      source: 'b',
      target: 'c',
      weight: 1,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'cb',
      source: 'c',
      target: 'b',
      weight: -3,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'bd',
      source: 'b',
      target: 'd',
      weight: 1,
      directed: true,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'd')

    const result = runBellmanFord(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('negative-cycle')
  })

  it('does not falsely report a negative cycle for a graph with only non-negative weights', () => {
    const result = runBellmanFord(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps.some((s) => s.type === 'negative-cycle')).toBe(false)
  })

  it('reports no-path for a disconnected graph without weights being an issue', () => {
    const result = runBellmanFord(GRAPH_PRESETS['disconnected-pair'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(last.state.currentEdgeId).toBeNull()
  })

  it('handles start === target as a trivial zero-cost path', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    const result = runBellmanFord(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
  })

  it('starts with an init step and ends with a terminal step', () => {
    const result = runBellmanFord(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps[0].type).toBe('init')
    expect(['path-found', 'no-path', 'negative-cycle']).toContain(
      result.steps[result.steps.length - 1].type,
    )
    expect(result.algorithmId).toBe('bellman-ford')
  })

  it('is deterministic across repeated runs on the same graph', () => {
    const graph = GRAPH_PRESETS['negative-edge'].build()
    const a = runBellmanFord(graph)
    const b = runBellmanFord(graph)
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

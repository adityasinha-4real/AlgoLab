import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { GRAPH_PRESETS } from '../graph/presets'
import { runAStar } from './astar'
import { runDijkstra } from './dijkstra'

describe('runAStar', () => {
  it('throws when start or target is missing', () => {
    expect(() => runAStar(createEmptyGraph())).toThrow(/start and target/)
  })

  it('throws on a graph containing a negative weight edge', () => {
    expect(() => runAStar(GRAPH_PRESETS['negative-edge'].build())).toThrow(
      /negative edge weights/,
    )
  })

  it('finds the same shortest path and cost as Dijkstra on every preset graph', () => {
    for (const id of ['simple-path', 'triangle-shortcut'] as const) {
      const dijkstraResult = runDijkstra(GRAPH_PRESETS[id].build())
      const astarResult = runAStar(GRAPH_PRESETS[id].build())
      const dijkstraLast = dijkstraResult.steps[dijkstraResult.steps.length - 1]
      const astarLast = astarResult.steps[astarResult.steps.length - 1]
      expect(astarLast.state.path).toEqual(dijkstraLast.state.path)
      expect(astarResult.metrics.pathCost).toBe(dijkstraResult.metrics.pathCost)
    }
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runAStar(GRAPH_PRESETS['disconnected-pair'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
  })

  it('handles start === target as a trivial zero-cost path', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    const result = runAStar(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
    expect(result.metrics.pathCost).toBe(0)
  })

  it('records a heuristic value for every node it assigns a distance to', () => {
    const result = runAStar(GRAPH_PRESETS['simple-path'].build())
    const last = result.steps[result.steps.length - 1]
    for (const id of Object.keys(last.state.distances)) {
      expect(last.state.heuristics[id]).toBeDefined()
    }
    // Heuristic for the target itself is always 0.
    expect(last.state.heuristics['d']).toBe(0)
  })

  it('examines no more edges than Dijkstra on the same graph (the heuristic should only help)', () => {
    // A geometric graph where layout distance correlates with weight, so the
    // heuristic is informative rather than degenerating to ~0 everywhere.
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 100, y: 0 })
    graph = addNode(graph, { id: 'c', label: 'C', x: 200, y: 0 })
    graph = addNode(graph, { id: 'd', label: 'D', x: 100, y: 150 })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: 100,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'bc',
      source: 'b',
      target: 'c',
      weight: 100,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'ad',
      source: 'a',
      target: 'd',
      weight: 170,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'dc',
      source: 'd',
      target: 'c',
      weight: 170,
      directed: true,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'c')

    const dijkstraResult = runDijkstra(graph)
    const astarResult = runAStar(graph)
    expect(astarResult.metrics.edgesExamined).toBeLessThanOrEqual(
      dijkstraResult.metrics.edgesExamined,
    )
  })

  it('starts with an init step and ends with a terminal step', () => {
    const result = runAStar(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps[0].type).toBe('init')
    expect(['path-found', 'no-path']).toContain(
      result.steps[result.steps.length - 1].type,
    )
    expect(result.algorithmId).toBe('astar')
  })

  it('is deterministic across repeated runs on the same graph', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    const a = runAStar(graph)
    const b = runAStar(graph)
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

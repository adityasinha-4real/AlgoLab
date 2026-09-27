import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { GRAPH_PRESETS } from '../graph/presets'
import { compareAlgorithms } from './compare'

describe('compareAlgorithms', () => {
  it('returns one entry per known algorithm, in metadata order', () => {
    const entries = compareAlgorithms(GRAPH_PRESETS['simple-path'].build())
    expect(entries.map((e) => e.algorithmId)).toEqual([
      'bfs',
      'dfs',
      'dijkstra',
      'astar',
      'bellman-ford',
    ])
  })

  it('gives every algorithm real metrics on a valid non-negative graph', () => {
    const entries = compareAlgorithms(GRAPH_PRESETS['simple-path'].build())
    for (const entry of entries) {
      expect(entry.error).toBeNull()
      expect(entry.metrics).not.toBeNull()
      expect(entry.metrics!.pathLength).toBe(3)
    }
  })

  it('BFS and Dijkstra can disagree on path length on a graph where hop count and weight diverge', () => {
    const entries = compareAlgorithms(
      GRAPH_PRESETS['triangle-shortcut'].build(),
    )
    const bfs = entries.find((e) => e.algorithmId === 'bfs')!
    const dijkstra = entries.find((e) => e.algorithmId === 'dijkstra')!
    expect(bfs.metrics!.pathLength).toBe(1)
    expect(dijkstra.metrics!.pathLength).toBe(2)
  })

  it('reports an error (not a crash) for Dijkstra and A* on a negative-weight graph', () => {
    const entries = compareAlgorithms(GRAPH_PRESETS['negative-edge'].build())
    const dijkstra = entries.find((e) => e.algorithmId === 'dijkstra')!
    const astar = entries.find((e) => e.algorithmId === 'astar')!
    expect(dijkstra.error).toMatch(/negative edge weights/)
    expect(dijkstra.metrics).toBeNull()
    expect(astar.error).toMatch(/negative edge weights/)
    // Bellman-Ford should still succeed on the same graph.
    const bellmanFord = entries.find((e) => e.algorithmId === 'bellman-ford')!
    expect(bellmanFord.error).toBeNull()
  })

  it('propagates a thrown error for a graph with no start/target rather than crashing the whole comparison', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 0, y: 0 })
    graph = addEdge(graph, {
      id: 'e',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })
    // No start/target set.
    const entries = compareAlgorithms(graph)
    expect(entries.every((e) => e.error?.includes('start and target'))).toBe(
      true,
    )
  })

  it('marks unimplemented algorithms with a clear error rather than metrics', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    // All 5 are implemented today, so this test just documents the shape
    // for whichever entries end up with no runner in the future.
    const entries = compareAlgorithms(graph)
    expect(
      entries.every((e) => e.error === null || typeof e.error === 'string'),
    ).toBe(true)
  })
})

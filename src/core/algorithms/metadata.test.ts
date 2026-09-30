import { describe, expect, it } from 'vitest'
import { getAlgorithmMetadata, listAlgorithmMetadata } from './metadata'

describe('algorithm metadata', () => {
  it('lists exactly the supported algorithms', () => {
    const ids = listAlgorithmMetadata().map((m) => m.id)
    expect(ids.sort()).toEqual(
      [
        'astar',
        'bellman-ford',
        'bfs',
        'dfs',
        'dijkstra',
        'greedy-best-first',
        'bidirectional-bfs',
        'zero-one-bfs',
        'topological-sort',
        'prim',
        'kruskal',
        'boruvka',
        'floyd-warshall',
        'tarjan-scc',
        'kosaraju-scc',
        'bridges-articulation',
        'cycle-detection',
        'bipartite-check',
      ].sort(),
    )
  })

  it('returns metadata whose id matches the lookup key', () => {
    for (const id of listAlgorithmMetadata().map((m) => m.id)) {
      expect(getAlgorithmMetadata(id).id).toBe(id)
    }
  })

  it('flags only Bellman-Ford and Floyd-Warshall as supporting negative weights', () => {
    const supportsNegative = listAlgorithmMetadata()
      .filter((m) => m.supportsNegativeWeights)
      .map((m) => m.id)
    expect(supportsNegative.sort()).toEqual(['bellman-ford', 'floyd-warshall'])
  })
})

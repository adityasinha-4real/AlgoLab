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
      ].sort(),
    )
  })

  it('returns metadata whose id matches the lookup key', () => {
    for (const id of listAlgorithmMetadata().map((m) => m.id)) {
      expect(getAlgorithmMetadata(id).id).toBe(id)
    }
  })

  it('flags Bellman-Ford as the only algorithm supporting negative weights', () => {
    const supportsNegative = listAlgorithmMetadata()
      .filter((m) => m.supportsNegativeWeights)
      .map((m) => m.id)
    expect(supportsNegative).toEqual(['bellman-ford'])
  })
})

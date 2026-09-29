import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import type { Graph } from '../graph/types'
import { runBridgesArticulation } from './bridgesArticulation'

const last = (result: ReturnType<typeof runBridgesArticulation>) =>
  result.steps[result.steps.length - 1]

const analyze = (graph: Graph) => {
  const state = last(runBridgesArticulation(graph)).state
  return {
    bridges: [...(state.highlightedEdges ?? [])].sort(),
    cuts: Object.keys(state.nodeGroups ?? {}).sort(),
  }
}

describe('runBridgesArticulation', () => {
  it('throws when the graph has a directed edge', () => {
    expect(() =>
      runBridgesArticulation(
        makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, true]] }),
      ),
    ).toThrow(/undirected graph/)
  })

  it('finds the bridges and cut vertices of a triangle with a tail', () => {
    // Triangle a-b-c, then c-d and d-e hang off it.
    const result = analyze(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'a'],
          ['c', 'd'],
          ['d', 'e'],
        ],
        start: 'a',
      }),
    )
    expect(result.bridges).toEqual(['cd', 'de'])
    expect(result.cuts).toEqual(['c', 'd'])
  })

  it('treats a root with several DFS children as an articulation point', () => {
    const result = analyze(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b'],
          ['a', 'c'],
        ],
        start: 'a',
      }),
    )
    expect(result.bridges).toEqual(['ab', 'ac'])
    expect(result.cuts).toEqual(['a'])
  })

  it('does not flag a root with a single DFS child', () => {
    const result = analyze(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
        ],
        start: 'a',
      }),
    )
    expect(result.cuts).toEqual(['b'])
  })

  it('finds nothing in a plain cycle', () => {
    const result = analyze(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'd'],
          ['d', 'a'],
        ],
      }),
    )
    expect(result).toEqual({ bridges: [], cuts: [] })
  })

  it('does not call one of two parallel edges a bridge', () => {
    const graph = makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b']] })
    graph.edges.push({
      id: 'ab2',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })
    expect(analyze(graph)).toEqual({ bridges: [], cuts: [] })
  })

  it('handles disconnected graphs, a single node, self-loops and empty graphs', () => {
    expect(
      analyze(
        makeGraph({
          nodes: ['a', 'b', 'c', 'd'],
          edges: [
            ['a', 'b'],
            ['c', 'd'],
          ],
        }),
      ).bridges,
    ).toEqual(['ab', 'cd'])
    expect(analyze(makeGraph({ nodes: ['a'] }))).toEqual({
      bridges: [],
      cuts: [],
    })
    const loop = makeGraph({
      nodes: ['a', 'b'],
      edges: [
        ['a', 'a'],
        ['a', 'b'],
      ],
    })
    expect(analyze(loop)).toEqual({ bridges: ['ab'], cuts: [] })
    expect(
      last(runBridgesArticulation(makeGraph({ nodes: [] }))).explanation,
    ).toMatch(/empty/)
  })

  it('agrees with brute-force removal on seeded random graphs', () => {
    const components = (
      ids: string[],
      edges: [string, string][],
      skipNode?: string,
      skipEdge?: number,
    ) => {
      const parent = new Map(ids.map((id) => [id, id]))
      const find = (x: string): string =>
        parent.get(x) === x ? x : find(parent.get(x) as string)
      edges.forEach(([a, b], i) => {
        if (i === skipEdge || a === skipNode || b === skipNode) return
        parent.set(find(a), find(b))
      })
      return new Set(ids.filter((id) => id !== skipNode).map(find)).size
    }

    let seed = 3
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 15; round++) {
      const ids = Array.from({ length: 8 }, (_, i) => `n${i}`)
      const edges: [string, string][] = []
      for (let i = 0; i < 9; i++) {
        const a = ids[next() % 8]
        const b = ids[next() % 8]
        if (
          a !== b &&
          !edges.some(([s, t]) => (s === a && t === b) || (s === b && t === a))
        )
          edges.push([a, b])
      }
      const base = components(ids, edges)
      const expectedBridges = edges
        .map(([a, b], i) =>
          components(ids, edges, undefined, i) > base ? a + b : null,
        )
        .filter((id): id is string => id !== null)
        .sort()
      const expectedCuts = ids
        .filter((id) => {
          const degree = edges.some(([a, b]) => a === id || b === id)
          // Removing an isolated node lowers the count by one; only count real splits.
          return degree && components(ids, edges, id) > base
        })
        .sort()

      expect(analyze(makeGraph({ nodes: ids, edges }))).toEqual({
        bridges: expectedBridges,
        cuts: expectedCuts,
      })
    }
  })
})

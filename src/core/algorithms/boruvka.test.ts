import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runBoruvka } from './boruvka'
import { runKruskal } from './kruskal'

type Result = ReturnType<typeof runBoruvka>
type Graph = ReturnType<typeof makeGraph>

const last = (result: Result) => result.steps[result.steps.length - 1]

const weightOf = (graph: Graph, result: Result) => {
  const kept = new Set(last(result).state.highlightedEdges ?? [])
  return graph.edges
    .filter((e) => kept.has(e.id))
    .reduce((sum, e) => sum + e.weight, 0)
}

describe('runBoruvka', () => {
  it('throws when the graph has a directed edge', () => {
    expect(() =>
      runBoruvka(
        makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, true]] }),
      ),
    ).toThrow(/undirected graph/)
  })

  it('builds the hand-checked MST of a small graph', () => {
    // MST = ab(1) + bc(2) + cd(3) = 6, dropping ac and bd.
    const graph = makeGraph({
      nodes: ['a', 'b', 'c', 'd'],
      edges: [
        ['a', 'b', 1],
        ['b', 'c', 2],
        ['c', 'd', 3],
        ['a', 'c', 4],
        ['b', 'd', 5],
      ],
    })
    const result = runBoruvka(graph)
    expect([...(last(result).state.highlightedEdges ?? [])].sort()).toEqual([
      'ab',
      'bc',
      'cd',
    ])
    expect(weightOf(graph, result)).toBe(6)
    expect(last(result).type).toBe('done')
    expect(last(result).explanation).toContain('total weight 6')
    const groups = Object.values(last(result).state.nodeGroups ?? {})
    expect(groups).toHaveLength(4)
    expect(new Set(groups).size).toBe(1)
  })

  it('adds an edge picked by two components only once', () => {
    const result = runBoruvka(
      makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 7]] }),
    )
    expect(last(result).state.highlightedEdges).toEqual(['ab'])
    expect(last(result).explanation).toContain('1 round(s)')
  })

  it('breaks weight ties by edge order without forming a cycle', () => {
    // An equal-weight triangle: every component picks, yet only 2 edges survive.
    const graph = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', 1],
        ['b', 'c', 1],
        ['a', 'c', 1],
      ],
    })
    const result = runBoruvka(graph)
    expect(last(result).state.highlightedEdges).toHaveLength(2)
    expect(weightOf(graph, result)).toBe(2)
  })

  it('handles negative weights', () => {
    const graph = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', -3],
        ['b', 'c', 2],
        ['a', 'c', -1],
      ],
    })
    expect(weightOf(graph, runBoruvka(graph))).toBe(-4)
  })

  it('returns a spanning forest for a disconnected graph', () => {
    const result = runBoruvka(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1],
          ['c', 'd', 2],
        ],
      }),
    )
    expect(last(result).state.highlightedEdges).toHaveLength(2)
    expect(last(result).explanation).toContain('spanning forest')
    expect(last(result).explanation).toContain('2 components')
  })

  it('handles an empty graph, a single node and self-loops', () => {
    expect(last(runBoruvka(makeGraph({ nodes: [] }))).explanation).toMatch(
      /empty/,
    )
    const single = runBoruvka(makeGraph({ nodes: ['a'] }))
    expect(last(single).state.highlightedEdges).toBeUndefined()
    const loop = runBoruvka(makeGraph({ nodes: ['a'], edges: [['a', 'a', 1]] }))
    expect(last(loop).state.highlightedEdges).toBeUndefined()
    expect(last(loop).type).toBe('done')
  })

  it('finishes a 16-node path in at most log2(16) rounds', () => {
    const ids = Array.from({ length: 16 }, (_, i) => `n${i}`)
    const edges = ids
      .slice(1)
      .map((id, i): [string, string, number] => [ids[i], id, i + 1])
    const result = runBoruvka(makeGraph({ nodes: ids, edges }))
    const rounds = result.steps.filter(
      (s) => s.type === 'init' && /^Round/.test(s.explanation),
    ).length
    expect(rounds).toBeLessThanOrEqual(4)
  })

  it('matches Kruskal on the MST weight of seeded random graphs', () => {
    let seed = 3
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 25; round++) {
      const ids = Array.from({ length: 9 }, (_, i) => `n${i}`)
      const edges: [string, string, number][] = []
      for (let i = 0; i < 9; i++) {
        for (let j = i + 1; j < 9; j++) {
          if (next() % 100 < 35) edges.push([ids[i], ids[j], (next() % 12) - 3])
        }
      }
      const graph = makeGraph({ nodes: ids, edges })
      const boruvka = runBoruvka(graph)
      const kruskal = runKruskal(graph) as Result
      expect(weightOf(graph, boruvka)).toBe(weightOf(graph, kruskal))
      expect(last(boruvka).state.highlightedEdges ?? []).toHaveLength(
        (last(kruskal).state.highlightedEdges ?? []).length,
      )
    }
  })
})

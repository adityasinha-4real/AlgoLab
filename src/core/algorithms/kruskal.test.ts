import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runKruskal } from './kruskal'
import { runPrim } from './prim'

const last = (result: ReturnType<typeof runKruskal>) =>
  result.steps[result.steps.length - 1]

const weightOf = (
  graph: ReturnType<typeof makeGraph>,
  ids: string[] | undefined,
) =>
  (ids ?? []).reduce(
    (sum, id) => sum + (graph.edges.find((e) => e.id === id)?.weight ?? 0),
    0,
  )

const classic = () =>
  makeGraph({
    nodes: ['a', 'b', 'c', 'd'],
    edges: [
      ['a', 'b', 1],
      ['b', 'c', 2],
      ['a', 'c', 3],
      ['c', 'd', 4],
      ['b', 'd', 5],
    ],
  })

describe('runKruskal', () => {
  it('throws when the graph has a directed edge', () => {
    expect(() =>
      runKruskal(
        makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, true]] }),
      ),
    ).toThrow(/undirected graph/)
  })

  it('builds the minimum spanning tree of a small graph (weight 7)', () => {
    const result = runKruskal(classic())
    const final = last(result)
    expect(final.type).toBe('done')
    expect(final.state.highlightedEdges).toEqual(['ab', 'bc', 'cd'])
    expect(final.explanation).toContain('total weight 7')
    // ac (3) is rejected as a cycle; bd (5) is never examined.
    expect(result.steps.filter((s) => s.type === 'skip-edge')).toHaveLength(1)
    expect(result.steps.filter((s) => s.type === 'examine-edge')).toHaveLength(
      4,
    )
  })

  it('colors merging components through nodeGroups', () => {
    const graph = makeGraph({
      nodes: ['a', 'b', 'c', 'd', 'e'],
      edges: [
        ['a', 'b', 1],
        ['c', 'd', 2],
        ['b', 'c', 3],
      ],
    })
    const visits = runKruskal(graph).steps.filter((s) => s.type === 'visit')
    expect(visits[0].state.nodeGroups).toEqual({ a: 0, b: 0 })
    expect(visits[1].state.nodeGroups).toEqual({ a: 0, b: 0, c: 2, d: 2 })
    expect(visits[2].state.nodeGroups).toEqual({ a: 0, b: 0, c: 0, d: 0 })
  })

  it('handles negative weights', () => {
    const result = runKruskal(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', -1],
          ['b', 'c', -2],
          ['a', 'c', 5],
        ],
      }),
    )
    expect(last(result).explanation).toContain('total weight -3')
  })

  it('produces a spanning forest for a disconnected graph', () => {
    const result = runKruskal(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1],
          ['c', 'd', 2],
        ],
      }),
    )
    expect(last(result).explanation).toMatch(/forest.*2 components/)
  })

  it('handles a single node, an empty graph and self-loops', () => {
    expect(last(runKruskal(makeGraph({ nodes: ['a'] }))).explanation).toContain(
      '0 edge(s)',
    )
    expect(last(runKruskal(makeGraph({ nodes: [] }))).explanation).toMatch(
      /empty/,
    )
    const loop = runKruskal(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [
          ['a', 'a', 0],
          ['a', 'b', 4],
        ],
      }),
    )
    expect(last(loop).state.highlightedEdges).toEqual(['ab'])
    expect(loop.steps.some((s) => s.type === 'skip-edge')).toBe(true)
  })

  it('matches the total weight found by Prim on seeded random graphs', () => {
    let seed = 11
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 10; round++) {
      const ids = Array.from({ length: 9 }, (_, i) => `n${i}`)
      const edges: [string, string, number][] = []
      for (let i = 0; i < 14; i++) {
        const a = ids[next() % ids.length]
        const b = ids[next() % ids.length]
        if (
          edges.some(([s, t]) => (s === a && t === b) || (s === b && t === a))
        )
          continue
        edges.push([a, b, (next() % 9) - 2])
      }
      const graph = makeGraph({ nodes: ids, edges })
      expect(
        weightOf(graph, last(runKruskal(graph)).state.highlightedEdges),
      ).toBe(weightOf(graph, last(runPrim(graph)).state.highlightedEdges))
    }
  })
})

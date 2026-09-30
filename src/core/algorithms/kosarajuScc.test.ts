import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runKosarajuScc } from './kosarajuScc'
import { runTarjanScc } from './tarjanScc'

type Result = ReturnType<typeof runKosarajuScc>

const last = (result: Result) => result.steps[result.steps.length - 1]

/** The partition of node ids implied by the final nodeGroups, as sorted strings. */
const partition = (result: Result) => {
  const byGroup = new Map<number, string[]>()
  for (const [id, group] of Object.entries(
    last(result).state.nodeGroups ?? {},
  )) {
    byGroup.set(group, [...(byGroup.get(group) ?? []), id])
  }
  return [...byGroup.values()].map((ids) => ids.sort().join('')).sort()
}

const directed = (edges: [string, string][]) =>
  edges.map(([s, t]): [string, string, number, boolean] => [s, t, 1, true])

describe('runKosarajuScc', () => {
  it('throws when the graph has an undirected edge', () => {
    expect(() =>
      runKosarajuScc(makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b']] })),
    ).toThrow(/directed graph/)
  })

  it('finds the three components of a hand-checked graph', () => {
    const result = runKosarajuScc(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e', 'f'],
        edges: directed([
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'a'],
          ['b', 'd'],
          ['d', 'e'],
          ['e', 'd'],
          ['e', 'f'],
        ]),
      }),
    )
    expect(partition(result)).toEqual(['abc', 'de', 'f'])
    expect(last(result).type).toBe('done')
    expect(last(result).explanation).toContain('3 strongly connected')
    // Pass 2 starts at the last finisher (a), whose transposed reach is {a,b,c}.
    expect(last(result).state.nodeGroups).toMatchObject({ a: 0, b: 0, c: 0 })
    expect(last(result).state.visited.slice().sort()).toEqual([
      'a',
      'b',
      'c',
      'd',
      'e',
      'f',
    ])
  })

  it('records a finish position for every node in pass 1', () => {
    const result = runKosarajuScc(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: directed([
          ['a', 'b'],
          ['b', 'c'],
        ]),
      }),
    )
    // DFS a -> b -> c finishes c, then b, then a.
    expect(last(result).state.distances).toEqual({ c: 1, b: 2, a: 3 })
  })

  it('makes every node its own component in a DAG', () => {
    const result = runKosarajuScc(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: directed([
          ['a', 'b'],
          ['b', 'c'],
          ['a', 'c'],
        ]),
      }),
    )
    expect(partition(result)).toEqual(['a', 'b', 'c'])
  })

  it('handles a single node, a self-loop and an empty graph', () => {
    expect(partition(runKosarajuScc(makeGraph({ nodes: ['a'] })))).toEqual([
      'a',
    ])
    const loop = runKosarajuScc(
      makeGraph({ nodes: ['a'], edges: [['a', 'a', 1, true]] }),
    )
    expect(partition(loop)).toEqual(['a'])
    expect(last(runKosarajuScc(makeGraph({ nodes: [] }))).explanation).toMatch(
      /empty/,
    )
  })

  it('covers disconnected components', () => {
    const result = runKosarajuScc(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: directed([
          ['a', 'b'],
          ['b', 'a'],
          ['c', 'd'],
        ]),
      }),
    )
    expect(partition(result)).toEqual(['ab', 'c', 'd'])
  })

  it('starts pass 1 at the selected start node', () => {
    const graph = {
      ...makeGraph({ nodes: ['a', 'b'], edges: directed([['a', 'b']]) }),
      startNodeId: 'b',
    }
    const firstDiscovery = runKosarajuScc(graph).steps.find(
      (s) => s.type === 'enqueue',
    )
    expect(firstDiscovery?.state.currentNodeId).toBe('b')
  })

  it('agrees with Tarjan on seeded random digraphs', () => {
    let seed = 11
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 25; round++) {
      const ids = Array.from({ length: 9 }, (_, i) => `n${i}`)
      const edges: [string, string][] = []
      for (let i = 0; i < 14; i++) {
        edges.push([ids[next() % 9], ids[next() % 9]])
      }
      const unique = edges.filter(
        ([s, t], i) => edges.findIndex(([a, b]) => a === s && b === t) === i,
      )
      const graph = makeGraph({ nodes: ids, edges: directed(unique) })
      const tarjan = partition(runTarjanScc(graph) as Result)
      expect(partition(runKosarajuScc(graph))).toEqual(tarjan)
    }
  })
})

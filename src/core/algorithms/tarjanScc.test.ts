import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runTarjanScc } from './tarjanScc'

const last = (result: ReturnType<typeof runTarjanScc>) =>
  result.steps[result.steps.length - 1]

/** The partition of node ids implied by the final nodeGroups, as sorted strings. */
const partition = (result: ReturnType<typeof runTarjanScc>) => {
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

describe('runTarjanScc', () => {
  it('throws when the graph has an undirected edge', () => {
    expect(() =>
      runTarjanScc(makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b']] })),
    ).toThrow(/directed graph/)
  })

  it('finds the three components of a hand-checked graph', () => {
    // {a,b,c} cycle, {d,e} cycle, and f alone; edges only lead "downstream".
    const result = runTarjanScc(
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
    // Components complete in reverse topological order: f, then {d,e}, then {a,b,c}.
    expect(last(result).state.nodeGroups).toMatchObject({
      f: 0,
      d: 1,
      e: 1,
      a: 2,
    })
    expect(last(result).state.frontier).toEqual([])
  })

  it('makes every node its own component in a DAG', () => {
    const result = runTarjanScc(
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
    expect(partition(runTarjanScc(makeGraph({ nodes: ['a'] })))).toEqual(['a'])
    const loop = runTarjanScc(
      makeGraph({ nodes: ['a'], edges: [['a', 'a', 1, true]] }),
    )
    expect(partition(loop)).toEqual(['a'])
    expect(last(runTarjanScc(makeGraph({ nodes: [] }))).explanation).toMatch(
      /empty/,
    )
  })

  it('covers disconnected components', () => {
    const result = runTarjanScc(
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

  it('starts the traversal at the selected start node', () => {
    const graph = {
      ...makeGraph({ nodes: ['a', 'b'], edges: directed([['a', 'b']]) }),
      startNodeId: 'b',
    }
    const firstDiscovery = runTarjanScc(graph).steps.find(
      (s) => s.type === 'enqueue',
    )
    expect(firstDiscovery?.state.currentNodeId).toBe('b')
  })

  it('agrees with mutual reachability on seeded random digraphs', () => {
    let seed = 5
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 15; round++) {
      const ids = Array.from({ length: 8 }, (_, i) => `n${i}`)
      const edges: [string, string][] = []
      for (let i = 0; i < 12; i++) {
        edges.push([ids[next() % 8], ids[next() % 8]])
      }
      const unique = edges.filter(
        ([s, t], i) => edges.findIndex(([a, b]) => a === s && b === t) === i,
      )
      const reach = ids.map((a) => ids.map((b) => a === b))
      for (const [s, t] of unique) reach[ids.indexOf(s)][ids.indexOf(t)] = true
      for (let k = 0; k < 8; k++)
        for (let i = 0; i < 8; i++)
          for (let j = 0; j < 8; j++)
            if (reach[i][k] && reach[k][j]) reach[i][j] = true

      const result = runTarjanScc(
        makeGraph({ nodes: ids, edges: directed(unique) }),
      )
      const groups = last(result).state.nodeGroups ?? {}
      for (let i = 0; i < 8; i++)
        for (let j = 0; j < 8; j++)
          expect(groups[ids[i]] === groups[ids[j]]).toBe(
            reach[i][j] && reach[j][i],
          )
    }
  })
})

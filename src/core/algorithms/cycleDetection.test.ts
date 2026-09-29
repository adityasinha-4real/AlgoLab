import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runCycleDetection } from './cycleDetection'
import { runTopologicalSort } from './topologicalSort'

const last = (result: ReturnType<typeof runCycleDetection>) =>
  result.steps[result.steps.length - 1]

const hasCycle = (graph: Parameters<typeof runCycleDetection>[0]) =>
  last(runCycleDetection(graph)).type === 'cycle-found'

describe('runCycleDetection', () => {
  it('finds no cycle in an undirected tree', () => {
    const result = runCycleDetection(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b'],
          ['a', 'c'],
        ],
      }),
    )
    expect(last(result).type).toBe('done')
    expect(last(result).explanation).toMatch(/acyclic/)
    expect(last(result).state.visited).toEqual(['b', 'c', 'a'])
  })

  it('finds an undirected triangle and highlights exactly its edges and nodes', () => {
    const result = runCycleDetection(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'a'],
          ['c', 'd'],
        ],
        start: 'a',
      }),
    )
    const final = last(result)
    expect(final.type).toBe('cycle-found')
    expect([...(final.state.highlightedEdges ?? [])].sort()).toEqual([
      'ab',
      'bc',
      'ca',
    ])
    expect(final.state.nodeGroups).toEqual({ a: 1, b: 1, c: 1 })
    expect(final.explanation).toContain('A — B — C — A')
  })

  it('respects direction: a DAG with a shortcut is acyclic, its undirected twin is not', () => {
    const edges: [string, string][] = [
      ['a', 'b'],
      ['b', 'c'],
      ['a', 'c'],
    ]
    const directedDag = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: edges.map(([s, t]) => [s, t, 1, true]),
      start: 'a',
    })
    expect(hasCycle(directedDag)).toBe(false)
    expect(hasCycle(makeGraph({ nodes: ['a', 'b', 'c'], edges }))).toBe(true)
  })

  it('finds a directed cycle and closes it in edge direction', () => {
    const result = runCycleDetection(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', 1, true],
          ['b', 'c', 1, true],
          ['c', 'a', 1, true],
        ],
        start: 'a',
      }),
    )
    expect(last(result).explanation).toContain('A → B → C → A')
  })

  it('finds a two-node directed cycle but not a single undirected edge', () => {
    expect(
      hasCycle(
        makeGraph({
          nodes: ['a', 'b'],
          edges: [
            ['a', 'b', 1, true],
            ['b', 'a', 1, true],
          ],
        }),
      ),
    ).toBe(true)
    expect(
      hasCycle(makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b']] })),
    ).toBe(false)
  })

  it('treats a self-loop and parallel undirected edges as cycles', () => {
    expect(hasCycle(makeGraph({ nodes: ['a'], edges: [['a', 'a']] }))).toBe(
      true,
    )
    const parallel = makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b']] })
    parallel.edges.push({
      id: 'ab2',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })
    expect(hasCycle(parallel)).toBe(true)
  })

  it('searches every component and handles trivial graphs', () => {
    expect(
      hasCycle(
        makeGraph({
          nodes: ['a', 'b', 'c', 'd', 'e'],
          edges: [
            ['a', 'b'],
            ['c', 'd'],
            ['d', 'e'],
            ['e', 'c'],
          ],
          start: 'a',
        }),
      ),
    ).toBe(true)
    expect(hasCycle(makeGraph({ nodes: ['a'] }))).toBe(false)
    expect(
      last(runCycleDetection(makeGraph({ nodes: [] }))).explanation,
    ).toMatch(/empty/)
  })

  it('agrees with Kahn on seeded random directed graphs', () => {
    let seed = 9
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 25; round++) {
      const ids = Array.from({ length: 7 }, (_, i) => `n${i}`)
      const edges: [string, string, number, boolean][] = []
      for (let i = 0; i < 8; i++) {
        const a = ids[next() % 7]
        const b = ids[next() % 7]
        if (!edges.some(([s, t]) => s === a && t === b))
          edges.push([a, b, 1, true])
      }
      const graph = makeGraph({ nodes: ids, edges })
      expect(hasCycle(graph)).toBe(
        last(runTopologicalSort(graph)).type === 'cycle-found',
      )
    }
  })

  it('agrees with union-find on seeded random undirected graphs', () => {
    let seed = 13
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 25; round++) {
      const ids = Array.from({ length: 7 }, (_, i) => `n${i}`)
      const edges: [string, string][] = []
      for (let i = 0; i < 6; i++) {
        const a = ids[next() % 7]
        const b = ids[next() % 7]
        if (
          !edges.some(([s, t]) => (s === a && t === b) || (s === b && t === a))
        )
          edges.push([a, b])
      }
      const parent = new Map(ids.map((id) => [id, id]))
      const find = (x: string): string =>
        parent.get(x) === x ? x : find(parent.get(x) as string)
      let expected = false
      for (const [a, b] of edges) {
        if (find(a) === find(b)) expected = true
        else parent.set(find(a), find(b))
      }
      expect(hasCycle(makeGraph({ nodes: ids, edges }))).toBe(expected)
    }
  })
})

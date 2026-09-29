import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runBipartiteCheck } from './bipartiteCheck'

const last = (result: ReturnType<typeof runBipartiteCheck>) =>
  result.steps[result.steps.length - 1]

describe('runBipartiteCheck', () => {
  it('2-colors an even cycle', () => {
    const result = runBipartiteCheck(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'd'],
          ['d', 'a'],
        ],
        start: 'a',
      }),
    )
    const final = last(result)
    expect(final.type).toBe('done')
    expect(final.state.nodeGroups).toEqual({ a: 0, b: 1, c: 0, d: 1 })
    expect(final.explanation).toContain('{A, C} and {B, D}')
    expect(final.state.highlightedEdges).toBeUndefined()
  })

  it('rejects a triangle and highlights the odd cycle', () => {
    const result = runBipartiteCheck(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'a'],
        ],
        start: 'a',
      }),
    )
    const final = last(result)
    expect(final.type).toBe('cycle-found')
    expect(final.explanation).toMatch(/not bipartite.*length 3/)
    expect([...(final.state.highlightedEdges ?? [])].sort()).toEqual([
      'ab',
      'bc',
      'ca',
    ])
  })

  it('finds the odd cycle even when it hangs off a longer tail', () => {
    // Tail a-b, then odd cycle b-c-d-e-f-b would be 5; use triangle c-d-e off b.
    const result = runBipartiteCheck(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'd'],
          ['d', 'b'],
          ['d', 'e'],
        ],
        start: 'a',
      }),
    )
    const final = last(result)
    expect(final.type).toBe('cycle-found')
    expect([...(final.state.highlightedEdges ?? [])].sort()).toEqual([
      'bc',
      'cd',
      'db',
    ])
  })

  it('ignores edge direction', () => {
    const triangle = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', 1, true],
        ['b', 'c', 1, true],
        ['c', 'a', 1, true],
      ],
    })
    expect(last(runBipartiteCheck(triangle)).type).toBe('cycle-found')
    const chain = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', 1, true],
        ['c', 'b', 1, true],
      ],
    })
    expect(last(runBipartiteCheck(chain)).state.nodeGroups).toEqual({
      a: 0,
      b: 1,
      c: 0,
    })
  })

  it('rejects a self-loop as an odd cycle of length 1', () => {
    const result = runBipartiteCheck(
      makeGraph({ nodes: ['a'], edges: [['a', 'a']] }),
    )
    expect(last(result).type).toBe('cycle-found')
    expect(last(result).explanation).toContain('length 1')
    expect(last(result).state.highlightedEdges).toEqual(['aa'])
  })

  it('colors every component and handles trivial graphs', () => {
    const result = runBipartiteCheck(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e'],
        edges: [
          ['a', 'b'],
          ['c', 'd'],
        ],
      }),
    )
    expect(last(result).state.nodeGroups).toEqual({
      a: 0,
      b: 1,
      c: 0,
      d: 1,
      e: 0,
    })
    expect(
      last(runBipartiteCheck(makeGraph({ nodes: ['a'] }))).state.nodeGroups,
    ).toEqual({ a: 0 })
    expect(
      last(runBipartiteCheck(makeGraph({ nodes: [] }))).explanation,
    ).toMatch(/empty/)
  })

  it('finds an odd cycle in a later component', () => {
    const result = runBipartiteCheck(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e'],
        edges: [
          ['a', 'b'],
          ['c', 'd'],
          ['d', 'e'],
          ['e', 'c'],
        ],
      }),
    )
    expect(last(result).type).toBe('cycle-found')
  })

  it('agrees with an independent DFS coloring on seeded random graphs', () => {
    let seed = 17
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 30; round++) {
      const ids = Array.from({ length: 7 }, (_, i) => `n${i}`)
      const edges: [string, string][] = []
      for (let i = 0; i < 7; i++) {
        const a = ids[next() % 7]
        const b = ids[next() % 7]
        if (
          !edges.some(([s, t]) => (s === a && t === b) || (s === b && t === a))
        )
          edges.push([a, b])
      }

      const side = new Map<string, number>()
      let expected = true
      const paint = (id: string, c: number) => {
        side.set(id, c)
        for (const [a, b] of edges) {
          const other = a === id ? b : b === id ? a : null
          if (other === null) continue
          if (!side.has(other)) paint(other, 1 - c)
          else if (side.get(other) === c) expected = false
        }
      }
      for (const id of ids) if (!side.has(id)) paint(id, 0)

      const final = last(runBipartiteCheck(makeGraph({ nodes: ids, edges })))
      expect(final.type === 'done').toBe(expected)
      if (expected) {
        for (const [a, b] of edges) {
          expect(final.state.nodeGroups?.[a]).not.toBe(
            final.state.nodeGroups?.[b],
          )
        }
      }
    }
  })
})

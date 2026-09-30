import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runBellmanFord } from './bellmanFord'
import { runFloydWarshall } from './floydWarshall'

type Result = ReturnType<typeof runFloydWarshall>

const last = (result: Result) => result.steps[result.steps.length - 1]
const matrixOf = (result: Result) => last(result).state.distanceMatrix!.values

describe('runFloydWarshall', () => {
  it('computes the hand-checked all-pairs matrix of a directed graph', () => {
    // a->b 3, b->c 2, a->c 10, c->a 1
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', 3, true],
          ['b', 'c', 2, true],
          ['a', 'c', 10, true],
          ['c', 'a', 1, true],
        ],
      }),
    )
    expect(matrixOf(result)).toEqual([
      [0, 3, 5],
      [3, 0, 2],
      [1, 4, 0],
    ])
    expect(last(result).type).toBe('done')
  })

  it('leaves unreachable pairs at Infinity', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [['a', 'b', 4, true]],
      }),
    )
    expect(matrixOf(result)).toEqual([
      [0, 4, Infinity],
      [Infinity, 0, Infinity],
      [Infinity, Infinity, 0],
    ])
  })

  it('treats undirected edges as two-way and keeps the cheaper parallel edge', () => {
    const result = runFloydWarshall({
      ...makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 5]] }),
      edges: [
        { id: 'e1', source: 'a', target: 'b', weight: 5, directed: false },
        { id: 'e2', source: 'a', target: 'b', weight: 2, directed: false },
      ],
    })
    expect(matrixOf(result)).toEqual([
      [0, 2],
      [2, 0],
    ])
  })

  it('reconstructs the start-to-target path and follows the start row', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1, true],
          ['b', 'c', 1, true],
          ['c', 'd', 1, true],
          ['a', 'd', 10, true],
        ],
        start: 'a',
        target: 'd',
      }),
    )
    expect(last(result).type).toBe('path-found')
    expect(last(result).state.path).toEqual(['a', 'b', 'c', 'd'])
    expect(last(result).state.distances).toEqual({ a: 0, b: 1, c: 2, d: 3 })
    expect(last(result).state.parents).toMatchObject({
      a: null,
      d: 'c',
      c: 'b',
    })
    expect(result.metrics.pathCost).toBe(3)
    expect(result.metrics.pathLength).toBe(3)
  })

  it('reports no-path when the target is unreachable', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [['b', 'a', 1, true]],
        start: 'a',
        target: 'b',
      }),
    )
    expect(last(result).type).toBe('no-path')
    expect(last(result).state.path).toBeNull()
  })

  it('handles negative edges without a cycle', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', 4, true],
          ['a', 'c', 1, true],
          ['c', 'b', -2, true],
        ],
      }),
    )
    expect(matrixOf(result)[0][1]).toBe(-1)
    expect(last(result).type).toBe('done')
  })

  it('detects a negative cycle and names the nodes on it', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1, true],
          ['b', 'c', -3, true],
          ['c', 'a', 1, true],
          ['c', 'd', 1, true],
        ],
        start: 'a',
        target: 'd',
      }),
    )
    expect(last(result).type).toBe('negative-cycle')
    expect(last(result).state.path).toBeNull()
    expect(Object.keys(last(result).state.nodeGroups ?? {}).sort()).toEqual([
      'a',
      'b',
      'c',
    ])
  })

  it('treats a negative self-loop as a negative cycle', () => {
    const result = runFloydWarshall(
      makeGraph({ nodes: ['a'], edges: [['a', 'a', -1, true]] }),
    )
    expect(last(result).type).toBe('negative-cycle')
  })

  it('handles an empty graph, a single node and a graph without a start', () => {
    expect(
      last(runFloydWarshall(makeGraph({ nodes: [] }))).explanation,
    ).toMatch(/empty/)
    expect(matrixOf(runFloydWarshall(makeGraph({ nodes: ['a'] })))).toEqual([
      [0],
    ])
    const noStart = runFloydWarshall(
      makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 2]] }),
    )
    expect(last(noStart).type).toBe('done')
    expect(last(noStart).state.distances).toEqual({ a: 0, b: 2 })
  })

  it('records a snapshot per step without aliasing the matrix', () => {
    const result = runFloydWarshall(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', 1, true],
          ['b', 'c', 1, true],
        ],
      }),
    )
    const first = result.steps[0].state.distanceMatrix!.values
    expect(first[0][2]).toBe(Infinity)
    expect(matrixOf(result)[0][2]).toBe(2)
    const relax = result.steps.find((s) => s.type === 'relax')!
    expect(relax.state.distanceMatrix!.focus).toEqual([0, 2])
    expect(relax.explanation).toContain('A → B → C costs 1 + 1 = 2')
  })

  it('matches Bellman-Ford from every source on seeded random digraphs', () => {
    let seed = 17
    const next = () => (seed = (seed * 48271) % 2147483647)
    for (let round = 0; round < 15; round++) {
      const ids = Array.from({ length: 7 }, (_, i) => `n${i}`)
      const edges: [string, string, number, boolean][] = []
      for (let i = 0; i < 7; i++) {
        for (let j = 0; j < 7; j++) {
          if (i !== j && next() % 100 < 30) {
            edges.push([ids[i], ids[j], (next() % 9) + 1, true])
          }
        }
      }
      const fw = runFloydWarshall(makeGraph({ nodes: ids, edges }))
      const values = matrixOf(fw)
      for (let s = 0; s < 7; s++) {
        for (let t = 0; t < 7; t++) {
          if (s === t) continue
          const bf = runBellmanFord(
            makeGraph({ nodes: ids, edges, start: ids[s], target: ids[t] }),
          )
          const expected = bf.metrics.pathCost
          expect(values[s][t]).toBe(expected ?? Infinity)
        }
      }
    }
  })
})

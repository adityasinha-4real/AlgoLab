import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runDijkstra } from './dijkstra'
import { runZeroOneBFS } from './zeroOneBfs'

describe('runZeroOneBFS', () => {
  it('throws when start or target is missing', () => {
    expect(() => runZeroOneBFS(makeGraph({ nodes: ['a'] }))).toThrow(
      /start and target/,
    )
  })

  it.each([2, -1, 0.5])('rejects an edge weight of %s', (weight) => {
    const graph = makeGraph({
      nodes: ['a', 'b'],
      edges: [['a', 'b', weight]],
      start: 'a',
      target: 'b',
    })
    expect(() => runZeroOneBFS(graph)).toThrow(/exactly 0 or 1/)
  })

  it('prefers a chain of zero-weight edges over a direct weight-1 edge', () => {
    const graph = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', 1],
        ['a', 'c', 0],
        ['c', 'b', 0],
      ],
      start: 'a',
      target: 'b',
    })
    const result = runZeroOneBFS(graph)
    expect(result.steps[result.steps.length - 1].state.path).toEqual([
      'a',
      'c',
      'b',
    ])
    expect(result.metrics.pathCost).toBe(0)
  })

  it('sums weight-1 edges along a simple path', () => {
    const result = runZeroOneBFS(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', 1],
          ['b', 'c', 1],
        ],
        start: 'a',
        target: 'c',
      }),
    )
    expect(result.metrics.pathCost).toBe(2)
    expect(result.metrics.pathLength).toBe(2)
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runZeroOneBFS(
      makeGraph({ nodes: ['a', 'b'], start: 'a', target: 'b' }),
    )
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(last.state.currentNodeId).toBeNull()
  })

  it('handles start === target and a zero-weight self-loop', () => {
    const result = runZeroOneBFS(
      makeGraph({
        nodes: ['a'],
        edges: [['a', 'a', 0]],
        start: 'a',
        target: 'a',
      }),
    )
    expect(result.steps[result.steps.length - 1].state.path).toEqual(['a'])
    expect(result.metrics.pathCost).toBe(0)
  })

  it('skips a self-loop when exploring on toward the target', () => {
    const result = runZeroOneBFS(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [
          ['a', 'a', 0],
          ['a', 'b', 1],
        ],
        start: 'a',
        target: 'b',
      }),
    )
    expect(result.metrics.pathCost).toBe(1)
  })

  it('matches Dijkstra on a seeded random 0/1-weight graph', () => {
    let seed = 7
    const next = () => (seed = (seed * 48271) % 2147483647)
    const ids = Array.from({ length: 12 }, (_, i) => `n${i}`)
    const edges: [string, string, number, boolean][] = []
    for (let i = 0; i < 26; i++) {
      const a = ids[next() % ids.length]
      const b = ids[next() % ids.length]
      if (a === b || edges.some(([s, t]) => s === a && t === b)) continue
      edges.push([a, b, next() % 2, next() % 3 === 0])
    }
    for (const target of ids) {
      const graph = makeGraph({ nodes: ids, edges, start: 'n0', target })
      expect(runZeroOneBFS(graph).metrics.pathCost).toBe(
        runDijkstra(graph).metrics.pathCost,
      )
    }
  })
})

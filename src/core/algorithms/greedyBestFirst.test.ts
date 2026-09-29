import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runDijkstra } from './dijkstra'
import { runGreedyBestFirst } from './greedyBestFirst'

describe('runGreedyBestFirst', () => {
  it('throws when start or target is missing', () => {
    expect(() => runGreedyBestFirst(makeGraph({ nodes: ['a'] }))).toThrow(
      /start and target/,
    )
  })

  it('throws on a graph containing a negative weight edge', () => {
    const graph = makeGraph({
      nodes: ['a', 'b'],
      edges: [['a', 'b', -1, true]],
      start: 'a',
      target: 'b',
    })
    expect(() => runGreedyBestFirst(graph)).toThrow(/negative edge weights/)
  })

  it('heads straight for the target on a line graph', () => {
    // a(0,0) - b(100,0) - c(200,0), d(100,100) hangs off a.
    const graph = makeGraph({
      nodes: [
        ['a', 0, 0],
        ['b', 100, 0],
        ['c', 200, 0],
        ['d', 100, 100],
      ],
      edges: [
        ['a', 'b'],
        ['b', 'c'],
        ['a', 'd'],
        ['d', 'c', 5],
      ],
      start: 'a',
      target: 'c',
    })
    const result = runGreedyBestFirst(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c'])
    expect(last.state.visited).toEqual(['a', 'b', 'c'])
    expect(result.metrics.pathCost).toBe(2)
  })

  it('is not guaranteed shortest: it takes the geometrically closer but costlier route', () => {
    // Via x (50,0): cost 200. Via y (0,100): cost 2, but y looks farther away.
    const graph = makeGraph({
      nodes: [
        ['a', 0, 0],
        ['x', 50, 0],
        ['y', 0, 100],
        ['t', 100, 0],
      ],
      edges: [
        ['a', 'x', 100],
        ['x', 't', 100],
        ['a', 'y', 1],
        ['y', 't', 1],
      ],
      start: 'a',
      target: 't',
    })
    const greedy = runGreedyBestFirst(graph)
    expect(greedy.steps[greedy.steps.length - 1].state.path).toEqual([
      'a',
      'x',
      't',
    ])
    expect(greedy.metrics.pathCost).toBe(200)
    expect(runDijkstra(graph).metrics.pathCost).toBe(2)
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runGreedyBestFirst(
      makeGraph({ nodes: ['a', 'b'], start: 'a', target: 'b' }),
    )
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(last.state.currentNodeId).toBeNull()
  })

  it('handles start === target and a single node', () => {
    const result = runGreedyBestFirst(
      makeGraph({ nodes: ['a'], start: 'a', target: 'a' }),
    )
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
    expect(result.metrics.pathCost).toBe(0)
  })

  it('skips a self-loop instead of re-discovering the node', () => {
    const result = runGreedyBestFirst(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [
          ['a', 'a'],
          ['a', 'b'],
        ],
        start: 'a',
        target: 'b',
      }),
    )
    expect(result.steps.some((s) => s.type === 'skip-edge')).toBe(true)
    expect(result.steps[result.steps.length - 1].state.path).toEqual(['a', 'b'])
  })

  it('records independent snapshots per step', () => {
    const result = runGreedyBestFirst(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [['a', 'b']],
        start: 'a',
        target: 'b',
      }),
    )
    expect(result.steps[0].state.visited).toEqual([])
    expect(result.steps[0].state.frontier).toEqual(['a'])
  })
})

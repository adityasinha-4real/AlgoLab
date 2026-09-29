import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { GRAPH_PRESETS } from '../graph/presets'
import { runBFS } from './bfs'
import { runBidirectionalBFS } from './bidirectionalBfs'

const pathOf = (result: ReturnType<typeof runBidirectionalBFS>) =>
  result.steps[result.steps.length - 1].state.path

describe('runBidirectionalBFS', () => {
  it('throws when start or target is missing', () => {
    expect(() => runBidirectionalBFS(makeGraph({ nodes: ['a'] }))).toThrow(
      /start and target/,
    )
  })

  it('finds the path on a five-node chain, meeting in the middle', () => {
    const result = runBidirectionalBFS(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 'e'],
        edges: [
          ['a', 'b'],
          ['b', 'c'],
          ['c', 'd'],
          ['d', 'e'],
        ],
        start: 'a',
        target: 'e',
      }),
    )
    expect(pathOf(result)).toEqual(['a', 'b', 'c', 'd', 'e'])
    expect(result.metrics.pathLength).toBe(4)
    expect(result.metrics.pathCost).toBe(4)
    // Each side only needs two hops, so far fewer than 5 nodes are dequeued twice.
    expect(result.steps.some((s) => s.explanation.includes('meet'))).toBe(true)
  })

  it('respects edge direction, walking backward edges from the target', () => {
    const graph = makeGraph({
      nodes: ['a', 'b', 'c'],
      edges: [
        ['a', 'b', 1, true],
        ['b', 'c', 1, true],
      ],
      start: 'a',
      target: 'c',
    })
    expect(pathOf(runBidirectionalBFS(graph))).toEqual(['a', 'b', 'c'])
  })

  it('reports no-path when edges point the wrong way', () => {
    const result = runBidirectionalBFS(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['c', 'b', 1, true],
          ['b', 'a', 1, true],
        ],
        start: 'a',
        target: 'c',
      }),
    )
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(last.state.currentNodeId).toBeNull()
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runBidirectionalBFS(
      makeGraph({ nodes: ['a', 'b'], start: 'a', target: 'b' }),
    )
    expect(result.steps[result.steps.length - 1].type).toBe('no-path')
  })

  it('handles start === target on a single node', () => {
    const result = runBidirectionalBFS(
      makeGraph({ nodes: ['a'], start: 'a', target: 'a' }),
    )
    expect(pathOf(result)).toEqual(['a'])
    expect(result.metrics.pathLength).toBe(0)
  })

  it('ignores self-loops', () => {
    const result = runBidirectionalBFS(
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
    expect(pathOf(result)).toEqual(['a', 'b'])
  })

  it('picks the fewest-edges route when a level offers several meeting points', () => {
    // a-b-t (2 edges) versus a-c-d-t (3 edges).
    const result = runBidirectionalBFS(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd', 't'],
        edges: [
          ['a', 'c'],
          ['c', 'd'],
          ['d', 't'],
          ['a', 'b'],
          ['b', 't'],
        ],
        start: 'a',
        target: 't',
      }),
    )
    expect(pathOf(result)).toEqual(['a', 'b', 't'])
  })

  it('agrees with BFS on path length for every preset', () => {
    for (const preset of Object.values(GRAPH_PRESETS)) {
      const graph = preset.build()
      const bidirectional = runBidirectionalBFS(graph)
      expect(bidirectional.metrics.pathLength).toBe(
        runBFS(graph).metrics.pathLength,
      )
    }
  })
})

import { describe, expect, it } from 'vitest'
import { addEdge, addNode, createEmptyGraph } from '../graph/builders'
import { buildEuclideanHeuristic } from './heuristics'

describe('buildEuclideanHeuristic', () => {
  it('returns 0 for the target itself', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 100, y: 0 })
    graph = addEdge(graph, {
      id: 'e',
      source: 'a',
      target: 'b',
      weight: 5,
      directed: false,
    })

    const h = buildEuclideanHeuristic(graph, 'b')
    expect(h('b')).toBe(0)
  })

  it('never overestimates the true edge weight for a direct edge (admissibility)', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 100, y: 0 })
    graph = addEdge(graph, {
      id: 'e',
      source: 'a',
      target: 'b',
      weight: 5,
      directed: false,
    })

    const h = buildEuclideanHeuristic(graph, 'b')
    expect(h('a')).toBeLessThanOrEqual(5)
  })

  it('stays admissible even when weights are unrelated to pixel distance', () => {
    // a-b is close (dist 10) but expensive (weight 100); a-c is far (dist
    // 1000) but cheap (weight 1). The scale must come from the tightest
    // (most restrictive) ratio across all edges, so neither edge's cost is
    // ever overestimated by the heuristic.
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 10, y: 0 })
    graph = addNode(graph, { id: 'c', label: 'C', x: 1000, y: 0 })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: 100,
      directed: false,
    })
    graph = addEdge(graph, {
      id: 'ac',
      source: 'a',
      target: 'c',
      weight: 1,
      directed: false,
    })

    const h = buildEuclideanHeuristic(graph, 'c')
    // scale = min(100/10, 1/1000) = 0.001; h(a) = dist(a,c) * scale = 1000*0.001 = 1
    expect(h('a')).toBeLessThanOrEqual(1)
  })

  it('returns 0 everywhere when the target does not exist', () => {
    const graph = addNode(createEmptyGraph(), {
      id: 'a',
      label: 'A',
      x: 0,
      y: 0,
    })
    const h = buildEuclideanHeuristic(graph, 'missing')
    expect(h('a')).toBe(0)
  })

  it('handles overlapping nodes (zero pixel distance) without dividing by zero', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 5, y: 5 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 5, y: 5 })
    graph = addEdge(graph, {
      id: 'e',
      source: 'a',
      target: 'b',
      weight: 3,
      directed: false,
    })

    const h = buildEuclideanHeuristic(graph, 'b')
    expect(Number.isFinite(h('a'))).toBe(true)
  })
})

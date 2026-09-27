import { describe, expect, it } from 'vitest'
import { hasNegativeWeightEdge, validateGraph } from './validate'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from './builders'

function node(id: string) {
  return { id, label: id, x: 0, y: 0 }
}

describe('validateGraph', () => {
  it('reports EMPTY_GRAPH and stops early when there are no nodes', () => {
    const errors = validateGraph(createEmptyGraph())
    expect(errors).toEqual([
      { code: 'EMPTY_GRAPH', message: 'The graph has no nodes.' },
    ])
  })

  it('reports missing start and target', () => {
    const graph = addNode(createEmptyGraph(), node('a'))
    const errors = validateGraph(graph)
    expect(errors.map((e) => e.code)).toEqual(
      expect.arrayContaining(['MISSING_START', 'MISSING_TARGET']),
    )
  })

  it('reports DISCONNECTED when the target is unreachable from the start', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')

    const errors = validateGraph(graph)

    expect(errors).toEqual([
      {
        code: 'DISCONNECTED',
        message: 'Target node is not reachable from the start node.',
      },
    ])
  })

  it('passes for a valid, connected graph with a start and target', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')

    expect(validateGraph(graph)).toEqual([])
  })
})

describe('hasNegativeWeightEdge', () => {
  it('returns false when no edge has a negative weight', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 3,
      directed: false,
    })
    expect(hasNegativeWeightEdge(graph)).toBe(false)
  })

  it('returns true when at least one edge has a negative weight', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: -2,
      directed: false,
    })
    expect(hasNegativeWeightEdge(graph)).toBe(true)
  })
})

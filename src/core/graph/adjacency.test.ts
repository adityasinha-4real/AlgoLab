import { describe, expect, it } from 'vitest'
import { buildAdjacencyList, findEdgeBetween } from './adjacency'
import { addEdge, addNode, createEmptyGraph } from './builders'

function node(id: string) {
  return { id, label: id, x: 0, y: 0 }
}

describe('buildAdjacencyList', () => {
  it('adds a single entry for directed edges', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: true,
    })

    const adjacency = buildAdjacencyList(graph)

    expect(adjacency.get('a')?.map((e) => e.neighbor)).toEqual(['b'])
    expect(adjacency.get('b')?.map((e) => e.neighbor)).toEqual([])
  })

  it('adds entries in both directions for undirected edges', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })

    const adjacency = buildAdjacencyList(graph)

    expect(adjacency.get('a')?.map((e) => e.neighbor)).toEqual(['b'])
    expect(adjacency.get('b')?.map((e) => e.neighbor)).toEqual(['a'])
  })

  it('preserves edge insertion order for deterministic traversal', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addNode(graph, node('c'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'c',
      weight: 1,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'e2',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: true,
    })

    const adjacency = buildAdjacencyList(graph)

    expect(adjacency.get('a')?.map((e) => e.neighbor)).toEqual(['c', 'b'])
  })
})

describe('findEdgeBetween', () => {
  it('finds a directed edge only in its forward direction', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: true,
    })

    expect(findEdgeBetween(graph, 'a', 'b')?.id).toBe('e1')
    expect(findEdgeBetween(graph, 'b', 'a')).toBeUndefined()
  })

  it('finds an undirected edge in either direction', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, {
      id: 'e1',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: false,
    })

    expect(findEdgeBetween(graph, 'a', 'b')?.id).toBe('e1')
    expect(findEdgeBetween(graph, 'b', 'a')?.id).toBe('e1')
  })

  it('returns undefined when no edge connects the pair', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    expect(findEdgeBetween(graph, 'a', 'b')).toBeUndefined()
  })
})

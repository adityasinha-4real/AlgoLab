import { describe, expect, it } from 'vitest'
import { buildAdjacencyList } from './adjacency'
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

import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  removeEdge,
  removeNode,
  setStartNode,
  setTargetNode,
  updateNodePosition,
} from './builders'

function node(id: string, x = 0, y = 0) {
  return { id, label: id, x, y }
}

function edge(id: string, source: string, target: string, weight = 1) {
  return { id, source, target, weight, directed: false }
}

describe('createEmptyGraph', () => {
  it('starts with no nodes, no edges, and no start/target', () => {
    const graph = createEmptyGraph()
    expect(graph).toEqual({
      nodes: [],
      edges: [],
      startNodeId: null,
      targetNodeId: null,
    })
  })
})

describe('addNode', () => {
  it('appends a node without mutating the original graph', () => {
    const graph = createEmptyGraph()
    const next = addNode(graph, node('a'))
    expect(graph.nodes).toHaveLength(0)
    expect(next.nodes).toEqual([node('a')])
  })

  it('throws when adding a node with a duplicate id', () => {
    const graph = addNode(createEmptyGraph(), node('a'))
    expect(() => addNode(graph, node('a'))).toThrow(/already exists/)
  })
})

describe('updateNodePosition', () => {
  it('updates only the matching node', () => {
    let graph = addNode(createEmptyGraph(), node('a', 0, 0))
    graph = addNode(graph, node('b', 1, 1))
    const next = updateNodePosition(graph, 'a', 5, 6)
    expect(next.nodes.find((n) => n.id === 'a')).toEqual(node('a', 5, 6))
    expect(next.nodes.find((n) => n.id === 'b')).toEqual(node('b', 1, 1))
  })
})

describe('addEdge', () => {
  it('adds an edge between two existing nodes', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    const next = addEdge(graph, edge('e1', 'a', 'b'))
    expect(next.edges).toEqual([edge('e1', 'a', 'b')])
  })

  it('throws when referencing a node that does not exist', () => {
    const graph = addNode(createEmptyGraph(), node('a'))
    expect(() => addEdge(graph, edge('e1', 'a', 'missing'))).toThrow(
      /does not exist/,
    )
  })

  it('throws when adding an edge with a duplicate id', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, edge('e1', 'a', 'b'))
    expect(() => addEdge(graph, edge('e1', 'a', 'b'))).toThrow(/already exists/)
  })
})

describe('removeNode', () => {
  it('removes the node, its incident edges, and clears start/target references', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, edge('e1', 'a', 'b'))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')

    const next = removeNode(graph, 'a')

    expect(next.nodes.map((n) => n.id)).toEqual(['b'])
    expect(next.edges).toEqual([])
    expect(next.startNodeId).toBeNull()
    expect(next.targetNodeId).toBe('b')
  })
})

describe('removeEdge', () => {
  it('removes only the matching edge', () => {
    let graph = addNode(createEmptyGraph(), node('a'))
    graph = addNode(graph, node('b'))
    graph = addEdge(graph, edge('e1', 'a', 'b'))
    graph = addEdge(graph, edge('e2', 'b', 'a'))

    const next = removeEdge(graph, 'e1')

    expect(next.edges.map((e) => e.id)).toEqual(['e2'])
  })
})

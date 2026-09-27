import { beforeEach, describe, expect, it } from 'vitest'
import { useGraphStore } from './graphStore'

beforeEach(() => {
  useGraphStore.getState().clear()
  useGraphStore.setState({ isAddingNode: false, newEdgeDirected: false })
})

describe('graphStore', () => {
  it('adds a node at the given position and selects it', () => {
    useGraphStore.getState().addNodeAt(100, 200)
    const { graph, selected } = useGraphStore.getState()
    expect(graph.nodes).toHaveLength(1)
    expect(graph.nodes[0]).toMatchObject({ label: 'A', x: 100, y: 200 })
    expect(selected).toEqual({ kind: 'node', id: graph.nodes[0].id })
  })

  it('labels sequential nodes A, B, C, ...', () => {
    const { addNodeAt } = useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(0, 0)
    addNodeAt(0, 0)
    const labels = useGraphStore.getState().graph.nodes.map((n) => n.label)
    expect(labels).toEqual(['A', 'B', 'C'])
  })

  it('moves a node to a new position', () => {
    const { addNodeAt, moveNode } = useGraphStore.getState()
    addNodeAt(0, 0)
    const id = useGraphStore.getState().graph.nodes[0].id
    moveNode(id, 50, 75)
    expect(useGraphStore.getState().graph.nodes[0]).toMatchObject({
      x: 50,
      y: 75,
    })
  })

  it('connects two nodes with a default weight of 1', () => {
    const { addNodeAt, connectNodes } = useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    const { graph, selected } = useGraphStore.getState()
    expect(graph.edges).toHaveLength(1)
    expect(graph.edges[0]).toMatchObject({
      source: a.id,
      target: b.id,
      weight: 1,
      directed: false,
    })
    expect(selected).toEqual({ kind: 'edge', id: graph.edges[0].id })
  })

  it('does not create a duplicate edge between an already-connected pair', () => {
    const { addNodeAt, connectNodes } = useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    connectNodes(b.id, a.id)
    expect(useGraphStore.getState().graph.edges).toHaveLength(1)
  })

  it('respects the newEdgeDirected flag for subsequently created edges', () => {
    const { addNodeAt, connectNodes, setNewEdgeDirected } =
      useGraphStore.getState()
    setNewEdgeDirected(true)
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    expect(useGraphStore.getState().graph.edges[0].directed).toBe(true)
  })

  it('deleting a node removes its incident edges and clears selection', () => {
    const { addNodeAt, connectNodes, deleteNode, select } =
      useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    select({ kind: 'node', id: a.id })

    deleteNode(a.id)

    const { graph, selected } = useGraphStore.getState()
    expect(graph.nodes.map((n) => n.id)).toEqual([b.id])
    expect(graph.edges).toHaveLength(0)
    expect(selected).toBeNull()
  })

  it('updates edge weight and directed flag', () => {
    const { addNodeAt, connectNodes, updateEdgeWeight, toggleEdgeDirected } =
      useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    connectNodes(a.id, b.id)
    const edgeId = useGraphStore.getState().graph.edges[0].id

    updateEdgeWeight(edgeId, 7)
    toggleEdgeDirected(edgeId)

    const edge = useGraphStore.getState().graph.edges[0]
    expect(edge.weight).toBe(7)
    expect(edge.directed).toBe(true)
  })

  it('marks start and target nodes', () => {
    const { addNodeAt, markStart, markTarget } = useGraphStore.getState()
    addNodeAt(0, 0)
    addNodeAt(100, 0)
    const [a, b] = useGraphStore.getState().graph.nodes
    markStart(a.id)
    markTarget(b.id)
    const { graph } = useGraphStore.getState()
    expect(graph.startNodeId).toBe(a.id)
    expect(graph.targetNodeId).toBe(b.id)
  })

  it('clear() resets to an empty graph and no selection', () => {
    const { addNodeAt, clear, select } = useGraphStore.getState()
    addNodeAt(0, 0)
    select({ kind: 'node', id: useGraphStore.getState().graph.nodes[0].id })

    clear()

    const { graph, selected } = useGraphStore.getState()
    expect(graph.nodes).toHaveLength(0)
    expect(selected).toBeNull()
  })
})

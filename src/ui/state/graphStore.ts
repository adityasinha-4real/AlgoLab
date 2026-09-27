import { create } from 'zustand'
import {
  addEdge as addGraphEdge,
  addNode as addGraphNode,
  createEmptyGraph,
  generateId,
  labelForIndex,
  removeEdge as removeGraphEdge,
  removeNode as removeGraphNode,
  setStartNode,
  setTargetNode,
  updateNodePosition,
  type Graph,
  type GraphEdge,
  type NodeId,
} from '../../core/graph'

export type SelectedElement =
  { kind: 'node'; id: NodeId } | { kind: 'edge'; id: string } | null

interface GraphStoreState {
  graph: Graph
  selected: SelectedElement
  /** When set, the next canvas click adds a node at that position instead of panning/selecting. */
  isAddingNode: boolean
  /** Directed vs undirected applied to edges created from now on. */
  newEdgeDirected: boolean

  setGraph: (graph: Graph) => void
  addNodeAt: (x: number, y: number) => void
  moveNode: (id: NodeId, x: number, y: number) => void
  deleteNode: (id: NodeId) => void
  connectNodes: (source: NodeId, target: NodeId) => void
  updateEdgeWeight: (id: string, weight: number) => void
  toggleEdgeDirected: (id: string) => void
  deleteEdge: (id: string) => void
  markStart: (id: NodeId) => void
  markTarget: (id: NodeId) => void
  select: (selection: SelectedElement) => void
  setIsAddingNode: (value: boolean) => void
  setNewEdgeDirected: (value: boolean) => void
  clear: () => void
}

export const useGraphStore = create<GraphStoreState>((set, get) => ({
  graph: createEmptyGraph(),
  selected: null,
  isAddingNode: false,
  newEdgeDirected: false,

  setGraph: (graph) => set({ graph, selected: null }),

  addNodeAt: (x, y) => {
    const { graph } = get()
    const label = labelForIndex(graph.nodes.length)
    const id = generateId('node')
    set({
      graph: addGraphNode(graph, { id, label, x, y }),
      isAddingNode: false,
      selected: { kind: 'node', id },
    })
  },

  moveNode: (id, x, y) => {
    set((state) => ({ graph: updateNodePosition(state.graph, id, x, y) }))
  },

  deleteNode: (id) => {
    set((state) => ({
      graph: removeGraphNode(state.graph, id),
      selected:
        state.selected?.kind === 'node' && state.selected.id === id
          ? null
          : state.selected,
    }))
  },

  connectNodes: (source, target) => {
    const { graph, newEdgeDirected } = get()
    if (source === target) return
    const alreadyConnected = graph.edges.some(
      (e) =>
        (e.source === source && e.target === target) ||
        (!e.directed && e.source === target && e.target === source),
    )
    if (alreadyConnected) return
    const id = generateId('edge')
    set({
      graph: addGraphEdge(graph, {
        id,
        source,
        target,
        weight: 1,
        directed: newEdgeDirected,
      }),
      selected: { kind: 'edge', id },
    })
  },

  updateEdgeWeight: (id, weight) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.map((e) =>
          e.id === id ? { ...e, weight } : e,
        ),
      },
    }))
  },

  toggleEdgeDirected: (id) => {
    set((state) => ({
      graph: {
        ...state.graph,
        edges: state.graph.edges.map((e) =>
          e.id === id ? { ...e, directed: !e.directed } : e,
        ),
      },
    }))
  },

  deleteEdge: (id) => {
    set((state) => ({
      graph: removeGraphEdge(state.graph, id),
      selected:
        state.selected?.kind === 'edge' && state.selected.id === id
          ? null
          : state.selected,
    }))
  },

  markStart: (id) => set((state) => ({ graph: setStartNode(state.graph, id) })),
  markTarget: (id) =>
    set((state) => ({ graph: setTargetNode(state.graph, id) })),

  select: (selection) => set({ selected: selection }),
  setIsAddingNode: (value) => set({ isAddingNode: value }),
  setNewEdgeDirected: (value) => set({ newEdgeDirected: value }),

  clear: () => set({ graph: createEmptyGraph(), selected: null }),
}))

export function findSelectedEdge(
  graph: Graph,
  selected: SelectedElement,
): GraphEdge | null {
  if (!selected || selected.kind !== 'edge') return null
  return graph.edges.find((e) => e.id === selected.id) ?? null
}

import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from './builders'
import type { Graph } from './types'

export type PresetId =
  'simple-path' | 'triangle-shortcut' | 'disconnected-pair' | 'negative-edge'

export interface GraphPreset {
  id: PresetId
  name: string
  description: string
  build: () => Graph
}

function node(id: string, label: string, x: number, y: number) {
  return { id, label, x, y }
}

function edge(
  id: string,
  source: string,
  target: string,
  weight: number,
  directed = false,
) {
  return { id, source, target, weight, directed }
}

const simplePath: GraphPreset = {
  id: 'simple-path',
  name: 'Simple path',
  description: 'A straight chain of four nodes — the smallest useful graph.',
  build: () => {
    let graph = createEmptyGraph()
    graph = addNode(graph, node('a', 'A', 60, 200))
    graph = addNode(graph, node('b', 'B', 260, 200))
    graph = addNode(graph, node('c', 'C', 460, 200))
    graph = addNode(graph, node('d', 'D', 660, 200))
    graph = addEdge(graph, edge('ab', 'a', 'b', 2))
    graph = addEdge(graph, edge('bc', 'b', 'c', 3))
    graph = addEdge(graph, edge('cd', 'c', 'd', 1))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'd')
    return graph
  },
}

const triangleShortcut: GraphPreset = {
  id: 'triangle-shortcut',
  name: 'Triangle shortcut',
  description:
    'The direct edge looks cheapest but the two-hop route is shorter — a classic Dijkstra demo.',
  build: () => {
    let graph = createEmptyGraph()
    graph = addNode(graph, node('a', 'A', 100, 300))
    graph = addNode(graph, node('b', 'B', 400, 120))
    graph = addNode(graph, node('c', 'C', 700, 300))
    graph = addEdge(graph, edge('ac', 'a', 'c', 10))
    graph = addEdge(graph, edge('ab', 'a', 'b', 3))
    graph = addEdge(graph, edge('bc', 'b', 'c', 3))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'c')
    return graph
  },
}

const disconnectedPair: GraphPreset = {
  id: 'disconnected-pair',
  name: 'Disconnected pair',
  description:
    'Two separate components with no path between start and target — exercises error handling.',
  build: () => {
    let graph = createEmptyGraph()
    graph = addNode(graph, node('a', 'A', 100, 150))
    graph = addNode(graph, node('b', 'B', 300, 150))
    graph = addNode(graph, node('c', 'C', 550, 350))
    graph = addNode(graph, node('d', 'D', 750, 350))
    graph = addEdge(graph, edge('ab', 'a', 'b', 1))
    graph = addEdge(graph, edge('cd', 'c', 'd', 1))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'd')
    return graph
  },
}

const negativeEdge: GraphPreset = {
  id: 'negative-edge',
  name: 'Negative edge (no cycle)',
  description:
    'Includes one negative-weight edge with no negative cycle — Dijkstra should reject it, Bellman-Ford should handle it.',
  build: () => {
    let graph = createEmptyGraph()
    graph = addNode(graph, node('a', 'A', 100, 250))
    graph = addNode(graph, node('b', 'B', 350, 100))
    graph = addNode(graph, node('c', 'C', 350, 400))
    graph = addNode(graph, node('d', 'D', 600, 250))
    graph = addEdge(graph, edge('ab', 'a', 'b', 4, true))
    graph = addEdge(graph, edge('ac', 'a', 'c', 2, true))
    graph = addEdge(graph, edge('cb', 'c', 'b', -3, true))
    graph = addEdge(graph, edge('bd', 'b', 'd', 3, true))
    graph = addEdge(graph, edge('cd', 'c', 'd', 6, true))
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'd')
    return graph
  },
}

export const GRAPH_PRESETS: Record<PresetId, GraphPreset> = {
  'simple-path': simplePath,
  'triangle-shortcut': triangleShortcut,
  'disconnected-pair': disconnectedPair,
  'negative-edge': negativeEdge,
}

export function listGraphPresets(): GraphPreset[] {
  return Object.values(GRAPH_PRESETS)
}

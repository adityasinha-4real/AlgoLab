import type { Graph, GraphEdge, NodeId } from './types'

export interface AdjacencyEntry {
  neighbor: NodeId
  edge: GraphEdge
}

export type AdjacencyList = Map<NodeId, AdjacencyEntry[]>

/**
 * Builds a neighbor lookup honoring edge direction. Undirected edges add
 * entries in both directions; directed edges only add source -> target.
 * Neighbor order follows edge insertion order, which is what keeps
 * algorithm traversal order (and thus recorded steps) deterministic.
 */
export function buildAdjacencyList(graph: Graph): AdjacencyList {
  const adjacency: AdjacencyList = new Map()
  for (const node of graph.nodes) {
    adjacency.set(node.id, [])
  }

  for (const edge of graph.edges) {
    adjacency.get(edge.source)?.push({ neighbor: edge.target, edge })
    if (!edge.directed) {
      adjacency.get(edge.target)?.push({ neighbor: edge.source, edge })
    }
  }

  return adjacency
}

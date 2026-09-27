import { buildAdjacencyList } from './adjacency'
import type { Graph, GraphValidationError } from './types'

/**
 * Structural validation only. Algorithm-specific constraints (e.g. Dijkstra
 * rejecting negative weights, Bellman-Ford's negative-cycle detection) are
 * reported by the algorithms themselves, since detecting them can require
 * running the algorithm.
 */
export function validateGraph(graph: Graph): GraphValidationError[] {
  const errors: GraphValidationError[] = []

  if (graph.nodes.length === 0) {
    errors.push({ code: 'EMPTY_GRAPH', message: 'The graph has no nodes.' })
    return errors
  }

  if (!graph.startNodeId) {
    errors.push({
      code: 'MISSING_START',
      message: 'No start node has been selected.',
    })
  } else if (!graph.nodes.some((n) => n.id === graph.startNodeId)) {
    errors.push({
      code: 'START_NOT_FOUND',
      message: `Start node "${graph.startNodeId}" does not exist in the graph.`,
    })
  }

  if (!graph.targetNodeId) {
    errors.push({
      code: 'MISSING_TARGET',
      message: 'No target node has been selected.',
    })
  } else if (!graph.nodes.some((n) => n.id === graph.targetNodeId)) {
    errors.push({
      code: 'TARGET_NOT_FOUND',
      message: `Target node "${graph.targetNodeId}" does not exist in the graph.`,
    })
  }

  if (
    graph.startNodeId &&
    graph.targetNodeId &&
    graph.nodes.some((n) => n.id === graph.startNodeId) &&
    graph.nodes.some((n) => n.id === graph.targetNodeId) &&
    !isReachable(graph, graph.startNodeId, graph.targetNodeId)
  ) {
    errors.push({
      code: 'DISCONNECTED',
      message: 'Target node is not reachable from the start node.',
    })
  }

  return errors
}

export function hasNegativeWeightEdge(graph: Graph): boolean {
  return graph.edges.some((e) => e.weight < 0)
}

function isReachable(graph: Graph, from: string, to: string): boolean {
  const adjacency = buildAdjacencyList(graph)
  const visited = new Set<string>([from])
  const queue = [from]

  while (queue.length > 0) {
    const current = queue.shift() as string
    if (current === to) return true
    for (const { neighbor } of adjacency.get(current) ?? []) {
      if (!visited.has(neighbor)) {
        visited.add(neighbor)
        queue.push(neighbor)
      }
    }
  }

  return false
}

import type { ExecutionStep } from '../../../core/engine'
import { findEdgeBetween, type Graph } from '../../../core/graph'
import type { NodeAlgorithmStatus } from './GraphNodeView'

export function nodeStatus(
  id: string,
  step: ExecutionStep | null,
): NodeAlgorithmStatus {
  if (!step) return 'default'
  const { state } = step
  if (state.path?.includes(id)) return 'path'
  if (state.currentNodeId === id) return 'current'
  const group = state.nodeGroups?.[id]
  if (group !== undefined) return `group-${group}`
  if (state.visited.includes(id)) return 'visited'
  if (state.frontier.includes(id)) return 'frontier'
  return 'default'
}

export function pathEdgeIds(
  graph: Graph,
  step: ExecutionStep | null,
): Set<string> {
  const ids = new Set<string>()
  for (const edgeId of step?.state.highlightedEdges ?? []) ids.add(edgeId)
  const path = step?.state.path
  if (!path) return ids
  for (let i = 0; i < path.length - 1; i++) {
    const edge = findEdgeBetween(graph, path[i], path[i + 1])
    if (edge) ids.add(edge.id)
  }
  return ids
}

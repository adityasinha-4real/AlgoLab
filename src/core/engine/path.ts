import type { NodeId } from '../graph/types'

/** Walks parent pointers from target back to start. Shared by every
 * shortest-path/traversal algorithm so path reconstruction stays consistent. */
export function reconstructPath(
  parents: Record<NodeId, NodeId | null>,
  start: NodeId,
  target: NodeId,
): NodeId[] {
  const path: NodeId[] = []
  let cursor: NodeId | null = target

  while (cursor !== null) {
    path.unshift(cursor)
    if (cursor === start) break
    cursor = parents[cursor] ?? null
  }

  return path
}

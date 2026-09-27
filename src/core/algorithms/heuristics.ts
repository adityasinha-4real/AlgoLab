import type { Graph, NodeId } from '../graph/types'

function euclideanDistance(
  a: { x: number; y: number },
  b: { x: number; y: number },
): number {
  return Math.hypot(a.x - b.x, a.y - b.y)
}

/**
 * Builds an admissible Euclidean-distance heuristic for A* on free-form
 * graphs, where edge weights are arbitrary and not necessarily proportional
 * to node layout distance (unlike a uniform-cost grid).
 *
 * Admissibility proof sketch: let `scale` be the minimum (weight / pixel
 * distance) ratio over all edges. Then every edge satisfies
 * `weight >= scale * pixelDistance`, so the total weight of any path from n
 * to the target is >= `scale * (sum of edge pixel distances along it)`,
 * which by the triangle inequality is >= `scale * pixelDistance(n, target)`.
 * That lower bound is exactly `h(n)`, so h(n) never overestimates the true
 * shortest-path cost from n - the definition of admissible.
 */
export function buildEuclideanHeuristic(
  graph: Graph,
  targetId: NodeId,
): (nodeId: NodeId) => number {
  const nodeById = new Map(graph.nodes.map((n) => [n.id, n]))
  const target = nodeById.get(targetId)
  if (!target) return () => 0

  let scale = Infinity
  for (const edge of graph.edges) {
    const source = nodeById.get(edge.source)
    const dest = nodeById.get(edge.target)
    if (!source || !dest) continue
    const distance = euclideanDistance(source, dest)
    if (distance > 0) {
      scale = Math.min(scale, edge.weight / distance)
    }
  }
  if (!Number.isFinite(scale) || scale <= 0) scale = 0

  return (nodeId: NodeId) => {
    const node = nodeById.get(nodeId)
    if (!node) return 0
    return euclideanDistance(node, target) * scale
  }
}

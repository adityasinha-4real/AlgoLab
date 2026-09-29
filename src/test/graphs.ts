import type { Graph } from '../core/graph/types'

type NodeSpec = string | [id: string, x: number, y: number]
type EdgeSpec = [
  source: string,
  target: string,
  weight?: number,
  directed?: boolean,
]

/** Compact graph literal for algorithm tests: node labels are the upper-cased
 * ids, edge ids are `${source}${target}`, and edges default to weight 1 and
 * undirected. */
export function makeGraph(options: {
  nodes: NodeSpec[]
  edges?: EdgeSpec[]
  start?: string
  target?: string
}): Graph {
  return {
    nodes: options.nodes.map((spec, i) => {
      const [id, x, y] = typeof spec === 'string' ? [spec, i * 100, 0] : spec
      return { id, label: id.toUpperCase(), x, y }
    }),
    edges: (options.edges ?? []).map(
      ([source, target, weight = 1, directed = false]) => ({
        id: `${source}${target}`,
        source,
        target,
        weight,
        directed,
      }),
    ),
    startNodeId: options.start ?? null,
    targetNodeId: options.target ?? null,
  }
}

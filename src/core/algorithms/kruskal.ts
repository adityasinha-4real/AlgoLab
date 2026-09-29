import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import type { Graph } from '../graph/types'

/**
 * Considers edges from cheapest to dearest, keeping an edge whenever it joins
 * two different components (tracked with a union-find). The queue of pending
 * edges is the sorted list, which does not fit `frontier` (a list of nodes),
 * so it is left empty and described in the explanations instead. Components
 * with more than one node are colored through `nodeGroups`, and the kept
 * edges accumulate in `highlightedEdges`. Stops as soon as the tree spans
 * every node; on a disconnected graph every edge is considered and the
 * result is a minimum spanning forest.
 */
export function runKruskal(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => e.directed)) {
    throw new Error(
      "Kruskal's MST requires an undirected graph - every edge must be undirected.",
    )
  }

  const startedAt = performance.now()
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id
  const order = new Map(graph.nodes.map((n, i) => [n.id, i]))

  const parent = new Map(graph.nodes.map((n) => [n.id, n.id]))
  const find = (id: string): string => {
    let root = id
    while (parent.get(root) !== root) root = parent.get(root) as string
    let cursor = id
    while (cursor !== root) {
      const next = parent.get(cursor) as string
      parent.set(cursor, root)
      cursor = next
    }
    return root
  }

  const sorted = [...graph.edges].sort((a, b) => a.weight - b.weight)
  const recorder = new StepRecorder()
  let treeSize = 0
  let total = 0

  const groupsSnapshot = () => {
    const members = new Map<string, string[]>()
    for (const node of graph.nodes) {
      const root = find(node.id)
      members.set(root, [...(members.get(root) ?? []), node.id])
    }
    const groups: Record<string, number> = {}
    for (const ids of members.values()) {
      if (ids.length < 2) continue
      const group = Math.min(...ids.map((id) => order.get(id) as number))
      for (const id of ids) groups[id] = group
    }
    return groups
  }

  recorder.record(
    'init',
    2,
    sorted.length === 0
      ? 'There are no edges to consider.'
      : `Sort the edges by weight: ${sorted.map((e) => `${labelOf(e.source)}—${labelOf(e.target)} (${e.weight})`).join(', ')}. Every node starts in its own set.`,
    () => {},
  )

  for (const edge of sorted) {
    if (treeSize === graph.nodes.length - 1) break

    recorder.record(
      'examine-edge',
      3,
      `Consider the next cheapest edge ${labelOf(edge.source)} — ${labelOf(edge.target)} (weight ${edge.weight}).`,
      (s) => {
        s.currentEdgeId = edge.id
      },
    )

    const rootA = find(edge.source)
    const rootB = find(edge.target)
    if (rootA === rootB) {
      recorder.record(
        'skip-edge',
        4,
        `${labelOf(edge.source)} and ${labelOf(edge.target)} are already connected - this edge would form a cycle.`,
        () => {},
      )
      continue
    }

    parent.set(rootA, rootB)
    treeSize++
    total += edge.weight
    recorder.record(
      'visit',
      5,
      `Add edge ${labelOf(edge.source)} — ${labelOf(edge.target)} (weight ${edge.weight}) to the MST and merge their components.`,
      (s) => {
        for (const id of [edge.source, edge.target]) {
          if (!s.visited.includes(id)) s.visited.push(id)
        }
        s.highlightedEdges = [...(s.highlightedEdges ?? []), edge.id]
        s.nodeGroups = groupsSnapshot()
      },
    )
  }

  const components = graph.nodes.length - treeSize
  recorder.record(
    'done',
    7,
    graph.nodes.length === 0
      ? 'The graph is empty - there is no tree to build.'
      : components > 1
        ? `Done: a minimum spanning forest of ${treeSize} edge(s) across ${components} components, total weight ${total}.`
        : `Done: the minimum spanning tree has ${treeSize} edge(s), total weight ${total}.`,
    (s) => {
      s.currentEdgeId = null
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'kruskal',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

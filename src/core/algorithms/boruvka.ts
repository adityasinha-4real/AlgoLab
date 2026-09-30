import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import type { Graph, GraphEdge } from '../graph/types'

/**
 * Borůvka's MST, in rounds. Every round, each component picks its cheapest
 * outgoing edge (ties broken by edge order, which also rules out cycles);
 * all picks are then added at once and their components merged. Components
 * with more than one node are colored through `nodeGroups`, and the kept
 * edges accumulate in `highlightedEdges`. While a component is choosing,
 * `currentEdgeId` is its candidate. On a disconnected graph the result is a
 * minimum spanning forest.
 */
export function runBoruvka(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => e.directed)) {
    throw new Error(
      "Boruvka's MST requires an undirected graph - every edge must be undirected.",
    )
  }

  const startedAt = performance.now()
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id
  const order = new Map(graph.nodes.map((n, i) => [n.id, i]))
  const edgeOrder = new Map(graph.edges.map((e, i) => [e.id, i]))

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

  const membersByRoot = () => {
    const members = new Map<string, string[]>()
    for (const node of graph.nodes) {
      const root = find(node.id)
      members.set(root, [...(members.get(root) ?? []), node.id])
    }
    return [...members.values()]
  }

  const groupsSnapshot = () => {
    const groups: Record<string, number> = {}
    for (const ids of membersByRoot()) {
      if (ids.length < 2) continue
      const group = Math.min(...ids.map((id) => order.get(id) as number))
      for (const id of ids) groups[id] = group
    }
    return groups
  }

  const isBetter = (a: GraphEdge, b: GraphEdge | undefined) =>
    b === undefined ||
    a.weight < b.weight ||
    (a.weight === b.weight &&
      (edgeOrder.get(a.id) as number) < (edgeOrder.get(b.id) as number))

  const recorder = new StepRecorder()
  let treeSize = 0
  let total = 0
  let round = 0

  recorder.record(
    'init',
    2,
    graph.nodes.length === 0
      ? 'The graph is empty - there is no tree to build.'
      : `Every node starts as its own component (${graph.nodes.length} in all).`,
    () => {},
  )

  for (;;) {
    // Each component's cheapest outgoing edge this round.
    const components = membersByRoot()
    const cheapest = new Map<string, GraphEdge>()
    for (const edge of graph.edges) {
      const a = find(edge.source)
      const b = find(edge.target)
      if (a === b) continue
      if (isBetter(edge, cheapest.get(a))) cheapest.set(a, edge)
      if (isBetter(edge, cheapest.get(b))) cheapest.set(b, edge)
    }
    if (cheapest.size === 0) break

    round++
    recorder.record(
      'init',
      3,
      `Round ${round}: ${components.length} component(s) each look for their cheapest outgoing edge.`,
      (s) => {
        s.currentEdgeId = null
        s.currentNodeId = null
      },
    )

    const picks: GraphEdge[] = []
    for (const members of components) {
      const root = find(members[0])
      const label = `{${members.map(labelOf).join(', ')}}`
      const pick = cheapest.get(root)
      if (!pick) {
        recorder.record(
          'skip-edge',
          4,
          `Component ${label} has no outgoing edge - nothing to pick.`,
          (s) => {
            s.currentEdgeId = null
            s.currentNodeId = members[0]
          },
        )
        continue
      }
      recorder.record(
        'examine-edge',
        4,
        `Component ${label} picks its cheapest outgoing edge ${labelOf(pick.source)} — ${labelOf(pick.target)} (weight ${pick.weight}).`,
        (s) => {
          s.currentEdgeId = pick.id
          s.currentNodeId = members[0]
        },
      )
      if (!picks.includes(pick)) picks.push(pick)
    }

    // Add every pick; two components choosing the same edge adds it once.
    for (const edge of picks) {
      const rootA = find(edge.source)
      const rootB = find(edge.target)
      if (rootA === rootB) {
        recorder.record(
          'skip-edge',
          5,
          `${labelOf(edge.source)} and ${labelOf(edge.target)} were already joined this round - skip.`,
          (s) => {
            s.currentEdgeId = edge.id
          },
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
          s.currentEdgeId = edge.id
          s.highlightedEdges = [...(s.highlightedEdges ?? []), edge.id]
          s.nodeGroups = groupsSnapshot()
        },
      )
    }
  }

  const remaining = graph.nodes.length - treeSize
  recorder.record(
    'done',
    6,
    graph.nodes.length === 0
      ? 'The graph is empty - there is no tree to build.'
      : remaining > 1
        ? `Done after ${round} round(s): a minimum spanning forest of ${treeSize} edge(s) across ${remaining} components, total weight ${total}.`
        : `Done after ${round} round(s): the minimum spanning tree has ${treeSize} edge(s), total weight ${total}.`,
    (s) => {
      s.currentEdgeId = null
      s.currentNodeId = null
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'boruvka',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

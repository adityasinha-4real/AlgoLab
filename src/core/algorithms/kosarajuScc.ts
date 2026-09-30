import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import type { AdjacencyList } from '../graph/adjacency'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

interface Frame {
  node: string
  next: number
}

/**
 * Iterative Kosaraju. Pass 1 is a DFS on the graph that records finish
 * order: `distances[n]` holds n's finish position and `frontier` the DFS
 * stack. Pass 2 runs DFS on the transposed graph in reverse finish order;
 * every tree it grows is one strongly connected component, given its own
 * `nodeGroups` index, and `visited` lists nodes once they are assigned.
 * During pass 2 `currentEdgeId` is the original edge, traversed backwards.
 */
export function runKosarajuScc(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => !e.directed)) {
    throw new Error(
      "Kosaraju's SCC requires a directed graph - every edge must be directed.",
    )
  }

  const startedAt = performance.now()
  const forward = buildAdjacencyList(graph)
  const transposed: AdjacencyList = new Map(graph.nodes.map((n) => [n.id, []]))
  for (const edge of graph.edges) {
    transposed.get(edge.target)?.push({ neighbor: edge.source, edge })
  }
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()

  const roots = graph.nodes.map((n) => n.id)
  if (graph.startNodeId && roots.includes(graph.startNodeId)) {
    roots.splice(roots.indexOf(graph.startNodeId), 1)
    roots.unshift(graph.startNodeId)
  }

  recorder.record(
    'init',
    2,
    graph.nodes.length === 0
      ? "Start Kosaraju's algorithm on an empty graph."
      : `Pass 1: depth-first search over the graph, noting when each node finishes${roots.length > 0 ? `, beginning at ${labelOf(roots[0])}` : ''}.`,
    () => {},
  )

  // ---- Pass 1: finish order on the original graph ----
  const seen = new Set<string>()
  const finishOrder: string[] = []

  for (const root of roots) {
    if (seen.has(root)) continue
    const calls: Frame[] = [{ node: root, next: 0 }]
    seen.add(root)
    recorder.record(
      'enqueue',
      2,
      `Discover ${labelOf(root)} and push it onto the DFS stack.`,
      (s) => {
        s.parents[root] = null
        s.frontier = calls.map((f) => f.node)
        s.currentNodeId = root
        s.currentEdgeId = null
      },
    )

    while (calls.length > 0) {
      const frame = calls[calls.length - 1]
      const u = frame.node
      const edges = forward.get(u) ?? []

      if (frame.next < edges.length) {
        const { neighbor: v, edge } = edges[frame.next++]
        recorder.record(
          'examine-edge',
          2,
          `Examine edge ${labelOf(u)} → ${labelOf(v)}.`,
          (s) => {
            s.currentNodeId = u
            s.currentEdgeId = edge.id
          },
        )
        if (seen.has(v)) {
          recorder.record(
            'skip-edge',
            2,
            `${labelOf(v)} was already discovered - do not revisit it.`,
            () => {},
          )
        } else {
          seen.add(v)
          calls.push({ node: v, next: 0 })
          recorder.record(
            'enqueue',
            2,
            `Discover ${labelOf(v)} from ${labelOf(u)} and push it onto the DFS stack.`,
            (s) => {
              s.parents[v] = u
              s.frontier = calls.map((f) => f.node)
              s.currentNodeId = v
            },
          )
        }
        continue
      }

      calls.pop()
      finishOrder.push(u)
      recorder.record(
        'dequeue',
        2,
        `${labelOf(u)} has no more unexplored edges: it finishes at position ${finishOrder.length}.`,
        (s) => {
          s.distances[u] = finishOrder.length
          s.frontier = calls.map((f) => f.node)
          s.currentNodeId = u
          s.currentEdgeId = null
        },
      )
    }
  }

  // ---- Transpose ----
  recorder.record(
    'init',
    3,
    graph.nodes.length === 0
      ? 'There is nothing to transpose.'
      : `Reverse every edge. Pass 2 will take nodes in reverse finish order: ${[
          ...finishOrder,
        ]
          .reverse()
          .map(labelOf)
          .join(', ')}.`,
    (s) => {
      s.parents = {}
      s.frontier = []
      s.currentNodeId = null
      s.currentEdgeId = null
    },
  )

  // ---- Pass 2: DFS on the transposed graph ----
  const assigned = new Map<string, number>()
  let componentCount = 0
  const components: string[][] = []

  for (const root of [...finishOrder].reverse()) {
    if (assigned.has(root)) {
      recorder.record(
        'skip-edge',
        4,
        `${labelOf(root)} already belongs to a component - skip it.`,
        (s) => {
          s.currentNodeId = root
          s.currentEdgeId = null
        },
      )
      continue
    }

    const group = componentCount++
    const members: string[] = []
    const calls: Frame[] = [{ node: root, next: 0 }]
    assigned.set(root, group)
    members.push(root)
    recorder.record(
      'enqueue',
      5,
      `${labelOf(root)} is unassigned: start component ${group + 1} with a DFS on the transposed graph.`,
      (s) => {
        s.parents[root] = null
        s.frontier = calls.map((f) => f.node)
        s.currentNodeId = root
        s.currentEdgeId = null
      },
    )

    while (calls.length > 0) {
      const frame = calls[calls.length - 1]
      const u = frame.node
      const edges = transposed.get(u) ?? []

      if (frame.next < edges.length) {
        const { neighbor: v, edge } = edges[frame.next++]
        recorder.record(
          'examine-edge',
          5,
          `Examine edge ${labelOf(u)} → ${labelOf(v)} (the reverse of the original ${labelOf(v)} → ${labelOf(u)}).`,
          (s) => {
            s.currentNodeId = u
            s.currentEdgeId = edge.id
          },
        )
        if (assigned.has(v)) {
          recorder.record(
            'skip-edge',
            5,
            assigned.get(v) === group
              ? `${labelOf(v)} is already in component ${group + 1}.`
              : `${labelOf(v)} belongs to an earlier component - the transposed edge cannot leave this one.`,
            () => {},
          )
        } else {
          assigned.set(v, group)
          members.push(v)
          calls.push({ node: v, next: 0 })
          recorder.record(
            'enqueue',
            6,
            `${labelOf(v)} is reachable in the transposed graph, so it joins component ${group + 1}.`,
            (s) => {
              s.parents[v] = u
              s.frontier = calls.map((f) => f.node)
              s.currentNodeId = v
            },
          )
        }
        continue
      }
      calls.pop()
    }

    components.push(members)
    recorder.record(
      'visit',
      6,
      `Component ${group + 1} is complete: {${members.map(labelOf).join(', ')}}.`,
      (s) => {
        s.visited.push(...members)
        s.frontier = []
        s.currentNodeId = root
        s.currentEdgeId = null
        s.nodeGroups = {
          ...s.nodeGroups,
          ...Object.fromEntries(members.map((id) => [id, group])),
        }
      },
    )
  }

  recorder.record(
    'done',
    7,
    graph.nodes.length === 0
      ? 'The graph is empty - there are no components.'
      : `Done: ${components.length} strongly connected component(s): ${components.map((c) => `{${c.map(labelOf).join(', ')}}`).join(', ')}.`,
    (s) => {
      s.currentNodeId = null
      s.currentEdgeId = null
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'kosaraju-scc',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

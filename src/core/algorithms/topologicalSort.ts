import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

/**
 * Kahn's algorithm. `visited` is the topological order as it is built, and
 * `distances[n]` is the position n was given in that order. If the queue
 * empties before every node is placed, the leftover nodes lie on or behind a
 * cycle: like Bellman-Ford's negative cycle this is recorded as a result step
 * (with the stuck nodes grouped for highlighting) rather than thrown.
 */
export function runTopologicalSort(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => !e.directed)) {
    throw new Error(
      'Topological Sort requires a directed graph - every edge must be directed.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const inDegree = new Map(graph.nodes.map((n) => [n.id, 0]))
  for (const edge of graph.edges) {
    inDegree.set(edge.target, (inDegree.get(edge.target) ?? 0) + 1)
  }

  const recorder = new StepRecorder()
  const queue = graph.nodes
    .filter((n) => inDegree.get(n.id) === 0)
    .map((n) => n.id)

  recorder.record(
    'init',
    2,
    `Count incoming edges for every node; enqueue the ${queue.length} node(s) with none${queue.length > 0 ? `: ${queue.map(labelOf).join(', ')}` : ''}.`,
    (s) => {
      s.frontier.push(...queue)
      for (const id of queue) s.parents[id] = null
    },
  )

  while (queue.length > 0) {
    const current = queue.shift() as string
    const position = recorder.getCurrentState().visited.length

    recorder.record(
      'dequeue',
      4,
      `Dequeue ${labelOf(current)} and place it at position ${position + 1} of the order.`,
      (s) => {
        s.frontier = s.frontier.filter((id) => id !== current)
        s.visited.push(current)
        s.distances[current] = position
        s.currentNodeId = current
        s.currentEdgeId = null
      },
    )

    for (const { neighbor, edge } of adjacency.get(current) ?? []) {
      recorder.record(
        'examine-edge',
        5,
        `Examine edge ${labelOf(current)} → ${labelOf(neighbor)}.`,
        (s) => {
          s.currentEdgeId = edge.id
        },
      )

      const remaining = (inDegree.get(neighbor) as number) - 1
      inDegree.set(neighbor, remaining)

      if (remaining === 0) {
        queue.push(neighbor)
        recorder.record(
          'enqueue',
          7,
          `Remove the edge: ${labelOf(neighbor)} has no incoming edges left; enqueue it.`,
          (s) => {
            s.frontier.push(neighbor)
            s.parents[neighbor] = current
          },
        )
      } else {
        recorder.record(
          'skip-edge',
          6,
          `Remove the edge: ${labelOf(neighbor)} still has ${remaining} incoming edge(s) - not ready yet.`,
          () => {},
        )
      }
    }
  }

  const order = recorder.getCurrentState().visited
  if (order.length === graph.nodes.length) {
    recorder.record(
      'done',
      8,
      order.length === 0
        ? 'The graph is empty - nothing to order.'
        : `Every node is placed. Topological order: ${order.map(labelOf).join(' → ')}.`,
      (s) => {
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  } else {
    const stuck = graph.nodes.filter((n) => !order.includes(n.id))
    recorder.record(
      'cycle-found',
      9,
      `Cycle detected: ${stuck.length} node(s) (${stuck.map((n) => n.label).join(', ')}) never reach in-degree 0, so no topological order exists.`,
      (s) => {
        s.currentNodeId = null
        s.currentEdgeId = null
        s.nodeGroups = Object.fromEntries(stuck.map((n) => [n.id, 1]))
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'topological-sort',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

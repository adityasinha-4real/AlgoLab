import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'
import { hasNegativeWeightEdge } from '../graph/validate'
import { buildEuclideanHeuristic } from './heuristics'
import { MinPriorityQueue } from './priorityQueue'

/**
 * Structurally identical to Dijkstra (same lazy-deletion priority queue,
 * same finalize-on-pop), except the queue is ordered by f(n) = g(n) + h(n)
 * instead of g(n) alone. See heuristics.ts for why the heuristic used here
 * stays admissible even though edge weights are arbitrary.
 */
export function runAStar(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('A* requires both a start and target node')
  }
  if (hasNegativeWeightEdge(graph)) {
    throw new Error(
      'A* does not support negative edge weights - use Bellman-Ford instead.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id
  const heuristic = buildEuclideanHeuristic(graph, target)

  const recorder = new StepRecorder()
  const finalized = new Set<string>()
  const pq = new MinPriorityQueue<string>()
  const startH = heuristic(start)
  pq.push(start, startH)
  let found = false

  recorder.record(
    'init',
    2,
    `Start A* at ${labelOf(start)}: g=0, h=${startH.toFixed(1)}, f=${startH.toFixed(1)}.`,
    (s) => {
      s.frontier.push(start)
      s.distances[start] = 0
      s.heuristics[start] = startH
      s.parents[start] = null
    },
  )

  const frontierSnapshot = (state: {
    distances: Record<string, number>
    heuristics: Record<string, number>
  }) =>
    Object.keys(state.distances)
      .filter((id) => !finalized.has(id))
      .sort(
        (a, b) =>
          state.distances[a] +
          (state.heuristics[a] ?? 0) -
          (state.distances[b] + (state.heuristics[b] ?? 0)),
      )

  while (!pq.isEmpty() && !found) {
    const current = pq.pop() as string
    if (finalized.has(current)) continue
    finalized.add(current)

    recorder.record(
      'dequeue',
      4,
      `Pop ${labelOf(current)} (f=${(recorder.getCurrentState().distances[current] + (recorder.getCurrentState().heuristics[current] ?? 0)).toFixed(1)}) - it is now finalized.`,
      (s) => {
        s.visited.push(current)
        s.frontier = frontierSnapshot(s)
        s.currentNodeId = current
        s.currentEdgeId = null
      },
    )

    if (current === target) {
      found = true
      break
    }

    for (const { neighbor, edge } of adjacency.get(current) ?? []) {
      if (finalized.has(neighbor)) continue

      recorder.record(
        'examine-edge',
        6,
        `Examine edge ${labelOf(current)} → ${labelOf(neighbor)} (weight ${edge.weight}).`,
        (s) => {
          s.currentEdgeId = edge.id
        },
      )

      const currentG = recorder.getCurrentState().distances[current]
      const tentativeG = currentG + edge.weight
      const knownG = recorder.getCurrentState().distances[neighbor]

      if (knownG === undefined || tentativeG < knownG) {
        const h = heuristic(neighbor)
        pq.push(neighbor, tentativeG + h)
        recorder.record(
          'relax',
          9,
          `Relax ${labelOf(neighbor)}: g=${tentativeG}, h=${h.toFixed(1)}, f=${(tentativeG + h).toFixed(1)} via ${labelOf(current)}.`,
          (s) => {
            s.distances[neighbor] = tentativeG
            s.heuristics[neighbor] = h
            s.parents[neighbor] = current
            s.frontier = frontierSnapshot(s)
          },
        )
      } else {
        recorder.record(
          'skip-edge',
          8,
          `${labelOf(neighbor)} already has a lower or equal g-value (${knownG}) - no improvement.`,
          () => {},
        )
      }
    }
  }

  if (found) {
    const path = reconstructPath(
      recorder.getCurrentState().parents,
      start,
      target,
    )
    recorder.record(
      'path-found',
      5,
      `Target ${labelOf(target)} finalized - path reconstructed.`,
      (s) => {
        s.path = path
      },
    )
  } else {
    recorder.record(
      'no-path',
      11,
      `Priority queue exhausted without reaching ${labelOf(target)} - no path exists.`,
      (s) => {
        s.path = null
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'astar',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

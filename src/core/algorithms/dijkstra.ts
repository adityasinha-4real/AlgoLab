import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'
import { hasNegativeWeightEdge } from '../graph/validate'
import { MinPriorityQueue } from './priorityQueue'

/**
 * Uses lazy deletion (see MinPriorityQueue): a node may be pushed multiple
 * times at different distances, and the first pop (necessarily the best,
 * since the heap is a min-heap) finalizes it; later pops of the same node
 * are silently skipped, matching DFS's duplicate-handling approach.
 */
export function runDijkstra(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('Dijkstra requires both a start and target node')
  }
  if (hasNegativeWeightEdge(graph)) {
    throw new Error(
      'Dijkstra does not support negative edge weights - use Bellman-Ford instead.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const finalized = new Set<string>()
  const pq = new MinPriorityQueue<string>()
  pq.push(start, 0)
  let found = false

  recorder.record(
    'init',
    2,
    `Start Dijkstra at ${labelOf(start)}: distance 0, push it into the priority queue.`,
    (s) => {
      s.frontier.push(start)
      s.distances[start] = 0
      s.parents[start] = null
    },
  )

  const frontierSnapshot = (state: { distances: Record<string, number> }) =>
    Object.keys(state.distances)
      .filter((id) => !finalized.has(id))
      .sort((a, b) => state.distances[a] - state.distances[b])

  while (!pq.isEmpty() && !found) {
    const current = pq.pop() as string
    if (finalized.has(current)) continue
    finalized.add(current)

    recorder.record(
      'dequeue',
      4,
      `Pop ${labelOf(current)} (distance ${recorder.getCurrentState().distances[current]}) - it is now finalized.`,
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

      const currentDist = recorder.getCurrentState().distances[current]
      const newDist = currentDist + edge.weight
      const known = recorder.getCurrentState().distances[neighbor]

      if (known === undefined || newDist < known) {
        pq.push(neighbor, newDist)
        recorder.record(
          'relax',
          9,
          `Relax ${labelOf(neighbor)}: distance ${known ?? '∞'} → ${newDist} via ${labelOf(current)}.`,
          (s) => {
            s.distances[neighbor] = newDist
            s.parents[neighbor] = current
            s.frontier = frontierSnapshot(s)
          },
        )
      } else {
        recorder.record(
          'skip-edge',
          8,
          `${labelOf(neighbor)} already has a shorter or equal distance (${known}) - no improvement.`,
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
      10,
      `Priority queue exhausted without reaching ${labelOf(target)} - no path exists.`,
      (s) => {
        s.path = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'dijkstra',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

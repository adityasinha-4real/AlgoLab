import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

/**
 * Dijkstra with the priority queue replaced by a deque: relaxing over a
 * weight-0 edge pushes the neighbor to the front (it is as close as the
 * current node), a weight-1 edge pushes it to the back. Like Dijkstra's lazy
 * deletion, a node may sit in the deque more than once; the first pop
 * finalizes it and later pops are silently skipped.
 */
export function runZeroOneBFS(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('0-1 BFS requires both a start and target node')
  }
  if (graph.edges.some((e) => e.weight !== 0 && e.weight !== 1)) {
    throw new Error(
      '0-1 BFS requires every edge weight to be exactly 0 or 1 - use Dijkstra for other weights.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const finalized = new Set<string>()
  const deque: string[] = [start]
  let found = false

  recorder.record(
    'init',
    2,
    `Start 0-1 BFS at ${labelOf(start)}: distance 0, put it in the deque.`,
    (s) => {
      s.frontier.push(start)
      s.distances[start] = 0
      s.parents[start] = null
    },
  )

  const frontierSnapshot = () => [
    ...new Set(deque.filter((id) => !finalized.has(id))),
  ]

  while (deque.length > 0 && !found) {
    const current = deque.shift() as string
    if (finalized.has(current)) continue
    finalized.add(current)

    recorder.record(
      'dequeue',
      4,
      `Pop ${labelOf(current)} (distance ${recorder.getCurrentState().distances[current]}) from the front of the deque - it is now finalized.`,
      (s) => {
        s.visited.push(current)
        s.frontier = frontierSnapshot()
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

      const newDist =
        recorder.getCurrentState().distances[current] + edge.weight
      const known = recorder.getCurrentState().distances[neighbor]

      if (known === undefined || newDist < known) {
        if (edge.weight === 0) deque.unshift(neighbor)
        else deque.push(neighbor)
        recorder.record(
          'relax',
          9,
          `Relax ${labelOf(neighbor)}: distance ${known ?? '∞'} → ${newDist} via ${labelOf(current)}; push it to the ${edge.weight === 0 ? 'front' : 'back'} of the deque.`,
          (s) => {
            s.distances[neighbor] = newDist
            s.parents[neighbor] = current
            s.frontier = frontierSnapshot()
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
      `Deque exhausted without reaching ${labelOf(target)} - no path exists.`,
      (s) => {
        s.path = null
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'zero-one-bfs',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

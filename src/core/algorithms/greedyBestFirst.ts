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
 * Like A*, but the priority queue is ordered by h(n) alone and the path cost
 * g(n) is ignored when choosing what to expand. A node is discovered (and its
 * parent fixed) the first time it is seen, so each node is pushed at most
 * once and the result is fast but not guaranteed to be shortest.
 */
export function runGreedyBestFirst(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error(
      'Greedy Best-First Search requires both a start and target node',
    )
  }
  if (hasNegativeWeightEdge(graph)) {
    throw new Error(
      'Greedy Best-First Search does not support negative edge weights - use Bellman-Ford instead.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id
  const heuristic = buildEuclideanHeuristic(graph, target)

  const recorder = new StepRecorder()
  const discovered = new Set<string>([start])
  const finalized = new Set<string>()
  const pq = new MinPriorityQueue<string>()
  const startH = heuristic(start)
  pq.push(start, startH)
  let found = false

  recorder.record(
    'init',
    2,
    `Start Greedy Best-First Search at ${labelOf(start)}: h=${startH.toFixed(1)}, push it into the priority queue.`,
    (s) => {
      s.frontier.push(start)
      s.distances[start] = 0
      s.heuristics[start] = startH
      s.parents[start] = null
    },
  )

  const frontierSnapshot = (state: { heuristics: Record<string, number> }) =>
    [...discovered]
      .filter((id) => !finalized.has(id))
      .sort((a, b) => state.heuristics[a] - state.heuristics[b])

  while (!pq.isEmpty() && !found) {
    const current = pq.pop() as string
    finalized.add(current)

    recorder.record(
      'dequeue',
      4,
      `Pop ${labelOf(current)} (h=${recorder.getCurrentState().heuristics[current].toFixed(1)}) - the closest-looking node - and mark it visited.`,
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
      recorder.record(
        'examine-edge',
        6,
        `Examine edge ${labelOf(current)} → ${labelOf(neighbor)} (weight ${edge.weight}).`,
        (s) => {
          s.currentEdgeId = edge.id
        },
      )

      if (discovered.has(neighbor)) {
        recorder.record(
          'skip-edge',
          7,
          `${labelOf(neighbor)} already discovered - skip.`,
          () => {},
        )
        continue
      }

      discovered.add(neighbor)
      const h = heuristic(neighbor)
      const g = recorder.getCurrentState().distances[current] + edge.weight
      pq.push(neighbor, h)
      recorder.record(
        'enqueue',
        8,
        `Discover ${labelOf(neighbor)}: h=${h.toFixed(1)}, cost so far ${g}; push it via ${labelOf(current)}.`,
        (s) => {
          s.distances[neighbor] = g
          s.heuristics[neighbor] = h
          s.parents[neighbor] = current
          s.frontier = frontierSnapshot(s)
        },
      )
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
      `Target ${labelOf(target)} reached - path reconstructed (not guaranteed shortest).`,
      (s) => {
        s.path = path
      },
    )
  } else {
    recorder.record(
      'no-path',
      9,
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
    algorithmId: 'greedy-best-first',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

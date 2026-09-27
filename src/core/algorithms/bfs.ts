import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

/**
 * BFS marks a node visited at dequeue time (not at discovery/enqueue time),
 * so `visited` always means "fully processed" as documented on
 * AlgorithmState - matching how the state inspector reads it.
 */
export function runBFS(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('BFS requires both a start and target node')
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const discovered = new Set<string>([start])
  const queue: string[] = [start]
  let found = false

  recorder.record(
    'init',
    2,
    `Start BFS at ${labelOf(start)}: enqueue it with distance 0.`,
    (s) => {
      s.frontier.push(start)
      s.distances[start] = 0
      s.parents[start] = null
    },
  )

  while (queue.length > 0 && !found) {
    const current = queue.shift() as string

    recorder.record(
      'dequeue',
      4,
      `Dequeue ${labelOf(current)} and mark it visited.`,
      (s) => {
        s.frontier = s.frontier.filter((id) => id !== current)
        s.visited.push(current)
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
        `Examine edge ${labelOf(current)} → ${labelOf(neighbor)}.`,
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
      const distance = (recorder.getCurrentState().distances[current] ?? 0) + 1
      queue.push(neighbor)

      recorder.record(
        'enqueue',
        8,
        `Discover ${labelOf(neighbor)} at distance ${distance}; enqueue it.`,
        (s) => {
          s.frontier.push(neighbor)
          s.distances[neighbor] = distance
          s.parents[neighbor] = current
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
      `Target ${labelOf(target)} reached - path reconstructed.`,
      (s) => {
        s.path = path
      },
    )
  } else {
    recorder.record(
      'no-path',
      9,
      `Queue exhausted without reaching ${labelOf(target)} - no path exists.`,
      (s) => {
        s.path = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bfs',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

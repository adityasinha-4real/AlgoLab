import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

/**
 * Iterative DFS with an explicit stack (no recursion, so every push/pop is a
 * recordable step). A node may be pushed more than once before it is first
 * popped; the already-visited check on pop silently skips those duplicates
 * without emitting a step, since nothing observable changes.
 */
export function runDFS(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('DFS requires both a start and target node')
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const visited = new Set<string>()
  const stack: string[] = [start]
  let found = false

  recorder.record(
    'init',
    2,
    `Start DFS at ${labelOf(start)}: push it onto the stack.`,
    (s) => {
      s.frontier.push(start)
      s.parents[start] = null
    },
  )

  while (stack.length > 0 && !found) {
    const current = stack.pop() as string
    if (visited.has(current)) continue
    visited.add(current)

    recorder.record(
      'dequeue',
      4,
      `Pop ${labelOf(current)} and mark it visited.`,
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

      if (visited.has(neighbor)) {
        recorder.record(
          'skip-edge',
          7,
          `${labelOf(neighbor)} already visited - skip.`,
          () => {},
        )
        continue
      }

      stack.push(neighbor)
      recorder.record(
        'enqueue',
        8,
        `Push ${labelOf(neighbor)} onto the stack.`,
        (s) => {
          s.frontier.push(neighbor)
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
      `Stack exhausted without reaching ${labelOf(target)} - no path exists.`,
      (s) => {
        s.path = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'dfs',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

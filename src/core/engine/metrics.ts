import type { ExecutionMetrics, ExecutionStep } from './types'

const EDGE_EXAMINATION_STEP_TYPES = new Set([
  'examine-edge',
  'relax',
  'skip-edge',
])

/** Derives summary metrics from a completed run's steps for the comparison view (M11). */
export function computeMetrics(
  steps: ExecutionStep[],
  executionTimeMs: number,
): ExecutionMetrics {
  const last = steps[steps.length - 1]
  const path = last?.state.path ?? null
  const pathEndDistance =
    path && path.length > 0
      ? (last.state.distances[path[path.length - 1]] ?? null)
      : null

  return {
    nodesVisited: last?.state.visited.length ?? 0,
    edgesExamined: steps.filter((s) => EDGE_EXAMINATION_STEP_TYPES.has(s.type))
      .length,
    steps: steps.length,
    pathLength: path ? path.length - 1 : null,
    pathCost: pathEndDistance,
    executionTimeMs,
  }
}

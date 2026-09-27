import { gridNeighbors } from '../grid/builders'
import { cellId, parseCellId, type Grid } from '../grid/types'
import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { MinPriorityQueue } from './priorityQueue'

function manhattan(a: string, b: string): number {
  const pa = parseCellId(a)
  const pb = parseCellId(b)
  return Math.abs(pa.row - pb.row) + Math.abs(pa.col - pb.col)
}

/**
 * Same lazy-deletion priority queue approach as the free-form-graph A* and
 * Dijkstra. Unlike the free-form-graph heuristic (heuristics.ts), the
 * Manhattan distance here is admissible unconditionally: every move costs
 * at least 1 (terrainCost >= 1) and covers exactly 1 row or column step, so
 * the Manhattan distance can never exceed the true remaining cost.
 */
export function runAStarGrid(grid: Grid): ExecutionResult {
  const start = grid.startId
  const target = grid.targetId
  if (!start || !target) {
    throw new Error('A* requires both a start and target cell')
  }

  const startedAt = performance.now()
  const recorder = new StepRecorder()
  const closed = new Set<string>()
  const pq = new MinPriorityQueue<string>()
  const startH = manhattan(start, target)
  pq.push(start, startH)
  let found = false

  recorder.record(
    'init',
    2,
    `Start at ${start}: g=0, h=${startH}, f=${startH}.`,
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
      .filter((id) => !closed.has(id))
      .sort(
        (a, b) =>
          state.distances[a] +
          (state.heuristics[a] ?? 0) -
          (state.distances[b] + (state.heuristics[b] ?? 0)),
      )

  while (!pq.isEmpty() && !found) {
    const current = pq.pop() as string
    if (closed.has(current)) continue
    closed.add(current)

    recorder.record(
      'dequeue',
      4,
      `Close ${current} (f=${recorder.getCurrentState().distances[current] + (recorder.getCurrentState().heuristics[current] ?? 0)}).`,
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

    const { row, col } = parseCellId(current)
    for (const neighborCell of gridNeighbors(grid, row, col)) {
      const neighbor = cellId(neighborCell.row, neighborCell.col)
      if (closed.has(neighbor)) continue

      recorder.record(
        'examine-edge',
        6,
        `Examine neighbor ${neighbor}.`,
        (s) => {
          s.currentEdgeId = `${current}->${neighbor}`
        },
      )

      const currentG = recorder.getCurrentState().distances[current]
      const tentativeG = currentG + neighborCell.terrainCost
      const knownG = recorder.getCurrentState().distances[neighbor]

      if (knownG === undefined || tentativeG < knownG) {
        const h = manhattan(neighbor, target)
        pq.push(neighbor, tentativeG + h)
        recorder.record(
          'relax',
          9,
          `Relax ${neighbor}: g=${tentativeG}, h=${h}, f=${tentativeG + h} via ${current}.`,
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
          `${neighbor} already has a lower or equal g-value (${knownG}).`,
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
      `Target ${target} reached - path reconstructed.`,
      (s) => {
        s.path = path
      },
    )
  } else {
    recorder.record(
      'no-path',
      11,
      `Priority queue exhausted without reaching ${target} - no path exists.`,
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

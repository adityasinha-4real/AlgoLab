import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import type { Graph, NodeId } from '../graph/types'

interface DirectedEdge {
  source: NodeId
  target: NodeId
  weight: number
  edgeId: string
}

/** Expands undirected edges into two directed entries so the relaxation
 * loop can treat every edge uniformly. An undirected negative-weight edge
 * becomes its own negative cycle this way (u->v->u), which is correct:
 * traversing it back and forth really does decrease cost without bound. */
function toDirectedEdges(graph: Graph): DirectedEdge[] {
  const edges: DirectedEdge[] = []
  for (const e of graph.edges) {
    edges.push({
      source: e.source,
      target: e.target,
      weight: e.weight,
      edgeId: e.id,
    })
    if (!e.directed) {
      edges.push({
        source: e.target,
        target: e.source,
        weight: e.weight,
        edgeId: e.id,
      })
    }
  }
  return edges
}

export function runBellmanFord(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('Bellman-Ford requires both a start and target node')
  }

  const startedAt = performance.now()
  const directedEdges = toDirectedEdges(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const passLimit = Math.max(0, graph.nodes.length - 1)

  recorder.record(
    'init',
    2,
    `Start Bellman-Ford at ${labelOf(start)}: distance 0.`,
    (s) => {
      s.distances[start] = 0
      s.parents[start] = null
      s.visited.push(start)
    },
  )

  let negativeCycle = false

  passLoop: for (let pass = 1; pass <= passLimit; pass++) {
    let relaxedThisPass = false

    recorder.record(
      'visit',
      3,
      `Begin relaxation pass ${pass} of ${passLimit}.`,
      (s) => {
        s.pass = pass
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )

    for (const { source: u, target: v, weight, edgeId } of directedEdges) {
      const distU = recorder.getCurrentState().distances[u]

      recorder.record(
        'examine-edge',
        4,
        `Examine edge ${labelOf(u)} → ${labelOf(v)} (weight ${weight}).`,
        (s) => {
          s.currentEdgeId = edgeId
        },
      )

      if (distU === undefined) {
        recorder.record(
          'skip-edge',
          5,
          `${labelOf(u)} not yet reachable - skip.`,
          () => {},
        )
        continue
      }

      const distV = recorder.getCurrentState().distances[v]
      const candidate = distU + weight

      if (distV === undefined || candidate < distV) {
        relaxedThisPass = true
        const firstReached = distV === undefined
        recorder.record(
          'relax',
          6,
          `Relax ${labelOf(v)}: distance ${distV ?? '∞'} → ${candidate} via ${labelOf(u)}.`,
          (s) => {
            s.distances[v] = candidate
            s.parents[v] = u
            if (firstReached) s.visited.push(v)
          },
        )
      } else {
        recorder.record(
          'skip-edge',
          5,
          `${labelOf(v)} already has a shorter or equal distance (${distV}) - no improvement.`,
          () => {},
        )
      }
    }

    if (!relaxedThisPass) break passLoop
  }

  for (const { source: u, target: v, weight, edgeId } of directedEdges) {
    const distU = recorder.getCurrentState().distances[u]

    recorder.record(
      'examine-edge',
      7,
      `Check edge ${labelOf(u)} → ${labelOf(v)} for further relaxation (weight ${weight}).`,
      (s) => {
        s.currentEdgeId = edgeId
        s.currentNodeId = null
      },
    )

    if (distU === undefined) {
      recorder.record(
        'skip-edge',
        8,
        `${labelOf(u)} not reachable - skip.`,
        () => {},
      )
      continue
    }

    const distV = recorder.getCurrentState().distances[v]
    if (distV === undefined || distU + weight < distV) {
      negativeCycle = true
      recorder.record(
        'negative-cycle',
        9,
        `Edge ${labelOf(u)} → ${labelOf(v)} can still be relaxed after ${passLimit} passes - negative-weight cycle detected.`,
        (s) => {
          s.path = null
        },
      )
      break
    }

    recorder.record(
      'skip-edge',
      8,
      `No further improvement via ${labelOf(u)} → ${labelOf(v)}.`,
      () => {},
    )
  }

  if (!negativeCycle) {
    const finalDistance = recorder.getCurrentState().distances[target]
    if (finalDistance !== undefined) {
      const path = reconstructPath(
        recorder.getCurrentState().parents,
        start,
        target,
      )
      recorder.record(
        'path-found',
        10,
        `Target ${labelOf(target)} reached - path reconstructed.`,
        (s) => {
          s.path = path
          s.currentEdgeId = null
        },
      )
    } else {
      recorder.record(
        'no-path',
        11,
        `${labelOf(target)} is unreachable from ${labelOf(start)} - no path exists.`,
        (s) => {
          s.path = null
          s.currentEdgeId = null
        },
      )
    }
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bellman-ford',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

import { computeMetrics } from '../engine/metrics'
import { reconstructPath } from '../engine/path'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList, type AdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

type Side = 'forward' | 'backward'

interface Meeting {
  forwardEnd: string
  backwardEnd: string
  total: number
}

/**
 * Runs one BFS from the start and one (over reversed edges) from the target,
 * always expanding the side with the smaller queue. Each side is expanded a
 * whole level at a time: when the two searches touch, the rest of that level
 * is still processed so the best (fewest-edges) meeting point wins. Edge
 * weights are ignored, as in BFS.
 *
 * Both searches share `parents`: forward nodes point back toward the start,
 * backward nodes point onward toward the target. A node only ever belongs to
 * one side, so the two chains never collide.
 */
export function runBidirectionalBFS(graph: Graph): ExecutionResult {
  const start = graph.startNodeId
  const target = graph.targetNodeId
  if (!start || !target) {
    throw new Error('Bidirectional BFS requires both a start and target node')
  }

  const startedAt = performance.now()
  const forwardAdjacency = buildAdjacencyList(graph)
  const backwardAdjacency: AdjacencyList = new Map()
  for (const node of graph.nodes) backwardAdjacency.set(node.id, [])
  for (const edge of graph.edges) {
    backwardAdjacency.get(edge.target)?.push({ neighbor: edge.source, edge })
    if (!edge.directed) {
      backwardAdjacency.get(edge.source)?.push({ neighbor: edge.target, edge })
    }
  }
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const adjacencyOf: Record<Side, AdjacencyList> = {
    forward: forwardAdjacency,
    backward: backwardAdjacency,
  }
  const distanceOf: Record<Side, Map<string, number>> = {
    forward: new Map([[start, 0]]),
    backward: new Map([[target, 0]]),
  }
  const queueOf: Record<Side, string[]> = {
    forward: [start],
    backward: [target],
  }
  let meeting: Meeting | null = null

  recorder.record(
    'init',
    2,
    start === target
      ? `Start and target are both ${labelOf(start)}.`
      : `Start Bidirectional BFS: enqueue ${labelOf(start)} on the forward side and ${labelOf(target)} on the backward side.`,
    (s) => {
      s.frontier.push(start)
      if (target !== start) s.frontier.push(target)
      s.distances[start] = 0
      s.distances[target] = 0
      s.parents[start] = null
      s.parents[target] = null
    },
  )

  if (start === target) {
    meeting = { forwardEnd: start, backwardEnd: target, total: 0 }
  }

  while (
    !meeting &&
    queueOf.forward.length > 0 &&
    queueOf.backward.length > 0
  ) {
    const side: Side =
      queueOf.forward.length <= queueOf.backward.length ? 'forward' : 'backward'
    const other: Side = side === 'forward' ? 'backward' : 'forward'
    let best: Meeting | null = null

    for (let remaining = queueOf[side].length; remaining > 0; remaining--) {
      const current = queueOf[side].shift() as string

      recorder.record(
        'dequeue',
        5,
        `Dequeue ${labelOf(current)} from the ${side} side and mark it visited.`,
        (s) => {
          s.frontier = s.frontier.filter((id) => id !== current)
          s.visited.push(current)
          s.currentNodeId = current
          s.currentEdgeId = null
        },
      )

      for (const { neighbor, edge } of adjacencyOf[side].get(current) ?? []) {
        recorder.record(
          'examine-edge',
          6,
          `Examine edge ${labelOf(current)} ${side === 'forward' ? '→' : '←'} ${labelOf(neighbor)} on the ${side} side.`,
          (s) => {
            s.currentEdgeId = edge.id
          },
        )

        const otherDistance = distanceOf[other].get(neighbor)
        if (otherDistance !== undefined) {
          const ownDistance = distanceOf[side].get(current) as number
          const candidate: Meeting =
            side === 'forward'
              ? {
                  forwardEnd: current,
                  backwardEnd: neighbor,
                  total: ownDistance + 1 + otherDistance,
                }
              : {
                  forwardEnd: neighbor,
                  backwardEnd: current,
                  total: otherDistance + 1 + ownDistance,
                }
          if (!best || candidate.total < best.total) best = candidate
          recorder.record(
            'visit',
            7,
            `The searches meet: ${labelOf(neighbor)} was already discovered from the ${other} side (route length ${candidate.total}).`,
            () => {},
          )
        } else if (distanceOf[side].has(neighbor)) {
          recorder.record(
            'skip-edge',
            8,
            `${labelOf(neighbor)} already discovered from the ${side} side - skip.`,
            () => {},
          )
        } else {
          const distance = (distanceOf[side].get(current) as number) + 1
          distanceOf[side].set(neighbor, distance)
          queueOf[side].push(neighbor)
          recorder.record(
            'enqueue',
            8,
            `Discover ${labelOf(neighbor)} at distance ${distance} from the ${side} end; enqueue it.`,
            (s) => {
              s.frontier.push(neighbor)
              s.distances[neighbor] = distance
              s.parents[neighbor] = current
            },
          )
        }
      }
    }

    meeting = best
  }

  if (meeting) {
    const { forwardEnd, backwardEnd } = meeting
    const parents = recorder.getCurrentState().parents
    const path =
      start === target
        ? [start]
        : [...reconstructPath(parents, start, forwardEnd)]
    if (start !== target) {
      let cursor: string | null = backwardEnd
      while (cursor !== null) {
        path.push(cursor)
        cursor = parents[cursor] ?? null
      }
    }
    recorder.record(
      'path-found',
      9,
      `Both halves joined between ${labelOf(forwardEnd)} and ${labelOf(backwardEnd)} - path of ${path.length - 1} edge(s) reconstructed.`,
      (s) => {
        path.forEach((id, i) => {
          s.distances[id] = i
        })
        s.path = path
        s.currentEdgeId = null
      },
    )
  } else {
    recorder.record(
      'no-path',
      10,
      `One side ran out of nodes before the searches met - no path from ${labelOf(start)} to ${labelOf(target)}.`,
      (s) => {
        s.path = null
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bidirectional-bfs',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

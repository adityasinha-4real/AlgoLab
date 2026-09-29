import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

interface Frame {
  node: string
  next: number
  parentEdge: string | null
}

/**
 * Three-color DFS that works on directed, undirected and mixed graphs: a
 * node is gray while it is on the current DFS path, and reaching a gray node
 * along any edge other than the one just used to arrive closes a cycle.
 * Directed edges are followed only forward, undirected edges both ways. The
 * search stops at the first cycle, highlighting its edges
 * (`highlightedEdges`) and nodes (`nodeGroups`). `frontier` is the current
 * DFS path, `visited` the finished (black) nodes.
 */
export function runCycleDetection(graph: Graph): ExecutionResult {
  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const gray = new Set<string>()
  const black = new Set<string>()
  const treeEdgeOf = new Map<string, string>()
  const path: string[] = []
  let cycleFound = false

  const roots = graph.nodes.map((n) => n.id)
  if (graph.startNodeId && roots.includes(graph.startNodeId)) {
    roots.splice(roots.indexOf(graph.startNodeId), 1)
    roots.unshift(graph.startNodeId)
  }

  recorder.record(
    'init',
    2,
    `Start the depth-first search${roots.length > 0 ? ` at ${labelOf(roots[0])}` : ''}: nodes on the current path are gray, finished nodes black.`,
    () => {},
  )

  const discover = (node: string, from: string | null) => {
    gray.add(node)
    path.push(node)
    recorder.record(
      'enqueue',
      4,
      `Enter ${labelOf(node)} and color it gray.`,
      (s) => {
        s.parents[node] = from
        s.frontier = [...path]
        s.currentNodeId = node
        s.currentEdgeId = null
      },
    )
  }

  for (const root of roots) {
    if (cycleFound) break
    if (gray.has(root) || black.has(root)) continue
    const calls: Frame[] = []
    discover(root, null)
    calls.push({ node: root, next: 0, parentEdge: null })

    while (calls.length > 0 && !cycleFound) {
      const frame = calls[calls.length - 1]
      const u = frame.node
      // An undirected self-loop appears twice in the adjacency list.
      const edges = (adjacency.get(u) ?? []).filter(
        (entry, i, all) =>
          all.findIndex((other) => other.edge.id === entry.edge.id) === i,
      )

      if (frame.next < edges.length) {
        const { neighbor: v, edge } = edges[frame.next++]
        recorder.record(
          'examine-edge',
          5,
          `Examine edge ${labelOf(u)} ${edge.directed ? '→' : '—'} ${labelOf(v)}.`,
          (s) => {
            s.currentNodeId = u
            s.currentEdgeId = edge.id
          },
        )

        if (edge.id === frame.parentEdge) {
          recorder.record(
            'skip-edge',
            5,
            `This is the edge ${labelOf(u)} was reached by - going back along it is not a cycle.`,
            () => {},
          )
        } else if (gray.has(v)) {
          cycleFound = true
          const members = path.slice(path.indexOf(v))
          const cycleEdges = [
            ...members.slice(1).map((id) => treeEdgeOf.get(id) as string),
            edge.id,
          ]
          recorder.record(
            'cycle-found',
            6,
            `${labelOf(v)} is gray - it is on the current path, so the edge closes a cycle: ${[...members, v].map(labelOf).join(edge.directed ? ' → ' : ' — ')}.`,
            (s) => {
              s.currentNodeId = u
              s.currentEdgeId = edge.id
              s.highlightedEdges = cycleEdges
              s.nodeGroups = Object.fromEntries(members.map((id) => [id, 1]))
            },
          )
        } else if (black.has(v)) {
          recorder.record(
            'skip-edge',
            7,
            `${labelOf(v)} is already finished (black) - no cycle through it.`,
            () => {},
          )
        } else {
          treeEdgeOf.set(v, edge.id)
          discover(v, u)
          calls.push({ node: v, next: 0, parentEdge: edge.id })
        }
        continue
      }

      calls.pop()
      path.pop()
      gray.delete(u)
      black.add(u)
      recorder.record(
        'dequeue',
        8,
        `Finish ${labelOf(u)}: no cycle found below it; color it black.`,
        (s) => {
          s.visited.push(u)
          s.frontier = [...path]
          s.currentNodeId = u
          s.currentEdgeId = null
        },
      )
    }
  }

  if (!cycleFound) {
    recorder.record(
      'done',
      9,
      graph.nodes.length === 0
        ? 'The graph is empty - there is no cycle.'
        : 'Every node finished without closing a cycle: the graph is acyclic.',
      (s) => {
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'cycle-detection',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

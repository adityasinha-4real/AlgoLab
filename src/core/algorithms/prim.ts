import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph, GraphEdge } from '../graph/types'
import { MinPriorityQueue } from './priorityQueue'

interface Candidate {
  from: string
  to: string
  edge: GraphEdge
}

/**
 * Grows the tree from the start node (or the first node if none is set) by
 * always taking the cheapest edge that leaves it. `distances[n]` is the
 * weight of the tree edge that attached n, and `highlightedEdges` holds the
 * MST edges chosen so far. Edges are pushed lazily and stale ones (whose far
 * end has since joined the tree) are skipped on pop, as with Dijkstra. If the
 * graph is disconnected, growth restarts from the next unreached node and the
 * result is a minimum spanning forest.
 */
export function runPrim(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => e.directed)) {
    throw new Error(
      "Prim's MST requires an undirected graph - every edge must be undirected.",
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const inTree = new Set<string>()
  const pendingEnds = new Map<string, number>()
  const pq = new MinPriorityQueue<Candidate>()
  const treeEdges: GraphEdge[] = []
  let components = 0

  const frontierSnapshot = () =>
    [...pendingEnds]
      .filter(([id, count]) => count > 0 && !inTree.has(id))
      .map(([id]) => id)

  const startId =
    graph.startNodeId && graph.nodes.some((n) => n.id === graph.startNodeId)
      ? graph.startNodeId
      : graph.nodes[0]?.id

  const growFrom = (root: string, first: boolean) => {
    components++
    inTree.add(root)
    recorder.record(
      first ? 'init' : 'visit',
      2,
      first
        ? `Start Prim's algorithm at ${labelOf(root)}: it is the whole tree so far.`
        : `The graph is disconnected: start a new tree at ${labelOf(root)}.`,
      (s) => {
        s.visited.push(root)
        s.distances[root] = 0
        s.parents[root] = null
        s.currentNodeId = root
        s.currentEdgeId = null
        s.frontier = frontierSnapshot()
      },
    )
    pushEdgesOf(root)
  }

  const pushEdgesOf = (node: string) => {
    for (const { neighbor, edge } of adjacency.get(node) ?? []) {
      if (inTree.has(neighbor)) continue
      pq.push({ from: node, to: neighbor, edge }, edge.weight)
      pendingEnds.set(neighbor, (pendingEnds.get(neighbor) ?? 0) + 1)
      recorder.record(
        'enqueue',
        7,
        `Push edge ${labelOf(node)} — ${labelOf(neighbor)} (weight ${edge.weight}) into the priority queue.`,
        (s) => {
          s.currentEdgeId = edge.id
          s.frontier = frontierSnapshot()
        },
      )
    }
  }

  if (startId) {
    growFrom(startId, true)
    for (;;) {
      while (!pq.isEmpty()) {
        const { from, to, edge } = pq.pop() as Candidate
        pendingEnds.set(to, (pendingEnds.get(to) ?? 1) - 1)

        recorder.record(
          'dequeue',
          4,
          `Pop the cheapest edge ${labelOf(from)} — ${labelOf(to)} (weight ${edge.weight}).`,
          (s) => {
            s.currentEdgeId = edge.id
            s.frontier = frontierSnapshot()
          },
        )

        if (inTree.has(to)) {
          recorder.record(
            'skip-edge',
            5,
            `${labelOf(to)} is already in the tree - this edge would form a cycle.`,
            () => {},
          )
          continue
        }

        inTree.add(to)
        treeEdges.push(edge)
        recorder.record(
          'visit',
          6,
          `Add edge ${labelOf(from)} — ${labelOf(to)} (weight ${edge.weight}) to the MST; ${labelOf(to)} joins the tree.`,
          (s) => {
            s.visited.push(to)
            s.distances[to] = edge.weight
            s.parents[to] = from
            s.currentNodeId = to
            s.currentEdgeId = edge.id
            s.highlightedEdges = [...(s.highlightedEdges ?? []), edge.id]
            s.frontier = frontierSnapshot()
          },
        )
        pushEdgesOf(to)
      }

      const next = graph.nodes.find((n) => !inTree.has(n.id))
      if (!next) break
      growFrom(next.id, false)
    }
  }

  const total = treeEdges.reduce((sum, e) => sum + e.weight, 0)
  recorder.record(
    'done',
    8,
    graph.nodes.length === 0
      ? 'The graph is empty - there is no tree to build.'
      : components > 1
        ? `Done: a minimum spanning forest of ${treeEdges.length} edge(s) across ${components} components, total weight ${total}.`
        : `Done: the minimum spanning tree has ${treeEdges.length} edge(s), total weight ${total}.`,
    (s) => {
      s.currentNodeId = null
      s.currentEdgeId = null
      s.frontier = []
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'prim',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

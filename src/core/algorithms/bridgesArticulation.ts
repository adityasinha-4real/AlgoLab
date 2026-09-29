import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

interface Frame {
  node: string
  next: number
  parentEdge: string | null
  children: number
}

/**
 * Discovery-index / low-link DFS on an undirected graph, iterative so each
 * step is recordable. Bridges accumulate in `highlightedEdges`; articulation
 * points are flagged with `nodeGroups` group 1. `distances[n]` is n's
 * discovery index, `frontier` the DFS call stack, `parents` the DFS tree, and
 * `visited` the nodes whose subtree is finished. The tree edge is skipped by
 * edge id rather than by parent node, so parallel edges correctly make each
 * other non-bridges.
 */
export function runBridgesArticulation(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => e.directed)) {
    throw new Error(
      'Bridges and Articulation Points require an undirected graph - every edge must be undirected.',
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const disc = new Map<string, number>()
  const low = new Map<string, number>()
  const treeEdgeOf = new Map<string, string>()
  const bridges: string[] = []
  const cutVertices: string[] = []

  const roots = graph.nodes.map((n) => n.id)
  if (graph.startNodeId && roots.includes(graph.startNodeId)) {
    roots.splice(roots.indexOf(graph.startNodeId), 1)
    roots.unshift(graph.startNodeId)
  }

  recorder.record(
    'init',
    2,
    `Start the depth-first search${roots.length > 0 ? ` at ${labelOf(roots[0])}` : ''}: it tracks each node's discovery index and low-link to find bridges and articulation points.`,
    () => {},
  )

  const markCutVertex = (node: string, why: string) => {
    if (cutVertices.includes(node)) return
    cutVertices.push(node)
    recorder.record(
      'visit',
      why === 'root' ? 10 : 9,
      why === 'root'
        ? `${labelOf(node)} is the root with more than one DFS child, so removing it disconnects the graph: articulation point.`
        : `No node below ${labelOf(node)} can reach above it (low-link ≥ index): ${labelOf(node)} is an articulation point.`,
      (s) => {
        s.currentNodeId = node
        s.nodeGroups = { ...s.nodeGroups, [node]: 1 }
      },
    )
  }

  const stack: string[] = []
  const discover = (node: string, from: string | null) => {
    const order = disc.size
    disc.set(node, order)
    low.set(node, order)
    stack.push(node)
    recorder.record(
      'enqueue',
      4,
      `Discover ${labelOf(node)}: index ${order}, low-link ${order}.`,
      (s) => {
        s.distances[node] = order
        s.parents[node] = from
        s.frontier = [...stack]
        s.currentNodeId = node
        s.currentEdgeId = null
      },
    )
  }

  for (const root of roots) {
    if (disc.has(root)) continue
    const calls: Frame[] = []
    discover(root, null)
    calls.push({ node: root, next: 0, parentEdge: null, children: 0 })

    while (calls.length > 0) {
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
          `Examine edge ${labelOf(u)} — ${labelOf(v)}.`,
          (s) => {
            s.currentNodeId = u
            s.currentEdgeId = edge.id
          },
        )

        if (edge.id === frame.parentEdge) {
          recorder.record(
            'skip-edge',
            5,
            `This is the edge ${labelOf(u)} was reached by - do not treat it as a back edge.`,
            () => {},
          )
        } else if (!disc.has(v)) {
          treeEdgeOf.set(v, edge.id)
          frame.children++
          discover(v, u)
          calls.push({
            node: v,
            next: 0,
            parentEdge: edge.id,
            children: 0,
          })
        } else {
          const candidate = disc.get(v) as number
          if (candidate < (low.get(u) as number)) {
            low.set(u, candidate)
            recorder.record(
              'relax',
              7,
              `${labelOf(v)} was discovered earlier (index ${candidate}): back edge, low-link of ${labelOf(u)} drops to ${candidate}.`,
              () => {},
            )
          } else {
            recorder.record(
              'skip-edge',
              7,
              `${labelOf(v)} does not lower the low-link of ${labelOf(u)} (${low.get(u)}).`,
              () => {},
            )
          }
        }
        continue
      }

      calls.pop()
      stack.pop()
      recorder.record(
        'dequeue',
        3,
        `Finish ${labelOf(u)}: every edge explored; pop it off the stack.`,
        (s) => {
          s.visited.push(u)
          s.frontier = [...stack]
          s.currentNodeId = u
          s.currentEdgeId = null
        },
      )

      const parentFrame = calls[calls.length - 1]
      if (parentFrame) {
        const p = parentFrame.node
        const childLow = low.get(u) as number
        if (childLow < (low.get(p) as number)) {
          low.set(p, childLow)
          recorder.record(
            'relax',
            6,
            `Back at ${labelOf(p)}: low-link drops to ${childLow} from child ${labelOf(u)}.`,
            (s) => {
              s.currentNodeId = p
            },
          )
        }

        if (childLow > (disc.get(p) as number)) {
          const bridgeId = treeEdgeOf.get(u) as string
          bridges.push(bridgeId)
          recorder.record(
            'visit',
            8,
            `${labelOf(u)}'s subtree cannot reach ${labelOf(p)} or above except through edge ${labelOf(p)} — ${labelOf(u)} (low-link ${childLow} > index ${disc.get(p)}): it is a bridge.`,
            (s) => {
              s.currentNodeId = p
              s.currentEdgeId = bridgeId
              s.highlightedEdges = [...(s.highlightedEdges ?? []), bridgeId]
            },
          )
        }

        if (
          parentFrame.parentEdge !== null &&
          childLow >= (disc.get(p) as number)
        ) {
          markCutVertex(p, 'inner')
        }
      } else if (frame.children > 1) {
        markCutVertex(u, 'root')
      }
    }
  }

  const labelList = (ids: string[]) =>
    ids.length === 0 ? 'none' : ids.map(labelOf).join(', ')
  const bridgeLabels = bridges.map((id) => {
    const edge = graph.edges.find((e) => e.id === id)
    return edge ? `${labelOf(edge.source)}—${labelOf(edge.target)}` : id
  })
  recorder.record(
    'done',
    11,
    graph.nodes.length === 0
      ? 'The graph is empty - nothing to analyze.'
      : `Done: ${bridges.length} bridge(s) (${bridgeLabels.length === 0 ? 'none' : bridgeLabels.join(', ')}) and ${cutVertices.length} articulation point(s) (${labelList(cutVertices)}).`,
    (s) => {
      s.currentNodeId = null
      s.currentEdgeId = null
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bridges-articulation',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

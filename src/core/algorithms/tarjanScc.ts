import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import { buildAdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

interface Frame {
  node: string
  next: number
}

/**
 * Iterative Tarjan (explicit call stack, so every discovery, edge and
 * component is a recordable step). `distances[n]` holds n's discovery index,
 * `frontier` is Tarjan's node stack, `parents` the DFS tree, and `visited`
 * lists nodes once their component is complete. Low-link values live in the
 * explanations. Each finished component gets its own `nodeGroups` index.
 */
export function runTarjanScc(graph: Graph): ExecutionResult {
  if (graph.edges.some((e) => !e.directed)) {
    throw new Error(
      "Tarjan's SCC requires a directed graph - every edge must be directed.",
    )
  }

  const startedAt = performance.now()
  const adjacency = buildAdjacencyList(graph)
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const recorder = new StepRecorder()
  const index = new Map<string, number>()
  const low = new Map<string, number>()
  const onStack = new Set<string>()
  const stack: string[] = []
  const components: string[][] = []

  const roots = [...graph.nodes.map((n) => n.id)]
  if (graph.startNodeId && roots.includes(graph.startNodeId)) {
    roots.splice(roots.indexOf(graph.startNodeId), 1)
    roots.unshift(graph.startNodeId)
  }

  recorder.record(
    'init',
    2,
    `Start Tarjan's algorithm: one depth-first pass finds every strongly connected component${roots.length > 0 ? `, beginning at ${labelOf(roots[0])}` : ''}.`,
    () => {},
  )

  const discover = (node: string, from: string | null) => {
    const order = index.size
    index.set(node, order)
    low.set(node, order)
    stack.push(node)
    onStack.add(node)
    recorder.record(
      'enqueue',
      4,
      `Discover ${labelOf(node)}: index ${order}, low-link ${order}; push it onto the stack.`,
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
    if (index.has(root)) continue
    const calls: Frame[] = []
    discover(root, null)
    calls.push({ node: root, next: 0 })

    while (calls.length > 0) {
      const frame = calls[calls.length - 1]
      const u = frame.node
      const edges = adjacency.get(u) ?? []

      if (frame.next < edges.length) {
        const { neighbor: v, edge } = edges[frame.next++]
        recorder.record(
          'examine-edge',
          5,
          `Examine edge ${labelOf(u)} → ${labelOf(v)}.`,
          (s) => {
            s.currentNodeId = u
            s.currentEdgeId = edge.id
          },
        )

        if (!index.has(v)) {
          discover(v, u)
          calls.push({ node: v, next: 0 })
        } else if (onStack.has(v)) {
          const candidate = index.get(v) as number
          if (candidate < (low.get(u) as number)) {
            low.set(u, candidate)
            recorder.record(
              'relax',
              7,
              `${labelOf(v)} is still on the stack: low-link of ${labelOf(u)} drops to ${candidate}.`,
              () => {},
            )
          } else {
            recorder.record(
              'skip-edge',
              7,
              `${labelOf(v)} is on the stack but does not lower the low-link of ${labelOf(u)} (${low.get(u)}).`,
              () => {},
            )
          }
        } else {
          recorder.record(
            'skip-edge',
            7,
            `${labelOf(v)} already belongs to a finished component - ignore this edge.`,
            () => {},
          )
        }
        continue
      }

      if (low.get(u) === index.get(u)) {
        const members: string[] = []
        let popped: string
        do {
          popped = stack.pop() as string
          onStack.delete(popped)
          members.push(popped)
        } while (popped !== u)
        const group = components.length
        components.push(members)
        recorder.record(
          'dequeue',
          8,
          `${labelOf(u)} is a component root (low-link ${low.get(u)} = index ${index.get(u)}): pop the stack down to it. Component ${group + 1} = {${members.map(labelOf).join(', ')}}.`,
          (s) => {
            s.visited.push(...members)
            s.frontier = [...stack]
            s.currentNodeId = u
            s.currentEdgeId = null
            s.nodeGroups = {
              ...s.nodeGroups,
              ...Object.fromEntries(members.map((id) => [id, group])),
            }
          },
        )
      }

      calls.pop()
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
      }
    }
  }

  recorder.record(
    'done',
    9,
    graph.nodes.length === 0
      ? 'The graph is empty - there are no components.'
      : `Done: ${components.length} strongly connected component(s): ${components.map((c) => `{${c.map(labelOf).join(', ')}}`).join(', ')}.`,
    (s) => {
      s.currentNodeId = null
      s.currentEdgeId = null
    },
  )

  const steps = recorder.getSteps()
  return {
    algorithmId: 'tarjan-scc',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

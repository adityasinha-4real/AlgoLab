import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { ExecutionResult } from '../engine/types'
import type { AdjacencyList } from '../graph/adjacency'
import type { Graph } from '../graph/types'

/**
 * BFS 2-coloring. Bipartiteness is a property of the underlying undirected
 * graph, so edge direction is ignored. The two colors are `nodeGroups` 0 and
 * 1, `distances[n]` is n's BFS depth in its component, and `parents` the BFS
 * tree. A same-colored pair joined by an edge proves an odd cycle; it is
 * rebuilt from the two tree paths to their lowest common ancestor and
 * highlighted through `highlightedEdges`.
 */
export function runBipartiteCheck(graph: Graph): ExecutionResult {
  const startedAt = performance.now()
  const labelById = new Map(graph.nodes.map((n) => [n.id, n.label]))
  const labelOf = (id: string) => labelById.get(id) ?? id

  const neighbors: AdjacencyList = new Map()
  for (const node of graph.nodes) neighbors.set(node.id, [])
  for (const edge of graph.edges) {
    neighbors.get(edge.source)?.push({ neighbor: edge.target, edge })
    if (edge.source !== edge.target) {
      neighbors.get(edge.target)?.push({ neighbor: edge.source, edge })
    }
  }

  const recorder = new StepRecorder()
  const color = new Map<string, number>()
  const treeEdgeOf = new Map<string, string>()
  const queue: string[] = []
  let conflict = false

  const roots = graph.nodes.map((n) => n.id)
  if (graph.startNodeId && roots.includes(graph.startNodeId)) {
    roots.splice(roots.indexOf(graph.startNodeId), 1)
    roots.unshift(graph.startNodeId)
  }

  const chainToRoot = (id: string): string[] => {
    const chain = [id]
    let cursor = recorder.getCurrentState().parents[id] ?? null
    while (cursor !== null) {
      chain.push(cursor)
      cursor = recorder.getCurrentState().parents[cursor] ?? null
    }
    return chain
  }

  const colorRoot = (root: string, first: boolean) => {
    color.set(root, 0)
    queue.push(root)
    recorder.record(
      first ? 'init' : 'visit',
      2,
      first
        ? `Start at ${labelOf(root)}: give it color 0 and enqueue it.`
        : `Start a new component at ${labelOf(root)}: give it color 0 and enqueue it.`,
      (s) => {
        s.frontier.push(root)
        s.distances[root] = 0
        s.parents[root] = null
        s.nodeGroups = { ...s.nodeGroups, [root]: 0 }
        s.currentNodeId = root
        s.currentEdgeId = null
      },
    )
  }

  for (const root of roots) {
    if (conflict) break
    if (color.has(root)) continue
    colorRoot(root, color.size === 0)

    while (queue.length > 0 && !conflict) {
      const current = queue.shift() as string
      const currentColor = color.get(current) as number

      recorder.record(
        'dequeue',
        4,
        `Dequeue ${labelOf(current)} (color ${currentColor}) and mark it visited.`,
        (s) => {
          s.frontier = s.frontier.filter((id) => id !== current)
          s.visited.push(current)
          s.currentNodeId = current
          s.currentEdgeId = null
        },
      )

      for (const { neighbor, edge } of neighbors.get(current) ?? []) {
        if (conflict) break
        recorder.record(
          'examine-edge',
          5,
          `Examine edge ${labelOf(current)} — ${labelOf(neighbor)}.`,
          (s) => {
            s.currentEdgeId = edge.id
          },
        )

        const neighborColor = color.get(neighbor)
        if (neighborColor === undefined) {
          const assigned = 1 - currentColor
          color.set(neighbor, assigned)
          treeEdgeOf.set(neighbor, edge.id)
          queue.push(neighbor)
          recorder.record(
            'enqueue',
            6,
            `${labelOf(neighbor)} is uncolored: give it color ${assigned}, the opposite of ${labelOf(current)}, and enqueue it.`,
            (s) => {
              s.frontier.push(neighbor)
              s.distances[neighbor] = (s.distances[current] ?? 0) + 1
              s.parents[neighbor] = current
              s.nodeGroups = { ...s.nodeGroups, [neighbor]: assigned }
            },
          )
        } else if (neighborColor === currentColor) {
          conflict = true
          const up = chainToRoot(current)
          const down = chainToRoot(neighbor)
          const meet = up.find((id) => down.includes(id)) as string
          const upPart = up.slice(0, up.indexOf(meet))
          const downPart = down.slice(0, down.indexOf(meet))
          const cycleNodes = [...upPart, meet, ...downPart.reverse()]
          const cycleEdges = [
            ...[...upPart, ...downPart].map(
              (id) => treeEdgeOf.get(id) as string,
            ),
            edge.id,
          ]
          recorder.record(
            'cycle-found',
            7,
            `${labelOf(current)} and ${labelOf(neighbor)} are joined by an edge but share color ${currentColor}: not bipartite. Odd cycle of length ${cycleNodes.length}: ${[...cycleNodes, cycleNodes[0]].map(labelOf).join(' — ')}.`,
            (s) => {
              s.currentEdgeId = edge.id
              s.highlightedEdges = cycleEdges
            },
          )
        } else {
          recorder.record(
            'skip-edge',
            7,
            `${labelOf(neighbor)} already has the opposite color - consistent, nothing to do.`,
            () => {},
          )
        }
      }
    }
  }

  if (!conflict) {
    const sets = [0, 1].map((c) =>
      graph.nodes.filter((n) => color.get(n.id) === c).map((n) => n.label),
    )
    recorder.record(
      'done',
      8,
      graph.nodes.length === 0
        ? 'The graph is empty - trivially bipartite.'
        : `Bipartite: every edge joins the two color classes {${sets[0].join(', ')}} and {${sets[1].join(', ')}}.`,
      (s) => {
        s.currentNodeId = null
        s.currentEdgeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bipartite-check',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

import { computeMetrics } from '../engine/metrics'
import { StepRecorder } from '../engine/stepRecorder'
import type { AlgorithmState, ExecutionResult } from '../engine/types'
import type { Graph } from '../graph/types'

/**
 * Floyd-Warshall all-pairs shortest paths. The full V x V matrix is exposed
 * as `distanceMatrix`, with `focus` marking the cell just improved. The
 * canvas and the usual fields follow one source node (the selected start,
 * else the first node): `distances` and `parents` are that source's row, and
 * if a target is also selected the final path is reconstructed. Only each
 * intermediate-node phase and each improving pair is recorded as a step -
 * recording every (i, j, k) check would be V^3 snapshots. Undirected edges
 * count in both directions, so a negative undirected edge is a negative
 * cycle, exactly as in Bellman-Ford.
 */
export function runFloydWarshall(graph: Graph): ExecutionResult {
  const startedAt = performance.now()
  const n = graph.nodes.length
  const ids = graph.nodes.map((node) => node.id)
  const labels = graph.nodes.map((node) => node.label)
  const indexOf = new Map(ids.map((id, i) => [id, i]))

  const dist = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 0 : Infinity)),
  )
  // pred[i][j]: the node just before j on the best known i -> j path.
  const pred: (number | null)[][] = Array.from({ length: n }, () =>
    Array.from({ length: n }, () => null),
  )
  const addArc = (from: number, to: number, weight: number) => {
    if (from === to) {
      dist[from][from] = Math.min(dist[from][from], weight)
    } else if (weight < dist[from][to]) {
      dist[from][to] = weight
      pred[from][to] = from
    }
  }
  for (const edge of graph.edges) {
    const a = indexOf.get(edge.source)
    const b = indexOf.get(edge.target)
    if (a === undefined || b === undefined) continue
    addArc(a, b, edge.weight)
    if (!edge.directed) addArc(b, a, edge.weight)
  }

  const start =
    graph.startNodeId !== null && indexOf.has(graph.startNodeId)
      ? (indexOf.get(graph.startNodeId) as number)
      : 0
  const target =
    graph.startNodeId !== null &&
    graph.targetNodeId !== null &&
    indexOf.has(graph.startNodeId) &&
    indexOf.has(graph.targetNodeId)
      ? (indexOf.get(graph.targetNodeId) as number)
      : null

  /** Copies the tracked source's row into the ordinary distances/parents. */
  const syncRow = (s: AlgorithmState) => {
    s.distances = {}
    s.parents = {}
    for (let j = 0; j < n; j++) {
      if (dist[start][j] === Infinity) continue
      s.distances[ids[j]] = dist[start][j]
      const before = pred[start][j]
      s.parents[ids[j]] = before === null ? null : ids[before]
    }
  }

  const recorder = new StepRecorder()
  const edgeCount = graph.edges.length

  recorder.record(
    'init',
    2,
    n === 0
      ? 'The graph is empty - there are no pairs of nodes.'
      : `Fill the distance matrix from the ${edgeCount} edge(s): 0 on the diagonal, the edge weight where an edge exists, ∞ elsewhere. The canvas follows distances from ${labels[start]}.`,
    (s) => {
      s.distanceMatrix = { nodeIds: ids, values: dist, focus: null }
      syncRow(s)
    },
  )

  for (let k = 0; k < n; k++) {
    recorder.record(
      'init',
      3,
      `Phase ${k + 1} of ${n}: allow ${labels[k]} as an intermediate node on every path.`,
      (s) => {
        s.currentNodeId = ids[k]
        s.currentEdgeId = null
        if (s.distanceMatrix) s.distanceMatrix.focus = null
      },
    )

    let improved = 0
    for (let i = 0; i < n; i++) {
      if (dist[i][k] === Infinity) continue
      for (let j = 0; j < n; j++) {
        if (dist[k][j] === Infinity) continue
        const through = dist[i][k] + dist[k][j]
        if (through >= dist[i][j]) continue
        const before = dist[i][j]
        dist[i][j] = through
        pred[i][j] = pred[k][j]
        improved++
        recorder.record(
          'relax',
          5,
          `${labels[i]} → ${labels[k]} → ${labels[j]} costs ${dist[i][k]} + ${dist[k][j]} = ${through}, beating ${before === Infinity ? '∞' : before}: update dist[${labels[i]}][${labels[j]}].`,
          (s) => {
            if (s.distanceMatrix) s.distanceMatrix.focus = [i, j]
            if (i === start) syncRow(s)
          },
        )
      }
    }

    if (improved === 0) {
      recorder.record(
        'skip-edge',
        4,
        `No pair improves by going through ${labels[k]}.`,
        () => {},
      )
    }
    recorder.record(
      'visit',
      3,
      `Phase ${k + 1} done: ${improved} pair(s) improved via ${labels[k]}.`,
      (s) => {
        s.visited.push(ids[k])
        if (s.distanceMatrix) s.distanceMatrix.focus = null
      },
    )
  }

  const onNegativeCycle = ids.filter((_, i) => dist[i][i] < 0)
  if (onNegativeCycle.length > 0) {
    recorder.record(
      'negative-cycle',
      6,
      `Negative cycle: dist[i][i] < 0 for ${onNegativeCycle.map((id) => labels[indexOf.get(id) as number]).join(', ')}. Shortest distances through these nodes are not well defined.`,
      (s) => {
        s.currentNodeId = null
        s.nodeGroups = Object.fromEntries(onNegativeCycle.map((id) => [id, 0]))
      },
    )
  } else if (target !== null) {
    let path: string[] | null = null
    if (dist[start][target] !== Infinity) {
      const reversed = [ids[target]]
      let cursor = target
      while (cursor !== start) {
        cursor = pred[start][cursor] as number
        reversed.push(ids[cursor])
      }
      path = reversed.reverse()
    }
    recorder.record(
      path ? 'path-found' : 'no-path',
      7,
      path
        ? `Done: the shortest ${labels[start]} → ${labels[target]} path is ${path.map((id) => labels[indexOf.get(id) as number]).join(' → ')}, cost ${dist[start][target]}. The matrix holds every other pair too.`
        : `Done: ${labels[target]} is unreachable from ${labels[start]}. The matrix holds every other pair.`,
      (s) => {
        s.currentNodeId = null
        s.path = path
      },
    )
  } else {
    recorder.record(
      'done',
      7,
      n === 0
        ? 'The graph is empty - there is nothing to compute.'
        : `Done: the matrix holds the shortest distance between every pair of nodes (∞ = unreachable). Select a start and target to also trace one path.`,
      (s) => {
        s.currentNodeId = null
      },
    )
  }

  const steps = recorder.getSteps()
  return {
    algorithmId: 'floyd-warshall',
    steps,
    metrics: computeMetrics(steps, performance.now() - startedAt),
  }
}

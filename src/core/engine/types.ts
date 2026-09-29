import type { NodeId } from '../graph/types'

export type AlgorithmId =
  | 'bfs'
  | 'dfs'
  | 'dijkstra'
  | 'astar'
  | 'bellman-ford'
  | 'greedy-best-first'
  | 'bidirectional-bfs'
  | 'zero-one-bfs'
  | 'topological-sort'
  | 'prim'
  | 'kruskal'
  | 'tarjan-scc'
  | 'bridges-articulation'

export interface AlgorithmMetadata {
  id: AlgorithmId
  name: string
  description: string
  timeComplexity: string
  spaceComplexity: string
  supportsNegativeWeights: boolean
  guaranteesShortestPath: boolean
  requiresHeuristic: boolean
  /** True for algorithms that process the whole graph and need no start or target. */
  wholeGraph?: boolean
  /** What kind of structure `AlgorithmState.frontier` represents for this algorithm. */
  frontierStructure: 'queue' | 'stack' | 'priority-queue' | 'relaxation-passes'
}

/**
 * A snapshot of everything observable about an algorithm's progress at one
 * point in time. Generic across BFS, DFS, Dijkstra, A-star, and Bellman-Ford:
 * `frontier` represents whichever pending-work structure that algorithm uses
 * (queue, stack, or priority queue), in its current iteration order.
 */
export interface AlgorithmState {
  /** Node ids fully processed, in the order they were visited. */
  visited: NodeId[]
  /** Pending node ids (queue/stack/priority-queue contents), in order. */
  frontier: NodeId[]
  /** Best known distance per node id; absent entries are treated as Infinity. */
  distances: Record<NodeId, number>
  /** Parent pointers for path reconstruction; null means "no parent yet". */
  parents: Record<NodeId, NodeId | null>
  /** Node currently being examined, if any. */
  currentNodeId: NodeId | null
  /** Edge currently being examined or relaxed, if any. */
  currentEdgeId: string | null
  /** Reconstructed shortest/traversal path once the algorithm finds one. */
  path: NodeId[] | null
  /** Relaxation pass number, used by Bellman-Ford; unused by other algorithms. */
  pass: number | null
  /** Heuristic estimate h(n) per node id, used only by A*. f(n) = distances[n] + heuristics[n]. */
  heuristics: Record<NodeId, number>
  /** Edge ids highlighted as part of a result (MST edges, bridges); rendered like path edges. */
  highlightedEdges?: string[]
  /** Group index per node id (SCC, bipartite side, articulation flag); rendered as a per-group color. */
  nodeGroups?: Record<NodeId, number>
}

export type StepType =
  | 'init'
  | 'enqueue'
  | 'dequeue'
  | 'visit'
  | 'examine-edge'
  | 'relax'
  | 'skip-edge'
  | 'path-found'
  | 'no-path'
  | 'negative-cycle'
  | 'cycle-found'
  | 'done'

export interface ExecutionStep {
  index: number
  type: StepType
  state: AlgorithmState
  /** Line number (1-indexed) in the algorithm's pseudocode currently executing. */
  pseudocodeLine: number
  /** Deterministic, human-readable explanation of what this step does. */
  explanation: string
}

export interface ExecutionMetrics {
  nodesVisited: number
  edgesExamined: number
  steps: number
  pathLength: number | null
  pathCost: number | null
  executionTimeMs: number
}

export interface ExecutionResult {
  algorithmId: AlgorithmId
  steps: ExecutionStep[]
  metrics: ExecutionMetrics
}

export function createInitialAlgorithmState(): AlgorithmState {
  return {
    visited: [],
    frontier: [],
    distances: {},
    parents: {},
    currentNodeId: null,
    currentEdgeId: null,
    path: null,
    pass: null,
    heuristics: {},
  }
}

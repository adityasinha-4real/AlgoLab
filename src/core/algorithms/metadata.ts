import type { AlgorithmId, AlgorithmMetadata } from '../engine/types'

/**
 * Static metadata for every algorithm AlgoLab supports. Populated ahead of
 * the algorithms themselves (M4-M7) so the UI shell and complexity panel
 * have real data to render against.
 */
export const ALGORITHM_METADATA: Record<AlgorithmId, AlgorithmMetadata> = {
  bfs: {
    id: 'bfs',
    name: 'Breadth-First Search',
    description:
      'Explores the graph level by level using a FIFO queue, guaranteeing the fewest-edges path on unweighted graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: true,
    requiresHeuristic: false,
    frontierStructure: 'queue',
  },
  dfs: {
    id: 'dfs',
    name: 'Depth-First Search',
    description:
      'Explores as far as possible along each branch using a LIFO stack before backtracking. Does not guarantee shortest paths.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    frontierStructure: 'stack',
  },
  dijkstra: {
    id: 'dijkstra',
    name: "Dijkstra's Algorithm",
    description:
      'Greedily expands the closest unvisited node using a priority queue, guaranteeing shortest paths on graphs with non-negative weights.',
    timeComplexity: 'O((V + E) log V)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: true,
    requiresHeuristic: false,
    frontierStructure: 'priority-queue',
  },
  astar: {
    id: 'astar',
    name: 'A* Search',
    description:
      "Like Dijkstra's algorithm but guided by a heuristic estimate of remaining distance, guaranteeing shortest paths when the heuristic never overestimates.",
    timeComplexity: 'O(E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: true,
    requiresHeuristic: true,
    frontierStructure: 'priority-queue',
  },
  'bellman-ford': {
    id: 'bellman-ford',
    name: 'Bellman-Ford Algorithm',
    description:
      'Relaxes every edge over V-1 passes, correctly handling negative weights and detecting negative-weight cycles.',
    timeComplexity: 'O(V * E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: true,
    guaranteesShortestPath: true,
    requiresHeuristic: false,
    frontierStructure: 'relaxation-passes',
  },
  'greedy-best-first': {
    id: 'greedy-best-first',
    name: 'Greedy Best-First Search',
    description:
      'Always expands the node that looks closest to the target by heuristic alone, ignoring the cost so far. Fast, but does not guarantee shortest paths.',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: true,
    frontierStructure: 'priority-queue',
  },
  'bidirectional-bfs': {
    id: 'bidirectional-bfs',
    name: 'Bidirectional BFS',
    description:
      'Runs a breadth-first search from the start and another backward from the target until they meet, finding the fewest-edges path while exploring far fewer nodes.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: true,
    requiresHeuristic: false,
    frontierStructure: 'queue',
  },
  'zero-one-bfs': {
    id: 'zero-one-bfs',
    name: '0-1 BFS',
    description:
      "Shortest paths when every edge weighs 0 or 1: a deque replaces Dijkstra's priority queue, with zero-weight edges pushing to the front and one-weight edges to the back.",
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: true,
    requiresHeuristic: false,
    frontierStructure: 'queue',
  },
  'topological-sort': {
    id: 'topological-sort',
    name: 'Topological Sort (Kahn)',
    description:
      'Repeatedly removes nodes with no incoming edges to order a directed acyclic graph so every edge points forward. Reports a cycle if no such order exists.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'queue',
  },
  prim: {
    id: 'prim',
    name: "Prim's MST",
    description:
      'Grows a minimum spanning tree from one node by repeatedly adding the cheapest edge that reaches a new node. Needs an undirected graph; negative weights are fine.',
    timeComplexity: 'O(E log V)',
    spaceComplexity: 'O(V + E)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'priority-queue',
  },
  kruskal: {
    id: 'kruskal',
    name: "Kruskal's MST",
    description:
      'Builds a minimum spanning tree by taking edges from cheapest to dearest, skipping any that would join two nodes already connected. Needs an undirected graph; negative weights are fine.',
    timeComplexity: 'O(E log E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'priority-queue',
  },
  'tarjan-scc': {
    id: 'tarjan-scc',
    name: "Tarjan's SCC",
    description:
      'Finds strongly connected components of a directed graph in a single depth-first pass, using discovery indexes and low-link values with a node stack.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'stack',
  },
  'bridges-articulation': {
    id: 'bridges-articulation',
    name: 'Bridges & Articulation Points',
    description:
      'Finds the edges (bridges) and nodes (articulation points) whose removal disconnects an undirected graph, using discovery indexes and low-link values in one depth-first pass.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'stack',
  },
  'cycle-detection': {
    id: 'cycle-detection',
    name: 'Cycle Detection',
    description:
      'Depth-first search with gray/black coloring that stops at the first cycle it finds and highlights it. Works on directed, undirected and mixed graphs.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'stack',
  },
  'bipartite-check': {
    id: 'bipartite-check',
    name: 'Bipartite Check',
    description:
      'Two-colors the graph with a breadth-first search, ignoring edge direction. Any edge joining two same-colored nodes proves an odd cycle, which is highlighted.',
    timeComplexity: 'O(V + E)',
    spaceComplexity: 'O(V)',
    supportsNegativeWeights: false,
    guaranteesShortestPath: false,
    requiresHeuristic: false,
    wholeGraph: true,
    frontierStructure: 'queue',
  },
}

export function getAlgorithmMetadata(id: AlgorithmId): AlgorithmMetadata {
  return ALGORITHM_METADATA[id]
}

export function listAlgorithmMetadata(): AlgorithmMetadata[] {
  return Object.values(ALGORITHM_METADATA)
}

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
}

export function getAlgorithmMetadata(id: AlgorithmId): AlgorithmMetadata {
  return ALGORITHM_METADATA[id]
}

export function listAlgorithmMetadata(): AlgorithmMetadata[] {
  return Object.values(ALGORITHM_METADATA)
}

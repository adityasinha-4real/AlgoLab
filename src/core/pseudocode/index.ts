import type { AlgorithmId } from '../engine/types'
import { ASTAR_PSEUDOCODE } from './astar'
import { BELLMAN_FORD_PSEUDOCODE } from './bellmanFord'
import { BFS_PSEUDOCODE } from './bfs'
import { DFS_PSEUDOCODE } from './dfs'
import { DIJKSTRA_PSEUDOCODE } from './dijkstra'
import { TOPOLOGICAL_SORT_PSEUDOCODE } from './topologicalSort'
import { ZERO_ONE_BFS_PSEUDOCODE } from './zeroOneBfs'
import { BIDIRECTIONAL_BFS_PSEUDOCODE } from './bidirectionalBfs'
import { GREEDY_BEST_FIRST_PSEUDOCODE } from './greedyBestFirst'

export { BFS_PSEUDOCODE } from './bfs'
export { DFS_PSEUDOCODE } from './dfs'
export { DIJKSTRA_PSEUDOCODE } from './dijkstra'
export { ASTAR_PSEUDOCODE } from './astar'
export { ASTAR_GRID_PSEUDOCODE } from './astarGrid'
export { BELLMAN_FORD_PSEUDOCODE } from './bellmanFord'
export { TOPOLOGICAL_SORT_PSEUDOCODE } from './topologicalSort'
export { ZERO_ONE_BFS_PSEUDOCODE } from './zeroOneBfs'
export { BIDIRECTIONAL_BFS_PSEUDOCODE } from './bidirectionalBfs'
export { GREEDY_BEST_FIRST_PSEUDOCODE } from './greedyBestFirst'

export const PSEUDOCODE_BY_ALGORITHM: Partial<
  Record<AlgorithmId, readonly string[]>
> = {
  bfs: BFS_PSEUDOCODE,
  dfs: DFS_PSEUDOCODE,
  dijkstra: DIJKSTRA_PSEUDOCODE,
  astar: ASTAR_PSEUDOCODE,
  'bellman-ford': BELLMAN_FORD_PSEUDOCODE,
  'topological-sort': TOPOLOGICAL_SORT_PSEUDOCODE,
  'zero-one-bfs': ZERO_ONE_BFS_PSEUDOCODE,
  'bidirectional-bfs': BIDIRECTIONAL_BFS_PSEUDOCODE,
  'greedy-best-first': GREEDY_BEST_FIRST_PSEUDOCODE,
}

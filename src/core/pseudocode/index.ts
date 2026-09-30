import type { AlgorithmId } from '../engine/types'
import { ASTAR_PSEUDOCODE } from './astar'
import { BELLMAN_FORD_PSEUDOCODE } from './bellmanFord'
import { BFS_PSEUDOCODE } from './bfs'
import { DFS_PSEUDOCODE } from './dfs'
import { DIJKSTRA_PSEUDOCODE } from './dijkstra'
import { BIPARTITE_CHECK_PSEUDOCODE } from './bipartiteCheck'
import { CYCLE_DETECTION_PSEUDOCODE } from './cycleDetection'
import { BRIDGES_ARTICULATION_PSEUDOCODE } from './bridgesArticulation'
import { TARJAN_SCC_PSEUDOCODE } from './tarjanScc'
import { KOSARAJU_SCC_PSEUDOCODE } from './kosarajuScc'
import { KRUSKAL_PSEUDOCODE } from './kruskal'
import { BORUVKA_PSEUDOCODE } from './boruvka'
import { PRIM_PSEUDOCODE } from './prim'
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
export { BIPARTITE_CHECK_PSEUDOCODE } from './bipartiteCheck'
export { CYCLE_DETECTION_PSEUDOCODE } from './cycleDetection'
export { BRIDGES_ARTICULATION_PSEUDOCODE } from './bridgesArticulation'
export { TARJAN_SCC_PSEUDOCODE } from './tarjanScc'
export { KOSARAJU_SCC_PSEUDOCODE } from './kosarajuScc'
export { KRUSKAL_PSEUDOCODE } from './kruskal'
export { BORUVKA_PSEUDOCODE } from './boruvka'
export { PRIM_PSEUDOCODE } from './prim'
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
  'bipartite-check': BIPARTITE_CHECK_PSEUDOCODE,
  'cycle-detection': CYCLE_DETECTION_PSEUDOCODE,
  'bridges-articulation': BRIDGES_ARTICULATION_PSEUDOCODE,
  'tarjan-scc': TARJAN_SCC_PSEUDOCODE,
  'kosaraju-scc': KOSARAJU_SCC_PSEUDOCODE,
  kruskal: KRUSKAL_PSEUDOCODE,
  boruvka: BORUVKA_PSEUDOCODE,
  prim: PRIM_PSEUDOCODE,
  'topological-sort': TOPOLOGICAL_SORT_PSEUDOCODE,
  'zero-one-bfs': ZERO_ONE_BFS_PSEUDOCODE,
  'bidirectional-bfs': BIDIRECTIONAL_BFS_PSEUDOCODE,
  'greedy-best-first': GREEDY_BEST_FIRST_PSEUDOCODE,
}

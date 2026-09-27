import type { AlgorithmId } from '../engine/types'
import { ASTAR_PSEUDOCODE } from './astar'
import { BFS_PSEUDOCODE } from './bfs'
import { DFS_PSEUDOCODE } from './dfs'
import { DIJKSTRA_PSEUDOCODE } from './dijkstra'

export { BFS_PSEUDOCODE } from './bfs'
export { DFS_PSEUDOCODE } from './dfs'
export { DIJKSTRA_PSEUDOCODE } from './dijkstra'
export { ASTAR_PSEUDOCODE } from './astar'

export const PSEUDOCODE_BY_ALGORITHM: Partial<
  Record<AlgorithmId, readonly string[]>
> = {
  bfs: BFS_PSEUDOCODE,
  dfs: DFS_PSEUDOCODE,
  dijkstra: DIJKSTRA_PSEUDOCODE,
  astar: ASTAR_PSEUDOCODE,
}

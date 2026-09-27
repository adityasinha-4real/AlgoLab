import type { AlgorithmId } from '../engine/types'
import { BFS_PSEUDOCODE } from './bfs'
import { DFS_PSEUDOCODE } from './dfs'

export { BFS_PSEUDOCODE } from './bfs'
export { DFS_PSEUDOCODE } from './dfs'

export const PSEUDOCODE_BY_ALGORITHM: Partial<
  Record<AlgorithmId, readonly string[]>
> = {
  bfs: BFS_PSEUDOCODE,
  dfs: DFS_PSEUDOCODE,
}

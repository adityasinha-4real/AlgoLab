import type { ExecutionResult } from '../engine/types'
import type { Graph } from '../graph/types'
import type { AlgorithmId } from '../engine/types'
import { runAStar } from './astar'
import { runBellmanFord } from './bellmanFord'
import { runBFS } from './bfs'
import { runDFS } from './dfs'
import { runDijkstra } from './dijkstra'

export type AlgorithmRunner = (graph: Graph) => ExecutionResult

/** Only algorithms implemented so far are registered here; the UI checks
 * for a runner's presence to know whether "Run" is available yet. */
export const ALGORITHM_RUNNERS: Partial<Record<AlgorithmId, AlgorithmRunner>> =
  {
    bfs: runBFS,
    dfs: runDFS,
    dijkstra: runDijkstra,
    astar: runAStar,
    'bellman-ford': runBellmanFord,
  }

export function getAlgorithmRunner(
  id: AlgorithmId,
): AlgorithmRunner | undefined {
  return ALGORITHM_RUNNERS[id]
}

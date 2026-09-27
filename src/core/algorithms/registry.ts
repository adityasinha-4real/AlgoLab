import type { ExecutionResult } from '../engine/types'
import type { Graph } from '../graph/types'
import type { AlgorithmId } from '../engine/types'
import { runBFS } from './bfs'
import { runDFS } from './dfs'

export type AlgorithmRunner = (graph: Graph) => ExecutionResult

/** Only algorithms implemented so far are registered here; the UI checks
 * for a runner's presence to know whether "Run" is available yet. */
export const ALGORITHM_RUNNERS: Partial<Record<AlgorithmId, AlgorithmRunner>> =
  {
    bfs: runBFS,
    dfs: runDFS,
  }

export function getAlgorithmRunner(
  id: AlgorithmId,
): AlgorithmRunner | undefined {
  return ALGORITHM_RUNNERS[id]
}

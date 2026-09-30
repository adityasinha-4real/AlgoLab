import type { ExecutionResult } from '../engine/types'
import type { Graph } from '../graph/types'
import type { AlgorithmId } from '../engine/types'
import { runAStar } from './astar'
import { runBellmanFord } from './bellmanFord'
import { runBFS } from './bfs'
import { runDFS } from './dfs'
import { runDijkstra } from './dijkstra'
import { runBipartiteCheck } from './bipartiteCheck'
import { runCycleDetection } from './cycleDetection'
import { runBridgesArticulation } from './bridgesArticulation'
import { runTarjanScc } from './tarjanScc'
import { runKosarajuScc } from './kosarajuScc'
import { runKruskal } from './kruskal'
import { runBoruvka } from './boruvka'
import { runPrim } from './prim'
import { runTopologicalSort } from './topologicalSort'
import { runZeroOneBFS } from './zeroOneBfs'
import { runBidirectionalBFS } from './bidirectionalBfs'
import { runGreedyBestFirst } from './greedyBestFirst'

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
    'greedy-best-first': runGreedyBestFirst,
    'bidirectional-bfs': runBidirectionalBFS,
    'zero-one-bfs': runZeroOneBFS,
    'topological-sort': runTopologicalSort,
    prim: runPrim,
    kruskal: runKruskal,
    boruvka: runBoruvka,
    'tarjan-scc': runTarjanScc,
    'kosaraju-scc': runKosarajuScc,
    'bridges-articulation': runBridgesArticulation,
    'cycle-detection': runCycleDetection,
    'bipartite-check': runBipartiteCheck,
  }

export function getAlgorithmRunner(
  id: AlgorithmId,
): AlgorithmRunner | undefined {
  return ALGORITHM_RUNNERS[id]
}

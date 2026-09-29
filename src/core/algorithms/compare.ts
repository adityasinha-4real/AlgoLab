import type { AlgorithmId, ExecutionMetrics } from '../engine/types'
import type { Graph } from '../graph/types'
import { listAlgorithmMetadata } from './metadata'
import { getAlgorithmRunner } from './registry'

export interface ComparisonEntry {
  algorithmId: AlgorithmId
  metrics: ExecutionMetrics | null
  error: string | null
}

/** Runs every implemented start-to-target algorithm (whole-graph algorithms
 * have no path metrics to compare, so they are left out) against the same graph so their metrics
 * can be compared side by side. An algorithm that isn't implemented yet, or
 * that rejects the graph (e.g. Dijkstra/A* on negative weights), gets an
 * entry with an error message instead of a thrown exception. */
export function compareAlgorithms(graph: Graph): ComparisonEntry[] {
  return listAlgorithmMetadata()
    .filter((meta) => !meta.wholeGraph)
    .map((meta) => {
      const runner = getAlgorithmRunner(meta.id)
      if (!runner) {
        return {
          algorithmId: meta.id,
          metrics: null,
          error: 'Not implemented yet',
        }
      }
      try {
        const result = runner(graph)
        return { algorithmId: meta.id, metrics: result.metrics, error: null }
      } catch (error) {
        return {
          algorithmId: meta.id,
          metrics: null,
          error: error instanceof Error ? error.message : 'Failed to run',
        }
      }
    })
}

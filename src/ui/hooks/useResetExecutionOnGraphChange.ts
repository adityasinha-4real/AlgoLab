import { useEffect } from 'react'
import { useComparisonStore } from '../state/comparisonStore'
import { useExecutionStore } from '../state/executionStore'
import { useGraphStore } from '../state/graphStore'

/**
 * Clears any loaded ExecutionResult (and comparison table) whenever the
 * graph itself changes. Without this, results computed for a previous graph
 * (e.g. before loading a different preset) would keep highlighting nodes/
 * edges by id - and since presets can reuse the same ids, that stale
 * overlay can look like a real (but wrong) result on the new graph.
 */
export function useResetExecutionOnGraphChange(): void {
  useEffect(() => {
    return useGraphStore.subscribe((state, prevState) => {
      if (state.graph !== prevState.graph) {
        useExecutionStore.getState().reset()
        useComparisonStore.getState().clear()
      }
    })
  }, [])
}

import { useState } from 'react'
import {
  getAlgorithmMetadata,
  listAlgorithmMetadata,
} from '../../core/algorithms/metadata'
import { getAlgorithmRunner } from '../../core/algorithms/registry'
import { validateGraph } from '../../core/graph'
import { useAlgorithmStore } from '../state/algorithmStore'
import { useExecutionStore } from '../state/executionStore'
import { useGraphStore } from '../state/graphStore'

export function AlgorithmPanel() {
  const algorithms = listAlgorithmMetadata()
  const selectedAlgorithmId = useAlgorithmStore((s) => s.selectedAlgorithmId)
  const setSelectedAlgorithmId = useAlgorithmStore(
    (s) => s.setSelectedAlgorithmId,
  )
  const graph = useGraphStore((s) => s.graph)
  const load = useExecutionStore((s) => s.load)
  const [runError, setRunError] = useState<string | null>(null)

  const runner = getAlgorithmRunner(selectedAlgorithmId)
  const validationErrors = validateGraph(graph)
  const canRun = Boolean(runner) && validationErrors.length === 0
  const selectedMetadata = getAlgorithmMetadata(selectedAlgorithmId)

  const handleRun = () => {
    if (!runner) return
    try {
      setRunError(null)
      load(runner(graph))
    } catch (error) {
      setRunError(
        error instanceof Error ? error.message : 'Failed to run algorithm.',
      )
    }
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">Algorithms</h2>
      <ul className="flex flex-col gap-2">
        {algorithms.map((algorithm) => {
          const isSelected = algorithm.id === selectedAlgorithmId
          const isImplemented = Boolean(getAlgorithmRunner(algorithm.id))
          return (
            <li key={algorithm.id}>
              <button
                type="button"
                onClick={() => setSelectedAlgorithmId(algorithm.id)}
                className={`w-full rounded border px-3 py-2 text-left ${
                  isSelected
                    ? 'border-accent bg-surface-2'
                    : 'border-border bg-surface-2'
                }`}
              >
                <div className="flex items-center justify-between">
                  <span className="text-sm font-medium text-text-primary">
                    {algorithm.name}
                  </span>
                  <span className="text-xs text-text-muted">
                    {algorithm.timeComplexity}
                  </span>
                </div>
                <p className="mt-1 text-xs text-text-muted">
                  {algorithm.description}
                </p>
                {!isImplemented && (
                  <p className="mt-1 text-[10px] uppercase tracking-wide text-amber-400">
                    Coming soon
                  </p>
                )}
              </button>
            </li>
          )
        })}
      </ul>

      <dl className="grid grid-cols-2 gap-x-2 gap-y-1 rounded border border-border bg-surface-2 px-3 py-2 text-xs">
        <dt className="text-text-muted">Time complexity</dt>
        <dd className="text-right text-text-primary">
          {selectedMetadata.timeComplexity}
        </dd>
        <dt className="text-text-muted">Space complexity</dt>
        <dd className="text-right text-text-primary">
          {selectedMetadata.spaceComplexity}
        </dd>
        <dt className="text-text-muted">Negative weights</dt>
        <dd className="text-right text-text-primary">
          {selectedMetadata.supportsNegativeWeights
            ? 'Supported'
            : 'Not supported'}
        </dd>
        <dt className="text-text-muted">Shortest path</dt>
        <dd className="text-right text-text-primary">
          {selectedMetadata.guaranteesShortestPath
            ? 'Guaranteed'
            : 'Not guaranteed'}
        </dd>
      </dl>

      <button
        type="button"
        onClick={handleRun}
        disabled={!canRun}
        className="mt-1 rounded border border-accent px-3 py-2 text-sm font-medium text-accent disabled:cursor-not-allowed disabled:border-border disabled:text-text-muted"
      >
        {runner
          ? `Run ${selectedAlgorithmId.toUpperCase()}`
          : 'Not implemented yet'}
      </button>

      {validationErrors.length > 0 && (
        <p className="text-xs text-amber-300">
          Fix the graph before running: {validationErrors[0].message}
        </p>
      )}
      {runError && <p className="text-xs text-rose-400">{runError}</p>}
    </div>
  )
}

import { getAlgorithmMetadata } from '../../core/algorithms/metadata'
import { useComparisonStore } from '../state/comparisonStore'
import { useGraphStore } from '../state/graphStore'

export function ComparisonPanel() {
  const graph = useGraphStore((s) => s.graph)
  const entries = useComparisonStore((s) => s.entries)
  const run = useComparisonStore((s) => s.run)
  const clear = useComparisonStore((s) => s.clear)

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
      <div className="flex items-center justify-between">
        <h2 className="text-sm font-semibold text-text-primary">Comparison</h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => run(graph)}
            className="rounded border border-accent px-2 py-1 text-xs font-medium text-accent"
          >
            Compare all
          </button>
          {entries && (
            <button
              type="button"
              onClick={clear}
              className="rounded border border-border px-2 py-1 text-xs text-text-muted"
            >
              Clear
            </button>
          )}
        </div>
      </div>

      {!entries ? (
        <p className="rounded border border-dashed border-border px-2 py-2 text-xs text-text-muted">
          Run every algorithm on the current graph and compare nodes visited,
          edges examined, steps, path length, path cost, and execution time.
        </p>
      ) : (
        <table className="w-full text-left text-xs">
          <thead>
            <tr className="text-text-muted">
              <th className="pb-1 pr-2 font-medium">Algorithm</th>
              <th className="pb-1 pr-2 font-medium">Visited</th>
              <th className="pb-1 pr-2 font-medium">Edges</th>
              <th className="pb-1 pr-2 font-medium">Steps</th>
              <th className="pb-1 pr-2 font-medium">Path len</th>
              <th className="pb-1 pr-2 font-medium">Path cost</th>
              <th className="pb-1 font-medium">Time (ms)</th>
            </tr>
          </thead>
          <tbody>
            {entries.map((entry) => (
              <tr
                key={entry.algorithmId}
                className="border-t border-border text-text-primary"
              >
                <td className="py-1 pr-2">
                  {getAlgorithmMetadata(entry.algorithmId).name}
                </td>
                {entry.metrics ? (
                  <>
                    <td className="py-1 pr-2">{entry.metrics.nodesVisited}</td>
                    <td className="py-1 pr-2">{entry.metrics.edgesExamined}</td>
                    <td className="py-1 pr-2">{entry.metrics.steps}</td>
                    <td className="py-1 pr-2">
                      {entry.metrics.pathLength ?? '—'}
                    </td>
                    <td className="py-1 pr-2">
                      {entry.metrics.pathCost ?? '—'}
                    </td>
                    <td className="py-1">
                      {entry.metrics.executionTimeMs.toFixed(2)}
                    </td>
                  </>
                ) : (
                  <td colSpan={6} className="py-1 text-amber-300">
                    {entry.error}
                  </td>
                )}
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  )
}

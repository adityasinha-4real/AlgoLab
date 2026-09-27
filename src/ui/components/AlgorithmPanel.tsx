import { listAlgorithmMetadata } from '../../core/algorithms/metadata'

export function AlgorithmPanel() {
  const algorithms = listAlgorithmMetadata()

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">Algorithms</h2>
      <ul className="flex flex-col gap-2">
        {algorithms.map((algorithm) => (
          <li
            key={algorithm.id}
            className="rounded border border-border bg-surface-2 px-3 py-2"
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
          </li>
        ))}
      </ul>
    </div>
  )
}

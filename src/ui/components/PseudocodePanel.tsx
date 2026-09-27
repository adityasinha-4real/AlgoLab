import { PSEUDOCODE_BY_ALGORITHM } from '../../core/pseudocode'
import { useAlgorithmStore } from '../state/algorithmStore'
import { getCurrentStep, useExecutionStore } from '../state/executionStore'

export function PseudocodePanel() {
  const selectedAlgorithmId = useAlgorithmStore((s) => s.selectedAlgorithmId)
  const result = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const step = getCurrentStep({ result, cursor })

  const lines = PSEUDOCODE_BY_ALGORITHM[selectedAlgorithmId]
  const highlightLine =
    result?.algorithmId === selectedAlgorithmId
      ? step?.pseudocodeLine
      : undefined

  if (!lines) {
    return (
      <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
        <h2 className="text-sm font-semibold text-text-primary">Pseudocode</h2>
        <p className="rounded border border-dashed border-border px-2 py-2 text-xs text-text-muted">
          Pseudocode for this algorithm isn't available yet.
        </p>
      </div>
    )
  }

  return (
    <div className="flex flex-col gap-2 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">Pseudocode</h2>
      <pre className="overflow-x-auto rounded border border-border bg-surface-2 p-2 text-xs leading-relaxed">
        {lines.map((line, i) => {
          const lineNumber = i + 1
          const isActive = lineNumber === highlightLine
          return (
            <div
              key={lineNumber}
              className={`whitespace-pre rounded px-1 ${
                isActive ? 'bg-accent/20 text-accent' : 'text-text-primary'
              }`}
            >
              <span className="mr-2 inline-block w-4 text-right text-text-muted">
                {lineNumber}
              </span>
              {line}
            </div>
          )
        })}
      </pre>
    </div>
  )
}

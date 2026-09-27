import { validateGraph } from '../../../core/graph'
import { useGraphStore } from '../../state/graphStore'

export function ErrorBanner() {
  const graph = useGraphStore((s) => s.graph)
  if (graph.nodes.length === 0) return null

  const errors = validateGraph(graph)
  if (errors.length === 0) return null

  return (
    <div className="rounded-md border border-amber-400/40 bg-amber-400/10 px-3 py-2 text-xs text-amber-300">
      <ul className="list-inside list-disc">
        {errors.map((error) => (
          <li key={error.code}>{error.message}</li>
        ))}
      </ul>
    </div>
  )
}

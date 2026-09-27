import { listGraphPresets } from '../../../core/graph'
import { generateRandomGraph } from '../../../core/graph/random'
import { useGraphStore } from '../../state/graphStore'

const presets = listGraphPresets()

export function GraphToolbar() {
  const isAddingNode = useGraphStore((s) => s.isAddingNode)
  const setIsAddingNode = useGraphStore((s) => s.setIsAddingNode)
  const newEdgeDirected = useGraphStore((s) => s.newEdgeDirected)
  const setNewEdgeDirected = useGraphStore((s) => s.setNewEdgeDirected)
  const setGraph = useGraphStore((s) => s.setGraph)
  const clear = useGraphStore((s) => s.clear)

  return (
    <div className="flex flex-wrap items-center gap-2 rounded-md border border-border bg-surface-1 px-3 py-2 text-sm">
      <button
        type="button"
        aria-pressed={isAddingNode}
        onClick={() => setIsAddingNode(!isAddingNode)}
        className={`rounded border px-2.5 py-1 ${
          isAddingNode
            ? 'border-accent text-accent'
            : 'border-border text-text-primary'
        }`}
      >
        {isAddingNode ? 'Click canvas to place…' : '+ Add node'}
      </button>

      <label className="flex items-center gap-1.5 text-text-muted">
        <input
          type="checkbox"
          checked={newEdgeDirected}
          onChange={(e) => setNewEdgeDirected(e.target.checked)}
        />
        New edges directed
      </label>

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={() => setGraph(generateRandomGraph({ nodeCount: 8 }))}
        className="rounded border border-border px-2.5 py-1 text-text-primary"
      >
        Random graph
      </button>

      <select
        defaultValue=""
        onChange={(e) => {
          const preset = presets.find((p) => p.id === e.target.value)
          if (preset) setGraph(preset.build())
          e.target.value = ''
        }}
        className="rounded border border-border bg-surface-1 px-2 py-1 text-text-primary"
      >
        <option value="" disabled>
          Load preset…
        </option>
        {presets.map((preset) => (
          <option key={preset.id} value={preset.id} title={preset.description}>
            {preset.name}
          </option>
        ))}
      </select>

      <div className="mx-1 h-5 w-px bg-border" />

      <button
        type="button"
        onClick={clear}
        className="rounded border border-border px-2.5 py-1 text-text-muted"
      >
        Clear
      </button>
    </div>
  )
}

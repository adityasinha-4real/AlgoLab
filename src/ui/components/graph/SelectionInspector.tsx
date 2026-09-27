import { useGraphStore } from '../../state/graphStore'

export function SelectionInspector() {
  const graph = useGraphStore((s) => s.graph)
  const selected = useGraphStore((s) => s.selected)
  const deleteNode = useGraphStore((s) => s.deleteNode)
  const deleteEdge = useGraphStore((s) => s.deleteEdge)
  const markStart = useGraphStore((s) => s.markStart)
  const markTarget = useGraphStore((s) => s.markTarget)
  const updateEdgeWeight = useGraphStore((s) => s.updateEdgeWeight)
  const toggleEdgeDirected = useGraphStore((s) => s.toggleEdgeDirected)

  if (!selected) {
    return (
      <div className="rounded-md border border-border bg-surface-1 p-4 text-xs text-text-muted">
        Select a node or edge to inspect and edit it.
      </div>
    )
  }

  if (selected.kind === 'node') {
    const node = graph.nodes.find((n) => n.id === selected.id)
    if (!node) return null
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-1 p-4">
        <h2 className="text-sm font-semibold text-text-primary">
          Node {node.label}
        </h2>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => markStart(node.id)}
            disabled={graph.startNodeId === node.id}
            className="flex-1 rounded border border-emerald-400/60 px-2 py-1 text-xs text-emerald-400 disabled:opacity-40"
          >
            Set as start
          </button>
          <button
            type="button"
            onClick={() => markTarget(node.id)}
            disabled={graph.targetNodeId === node.id}
            className="flex-1 rounded border border-rose-400/60 px-2 py-1 text-xs text-rose-400 disabled:opacity-40"
          >
            Set as target
          </button>
        </div>
        <button
          type="button"
          onClick={() => deleteNode(node.id)}
          className="rounded border border-border px-2 py-1 text-xs text-text-muted"
        >
          Delete node
        </button>
      </div>
    )
  }

  const edge = graph.edges.find((e) => e.id === selected.id)
  if (!edge) return null
  const sourceLabel = graph.nodes.find((n) => n.id === edge.source)?.label
  const targetLabel = graph.nodes.find((n) => n.id === edge.target)?.label

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">
        Edge {sourceLabel} → {targetLabel}
      </h2>
      <label className="flex items-center justify-between text-xs text-text-muted">
        Weight
        <input
          type="number"
          value={edge.weight}
          onChange={(e) => updateEdgeWeight(edge.id, Number(e.target.value))}
          className="w-20 rounded border border-border bg-surface-2 px-2 py-1 text-right text-text-primary"
        />
      </label>
      <label className="flex items-center gap-2 text-xs text-text-muted">
        <input
          type="checkbox"
          checked={edge.directed}
          onChange={() => toggleEdgeDirected(edge.id)}
        />
        Directed
      </label>
      <button
        type="button"
        onClick={() => deleteEdge(edge.id)}
        className="rounded border border-border px-2 py-1 text-xs text-text-muted"
      >
        Delete edge
      </button>
    </div>
  )
}

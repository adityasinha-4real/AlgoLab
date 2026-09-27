import type { ReactNode } from 'react'
import { useGraphStore } from '../state/graphStore'
import { getCurrentStep, useExecutionStore } from '../state/executionStore'

function labelFor(nodeIds: Record<string, string>, id: string | null): string {
  if (id === null) return '—'
  return nodeIds[id] ?? id
}

export function StateInspectorPanel() {
  const result = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const graph = useGraphStore((s) => s.graph)
  const step = getCurrentStep({ result, cursor })
  const nodeLabelById = Object.fromEntries(
    graph.nodes.map((n) => [n.id, n.label]),
  )

  if (!step) {
    return (
      <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-1 p-4">
        <h2 className="text-sm font-semibold text-text-primary">
          State inspector
        </h2>
        <p className="rounded border border-dashed border-border px-2 py-2 text-xs text-text-muted">
          Run an algorithm to inspect its visited set, frontier, distances, and
          parents at every step.
        </p>
      </div>
    )
  }

  const { state } = step

  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">
        State inspector
      </h2>

      <Section title="Current">
        {labelFor(nodeLabelById, state.currentNodeId)}
        {state.currentEdgeId ? ` · edge ${state.currentEdgeId}` : ''}
      </Section>

      <Section title="Visited">
        {state.visited.length > 0
          ? state.visited.map((id) => nodeLabelById[id] ?? id).join(', ')
          : '—'}
      </Section>

      <Section title="Frontier">
        {state.frontier.length > 0
          ? state.frontier.map((id) => nodeLabelById[id] ?? id).join(', ')
          : '—'}
      </Section>

      <Section title="Distances">
        {Object.keys(state.distances).length > 0
          ? Object.entries(state.distances)
              .map(([id, d]) => `${nodeLabelById[id] ?? id}: ${d}`)
              .join(', ')
          : '—'}
      </Section>

      <Section title="Parents">
        {Object.keys(state.parents).length > 0
          ? Object.entries(state.parents)
              .map(
                ([id, parentId]) =>
                  `${nodeLabelById[id] ?? id} ← ${labelFor(nodeLabelById, parentId)}`,
              )
              .join(', ')
          : '—'}
      </Section>

      <Section title="Path">
        {state.path
          ? state.path.map((id) => nodeLabelById[id] ?? id).join(' → ')
          : '—'}
      </Section>
    </div>
  )
}

function Section({ title, children }: { title: string; children: ReactNode }) {
  return (
    <div>
      <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
        {title}
      </p>
      <p className="mt-1 rounded border border-border px-2 py-1.5 text-xs text-text-primary">
        {children}
      </p>
    </div>
  )
}

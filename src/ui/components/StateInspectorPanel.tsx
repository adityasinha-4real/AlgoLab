const SECTIONS = [
  { title: 'Visited', hint: 'Nodes fully processed' },
  { title: 'Frontier', hint: 'Queue / stack / priority queue contents' },
  { title: 'Distances', hint: 'Best known distance per node' },
  { title: 'Parents', hint: 'Path-reconstruction pointers' },
]

export function StateInspectorPanel() {
  return (
    <div className="flex flex-col gap-3 rounded-md border border-border bg-surface-1 p-4">
      <h2 className="text-sm font-semibold text-text-primary">
        State inspector
      </h2>
      {SECTIONS.map((section) => (
        <div key={section.title}>
          <p className="text-xs font-medium uppercase tracking-wide text-text-muted">
            {section.title}
          </p>
          <p className="mt-1 rounded border border-dashed border-border px-2 py-2 text-xs text-text-muted">
            {section.hint} — populated once an algorithm is running.
          </p>
        </div>
      ))}
    </div>
  )
}

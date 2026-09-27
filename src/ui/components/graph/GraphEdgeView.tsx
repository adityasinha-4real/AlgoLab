import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react'

export function GraphEdgeView({
  id,
  sourceX,
  sourceY,
  targetX,
  targetY,
  selected,
  markerEnd,
  data,
}: EdgeProps) {
  const [path, labelX, labelY] = getStraightPath({
    sourceX,
    sourceY,
    targetX,
    targetY,
  })
  const weight = (data as { weight?: number } | undefined)?.weight ?? 1

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{
          stroke: selected ? 'var(--color-accent)' : 'var(--color-border)',
          strokeWidth: selected ? 2.5 : 1.5,
        }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className={`rounded border px-1.5 py-0.5 text-xs ${
            selected
              ? 'border-accent text-accent'
              : 'border-border text-text-muted'
          } bg-surface-1`}
        >
          {weight}
        </div>
      </EdgeLabelRenderer>
    </>
  )
}

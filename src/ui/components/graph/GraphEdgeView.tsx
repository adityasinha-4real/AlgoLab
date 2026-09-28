import {
  BaseEdge,
  EdgeLabelRenderer,
  getStraightPath,
  type EdgeProps,
} from '@xyflow/react'
import { memo } from 'react'

// See GraphNodeView for why custom xyflow node/edge components are memoized:
// it avoids recomputing every edge's path and label when an unrelated node
// or edge changes (e.g. while dragging a node elsewhere on the canvas).
export const GraphEdgeView = memo(function GraphEdgeView({
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
  const edgeData = data as
    { weight?: number; status?: 'default' | 'current' | 'path' } | undefined
  const weight = edgeData?.weight ?? 1
  const status = edgeData?.status ?? 'default'

  const stroke =
    status === 'path'
      ? '#34d399'
      : status === 'current'
        ? '#fbbf24'
        : selected
          ? 'var(--color-accent)'
          : 'var(--color-border)'
  const strokeWidth =
    status === 'path' || status === 'current' ? 3 : selected ? 2.5 : 1.5

  return (
    <>
      <BaseEdge
        id={id}
        path={path}
        markerEnd={markerEnd}
        style={{ stroke, strokeWidth }}
      />
      <EdgeLabelRenderer>
        <div
          style={{
            position: 'absolute',
            transform: `translate(-50%, -50%) translate(${labelX}px, ${labelY}px)`,
          }}
          className={`rounded border px-1.5 py-0.5 text-xs ${
            status === 'path'
              ? 'border-emerald-400 text-emerald-400'
              : status === 'current'
                ? 'border-amber-400 text-amber-400'
                : selected
                  ? 'border-accent text-accent'
                  : 'border-border text-text-muted'
          } bg-surface-1`}
        >
          {weight}
        </div>
      </EdgeLabelRenderer>
    </>
  )
})

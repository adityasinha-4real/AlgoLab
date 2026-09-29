import { Handle, Position, type NodeProps } from '@xyflow/react'
import { memo } from 'react'

export type NodeAlgorithmStatus =
  'default' | 'frontier' | 'visited' | 'current' | 'path' | `group-${number}`

export interface GraphNodeData {
  label: string
  isStart: boolean
  isTarget: boolean
  status: NodeAlgorithmStatus
  [key: string]: unknown
}

const STATUS_FILL: Record<
  'default' | 'frontier' | 'visited' | 'current' | 'path',
  string
> = {
  default: 'bg-surface-2',
  frontier: 'bg-amber-400/20',
  visited: 'bg-accent/15',
  current: 'bg-accent text-surface-0',
  path: 'bg-emerald-400 text-surface-0',
}

// Group colors (SCCs, bipartite sides, articulation points) cycle through
// this palette; tailwind needs the class names to appear literally.
const GROUP_FILL = [
  'bg-sky-400/50',
  'bg-rose-400/50',
  'bg-violet-400/50',
  'bg-amber-400/50',
  'bg-teal-400/50',
  'bg-fuchsia-400/50',
]

function fillFor(status: NodeAlgorithmStatus): string {
  if (status.startsWith('group-')) {
    return GROUP_FILL[Number(status.slice(6)) % GROUP_FILL.length]
  }
  return STATUS_FILL[status as keyof typeof STATUS_FILL]
}

// Custom node components re-render whenever xyflow's internal store changes
// (dragging, viewport, selection), even for nodes whose own data didn't
// change. Since a graph can have many nodes rendered at once, memoizing
// avoids re-rendering every node whenever any one of them is dragged.
export const GraphNodeView = memo(function GraphNodeView({
  data,
  selected,
}: NodeProps) {
  const nodeData = data as GraphNodeData
  const ring = nodeData.isStart
    ? 'border-emerald-400'
    : nodeData.isTarget
      ? 'border-rose-400'
      : selected
        ? 'border-accent'
        : 'border-border'

  return (
    <div className="relative flex h-12 w-12 items-center justify-center">
      <Handle
        type="source"
        position={Position.Right}
        isConnectable
        className="!absolute !inset-0 !h-full !w-full !translate-x-0 !translate-y-0 !rounded-full !border-0 !bg-transparent"
      />
      <div
        className={`pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-medium text-text-primary transition-colors ${ring} ${fillFor(nodeData.status)}`}
      >
        {nodeData.label}
      </div>
      {(nodeData.isStart || nodeData.isTarget) && (
        <span className="pointer-events-none absolute -bottom-4 text-[10px] uppercase tracking-wide text-text-muted">
          {nodeData.isStart ? 'start' : 'target'}
        </span>
      )}
    </div>
  )
})

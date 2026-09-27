import { Handle, Position, type NodeProps } from '@xyflow/react'

export type NodeAlgorithmStatus =
  'default' | 'frontier' | 'visited' | 'current' | 'path'

export interface GraphNodeData {
  label: string
  isStart: boolean
  isTarget: boolean
  status: NodeAlgorithmStatus
  [key: string]: unknown
}

const STATUS_FILL: Record<NodeAlgorithmStatus, string> = {
  default: 'bg-surface-2',
  frontier: 'bg-amber-400/20',
  visited: 'bg-accent/15',
  current: 'bg-accent text-surface-0',
  path: 'bg-emerald-400 text-surface-0',
}

export function GraphNodeView({ data, selected }: NodeProps) {
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
        className={`pointer-events-none flex h-12 w-12 items-center justify-center rounded-full border-2 text-sm font-medium text-text-primary transition-colors ${ring} ${STATUS_FILL[nodeData.status]}`}
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
}

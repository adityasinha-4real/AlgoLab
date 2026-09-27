import {
  Background,
  ConnectionMode,
  Controls,
  MarkerType,
  ReactFlow,
  ReactFlowProvider,
  useEdgesState,
  useNodesState,
  useReactFlow,
  type Connection,
  type Edge,
  type Node,
} from '@xyflow/react'
import '@xyflow/react/dist/style.css'
import { useCallback, useEffect, useMemo, type MouseEvent } from 'react'
import type { ExecutionStep } from '../../../core/engine'
import type { Graph } from '../../../core/graph'
import { getCurrentStep, useExecutionStore } from '../../state/executionStore'
import { useGraphStore } from '../../state/graphStore'
import { nodeStatus, pathEdgeIds } from './algorithmOverlay'
import { GraphNodeView, type GraphNodeData } from './GraphNodeView'
import { GraphEdgeView } from './GraphEdgeView'

const nodeTypes = { graphNode: GraphNodeView }
const edgeTypes = { graphEdge: GraphEdgeView }

function toFlowNodes(
  graph: Graph,
  step: ExecutionStep | null,
): Node<GraphNodeData>[] {
  return graph.nodes.map((n) => ({
    id: n.id,
    type: 'graphNode',
    position: { x: n.x, y: n.y },
    data: {
      label: n.label,
      isStart: graph.startNodeId === n.id,
      isTarget: graph.targetNodeId === n.id,
      status: nodeStatus(n.id, step),
    },
  }))
}

function toFlowEdges(graph: Graph, step: ExecutionStep | null): Edge[] {
  const onPath = pathEdgeIds(graph, step)
  return graph.edges.map((e) => ({
    id: e.id,
    source: e.source,
    target: e.target,
    type: 'graphEdge',
    data: {
      weight: e.weight,
      status: onPath.has(e.id)
        ? 'path'
        : step?.state.currentEdgeId === e.id
          ? 'current'
          : 'default',
    },
    markerEnd: e.directed
      ? { type: MarkerType.ArrowClosed, color: 'var(--color-text-muted)' }
      : undefined,
  }))
}

function GraphCanvasInner() {
  const graph = useGraphStore((s) => s.graph)
  const isAddingNode = useGraphStore((s) => s.isAddingNode)
  const addNodeAt = useGraphStore((s) => s.addNodeAt)
  const moveNode = useGraphStore((s) => s.moveNode)
  const connectNodes = useGraphStore((s) => s.connectNodes)
  const deleteNode = useGraphStore((s) => s.deleteNode)
  const deleteEdge = useGraphStore((s) => s.deleteEdge)
  const select = useGraphStore((s) => s.select)
  const { screenToFlowPosition } = useReactFlow()

  const executionResult = useExecutionStore((s) => s.result)
  const cursor = useExecutionStore((s) => s.cursor)
  const step = getCurrentStep({ result: executionResult, cursor })

  const initialNodes = useMemo(() => toFlowNodes(graph, step), [graph, step])
  const initialEdges = useMemo(() => toFlowEdges(graph, step), [graph, step])
  const [nodes, setNodes, onNodesChange] = useNodesState(initialNodes)
  const [edges, setEdges, onEdgesChange] = useEdgesState(initialEdges)

  useEffect(() => {
    setNodes(initialNodes)
  }, [initialNodes, setNodes])

  useEffect(() => {
    setEdges(initialEdges)
  }, [initialEdges, setEdges])

  const handleConnect = useCallback(
    (connection: Connection) => {
      if (connection.source && connection.target) {
        connectNodes(connection.source, connection.target)
      }
    },
    [connectNodes],
  )

  const handleNodeDragStop = useCallback(
    (_: unknown, node: Node) => {
      moveNode(node.id, node.position.x, node.position.y)
    },
    [moveNode],
  )

  const handlePaneClick = useCallback(
    (event: MouseEvent) => {
      if (isAddingNode) {
        const position = screenToFlowPosition({
          x: event.clientX,
          y: event.clientY,
        })
        addNodeAt(position.x, position.y)
      } else {
        select(null)
      }
    },
    [isAddingNode, screenToFlowPosition, addNodeAt, select],
  )

  const handleNodesDelete = useCallback(
    (deleted: Node[]) => {
      for (const node of deleted) deleteNode(node.id)
    },
    [deleteNode],
  )

  const handleEdgesDelete = useCallback(
    (deleted: Edge[]) => {
      for (const edge of deleted) deleteEdge(edge.id)
    },
    [deleteEdge],
  )

  return (
    <div
      className={`h-full min-h-[420px] w-full overflow-hidden rounded-md border border-border bg-surface-1 ${
        isAddingNode ? 'cursor-crosshair' : ''
      }`}
    >
      <ReactFlow
        nodes={nodes}
        edges={edges}
        nodeTypes={nodeTypes}
        edgeTypes={edgeTypes}
        onNodesChange={onNodesChange}
        onEdgesChange={onEdgesChange}
        onConnect={handleConnect}
        onNodeDragStop={handleNodeDragStop}
        onPaneClick={handlePaneClick}
        onNodesDelete={handleNodesDelete}
        onEdgesDelete={handleEdgesDelete}
        onNodeClick={(_, node) => select({ kind: 'node', id: node.id })}
        onEdgeClick={(_, edge) => select({ kind: 'edge', id: edge.id })}
        connectionMode={ConnectionMode.Loose}
        deleteKeyCode={['Delete', 'Backspace']}
        fitView
        proOptions={{ hideAttribution: true }}
      >
        <Background gap={24} color="var(--color-border)" />
        <Controls showInteractive={false} />
      </ReactFlow>
    </div>
  )
}

export function GraphCanvas() {
  return (
    <ReactFlowProvider>
      <GraphCanvasInner />
    </ReactFlowProvider>
  )
}

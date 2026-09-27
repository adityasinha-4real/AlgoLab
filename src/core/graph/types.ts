export type NodeId = string

export interface GraphNode {
  id: NodeId
  label: string
  x: number
  y: number
}

export interface GraphEdge {
  id: string
  source: NodeId
  target: NodeId
  weight: number
  /** Undirected edges are traversable in both directions. */
  directed: boolean
}

export interface Graph {
  nodes: GraphNode[]
  edges: GraphEdge[]
  startNodeId: NodeId | null
  targetNodeId: NodeId | null
}

export interface GraphValidationError {
  code:
    | 'EMPTY_GRAPH'
    | 'MISSING_START'
    | 'MISSING_TARGET'
    | 'START_NOT_FOUND'
    | 'TARGET_NOT_FOUND'
    | 'DISCONNECTED'
    | 'NEGATIVE_WEIGHT_UNSUPPORTED'
    | 'NEGATIVE_CYCLE'
  message: string
}

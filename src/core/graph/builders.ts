import type { Graph, GraphEdge, GraphNode, NodeId } from './types'

export function createEmptyGraph(): Graph {
  return { nodes: [], edges: [], startNodeId: null, targetNodeId: null }
}

export function addNode(graph: Graph, node: GraphNode): Graph {
  if (graph.nodes.some((n) => n.id === node.id)) {
    throw new Error(`Node with id "${node.id}" already exists`)
  }
  return { ...graph, nodes: [...graph.nodes, node] }
}

export function updateNodePosition(
  graph: Graph,
  id: NodeId,
  x: number,
  y: number,
): Graph {
  return {
    ...graph,
    nodes: graph.nodes.map((n) => (n.id === id ? { ...n, x, y } : n)),
  }
}

export function removeNode(graph: Graph, id: NodeId): Graph {
  return {
    ...graph,
    nodes: graph.nodes.filter((n) => n.id !== id),
    edges: graph.edges.filter((e) => e.source !== id && e.target !== id),
    startNodeId: graph.startNodeId === id ? null : graph.startNodeId,
    targetNodeId: graph.targetNodeId === id ? null : graph.targetNodeId,
  }
}

export function addEdge(graph: Graph, edge: GraphEdge): Graph {
  if (graph.edges.some((e) => e.id === edge.id)) {
    throw new Error(`Edge with id "${edge.id}" already exists`)
  }
  const nodeIds = new Set(graph.nodes.map((n) => n.id))
  if (!nodeIds.has(edge.source) || !nodeIds.has(edge.target)) {
    throw new Error(`Edge "${edge.id}" references a node that does not exist`)
  }
  return { ...graph, edges: [...graph.edges, edge] }
}

export function removeEdge(graph: Graph, id: string): Graph {
  return { ...graph, edges: graph.edges.filter((e) => e.id !== id) }
}

export function setStartNode(graph: Graph, id: NodeId | null): Graph {
  return { ...graph, startNodeId: id }
}

export function setTargetNode(graph: Graph, id: NodeId | null): Graph {
  return { ...graph, targetNodeId: id }
}

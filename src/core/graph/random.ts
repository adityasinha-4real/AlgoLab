import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from './builders'
import { generateId, labelForIndex } from './id'
import type { Graph } from './types'

export interface RandomGraphOptions {
  nodeCount: number
  /** Probability (0-1) of adding an extra edge between any given pair, on top of the spanning tree that guarantees connectivity. */
  extraEdgeProbability?: number
  directed?: boolean
  minWeight?: number
  maxWeight?: number
  /** Deterministic seed; same seed + options always produce the same graph. */
  seed?: number
}

/** Mulberry32 PRNG - small, fast, and deterministic for a given seed. */
function mulberry32(seed: number) {
  let a = seed
  return () => {
    a |= 0
    a = (a + 0x6d2b79f5) | 0
    let t = Math.imul(a ^ (a >>> 15), 1 | a)
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296
  }
}

/**
 * Builds a random graph that is always connected: a random spanning tree
 * connects every node first, then extra edges are added probabilistically.
 */
export function generateRandomGraph(options: RandomGraphOptions): Graph {
  const {
    nodeCount,
    extraEdgeProbability = 0.15,
    directed = false,
    minWeight = 1,
    maxWeight = 9,
    seed = Date.now(),
  } = options

  if (nodeCount < 1) {
    throw new Error('nodeCount must be at least 1')
  }

  const rand = mulberry32(seed)
  const randomInt = (min: number, max: number) =>
    Math.floor(rand() * (max - min + 1)) + min

  let graph = createEmptyGraph()

  const cols = Math.max(1, Math.ceil(Math.sqrt(nodeCount)))
  const spacing = 140

  for (let i = 0; i < nodeCount; i++) {
    const col = i % cols
    const row = Math.floor(i / cols)
    graph = addNode(graph, {
      id: generateId('node'),
      label: labelForIndex(i),
      x: col * spacing + randomInt(-15, 15),
      y: row * spacing + randomInt(-15, 15),
    })
  }

  const nodeIds = graph.nodes.map((n) => n.id)
  const connected = new Set<string>([nodeIds[0]])
  const existingPairs = new Set<string>()

  const pairKey = (a: string, b: string) => (a < b ? `${a}|${b}` : `${b}|${a}`)

  const addRandomEdge = (source: string, target: string) => {
    const key = pairKey(source, target)
    if (source === target || existingPairs.has(key)) return
    existingPairs.add(key)
    graph = addEdge(graph, {
      id: generateId('edge'),
      source,
      target,
      weight: randomInt(minWeight, maxWeight),
      directed,
    })
  }

  // Random spanning tree: guarantees every node is reachable.
  for (let i = 1; i < nodeIds.length; i++) {
    const target = nodeIds[i]
    const connectedArray = Array.from(connected)
    const source = connectedArray[randomInt(0, connectedArray.length - 1)]
    addRandomEdge(source, target)
    connected.add(target)
  }

  // Extra edges on top of the spanning tree, for cycles/alternate paths.
  for (let i = 0; i < nodeIds.length; i++) {
    for (let j = i + 1; j < nodeIds.length; j++) {
      if (rand() < extraEdgeProbability) {
        addRandomEdge(nodeIds[i], nodeIds[j])
      }
    }
  }

  graph = setStartNode(graph, nodeIds[0])
  graph = setTargetNode(graph, nodeIds[nodeIds.length - 1])

  return graph
}

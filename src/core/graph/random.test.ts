import { describe, expect, it } from 'vitest'
import { buildAdjacencyList } from './adjacency'
import { generateRandomGraph } from './random'
import type { Graph } from './types'
import { validateGraph } from './validate'

/** Compares edges by node label (index-based, seed-independent) rather than
 * generated id (time-based, differs across calls in the same test run). */
function edgesByLabel(graph: Graph) {
  const labelOf = new Map(graph.nodes.map((n) => [n.id, n.label]))
  return graph.edges
    .map((e) => [labelOf.get(e.source), labelOf.get(e.target), e.weight])
    .sort()
}

describe('generateRandomGraph', () => {
  it('produces the requested number of nodes', () => {
    const graph = generateRandomGraph({ nodeCount: 8, seed: 1 })
    expect(graph.nodes).toHaveLength(8)
  })

  it('is deterministic for a given seed', () => {
    const a = generateRandomGraph({ nodeCount: 10, seed: 42 })
    const b = generateRandomGraph({ nodeCount: 10, seed: 42 })
    expect(edgesByLabel(a)).toEqual(edgesByLabel(b))
  })

  it('produces different graphs for different seeds', () => {
    const a = generateRandomGraph({ nodeCount: 10, seed: 1 })
    const b = generateRandomGraph({ nodeCount: 10, seed: 2 })
    expect(edgesByLabel(a)).not.toEqual(edgesByLabel(b))
  })

  it('always generates a connected graph', () => {
    for (const seed of [1, 2, 3, 4, 5]) {
      const graph = generateRandomGraph({ nodeCount: 12, seed })
      const adjacency = buildAdjacencyList(graph)
      const visited = new Set([graph.nodes[0].id])
      const queue = [graph.nodes[0].id]
      while (queue.length > 0) {
        const current = queue.shift() as string
        for (const { neighbor } of adjacency.get(current) ?? []) {
          if (!visited.has(neighbor)) {
            visited.add(neighbor)
            queue.push(neighbor)
          }
        }
      }
      expect(visited.size).toBe(graph.nodes.length)
    }
  })

  it('assigns a start and target that pass structural validation', () => {
    const graph = generateRandomGraph({ nodeCount: 6, seed: 7 })
    expect(validateGraph(graph)).toEqual([])
  })

  it('never generates a self-loop or duplicate edge between the same pair', () => {
    const graph = generateRandomGraph({
      nodeCount: 15,
      seed: 3,
      extraEdgeProbability: 0.9,
    })
    const seen = new Set<string>()
    for (const e of graph.edges) {
      expect(e.source).not.toBe(e.target)
      const key = [e.source, e.target].sort().join('|')
      expect(seen.has(key)).toBe(false)
      seen.add(key)
    }
  })
})

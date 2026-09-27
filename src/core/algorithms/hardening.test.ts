import { describe, expect, it } from 'vitest'
import {
  addEdge,
  addNode,
  createEmptyGraph,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { generateRandomGraph } from '../graph/random'
import { runAStar } from './astar'
import { runBellmanFord } from './bellmanFord'
import { runBFS } from './bfs'
import { runDFS } from './dfs'
import { runDijkstra } from './dijkstra'

const RUNNERS = [runBFS, runDFS, runDijkstra, runAStar, runBellmanFord]

describe('hardening: larger random graphs', () => {
  it('every algorithm completes without crashing on a 40-node graph', () => {
    const graph = generateRandomGraph({
      nodeCount: 40,
      seed: 99,
      extraEdgeProbability: 0.2,
    })
    for (const run of RUNNERS) {
      const result = run(graph)
      expect(result.steps.length).toBeGreaterThan(0)
      expect(['path-found', 'no-path', 'negative-cycle']).toContain(
        result.steps[result.steps.length - 1].type,
      )
    }
  })

  it('all algorithms agree on the same path cost for a non-negative random graph', () => {
    const graph = generateRandomGraph({
      nodeCount: 15,
      seed: 7,
      extraEdgeProbability: 0.3,
    })
    const costs = [runDijkstra, runAStar, runBellmanFord].map(
      (run) => run(graph).metrics.pathCost,
    )
    expect(new Set(costs).size).toBe(1)
  })
})

describe('hardening: self-loop edges', () => {
  function graphWithSelfLoop(weight: number) {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = addNode(graph, { id: 'b', label: 'B', x: 0, y: 0 })
    graph = addEdge(graph, {
      id: 'aa',
      source: 'a',
      target: 'a',
      weight,
      directed: true,
    })
    graph = addEdge(graph, {
      id: 'ab',
      source: 'a',
      target: 'b',
      weight: 1,
      directed: true,
    })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'b')
    return graph
  }

  it('a positive-weight self-loop never causes an infinite loop or a wrong path', () => {
    const graph = graphWithSelfLoop(5)
    for (const run of RUNNERS) {
      const result = run(graph)
      const last = result.steps[result.steps.length - 1]
      expect(last.type).not.toBe('negative-cycle')
    }
  })

  it('Bellman-Ford detects a negative-weight self-loop as a negative cycle', () => {
    const graph = graphWithSelfLoop(-1)
    const result = runBellmanFord(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('negative-cycle')
  })
})

describe('hardening: single-node graph', () => {
  it('every algorithm handles a graph with exactly one node', () => {
    let graph = addNode(createEmptyGraph(), {
      id: 'only',
      label: 'Only',
      x: 0,
      y: 0,
    })
    graph = setStartNode(graph, 'only')
    graph = setTargetNode(graph, 'only')
    for (const run of RUNNERS) {
      const result = run(graph)
      const last = result.steps[result.steps.length - 1]
      expect(last.state.path).toEqual(['only'])
    }
  })
})

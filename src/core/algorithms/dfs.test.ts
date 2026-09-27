import { describe, expect, it } from 'vitest'
import { GRAPH_PRESETS } from '../graph/presets'
import {
  createEmptyGraph,
  addNode,
  setStartNode,
  setTargetNode,
} from '../graph/builders'
import { runDFS } from './dfs'

describe('runDFS', () => {
  it('throws when start or target is missing', () => {
    expect(() => runDFS(createEmptyGraph())).toThrow(/start and target/)
  })

  it('does not necessarily take the fewest-edges path (unlike BFS)', () => {
    // Stack order here means DFS explores a->b->c instead of the direct
    // a->c edge, demonstrating it gives *a* path, not the shortest one.
    const result = runDFS(GRAPH_PRESETS['triangle-shortcut'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('path-found')
    expect(last.state.path).toEqual(['a', 'b', 'c'])
  })

  it('walks a simple path start to end', () => {
    const result = runDFS(GRAPH_PRESETS['simple-path'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a', 'b', 'c', 'd'])
  })

  it('reports no-path for a disconnected graph', () => {
    const result = runDFS(GRAPH_PRESETS['disconnected-pair'].build())
    const last = result.steps[result.steps.length - 1]
    expect(last.type).toBe('no-path')
    expect(last.state.path).toBeNull()
    expect(last.state.currentNodeId).toBeNull()
    expect(last.state.currentEdgeId).toBeNull()
  })

  it('handles start === target as a trivial single-node path', () => {
    let graph = addNode(createEmptyGraph(), { id: 'a', label: 'A', x: 0, y: 0 })
    graph = setStartNode(graph, 'a')
    graph = setTargetNode(graph, 'a')
    const result = runDFS(graph)
    const last = result.steps[result.steps.length - 1]
    expect(last.state.path).toEqual(['a'])
  })

  it('never emits a step for re-popping an already-visited stack duplicate', () => {
    const result = runDFS(GRAPH_PRESETS['triangle-shortcut'].build())
    const dequeueCount = result.steps.filter((s) => s.type === 'dequeue').length
    // Exactly one dequeue per distinct node actually visited (a, b, c) - the
    // duplicate 'c' push never produces its own dequeue step since the loop
    // breaks as soon as the target is found.
    expect(dequeueCount).toBe(3)
  })

  it('starts with an init step and ends with a terminal step', () => {
    const result = runDFS(GRAPH_PRESETS['simple-path'].build())
    expect(result.steps[0].type).toBe('init')
    expect(['path-found', 'no-path']).toContain(
      result.steps[result.steps.length - 1].type,
    )
    expect(result.algorithmId).toBe('dfs')
  })

  it('is deterministic across repeated runs on the same graph', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    const a = runDFS(graph)
    const b = runDFS(graph)
    const strip = (r: typeof a) =>
      r.steps.map(({ type, pseudocodeLine, explanation, state }) => ({
        type,
        pseudocodeLine,
        explanation,
        state,
      }))
    expect(strip(a)).toEqual(strip(b))
  })
})

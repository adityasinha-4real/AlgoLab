import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runPrim } from './prim'

const last = (result: ReturnType<typeof runPrim>) =>
  result.steps[result.steps.length - 1]

const classic = () =>
  makeGraph({
    nodes: ['a', 'b', 'c', 'd'],
    edges: [
      ['a', 'b', 1],
      ['b', 'c', 2],
      ['a', 'c', 3],
      ['c', 'd', 4],
      ['b', 'd', 5],
    ],
    start: 'a',
  })

describe('runPrim', () => {
  it('throws when the graph has a directed edge', () => {
    expect(() =>
      runPrim(makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, true]] })),
    ).toThrow(/undirected graph/)
  })

  it('builds the minimum spanning tree of a small graph (weight 7)', () => {
    const result = runPrim(classic())
    const final = last(result)
    expect(final.type).toBe('done')
    expect([...(final.state.highlightedEdges ?? [])].sort()).toEqual([
      'ab',
      'bc',
      'cd',
    ])
    expect(final.state.visited).toEqual(['a', 'b', 'c', 'd'])
    expect(final.explanation).toContain('total weight 7')
    expect(final.state.parents).toEqual({ a: null, b: 'a', c: 'b', d: 'c' })
  })

  it('starts from the selected start node', () => {
    const graph = { ...classic(), startNodeId: 'd' }
    const result = runPrim(graph)
    expect(last(result).state.visited[0]).toBe('d')
    expect(last(result).explanation).toContain('total weight 7')
  })

  it('handles negative weights', () => {
    const result = runPrim(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'b', -1],
          ['b', 'c', -2],
          ['a', 'c', 5],
        ],
      }),
    )
    expect(last(result).explanation).toContain('total weight -3')
  })

  it('produces a spanning forest for a disconnected graph', () => {
    const result = runPrim(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1],
          ['c', 'd', 2],
        ],
      }),
    )
    const final = last(result)
    expect([...(final.state.highlightedEdges ?? [])].sort()).toEqual([
      'ab',
      'cd',
    ])
    expect(final.explanation).toMatch(/forest.*2 components/)
  })

  it('handles a single node and an empty graph', () => {
    const single = last(runPrim(makeGraph({ nodes: ['a'] })))
    expect(single.state.highlightedEdges).toBeUndefined()
    expect(single.explanation).toContain('0 edge(s)')
    expect(last(runPrim(makeGraph({ nodes: [] }))).explanation).toMatch(/empty/)
  })

  it('never adds a self-loop to the tree', () => {
    const result = runPrim(
      makeGraph({
        nodes: ['a', 'b'],
        edges: [
          ['a', 'a', 0],
          ['a', 'b', 4],
        ],
        start: 'a',
      }),
    )
    expect(last(result).state.highlightedEdges).toEqual(['ab'])
  })

  it('records a skip when a queued edge becomes a cycle', () => {
    const result = runPrim(classic())
    expect(result.steps.some((s) => s.type === 'skip-edge')).toBe(true)
  })
})

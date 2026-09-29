import { describe, expect, it } from 'vitest'
import { makeGraph } from '../../test/graphs'
import { runTopologicalSort } from './topologicalSort'

const last = (result: ReturnType<typeof runTopologicalSort>) =>
  result.steps[result.steps.length - 1]

describe('runTopologicalSort', () => {
  it('throws when the graph has an undirected edge', () => {
    expect(() =>
      runTopologicalSort(
        makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, false]] }),
      ),
    ).toThrow(/directed graph/)
  })

  it('orders a diamond DAG with prerequisites first', () => {
    const result = runTopologicalSort(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['a', 'b', 1, true],
          ['a', 'c', 1, true],
          ['b', 'd', 1, true],
          ['c', 'd', 1, true],
        ],
      }),
    )
    expect(last(result).type).toBe('done')
    expect(last(result).state.visited).toEqual(['a', 'b', 'c', 'd'])
    expect(last(result).state.distances).toEqual({ a: 0, b: 1, c: 2, d: 3 })
    expect(last(result).explanation).toContain('A → B → C → D')
  })

  it('waits for every prerequisite before releasing a node', () => {
    // c depends on both a and b; queue starts [a, b].
    const result = runTopologicalSort(
      makeGraph({
        nodes: ['a', 'b', 'c'],
        edges: [
          ['a', 'c', 1, true],
          ['b', 'c', 1, true],
        ],
      }),
    )
    expect(last(result).state.visited).toEqual(['a', 'b', 'c'])
    expect(result.steps.some((s) => s.type === 'skip-edge')).toBe(true)
  })

  it('reports a cycle and highlights the stuck nodes', () => {
    // d feeds the cycle a -> b -> c -> a.
    const result = runTopologicalSort(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['d', 'a', 1, true],
          ['a', 'b', 1, true],
          ['b', 'c', 1, true],
          ['c', 'a', 1, true],
        ],
      }),
    )
    const final = last(result)
    expect(final.type).toBe('cycle-found')
    expect(final.explanation).toMatch(/Cycle detected/)
    expect(final.state.visited).toEqual(['d'])
    expect(final.state.nodeGroups).toEqual({ a: 1, b: 1, c: 1 })
  })

  it('treats a directed self-loop as a cycle', () => {
    const result = runTopologicalSort(
      makeGraph({ nodes: ['a'], edges: [['a', 'a', 1, true]] }),
    )
    expect(last(result).type).toBe('cycle-found')
  })

  it('handles a single node and disconnected components', () => {
    expect(
      last(runTopologicalSort(makeGraph({ nodes: ['a'] }))).state.visited,
    ).toEqual(['a'])
    const result = runTopologicalSort(
      makeGraph({
        nodes: ['a', 'b', 'c', 'd'],
        edges: [
          ['b', 'a', 1, true],
          ['d', 'c', 1, true],
        ],
      }),
    )
    expect(last(result).state.visited).toEqual(['b', 'd', 'a', 'c'])
  })

  it('does not mutate earlier snapshots', () => {
    const result = runTopologicalSort(
      makeGraph({ nodes: ['a', 'b'], edges: [['a', 'b', 1, true]] }),
    )
    expect(result.steps[0].state.visited).toEqual([])
    expect(result.steps[0].state.nodeGroups).toBeUndefined()
  })
})

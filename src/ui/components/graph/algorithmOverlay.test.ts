import { describe, expect, it } from 'vitest'
import { runBFS } from '../../../core/algorithms/bfs'
import { GRAPH_PRESETS } from '../../../core/graph/presets'
import { nodeStatus, pathEdgeIds } from './algorithmOverlay'

describe('nodeStatus', () => {
  it('returns default when there is no active step', () => {
    expect(nodeStatus('a', null)).toBe('default')
  })

  it('classifies each node correctly at an intermediate step', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    // Step 0 is 'init': a is enqueued (frontier), nothing visited/current yet.
    expect(nodeStatus('a', result.steps[0])).toBe('frontier')
    expect(nodeStatus('b', result.steps[0])).toBe('default')
  })

  it('marks path nodes once the algorithm finishes, taking priority over other statuses', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    const last = result.steps[result.steps.length - 1]
    for (const id of ['a', 'b', 'c', 'd']) {
      expect(nodeStatus(id, last)).toBe('path')
    }
  })
})

describe('pathEdgeIds', () => {
  it('returns an empty set when there is no path yet', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    expect(
      pathEdgeIds(GRAPH_PRESETS['simple-path'].build(), result.steps[0]).size,
    ).toBe(0)
  })

  it('returns the edge ids along the final reconstructed path', () => {
    const graph = GRAPH_PRESETS['simple-path'].build()
    const result = runBFS(graph)
    const last = result.steps[result.steps.length - 1]
    expect(pathEdgeIds(graph, last)).toEqual(new Set(['ab', 'bc', 'cd']))
  })
})

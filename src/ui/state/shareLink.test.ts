import { beforeEach, describe, expect, it } from 'vitest'
import { useAlgorithmStore } from './algorithmStore'
import { useGraphStore } from './graphStore'
import { useModeStore } from './modeStore'
import {
  buildShareUrl,
  consumeShareUrlIfPresent,
  parseShareUrl,
} from './shareLink'

beforeEach(() => {
  useGraphStore.getState().clear()
  useAlgorithmStore.setState({ selectedAlgorithmId: 'bfs' })
  useModeStore.setState({ mode: 'graph' })
  window.history.replaceState(null, '', '/')
})

describe('shareLink', () => {
  it('round-trips a graph, mode, and algorithm through the URL', () => {
    const graph = {
      nodes: [{ id: 'n1', label: 'A', x: 5, y: 10 }],
      edges: [],
      startNodeId: 'n1',
      targetNodeId: null,
    }
    const url = buildShareUrl({
      graph,
      mode: 'graph',
      selectedAlgorithmId: 'dijkstra',
    })

    const search = new URL(url).search
    const parsed = parseShareUrl(search)
    expect(parsed).toEqual({
      graph,
      mode: 'graph',
      selectedAlgorithmId: 'dijkstra',
    })
  })

  it('returns null when no share param is present', () => {
    expect(parseShareUrl('')).toBeNull()
  })

  it('returns null for a malformed share param', () => {
    expect(parseShareUrl('?s=not-valid-base64url!!!')).toBeNull()
  })

  it('applies a valid share param from the current location and strips it', () => {
    const graph = {
      nodes: [{ id: 'n1', label: 'A', x: 0, y: 0 }],
      edges: [],
      startNodeId: null,
      targetNodeId: null,
    }
    const url = buildShareUrl({
      graph,
      mode: 'grid',
      selectedAlgorithmId: 'astar',
    })
    window.history.replaceState(
      null,
      '',
      new URL(url).pathname + new URL(url).search,
    )

    const applied = consumeShareUrlIfPresent()

    expect(applied).toBe(true)
    expect(useGraphStore.getState().graph).toEqual(graph)
    expect(useAlgorithmStore.getState().selectedAlgorithmId).toBe('astar')
    expect(useModeStore.getState().mode).toBe('grid')
    expect(window.location.search).toBe('')
  })

  it('does nothing when the location has no share param', () => {
    expect(consumeShareUrlIfPresent()).toBe(false)
    expect(useGraphStore.getState().graph.nodes).toHaveLength(0)
  })
})

import { describe, expect, it } from 'vitest'
import { useAlgorithmStore } from './algorithmStore'

describe('algorithmStore', () => {
  it('defaults to bfs', () => {
    expect(useAlgorithmStore.getState().selectedAlgorithmId).toBe('bfs')
  })

  it('updates the selected algorithm', () => {
    useAlgorithmStore.getState().setSelectedAlgorithmId('dijkstra')
    expect(useAlgorithmStore.getState().selectedAlgorithmId).toBe('dijkstra')
  })
})

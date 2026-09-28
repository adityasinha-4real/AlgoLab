import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { useAlgorithmStore } from './algorithmStore'
import { useGraphStore } from './graphStore'
import { useGridStore, DEFAULT_GRID_COLS, DEFAULT_GRID_ROWS } from './gridStore'
import { useModeStore } from './modeStore'
import { restorePersistedState, startPersistingState } from './persistedState'

const STORAGE_KEY = 'algolab:state:v1'

function resetStores() {
  useGraphStore.getState().clear()
  useGridStore.getState().reset()
  useAlgorithmStore.setState({ selectedAlgorithmId: 'bfs' })
  useModeStore.setState({ mode: 'graph' })
}

beforeEach(() => {
  window.localStorage.clear()
  resetStores()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('persistedState', () => {
  it('does nothing when localStorage is empty', () => {
    restorePersistedState()
    expect(useGraphStore.getState().graph.nodes).toHaveLength(0)
  })

  it('ignores corrupted data instead of throwing', () => {
    window.localStorage.setItem(STORAGE_KEY, '{not json')
    expect(() => restorePersistedState()).not.toThrow()

    window.localStorage.setItem(STORAGE_KEY, JSON.stringify({ foo: 'bar' }))
    expect(() => restorePersistedState()).not.toThrow()
    expect(useGraphStore.getState().graph.nodes).toHaveLength(0)
  })

  it('persists store changes (debounced) and restores them', async () => {
    vi.useFakeTimers()
    const stop = startPersistingState()

    useGraphStore.getState().addNodeAt(10, 20)
    useAlgorithmStore.getState().setSelectedAlgorithmId('dijkstra')
    useModeStore.getState().setMode('grid')

    await vi.advanceTimersByTimeAsync(500)
    stop()

    const raw = window.localStorage.getItem(STORAGE_KEY)
    expect(raw).not.toBeNull()

    resetStores()
    restorePersistedState()

    const state = useGraphStore.getState()
    expect(state.graph.nodes).toHaveLength(1)
    expect(state.graph.nodes[0]).toMatchObject({ x: 10, y: 20 })
    expect(useAlgorithmStore.getState().selectedAlgorithmId).toBe('dijkstra')
    expect(useModeStore.getState().mode).toBe('grid')
    expect(useGridStore.getState().grid.rows).toBe(DEFAULT_GRID_ROWS)
    expect(useGridStore.getState().grid.cols).toBe(DEFAULT_GRID_COLS)
  })
})

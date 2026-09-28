import type { AlgorithmId } from '../../core/engine'
import type { Graph } from '../../core/graph'
import type { Grid } from '../../core/grid'
import { useAlgorithmStore } from './algorithmStore'
import { useGraphStore } from './graphStore'
import { useGridStore } from './gridStore'
import { useModeStore, type AppMode } from './modeStore'

const STORAGE_KEY = 'algolab:state:v1'
const PERSIST_DEBOUNCE_MS = 300

interface PersistedState {
  graph: Graph
  grid: Grid
  selectedAlgorithmId: AlgorithmId
  mode: AppMode
}

function isPersistedState(value: unknown): value is PersistedState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  const graph = candidate.graph as Partial<Graph> | undefined
  const grid = candidate.grid as Partial<Grid> | undefined
  return (
    Array.isArray(graph?.nodes) &&
    Array.isArray(graph?.edges) &&
    Array.isArray(grid?.cells) &&
    typeof grid?.rows === 'number' &&
    typeof grid?.cols === 'number' &&
    typeof candidate.selectedAlgorithmId === 'string' &&
    (candidate.mode === 'graph' || candidate.mode === 'grid')
  )
}

function readPersistedState(): PersistedState | null {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY)
    if (!raw) return null
    const parsed: unknown = JSON.parse(raw)
    return isPersistedState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function writePersistedState(state: PersistedState): void {
  try {
    window.localStorage.setItem(STORAGE_KEY, JSON.stringify(state))
  } catch {
    // localStorage can be unavailable (private browsing, quota exceeded);
    // persistence is best-effort and never blocks the app.
  }
}

/** Restores graph/grid/algorithm/mode state from localStorage, if present. Call once before the app mounts. */
export function restorePersistedState(): void {
  const persisted = readPersistedState()
  if (!persisted) return

  useGraphStore.setState({ graph: persisted.graph, selected: null })
  useGridStore.setState({ grid: persisted.grid })
  useAlgorithmStore.setState({
    selectedAlgorithmId: persisted.selectedAlgorithmId,
  })
  useModeStore.setState({ mode: persisted.mode })
}

/** Subscribes to store changes and persists them (debounced). Returns an unsubscribe function. */
export function startPersistingState(): () => void {
  let timeout: ReturnType<typeof setTimeout> | undefined

  const persist = () => {
    if (timeout !== undefined) clearTimeout(timeout)
    timeout = setTimeout(() => {
      writePersistedState({
        graph: useGraphStore.getState().graph,
        grid: useGridStore.getState().grid,
        selectedAlgorithmId: useAlgorithmStore.getState().selectedAlgorithmId,
        mode: useModeStore.getState().mode,
      })
    }, PERSIST_DEBOUNCE_MS)
  }

  const unsubscribers = [
    useGraphStore.subscribe(persist),
    useGridStore.subscribe(persist),
    useAlgorithmStore.subscribe(persist),
    useModeStore.subscribe(persist),
  ]

  return () => {
    if (timeout !== undefined) clearTimeout(timeout)
    unsubscribers.forEach((unsubscribe) => unsubscribe())
  }
}

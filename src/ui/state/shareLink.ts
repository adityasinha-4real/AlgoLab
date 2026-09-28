import type { AlgorithmId } from '../../core/engine'
import type { Graph } from '../../core/graph'
import { useAlgorithmStore } from './algorithmStore'
import { useGraphStore } from './graphStore'
import { useModeStore, type AppMode } from './modeStore'

const SHARE_PARAM = 's'

export interface ShareableState {
  graph: Graph
  mode: AppMode
  selectedAlgorithmId: AlgorithmId
}

function isShareableState(value: unknown): value is ShareableState {
  if (typeof value !== 'object' || value === null) return false
  const candidate = value as Record<string, unknown>
  const graph = candidate.graph as Partial<Graph> | undefined
  return (
    Array.isArray(graph?.nodes) &&
    Array.isArray(graph?.edges) &&
    typeof candidate.selectedAlgorithmId === 'string' &&
    (candidate.mode === 'graph' || candidate.mode === 'grid')
  )
}

function toBase64Url(json: string): string {
  const bytes = new TextEncoder().encode(json)
  let binary = ''
  bytes.forEach((byte) => {
    binary += String.fromCharCode(byte)
  })
  return btoa(binary).replace(/\+/g, '-').replace(/\//g, '_').replace(/=+$/, '')
}

function fromBase64Url(value: string): string {
  const padded = value.replace(/-/g, '+').replace(/_/g, '/')
  const base64 = padded.padEnd(
    padded.length + ((4 - (padded.length % 4)) % 4),
    '=',
  )
  const binary = atob(base64)
  const bytes = Uint8Array.from(binary, (char) => char.charCodeAt(0))
  return new TextDecoder().decode(bytes)
}

/** Builds a shareable URL encoding the current graph, mode, and selected algorithm. */
export function buildShareUrl(state: ShareableState): string {
  const encoded = toBase64Url(JSON.stringify(state))
  const url = new URL(window.location.href)
  url.search = ''
  url.searchParams.set(SHARE_PARAM, encoded)
  return url.toString()
}

/** Reads and decodes the `s` query param from the given search string, if present and valid. */
export function parseShareUrl(search: string): ShareableState | null {
  const params = new URLSearchParams(search)
  const encoded = params.get(SHARE_PARAM)
  if (!encoded) return null

  try {
    const parsed: unknown = JSON.parse(fromBase64Url(encoded))
    return isShareableState(parsed) ? parsed : null
  } catch {
    return null
  }
}

function applyShareableState(state: ShareableState): void {
  useGraphStore.setState({ graph: state.graph, selected: null })
  useAlgorithmStore.setState({ selectedAlgorithmId: state.selectedAlgorithmId })
  useModeStore.setState({ mode: state.mode })
}

/**
 * If the current URL carries a valid share payload, applies it to the stores
 * and strips the query param (so later edits don't leave a stale link in the
 * address bar). Returns true if a share payload was applied.
 */
export function consumeShareUrlIfPresent(): boolean {
  const state = parseShareUrl(window.location.search)
  if (!state) return false

  applyShareableState(state)
  const url = new URL(window.location.href)
  url.search = ''
  window.history.replaceState(null, '', url.toString())
  return true
}

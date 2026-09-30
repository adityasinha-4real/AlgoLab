/** Line numbers here are load-bearing: algorithms/floydWarshall.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const FLOYD_WARSHALL_PSEUDOCODE: readonly string[] = [
  'FloydWarshall(graph):',
  '  dist[i][j] ← edge weight (0 on the diagonal, ∞ when there is no edge)',
  '  for each intermediate node k:',
  '    for each pair (i, j):',
  '      if dist[i][k] + dist[k][j] < dist[i][j]: dist[i][j] ← dist[i][k] + dist[k][j]',
  '  if any dist[i][i] < 0: return "negative cycle"',
  '  return dist  // shortest distance between every pair',
]

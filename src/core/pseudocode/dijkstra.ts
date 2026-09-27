/** Line numbers here are load-bearing: algorithms/dijkstra.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const DIJKSTRA_PSEUDOCODE: readonly string[] = [
  'Dijkstra(graph, start, target):',
  '  distance[start] ← 0; push(pq, start, 0)',
  '  while pq is not empty:',
  '    current ← pop-min(pq); if finalized(current): continue; else mark finalized(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor, weight):',
  '      newDist ← distance[current] + weight',
  '      if newDist < distance[neighbor]:',
  '        distance[neighbor] ← newDist; parent[neighbor] ← current; push(pq, neighbor, newDist)',
  '  return "no path"',
]

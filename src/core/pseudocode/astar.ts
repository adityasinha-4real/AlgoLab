/** Line numbers here are load-bearing: algorithms/astar.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const ASTAR_PSEUDOCODE: readonly string[] = [
  'AStar(graph, start, target, h):',
  '  g[start] ← 0; f[start] ← h(start); push(pq, start, f[start])',
  '  while pq is not empty:',
  '    current ← pop-min(pq); if finalized(current): continue; else mark finalized(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor, weight):',
  '      tentativeG ← g[current] + weight',
  '      if tentativeG < g[neighbor]:',
  '        g[neighbor] ← tentativeG; f[neighbor] ← tentativeG + h(neighbor)',
  '        parent[neighbor] ← current; push(pq, neighbor, f[neighbor])',
  '  return "no path"',
]

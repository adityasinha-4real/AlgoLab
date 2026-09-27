/** Line numbers here are load-bearing: algorithms/astarGrid.ts's step
 * recorder calls reference these exact line numbers for pseudocode
 * highlighting. */
export const ASTAR_GRID_PSEUDOCODE: readonly string[] = [
  'AStarGrid(grid, start, target):',
  '  g[start] ← 0; f[start] ← manhattan(start, target); push(pq, start, f[start])',
  '  while pq is not empty:',
  '    current ← pop-min(pq); if closed(current): continue; else close(current)',
  '    if current == target: reconstruct path; return',
  '    for each open orthogonal neighbor (no walls, no diagonals):',
  '      tentativeG ← g[current] + neighbor.terrainCost',
  '      if tentativeG < g[neighbor]:',
  '        g[neighbor] ← tentativeG; f[neighbor] ← tentativeG + manhattan(neighbor, target)',
  '        parent[neighbor] ← current; push(pq, neighbor, f[neighbor])',
  '  return "no path"',
]

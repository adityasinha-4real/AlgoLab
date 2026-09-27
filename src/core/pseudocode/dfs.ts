/** Line numbers here are load-bearing: algorithms/dfs.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const DFS_PSEUDOCODE: readonly string[] = [
  'DFS(graph, start, target):',
  '  stack ← [start]; parent[start] ← null',
  '  while stack is not empty:',
  '    current ← pop(stack); if visited(current): continue; else mark visited(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor):',
  '      if neighbor visited: skip',
  '      else: parent[neighbor] ← current; push(stack, neighbor)',
  '  return "no path"',
]

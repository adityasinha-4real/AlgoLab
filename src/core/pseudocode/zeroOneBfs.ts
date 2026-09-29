/** Line numbers here are load-bearing: algorithms/zeroOneBfs.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const ZERO_ONE_BFS_PSEUDOCODE: readonly string[] = [
  'ZeroOneBFS(graph, start, target):',
  '  distance[start] ← 0; deque ← [start]',
  '  while deque is not empty:',
  '    current ← pop-front(deque); if finalized(current): continue; else mark finalized(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor, weight ∈ {0, 1}):',
  '      newDist ← distance[current] + weight',
  '      if newDist < distance[neighbor]:',
  '        distance[neighbor] ← newDist; parent[neighbor] ← current; weight 0: push-front, weight 1: push-back',
  '  return "no path"',
]

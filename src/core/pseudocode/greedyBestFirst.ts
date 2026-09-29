/** Line numbers here are load-bearing: algorithms/greedyBestFirst.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const GREEDY_BEST_FIRST_PSEUDOCODE: readonly string[] = [
  'GreedyBestFirst(graph, start, target):',
  '  push(pq, start, h(start))',
  '  while pq is not empty:',
  '    current ← pop-min-h(pq); mark visited(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor, weight):',
  '      if neighbor already discovered: continue',
  '      parent[neighbor] ← current; push(pq, neighbor, h(neighbor))',
  '  return "no path"',
]

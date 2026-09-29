/** Line numbers here are load-bearing: algorithms/bipartiteCheck.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const BIPARTITE_CHECK_PSEUDOCODE: readonly string[] = [
  'CheckBipartite(graph):  // edge direction is ignored',
  '  for each uncolored node s: color[s] ← 0; enqueue(s)',
  '  while queue is not empty:',
  '    current ← dequeue(queue); mark visited(current)',
  '    for each edge (current, neighbor):',
  '      if neighbor is uncolored: color[neighbor] ← 1 - color[current]; enqueue(neighbor)',
  '      else if color[neighbor] == color[current]: return "not bipartite"  // odd cycle',
  '  return "bipartite" with the two color classes',
]

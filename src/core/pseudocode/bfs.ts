/** Line numbers here are load-bearing: algorithms/bfs.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const BFS_PSEUDOCODE: readonly string[] = [
  'BFS(graph, start, target):',
  '  queue ← [start]; distance[start] ← 0; parent[start] ← null',
  '  while queue is not empty:',
  '    current ← dequeue(queue); mark visited(current)',
  '    if current == target: reconstruct path; return',
  '    for each neighbor via edge(current, neighbor):',
  '      if neighbor not discovered:',
  '        distance[neighbor] ← distance[current] + 1; parent[neighbor] ← current; enqueue(queue, neighbor)',
  '  return "no path"',
]

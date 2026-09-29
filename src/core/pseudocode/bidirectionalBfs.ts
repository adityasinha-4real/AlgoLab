/** Line numbers here are load-bearing: algorithms/bidirectionalBfs.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const BIDIRECTIONAL_BFS_PSEUDOCODE: readonly string[] = [
  'BidirectionalBFS(graph, start, target):',
  '  queueF ← [start]; queueB ← [target]; each side remembers what it discovered',
  '  while neither queue is empty and no meeting found:',
  "    side ← the side with the smaller queue; for each node in that side's current level:",
  '      current ← dequeue(side); mark visited(current)',
  '      for each neighbor via edge(current, neighbor)  (edges reversed for the backward side):',
  '        if neighbor was discovered by the other side: record meeting',
  '        else if neighbor is new: parent[neighbor] ← current; enqueue(side, neighbor)',
  '    if a meeting was recorded: join both halves into the path; return',
  '  return "no path"',
]

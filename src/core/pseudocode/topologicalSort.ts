/** Line numbers here are load-bearing: algorithms/topologicalSort.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const TOPOLOGICAL_SORT_PSEUDOCODE: readonly string[] = [
  'TopologicalSort(graph):  // Kahn',
  '  indegree[v] ← number of incoming edges; queue ← every v with indegree 0',
  '  while queue is not empty:',
  '    current ← dequeue(queue); append current to order',
  '    for each edge(current, neighbor):',
  '      indegree[neighbor] ← indegree[neighbor] - 1',
  '      if indegree[neighbor] == 0: enqueue(queue, neighbor)',
  '  if order contains every node: return order',
  '  else: return "cycle detected"',
]

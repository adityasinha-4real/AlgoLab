/** Line numbers here are load-bearing: algorithms/kruskal.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const KRUSKAL_PSEUDOCODE: readonly string[] = [
  'Kruskal(graph):',
  '  sort edges by weight ascending; every node starts in its own set',
  '  for each edge (u, v, weight) in sorted order:',
  '    if find(u) == find(v): skip  // would form a cycle',
  '    else: add edge to the MST; union(u, v)',
  '    if the MST has V - 1 edges: stop',
  '  return MST edges  // a spanning forest if the graph is disconnected',
]

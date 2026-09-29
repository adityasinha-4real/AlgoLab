/** Line numbers here are load-bearing: algorithms/prim.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const PRIM_PSEUDOCODE: readonly string[] = [
  'Prim(graph, start):',
  '  inTree ← {start}; push every edge of start into pq',
  '  while pq is not empty:',
  '    (u, v, weight) ← pop-min(pq)',
  '    if v is already in the tree: continue',
  '    add edge (u, v) to the MST; add v to the tree',
  '    push every edge from v to a node outside the tree into pq',
  '  return MST edges  // a spanning forest if the graph is disconnected',
]

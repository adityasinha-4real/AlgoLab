/** Line numbers here are load-bearing: algorithms/kosarajuScc.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const KOSARAJU_SCC_PSEUDOCODE: readonly string[] = [
  'Kosaraju(graph):',
  '  pass 1: DFS over graph; record each node when it finishes (finish order)',
  '  transpose: reverse the direction of every edge',
  '  pass 2: for each node u in reverse finish order:',
  '    if u is unassigned: DFS from u in the transposed graph',
  '    every node reached is unassigned and forms one SCC with u',
  '  return all SCCs',
]

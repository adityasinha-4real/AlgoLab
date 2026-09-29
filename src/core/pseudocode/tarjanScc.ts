/** Line numbers here are load-bearing: algorithms/tarjanScc.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const TARJAN_SCC_PSEUDOCODE: readonly string[] = [
  'Tarjan(graph):',
  '  for each node v not yet discovered: strongconnect(v)',
  'strongconnect(v):',
  '  index[v] ← low[v] ← next index; push v onto the stack',
  '  for each edge (v, w):',
  '    if w is undiscovered: strongconnect(w); low[v] ← min(low[v], low[w])',
  '    else if w is on the stack: low[v] ← min(low[v], index[w])',
  '  if low[v] == index[v]: pop the stack down to v - that is one SCC',
  '  return all SCCs',
]

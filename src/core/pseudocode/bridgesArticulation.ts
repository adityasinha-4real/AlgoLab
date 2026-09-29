/** Line numbers here are load-bearing: algorithms/bridgesArticulation.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const BRIDGES_ARTICULATION_PSEUDOCODE: readonly string[] = [
  'BridgesAndArticulationPoints(graph):',
  '  for each node v not yet discovered: dfs(v, parentEdge = none)',
  'dfs(v, parentEdge):',
  '  disc[v] ← low[v] ← next index; children ← 0',
  '  for each edge e = (v, w) other than parentEdge:',
  '    if w is undiscovered: dfs(w, e); low[v] ← min(low[v], low[w]); children ← children + 1',
  '    else: low[v] ← min(low[v], disc[w])  // back edge',
  '    if low[w] > disc[v]: edge e is a bridge',
  '    if low[w] ≥ disc[v] and v is not the root: v is an articulation point',
  '  if v is the root and children > 1: v is an articulation point',
  '  return the bridges and articulation points',
]

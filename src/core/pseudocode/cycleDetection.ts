/** Line numbers here are load-bearing: algorithms/cycleDetection.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const CYCLE_DETECTION_PSEUDOCODE: readonly string[] = [
  'DetectCycle(graph):',
  '  color every node white; for each white node v: dfs(v, parentEdge = none)',
  'dfs(v, parentEdge):',
  '  color[v] ← gray  // v is on the current path',
  '  for each edge e = (v, w) usable from v, other than parentEdge:',
  '    if color[w] == gray: cycle found - the path from w down to v, closed by e; return',
  '    if color[w] == white: dfs(w, e)  // black nodes are finished - skip them',
  '  color[v] ← black',
  '  return "no cycle"',
]

/** Line numbers here are load-bearing: algorithms/bellmanFord.ts's step
 * recorder calls reference these exact line numbers for pseudocode
 * highlighting. */
export const BELLMAN_FORD_PSEUDOCODE: readonly string[] = [
  'BellmanFord(graph, start, target):',
  '  distance[start] ← 0',
  '  for pass in 1..V-1:',
  '    for each directed edge (u, v, weight) in graph:',
  '      if distance[u] is defined and distance[u] + weight < distance[v]:',
  '        distance[v] ← distance[u] + weight; parent[v] ← u',
  '  for each directed edge (u, v, weight) in graph:',
  '    if distance[u] is defined and distance[u] + weight < distance[v]:',
  '      report negative-weight cycle; return',
  '  if distance[target] is defined: reconstruct path; return',
  '  return "no path"',
]

/** Line numbers here are load-bearing: algorithms/boruvka.ts's step recorder
 * calls reference these exact line numbers for pseudocode highlighting. */
export const BORUVKA_PSEUDOCODE: readonly string[] = [
  'Boruvka(graph):',
  '  every node starts as its own component',
  '  while some component still has an outgoing edge:  // one round',
  '    for each component: pick its cheapest outgoing edge (ties by edge order)',
  '    add every picked edge to the MST; merge the components they join',
  '  return MST edges  // a spanning forest if the graph is disconnected',
]

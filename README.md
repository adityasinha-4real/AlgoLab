# AlgoLab

An interactive algorithm laboratory for exploring BFS, DFS, Dijkstra, A\*, and
Bellman-Ford step by step — with reversible execution, live state inspection,
synchronized pseudocode, and deterministic explanations. No backend, no LLM.

## Architecture

Algorithm logic is completely independent from React:

```
Graph Input -> Algorithm Engine -> Execution Steps[] -> Timeline Cursor -> UI
```

```
src/
  core/          # Pure TypeScript — zero React/DOM dependencies
    graph/       # Graph model: nodes, edges, adjacency, validation
    engine/      # ExecutionStep / AlgorithmState / AlgorithmMetadata contracts
    algorithms/  # Algorithm implementations + metadata (BFS/DFS/Dijkstra/A*/Bellman-Ford)
  ui/
    components/  # React components (graph canvas, controls, timeline, inspectors)
```

Every algorithm run precomputes its full sequence of `ExecutionStep` snapshots
up front. Stepping backward through execution moves a cursor into that array —
it never re-runs the algorithm or fakes state — so navigation in either
direction is always exact.

An ESLint import-boundary rule enforces that `src/core` never imports from
`src/ui`, React, or the DOM.

## Development

```bash
npm install
npm run dev        # start the dev server
npm run test        # run the test suite
npm run lint         # lint
npm run typecheck     # type-check
npm run build          # production build
npm run format:check    # check Prettier formatting
```

## Status

Currently in **M1 — Foundation**: project tooling, the core domain model
(`Graph`, `GraphNode`, `GraphEdge`, `AlgorithmState`, `ExecutionStep`,
`AlgorithmMetadata`), and the application shell. No algorithms are implemented
yet — see the project milestones for the full roadmap.

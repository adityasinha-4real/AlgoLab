# AlgoLab

**Live demo: [algo-lab-chi.vercel.app](https://algo-lab-chi.vercel.app/)**

An interactive algorithm laboratory for constructing graphs and grids and
executing 15 graph algorithms step by step while inspecting their internal
state — reversible execution, live state inspection, synchronized
pseudocode, deterministic explanations, and algorithm comparison. No
backend, no LLM, no paid APIs.

## Features

- **Interactive graph editor** — create/drag/delete nodes, directed or
  undirected weighted edges, start/target selection, random graph
  generation, and preset graphs covering common demo and error cases.
- **A\* grid mode** — a separate paintable grid with walls, per-cell terrain
  cost (1–3), and A\* using a Manhattan-distance heuristic.
- **15 algorithms** across pathfinding, spanning trees, and structural graph
  analysis (see the reference below).
- **Reversible execution** — play/pause, step forward/backward, jump to
  start/end, speed control, and a clickable/keyboard-operable timeline.
  Every run precomputes its full sequence of steps up front; stepping
  backward moves a cursor into that array — it never re-runs the algorithm.
- **Live state inspection** — visited set, frontier (queue/stack/priority
  queue/deque/relaxation pass, labeled per algorithm), distances, A\*'s h/f
  values, parent pointers, current node/edge, and the final result (path,
  tree, components, cycle, ...), all reflected on the canvas as color-coded
  highlighting.
- **Synchronized pseudocode** with the currently executing line highlighted.
- **Deterministic per-step explanations** — a plain-English sentence
  generated for every step, with no LLM involved.
- **Algorithm comparison** — run algorithms on the same graph and compare
  nodes visited, edges examined, steps, path length, path cost, and
  execution time in one table.
- **Shareable links and persistence** — the current graph, mode, and
  selected algorithm can be encoded into a share URL, and your work is
  restored from local storage on reload.
- **Error handling** — empty/disconnected graphs, missing start/target,
  negative weights rejected by algorithms that can't handle them with a
  clear message, negative-weight cycles detected by Bellman-Ford, and a
  top-level error boundary.

## Algorithm reference

### Pathfinding and traversal

| Algorithm                | Time             | Space | Negative weights | Shortest path guarantee             |
| ------------------------ | ---------------- | ----- | ---------------- | ----------------------------------- |
| BFS                      | O(V + E)         | O(V)  | No               | Fewest edges (unweighted graphs)    |
| DFS                      | O(V + E)         | O(V)  | No               | None                                |
| Bidirectional BFS        | O(V + E)         | O(V)  | No               | Fewest edges, exploring fewer nodes |
| 0-1 BFS                  | O(V + E)         | O(V)  | No               | Yes, when every edge weighs 0 or 1  |
| Dijkstra                 | O((V + E) log V) | O(V)  | No (rejected)    | Yes, on non-negative weights        |
| A\*                      | O(E)             | O(V)  | No (rejected)    | Yes, with an admissible heuristic   |
| Greedy Best-First Search | O(E log V)       | O(V)  | No               | None (heuristic only, ignores cost) |
| Bellman-Ford             | O(V · E)         | O(V)  | Yes              | Yes, and detects negative cycles    |

### Spanning trees, ordering, and graph structure

| Algorithm                     | Time       | Space    | What it finds                                              |
| ----------------------------- | ---------- | -------- | ---------------------------------------------------------- |
| Prim's MST                    | O(E log V) | O(V + E) | Minimum spanning tree grown from one node (undirected)     |
| Kruskal's MST                 | O(E log E) | O(V)     | Minimum spanning tree by cheapest edges first (undirected) |
| Topological Sort (Kahn)       | O(V + E)   | O(V)     | Node ordering of a DAG, or reports a cycle                 |
| Tarjan's SCC                  | O(V + E)   | O(V)     | Strongly connected components of a directed graph          |
| Bridges & Articulation Points | O(V + E)   | O(V)     | Edges/nodes whose removal disconnects an undirected graph  |
| Cycle Detection               | O(V + E)   | O(V)     | First cycle found (directed, undirected, or mixed)         |
| Bipartite Check               | O(V + E)   | O(V)     | A 2-coloring, or an odd cycle proving none exists          |

A\*'s heuristic is provably admissible in both modes: grid mode uses the
Manhattan distance (unconditionally admissible for a uniform 4-directional
grid), and free-form graph mode scales the Euclidean distance between node
positions by the minimum (weight ÷ pixel-distance) ratio across all edges —
see the doc comment in `src/core/algorithms/heuristics.ts` for the proof.

## Architecture

Algorithm logic is completely independent from React:

```
Graph/Grid Input -> Algorithm Engine -> Execution Steps[] -> Timeline Cursor -> UI
```

```
src/
  core/                # Pure TypeScript — zero React/DOM dependencies
    graph/             # Graph model: nodes, edges, adjacency, validation, presets, random generation
    grid/              # Grid model for A* grid mode: walls, terrain cost, 4-directional neighbors
    engine/            # ExecutionStep / AlgorithmState / AlgorithmMetadata contracts, StepRecorder, metrics, path reconstruction
    algorithms/        # BFS, DFS, Dijkstra, A* (graph + grid), Bellman-Ford, priority queue, heuristics, comparison
    pseudocode/        # Line-numbered pseudocode per algorithm, referenced by each step's pseudocodeLine
  ui/
    components/        # React components: graph/grid canvases, controls, timeline, inspectors, comparison
    state/             # zustand stores (graph, grid, execution, algorithm selection, mode, comparison), persistence, share links
    hooks/             # Playback timer, cross-store reset on graph change
```

Every algorithm run precomputes its full sequence of `ExecutionStep`
snapshots up front via `StepRecorder`, which deep-clones each snapshot so
later mutations can never corrupt a previously recorded step. Stepping
backward through execution moves a cursor into that array — it never
re-runs the algorithm or fakes state — so navigation in either direction is
always exact and instant.

An ESLint import-boundary rule enforces that `src/core` never imports from
`src/ui`, React, or the DOM.

## Development

```bash
npm install
npm run dev              # start the dev server
npm run test             # run the unit/component test suite
npm run test:coverage    # run tests with coverage thresholds
npm run test:e2e         # run the Playwright smoke test
npm run lint             # lint
npm run typecheck        # type-check
npm run build            # production build
npm run format:check     # check Prettier formatting
```

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, test
coverage (80% lines/statements/functions, 75% branches), and build on every
push and pull request, plus a Playwright end-to-end job.

## Status

v1.0 shipped with five algorithms; the project has since grown to 15, each
with its own pseudocode, step explanations, and tests. Work in progress is
tracked in [CHANGELOG.md](CHANGELOG.md).

## License

[MIT](LICENSE)

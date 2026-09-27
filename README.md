# AlgoLab

**Live demo: [algo-lab-chi.vercel.app](https://algo-lab-chi.vercel.app/)**

An interactive algorithm laboratory for constructing graphs and grids and
executing BFS, DFS, Dijkstra, A\*, and Bellman-Ford step by step while
inspecting their internal state — reversible execution, live state
inspection, synchronized pseudocode, deterministic explanations, and
algorithm comparison. No backend, no LLM, no paid APIs.

## Features

- **Interactive graph editor** — create/drag/delete nodes, directed or
  undirected weighted edges, start/target selection, random graph
  generation, and four preset graphs covering common demo and error cases.
- **A\* grid mode** — a separate paintable grid with walls, per-cell terrain
  cost (1–3), and A\* using a Manhattan-distance heuristic.
- **Reversible execution** — play/pause, step forward/backward, jump to
  start/end, speed control, and a clickable/keyboard-operable timeline.
  Every run precomputes its full sequence of steps up front; stepping
  backward moves a cursor into that array — it never re-runs the algorithm.
- **Live state inspection** — visited set, frontier (queue/stack/priority
  queue/relaxation pass, labeled per algorithm), distances, A\*'s h/f
  values, parent pointers, current node/edge, and the final path, all
  reflected on the canvas as color-coded highlighting.
- **Synchronized pseudocode** with the currently executing line highlighted.
- **Deterministic per-step explanations** — a plain-English sentence
  generated for every step, with no LLM involved.
- **Algorithm comparison** — run every algorithm on the same graph and
  compare nodes visited, edges examined, steps, path length, path cost, and
  execution time in one table.
- **Error handling** — empty/disconnected graphs, missing start/target,
  negative weights rejected by Dijkstra/A\* with a clear message, and
  negative-weight cycles detected and reported by Bellman-Ford.

## Algorithm reference

| Algorithm    | Time             | Space | Negative weights | Shortest path guarantee           |
| ------------ | ---------------- | ----- | ---------------- | --------------------------------- |
| BFS          | O(V + E)         | O(V)  | No               | Fewest edges (unweighted graphs)  |
| DFS          | O(V + E)         | O(V)  | No               | None                              |
| Dijkstra     | O((V + E) log V) | O(V)  | No (rejected)    | Yes, on non-negative weights      |
| A\*          | O(E)             | O(V)  | No (rejected)    | Yes, with an admissible heuristic |
| Bellman-Ford | O(V · E)         | O(V)  | Yes              | Yes, and detects negative cycles  |

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
    state/             # zustand stores (graph, grid, execution, algorithm selection, mode, comparison)
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
npm run dev            # start the dev server
npm run test            # run the test suite
npm run lint             # lint
npm run typecheck         # type-check
npm run build              # production build
npm run format:check        # check Prettier formatting
```

CI (`.github/workflows/ci.yml`) runs format check, lint, typecheck, test,
and build on every push and pull request.

## Status

All 15 milestones complete — v1.0. All five algorithms are implemented,
verified with unit/component tests and live interactive checks in a
headless browser, including their characteristic differences from each
other (e.g. BFS ignoring edge weight vs. Dijkstra optimizing for it, or
Bellman-Ford's higher edge-examination cost visible directly in the
comparison table).

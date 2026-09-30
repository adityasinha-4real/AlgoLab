# Changelog

All notable changes to AlgoLab are documented in this file. The format is
based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/).

## [Unreleased] - M16

Hardening and polish pass ahead of a public v1.1 release: strict TypeScript,
resilience (error boundary), persistence, test coverage gating, an E2E smoke
test, and a UI performance pass.

### Added

- **Kosaraju's SCC** - two-pass strongly connected components, cross-checked
  against Tarjan's SCC.
- **Borůvka's MST** - round-based minimum spanning tree, verified against
  Kruskal's MST weight.
- **Floyd-Warshall** - all-pairs shortest paths with negative-cycle
  detection, plus a distance-matrix table in the state inspector.

## [1.0.0] - 2026-09-27

Initial public release. Built up through fifteen milestones:

- **M1 - Foundation**: tooling, core domain model, app shell.
- **M2 - Graph editor**: interactive canvas, presets, random graph
  generation.
- **M3 - Execution engine**: step recording, playback, reversible timeline.
- **M4 - BFS + DFS**: first real algorithms, pseudocode panel, live graph
  highlighting.
- **M5 - Dijkstra's algorithm**: shortest-path support, plus a fix for stale
  execution results on graph swap.
- **M6 - A\* search**: provably admissible heuristic for free-form graphs.
- **M7 - Bellman-Ford**: final core algorithm, completing all five.
- **M8/M9 - Relaxation pass display and complexity panel**.
- **M10 - A\* grid mode**: walls, terrain cost, unconditionally admissible
  grid heuristic.
- **M11 - Algorithm comparison**: run and compare multiple algorithms
  side by side.
- **M12 - Hardening**: stress tests, self-loops, single-node graph edge
  cases.
- **M13 - UX/accessibility**: keyboard-operable timeline, ARIA live region,
  focus states.
- **M14 - Documentation**: full feature list, architecture notes, algorithm
  reference.
- **M15 - v1.0.0 release**: repository metadata, live Vercel demo.

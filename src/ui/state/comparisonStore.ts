import { create } from 'zustand'
import {
  compareAlgorithms,
  type ComparisonEntry,
} from '../../core/algorithms/compare'
import type { Graph } from '../../core/graph'

interface ComparisonStoreState {
  entries: ComparisonEntry[] | null
  run: (graph: Graph) => void
  clear: () => void
}

export const useComparisonStore = create<ComparisonStoreState>((set) => ({
  entries: null,
  run: (graph) => set({ entries: compareAlgorithms(graph) }),
  clear: () => set({ entries: null }),
}))

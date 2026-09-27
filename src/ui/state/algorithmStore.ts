import { create } from 'zustand'
import type { AlgorithmId } from '../../core/engine'

interface AlgorithmStoreState {
  selectedAlgorithmId: AlgorithmId
  setSelectedAlgorithmId: (id: AlgorithmId) => void
}

export const useAlgorithmStore = create<AlgorithmStoreState>((set) => ({
  selectedAlgorithmId: 'bfs',
  setSelectedAlgorithmId: (id) => set({ selectedAlgorithmId: id }),
}))

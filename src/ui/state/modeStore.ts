import { create } from 'zustand'

export type AppMode = 'graph' | 'grid'

interface ModeStoreState {
  mode: AppMode
  setMode: (mode: AppMode) => void
}

export const useModeStore = create<ModeStoreState>((set) => ({
  mode: 'graph',
  setMode: (mode) => set({ mode }),
}))

import { create } from 'zustand'
import type { ExecutionResult, ExecutionStep } from '../../core/engine'

/** Speed is a 1-5 dial; higher is faster. Maps to a per-step delay in ms. */
export const MIN_SPEED = 1
export const MAX_SPEED = 5
const SPEED_DELAYS_MS = [1000, 650, 400, 220, 100]

export function speedToDelayMs(speed: number): number {
  const clamped = Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed))
  return SPEED_DELAYS_MS[clamped - 1]
}

interface ExecutionStoreState {
  result: ExecutionResult | null
  cursor: number
  isPlaying: boolean
  speed: number

  load: (result: ExecutionResult) => void
  reset: () => void
  play: () => void
  pause: () => void
  stepForward: () => void
  stepBackward: () => void
  jumpToStart: () => void
  jumpToEnd: () => void
  jumpTo: (index: number) => void
  setSpeed: (speed: number) => void
}

export const useExecutionStore = create<ExecutionStoreState>((set, get) => ({
  result: null,
  cursor: 0,
  isPlaying: false,
  speed: 3,

  load: (result) => set({ result, cursor: 0, isPlaying: false }),

  reset: () => set({ result: null, cursor: 0, isPlaying: false }),

  play: () => {
    const { result, cursor } = get()
    if (!result || cursor >= result.steps.length - 1) return
    set({ isPlaying: true })
  },

  pause: () => set({ isPlaying: false }),

  stepForward: () => {
    const { result, cursor } = get()
    if (!result) return
    const next = Math.min(cursor + 1, result.steps.length - 1)
    set({
      cursor: next,
      isPlaying: next < result.steps.length - 1 ? get().isPlaying : false,
    })
  },

  stepBackward: () => {
    set((state) => ({
      cursor: Math.max(state.cursor - 1, 0),
      isPlaying: false,
    }))
  },

  jumpToStart: () => set({ cursor: 0, isPlaying: false }),

  jumpToEnd: () => {
    const { result } = get()
    set({ cursor: result ? result.steps.length - 1 : 0, isPlaying: false })
  },

  jumpTo: (index) => {
    const { result } = get()
    if (!result) return
    const clamped = Math.min(Math.max(index, 0), result.steps.length - 1)
    set({ cursor: clamped, isPlaying: false })
  },

  setSpeed: (speed) =>
    set({ speed: Math.min(MAX_SPEED, Math.max(MIN_SPEED, speed)) }),
}))

export function getCurrentStep(state: {
  result: ExecutionResult | null
  cursor: number
}): ExecutionStep | null {
  return state.result?.steps[state.cursor] ?? null
}

import { describe, expect, it } from 'vitest'
import { useModeStore } from './modeStore'

describe('modeStore', () => {
  it('defaults to graph mode', () => {
    expect(useModeStore.getState().mode).toBe('graph')
  })

  it('switches to grid mode and back', () => {
    useModeStore.getState().setMode('grid')
    expect(useModeStore.getState().mode).toBe('grid')
    useModeStore.getState().setMode('graph')
    expect(useModeStore.getState().mode).toBe('graph')
  })
})

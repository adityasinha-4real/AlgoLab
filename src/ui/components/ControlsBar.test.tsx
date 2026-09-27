import { act, fireEvent, render, screen } from '@testing-library/react'
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest'
import { createFixtureExecutionResult } from '../../test/fixtures'
import { useExecutionStore } from '../state/executionStore'
import { ControlsBar } from './ControlsBar'

beforeEach(() => {
  useExecutionStore.getState().reset()
})

afterEach(() => {
  vi.useRealTimers()
})

describe('ControlsBar', () => {
  it('disables all playback buttons when no result is loaded', () => {
    render(<ControlsBar />)
    for (const label of [
      'Jump to start',
      'Step back',
      'Play',
      'Step forward',
      'Jump to end',
    ]) {
      expect(screen.getByRole('button', { name: label })).toBeDisabled()
    }
  })

  it('steps forward and backward through the loaded result', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    render(<ControlsBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Step forward' }))
    expect(useExecutionStore.getState().cursor).toBe(1)

    fireEvent.click(screen.getByRole('button', { name: 'Step back' }))
    expect(useExecutionStore.getState().cursor).toBe(0)
  })

  it('jump-to-end and jump-to-start move to the boundaries', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    render(<ControlsBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Jump to end' }))
    expect(useExecutionStore.getState().cursor).toBe(2)

    fireEvent.click(screen.getByRole('button', { name: 'Jump to start' }))
    expect(useExecutionStore.getState().cursor).toBe(0)
  })

  it('play advances the cursor automatically and pauses at the end', async () => {
    vi.useFakeTimers()
    useExecutionStore.getState().load(createFixtureExecutionResult())
    render(<ControlsBar />)

    fireEvent.click(screen.getByRole('button', { name: 'Play' }))
    expect(useExecutionStore.getState().isPlaying).toBe(true)

    await act(async () => {
      await vi.advanceTimersByTimeAsync(5000)
    })

    expect(useExecutionStore.getState().cursor).toBe(2)
    expect(useExecutionStore.getState().isPlaying).toBe(false)
  })

  it('the play button disables once the end is reached', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    useExecutionStore.getState().jumpToEnd()
    render(<ControlsBar />)

    expect(screen.getByRole('button', { name: 'Play' })).toBeDisabled()
  })
})

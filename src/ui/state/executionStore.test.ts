import { beforeEach, describe, expect, it } from 'vitest'
import { createFixtureExecutionResult } from '../../test/fixtures'
import { speedToDelayMs, useExecutionStore } from './executionStore'

beforeEach(() => {
  useExecutionStore.getState().reset()
})

describe('speedToDelayMs', () => {
  it('is monotonically decreasing as speed increases', () => {
    const delays = [1, 2, 3, 4, 5].map(speedToDelayMs)
    for (let i = 1; i < delays.length; i++) {
      expect(delays[i]).toBeLessThan(delays[i - 1])
    }
  })

  it('clamps out-of-range speeds', () => {
    expect(speedToDelayMs(0)).toBe(speedToDelayMs(1))
    expect(speedToDelayMs(99)).toBe(speedToDelayMs(5))
  })
})

describe('executionStore', () => {
  it('loading a result resets the cursor to 0 and pauses', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    const { cursor, isPlaying, result } = useExecutionStore.getState()
    expect(cursor).toBe(0)
    expect(isPlaying).toBe(false)
    expect(result?.steps).toHaveLength(3)
  })

  it('stepForward advances the cursor and clamps at the last step', () => {
    const { load, stepForward } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    stepForward()
    stepForward()
    stepForward()
    stepForward()
    expect(useExecutionStore.getState().cursor).toBe(2)
  })

  it('stepBackward retreats the cursor and clamps at 0, and pauses', () => {
    const { load, jumpToEnd, stepBackward } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    jumpToEnd()
    stepBackward()
    expect(useExecutionStore.getState().cursor).toBe(1)
    stepBackward()
    stepBackward()
    expect(useExecutionStore.getState().cursor).toBe(0)
  })

  it('jumpToStart and jumpToEnd move to the boundaries', () => {
    const { load, jumpToEnd, jumpToStart } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    jumpToEnd()
    expect(useExecutionStore.getState().cursor).toBe(2)
    jumpToStart()
    expect(useExecutionStore.getState().cursor).toBe(0)
  })

  it('jumpTo clamps to the valid step range', () => {
    const { load, jumpTo } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    jumpTo(-5)
    expect(useExecutionStore.getState().cursor).toBe(0)
    jumpTo(999)
    expect(useExecutionStore.getState().cursor).toBe(2)
  })

  it('play() is a no-op with no loaded result', () => {
    useExecutionStore.getState().play()
    expect(useExecutionStore.getState().isPlaying).toBe(false)
  })

  it('play() is a no-op when already at the last step', () => {
    const { load, jumpToEnd, play } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    jumpToEnd()
    play()
    expect(useExecutionStore.getState().isPlaying).toBe(false)
  })

  it('play() starts playback when not at the end', () => {
    const { load, play } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    play()
    expect(useExecutionStore.getState().isPlaying).toBe(true)
  })

  it('stepBackward always pauses playback', () => {
    const { load, play, stepForward, stepBackward } =
      useExecutionStore.getState()
    load(createFixtureExecutionResult())
    stepForward()
    play()
    stepBackward()
    expect(useExecutionStore.getState().isPlaying).toBe(false)
  })

  it('setSpeed clamps to the valid range', () => {
    const { setSpeed } = useExecutionStore.getState()
    setSpeed(0)
    expect(useExecutionStore.getState().speed).toBe(1)
    setSpeed(99)
    expect(useExecutionStore.getState().speed).toBe(5)
  })

  it('reset clears the loaded result and cursor', () => {
    const { load, reset } = useExecutionStore.getState()
    load(createFixtureExecutionResult())
    reset()
    const { result, cursor } = useExecutionStore.getState()
    expect(result).toBeNull()
    expect(cursor).toBe(0)
  })
})

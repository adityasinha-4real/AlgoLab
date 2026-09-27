import { render, screen, fireEvent } from '@testing-library/react'
import { beforeEach, describe, expect, it, vi } from 'vitest'
import { createFixtureExecutionResult } from '../../test/fixtures'
import { useExecutionStore } from '../state/executionStore'
import { Timeline } from './Timeline'

beforeEach(() => {
  useExecutionStore.getState().reset()
})

describe('Timeline', () => {
  it('shows 0 / 0 and a disabled slider when no result is loaded', () => {
    render(<Timeline />)
    expect(screen.getByText('Step 0 / 0')).toBeInTheDocument()
    expect(screen.getByRole('slider')).toHaveAttribute('aria-disabled', 'true')
  })

  it('shows the current step out of the total once a result is loaded', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    useExecutionStore.getState().stepForward()
    render(<Timeline />)
    expect(screen.getByText('Step 2 / 3')).toBeInTheDocument()
  })

  it('clicking the track jumps to the proportional step', () => {
    useExecutionStore.getState().load(createFixtureExecutionResult())
    render(<Timeline />)

    const track = screen.getByRole('slider')
    vi.spyOn(track, 'getBoundingClientRect').mockReturnValue({
      left: 0,
      right: 100,
      width: 100,
      top: 0,
      bottom: 10,
      height: 10,
      x: 0,
      y: 0,
      toJSON: () => {},
    })

    fireEvent.click(track, { clientX: 100 })

    expect(useExecutionStore.getState().cursor).toBe(2)
  })
})

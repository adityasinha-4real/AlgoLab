import { renderHook } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GRAPH_PRESETS } from '../../core/graph/presets'
import { createFixtureExecutionResult } from '../../test/fixtures'
import { useComparisonStore } from '../state/comparisonStore'
import { useExecutionStore } from '../state/executionStore'
import { useGraphStore } from '../state/graphStore'
import { useResetExecutionOnGraphChange } from './useResetExecutionOnGraphChange'

beforeEach(() => {
  useGraphStore.getState().clear()
  useExecutionStore.getState().reset()
  useComparisonStore.getState().clear()
})

describe('useResetExecutionOnGraphChange', () => {
  it('clears the execution result when the graph object changes', () => {
    renderHook(() => useResetExecutionOnGraphChange())
    useExecutionStore.getState().load(createFixtureExecutionResult())
    expect(useExecutionStore.getState().result).not.toBeNull()

    useGraphStore.getState().addNodeAt(0, 0)

    expect(useExecutionStore.getState().result).toBeNull()
  })

  it('does not touch the execution result when only the selection changes', () => {
    renderHook(() => useResetExecutionOnGraphChange())
    useExecutionStore.getState().load(createFixtureExecutionResult())

    useGraphStore.getState().select(null)

    expect(useExecutionStore.getState().result).not.toBeNull()
  })

  it('clears the comparison table when the graph object changes', () => {
    renderHook(() => useResetExecutionOnGraphChange())
    useComparisonStore.getState().run(GRAPH_PRESETS['simple-path'].build())
    expect(useComparisonStore.getState().entries).not.toBeNull()

    useGraphStore.getState().addNodeAt(0, 0)

    expect(useComparisonStore.getState().entries).toBeNull()
  })
})

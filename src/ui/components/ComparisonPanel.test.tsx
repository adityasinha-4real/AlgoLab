import { fireEvent, render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { GRAPH_PRESETS } from '../../core/graph/presets'
import { useComparisonStore } from '../state/comparisonStore'
import { useGraphStore } from '../state/graphStore'
import { ComparisonPanel } from './ComparisonPanel'

beforeEach(() => {
  useGraphStore.getState().clear()
  useComparisonStore.getState().clear()
})

describe('ComparisonPanel', () => {
  it('shows a hint before any comparison has run', () => {
    render(<ComparisonPanel />)
    expect(screen.getByText(/Run every algorithm/)).toBeInTheDocument()
  })

  it('runs a comparison on the current graph and renders a row per algorithm', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    render(<ComparisonPanel />)

    fireEvent.click(screen.getByRole('button', { name: 'Compare all' }))

    expect(screen.getByText('Breadth-First Search')).toBeInTheDocument()
    expect(screen.getByText('Bellman-Ford Algorithm')).toBeInTheDocument()
    // simple-path has path length 3 for every algorithm; appears once per row.
    expect(screen.getAllByText('3').length).toBeGreaterThanOrEqual(5)
  })

  it('shows an error message instead of metrics for algorithms that reject the graph', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['negative-edge'].build())
    render(<ComparisonPanel />)

    fireEvent.click(screen.getByRole('button', { name: 'Compare all' }))

    expect(screen.getAllByText(/negative edge weights/).length).toBe(2)
  })

  it('clears the comparison table', () => {
    useGraphStore.getState().setGraph(GRAPH_PRESETS['simple-path'].build())
    render(<ComparisonPanel />)
    fireEvent.click(screen.getByRole('button', { name: 'Compare all' }))

    fireEvent.click(screen.getByRole('button', { name: 'Clear' }))

    expect(screen.getByText(/Run every algorithm/)).toBeInTheDocument()
  })
})

import { render, screen } from '@testing-library/react'
import { beforeEach, describe, expect, it } from 'vitest'
import { runBFS } from '../../core/algorithms/bfs'
import { GRAPH_PRESETS } from '../../core/graph/presets'
import { useAlgorithmStore } from '../state/algorithmStore'
import { useExecutionStore } from '../state/executionStore'
import { PseudocodePanel } from './PseudocodePanel'

beforeEach(() => {
  useExecutionStore.getState().reset()
  useAlgorithmStore.setState({ selectedAlgorithmId: 'bfs' })
})

describe('PseudocodePanel', () => {
  it('renders the pseudocode for the selected algorithm with no highlight before a run', () => {
    render(<PseudocodePanel />)
    expect(screen.getByText(/BFS\(graph, start, target\)/)).toBeInTheDocument()
    expect(document.querySelector('.bg-accent\\/20')).toBeNull()
  })

  it("highlights the current step's pseudocode line once a result is loaded", () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    useExecutionStore.getState().load(result)

    render(<PseudocodePanel />)

    const highlighted = document.querySelector('.bg-accent\\/20')
    expect(highlighted).not.toBeNull()
    expect(highlighted?.textContent).toContain(
      String(result.steps[0].pseudocodeLine),
    )
  })

  it('does not highlight when the loaded result is for a different algorithm than selected', () => {
    const result = runBFS(GRAPH_PRESETS['simple-path'].build())
    useExecutionStore.getState().load(result)
    useAlgorithmStore.setState({ selectedAlgorithmId: 'dfs' })

    render(<PseudocodePanel />)

    expect(document.querySelector('.bg-accent\\/20')).toBeNull()
  })

  it('shows a fallback message for algorithms without pseudocode yet', () => {
    useAlgorithmStore.setState({ selectedAlgorithmId: 'bellman-ford' })
    render(<PseudocodePanel />)
    expect(screen.getByText(/isn't available yet/)).toBeInTheDocument()
  })
})

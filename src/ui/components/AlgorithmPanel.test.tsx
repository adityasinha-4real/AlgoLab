import { render, screen } from '@testing-library/react'
import { describe, expect, it } from 'vitest'
import { AlgorithmPanel } from './AlgorithmPanel'

describe('AlgorithmPanel', () => {
  it('renders every supported algorithm by name', () => {
    render(<AlgorithmPanel />)

    expect(screen.getByText('Breadth-First Search')).toBeInTheDocument()
    expect(screen.getByText('Depth-First Search')).toBeInTheDocument()
    expect(screen.getByText("Dijkstra's Algorithm")).toBeInTheDocument()
    expect(screen.getByText('A* Search')).toBeInTheDocument()
    expect(screen.getByText('Bellman-Ford Algorithm')).toBeInTheDocument()
  })
})

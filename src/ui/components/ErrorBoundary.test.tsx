import { render, screen } from '@testing-library/react'
import { describe, expect, it, vi } from 'vitest'
import { ErrorBoundary } from './ErrorBoundary'

function Bomb(): never {
  throw new Error('boom')
}

describe('ErrorBoundary', () => {
  it('renders children when nothing throws', () => {
    render(
      <ErrorBoundary>
        <p>safe content</p>
      </ErrorBoundary>,
    )
    expect(screen.getByText('safe content')).toBeInTheDocument()
  })

  it('renders a fallback UI when a child throws during render', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    render(
      <ErrorBoundary>
        <Bomb />
      </ErrorBoundary>,
    )

    expect(screen.getByText('Something went wrong')).toBeInTheDocument()
    expect(screen.getByText('boom')).toBeInTheDocument()

    consoleError.mockRestore()
  })

  it('recovers when "Try again" is clicked after the state resets', () => {
    const consoleError = vi.spyOn(console, 'error').mockImplementation(() => {})

    let shouldThrow = true
    function MaybeBomb() {
      if (shouldThrow) throw new Error('boom')
      return <p>recovered</p>
    }

    const { rerender } = render(
      <ErrorBoundary>
        <MaybeBomb />
      </ErrorBoundary>,
    )
    expect(screen.getByText('Something went wrong')).toBeInTheDocument()

    shouldThrow = false
    screen.getByText('Try again').click()
    rerender(
      <ErrorBoundary>
        <MaybeBomb />
      </ErrorBoundary>,
    )

    expect(screen.getByText('recovered')).toBeInTheDocument()

    consoleError.mockRestore()
  })
})

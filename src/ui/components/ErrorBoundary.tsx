import { Component, type ErrorInfo, type ReactNode } from 'react'

interface ErrorBoundaryProps {
  children: ReactNode
}

interface ErrorBoundaryState {
  error: Error | null
}

export class ErrorBoundary extends Component<
  ErrorBoundaryProps,
  ErrorBoundaryState
> {
  state: ErrorBoundaryState = { error: null }

  static getDerivedStateFromError(error: Error): ErrorBoundaryState {
    return { error }
  }

  componentDidCatch(error: Error, errorInfo: ErrorInfo) {
    console.error('AlgoLab crashed:', error, errorInfo.componentStack)
  }

  reset = () => {
    this.setState({ error: null })
  }

  render() {
    const { error } = this.state
    if (!error) return this.props.children

    return (
      <div className="flex h-screen w-screen items-center justify-center bg-surface-0 p-4 text-text-primary">
        <div className="max-w-md rounded-md border border-red-400/40 bg-red-400/10 p-6 text-center">
          <h1 className="text-lg font-semibold">Something went wrong</h1>
          <p className="mt-2 text-sm text-text-muted">
            AlgoLab hit an unexpected error and couldn&apos;t continue
            rendering. You can try to recover, or reload the page if the problem
            persists.
          </p>
          <p className="mt-3 truncate text-xs text-text-muted">
            {error.message}
          </p>
          <button
            type="button"
            onClick={this.reset}
            className="mt-4 rounded-md bg-accent px-4 py-2 text-sm font-medium text-surface-0"
          >
            Try again
          </button>
        </div>
      </div>
    )
  }
}

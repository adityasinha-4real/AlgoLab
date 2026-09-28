import { StrictMode } from 'react'
import { createRoot } from 'react-dom/client'
import './index.css'
import App from './App.tsx'
import { ErrorBoundary } from './ui/components/ErrorBoundary.tsx'
import {
  restorePersistedState,
  startPersistingState,
} from './ui/state/persistedState.ts'
import { consumeShareUrlIfPresent } from './ui/state/shareLink.ts'

const rootElement = document.getElementById('root')
if (!rootElement) {
  throw new Error('Root element #root not found')
}

// A shared link takes precedence over a locally persisted session.
if (!consumeShareUrlIfPresent()) {
  restorePersistedState()
}
startPersistingState()

createRoot(rootElement).render(
  <StrictMode>
    <ErrorBoundary>
      <App />
    </ErrorBoundary>
  </StrictMode>,
)

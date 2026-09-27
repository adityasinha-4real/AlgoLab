import { AlgorithmPanel } from './ui/components/AlgorithmPanel'
import { ControlsBar } from './ui/components/ControlsBar'
import { ErrorBanner } from './ui/components/graph/ErrorBanner'
import { GraphCanvas } from './ui/components/graph/GraphCanvas'
import { GraphToolbar } from './ui/components/graph/GraphToolbar'
import { SelectionInspector } from './ui/components/graph/SelectionInspector'
import { PseudocodePanel } from './ui/components/PseudocodePanel'
import { StateInspectorPanel } from './ui/components/StateInspectorPanel'
import { Timeline } from './ui/components/Timeline'

function App() {
  return (
    <div className="mx-auto flex h-screen max-w-[1600px] flex-col gap-3 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          AlgoLab
        </h1>
        <p className="text-xs text-text-muted">
          Interactive algorithm laboratory — BFS &amp; DFS (M4)
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-3">
        <div className="flex min-h-0 flex-col gap-3">
          <GraphToolbar />
          <ErrorBanner />
          <GraphCanvas />
          <ControlsBar />
          <Timeline />
        </div>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <SelectionInspector />
          <AlgorithmPanel />
          <PseudocodePanel />
          <StateInspectorPanel />
        </div>
      </div>
    </div>
  )
}

export default App

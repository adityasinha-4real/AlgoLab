import { AlgorithmPanel } from './ui/components/AlgorithmPanel'
import { ControlsBar } from './ui/components/ControlsBar'
import { GraphCanvas } from './ui/components/GraphCanvas'
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
          Interactive algorithm laboratory — foundation build (M1)
        </p>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-3">
        <div className="flex min-h-0 flex-col gap-3">
          <GraphCanvas />
          <ControlsBar />
          <Timeline />
        </div>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          <AlgorithmPanel />
          <PseudocodePanel />
          <StateInspectorPanel />
        </div>
      </div>
    </div>
  )
}

export default App

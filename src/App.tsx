import { AlgorithmPanel } from './ui/components/AlgorithmPanel'
import { ControlsBar } from './ui/components/ControlsBar'
import { ErrorBanner } from './ui/components/graph/ErrorBanner'
import { GraphCanvas } from './ui/components/graph/GraphCanvas'
import { GraphToolbar } from './ui/components/graph/GraphToolbar'
import { SelectionInspector } from './ui/components/graph/SelectionInspector'
import { GridCanvas } from './ui/components/grid/GridCanvas'
import { GridToolbar } from './ui/components/grid/GridToolbar'
import { useResetExecutionOnGraphChange } from './ui/hooks/useResetExecutionOnGraphChange'
import { PseudocodePanel } from './ui/components/PseudocodePanel'
import { StateInspectorPanel } from './ui/components/StateInspectorPanel'
import { Timeline } from './ui/components/Timeline'
import { useAlgorithmStore } from './ui/state/algorithmStore'
import { useExecutionStore } from './ui/state/executionStore'
import { useModeStore, type AppMode } from './ui/state/modeStore'

function ModeSwitch() {
  const mode = useModeStore((s) => s.mode)
  const setMode = useModeStore((s) => s.setMode)
  const setSelectedAlgorithmId = useAlgorithmStore(
    (s) => s.setSelectedAlgorithmId,
  )
  const resetExecution = useExecutionStore((s) => s.reset)

  const switchTo = (next: AppMode) => {
    if (next === mode) return
    resetExecution()
    if (next === 'grid') setSelectedAlgorithmId('astar')
    setMode(next)
  }

  return (
    <div className="flex items-center gap-1 rounded-md border border-border bg-surface-1 p-1 text-xs">
      {(['graph', 'grid'] as const).map((m) => (
        <button
          key={m}
          type="button"
          onClick={() => switchTo(m)}
          className={`rounded px-3 py-1 capitalize ${
            mode === m ? 'bg-accent text-surface-0' : 'text-text-muted'
          }`}
        >
          {m} mode
        </button>
      ))}
    </div>
  )
}

function App() {
  useResetExecutionOnGraphChange()
  const mode = useModeStore((s) => s.mode)

  return (
    <div className="mx-auto flex h-screen max-w-[1600px] flex-col gap-3 p-4">
      <header className="flex items-center justify-between">
        <h1 className="text-lg font-semibold tracking-tight text-text-primary">
          AlgoLab
        </h1>
        <div className="flex items-center gap-3">
          <ModeSwitch />
          <p className="text-xs text-text-muted">
            Interactive algorithm laboratory
          </p>
        </div>
      </header>

      <div className="grid min-h-0 flex-1 grid-cols-[minmax(0,1fr)_320px] gap-3">
        <div className="flex min-h-0 flex-col gap-3">
          {mode === 'graph' ? (
            <>
              <GraphToolbar />
              <ErrorBanner />
              <GraphCanvas />
            </>
          ) : (
            <>
              <GridToolbar />
              <GridCanvas />
            </>
          )}
          <ControlsBar />
          <Timeline />
        </div>
        <div className="flex min-h-0 flex-col gap-3 overflow-y-auto">
          {mode === 'graph' && (
            <>
              <SelectionInspector />
              <AlgorithmPanel />
            </>
          )}
          <PseudocodePanel />
          <StateInspectorPanel />
        </div>
      </div>
    </div>
  )
}

export default App

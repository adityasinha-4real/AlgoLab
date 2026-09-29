import {
  createInitialAlgorithmState,
  type AlgorithmState,
  type ExecutionStep,
  type StepType,
} from './types'

/**
 * Accumulates ExecutionSteps for an algorithm run. Every recorded step gets
 * an independent deep-ish clone of the current state - without that, later
 * mutations (e.g. pushing to `visited` on the next step) would silently
 * corrupt previously "recorded" snapshots, since arrays/objects would be
 * shared by reference across steps.
 */
export class StepRecorder {
  private steps: ExecutionStep[] = []
  private state: AlgorithmState

  constructor(initialState: AlgorithmState = createInitialAlgorithmState()) {
    this.state = initialState
  }

  /**
   * Applies `mutate` to the working state, then records an immutable
   * snapshot of the result as a new step.
   */
  record(
    type: StepType,
    pseudocodeLine: number,
    explanation: string,
    mutate: (draft: AlgorithmState) => void,
  ): void {
    mutate(this.state)
    this.steps.push({
      index: this.steps.length,
      type,
      pseudocodeLine,
      explanation,
      state: cloneState(this.state),
    })
  }

  getSteps(): ExecutionStep[] {
    return this.steps
  }

  getCurrentState(): AlgorithmState {
    return this.state
  }
}

function cloneState(state: AlgorithmState): AlgorithmState {
  return {
    visited: [...state.visited],
    frontier: [...state.frontier],
    distances: { ...state.distances },
    parents: { ...state.parents },
    currentNodeId: state.currentNodeId,
    currentEdgeId: state.currentEdgeId,
    path: state.path ? [...state.path] : null,
    pass: state.pass,
    heuristics: { ...state.heuristics },
    ...(state.highlightedEdges && {
      highlightedEdges: [...state.highlightedEdges],
    }),
    ...(state.nodeGroups && { nodeGroups: { ...state.nodeGroups } }),
  }
}

import {
  StepRecorder,
  computeMetrics,
  type ExecutionResult,
} from '../core/engine'

/** A minimal 3-step fixture result, shared by UI tests that exercise the
 * execution store/playback wiring without depending on a real algorithm. */
export function createFixtureExecutionResult(): ExecutionResult {
  const recorder = new StepRecorder()
  recorder.record('init', 1, 'Start at A', (s) => {
    s.frontier.push('a')
    s.distances.a = 0
  })
  recorder.record('visit', 2, 'Visit A, discover B', (s) => {
    s.visited.push('a')
    s.frontier = ['b']
    s.currentNodeId = 'a'
    s.distances.b = 1
    s.parents.b = 'a'
  })
  recorder.record('path-found', 3, 'Reached target B', (s) => {
    s.visited.push('b')
    s.frontier = []
    s.currentNodeId = 'b'
    s.path = ['a', 'b']
  })

  const steps = recorder.getSteps()
  return {
    algorithmId: 'bfs',
    steps,
    metrics: computeMetrics(steps, 5),
  }
}

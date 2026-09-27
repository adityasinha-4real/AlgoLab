import { describe, expect, it } from 'vitest'
import { computeMetrics } from './metrics'
import { StepRecorder } from './stepRecorder'

describe('computeMetrics', () => {
  it('returns all zeros/nulls for an empty step list', () => {
    expect(computeMetrics([], 12)).toEqual({
      nodesVisited: 0,
      edgesExamined: 0,
      steps: 0,
      pathLength: null,
      pathCost: null,
      executionTimeMs: 12,
    })
  })

  it('counts visited nodes from the final step only', () => {
    const recorder = new StepRecorder()
    recorder.record('visit', 1, 'a', (s) => s.visited.push('a'))
    recorder.record('visit', 1, 'b', (s) => s.visited.push('b'))
    recorder.record('visit', 1, 'c', (s) => s.visited.push('c'))

    expect(computeMetrics(recorder.getSteps(), 5).nodesVisited).toBe(3)
  })

  it('counts examine-edge, relax, and skip-edge steps as edge examinations', () => {
    const recorder = new StepRecorder()
    recorder.record('examine-edge', 1, '', () => {})
    recorder.record('relax', 1, '', () => {})
    recorder.record('skip-edge', 1, '', () => {})
    recorder.record('visit', 1, '', () => {})

    expect(computeMetrics(recorder.getSteps(), 5).edgesExamined).toBe(3)
  })

  it('derives path length and cost from the final step', () => {
    const recorder = new StepRecorder()
    recorder.record('relax', 1, '', (s) => {
      s.distances.d = 8
    })
    recorder.record('path-found', 1, '', (s) => {
      s.path = ['a', 'b', 'd']
    })

    const metrics = computeMetrics(recorder.getSteps(), 42)
    expect(metrics.pathLength).toBe(2)
    expect(metrics.pathCost).toBe(8)
    expect(metrics.executionTimeMs).toBe(42)
  })

  it('reports null path length/cost when no path was found', () => {
    const recorder = new StepRecorder()
    recorder.record('no-path', 1, '', () => {})
    const metrics = computeMetrics(recorder.getSteps(), 3)
    expect(metrics.pathLength).toBeNull()
    expect(metrics.pathCost).toBeNull()
  })
})

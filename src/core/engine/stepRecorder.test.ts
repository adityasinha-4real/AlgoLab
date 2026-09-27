import { describe, expect, it } from 'vitest'
import { StepRecorder } from './stepRecorder'

describe('StepRecorder', () => {
  it('assigns sequential indices starting at 0', () => {
    const recorder = new StepRecorder()
    recorder.record('visit', 1, 'first', (s) => s.visited.push('a'))
    recorder.record('visit', 1, 'second', (s) => s.visited.push('b'))
    const steps = recorder.getSteps()
    expect(steps.map((s) => s.index)).toEqual([0, 1])
  })

  it('stores the type, pseudocode line, and explanation verbatim', () => {
    const recorder = new StepRecorder()
    recorder.record('enqueue', 3, 'Enqueue node A', (s) => s.frontier.push('a'))
    expect(recorder.getSteps()[0]).toMatchObject({
      type: 'enqueue',
      pseudocodeLine: 3,
      explanation: 'Enqueue node A',
    })
  })

  it('gives every step an independent snapshot - later mutations do not affect earlier steps', () => {
    const recorder = new StepRecorder()
    recorder.record('visit', 1, 'visit a', (s) => s.visited.push('a'))
    recorder.record('visit', 1, 'visit b', (s) => s.visited.push('b'))

    const [first, second] = recorder.getSteps()
    expect(first.state.visited).toEqual(['a'])
    expect(second.state.visited).toEqual(['a', 'b'])
  })

  it('deep-clones distances and parents so later updates do not leak backward', () => {
    const recorder = new StepRecorder()
    recorder.record('relax', 5, 'relax a', (s) => {
      s.distances.a = 4
      s.parents.a = null
    })
    recorder.record('relax', 5, 'relax b', (s) => {
      s.distances.b = 7
      s.parents.b = 'a'
    })

    const [first, second] = recorder.getSteps()
    expect(first.state.distances).toEqual({ a: 4 })
    expect(second.state.distances).toEqual({ a: 4, b: 7 })
  })

  it('clones the path array so a later reassignment does not mutate a prior step', () => {
    const recorder = new StepRecorder()
    recorder.record('path-found', 9, 'found', (s) => {
      s.path = ['a', 'b']
    })
    recorder.record('done', 10, 'done', (s) => {
      s.path!.push('c')
    })

    const [first, second] = recorder.getSteps()
    expect(first.state.path).toEqual(['a', 'b'])
    expect(second.state.path).toEqual(['a', 'b', 'c'])
  })

  it('starts from a provided initial state when given one', () => {
    const recorder = new StepRecorder({
      visited: ['seed'],
      frontier: [],
      distances: {},
      parents: {},
      currentNodeId: null,
      currentEdgeId: null,
      path: null,
      pass: null,
      heuristics: {},
    })
    recorder.record('visit', 1, 'noop', () => {})
    expect(recorder.getSteps()[0].state.visited).toEqual(['seed'])
  })
})

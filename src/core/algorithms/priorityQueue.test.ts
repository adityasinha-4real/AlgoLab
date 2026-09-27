import { describe, expect, it } from 'vitest'
import { MinPriorityQueue } from './priorityQueue'

describe('MinPriorityQueue', () => {
  it('starts empty', () => {
    const pq = new MinPriorityQueue<string>()
    expect(pq.isEmpty()).toBe(true)
    expect(pq.size).toBe(0)
    expect(pq.pop()).toBeUndefined()
  })

  it('pops values in ascending priority order', () => {
    const pq = new MinPriorityQueue<string>()
    pq.push('c', 3)
    pq.push('a', 1)
    pq.push('b', 2)
    expect(pq.pop()).toBe('a')
    expect(pq.pop()).toBe('b')
    expect(pq.pop()).toBe('c')
    expect(pq.isEmpty()).toBe(true)
  })

  it('handles a larger randomized sequence correctly', () => {
    const values = Array.from({ length: 200 }, (_, i) => i)
    const shuffled = [...values].sort(() => Math.random() - 0.5)
    const pq = new MinPriorityQueue<number>()
    for (const v of shuffled) pq.push(v, v)

    const popped: number[] = []
    while (!pq.isEmpty()) popped.push(pq.pop() as number)

    expect(popped).toEqual(values)
  })

  it('supports duplicate priorities and duplicate values (lazy deletion pattern)', () => {
    const pq = new MinPriorityQueue<string>()
    pq.push('a', 5)
    pq.push('a', 2)
    pq.push('a', 8)
    expect(pq.size).toBe(3)
    expect(pq.pop()).toBe('a')
    expect(pq.pop()).toBe('a')
    expect(pq.pop()).toBe('a')
  })
})

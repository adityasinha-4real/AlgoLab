interface Entry<T> {
  priority: number
  value: T
}

/**
 * Binary min-heap keyed by priority. Dijkstra and A* both use "lazy
 * deletion": rather than decrease-key, they just push a new entry whenever
 * a shorter distance is found and skip stale entries for an already-
 * finalized node on pop. Simpler to implement correctly than decrease-key,
 * at the cost of a few extra (harmless) heap entries.
 */
export class MinPriorityQueue<T> {
  private heap: Entry<T>[] = []

  get size(): number {
    return this.heap.length
  }

  isEmpty(): boolean {
    return this.heap.length === 0
  }

  push(value: T, priority: number): void {
    this.heap.push({ priority, value })
    this.bubbleUp(this.heap.length - 1)
  }

  pop(): T | undefined {
    if (this.heap.length === 0) return undefined
    const top = this.heap[0]
    const last = this.heap.pop() as Entry<T>
    if (this.heap.length > 0) {
      this.heap[0] = last
      this.bubbleDown(0)
    }
    return top.value
  }

  private bubbleUp(index: number): void {
    let i = index
    while (i > 0) {
      const parent = (i - 1) >> 1
      if (this.heap[parent].priority <= this.heap[i].priority) break
      ;[this.heap[parent], this.heap[i]] = [this.heap[i], this.heap[parent]]
      i = parent
    }
  }

  private bubbleDown(index: number): void {
    let i = index
    const n = this.heap.length
    for (;;) {
      const left = 2 * i + 1
      const right = 2 * i + 2
      let smallest = i
      if (left < n && this.heap[left].priority < this.heap[smallest].priority)
        smallest = left
      if (right < n && this.heap[right].priority < this.heap[smallest].priority)
        smallest = right
      if (smallest === i) break
      ;[this.heap[smallest], this.heap[i]] = [this.heap[i], this.heap[smallest]]
      i = smallest
    }
  }
}

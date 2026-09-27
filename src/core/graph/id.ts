let counter = 0

/** Deterministic-enough unique id generator; avoids a uuid dependency. */
export function generateId(prefix: string): string {
  counter += 1
  return `${prefix}-${Date.now().toString(36)}-${counter.toString(36)}`
}

const LABELS = 'ABCDEFGHIJKLMNOPQRSTUVWXYZ'

/** Produces A, B, ..., Z, AA, AB, ... for auto-generated node labels. */
export function labelForIndex(index: number): string {
  let n = index
  let label = ''
  do {
    label = LABELS[n % 26] + label
    n = Math.floor(n / 26) - 1
  } while (n >= 0)
  return label
}

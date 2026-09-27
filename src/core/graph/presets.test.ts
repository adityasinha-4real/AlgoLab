import { describe, expect, it } from 'vitest'
import { GRAPH_PRESETS, listGraphPresets } from './presets'
import { validateGraph } from './validate'

describe('graph presets', () => {
  it('lists all four presets', () => {
    expect(
      listGraphPresets()
        .map((p) => p.id)
        .sort(),
    ).toEqual(
      [
        'disconnected-pair',
        'negative-edge',
        'simple-path',
        'triangle-shortcut',
      ].sort(),
    )
  })

  it('builds a fresh graph object on every call', () => {
    const preset = GRAPH_PRESETS['simple-path']
    const a = preset.build()
    const b = preset.build()
    expect(a).not.toBe(b)
    expect(a).toEqual(b)
  })

  it('flags the disconnected preset as structurally invalid', () => {
    const graph = GRAPH_PRESETS['disconnected-pair'].build()
    expect(validateGraph(graph).map((e) => e.code)).toContain('DISCONNECTED')
  })

  it('every other preset passes structural validation', () => {
    for (const preset of listGraphPresets()) {
      if (preset.id === 'disconnected-pair') continue
      expect(validateGraph(preset.build())).toEqual([])
    }
  })

  it('the negative-edge preset actually contains a negative weight', () => {
    const graph = GRAPH_PRESETS['negative-edge'].build()
    expect(graph.edges.some((e) => e.weight < 0)).toBe(true)
  })
})

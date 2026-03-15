import { describe, it, expect } from 'vitest'
import {
  isBlockInZone,
  blocksInZone,
  sumBlocksInZone,
  type Rect,
  type WorkspaceBlock,
} from './workspace'

const ZONE: Rect = { x: 100, y: 50, width: 200, height: 150 }

function makeBlock(
  overrides: Partial<WorkspaceBlock> & { x: number; y: number },
): WorkspaceBlock {
  return {
    id: 'b1',
    numerator: 1,
    denominator: 4,
    width: 50,
    height: 50,
    ...overrides,
  }
}

describe('isBlockInZone', () => {
  it('block center inside zone → true', () => {
    const block: Rect = { x: 150, y: 100, width: 50, height: 50 }
    expect(isBlockInZone(block, ZONE)).toBe(true)
  })

  it('block center outside zone (left) → false', () => {
    const block: Rect = { x: 10, y: 100, width: 50, height: 50 }
    expect(isBlockInZone(block, ZONE)).toBe(false)
  })

  it('block center outside zone (right) → false', () => {
    const block: Rect = { x: 350, y: 100, width: 50, height: 50 }
    expect(isBlockInZone(block, ZONE)).toBe(false)
  })

  it('block center outside zone (above) → false', () => {
    const block: Rect = { x: 150, y: 0, width: 50, height: 20 }
    expect(isBlockInZone(block, ZONE)).toBe(false)
  })

  it('block center outside zone (below) → false', () => {
    const block: Rect = { x: 150, y: 250, width: 50, height: 50 }
    expect(isBlockInZone(block, ZONE)).toBe(false)
  })

  it('block overlapping but center outside → false', () => {
    // Block right edge enters zone, but center is still left of zone
    const block: Rect = { x: 60, y: 100, width: 50, height: 50 }
    // center x = 85, zone starts at 100 → outside
    expect(isBlockInZone(block, ZONE)).toBe(false)
  })

  it('block partially overlapping, center inside → true', () => {
    // Block starts before zone but center is inside
    const block: Rect = { x: 90, y: 100, width: 50, height: 50 }
    // center x = 115, zone starts at 100 → inside
    expect(isBlockInZone(block, ZONE)).toBe(true)
  })
})

describe('blocksInZone', () => {
  it('returns only blocks inside zone', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'in1', x: 150, y: 100 }),
      makeBlock({ id: 'out1', x: 10, y: 10 }),
      makeBlock({ id: 'in2', x: 200, y: 120 }),
    ]
    const result = blocksInZone(blocks, ZONE)
    expect(result.map((b) => b.id)).toEqual(['in1', 'in2'])
  })

  it('returns empty array when no blocks in zone', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'out1', x: 10, y: 10 }),
      makeBlock({ id: 'out2', x: 400, y: 400 }),
    ]
    expect(blocksInZone(blocks, ZONE)).toEqual([])
  })
})

describe('sumBlocksInZone', () => {
  it('two 1/4 blocks in zone → 1/2', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'q1', x: 150, y: 100, numerator: 1, denominator: 4 }),
      makeBlock({ id: 'q2', x: 200, y: 100, numerator: 1, denominator: 4 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 1, d: 2 })
  })

  it('one 1/2 block in zone → 1/2', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'h1', x: 150, y: 100, numerator: 1, denominator: 2 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 1, d: 2 })
  })

  it('mixed denominators: 1/2 + 1/4 → 3/4', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'h1', x: 150, y: 100, numerator: 1, denominator: 2 }),
      makeBlock({ id: 'q1', x: 200, y: 100, numerator: 1, denominator: 4 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 3, d: 4 })
  })

  it('no blocks in zone → 0/1', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'out', x: 10, y: 10, numerator: 1, denominator: 4 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 0, d: 1 })
  })

  it('ignores blocks outside zone', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'in', x: 150, y: 100, numerator: 1, denominator: 4 }),
      makeBlock({ id: 'out', x: 10, y: 10, numerator: 1, denominator: 4 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 1, d: 4 })
  })

  it('three 1/3 blocks → 1/1', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 't1', x: 150, y: 100, numerator: 1, denominator: 3 }),
      makeBlock({ id: 't2', x: 180, y: 100, numerator: 1, denominator: 3 }),
      makeBlock({ id: 't3', x: 210, y: 100, numerator: 1, denominator: 3 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 1, d: 1 })
  })

  it('1/3 + 1/5 → 8/15 (cross-group sum)', () => {
    const blocks: WorkspaceBlock[] = [
      makeBlock({ id: 'a', x: 150, y: 100, numerator: 1, denominator: 3 }),
      makeBlock({ id: 'b', x: 200, y: 100, numerator: 1, denominator: 5 }),
    ]
    expect(sumBlocksInZone(blocks, ZONE)).toEqual({ n: 8, d: 15 })
  })
})

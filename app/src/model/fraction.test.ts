import { describe, it, expect } from 'vitest'
import {
  simplify,
  areEquivalent,
  canCombine,
  combine,
  split,
  validSplitOptions,
  type Fraction,
} from './fraction'

describe('simplify', () => {
  const cases: [Fraction, Fraction][] = [
    [{ n: 2, d: 4 }, { n: 1, d: 2 }],
    [{ n: 1, d: 2 }, { n: 1, d: 2 }],
    [{ n: 1, d: 3 }, { n: 1, d: 3 }],
    [{ n: 1, d: 4 }, { n: 1, d: 4 }],
    [{ n: 1, d: 5 }, { n: 1, d: 5 }],
    [{ n: 3, d: 3 }, { n: 1, d: 3 }], // 3/3 = 1, but keep as 1/d_original? No — simplify to n=1,d=3 (whole)
    [{ n: 4, d: 4 }, { n: 1, d: 4 }], // 4/4 = 1
    [{ n: 2, d: 2 }, { n: 1, d: 2 }], // 2/2 = 1
  ]

  it.each(cases)('simplify(%j) → %j', (input, expected) => {
    expect(simplify(input)).toEqual(expected)
  })
})

describe('areEquivalent', () => {
  it('2/4 == 1/2', () => {
    expect(areEquivalent({ n: 2, d: 4 }, { n: 1, d: 2 })).toBe(true)
  })

  it('1/2 == 2/4', () => {
    expect(areEquivalent({ n: 1, d: 2 }, { n: 2, d: 4 })).toBe(true)
  })

  it('3/3 == 5/5 (both equal 1)', () => {
    expect(areEquivalent({ n: 3, d: 3 }, { n: 5, d: 5 })).toBe(true)
  })

  it('1/2 == 1/2 (identity)', () => {
    expect(areEquivalent({ n: 1, d: 2 }, { n: 1, d: 2 })).toBe(true)
  })

  // Non-equivalences
  it('3/3 != 1/3', () => {
    expect(areEquivalent({ n: 3, d: 3 }, { n: 1, d: 3 })).toBe(false)
  })

  it('1/2 != 1/3', () => {
    expect(areEquivalent({ n: 1, d: 2 }, { n: 1, d: 3 })).toBe(false)
  })

  it('1/3 != 1/4', () => {
    expect(areEquivalent({ n: 1, d: 3 }, { n: 1, d: 4 })).toBe(false)
  })

  it('1/4 != 1/5', () => {
    expect(areEquivalent({ n: 1, d: 4 }, { n: 1, d: 5 })).toBe(false)
  })

  it('2/3 != 2/5', () => {
    expect(areEquivalent({ n: 2, d: 3 }, { n: 2, d: 5 })).toBe(false)
  })
})

describe('canCombine', () => {
  it('same denom, sum ≤ 1 → true', () => {
    expect(canCombine({ n: 1, d: 4 }, { n: 1, d: 4 })).toBe(true)
  })

  it('same denom, sum = 1 → true', () => {
    expect(canCombine({ n: 1, d: 2 }, { n: 1, d: 2 })).toBe(true)
  })

  it('same denom, sum > 1 → false', () => {
    expect(canCombine({ n: 3, d: 4 }, { n: 2, d: 4 })).toBe(false)
  })

  it('different denom → false', () => {
    expect(canCombine({ n: 1, d: 2 }, { n: 1, d: 4 })).toBe(false)
  })
})

describe('combine', () => {
  it('two 1/4 → 2/4', () => {
    expect(combine({ n: 1, d: 4 }, { n: 1, d: 4 })).toEqual({ n: 2, d: 4 })
  })

  it('1/4 + 2/4 → 3/4', () => {
    expect(combine({ n: 1, d: 4 }, { n: 2, d: 4 })).toEqual({ n: 3, d: 4 })
  })

  it('different denom → null', () => {
    expect(combine({ n: 1, d: 2 }, { n: 1, d: 4 })).toBeNull()
  })

  it('sum > 1 → null', () => {
    expect(combine({ n: 3, d: 4 }, { n: 2, d: 4 })).toBeNull()
  })
})

describe('split', () => {
  it('1/2 → two 1/4', () => {
    const result = split({ n: 1, d: 2 }, 2)
    expect(result).toEqual([{ n: 1, d: 4 }, { n: 1, d: 4 }])
  })

  it('1/3 split into 2 → null (denom would be 6 > 5)', () => {
    expect(split({ n: 1, d: 3 }, 2)).toBeNull()
  })

  it('1/4 split into 2 → null (denom would be 8 > 5)', () => {
    expect(split({ n: 1, d: 4 }, 2)).toBeNull()
  })

  it('1/5 split into 2 → null (denom would be 10 > 5)', () => {
    expect(split({ n: 1, d: 5 }, 2)).toBeNull()
  })

  it('1/2 split into 3 → null (denom would be 6 > 5)', () => {
    expect(split({ n: 1, d: 2 }, 3)).toBeNull()
  })
})

describe('validSplitOptions', () => {
  it('1/2 → [2] (only split into quarters)', () => {
    expect(validSplitOptions({ n: 1, d: 2 })).toEqual([2])
  })

  it('1/3 → [] (no valid splits)', () => {
    expect(validSplitOptions({ n: 1, d: 3 })).toEqual([])
  })

  it('1/4 → [] (no valid splits)', () => {
    expect(validSplitOptions({ n: 1, d: 4 })).toEqual([])
  })

  it('1/5 → [] (no valid splits)', () => {
    expect(validSplitOptions({ n: 1, d: 5 })).toEqual([])
  })
})

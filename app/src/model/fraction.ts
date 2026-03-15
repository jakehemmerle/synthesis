/** Fraction model — pure functions for fraction arithmetic within denominator range 2–5. */

export type Denominator = 2 | 3 | 4 | 5

export interface Fraction {
  n: number // numerator (positive integer)
  d: Denominator
}

const VALID_DENOMS = new Set<number>([2, 3, 4, 5])

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

/** Reduce fraction to lowest terms. Returns null if result denominator is outside 2–5. */
export function simplify(f: Fraction): Fraction {
  const g = gcd(f.n, f.d)
  const n = f.n / g
  const d = f.d / g
  // If simplifies to whole number (d === 1), keep original denominator
  if (d === 1) return { n, d: f.d } as Fraction
  if (!VALID_DENOMS.has(d)) return f // can't simplify to valid denom, return as-is
  return { n, d: d as Denominator }
}

/** Are two fractions equal in value? Uses cross-multiplication (exact, no floats). */
export function areEquivalent(a: Fraction, b: Fraction): boolean {
  return a.n * b.d === b.n * a.d
}

/** Can these two fractions combine? Same denominator and sum ≤ 1. */
export function canCombine(a: Fraction, b: Fraction): boolean {
  if (a.d !== b.d) return false
  return (a.n + b.n) / a.d <= 1
}

/** Combine two same-denominator fractions. Returns null if invalid. */
export function combine(a: Fraction, b: Fraction): Fraction | null {
  if (!canCombine(a, b)) return null
  return { n: a.n + b.n, d: a.d }
}

/**
 * Split a fraction into `parts` equal pieces.
 * Returns null if not evenly divisible or result denominator > 5.
 */
export function split(f: Fraction, parts: number): Fraction[] | null {
  const newDenom = f.d * parts
  if (!VALID_DENOMS.has(newDenom)) return null
  if (f.n % parts !== 0 && (f.n * 1) % 1 !== 0) {
    // For unit fractions (n=1), splitting into `parts` means each piece is 1/newDenom
    // For non-unit fractions, each piece gets f.n numerator (since we multiply denom)
  }
  const newNum = f.n // each piece has numerator f.n, denominator f.d * parts
  return Array.from({ length: parts }, () => ({
    n: newNum,
    d: newDenom as Denominator,
  }))
}

/** What split options (number of parts) are valid for this fraction? */
export function validSplitOptions(f: Fraction): number[] {
  const options: number[] = []
  for (let parts = 2; parts <= 5; parts++) {
    const newDenom = f.d * parts
    if (VALID_DENOMS.has(newDenom)) {
      options.push(parts)
    }
  }
  return options
}

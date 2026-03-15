/** Workspace model — zone checking and block-in-zone queries. */

export interface Point {
  x: number
  y: number
}

export interface Rect {
  x: number
  y: number
  width: number
  height: number
}

export interface Zone extends Rect {
  id: string
}

export interface WorkspaceBlock {
  id: string
  numerator: number
  denominator: number
  x: number
  y: number
  width: number
  height: number
}

/** Check if a block's center is inside a zone. */
export function isBlockInZone(block: Rect, zone: Rect): boolean {
  const cx = block.x + block.width / 2
  const cy = block.y + block.height / 2
  return (
    cx > zone.x &&
    cx < zone.x + zone.width &&
    cy > zone.y &&
    cy < zone.y + zone.height
  )
}

/** Get all blocks whose center is inside a zone. */
export function blocksInZone(
  blocks: WorkspaceBlock[],
  zone: Rect,
): WorkspaceBlock[] {
  return blocks.filter((b) => isBlockInZone(b, zone))
}

/** Sum the fractional value of blocks in a zone. Returns exact rational as { n, d }. */
export function sumBlocksInZone(
  blocks: WorkspaceBlock[],
  zone: Rect,
): { n: number; d: number } {
  const inZone = blocksInZone(blocks, zone)
  if (inZone.length === 0) return { n: 0, d: 1 }

  // Find LCD among blocks in zone
  const denoms = inZone.map((b) => b.denominator)
  const lcd = denoms.reduce(lcm)

  let numeratorSum = 0
  for (const b of inZone) {
    numeratorSum += b.numerator * (lcd / b.denominator)
  }

  const g = gcd(numeratorSum, lcd)
  return { n: numeratorSum / g, d: lcd / g }
}

function gcd(a: number, b: number): number {
  a = Math.abs(a)
  b = Math.abs(b)
  while (b) {
    ;[a, b] = [b, a % b]
  }
  return a
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b)
}

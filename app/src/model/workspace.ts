/** Workspace model — zone checking and block-in-zone queries. */

import { gcd, lcm } from './math'

export interface Rect {
  x: number
  y: number
  width: number
  height: number
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
  // Single pass: find LCD and accumulate numerator sum together
  let lcd = 1
  let count = 0
  for (const b of blocks) {
    if (!isBlockInZone(b, zone)) continue
    lcd = lcm(lcd, b.denominator)
    count++
  }
  if (count === 0) return { n: 0, d: 1 }

  let numeratorSum = 0
  for (const b of blocks) {
    if (!isBlockInZone(b, zone)) continue
    numeratorSum += b.numerator * (lcd / b.denominator)
  }

  const g = gcd(numeratorSum, lcd)
  return { n: numeratorSum / g, d: lcd / g }
}

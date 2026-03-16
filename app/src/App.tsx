import { useRef, useState, useCallback, useEffect, type PointerEvent as ReactPointerEvent } from 'react'
import confetti from 'canvas-confetti'
import { Button } from '@/components/ui/button'
import { LessonProvider, useLesson } from '@/engine/lessonContext'
import { canCombine, split as splitFraction, validSplitOptions, type Fraction, type Denominator } from '@/model/fraction'
import { isBlockInZone, sumBlocksInZone } from '@/model/workspace'

interface BlockState {
  id: string
  numerator: number
  denominator: number
  width: number
  height: number
  x: number
  y: number
  color: string
  animate?: boolean
  glowing?: boolean
}

const TRAY_Y = 280
const ZONE_X = 180
const ZONE_Y = 80
const ZONE_W = 160
const ZONE_H = 120
const BLOCK_HEIGHT = 50
const BASE_BLOCK_WIDTH = 200 // width for a whole (1/1); scales by numerator/denominator
const BLOCK_SPACING = 8
const TAP_THRESHOLD = 5
const COMBINE_ANIMATION_MS = 200

// Dual-zone positions (side by side)
const ZONE_A_X = 40
const ZONE_B_X = 290
const DUAL_ZONE_Y = 80
const DUAL_ZONE_W = 160
const DUAL_ZONE_H = 120

function blockWidth(numerator: number, denominator: number): number {
  return Math.round(BASE_BLOCK_WIDTH * (numerator / denominator))
}

const DENOM_COLORS: Record<number, string> = {
  2: '#6366f1',
  3: '#10b981',
  4: '#f59e0b',
  5: '#ef4444',
}

let blockIdCounter = 0
function nextBlockId(): string {
  return `block-${++blockIdCounter}`
}

function blocksOverlap(a: BlockState, b: BlockState): boolean {
  const ax = a.x, ay = a.y, aw = a.width, ah = a.height
  const bx = b.x, by = b.y, bw = b.width, bh = b.height
  return ax < bx + bw && ax + aw > bx && ay < by + bh && ay + ah > by
}

const ATTRACTION_RANGE = 60
const ATTRACTION_LERP = 0.15

function edgeDistance(a: BlockState, b: BlockState): number {
  const dx = Math.max(0, Math.max(a.x - (b.x + b.width), b.x - (a.x + a.width)))
  const dy = Math.max(0, Math.max(a.y - (b.y + b.height), b.y - (a.y + a.height)))
  return Math.sqrt(dx * dx + dy * dy)
}

const ZONE_RECT = { x: ZONE_X, y: ZONE_Y, width: ZONE_W, height: ZONE_H }
const ZONE_A_RECT = { x: ZONE_A_X, y: DUAL_ZONE_Y, width: DUAL_ZONE_W, height: DUAL_ZONE_H }
const ZONE_B_RECT = { x: ZONE_B_X, y: DUAL_ZONE_Y, width: DUAL_ZONE_W, height: DUAL_ZONE_H }
const ALL_ZONES = [ZONE_RECT, ZONE_A_RECT, ZONE_B_RECT]

function isInAnyZone(block: { x: number; y: number; width: number; height: number }): boolean {
  return ALL_ZONES.some(zone => isBlockInZone(block, zone))
}

function clearGlowing(blocks: BlockState[]): BlockState[] {
  if (!blocks.some(b => b.glowing)) return blocks
  return blocks.map(b => b.glowing ? { ...b, glowing: false } : b)
}

function resetAttraction(
  blocks: BlockState[],
  att: { targetId: string; origX: number; origY: number },
): BlockState[] {
  return blocks.map(b =>
    b.id === att.targetId
      ? { ...b, x: att.origX, y: att.origY, glowing: false }
      : b.glowing ? { ...b, glowing: false } : b
  )
}

function finalizeCombine(setBlocks: React.Dispatch<React.SetStateAction<BlockState[]>>): void {
  setBlocks(prev => {
    const animating = prev.filter(b => b.animate)
    if (animating.length !== 2) return prev
    const [a, b] = animating
    const combined = makeBlock(a.numerator + b.numerator, a.denominator, a.x, a.y)
    return [...prev.filter(bl => !bl.animate), combined]
  })
}

function startCombineAnimation(
  setBlocks: React.Dispatch<React.SetStateAction<BlockState[]>>,
  draggedId: string,
  targetId: string,
): void {
  setBlocks(prev => {
    const dragged = prev.find(b => b.id === draggedId)
    const target = prev.find(b => b.id === targetId)
    if (!dragged || !target) return prev

    const midX = (dragged.x + target.x) / 2
    const midY = (dragged.y + target.y) / 2
    return prev.map(b => {
      if (b.id === draggedId || b.id === targetId) {
        return { ...b, x: midX, y: midY, animate: true, glowing: false }
      }
      return b.glowing ? { ...b, glowing: false } : b
    })
  })

  setTimeout(() => finalizeCombine(setBlocks), COMBINE_ANIMATION_MS)
}

function makeBlock(numerator: number, denominator: number, x: number, y: number): BlockState {
  return {
    id: nextBlockId(),
    numerator,
    denominator,
    width: blockWidth(numerator, denominator),
    height: BLOCK_HEIGHT,
    x,
    y,
    color: DENOM_COLORS[denominator] ?? '#6366f1',
  }
}

function makeInitialBlocks(): BlockState[] {
  blockIdCounter = 0
  const blocks: BlockState[] = []
  let x = 10

  // 2x halves
  for (let i = 0; i < 2; i++) {
    blocks.push(makeBlock(1, 2, x, TRAY_Y))
    x += blockWidth(1, 2) + BLOCK_SPACING
  }
  // 4x quarters
  for (let i = 0; i < 4; i++) {
    blocks.push(makeBlock(1, 4, x, TRAY_Y))
    x += blockWidth(1, 4) + BLOCK_SPACING
  }
  // 3x thirds
  x = 10
  const row2Y = TRAY_Y + BLOCK_HEIGHT + BLOCK_SPACING
  for (let i = 0; i < 3; i++) {
    blocks.push(makeBlock(1, 3, x, row2Y))
    x += blockWidth(1, 3) + BLOCK_SPACING
  }
  // 5x fifths
  for (let i = 0; i < 5; i++) {
    blocks.push(makeBlock(1, 5, x, row2Y))
    x += blockWidth(1, 5) + BLOCK_SPACING
  }

  return blocks
}

function makeTrayBlocks(trayBlocks: { numerator: number; denominator: number }[]): BlockState[] {
  blockIdCounter = 0
  let x = 20
  return trayBlocks.map(({ numerator, denominator }) => {
    const block = makeBlock(numerator, denominator, x, TRAY_Y)
    x += block.width + 10
    return block
  })
}

function LessonApp() {
  const { state, dispatch } = useLesson()
  const [blocks, setBlocks] = useState<BlockState[]>(makeInitialBlocks)

  const currentStep = state.steps[state.currentStepIndex]
  const isDualZone = currentStep?.dualZone ?? false

  // Fire confetti burst when lesson completes
  useEffect(() => {
    if (state.phase !== 'complete') return

    const duration = 2500
    const end = Date.now() + duration
    let rafId = 0

    const frame = () => {
      confetti({
        particleCount: 3,
        angle: 60,
        spread: 55,
        origin: { x: 0, y: 0.7 },
      })
      confetti({
        particleCount: 3,
        angle: 120,
        spread: 55,
        origin: { x: 1, y: 0.7 },
      })

      if (Date.now() < end) {
        rafId = requestAnimationFrame(frame)
      }
    }

    // Initial big burst
    confetti({
      particleCount: 100,
      spread: 70,
      origin: { y: 0.6 },
    })

    // Continuous side streams
    rafId = requestAnimationFrame(frame)

    return () => cancelAnimationFrame(rafId)
  }, [state.phase])

  // Reset blocks when assessment step changes
  useEffect(() => {
    if (state.phase === 'assessment' && currentStep?.trayBlocks) {
      setBlocks(makeTrayBlocks(currentStep.trayBlocks))
    } else if (state.phase === 'idle' || state.phase === 'intro') {
      setBlocks(makeInitialBlocks())
    }
  }, [state.phase, state.currentStepIndex, currentStep])

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; startX: number; startY: number } | null>(null)
  const attractionRef = useRef<{ targetId: string; origX: number; origY: number } | null>(null)

  const svgPoint = useCallback((clientX: number, clientY: number) => {
    const svg = svgRef.current
    if (!svg) return { x: 0, y: 0 }
    const ctm = svg.getScreenCTM()
    if (!ctm) return { x: 0, y: 0 }
    return {
      x: (clientX - ctm.e) / ctm.a,
      y: (clientY - ctm.f) / ctm.d,
    }
  }, [])

  const onPointerDown = useCallback((e: ReactPointerEvent<SVGRectElement>, block: BlockState) => {
    e.currentTarget.setPointerCapture(e.pointerId)
    const pt = svgPoint(e.clientX, e.clientY)
    dragRef.current = { id: block.id, offsetX: pt.x - block.x, offsetY: pt.y - block.y, startX: pt.x, startY: pt.y }
  }, [svgPoint])

  const onPointerMove = useCallback((e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragRef.current) return
    const pt = svgPoint(e.clientX, e.clientY)
    const { id, offsetX, offsetY } = dragRef.current
    const newX = pt.x - offsetX
    const newY = pt.y - offsetY

    setBlocks(prev => {
      let updated = prev.map(b =>
        b.id === id ? { ...b, x: newX, y: newY } : b
      )

      const dragged = updated.find(b => b.id === id)
      if (!dragged) return updated

      // No attraction if dragged block is in a zone
      if (isInAnyZone(dragged)) {
        if (attractionRef.current) {
          const att = attractionRef.current
          attractionRef.current = null
          return resetAttraction(updated, att)
        }
        return clearGlowing(updated)
      }

      // Find closest compatible block within attraction range
      let closest: BlockState | null = null
      let closestDist = Infinity
      for (const b of updated) {
        if (b.id === id) continue
        if (b.denominator !== dragged.denominator) continue
        if (isInAnyZone(b)) continue
        if (!canCombine(
          { n: dragged.numerator, d: dragged.denominator as Denominator },
          { n: b.numerator, d: b.denominator as Denominator },
        )) continue
        // Use original position for distance if this block is currently attracted
        const bx = (attractionRef.current?.targetId === b.id) ? attractionRef.current.origX : b.x
        const by = (attractionRef.current?.targetId === b.id) ? attractionRef.current.origY : b.y
        const dist = edgeDistance(dragged, { ...b, x: bx, y: by })
        if (dist < closestDist) {
          closestDist = dist
          closest = b
        }
      }

      if (closest && closestDist < ATTRACTION_RANGE) {
        // Switch attraction target if needed
        if (attractionRef.current && attractionRef.current.targetId !== closest.id) {
          const att = attractionRef.current
          updated = updated.map(b =>
            b.id === att.targetId ? { ...b, x: att.origX, y: att.origY, glowing: false } : b
          )
        }
        if (!attractionRef.current || attractionRef.current.targetId !== closest.id) {
          attractionRef.current = { targetId: closest.id, origX: closest.x, origY: closest.y }
        }

        // Lerp attracted block toward dragged block
        const att = attractionRef.current!
        const target = updated.find(b => b.id === att.targetId)!
        const dcx = dragged.x + dragged.width / 2
        const dcy = dragged.y + dragged.height / 2
        const tcx = att.origX + target.width / 2
        const tcy = att.origY + target.height / 2
        const lerpX = att.origX + (dcx - tcx) * ATTRACTION_LERP
        const lerpY = att.origY + (dcy - tcy) * ATTRACTION_LERP

        return updated.map(b => {
          if (b.id === att.targetId) return { ...b, x: lerpX, y: lerpY, glowing: true }
          if (b.id === id) return { ...b, glowing: true }
          return b.glowing ? { ...b, glowing: false } : b
        })
      } else {
        // No block in range — reset attraction
        if (attractionRef.current) {
          const att = attractionRef.current
          attractionRef.current = null
          return resetAttraction(updated, att)
        }
        return clearGlowing(updated)
      }
    })
  }, [svgPoint])

  const splitBlockById = useCallback((blockId: string) => {
    // Use a ref to capture the new block IDs for the animation step
    let newBlockIds: string[] = []
    let origX = 0

    setBlocks(prev => {
      const block = prev.find(b => b.id === blockId)
      if (!block) return prev

      const frac: Fraction = { n: block.numerator, d: block.denominator as Denominator }
      const options = validSplitOptions(frac)
      if (options.length !== 1) return prev

      const parts = options[0]
      const pieces = splitFraction(frac, parts)
      if (!pieces) return prev

      origX = block.x
      const newBlocks = pieces.map((p) => makeBlock(p.n, p.d, block.x, block.y))
      newBlockIds = newBlocks.map(b => b.id)

      return [
        ...prev.filter(b => b.id !== block.id),
        ...newBlocks.map(b => ({ ...b, animate: false })),
      ]
    })

    // After a frame, spread them apart with animation
    requestAnimationFrame(() => {
      if (newBlockIds.length === 0) return
      const ids = new Set(newBlockIds)

      setBlocks(prev => {
        let currentX = origX
        return prev.map(b => {
          if (!ids.has(b.id)) return b
          const updated = { ...b, x: currentX, animate: true }
          currentX += b.width + BLOCK_SPACING
          return updated
        })
      })

      setTimeout(() => {
        setBlocks(prev => prev.map(b => b.animate ? { ...b, animate: false } : b))
      }, COMBINE_ANIMATION_MS)
    })
  }, [])

  const onPointerUp = useCallback((e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragRef.current) return
    const draggedId = dragRef.current.id
    const { startX, startY } = dragRef.current
    const pt = svgPoint(e.clientX, e.clientY)
    const dx = pt.x - startX
    const dy = pt.y - startY
    const wasTap = Math.abs(dx) < TAP_THRESHOLD && Math.abs(dy) < TAP_THRESHOLD
    dragRef.current = null

    // Clear attraction state
    const attraction = attractionRef.current
    attractionRef.current = null

    if (wasTap) {
      if (attraction) {
        setBlocks(prev => resetAttraction(prev, attraction))
      }
      splitBlockById(draggedId)
      return
    }

    // If there's an active attraction, auto-combine
    if (attraction) {
      startCombineAnimation(setBlocks, draggedId, attraction.targetId)
      return
    }

    // Normal combine: overlap-based, NOT inside comparison zones
    // Find the combine target from current state
    const currentBlocks = blocks
    const dragged = currentBlocks.find(b => b.id === draggedId)
    if (!dragged || isInAnyZone(dragged)) {
      setBlocks(clearGlowing)
      return
    }

    const target = currentBlocks.find(b =>
      b.id !== draggedId &&
      b.denominator === dragged.denominator &&
      !isInAnyZone(b) &&
      blocksOverlap(dragged, b) &&
      canCombine(
        { n: dragged.numerator, d: dragged.denominator as Denominator },
        { n: b.numerator, d: b.denominator as Denominator },
      )
    )
    if (!target) {
      setBlocks(clearGlowing)
      return
    }

    startCombineAnimation(setBlocks, draggedId, target.id)
  }, [svgPoint, splitBlockById, blocks])

  const hasBlocksInZone = isDualZone
    ? blocks.some(b => isBlockInZone(b, ZONE_A_RECT)) &&
      blocks.some(b => isBlockInZone(b, ZONE_B_RECT))
    : blocks.some(b => isBlockInZone(b, ZONE_RECT))

  const handleCheck = () => {
    if (isDualZone) {
      const sumA = sumBlocksInZone(blocks, ZONE_A_RECT)
      const sumB = sumBlocksInZone(blocks, ZONE_B_RECT)
      dispatch({
        type: 'CHECK_ANSWER',
        numerator: sumA.n,
        denominator: sumA.d,
        numerator2: sumB.n,
        denominator2: sumB.d,
      })
    } else {
      const { n, d } = sumBlocksInZone(blocks, ZONE_RECT)
      dispatch({ type: 'CHECK_ANSWER', numerator: n, denominator: d })
    }
  }

  const handleReset = () => {
    setBlocks(makeInitialBlocks())
    dispatch({ type: 'RESET' })
  }

  const showCheck = (state.phase === 'guided_discovery' || state.phase === 'assessment') && hasBlocksInZone
  const showExploreButton = state.phase === 'intro'
  const showLetsGoButton = state.phase === 'exploration'

  return (
    <div className="h-dvh w-full flex flex-col md:flex-row">
      {/* Chat panel: 40% height in portrait, 320px width in landscape */}
      <div className="h-[40dvh] md:h-auto md:w-80 shrink-0 border-b md:border-b-0 md:border-r border-border flex flex-col bg-card">
        <div className="p-3 border-b border-border font-semibold text-sm">
          Tutor Chat
        </div>
        <div className="flex-1 overflow-y-auto p-3 space-y-2">
          {state.messages.map((m, i) => (
            <div
              key={i}
              className={`text-sm rounded-lg px-3 py-2 max-w-[90%] ${
                m.role === 'tutor'
                  ? 'bg-primary/10 text-foreground'
                  : 'bg-muted text-muted-foreground ml-auto'
              }`}
            >
              <span className="font-medium text-xs opacity-60 block mb-0.5">
                {m.role === 'tutor' ? 'Tutor' : 'You'}
              </span>
              {m.text}
            </div>
          ))}
          {showExploreButton && (
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => dispatch({ type: 'BEGIN_EXPLORATION' })}
              >
                Start Exploring
              </Button>
            </div>
          )}
          {showLetsGoButton && (
            <div className="pt-2">
              <Button
                size="sm"
                onClick={() => dispatch({ type: 'FINISH_EXPLORATION' })}
              >
                Let's Go!
              </Button>
            </div>
          )}
        </div>
      </div>

      {/* SVG workspace: 60% height in portrait, flex-1 in landscape */}
      <div className="h-[60dvh] md:h-auto md:flex-1 flex flex-col items-center justify-center bg-background p-4 overflow-hidden">
        <svg
          ref={svgRef}
          viewBox="0 0 500 460"
          className="w-full max-w-[600px] border border-border rounded-lg bg-white"
          style={{ touchAction: 'none' }}
        >
          <defs>
            <filter id="attraction-glow" x="-30%" y="-30%" width="160%" height="160%">
              <feGaussianBlur in="SourceGraphic" stdDeviation="4" result="blur" />
              <feColorMatrix in="blur" type="matrix" values="1 0 0 0 0  0 1 0 0 0  0 0 1 0 0  0 0 0 0.5 0" result="softBlur" />
              <feMerge>
                <feMergeNode in="softBlur" />
                <feMergeNode in="SourceGraphic" />
              </feMerge>
            </filter>
          </defs>


          {isDualZone ? (
            <>
              {/* Zone A */}
              <rect
                x={ZONE_A_X}
                y={DUAL_ZONE_Y}
                width={DUAL_ZONE_W}
                height={DUAL_ZONE_H}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="8 4"
                rx={8}
              />
              <text
                x={ZONE_A_X + DUAL_ZONE_W / 2}
                y={DUAL_ZONE_Y - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#64748b"
              >
                Way 1
              </text>
              {/* Zone B */}
              <rect
                x={ZONE_B_X}
                y={DUAL_ZONE_Y}
                width={DUAL_ZONE_W}
                height={DUAL_ZONE_H}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="8 4"
                rx={8}
              />
              <text
                x={ZONE_B_X + DUAL_ZONE_W / 2}
                y={DUAL_ZONE_Y - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#64748b"
              >
                Way 2
              </text>
            </>
          ) : (
            <>
              {/* Single comparison zone */}
              <rect
                x={ZONE_X}
                y={ZONE_Y}
                width={ZONE_W}
                height={ZONE_H}
                fill="none"
                stroke="#94a3b8"
                strokeWidth={2}
                strokeDasharray="8 4"
                rx={8}
              />
              <text
                x={ZONE_X + ZONE_W / 2}
                y={ZONE_Y - 8}
                textAnchor="middle"
                fontSize={12}
                fill="#64748b"
              >
                Drop blocks here
              </text>
            </>
          )}

          {/* Tray label */}
          <text x={20} y={TRAY_Y - 12} fontSize={12} fill="#64748b">
            Block Tray
          </text>
          <line
            x1={20}
            y1={TRAY_Y - 4}
            x2={380}
            y2={TRAY_Y - 4}
            stroke="#e2e8f0"
            strokeWidth={1}
          />

          {/* Draggable blocks */}
          {blocks.map(block => (
            <g
              key={block.id}
              transform={`translate(${block.x}, ${block.y})`}
              className={block.animate ? 'block-animate' : undefined}
              filter={block.glowing ? 'url(#attraction-glow)' : undefined}
            >
              <rect
                x={0}
                y={0}
                width={block.width}
                height={block.height}
                fill={block.color}
                rx={6}
                opacity={0.85}
                cursor="grab"
                onPointerDown={e => onPointerDown(e, block)}
                onPointerMove={onPointerMove}
                onPointerUp={onPointerUp}
              />
              <text
                x={block.width / 2}
                y={block.height / 2 + 5}
                textAnchor="middle"
                fontSize={16}
                fontWeight="bold"
                fill="white"
                pointerEvents="none"
              >
                {block.numerator}/{block.denominator}
              </text>
            </g>
          ))}
        </svg>

        {/* Action buttons — fixed height to prevent layout shift */}
        <div className="mt-4 flex gap-2 h-12 items-center">
          {showCheck && (
            <Button onClick={handleCheck} size="lg">
              Check
            </Button>
          )}
          {state.phase === 'complete' && (
            <Button variant="outline" size="lg" onClick={handleReset}>
              Start Over
            </Button>
          )}
        </div>
      </div>
    </div>
  )
}

export default function App() {
  return (
    <LessonProvider>
      <LessonApp />
    </LessonProvider>
  )
}

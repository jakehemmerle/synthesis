import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '@/components/ui/button'
import { LessonProvider, useLesson } from '@/engine/lessonContext'
import { canCombine, split as splitFraction, validSplitOptions, type Fraction, type Denominator } from '@/model/fraction'
import { sumBlocksInZone as sumBlocksInZoneModel } from '@/model/workspace'

interface BlockState {
  id: string
  label: string
  numerator: number
  denominator: number
  width: number
  height: number
  x: number
  y: number
  color: string
  animate?: boolean
}

const TRAY_Y = 280
const ZONE_X = 180
const ZONE_Y = 80
const ZONE_W = 160
const ZONE_H = 120
const BLOCK_HEIGHT = 50
const BASE_BLOCK_WIDTH = 200 // width for a whole (1/1); scales by numerator/denominator

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

function isInZone(bx: number, by: number, bw: number, bh: number): boolean {
  const cx = bx + bw / 2
  const cy = by + bh / 2
  return cx > ZONE_X && cx < ZONE_X + ZONE_W && cy > ZONE_Y && cy < ZONE_Y + ZONE_H
}

const ZONE_RECT = { x: ZONE_X, y: ZONE_Y, width: ZONE_W, height: ZONE_H }

function sumBlocksInZone(blocks: BlockState[]): { n: number; d: number } {
  return sumBlocksInZoneModel(blocks, ZONE_RECT)
}

function makeBlock(numerator: number, denominator: number, x: number, y: number): BlockState {
  return {
    id: nextBlockId(),
    label: `${numerator}/${denominator}`,
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
  return [
    makeBlock(1, 2, 20, TRAY_Y),
    makeBlock(1, 4, 140, TRAY_Y),
    makeBlock(1, 4, 210, TRAY_Y),
    makeBlock(1, 4, 280, TRAY_Y),
  ]
}

function LessonApp() {
  const { state, dispatch } = useLesson()
  const [blocks, setBlocks] = useState<BlockState[]>(makeInitialBlocks)

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number; startX: number; startY: number } | null>(null)

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
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, x: pt.x - offsetX, y: pt.y - offsetY } : b
    ))
  }, [svgPoint])

  const TAP_THRESHOLD = 5

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
        const spacing = 8
        let currentX = origX
        return prev.map(b => {
          if (!ids.has(b.id)) return b
          const updated = { ...b, x: currentX, animate: true }
          currentX += b.width + spacing
          return updated
        })
      })

      setTimeout(() => {
        setBlocks(prev => prev.map(b => b.animate ? { ...b, animate: false } : b))
      }, 200)
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

    if (wasTap) {
      splitBlockById(draggedId)
      return
    }

    // Check for combine: does the dropped block overlap a same-denominator block?
    setBlocks(prev => {
      const dragged = prev.find(b => b.id === draggedId)
      if (!dragged) return prev

      const target = prev.find(b =>
        b.id !== draggedId &&
        b.denominator === dragged.denominator &&
        blocksOverlap(dragged, b) &&
        canCombine(
          { n: dragged.numerator, d: dragged.denominator as Denominator },
          { n: b.numerator, d: b.denominator as Denominator },
        )
      )
      if (!target) return prev

      // Animate both blocks to the midpoint
      const midX = (dragged.x + target.x) / 2
      const midY = (dragged.y + target.y) / 2
      return prev.map(b => {
        if (b.id === dragged.id || b.id === target.id) {
          return { ...b, x: midX, y: midY, animate: true }
        }
        return b
      })
    })

    // After animation, replace the two blocks with one combined block
    setTimeout(() => {
      setBlocks(prev => {
        const animating = prev.filter(b => b.animate)
        if (animating.length !== 2) return prev
        const [a, b] = animating
        const newNum = a.numerator + b.numerator
        const newDenom = a.denominator
        const combined = makeBlock(newNum, newDenom, a.x, a.y)
        return [...prev.filter(bl => !bl.animate), combined]
      })
    }, 200)
  }, [svgPoint, splitBlockById])

  const hasBlocksInZone = blocks.some(b => isInZone(b.x, b.y, b.width, b.height))

  const handleCheck = () => {
    const { n, d } = sumBlocksInZone(blocks)
    dispatch({ type: 'CHECK_ANSWER', numerator: n, denominator: d })
  }

  const handleReset = () => {
    setBlocks(makeInitialBlocks())
    dispatch({ type: 'RESET' })
  }

  const showCheck = state.phase === 'guided_discovery' && hasBlocksInZone
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
          viewBox="0 0 500 400"
          className="w-full max-w-[600px] border border-border rounded-lg bg-white"
          style={{ touchAction: 'none' }}
        >
          {/* Comparison zone */}
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
                {block.label}
              </text>
            </g>
          ))}
        </svg>

        {/* Action buttons */}
        <div className="mt-4 flex gap-2">
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

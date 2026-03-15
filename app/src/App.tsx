import { useRef, useState, useCallback, type PointerEvent as ReactPointerEvent } from 'react'
import { Button } from '@/components/ui/button'
import { LessonProvider, useLesson } from '@/engine/lessonContext'

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
}

const TRAY_Y = 280
const ZONE_X = 180
const ZONE_Y = 80
const ZONE_W = 160
const ZONE_H = 120

function isInZone(bx: number, by: number, bw: number, bh: number): boolean {
  const cx = bx + bw / 2
  const cy = by + bh / 2
  return cx > ZONE_X && cx < ZONE_X + ZONE_W && cy > ZONE_Y && cy < ZONE_Y + ZONE_H
}

function sumBlocksInZone(blocks: BlockState[]): { n: number; d: number } {
  let sum = 0
  for (const b of blocks) {
    if (isInZone(b.x, b.y, b.width, b.height)) {
      sum += b.numerator / b.denominator
    }
  }
  const n = Math.round(sum * 4)
  return { n, d: 4 }
}

function makeInitialBlocks(): BlockState[] {
  return [
    { id: 'half-1', label: '1/2', numerator: 1, denominator: 2, width: 100, height: 50, x: 20, y: TRAY_Y, color: '#6366f1' },
    { id: 'quarter-1', label: '1/4', numerator: 1, denominator: 4, width: 50, height: 50, x: 140, y: TRAY_Y, color: '#f59e0b' },
    { id: 'quarter-2', label: '1/4', numerator: 1, denominator: 4, width: 50, height: 50, x: 210, y: TRAY_Y, color: '#f59e0b' },
    { id: 'quarter-3', label: '1/4', numerator: 1, denominator: 4, width: 50, height: 50, x: 280, y: TRAY_Y, color: '#f59e0b' },
  ]
}

function LessonApp() {
  const { state, dispatch } = useLesson()
  const [blocks, setBlocks] = useState<BlockState[]>(makeInitialBlocks)

  const svgRef = useRef<SVGSVGElement>(null)
  const dragRef = useRef<{ id: string; offsetX: number; offsetY: number } | null>(null)

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
    dragRef.current = { id: block.id, offsetX: pt.x - block.x, offsetY: pt.y - block.y }
  }, [svgPoint])

  const onPointerMove = useCallback((e: ReactPointerEvent<SVGRectElement>) => {
    if (!dragRef.current) return
    const pt = svgPoint(e.clientX, e.clientY)
    const { id, offsetX, offsetY } = dragRef.current
    setBlocks(prev => prev.map(b =>
      b.id === id ? { ...b, x: pt.x - offsetX, y: pt.y - offsetY } : b
    ))
  }, [svgPoint])

  const onPointerUp = useCallback(() => {
    dragRef.current = null
  }, [])

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
    <div className="h-dvh w-full flex">
      {/* Chat panel */}
      <div className="w-80 shrink-0 border-r border-border flex flex-col bg-card">
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

      {/* SVG workspace */}
      <div className="flex-1 flex flex-col items-center justify-center bg-background p-4">
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
            <g key={block.id}>
              <rect
                x={block.x}
                y={block.y}
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
                x={block.x + block.width / 2}
                y={block.y + block.height / 2 + 5}
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

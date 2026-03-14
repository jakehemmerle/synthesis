# Design Document: Synthesis Tutor Clone

## Executive Summary

A frontend-only SPA teaching fraction equivalence (denominators 2-5) through a conversational tutor + interactive SVG manipulative. Built with React + TypeScript + shadcn/ui, deployed to Firebase Hosting (prod + staging). No backend, no auth, no persistence. One-week sprint.

The architecture is simple by design: a `useReducer` state machine drives lesson flow, pure functions handle fraction math, and SVG + pointer events power the touch-first manipulative on iPad.

## Architecture Overview

```
┌─────────────────────────────────────────────────────┐
│  App.tsx                                            │
│  └─ LessonProvider (React Context + useReducer)     │
│     ├─ LessonLayout (responsive portrait/landscape) │
│     │  ├─ ChatPanel (shadcn ScrollArea, Card, Button)│
│     │  └─ WorkspacePanel (SVG + pointer events)     │
│     └─ State: lesson step, messages, blocks, phase  │
├─────────────────────────────────────────────────────┤
│  Pure Logic Layer (no React, fully testable)        │
│  ├─ model/fraction.ts   — equivalence, combine, split│
│  ├─ model/workspace.ts  — block operations, hit test │
│  └─ engine/lessonEngine.ts — state machine transitions│
│     engine/lessonScript.ts — lesson data (steps, hints)│
└─────────────────────────────────────────────────────┘
```

## Key Design Decisions

### 1. State Management: useReducer + Context
Single reducer manages all state: lesson phase, chat messages, workspace blocks, assessment progress. No external library. Drag position is local (useRef) — only finalized drops dispatch to the reducer.

### 2. Fraction Model: Unit Fractions + Combined Blocks
Blocks start as unit fractions (1/N). When combined, two 1/4 blocks become one 2/4 block (numerator increases). This is simpler than a group system — combine replaces blocks, split replaces blocks. No grouping state needed.

**Critical insight from data model analysis:** With denominators 2-5, splitting is extremely limited. Only 1/2 can split into two 1/4s. Everything else produces denominators >5. The lesson should lean heavily on **combining**, not splitting.

**No clean cross-group equivalences:** Thirds and fifths are isolated from halves and quarters. Equivalence problems will mostly be: 1/2 = 2/4, and within same-denominator groups.

### 3. SVG + Pointer Events
SVG elements are DOM nodes (testable, CSS-animatable). Pointer events unify mouse/touch. `touch-action: none` on workspace prevents Safari gesture conflicts. Direct DOM manipulation during drag (bypasses React), commit on pointerup.

### 4. Responsive Layout
Single breakpoint at 768px. Landscape = side-by-side (chat 35%, workspace 65%). Portrait = stacked (chat 40%, workspace 60%). CSS media queries, no JS state needed. `h-dvh` for Safari viewport.

### 5. Workspace Zones
- **Block Tray** (top): Infinite/replenishing source of blocks
- **Work Area** (middle): Free-form manipulation canvas
- **Comparison Zone** (bottom): Two drop slots with "=" sign for equivalence checking

### 6. Assessment: No Fail State
3 problems, unlimited retries, escalating hints (general → specific → direct guidance). After 3+ wrong attempts, tutor walks through the answer.

### 7. Deployment
Firebase Hosting, one project, two sites (staging + prod). Manual deploy via `npm run deploy:staging` / `npm run deploy:prod`. CSP headers in firebase.json.

## Tech Stack

| Layer | Choice | Rationale |
|-------|--------|-----------|
| Framework | React + TypeScript | Component model maps to chat + workspace. Type safety for sprint speed. |
| UI Library | shadcn/ui + Tailwind | Clean components (Button, Card, ScrollArea). Source-owned, customizable. |
| Manipulative | SVG + Pointer Events | DOM nodes = testable, CSS transitions = GPU-animated, pointer events = touch-unified. |
| State | useReducer + Context | Single lesson, ~5 states. XState/Redux overkill. |
| Testing | Vitest (co-located) | TDD on model + engine layers. E2E is stretch. |
| Build | Vite | Fast HMR, tree-shaking, content-hashed assets. |
| Deploy | Firebase Hosting | Static SPA hosting with CDN, HTTPS, staging support. |
| CI/CD | None (manual) | 1-week sprint. `npm run build && firebase deploy`. |

## File Structure

```
src/
  model/
    fraction.ts + .test.ts     # Pure math: equivalence, combine, split, simplify
    workspace.ts + .test.ts    # Block operations, hit detection, zone checking
  engine/
    lessonEngine.ts + .test.ts # State machine reducer
    lessonScript.ts + .test.ts # Lesson content data
  components/
    ui/                        # shadcn generated (Button, Card, ScrollArea)
    ChatPanel.tsx              # Message list + action buttons
    ChatMessage.tsx            # Tutor/student bubble
    WorkspacePanel.tsx         # SVG container
    FractionBlock.tsx          # Draggable SVG block
    ComparisonZone.tsx          # Comparison drop zones
    CheckButton.tsx            # "Check my answer"
    LessonLayout.tsx           # Responsive wrapper
  hooks/
    usePointerDrag.ts          # Drag lifecycle with RAF gating
    useLesson.ts               # Connects engine to React state
  context/
    lessonContext.tsx           # Provider + hook
  App.tsx
```

## Core Types

```typescript
type Denominator = 2 | 3 | 4 | 5;
type Fraction = { n: number; d: Denominator };
type LessonPhase = 'intro' | 'exploration' | 'guided_discovery' | 'assessment' | 'complete';

interface FractionBlock {
  id: string;
  numerator: number;      // 1 for unit blocks; >1 when blocks combine (e.g., 2/4)
  denominator: Denominator;
  position: { x: number; y: number };
}
// Combine = replace two 1/4 blocks with one 2/4 block. No group system needed.

type LessonEvent =
  | { type: 'START_LESSON' }
  | { type: 'FINISH_EXPLORATION' }      // "Let's go!" button
  | { type: 'WORKSPACE_UPDATED'; blocks: FractionBlock[] }
  | { type: 'CHECK_ANSWER'; zoneBlocks: FractionBlock[] } // blocks currently in the comparison zone
  | { type: 'ADVANCE_STEP' }
  | { type: 'STUDENT_RESPONSE'; value: string }
  | { type: 'RESET' };                  // "Play Again"
```

## Interaction Design

| Gesture | Mechanic |
|---------|----------|
| **Drag block** | pointerdown (100ms hold) → pointermove (follows finger) → pointerup (snap or return) |
| **Combine** | Drop block on same-denomination block → merge animation → grouped block |
| **Split** | Tap 1/2 block (no drag) → immediately splits into two 1/4 blocks (no menu needed — only one valid split exists) |
| **Check answer** | Tap "Check" button → evaluate blocks in comparison zone → correct/incorrect feedback. Button visible only during `guided_discovery` and `assessment` phases. Disabled (grey) when comparison zone is empty; enabled (green) when blocks are placed. |
| **Phase transition** | "Let's go!" button in chat → exploration → guided discovery |

## Visual Design

| Denomination | Color | Width (of 280px whole) |
|-------------|-------|----------------------|
| 1/2 | Sky blue `#7EC8E3` | 140px |
| 1/3 | Mint green `#A8D5BA` | ~93px |
| 1/4 | Lavender `#C3B1E1` | 70px |
| 1/5 | Golden yellow `#F9D56E` | 56px |

All blocks: 64px height, 8px border-radius, 2px border, centered fraction label.

## iPad Safari Essentials (Day 1 Checklist)

1. Viewport meta: `width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no`
2. `touch-action: none` on SVG workspace
3. `position: fixed` + `overflow: hidden` on html/body (prevents rubber-band scroll)
4. `100dvh` not `100vh` (Safari toolbar bug)
5. `setPointerCapture` on drag start
6. SVG coordinate conversion via `getScreenCTM().inverse()`
7. CSS `transform` for animations (GPU-composited)

## Security (Minimal)

- CSP headers in firebase.json (self-only scripts, no connect, no frames)
- HTTPS enforced by Firebase
- No analytics, no tracking, no data collection → COPPA-safe
- `npm audit` once after setup
- **COPPA constraint:** If scope ever expands to include analytics, tracking, or any data collection, COPPA compliance (parental consent for under-13) becomes mandatory. Preserve the "collect nothing" posture.

## Performance (Non-Issue at This Scale)

~15 SVG blocks max, ~100KB gzip bundle, no backend. Main risk is Safari touch conflicts, not rendering performance. RAF-gated pointermove during drag. Direct DOM manipulation during drag, React state update on drop.

## Risk Mitigations

| Risk | Impact | Mitigation |
|------|--------|------------|
| iPad pointer events don't work as expected | HIGH | Day 1 spike: 30-min throwaway SVG drag test on real iPad. Fallback: tap-to-select + buttons instead of drag. |
| Comparison zone UX unclear for assessment problem 3 ("show two ways to make 1/2") | MEDIUM | Simplify: two separate answer zones, each checked independently. Student fills left zone, then right zone. |
| Day 5 overloaded (bugs + polish + demo video) | MEDIUM | Prod deploy moved to Day 4 evening. Day 5 is polish + video only. If bugs remain, cut STRETCH items. |
| SVG coordinate conversion edge cases | LOW | Use `getScreenCTM().inverse()` — inline 3-line helper, not a separate module. Tested in Day 1 spike. |

## Tradeoff Principles

When time is short, prioritize in this order (from evaluator):
1. **Pedagogical rigor** — the lesson must teach fraction equivalence correctly and clearly
2. **Visual polish** — interactions should feel smooth and engaging
3. **Code quality** — clean code matters, but ship > style

## TDD Approach

**Test-first for model and engine layers.** Write the test, watch it fail, write the implementation. This is strict TDD, not concurrent testing.

1. `fraction.test.ts` — equivalence, combine, split, simplify (pure math)
2. `workspace.test.ts` — block operations, zone checking, hit detection
3. `lessonEngine.test.ts` — state transitions, branching, hint escalation
4. `lessonScript.test.ts` — structural validation (no dead-end steps)

## REQUIRED vs STRETCH Classification

Based on the original requirements.md:

### REQUIRED (Must ship for demo)
1. Conversational chat interface with scripted tutor responses
2. Interactive fraction manipulative with visual blocks
3. Drag-to-combine interaction
4. Tap-to-split (1/2 → two 1/4s only — trivial, completes manipulative verbs from PRD)
5. Guided lesson flow: exploration → guided discovery → assessment
6. Simple branching for correct/incorrect answers
7. 3 assessment problems with retry
8. Runs on iPad browser (Safari)
9. Both portrait and landscape orientation
10. Deployed to Firebase Hosting (prod + staging)
11. README with setup instructions
12. 1-2 minute demo video

### STRETCH (Nice-to-have, only after REQUIRED is solid)
1. ~~Tap-to-split interaction~~ (moved to REQUIRED — only 1/2→1/4 split exists, trivial to implement)
2. Confetti celebration on completion
3. Typing indicator animation on tutor messages
4. Idle/inactivity nudges from tutor
5. Collapsible chat panel in portrait
6. E2E tests (Playwright)
7. Animated block merging/splitting
8. Progress bar (3-segment phase indicator)
9. Play Again button (vs browser refresh)
10. Loading state / splash screen
11. Error boundary with friendly message

## Tutor Voice & Sample Dialogue

The tutor's tone is **warm, encouraging, and conversational** — like a patient older sibling, not a teacher. Use short sentences, casual language, and positive reinforcement.

**Sample messages:**
- Greeting: "Hey there! Ready to play with some fractions? Check out those blocks up top — try dragging some into the work area!"
- Encouragement: "Nice one! You just put two quarters together."
- Hint (gentle): "Hmm, not quite. Look at how wide those blocks are — are they the same size?"
- Hint (specific): "Try dragging two 1/4 blocks together. See what happens!"
- Celebration: "You got it! Two quarters make a half — that's fraction equivalence!"
- Assessment intro: "Okay, challenge time! Can you show me a fraction that equals 1/2?"
- Completion: "You're a fractions superstar! You just proved that different fractions can be equal. High five!"

## Concrete Equivalence Problems

With denominators 2-5, the viable equivalence relationships are limited. Here are all valid problems:

**Guided discovery problems:**
1. "Show that 2/4 = 1/2" — drag two 1/4 blocks, compare with one 1/2 block
2. "Show that 2/2 = 4/4" — demonstrate that both equal a whole
3. "Can you make 1 whole using only fifths?" — drag five 1/5 blocks

**Assessment problems (3 required):**
1. "Make 1/2 using quarter blocks" → student places two 1/4 blocks (target: 1/2)
2. "Make 1 whole using third blocks" → student places three 1/3 blocks (target: 1)
3. "Show two different ways to make 1/2" → student places 1/2 on one side, 2/4 on the other

**Note:** Cross-group equivalences (halves↔thirds, halves↔fifths) don't produce clean integer numerators, so all equivalence problems stay within halves/quarters or within same-denominator groups.

## Demo Video Plan

**Recording method:** QuickTime on macOS with iPad connected via USB (captures touch indicators).
**Duration:** 60-90 seconds.
**Content to capture:**
1. App launch → tutor greeting (5s)
2. Exploration: drag blocks, combine two 1/4s (15s)
3. "Let's go!" → guided discovery: solve one equivalence (20s)
4. Assessment: solve 2 of 3 problems with correct/incorrect flow (30s)
5. Completion celebration (5s)

**Schedule:** Record on Day 5 afternoon, after prod deploy. Allow 2 hours.

## Sprint Plan

### Day 1: Foundation + Math Model + Pointer Spike
1. Project scaffolding: `npm create vite`, shadcn/ui init, Vitest setup
2. **Firebase project creation**: create project, configure hosting site (prod), set deploy target, verify `firebase deploy` works with empty app. SPA rewrite rule in firebase.json.
3. Viewport meta tag, `touch-action` CSS, `position: fixed` body — iPad essentials from checklist
4. **iPad pointer event spike (30 min)**: create a throwaway SVG with a draggable rect using pointer events. Deploy to staging. Test on real iPad Safari. Confirms: pointer events work, `touch-action: none` prevents scroll, `setPointerCapture` works, coordinate conversion via `getScreenCTM()` is correct. **This retires the #1 technical risk early.**
5. `fraction.ts` — TDD: write tests first, then implement `simplify`, `areEquivalent`, `canCombine`, `combine`, `split`, `validSplitOptions`
6. `workspace.ts` — TDD: block operations, zone checking (can parallel with fraction.ts). Use SVG native pointer events for hit detection rather than manual coordinate math.
7. Draft README skeleton

**Exit gate:** `npm test` passes, `firebase deploy` succeeds with placeholder app, pointer spike verified on iPad

### Day 2: Lesson Engine + Content
1. `lessonEngine.ts` — TDD: state machine reducer with all phase transitions
2. `lessonScript.ts` — **author full lesson content**:
   - Welcome message + exploration prompts (3-4 messages)
   - "Let's go!" transition
   - 3 guided discovery steps with prompts, hints (2 per step), success responses
   - Guided→assessment transition message
   - 3 assessment problems with prompts, hints (2 per problem), success responses
   - Completion celebration message
   - Total: ~25-30 tutor messages, ~12 hints
3. `lessonScript.test.ts` — structural validation: all step IDs exist, no dead ends, all transitions resolve
4. `lessonContext.tsx` — React context provider + `useLesson` hook
5. SVG coordinate conversion utility (`getScreenCTM().inverse()`)

**Exit gate:** Lesson engine passes all transition tests, script covers full lesson flow

### Day 3: UI + Touch Interactions
Priority order (if time is tight, stop at #3 — that's minimum viable UI):
1. `LessonLayout.tsx` — responsive portrait/landscape wrapper
2. `ChatPanel.tsx` + `ChatMessage.tsx` — message list with shadcn ScrollArea, action buttons
3. `WorkspacePanel.tsx` + `FractionBlock.tsx` — SVG blocks with drag via `usePointerDrag` hook
4. `ComparisonZone.tsx` — comparison drop zones with hit detection
5. `CheckButton.tsx` — phase-aware visibility and enabled/disabled state
6. Block combine on drop (same-denomination overlap detection)
7. Tap-to-split for 1/2 blocks (simple: only one valid split)
8. **iPad smoke test**: deploy to staging, verify drag/combine works on real iPad

9. **Component smoke tests**: `lessonContext.test.tsx` (provider renders, dispatch works), `ChatPanel.test.tsx` (renders messages), `WorkspacePanel.test.tsx` (renders blocks) — using React Testing Library

**Exit gate:** `npm test` passes (all model + engine + component tests). Blocks draggable and combine working on real iPad Safari. Orientation switch doesn't break layout.

### Day 4: Integration + Assessment + Staging Deploy
1. Wire lesson engine to UI — chat messages drive workspace setup, workspace actions evaluate via engine
2. Guided discovery flow end-to-end (3 problems with hints)
3. Assessment flow end-to-end (3 problems with escalating hints)
4. **iPad test checklist**: drag-and-drop, combine, split, orientation switch, comparison zones, check button, lesson completion
5. **Confirm target iPad model** (default: iPad Air / 10th-gen if unspecified)
6. Deploy to staging, full playthrough on iPad
7. **Deploy to prod** (evening, after staging verification passes)

8. **Integration test**: `lessonFlow.test.tsx` — simulated full lesson: dispatch START → FINISH_EXPLORATION → CHECK_ANSWER (correct) → ADVANCE through all steps → verify phase reaches 'complete'

**Exit gate:** `npm test` passes (all tests including integration). Full lesson playable on real iPad: all 3 guided + 3 assessment problems work, hints fire on wrong answer, completion screen shows. Prod URL loads and works.

### Day 5: Polish + Demo Video + README
1. Fix any iPad bugs found during Day 4 testing
2. Visual polish: animations, colors, spacing (guided by evaluator priority: pedagogy > polish > code)
3. STRETCH items if time permits (confetti, typing indicator, progress bar, play again)
4. Write README: what it is, how to run, how to deploy, technical approach, live URL
5. Record demo video (allow 2 hours): QuickTime via USB, 60-90 second walkthrough
6. Final staging + prod deploy with all polish

**Exit gate:** Demo video recorded, README complete, prod live and tested.

# API & Interface Design

## Component Architecture

### Component Tree

```
<App>
  <LessonProvider>              // Context provider for lesson state
    <ResponsiveLayout>          // Switches between portrait/landscape
      <ChatPanel>
        <MessageList>
          <TutorMessage />      // Tutor speech bubble
          <StudentAction />     // Button choices / "Check" confirmation
        </MessageList>
        <ActionBar />           // "Let's go!" button, response buttons
      </ChatPanel>
      <WorkspacePanel>
        <FractionWorkspace>     // SVG container with pointer event handling
          <FractionBlock />     // Individual draggable fraction piece
          <SnapZone />          // Alignment/comparison zones
          <SplitMenu />         // Popover when tapping a block
        </FractionWorkspace>
        <BlockTray />           // Source tray: drag new blocks from here
        <CheckButton />        // "Check my answer" button
      </WorkspacePanel>
    </ResponsiveLayout>
  </LessonProvider>
</App>
```

### Key Component Interfaces

```typescript
// --- Layout ---

interface ResponsiveLayoutProps {
  chatPanel: ReactNode;
  workspacePanel: ReactNode;
}
// Renders side-by-side in landscape, stacked in portrait.
// Uses CSS container queries or a useMediaQuery hook. No prop-driven
// breakpoint logic — keep it in CSS/Tailwind.

// --- Chat ---

interface TutorMessageProps {
  text: string;
  animate?: boolean;  // typewriter effect
}

interface ActionBarProps {
  actions: LessonAction[];       // current available actions
  onAction: (id: string) => void;
}

type LessonAction = {
  id: string;
  label: string;
  variant?: "default" | "primary";  // shadcn Button variants
};

// --- Workspace ---

interface FractionBlockProps {
  block: FractionBlockModel;
  onDragStart: (id: string) => void;
  onDragEnd: (id: string, position: Point) => void;
  onTap: (id: string) => void;
}

interface BlockTrayProps {
  availableDenominators: Denominator[];
  onSpawn: (denominator: Denominator) => void;
}

interface CheckButtonProps {
  visible: boolean;
  onCheck: () => void;
}
```

## Lesson Engine Interface

The lesson engine is a finite state machine. No library needed — a plain
`useReducer` is sufficient for the number of states in a single lesson.

### States

```typescript
type LessonPhase =
  | "intro"              // Tutor greeting
  | "exploration"        // Free play with blocks
  | "guided_discovery"   // Tutor asks student to make equivalences
  | "assessment"         // 3 check-for-understanding problems
  | "complete";          // Celebration screen

type GuidedStep = {
  id: string;
  prompt: string;                     // tutor says this
  goal: EquivalenceGoal;              // what the workspace must show
  hints: string[];                    // escalating hints on wrong answers
  successResponse: string;            // tutor says this on success
  hintIndex: number;                  // tracks how many hints given
};

type EquivalenceGoal = {
  targetFraction: Fraction;           // e.g. { n: 1, d: 2 }
  requiredDenominator?: Denominator;  // e.g. must use quarters
};

type LessonState = {
  phase: LessonPhase;
  messages: ChatMessage[];
  currentStepIndex: number;           // index into guided/assessment steps
  workspaceBlocks: FractionBlockModel[];
  steps: GuidedStep[];                // loaded from lesson script
  assessmentSteps: GuidedStep[];
};
```

### Actions (Reducer)

```typescript
type LessonEvent =
  | { type: "START_LESSON" }
  | { type: "BEGIN_EXPLORATION" }
  | { type: "FINISH_EXPLORATION" }      // "Let's go!" button
  | { type: "WORKSPACE_UPDATED"; blocks: FractionBlockModel[] }
  | { type: "CHECK_ANSWER" }
  | { type: "ADVANCE_STEP" }
  | { type: "RESET_WORKSPACE" };

function lessonReducer(state: LessonState, event: LessonEvent): LessonState;
```

### Transition Rules

```
intro           → BEGIN_EXPLORATION    → exploration
exploration     → FINISH_EXPLORATION   → guided_discovery (step 0)
guided_discovery→ CHECK_ANSWER         → evaluate workspace against goal
                  if correct & more steps → ADVANCE_STEP (next guided step)
                  if correct & last step  → assessment (step 0)
                  if incorrect            → append hint, stay
assessment      → CHECK_ANSWER         → evaluate
                  if correct & more      → ADVANCE_STEP
                  if correct & last      → complete
                  if incorrect           → append hint, stay
complete        → (terminal)
```

The reducer is pure. Side effects (e.g., triggering typewriter animation)
happen in the component layer via `useEffect` watching state changes.

## Fraction Model API

```typescript
// --- Core types ---

type Denominator = 2 | 3 | 4 | 5;

interface Fraction {
  n: number;  // numerator (always positive integer)
  d: Denominator;
}

interface FractionBlockModel {
  id: string;
  fraction: Fraction;
  position: Point;   // SVG coordinates
}

interface Point {
  x: number;
  y: number;
}

// --- Pure functions (unit-testable, no state) ---

/** Reduce fraction to lowest terms. e.g. 2/4 → 1/2 */
function simplify(f: Fraction): Fraction;

/** Are two fractions equal in value? Uses cross-multiplication. */
function areEquivalent(a: Fraction, b: Fraction): boolean;

/** Can these blocks combine? Same denominator, sum ≤ 1. */
function canCombine(a: Fraction, b: Fraction): boolean;

/** Combine two fractions (same denominator). Returns null if invalid. */
function combine(a: Fraction, b: Fraction): Fraction | null;

/** Split a fraction into n equal parts. Returns null if not evenly divisible
 *  or result denominator > 5. */
function split(f: Fraction, parts: number): Fraction[] | null;

/** What split options are valid for this fraction? */
function validSplitOptions(f: Fraction): number[];

/** Does the set of blocks on the workspace satisfy the goal?
 *  Checks if blocks in a snap zone sum to the target fraction. */
function checkGoal(
  blocks: FractionBlockModel[],
  goal: EquivalenceGoal,
  snapZones: SnapZone[]
): boolean;
```

**Design rationale:** All fraction logic is pure functions, not class methods.
This makes TDD trivial — each function gets a test file with table-driven
cases. No mocking needed.

**Denominator constraint:** `split()` returns `null` when the resulting
denominator would exceed 5. This prevents UI complexity explosion. For example,
splitting a 1/3 into 2 parts would create 1/6, which is out of range — so
the split menu simply won't offer "into 2" for thirds.

## Event Flow

User interactions propagate through three layers:

```
┌─────────────────────────────────────────────────────┐
│  SVG Pointer Events / Button Clicks                 │  Layer 1: Browser
│  (onPointerDown, onPointerMove, onPointerUp, onClick)│
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Workspace Handlers (drag state, hit detection)     │  Layer 2: Component
│  - useDrag() hook manages drag lifecycle            │
│  - Snap detection on drop                           │
│  - Split menu on tap (no drag)                      │
│  - Calls dispatch() with workspace results          │
└────────────────────┬────────────────────────────────┘
                     │
                     ▼
┌─────────────────────────────────────────────────────┐
│  Lesson Reducer (pure state transitions)            │  Layer 3: State
│  - WORKSPACE_UPDATED, CHECK_ANSWER, etc.            │
│  - Returns new LessonState                          │
└─────────────────────────────────────────────────────┘
```

### Concrete flows

**Drag-and-combine:**
1. `onPointerDown` on FractionBlock → `useDrag` starts tracking
2. `onPointerMove` → block follows pointer (local state, NOT reducer)
3. `onPointerUp` → hit-test against other blocks
4. If overlap + `canCombine()` → create combined block, remove originals
5. Dispatch `WORKSPACE_UPDATED` with new block list

**Tap-to-split:**
1. `onPointerUp` with no significant movement → treat as tap
2. Show `<SplitMenu>` anchored to block (shadcn `Popover`)
3. Menu shows `validSplitOptions(block.fraction)`
4. User picks option → call `split()` → replace block with parts
5. Dispatch `WORKSPACE_UPDATED`

**Check answer:**
1. User clicks `<CheckButton>`
2. Dispatch `CHECK_ANSWER`
3. Reducer calls `checkGoal()` against current workspace
4. If pass → append success message, advance step
5. If fail → append next hint from `hints[]` array

**Key rule:** Drag position is local component state (useState or useRef),
NOT in the reducer. Only finalized workspace changes go through dispatch.
This avoids reducer churn on every pointer-move frame.

## State Management

**Approach: React Context + useReducer. No external library.**

Rationale:
- Single lesson, single screen, ~5 state fields. Zustand/Redux are overkill.
- `useReducer` gives us a pure reducer function we can test without React.
- Context provides the state + dispatch to both ChatPanel and WorkspacePanel
  without prop drilling.
- No async state (no API calls, no persistence). No need for middleware.

```typescript
// lesson-context.tsx

interface LessonContextValue {
  state: LessonState;
  dispatch: React.Dispatch<LessonEvent>;
}

const LessonContext = createContext<LessonContextValue | null>(null);

function LessonProvider({ children }: { children: ReactNode }) {
  const [state, dispatch] = useReducer(lessonReducer, initialLessonState);
  return (
    <LessonContext.Provider value={{ state, dispatch }}>
      {children}
    </LessonContext.Provider>
  );
}

function useLessonState() {
  const ctx = useContext(LessonContext);
  if (!ctx) throw new Error("useLessonState must be inside LessonProvider");
  return ctx;
}
```

**What lives outside the reducer:**
- Drag position (local to `FractionBlock`, useRef for performance)
- Split menu open/close (local to `FractionWorkspace`)
- Typewriter animation progress (local to `TutorMessage`)
- Orientation (CSS media query, no JS state needed)

## shadcn/ui Components Used

| shadcn component | Usage | Customization |
|---|---|---|
| `Button` | Action buttons, "Let's go!", "Check" | Large touch targets (min 48px), rounded, kid-friendly colors |
| `Popover` | Split menu on block tap | Anchor to SVG block position via portal |
| `Card` | Chat message bubbles | Tutor vs. system styling via variants |
| `ScrollArea` | Chat message list | Auto-scroll to bottom on new message |
| `Badge` | Fraction labels on blocks | Display "1/2", "1/4" etc. on blocks |

**Do not use** shadcn's Dialog, Sheet, or navigation components. This is a
single-screen app with no routing.

**Touch target rule:** Every interactive element must be at least 48x48px
(Apple HIG minimum). Apply via Tailwind: `min-h-12 min-w-12`.

## Key Trade-offs

### 1. useReducer vs. XState
**Chose useReducer.** XState adds type-safe state charts and guards, which
would be ideal for a production lesson engine. But for a single lesson with
~5 states, the learning curve and boilerplate aren't worth it. The reducer
is <100 lines and fully testable with plain Jest/Vitest.

### 2. Pure functions vs. FractionBlock class
**Chose pure functions.** A `FractionBlock` class with methods like
`.combine(other)` is more OOP-natural but harder to test in isolation and
serializes poorly. Pure functions with plain data objects are trivially
testable with table-driven tests and work cleanly with React's immutable
state model.

### 3. SVG vs. Canvas for manipulatives
**Chose SVG (already decided).** SVG gives us DOM nodes per block, which
means pointer events per element, CSS transitions for animations, and easy
hit detection. Canvas would require manual hit-testing. SVG is the right
call for this block count (never more than ~10-15 blocks on screen).

### 4. Drag state in reducer vs. local
**Chose local.** Dispatching on every pointer-move would re-render the
entire tree 60 times/second. Drag position stays in a ref; only the final
drop result dispatches to the reducer.

### 5. Single context vs. split contexts
**Chose single context.** With this few consumers (ChatPanel, WorkspacePanel,
ActionBar), splitting into separate contexts for "chat" vs. "workspace" adds
complexity for no measurable gain. If re-render performance becomes an issue,
`React.memo` on child components is the first fix.

## Implementation Notes

### File structure (suggested)

```
src/
  model/
    fraction.ts          # Fraction type + pure functions
    fraction.test.ts     # Table-driven unit tests
  engine/
    lesson-reducer.ts    # Reducer + state types
    lesson-reducer.test.ts
    lesson-script.ts     # The actual lesson content (steps, prompts, hints)
  context/
    lesson-context.tsx   # Provider + useLessonState hook
  components/
    layout/
      ResponsiveLayout.tsx
    chat/
      ChatPanel.tsx
      TutorMessage.tsx
      ActionBar.tsx
    workspace/
      FractionWorkspace.tsx
      FractionBlock.tsx
      BlockTray.tsx
      SplitMenu.tsx
      CheckButton.tsx
      SnapZone.tsx
    ui/                  # shadcn components (auto-generated)
  hooks/
    useDrag.ts           # Pointer event drag logic
    useMediaQuery.ts     # Orientation detection
  App.tsx
```

### TDD order (matches sprint plan)

1. `fraction.ts` + tests — all pure functions, no React
2. `lesson-reducer.ts` + tests — pure reducer, no React
3. `useDrag.ts` — manual testing on iPad
4. Components — integration with reducer via context

### Gotchas for the sprint

- **Pointer events, not touch events.** Use `onPointerDown`/`onPointerMove`/
  `onPointerUp`. They unify mouse and touch. Set `touch-action: none` on the
  SVG container to prevent browser scroll/zoom interference.

- **SVG coordinate transforms.** When converting pointer events to SVG space,
  use `svgElement.getScreenCTM()?.inverse()` to get the correct coordinates.
  Don't assume 1:1 pixel mapping.

- **Block spawning from tray.** The tray sits outside the SVG. On drag-start
  from the tray, create a new block in the SVG at the pointer position and
  immediately start dragging it. This avoids cross-container drag complexity.

- **Lesson script is data, not code.** Define the guided steps and assessment
  problems as a JSON-like constant in `lesson-script.ts`. This makes it easy
  to tweak prompts and hints without touching logic.

- **Typewriter effect.** Use a simple `useEffect` with `setInterval` that
  reveals one character at a time. Cancel on unmount. Don't over-engineer
  this — a 20-line hook is fine.

- **"Check" button visibility.** Only show the Check button when the current
  phase expects a workspace answer (guided_discovery, assessment). Hide
  during intro, exploration, and complete phases. This is derived state:
  `const showCheck = state.phase === "guided_discovery" || state.phase === "assessment"`.

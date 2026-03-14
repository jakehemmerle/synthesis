# Data Model Design

## Fraction Block Model

A fraction block is the atomic unit students interact with. Each block represents a single fraction piece (e.g., one 1/4 piece, one 1/3 piece).

```typescript
type Denominator = 2 | 3 | 4 | 5;

interface FractionBlock {
  id: string;                    // unique ID, e.g. "block-abc123"
  numerator: 1;                  // always 1 — blocks are unit fractions
  denominator: Denominator;
  position: { x: number; y: number };  // SVG coordinates in workspace
  state: 'idle' | 'dragging' | 'snapping' | 'merging' | 'splitting';
  groupId: string | null;        // non-null when combined with other blocks
}
```

**Why unit fractions only:** Blocks always represent 1/N. A "2/4" is represented as two 1/4 blocks in a group, not a single block with numerator=2. This matches the physical manipulative metaphor — you hold individual pieces and put them together. The fraction label shown to the student (e.g., "2/4") is derived from the group, not stored on individual blocks.

```typescript
interface FractionGroup {
  id: string;
  blockIds: string[];            // ordered list of blocks in this group
  denominator: Denominator;      // all blocks in a group share a denominator
}
```

**Derived value:** A group's fraction value is `blockIds.length / denominator`. A single ungrouped block has implicit value `1 / denominator`.

```typescript
function groupValue(group: FractionGroup): { numerator: number; denominator: Denominator } {
  return { numerator: group.blockIds.length, denominator: group.denominator };
}

function blockValue(block: FractionBlock): number {
  return 1 / block.denominator;
}
```

## Workspace State

The workspace holds all blocks and groups currently visible in the manipulative area.

```typescript
interface WorkspaceState {
  blocks: Record<string, FractionBlock>;  // keyed by block.id
  groups: Record<string, FractionGroup>;  // keyed by group.id
  dropZones: DropZone[];                  // comparison slots, answer areas
  activeBlockId: string | null;           // block currently being dragged
}

interface DropZone {
  id: string;
  label: string;                          // e.g., "Show 1/2 here"
  bounds: { x: number; y: number; width: number; height: number };
  acceptedBlockIds: string[];             // blocks/groups currently placed here
  targetValue: number | null;             // expected fraction value for checking
}
```

**Block tray:** The workspace also needs a source tray from which students pull new blocks. This isn't modeled as workspace state — it's UI chrome. The tray generates new `FractionBlock` instances on drag-start.

```typescript
interface BlockTray {
  availableDenominators: Denominator[];   // which block types are available
  // Tapping a denominator in the tray creates a new FractionBlock
}
```

## Lesson Script Structure

The lesson is a finite state machine. Each node is a "step" the tutor is on. Transitions fire based on student actions or button clicks.

```typescript
type StepId = string;  // e.g., "welcome", "explore", "guided-1", "assess-1"

interface LessonStep {
  id: StepId;
  phase: 'exploration' | 'guided' | 'assessment' | 'celebration';
  tutor: TutorMessage;
  workspace?: WorkspaceSetup;             // optional: configure workspace for this step
  transitions: Transition[];
  onEnter?: LessonAction[];               // side effects when entering this step
}

interface TutorMessage {
  text: string;                           // what the tutor says
  responseOptions?: ResponseOption[];     // clickable buttons for the student
  hint?: string;                          // shown after wrong attempt or timeout
  hint2?: string;                         // escalated hint after 2nd wrong attempt
}

interface ResponseOption {
  label: string;       // button text
  value: string;       // key used in transition matching
  isCorrect?: boolean; // for assessment steps
}

interface Transition {
  on: TransitionTrigger;
  target: StepId;
  condition?: TransitionCondition;
}

type TransitionTrigger =
  | { type: 'button_click'; value: string }        // student clicks a response button
  | { type: 'workspace_check'; }                    // student hits the "Check" button
  | { type: 'auto'; delayMs?: number }              // automatic after delay

interface TransitionCondition {
  type: 'workspace_matches';
  targetValue: number;        // expected decimal value of the answer zone
  zoneId: string;             // which drop zone to check
}

interface WorkspaceSetup {
  clearExisting: boolean;
  preloadBlocks?: Omit<FractionBlock, 'id' | 'state'>[];
  dropZones?: Omit<DropZone, 'acceptedBlockIds'>[];
  availableDenominators?: Denominator[];
}

type LessonAction =
  | { type: 'clear_workspace' }
  | { type: 'show_celebration' }
  | { type: 'increment_attempts' }
  | { type: 'set_available_denominators'; denominators: Denominator[] };
```

**Example step:**

```typescript
const guidedStep1: LessonStep = {
  id: 'guided-1',
  phase: 'guided',
  tutor: {
    text: "Can you make 1/2 using quarter blocks? Drag them into the answer zone and hit Check!",
    hint: "Try dragging two 1/4 blocks together.",
    hint2: "Two quarters make a half — drag two 1/4 blocks into the zone.",
  },
  workspace: {
    clearExisting: true,
    availableDenominators: [4],
    dropZones: [{ id: 'answer', label: 'Make 1/2', bounds: { x: 200, y: 100, width: 300, height: 200 }, targetValue: 0.5 }],
  },
  transitions: [
    { on: { type: 'workspace_check' }, target: 'guided-1-correct', condition: { type: 'workspace_matches', targetValue: 0.5, zoneId: 'answer' } },
    { on: { type: 'workspace_check' }, target: 'guided-1-retry' },  // fallthrough if condition fails
  ],
};
```

**Full lesson graph (simplified):**

```
welcome → explore → (button: "Let's go!") → guided-1 → guided-1-correct → guided-2 → ... → assess-1 → assess-2 → assess-3 → celebration
                                                 ↓                                          ↓
                                           guided-1-retry (loops back with hint)       assess-1-retry (with escalating hints)
```

## Assessment Model

Assessment is lightweight: a list of problems, each checked via the workspace.

```typescript
interface AssessmentState {
  problems: AssessmentProblem[];
  currentProblemIndex: number;
  completed: boolean;
}

interface AssessmentProblem {
  id: string;
  prompt: string;                         // "Show me 2/5 using other blocks"
  targetValue: number;                    // 0.4
  allowedDenominators: Denominator[];     // which blocks are available
  forbiddenDenominator?: Denominator;     // e.g., can't use fifths to show 2/5
  attempts: number;
  maxHints: number;                       // 2 — after which we give the answer
  hintsShown: number;
  solved: boolean;
}
```

**Scoring:** There's no score. Students get unlimited retries with escalating hints. After hint2, the tutor walks them through the answer, marks it solved, and moves on. This matches "no fail state" from the PRD.

**Hint escalation logic:**

```typescript
function getHintLevel(problem: AssessmentProblem): 'none' | 'hint1' | 'hint2' | 'show_answer' {
  if (problem.attempts === 0) return 'none';
  if (problem.attempts === 1) return 'hint1';
  if (problem.attempts === 2) return 'hint2';
  return 'show_answer';
}
```

## Key Operations

### Combine (Group)

When a block is dragged onto another block with the **same denominator**, they form or join a group.

```typescript
function combineBlocks(
  state: WorkspaceState,
  draggedId: string,
  targetId: string
): WorkspaceState {
  const dragged = state.blocks[draggedId];
  const target = state.blocks[targetId];

  // Only combine same-denominator blocks
  if (dragged.denominator !== target.denominator) return state;

  const targetGroupId = target.groupId;
  const draggedGroupId = dragged.groupId;

  if (targetGroupId) {
    // Target already in a group — add dragged to that group
    const group = state.groups[targetGroupId];
    const updatedGroup = {
      ...group,
      blockIds: [...group.blockIds, ...(draggedGroupId ? state.groups[draggedGroupId].blockIds : [draggedId])],
    };
    // Remove dragged's old group if it had one
    // Update block.groupId for all moved blocks
    // ...return updated state
  } else {
    // Create new group with both blocks
    const newGroupId = generateId();
    const newGroup: FractionGroup = {
      id: newGroupId,
      blockIds: [targetId, draggedId],
      denominator: target.denominator,
    };
    // Set groupId on both blocks, add group to state
    // ...return updated state
  }
}
```

**Visual result:** Grouped blocks snap together visually, showing their combined width. Two 1/4 blocks grouped together render as a bar half the width of the whole.

### Split

Tapping a block shows a split menu. Splitting a 1/2 block "into 2" replaces it with two 1/4 blocks. Splitting "into N" replaces one 1/D block with N blocks of 1/(D*N) — but only if D*N is a supported denominator.

```typescript
function getValidSplits(block: FractionBlock): number[] {
  const validTargets: number[] = [];
  for (const splitFactor of [2, 3, 4, 5]) {
    const newDenom = block.denominator * splitFactor;
    if (newDenom <= 5) {  // only denominators 2-5 supported
      // Actually this means: 2*2=4 ok, 2*... wait, let's enumerate:
      // 1/2 split into 2 → two 1/4 blocks  (2*2=4, valid)
      // 1/2 split into ... that's really the only one, since 2*3=6 > 5
      // So split options are very limited with denom 2-5
      validTargets.push(splitFactor);
    }
  }
  return validTargets;
}

// Actually, the valid splits given denominators 2-5:
// 1/2 → split into 2 → two 1/4   (only valid split)
// 1/3 → no valid splits (3*2=6 > 5)
// 1/4 → no valid splits (4*2=8 > 5)
// 1/5 → no valid splits (5*2=10 > 5)
```

**Important realization:** With denominators limited to 2-5, splitting only works for 1/2 → two 1/4. This is very constrained. The primary interaction model should be **combining** (pulling unit fraction blocks from the tray and grouping them), not splitting. Splitting is a nice-to-have for halves only.

A better approach: instead of "split this block into smaller pieces," offer a **replace** operation — swap a 1/2 block for two 1/4 blocks (or vice versa). This is pedagogically clearer anyway: "Look, I can trade one 1/2 for two 1/4s!"

```typescript
type ReplaceOption = {
  fromCount: number;
  fromDenominator: Denominator;
  toCount: number;
  toDenominator: Denominator;
};

// Pre-computed equivalences for denominators 2-5:
const REPLACEMENTS: ReplaceOption[] = [
  { fromCount: 1, fromDenominator: 2, toCount: 2, toDenominator: 4 },
  { fromCount: 2, fromDenominator: 4, toCount: 1, toDenominator: 2 },
  // No clean replacements exist between thirds/fifths and halves/quarters
  // because 1/3 ≠ any N/2, N/4, N/5 with integer N (and vice versa)
];
```

### Equivalence Checking

The core algorithm for "Check" button — does the workspace answer zone contain blocks whose total value equals the target?

```typescript
function checkEquivalence(
  state: WorkspaceState,
  zoneId: string
): { correct: boolean; studentValue: number; targetValue: number } {
  const zone = state.dropZones.find(z => z.id === zoneId);
  if (!zone || zone.targetValue === null) {
    return { correct: false, studentValue: 0, targetValue: 0 };
  }

  // Sum up all blocks in the zone
  const studentValue = zone.acceptedBlockIds.reduce((sum, blockId) => {
    const block = state.blocks[blockId];
    return sum + (1 / block.denominator);
  }, 0);

  // Use epsilon comparison to handle floating point
  const correct = Math.abs(studentValue - zone.targetValue) < 0.001;

  return { correct, studentValue, targetValue: zone.targetValue };
}
```

**Why floating point is safe here:** With denominators 2-5, all values are representable as terminating decimals (0.5, 0.333..., 0.25, 0.2). The maximum accumulation in a zone would be ~5 blocks. Floating point error at this scale is negligible (well under our 0.001 epsilon). An exact rational approach (comparing `sumNumerators * targetDenom === targetNum * sumDenom`) would be cleaner but is unnecessary given the small denominator range.

**Alternative: exact rational check** (if floating point feels wrong):

```typescript
function checkEquivalenceExact(
  blocks: FractionBlock[],
  targetNum: number,
  targetDenom: number
): boolean {
  // Sum blocks as rationals: sum of 1/d_i
  // Use LCM of all denominators as common denominator
  const denoms = blocks.map(b => b.denominator);
  const lcd = denoms.reduce(lcm, 1);
  const sumNumerator = blocks.reduce((sum, b) => sum + lcd / b.denominator, 0);
  // Compare: sumNumerator/lcd === targetNum/targetDenom
  // Cross multiply: sumNumerator * targetDenom === targetNum * lcd
  return sumNumerator * targetDenom === targetNum * lcd;
}

function gcd(a: number, b: number): number {
  return b === 0 ? a : gcd(b, a % b);
}

function lcm(a: number, b: number): number {
  return (a * b) / gcd(a, b);
}
```

## Key Trade-offs

**1. Unit fractions vs. compound blocks**
- *Chosen:* Blocks are always unit fractions (1/N). Compound fractions are groups.
- *Why:* Matches physical manipulatives. A student physically picks up "one quarter piece," not "a two-quarters piece." Grouping makes the equivalence visible — you see two 1/4 pieces side by side equaling one 1/2 piece.
- *Cost:* Slightly more complex rendering (groups need to visually merge). But this is the right pedagogical model.

**2. Floating point vs. exact rational arithmetic**
- *Chosen:* Floating point with epsilon.
- *Why:* Simpler code, denominators 2-5 keep error negligible. Exact rational is 10 extra lines if needed.
- *Risk:* 1/3 is 0.333... repeating. Three 1/3 blocks should equal 1.0 but `3 * (1/3)` in JS is `0.9999999999999999`. The epsilon of 0.001 handles this fine.

**3. Split as replace vs. true subdivision**
- *Chosen:* Replace model (trade 1/2 for two 1/4s).
- *Why:* With denominators 2-5, true splitting only works for halves→quarters. "Replace/trade" is more general and pedagogically maps to equivalence. But in practice, even replacement is limited — thirds and fifths don't convert cleanly to other supported denominators.
- *Implication:* The lesson should focus on combining same-denominator blocks and comparing different-denominator groups, not on splitting.

**4. Flat workspace vs. structured drop zones**
- *Chosen:* Both. Free-form workspace for exploration phase; drop zones for guided/assessment phases.
- *Why:* Exploration needs freedom. Assessment needs a clear "put your answer here" target. The workspace setup per lesson step controls which mode is active.

**5. Lesson script as data vs. code**
- *Chosen:* Data (JSON-serializable objects).
- *Why:* Easier to author, review, and modify the lesson flow. The lesson engine interprets the data. No lesson logic lives in component code.
- *Cost:* Slightly more upfront work to build the engine, but it separates concerns cleanly.

## Implementation Notes

**State management:** Use React `useReducer` with a single `AppState` that combines workspace + lesson + assessment state. Actions flow through a single reducer. No external state library needed for this scope.

```typescript
interface AppState {
  lesson: {
    currentStepId: StepId;
    steps: Record<StepId, LessonStep>;  // the full lesson script
  };
  workspace: WorkspaceState;
  assessment: AssessmentState;
  tutorMessages: TutorChatMessage[];     // chat history for display
}

interface TutorChatMessage {
  id: string;
  sender: 'tutor' | 'student';
  text: string;
  timestamp: number;
}

type AppAction =
  | { type: 'DRAG_START'; blockId: string }
  | { type: 'DRAG_MOVE'; blockId: string; position: { x: number; y: number } }
  | { type: 'DRAG_END'; blockId: string; position: { x: number; y: number } }
  | { type: 'SPLIT_BLOCK'; blockId: string; splitFactor: number }
  | { type: 'CHECK_ANSWER'; zoneId: string }
  | { type: 'SELECT_RESPONSE'; value: string }
  | { type: 'ADVANCE_STEP'; targetStepId: StepId }
  | { type: 'ADD_TUTOR_MESSAGE'; text: string }
  | { type: 'ADD_BLOCK_FROM_TRAY'; denominator: Denominator; position: { x: number; y: number } };
```

**ID generation:** Use a simple counter or `crypto.randomUUID()`. No need for anything fancier.

**SVG coordinate system:** Use a fixed viewBox (e.g., `0 0 1000 800`) so block positions are resolution-independent. Map pointer events to SVG coordinates using `SVGSVGElement.getScreenCTM()`.

**Block sizing:** Each block's visual width should be proportional to its fraction value. If a "whole" bar is 400px wide in the viewBox, then a 1/2 block is 200px, a 1/3 is ~133px, a 1/4 is 100px, a 1/5 is 80px. Height is fixed (e.g., 60px). This makes visual comparison intuitive — two 1/4 blocks side by side are visibly the same width as one 1/2 block.

**Lesson data file:** Store the entire lesson script as a single TypeScript constant (not a JSON file). This gives type safety and avoids an async load step. One file, ~200 lines, fully defines the lesson flow.

**Testing priority:**
1. Equivalence checking — unit test all edge cases (empty zone, overflow, exact thirds)
2. Combine logic — grouping same-denominator blocks
3. Lesson transitions — correct/incorrect paths, hint escalation
4. Drop zone hit detection — is a block inside the zone bounds?

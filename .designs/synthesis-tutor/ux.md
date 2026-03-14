# UX Design

## Layout

### Breakpoint Strategy

Single breakpoint at **768px width** (iPad portrait is 768px, landscape is 1024px).

- **Landscape (>=768px wide):** Side-by-side. Chat panel on the left (320px fixed width), workspace fills remaining space on the right. This is the primary layout for iPad landscape (1024x768).
- **Portrait (<768px wide):** Stacked. Chat panel on top (40% height, ~307px on iPad portrait 768x1024), workspace on bottom (60% height). Chat panel should be collapsible — a small drag handle or "minimize" chevron lets the student shrink chat to ~100px to give workspace more room during manipulation phases.

### Container Sizing

Use CSS `dvh` (dynamic viewport height) to handle Safari's toolbar correctly. The app fills `100dvw x 100dvh` with no scrolling on the page itself — only the chat message list scrolls internally.

```
/* Landscape */
.app { display: flex; flex-direction: row; height: 100dvh; }
.chat-panel { width: 320px; flex-shrink: 0; }
.workspace { flex: 1; }

/* Portrait */
@media (max-width: 767px), (orientation: portrait) {
  .app { flex-direction: column; }
  .chat-panel { width: 100%; height: 40%; min-height: 100px; }
  .workspace { width: 100%; flex: 1; }
}
```

### Safe Areas

Apply `env(safe-area-inset-*)` padding for iPads with rounded corners and home indicator. The bottom of the workspace needs `padding-bottom: max(16px, env(safe-area-inset-bottom))`.

---

## Fraction Block Visuals

### Block Shape and Sizing

Each fraction block is a **rounded rectangle** with `border-radius: 8px`. All blocks share the same total width when representing "1 whole" — this is critical for visual equivalence.

- **Whole block reference width:** 280px in landscape, scales to `min(280px, calc(100vw - 64px))` in portrait.
- A 1/2 block is 140px wide. A 1/3 block is ~93px. A 1/4 block is 70px. A 1/5 block is 56px.
- **Block height:** 64px for all denominations. Consistent height makes stacking and comparison intuitive.
- **Minimum touch target:** 56px x 64px (the smallest block, 1/5, still meets the 44px minimum).

### Color Coding by Denomination

Each denomination gets a distinct, high-contrast color. These are chosen for distinguishability (including common color vision deficiencies) and to match common educational math tool conventions:

| Denomination | Fill Color | Border Color | Label |
|---|---|---|---|
| 1 (whole) | `#F4845F` (salmon) | `#D4603F` | `1` |
| 1/2 | `#7EC8E3` (sky blue) | `#5EA8C3` | `1/2` |
| 1/3 | `#A8D5BA` (mint green) | `#88B59A` | `1/3` |
| 1/4 | `#C3B1E1` (lavender) | `#A391C1` | `1/4` |
| 1/5 | `#F9D56E` (golden yellow) | `#D9B54E` | `1/5` |

### Block Rendering (SVG)

Each block is an SVG `<rect>` with:
- Fill color per denomination table above
- 2px solid border (stroke) in the darker shade
- Centered text label showing the fraction (e.g., "1/4") in `font-size: 18px`, `font-weight: 600`, color `#1a1a1a`
- Drop shadow when being dragged: `filter: drop-shadow(0 4px 8px rgba(0,0,0,0.2))`
- Slight scale-up when grabbed: `transform: scale(1.05)` with 100ms ease transition

### Combined Block Display

When blocks combine (e.g., two 1/4 blocks combine into 1/2), the resulting block:
- Changes to the target denomination's color
- Briefly flashes white (`opacity: 0` to `1` over 200ms) during the merge animation
- Shows the new fraction label

When blocks are in a "group but not yet combined" state (sitting adjacent in a comparison zone), they render touching edge-to-edge with a subtle dashed line (`stroke-dasharray: 4,4`, color `#ccc`) between them.

---

## Workspace Interaction

### Layout Zones

The workspace contains three zones, arranged vertically:

1. **Block Tray (top, 80px tall):** A horizontal scrollable row showing available blocks the student can pull from. Blocks in the tray are slightly smaller (48px tall) and semi-transparent (`opacity: 0.7`). Tapping or dragging a block from the tray creates a copy in the work area. The tray always shows: 1 whole, two 1/2s, three 1/3s, four 1/4s, five 1/5s. Tray replenishes — pulling a block does not deplete it.
2. **Work Area (middle, fills remaining space):** Open canvas where blocks can be freely positioned. This is where manipulation happens.
3. **Comparison Zone (bottom, 120px tall):** Two side-by-side rectangular drop targets (each ~45% width, separated by a "=" sign). Students drag blocks into the left and right slots to visually compare. The zone has a dashed border (`2px dashed #ccc`) that highlights to `#4CAF50` (green) when a block is hovering over it.

### Drag Interaction

- **Initiate drag:** `pointerdown` on a block. After 100ms hold (to distinguish from tap), block lifts with scale(1.05) and shadow.
- **During drag:** Block follows finger via `pointermove`. Position updates on every frame via `requestAnimationFrame`. Block has `touch-action: none` and `user-select: none` to prevent Safari scroll interference.
- **Drop on valid target:** Block snaps to the nearest alignment point with a 150ms ease-out animation. Valid targets glow green briefly (200ms).
- **Drop on invalid area:** Block returns to its previous position with a 200ms ease-out "rubber band" animation.
- **Drop on another block (combine):** If blocks are compatible (same denomination or result in a valid fraction), trigger combine animation:
  1. Both blocks slide together over 200ms
  2. Flash white (100ms)
  3. Replaced by new combined block with a subtle "pop" scale animation (scale 1.0 → 1.1 → 1.0, 200ms)

### Tap-to-Split

- **Tap a block in the work area:** A radial menu appears above the block with split options. Menu items are circular buttons (48px diameter) showing "÷2", "÷3", "÷4", "÷5". Only valid splits are shown (e.g., a 1/2 block can split into 2 quarters, or 2.5 fifths — only show ÷2 since ÷5 doesn't produce whole pieces from 1/2... actually show all and grey out invalid ones).
- **Valid split options** depend on whether the split produces an integer number of pieces of a supported denomination. A 1 whole can split into 2, 3, 4, or 5. A 1/2 can split into 2 (making 2x 1/4). A 1/3 cannot cleanly split into any supported denomination (1/6 isn't supported), so all options are greyed. A 1/4 cannot split. A 1/5 cannot split.
- **Split animation:** Block expands slightly, then splits into N pieces that slide apart over 200ms, each taking the new denomination's color.
- **Dismiss menu:** Tap anywhere else. Menu fades out over 100ms.

### Snap and Alignment

- Blocks in the work area snap to an invisible 8px grid. This keeps things tidy without feeling rigid.
- In comparison zones, blocks snap to left-aligned positions and stack horizontally. Multiple blocks in one comparison slot line up edge-to-edge automatically.

### Visual Feedback Summary

| Action | Feedback |
|---|---|
| Hover/touch block | Slight brightness increase (filter: brightness(1.05)) |
| Pick up block | Scale 1.05, drop shadow, lifted z-index |
| Drag over valid target | Target border turns green, subtle pulse |
| Drag over invalid area | No change (neutral) |
| Drop and snap | 150ms ease-out slide to snap position |
| Combine blocks | Slide together → flash → pop new block |
| Split block | Expand → divide → slide apart |
| Incorrect answer submitted | Blocks in comparison zone briefly shake (translateX ±4px, 3 cycles, 300ms) |
| Correct answer submitted | Green checkmark overlay, blocks pulse green border |

---

## Chat Panel

### Message Types and Rendering

1. **Tutor message:** Left-aligned bubble, `bg-slate-100`, `rounded-2xl`, `max-width: 85%`, `padding: 12px 16px`. Avatar: small circle (32px) with a friendly robot/tutor icon to the left. Text in `font-size: 16px`, `line-height: 1.5`, `color: #1a1a1a`.
2. **Student action echo:** Right-aligned bubble, `bg-blue-100`, `rounded-2xl`. Shows what the student did (e.g., "I placed 2/4 in the comparison zone"). Generated automatically from workspace actions.
3. **System message:** Centered, no bubble, `text-sm`, `text-slate-500`. For things like "Lesson started" or phase transitions.

### Message Animation

New messages animate in with `translateY(8px) → translateY(0)` and `opacity: 0 → 1` over 200ms. The chat auto-scrolls to the latest message with `scrollIntoView({ behavior: 'smooth' })`.

### Typing Indicator

Before each tutor message, show a typing indicator (three bouncing dots in a bubble) for 500-800ms. This pacing makes the tutor feel more natural and gives the student time to read the previous message.

### Button Placement

Action buttons (like "Let's go!" or response choices) appear inline at the bottom of the chat as the most recent item. They are full-width within the chat panel, `height: 48px`, using shadcn `Button` variant `default` (primary) or `outline` (secondary options).

- **"Let's go!" button:** `variant: default`, full-width, appears after the tutor's intro. Transitions from exploration to guided discovery.
- **"Check" button:** Appears in the workspace panel (not the chat), positioned bottom-right of the workspace, `48px tall`, `120px wide`, `bg-emerald-500`, white text "Check". Disabled (greyed out) until blocks are placed in the comparison zone.
- **Response buttons** (for multiple-choice tutor questions): Stack vertically in the chat, each `48px tall`, `variant: outline`, spaced `8px` apart.

### Scroll Behavior

The chat panel is a flex column: message list (scrollable, `flex: 1; overflow-y: auto`) on top, action buttons pinned at the bottom. The message list scrolls; buttons never scroll off-screen.

---

## Lesson Flow UX

### Phase Indicator

A thin progress bar (4px tall) at the very top of the screen spanning full width. Three segments:

1. **Explore** (33%) — `bg-blue-400`
2. **Discover** (33%) — `bg-emerald-400`
3. **Check** (34%) — `bg-amber-400`

Current phase segment is filled with color; future segments are `bg-slate-200`. Completed segments stay filled. No labels on the bar itself — the tutor announces phase transitions conversationally.

### Phase Transitions

Transitions between phases are tutor-driven:

1. **App load → Explore:** Tutor greets, workspace activates with all blocks available. No constraints on manipulation.
2. **Explore → Discover:** Student taps "Let's go!" button in chat. Tutor says something like "Great exploring! Now let's try something specific..." and presents the first guided task.
3. **Discover → Check:** After completing guided tasks, tutor says "You're doing amazing! Let me give you a few challenges..." The progress bar advances.

### Guided Task Presentation

During Discover phase, the tutor presents tasks conversationally:
- "Can you show me that 2/4 is the same as 1/2?"
- The comparison zone highlights with a subtle pulsing border to draw attention
- The student drags blocks into the comparison slots and hits "Check"
- Correct: Tutor celebrates, advances to next task
- Incorrect: Tutor gives a hint ("Hmm, look at the sizes of those blocks. Are they the same length?"), blocks shake, student retries

### Guidance Cues

When the student hasn't interacted for 8 seconds during a task, the tutor sends a gentle nudge ("Try dragging a block from the tray into the work area!"). After 15 seconds, a more specific hint. These timers reset on any interaction.

---

## Assessment UX

### Problem Presentation

Assessment problems appear as tutor messages in the chat. Each problem:
1. Tutor asks the question ("Show me a fraction equal to 2/4")
2. The workspace clears (with a gentle fade, 300ms)
3. The comparison zone labels update (left side pre-filled with the reference fraction, right side empty for the student's answer)
4. Student builds their answer in the workspace and drags to the comparison zone
5. Student taps "Check"

### Pre-filled Reference

In assessment mode, the left comparison slot is pre-filled with the reference fraction (rendered as blocks, but non-draggable, slightly dimmed `opacity: 0.8`). The right slot is the answer area, highlighted with a pulsing dashed border.

### Answer Submission

The "Check" button behavior:
1. **Disabled state:** Grey, `opacity: 0.5`, when right comparison slot is empty. Label: "Check".
2. **Ready state:** Green (`bg-emerald-500`), when blocks are in the right slot. Label: "Check".
3. **Checking state:** Brief spin animation (300ms) while evaluating.
4. **Correct:** Button turns green with checkmark icon, workspace flashes green overlay (200ms), tutor sends congratulations.
5. **Incorrect:** Button briefly turns red (300ms), blocks shake, tutor sends hint. Button returns to ready state.

### Escalating Hints

For each problem, hints escalate across retries:
- **Retry 1:** General encouragement ("Not quite — try a different combination!")
- **Retry 2:** Specific nudge ("Think about how many pieces 1/4 would need...")
- **Retry 3+:** Direct guidance ("Try putting two 1/4 blocks together in the answer zone")

### Problem Count

3 assessment problems. A small counter appears in the progress bar area: "1 of 3", "2 of 3", "3 of 3". Uses `text-xs`, `text-slate-500`, positioned right-aligned in the top bar.

---

## States

### Loading State

Full-screen centered: the app's tutor avatar (64px) with a pulsing scale animation (1.0 → 1.05 → 1.0, 1s loop). Below it, "Getting ready..." in `text-slate-500`, `text-sm`. Background is white. This should display for <1s since the app is client-side only.

### Error State

If something unexpected breaks (e.g., SVG rendering fails), show an inline error in the chat panel as a system message: "Oops, something went wrong. Try refreshing!" with a "Refresh" button. Do not show technical error details to the student.

### Completion State

After all 3 assessment problems are answered correctly:
1. Tutor sends a celebration message ("You're a fractions superstar!")
2. Confetti animation plays (use a lightweight library like `canvas-confetti`, 2-3 second burst)
3. The workspace shows a summary: all 3 problems with green checkmarks
4. A "Play Again" button appears in the chat, full-width, `variant: default`

### Restart / Play Again

"Play Again" resets all state:
- Lesson engine resets to initial state
- Chat clears and tutor sends fresh greeting
- Workspace clears
- Progress bar resets
- No page reload needed — just state reset via the lesson engine

### Idle / Inactivity

If no interaction for 30 seconds, tutor sends a gentle "Still there? Take your time!" message. Only one idle prompt per 60-second window to avoid spam.

---

## Key Trade-offs

### 1. Tray Replenishment vs Depletion
**Decision: Infinite tray (replenishing).** A depleting tray adds cognitive load ("did I use up my blocks?") and requires an undo/return mechanism. Infinite supply keeps focus on the math, not resource management. Trade-off: slightly less "physical" feel.

### 2. Split Menu vs Direct Manipulation for Splitting
**Decision: Tap-to-split with menu.** Direct manipulation (e.g., pinch-to-split) is more intuitive but harder to implement reliably on iPad Safari and ambiguous (split into how many pieces?). A menu is explicit and faster to build. Trade-off: less "magical" but more reliable.

### 3. Auto-combine vs Explicit Combine
**Decision: Auto-combine on overlap.** When a block is dropped on another block of the same denomination, they automatically combine. No separate "combine" button. Trade-off: accidental combines are possible, but the infinite tray makes this low-cost (just grab another block).

### 4. Chat Panel Size in Portrait
**Decision: 40% height default, collapsible.** During manipulation-heavy phases, students need workspace space. The chat can shrink to show only the latest message. Trade-off: implementation complexity of the collapsible panel, but worth it for usability.

### 5. Animation Duration
**Decision: Keep animations short (100-200ms).** Longer animations feel polished but slow down interaction. For a learning tool used by kids, snappy feedback beats cinematic transitions. The exception is the typing indicator (500-800ms) which deliberately adds pacing.

---

## Implementation Notes

### Touch Event Handling
Use the Pointer Events API (`pointerdown`, `pointermove`, `pointerup`) exclusively — not `touchstart`/`mousedown` separately. Set `touch-action: none` on all draggable elements and the workspace SVG to prevent Safari from intercepting gestures for scrolling or zooming. Add `user-select: none` to the workspace container.

### SVG Coordinate System
The workspace SVG should use a fixed `viewBox` (e.g., `0 0 800 600`) and scale with CSS `width: 100%; height: 100%`. Convert pointer event page coordinates to SVG coordinates using `SVGSVGElement.createSVGPoint()` and `getScreenCTM().inverse()`. This ensures drag positions are correct regardless of viewport scaling.

### Responsive Block Sizing
Block widths in the SVG viewBox are fixed (whole = 280px). The SVG scales to fit the container, so blocks appear proportionally correct at any size. The `viewBox` adjusts between landscape (wider) and portrait (taller) using a `ResizeObserver` on the workspace container.

### shadcn/ui Components Used
- `Button` — "Let's go!", "Check", "Play Again", response choices
- `Card` — chat message bubbles (or custom styled divs; shadcn Card may be heavier than needed)
- `ScrollArea` — chat message list
- `Progress` — top progress bar (or custom since it's segmented)
- `Badge` — problem counter ("1 of 3")

### State Machine Integration
The lesson engine state machine should emit events that the UI subscribes to:
- `tutor:message` — add message to chat
- `tutor:prompt` — show response buttons
- `workspace:clear` — clear work area
- `workspace:prefill` — place reference blocks
- `phase:change` — update progress bar
- `assessment:result` — trigger correct/incorrect feedback

The UI dispatches events back:
- `student:action` — block placed, combined, split
- `student:check` — check button pressed
- `student:response` — chat button pressed

### Performance Considerations
- SVG with <50 elements will have no performance issues on iPad
- Use CSS transforms (not SVG attribute changes) for animations where possible — they're GPU-accelerated
- Debounce `pointermove` to 16ms (one frame at 60fps) if needed, but `requestAnimationFrame` gating is preferred
- Preload any icon/avatar assets; there are few enough to inline as SVG

### Z-Index Layering
```
Progress bar:     z-50
Split menu:       z-40
Dragging block:   z-30
Chat buttons:     z-20
Chat panel:       z-10
Workspace:        z-0
```

### CSS Custom Properties for Theming
Define block colors as CSS custom properties so they can be referenced from both CSS and JS:
```css
:root {
  --block-whole: #F4845F;
  --block-half: #7EC8E3;
  --block-third: #A8D5BA;
  --block-quarter: #C3B1E1;
  --block-fifth: #F9D56E;
}
```

### Testing Touch Interactions
Use Chrome DevTools device emulation for rapid iteration, but validate on a real iPad before each milestone. Key things that break on real iPad Safari:
- `touch-action: none` not applied to all ancestors (causes scroll interference)
- `position: fixed` elements jittering when virtual keyboard appears (not relevant here since no text input)
- `dvh` units not updating on orientation change (add an orientationchange listener as fallback)
- Drag events being swallowed by Safari's "pull to refresh" or back/forward swipe gestures

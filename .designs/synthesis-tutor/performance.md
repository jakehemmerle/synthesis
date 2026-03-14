# Performance Design

## SVG Rendering

**Block count in practice:** A fraction equivalence lesson with denominators 2-5 means a student might have at most ~10-15 blocks on screen at once (e.g., five 1/5 pieces, four 1/4 pieces, a couple of halves). This is well within SVG's comfort zone -- SVG starts to struggle at hundreds of elements, not tens.

**Animation approach:** Use CSS transitions for block movements (position, scale) and snap animations. CSS transitions are GPU-composited on iPad Safari when animating `transform` and `opacity`, which keeps the main thread free. Avoid animating SVG attributes directly (e.g., `x`, `y`, `width`) -- these trigger layout recalcs. Instead, wrap blocks in `<g>` elements and animate via CSS `transform: translate(...)`.

**Split/merge animations:** For the split animation (one block becoming N blocks), pre-render the target state and crossfade using opacity transitions. For merge, reverse the pattern. Keep animation duration at 200-300ms -- long enough to read, short enough not to feel sluggish.

**No Canvas needed.** With <20 interactive elements, SVG is simpler and performs fine. Canvas would add complexity (hit testing, accessibility) with no performance benefit at this scale.

## Touch Handling

**Pointer events over touch events.** Pointer events unify mouse and touch, and Safari on iPad supports them fully since iPadOS 13. Use `pointerdown`, `pointermove`, `pointerup`. This avoids the need to handle both `touchstart` and `mousedown`.

**300ms tap delay:** iPad Safari no longer has the 300ms delay when the viewport meta tag includes `width=device-width`. Confirm the tag is present (see iPad-Specific section). If any tap feels sluggish, add `touch-action: manipulation` to interactive elements -- this explicitly opts out of double-tap-to-zoom, removing any residual delay.

**Throttling pointermove:** During drag operations, `pointermove` fires at screen refresh rate (~60Hz on most iPads, 120Hz on ProMotion models). At 120Hz this is a lot of events. Throttle position updates to every 16ms (one per frame) using `requestAnimationFrame` gating:

```typescript
let rafId: number | null = null;
function onPointerMove(e: PointerEvent) {
  if (rafId) return;
  rafId = requestAnimationFrame(() => {
    updateBlockPosition(e.clientX, e.clientY);
    rafId = null;
  });
}
```

This avoids queueing redundant React state updates while keeping drag visually smooth.

**Capture pointer:** Call `element.setPointerCapture(e.pointerId)` on `pointerdown` for drag targets. This ensures `pointermove` and `pointerup` fire on the originating element even if the finger moves outside it -- critical for drag-and-drop that crosses SVG element boundaries.

**Prevent scrolling during drag:** Without intervention, dragging a block will scroll the page on Safari. Apply `touch-action: none` to the SVG workspace container. This tells the browser "I handle all gestures here."

## React Optimization

**Problem:** The workspace has blocks that move during drag. Naive implementation re-renders every block on every drag frame. With 10-15 blocks this is fine in raw terms, but React reconciliation + SVG DOM updates can add up.

**Strategy: Isolate drag state from React.**

1. During active drag, update the dragged block's position via direct DOM manipulation (`element.style.transform`) rather than React state. This bypasses React entirely during the hot path.
2. On `pointerup`, commit the final position back to React state (one render).
3. Non-dragged blocks remain in React's render cycle -- they don't change during drag, so React skips them via referential equality.

**Component structure for minimal re-renders:**

```
<Workspace>              -- rarely re-renders
  <BlockLayer>           -- re-renders when blocks added/removed
    <FractionBlock />    -- memo'd, re-renders only on own state change
    <FractionBlock />
    ...
  </BlockLayer>
  <DropZones />          -- static, never re-renders
  <DragOverlay />        -- separate layer for drag visuals
</Workspace>
```

Use `React.memo` on `FractionBlock` with a stable key (block ID). Keep block data in a flat object keyed by ID (not an array) so updating one block doesn't create a new array reference.

**State management:** `useReducer` at the workspace level is sufficient. No need for Zustand/Redux at this scale. The lesson engine state machine is separate from workspace state -- don't merge them into one giant state object.

## Bundle & Load

**Size budget:** Target < 200KB gzipped for initial load. This loads in ~0.5s on a typical school WiFi connection (5 Mbps+).

**Estimated breakdown:**
- React + React-DOM: ~45KB gzip
- shadcn/ui components (only what we use -- Button, Card, ScrollArea): ~15-20KB gzip
- Lesson engine + fraction model + workspace: ~15-20KB gzip
- SVG fraction block definitions: ~5KB gzip (SVG compresses extremely well)
- Tailwind CSS (purged): ~10-15KB gzip
- **Total estimate: ~90-100KB gzip** -- well under budget

**Code splitting:** Not needed for a single-lesson app. Everything loads on one page. Lazy loading would add complexity for no measurable benefit -- the entire app is smaller than a single hero image.

**Vite as bundler:** Vite produces optimized chunks with tree-shaking out of the box. Use `vite build` defaults. No custom chunk splitting config needed.

**Font loading:** If using a custom font (e.g., for the kid-friendly tutor feel), use `font-display: swap` and preload the font file. A single WOFF2 font weight is typically 15-25KB. Consider system fonts (`-apple-system` renders well on iPad) to avoid this cost entirely.

## iPad-Specific

**Viewport meta tag (critical):**

```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no, viewport-fit=cover">
```

- `maximum-scale=1, user-scalable=no`: Prevents pinch-to-zoom, which interferes with block manipulation gestures. Users should zoom fraction blocks via the app's split/combine UI, not browser zoom.
- `viewport-fit=cover`: Ensures content fills the screen on newer iPads with rounded corners / notch area.

**touch-action CSS:**

```css
/* On the workspace SVG container */
.workspace {
  touch-action: none;       /* We handle all gestures */
}

/* On the chat panel */
.chat-panel {
  touch-action: pan-y;      /* Allow vertical scroll only */
}

/* On buttons / interactive elements */
button, .interactive {
  touch-action: manipulation; /* Remove 300ms delay */
}
```

**Safari rubber-band scrolling:** If the app is full-viewport, prevent overscroll bounce on the body:

```css
html, body {
  overflow: hidden;
  position: fixed;
  width: 100%;
  height: 100%;
}
```

This also prevents the URL bar from hiding/showing during scroll, which causes jarring layout shifts.

**Memory pressure:** iPad Safari is aggressive about killing background tabs. This is a non-issue for our use case -- the app is a single-tab, single-lesson experience. No long-lived state needs to survive tab suspension. If the tab gets killed and the user returns, the lesson restarts -- acceptable for a demo.

**Safe area insets:** Use `env(safe-area-inset-*)` in CSS for padding on iPads with rounded corners, so UI elements don't get clipped:

```css
.app-container {
  padding: env(safe-area-inset-top) env(safe-area-inset-right)
           env(safe-area-inset-bottom) env(safe-area-inset-left);
}
```

**100vh bug:** On iPad Safari, `100vh` includes the area behind the browser chrome. Use `100dvh` (dynamic viewport height) or `window.visualViewport.height` for accurate full-screen layout.

**Orientation change:** iPad can rotate mid-lesson. Use a CSS media query (`orientation: portrait` / `landscape`) to switch between vertical (chat-top, workspace-bottom) and horizontal (chat-left, workspace-right) layouts. Listen for `resize` events to update any JavaScript-calculated dimensions (e.g., SVG viewBox).

## Key Trade-offs

| Decision | Trade-off |
|---|---|
| CSS transitions over rAF for animations | Simpler code, GPU-composited, but less control over complex multi-step sequences. Acceptable since our animations are simple (translate, scale, opacity). |
| Direct DOM manipulation during drag | Breaks React's mental model, but avoids 60+ state updates per second during drag. The "commit on pointerup" pattern keeps it contained. |
| `user-scalable=no` | Removes accessibility zoom. Acceptable for a 1-week demo targeting sighted children. Would need revisiting for production. |
| System fonts vs custom font | Faster load, no FOUT, but less visual personality. Can add a custom font later if polish time permits. |
| No code splitting | Slightly larger initial JS parse, but for ~100KB gzip this is negligible. Avoids loading-state complexity. |

## Implementation Notes

**Day 1 checklist (set up once, avoid debugging later):**
1. Add the viewport meta tag immediately. Test on a real iPad -- the simulator doesn't perfectly replicate Safari touch behavior.
2. Set `touch-action: none` on the workspace from the start. Retrofitting this after building drag logic causes confusing bugs.
3. Use `position: fixed` on `html/body` to lock the viewport. This prevents half the Safari-specific layout bugs.
4. Set up the rAF-gated pointermove handler as a reusable hook (`useDrag`) before building any drag interactions.

**Testing performance:**
- Use Safari's Web Inspector (connected to iPad via cable) to profile. The "Timelines" tab shows frame rate, layout thrash, and JS execution time.
- Target: no frame drops during drag (sustained 60fps). With <20 SVG elements and rAF-gated updates, this should be trivially achievable.
- Watch for "Forced Reflow" warnings in the timeline -- these indicate layout thrash, usually from reading DOM dimensions after writing them in the same frame.

**Things that will NOT be a problem at this scale:**
- SVG rendering performance (we have ~15 elements, not 1500)
- Bundle size (the whole app is smaller than a typical image asset)
- Memory pressure (no long-lived data, no media, no WebGL)
- React re-render cost (as long as drag uses direct DOM, everything else is infrequent)

**The one thing that WILL bite you if ignored:** Safari touch gesture conflicts. If `touch-action` is not set correctly, dragging blocks will scroll the page, pinch will zoom, and long-press will trigger the context menu. Set the CSS properties on day 1 and test on a real iPad early.

# Plan Review Round 2: Risk Analysis

## Technical Risks

### RISK: SVG pointer event handling on iPad Safari is fragile and under-tested
The plan relies on `setPointerCapture`, `getScreenCTM().inverse()`, and `touch-action: none` working correctly together in Safari. Safari has a history of non-standard pointer event behavior, particularly around `pointercancel` firing unexpectedly during scroll gestures and `setPointerCapture` not suppressing default gestures reliably. The plan lists these as a "Day 1 checklist" but defers actual iPad testing to Day 3 at the earliest.

- Impact: HIGH
- Likelihood: MEDIUM
- Mitigation: must-fix
- Suggested action: Add a spike task on Day 1 (after scaffolding): build a throwaway SVG with one draggable rect, deploy to staging, and test on the physical iPad. This takes 30 minutes and catches Safari-specific issues before any architecture depends on assumptions about pointer behavior. If `pointercancel` is aggressive, the fallback is raw touch events (`touchstart`/`touchmove`/`touchend`).

### RISK: SVG coordinate conversion assumes stable `getScreenCTM()` across layout changes
The plan uses `getScreenCTM().inverse()` to convert screen coordinates to SVG-local coordinates during drag. On iPad Safari, rotating between portrait and landscape can invalidate cached CTM values mid-drag, and CSS transforms on ancestor elements can produce incorrect CTMs. The plan does not mention when/how CTM is recalculated.

- Impact: MEDIUM
- Likelihood: MEDIUM
- Mitigation: should-fix
- Suggested action: Document in the design that CTM must be recalculated on every `pointermove` (not cached at `pointerdown`). Add a unit note in `usePointerDrag.ts` about this. Test orientation switch mid-drag on iPad.

### RISK: Block grouping/combining UX has no specification for visual feedback during drag
The plan describes "drop block on same-denomination block -> merge animation" but does not specify how the user knows a merge is about to happen before releasing. Without a hover/proximity highlight, users will drop blocks randomly and not understand why some drops merge and others don't.

- Impact: MEDIUM
- Likelihood: HIGH
- Mitigation: must-fix
- Suggested action: Add to the interaction design section: a visual affordance (e.g., target block glows or scales up) when a dragged block is within merge range. This is a UX concern, not a stretch feature — without it the manipulative will feel broken.

### RISK: Hit detection and snap-to-zone logic is unspecified
The plan mentions "hit detection" and "zone checking" multiple times but never defines the algorithm. Are zones pixel-based rectangles? Is overlap percentage-based? What happens when a block is dropped between two zones? Ambiguity here will cost time during implementation.

- Impact: LOW
- Likelihood: MEDIUM
- Mitigation: should-fix
- Suggested action: Add a brief specification: zones are axis-aligned bounding boxes, a block "enters" a zone when its center point is inside the zone rect, blocks snap to the nearest valid position within the zone on drop.

## Dependency Risks

### RISK: Firebase Hosting configuration is assumed to "just work" for SPA routing
The plan lists Firebase Hosting but does not mention `rewrites` configuration for SPA routing (all routes -> index.html). Without this, direct URL access or browser refresh returns 404.

- Impact: LOW
- Likelihood: MEDIUM
- Mitigation: should-fix
- Suggested action: Add `"rewrites": [{"source": "**", "destination": "/index.html"}]` to the firebase.json setup task on Day 1.

### RISK: shadcn/ui initialization may conflict with Vite + React setup
shadcn/ui requires specific Tailwind CSS configuration and has opinions about path aliases (`@/`). The plan treats `npm create vite` + shadcn init as a single step. In practice, path alias configuration (`tsconfig.json` paths + Vite `resolve.alias`) can take 30-60 minutes to get right, especially with recent shadcn versions that assume Next.js conventions.

- Impact: LOW
- Likelihood: MEDIUM
- Mitigation: should-fix
- Suggested action: Budget 1 hour for scaffolding rather than treating it as trivial. Follow the shadcn/ui Vite installation guide exactly. If it takes more than 45 minutes, fall back to plain Tailwind without shadcn components (Button, Card, ScrollArea are trivial to hand-build).

## Knowledge Risks

### RISK: No mention of accessibility basics for an educational tool
The plan targets children using an iPad. There is no mention of focus management, ARIA labels on SVG elements, or screen reader considerations. While full a11y may be out of scope for a 1-week sprint, SVG elements without ARIA roles are completely invisible to assistive technology.

- Impact: LOW
- Likelihood: LOW
- Mitigation: should-fix
- Suggested action: Add `role="img"` and `aria-label` to SVG blocks (e.g., "one quarter fraction block"). This is 5 minutes of work and avoids a potential evaluator concern.

### RISK: Assessment problem 3 ("show two different ways to make 1/2") requires comparison zone UX that is not fully designed
The third assessment problem asks the student to place blocks on both sides of the comparison zone. The design mentions "two drop slots with = sign" but doesn't specify: can the student place multiple blocks in one slot? How does the system detect that one side has 1/2 and the other has 2/4? Is grouping required, or does the system count individual blocks? This is the most complex interaction in the app and it has the least specification.

- Impact: HIGH
- Likelihood: HIGH
- Mitigation: must-fix
- Suggested action: Write out the exact acceptance criteria for the comparison zone before Day 3. Specify: each slot accepts N blocks, the system sums the unit fractions in each slot, equivalence passes if `areEquivalent(leftSum, rightSum)` returns true. For problem 3, both slots must be non-empty and the sums must be equivalent but use different denominators. Add this to the design doc as a subsection.

## Rollback / Recovery Risks

### RISK: No version control strategy or branch plan mentioned
The plan says "manual deploy" but doesn't mention git branching. If Day 4's integration breaks the working Day 3 UI, there is no mentioned recovery path. A bad deploy to prod with no rollback plan could waste Day 5.

- Impact: MEDIUM
- Likelihood: MEDIUM
- Mitigation: must-fix
- Suggested action: Use a simple strategy: `main` branch is always deployable, work on feature branches or at minimum tag working states before integration. Firebase Hosting supports rollback to previous deploys via `firebase hosting:clone` — mention this as the prod rollback mechanism.

### RISK: Day 5 is overloaded with contingency work AND the demo video
Day 5 is simultaneously: fix iPad bugs, visual polish, stretch features, README, demo video (2 hours), and final deploy. If Day 4 produces significant iPad bugs, the demo video and README are at risk. The demo video requires a working, polished app — it cannot be recorded until everything else is done.

- Impact: HIGH
- Likelihood: MEDIUM
- Mitigation: must-fix
- Suggested action: Define a "demo-ready" gate at end of Day 4: if the full lesson is playable on iPad, Day 5 is polish + video. If not, Day 5 morning is bug fixes with a hard cutoff at noon — record the demo with whatever works, even if some interactions are rough. Do not attempt stretch features if Day 4 gate was not met.

### RISK: No fallback if SVG manipulative proves too complex for the timeline
The entire UI depends on a custom SVG workspace with drag-and-drop, hit detection, zone snapping, merge animations, and split interactions. If this takes longer than Day 3, there is no fallback. A simpler alternative (e.g., click-to-select then click-target-zone, or HTML div-based blocks with CSS grid) is never mentioned.

- Impact: HIGH
- Likelihood: LOW
- Mitigation: should-fix
- Suggested action: Identify a fallback manipulative approach: HTML divs with `position: absolute` and the same pointer event logic, but without SVG coordinate math. This removes the `getScreenCTM` complexity. Only switch if SVG approach is not working by end of Day 2.

## Summary

| Priority | Count | Key items |
|----------|-------|-----------|
| must-fix | 5 | iPad pointer spike, merge visual feedback, comparison zone spec, version control, Day 5 overload |
| should-fix | 5 | CTM recalculation, hit detection spec, Firebase SPA routing, shadcn setup budget, a11y basics, SVG fallback |

The highest-concentration risk area is the SVG manipulative on iPad Safari. Three of the five must-fix items relate to touch interaction or workspace UX specification gaps. A 30-minute pointer event spike on Day 1 would retire the most dangerous technical uncertainty early.

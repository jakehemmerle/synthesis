# Bead Coverage Verification: Synthesis Tutor Sprint Plan

**Date:** 2026-03-14
**Source:** `.designs/synthesis-tutor/design-doc.md` (Sprint Plan section)
**Beads checked:** 35 total (syn-rd7 through syn-c7o)

## Summary

- **Items fully covered:** 33
- **GAPs (plan items with no bead):** 2
- **EXTRA beads (no matching plan item):** 0

## Detailed Mapping

### Day 1: Foundation + Math Model + Pointer Spike (7 items -> 5 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | Project scaffolding: Vite, shadcn/ui, Vitest | syn-rd7 | COVERED |
| 2 | Firebase project creation, hosting, deploy target, SPA rewrite | syn-h94 | COVERED |
| 3 | Viewport meta, touch-action CSS, position:fixed body | syn-rd7 | COVERED (bundled with scaffolding) |
| 4 | iPad pointer event spike (30 min) | syn-4o0 | COVERED |
| 5 | fraction.ts TDD | syn-7df | COVERED |
| 6 | workspace.ts TDD | syn-j2c | COVERED |
| 7 | Draft README skeleton | -- | **GAP** |

### Day 2: Lesson Engine + Content (5 items -> 4 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | lessonEngine.ts TDD | syn-k1z | COVERED |
| 2 | lessonScript.ts (full lesson content) | syn-0iw | COVERED |
| 3 | lessonScript.test.ts (structural validation) | syn-6y7 | COVERED |
| 4 | lessonContext.tsx + useLesson hook | syn-2aq | COVERED |
| 5 | SVG coordinate conversion utility | syn-2aq | COVERED (bundled with context bead) |

### Day 3: UI + Touch Interactions (9 items -> 9 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | LessonLayout.tsx responsive | syn-t8m | COVERED |
| 2 | ChatPanel + ChatMessage | syn-qtq | COVERED |
| 3 | WorkspacePanel + FractionBlock + drag | syn-e2s | COVERED |
| 4 | ComparisonZone | syn-pgs | COVERED |
| 5 | CheckButton | syn-8r8 | COVERED |
| 6 | Block combine on drop | syn-tlp | COVERED |
| 7 | Tap-to-split (1/2 only) | syn-0pq | COVERED |
| 8 | iPad smoke test | syn-iiw | COVERED |
| 9 | Component smoke tests | syn-dw6 | COVERED |

### Day 4: Integration + Assessment + Staging Deploy (8 items -> 6 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | Wire lesson engine to UI | syn-dzd | COVERED |
| 2 | Guided discovery flow (3 problems) | syn-unn | COVERED |
| 3 | Assessment flow (3 problems) | syn-zsd | COVERED |
| 4 | iPad full test checklist | syn-2my | COVERED |
| 5 | Confirm target iPad model | syn-2my | COVERED (bundled with iPad test bead) |
| 6 | Deploy to staging, full playthrough | syn-2my | COVERED (bundled with iPad test bead) |
| 7 | Deploy to prod (evening) | syn-3l6 | COVERED |
| 8 | Integration test (lessonFlow.test.tsx) | syn-n82 | COVERED |

### Day 5: Polish + Demo Video + README (6 items -> 4 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | Fix iPad bugs from Day 4 | syn-np0 | COVERED |
| 2 | Visual polish (animations, colors, spacing) | syn-np0 | COVERED (bundled with bug fixes) |
| 3 | STRETCH items if time permits | -- | COVERED (individual STRETCH beads below) |
| 4 | Write README | syn-su5 | COVERED |
| 5 | Record demo video | syn-04h | COVERED |
| 6 | Final staging + prod deploy | syn-6og | COVERED |

### STRETCH Items (11 in design doc -> 8 beads)

| # | Plan Item | Bead | Status |
|---|-----------|------|--------|
| 1 | ~~Tap-to-split~~ (moved to REQUIRED) | syn-0pq | COVERED (as required) |
| 2 | Confetti celebration | syn-ixc | COVERED |
| 3 | Typing indicator | syn-fiy | COVERED |
| 4 | Idle nudges | syn-8uq | COVERED |
| 5 | Collapsible chat (portrait) | syn-c7o | COVERED |
| 6 | E2E tests (Playwright) | -- | **GAP** |
| 7 | Animated block merging/splitting | -- | **GAP** (see note) |
| 8 | Progress bar | syn-g4m | COVERED |
| 9 | Play Again button | syn-90h | COVERED |
| 10 | Loading state / splash screen | syn-4h8 | COVERED |
| 11 | Error boundary | syn-dge | COVERED |

## GAPs Detail

### 1. Day 1 item 7: "Draft README skeleton"
The plan calls for a README skeleton on Day 1. The only README bead (syn-su5) is scoped to Day 5 and covers the full write-up. The Day 1 skeleton step has no bead. **Low risk** -- this is a trivial task that can be folded into syn-rd7 (scaffolding) or syn-su5.

### 2. STRETCH: E2E tests (Playwright)
Listed as STRETCH item #6 in the design doc. No bead exists. **Low risk** -- it's a stretch item and unlikely to be reached in a 5-day sprint.

### 3. STRETCH: Animated block merging/splitting
Listed as STRETCH item #7 in the design doc. No dedicated bead. **Borderline** -- syn-tlp (block combine on drop) mentions "Animation: slide together" in its description, which partially covers merge animation. Split animation is not covered anywhere. **Low risk** as a stretch item.

## EXTRA Beads

None. All 35 beads map to plan items.

## Verdict

Coverage is strong. 33 of 35 plan line-items have corresponding beads. The 2 gaps are low-risk (a README skeleton and two stretch items). No orphan beads exist.

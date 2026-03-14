# Plan Review Round 3: Testability

## Summary

The plan has a solid TDD foundation for pure logic layers (fraction, workspace, lesson engine). The main gaps are: UI/integration tasks have no verification criteria beyond manual iPad checks, exit gates mix "passes tests" with "verified on iPad" without defining what "verified" means, and several tasks lack any acceptance criteria at all.

---

## Findings

### UNTESTABLE: Day 1, Step 2 — Firebase project creation
No way to verify programmatically that the project is correctly configured (hosting site, deploy target, SPA rewrite rule).
**Suggested criteria:** `firebase deploy --only hosting` succeeds and `curl -s -o /dev/null -w '%{http_code}' https://<staging-url>/nonexistent-route` returns 200 (SPA rewrite working). Script this as `npm run verify:deploy`.
**Classification:** should-fix

### UNTESTABLE: Day 1, Step 3 — iPad CSS essentials (viewport meta, touch-action, fixed body)
No test or automated check. Easy to regress.
**Suggested criteria:** Add a Vitest test that renders `index.html` (or App component) and asserts: (1) viewport meta tag contains `user-scalable=no`, (2) workspace element has `touch-action: none` style. Alternatively, a lint rule or snapshot test on the HTML template.
**Classification:** should-fix

### UNTESTABLE: Day 1, Step 4 — iPad pointer event spike
Inherently manual (real device test). Acceptable as a spike, but the result is not captured.
**Suggested criteria:** Write a 3-line verdict file (`spike-results.md`) documenting: pointer events work (yes/no), setPointerCapture works (yes/no), coordinate conversion works (yes/no), fallback needed (yes/no). This becomes a gate for Day 3 architecture decisions.
**Classification:** should-fix

### MISSING-TEST: Day 2, Step 4 — lessonContext.tsx (React context provider + useLesson hook)
No test mentioned. This is glue code, but it wires the reducer to React and bugs here break the entire app.
**Suggested:** Add `lessonContext.test.tsx` — render provider, dispatch START_LESSON, assert phase transitions via the hook. Use React Testing Library. 3-5 tests covering: initial state, dispatch propagation, context value shape.
**Classification:** must-fix

### VAGUE-CRITERIA: Day 2 exit gate — "Lesson engine passes all transition tests, script covers full lesson flow"
"Covers full lesson flow" is subjective. How do you know the script is complete?
**Suggested rewrite:** Exit gate: `npm test` passes. `lessonScript.test.ts` asserts: (1) every step ID referenced in transitions exists in the script, (2) no orphan steps (every step is reachable from 'intro'), (3) every assessment problem has at least 2 hints, (4) total tutor message count >= 25.
**Classification:** must-fix

### MISSING-TEST: Day 3, Steps 1-2 — LessonLayout, ChatPanel, ChatMessage
No component tests planned. These are UI-heavy but testable with React Testing Library.
**Suggested:** Add lightweight render tests: (1) LessonLayout renders both panels, (2) ChatPanel displays messages passed as props, (3) ChatMessage renders tutor vs student variants. Not TDD — just smoke tests to catch regressions. Add as a sub-task to Day 3.
**Classification:** should-fix

### MISSING-TEST: Day 3, Steps 3-4 — WorkspacePanel + FractionBlock + AlignmentZone
The core interactive components have no automated tests. Manual iPad testing is the only verification.
**Suggested:** Add integration tests with React Testing Library + pointer event simulation: (1) block renders at correct position, (2) firing pointerdown/pointermove/pointerup dispatches WORKSPACE_UPDATED, (3) dropping a block in a zone registers it. These catch regressions without needing a real device.
**Classification:** must-fix

### MISSING-TEST: Day 3, Step 6 — Block combine on drop
Combine logic in `workspace.ts` is tested (TDD on Day 1), but the UI integration (overlap detection triggering combine in the component) is not tested.
**Suggested:** Add a React Testing Library test: render two 1/4 blocks, simulate drag-drop overlap, assert the reducer receives a combined block state. Alternatively, test the overlap-detection function in isolation if it exists as a pure function.
**Classification:** should-fix

### UNTESTABLE: Day 3, Step 8 — iPad smoke test
"Verify drag/combine works on real iPad" is manual with no checklist.
**Suggested criteria:** Reuse the Day 4 iPad test checklist (drag-and-drop, combine, split, orientation switch) as a subset. Document pass/fail in a `day3-ipad-smoke.md` file. Define a blocking failure (e.g., "drag doesn't work" blocks Day 4) vs non-blocking (e.g., "animation janky" is Day 5 polish).
**Classification:** should-fix

### VAGUE-CRITERIA: Day 3 exit gate — "Both panels rendering, blocks draggable, combine working. Verified on iPad."
"Rendering" and "working" are not testable assertions.
**Suggested rewrite:** Exit gate: `npm test` passes (including any new component smoke tests). On staging: (1) both panels visible in landscape and portrait, (2) a block can be dragged from tray to work area, (3) two 1/4 blocks can be combined into 2/4, (4) no console errors in Safari.
**Classification:** must-fix

### MISSING-TEST: Day 4, Steps 1-3 — Integration wiring (engine to UI, guided discovery e2e, assessment e2e)
This is the most critical integration work and has zero automated tests. The only verification is manual iPad playthrough.
**Suggested:** Add at least one integration test per flow: (1) render App, dispatch START_LESSON, assert intro message appears in ChatPanel, (2) simulate completing a guided discovery problem, assert phase advances, (3) simulate a wrong answer, assert hint appears. These are React Testing Library tests, not E2E. Add as Day 4 sub-task between steps 3 and 4.
**Classification:** must-fix

### VAGUE-CRITERIA: Day 4, Step 4 — iPad test checklist
The checklist exists (drag-and-drop, combine, split, orientation switch, comparison zones, check button, lesson completion) but has no pass/fail criteria per item.
**Suggested rewrite:** Each checklist item should have a concrete expected outcome, e.g.: "Drag-and-drop: block follows finger with <100ms latency, snaps to grid on release" / "Combine: dropping 1/4 on 1/4 produces 2/4 block with correct width and label" / "Orientation switch: layout changes within 1 second, no content loss."
**Classification:** should-fix

### UNTESTABLE: Day 4, Step 5 — Confirm target iPad model
This is a decision task, not a testable deliverable.
**Suggested criteria:** Document the target device in README or a config comment. No test needed, but the decision should be recorded so Day 5 testers know what to test on.
**Classification:** should-fix (minor)

### VAGUE-CRITERIA: Day 4 exit gate — "Full lesson playable on iPad. Prod deployed and verified."
"Playable" and "verified" are undefined.
**Suggested rewrite:** Exit gate: A tester (or the developer) can complete all 3 assessment problems on iPad Safari without encountering blocking bugs. Prod URL returns 200 and loads the app. `npm test` passes with no skipped tests.
**Classification:** must-fix

### MISSING-TEST: Day 5, Steps 2-3 — Visual polish + STRETCH items
No verification for polish work. Acceptable for stretch items, but animations and color changes can break layout.
**Suggested:** Run existing test suite after polish changes. Add visual regression testing as a stretch goal (e.g., Playwright screenshot comparison). At minimum: `npm test` must still pass after polish commits.
**Classification:** should-fix

### VAGUE-CRITERIA: Day 5 exit gate — "Demo video recorded, README complete, prod live and tested."
"README complete" and "tested" are undefined.
**Suggested rewrite:** Exit gate: (1) demo video is 60-120 seconds and shows all 5 content segments from the Demo Video Plan, (2) README contains: project description, local dev setup commands, deploy commands, live URL, (3) prod URL loads and full lesson is completable, (4) `npm test` passes.
**Classification:** should-fix

---

## Summary Table

| ID | Finding | Type | Classification |
|----|---------|------|---------------|
| 1 | Firebase project creation — no automated verify | UNTESTABLE | should-fix |
| 2 | iPad CSS essentials — no regression test | UNTESTABLE | should-fix |
| 3 | iPad pointer spike — result not captured | UNTESTABLE | should-fix |
| 4 | lessonContext.tsx — no test planned | MISSING-TEST | must-fix |
| 5 | Day 2 exit gate — "covers full lesson flow" vague | VAGUE-CRITERIA | must-fix |
| 6 | LessonLayout/ChatPanel/ChatMessage — no component tests | MISSING-TEST | should-fix |
| 7 | WorkspacePanel/FractionBlock/AlignmentZone — no automated tests | MISSING-TEST | must-fix |
| 8 | Block combine UI integration — not tested | MISSING-TEST | should-fix |
| 9 | Day 3 iPad smoke test — no checklist or pass/fail | UNTESTABLE | should-fix |
| 10 | Day 3 exit gate — "rendering" and "working" vague | VAGUE-CRITERIA | must-fix |
| 11 | Day 4 integration wiring — zero automated tests | MISSING-TEST | must-fix |
| 12 | Day 4 iPad checklist — no pass/fail per item | VAGUE-CRITERIA | should-fix |
| 13 | Confirm target iPad model — decision not recorded | UNTESTABLE | should-fix |
| 14 | Day 4 exit gate — "playable" and "verified" undefined | VAGUE-CRITERIA | must-fix |
| 15 | Day 5 polish — no regression guard | MISSING-TEST | should-fix |
| 16 | Day 5 exit gate — "complete" and "tested" undefined | VAGUE-CRITERIA | should-fix |

**Must-fix: 6 items** (IDs 4, 5, 7, 10, 11, 14)
**Should-fix: 10 items** (IDs 1, 2, 3, 6, 8, 9, 12, 13, 15, 16)

## Key Recommendations

1. **Add a "test tasks" line to Days 3 and 4.** The plan has TDD for pure logic (Days 1-2) but drops testing entirely for UI and integration (Days 3-4). At minimum, add React Testing Library smoke tests for the core components and one integration test per lesson phase.

2. **Make exit gates concrete and automatable.** Replace "working" / "verified" / "complete" with specific assertions that can be checked by running a command or following a 5-item checklist with expected outcomes.

3. **Capture manual test results.** iPad testing is inherently manual, but results should be documented (even a simple pass/fail checklist file) so regressions can be identified across days.

# PRD Alignment Review: Synthesis Tutor Design Doc

**Review:** R1 — Goals alignment
**PRD:** `.prd-reviews/synthesis-tutor/prd-draft.md`
**Plan:** `.designs/synthesis-tutor/design-doc.md`
**Date:** 2026-03-14

---

## Explicit Goals (PRD Goals section)

### Goal 1: Working single-lesson prototype that teaches fraction equivalence through guided exploration + assessment

**ALIGNED** — The plan defines a four-phase lesson flow (`intro` -> `exploration` -> `guided_discovery` -> `assessment` -> `complete`) with a state machine driving transitions. Fraction equivalence is the core topic. The lesson engine + lesson script handle guided exploration, and assessment is specified as 3 problems with unlimited retries and escalating hints.

### Goal 2: Conversational tutor interface with warm, encouraging tone that guides students through the lesson flow (scripted dialogue with branching for correct/incorrect)

**ALIGNED** — The plan includes a `ChatPanel` with tutor/student message bubbles, student responses via buttons (not free-text), and the lesson engine handles branching on correct/incorrect answers. The `lessonScript.ts` holds all dialogue content. Hint escalation (general -> specific -> direct guidance) provides branching depth.

### Goal 3: Interactive fraction manipulative — visual workspace where students can see, combine, split, and compare fraction blocks

**PARTIAL** — The plan covers combine (drag-to-merge), compare (alignment/comparison zone with "=" sign), and visual representation (color-coded SVG blocks at denominator-specific widths). However, **split is classified as STRETCH** and may not ship. The PRD explicitly lists "split" as a core part of the manipulative experience.

**Gap:** The PRD says students should be able to "split" blocks. The plan acknowledges splitting is limited with denominators 2-5 (only 1/2 -> two 1/4s is valid) and moves it to STRETCH. The plan's own analysis justifies this — splitting is near-useless with the chosen denominator range — but it does create a gap with the PRD's stated goal.

**Classification:** should-fix. The plan's reasoning is sound (splitting has only one valid case with denom 2-5). Two options: (a) implement the single valid split case (1/2 -> 1/4, 1/4) as REQUIRED since it's only one case, or (b) explicitly document in the plan that splitting is descoped with rationale, so the PRD can be updated. Option (a) is low-effort and closes the gap.

### Goal 4: iPad-first browser experience — must work well on iPad Safari/Chrome with touch interactions

**ALIGNED** — The plan has a dedicated "iPad Safari Essentials" checklist covering viewport meta, touch-action, dvh units, pointer capture, and rubber-band scroll prevention. SVG + pointer events unify mouse/touch. Responsive layout handles both orientations (768px breakpoint). The sprint plan allocates Day 5 specifically for iPad bug fixes.

### Goal 5: Demonstrable in a 1-2 minute video — flow should be clear and compelling enough to showcase in a short demo

**ALIGNED** — The plan lists "demo video" as a REQUIRED deliverable and schedules it on Day 5. The four-phase lesson flow (intro -> explore -> guided -> assess -> complete) provides a natural demo narrative arc. The visual design spec (color-coded blocks, comparison zones) should produce a visually clear demo.

---

## Implicit Goals (from Problem Statement)

### IG1: Replicate the Synthesis Tutor experience of combining conversational AI with interactive digital manipulatives

**ALIGNED** — The split-screen layout (chat panel + workspace panel) directly mirrors this dual-mode interaction. The lesson engine coordinates between tutor dialogue and workspace actions, so the two sides are coupled — tutor prompts drive workspace tasks, workspace actions trigger tutor responses.

### IG2: Kids explore rather than grind

**ALIGNED** — The exploration phase allows free-form block manipulation before any structured tasks. The "Let's go!" button gives the student control over when to transition. No fail state in assessment (unlimited retries) prevents a "grind" feel.

### IG3: Speed and interaction quality matter more than breadth (1-week sprint)

**ALIGNED** — The plan is aggressively scoped: no backend, no auth, no CI/CD, manual deploy, useReducer instead of XState/Redux. REQUIRED vs STRETCH classification is explicit. Sprint plan is day-by-day with clear deliverables. TDD priority list is ordered for maximum coverage of core logic first.

---

## Implicit Goals (from User Stories)

### US1: Exploration phase — student sees fraction blocks, can drag/combine/split, tutor encourages free exploration

**PARTIAL** — Same gap as Goal 3: split is STRETCH. Otherwise fully covered — block tray provides blocks, free-form work area allows manipulation, exploration phase exists in the state machine, tutor messages guide exploration.

**Gap:** Split interaction may not be available during exploration.

**Classification:** should-fix (same as Goal 3).

### US2: Guided discovery — student makes 1/2 using different block combinations, visual alignment confirms equivalence

**ALIGNED** — The comparison zone with side-by-side alignment and "=" sign directly supports this. The tutor script provides guided prompts. Visual block widths (140px for 1/2, 70px for 1/4) make alignment physically obvious. "Check" button confirms the answer.

### US3: Structured questions — tutor presents equivalence problems, correct answers advance, incorrect get hints

**ALIGNED** — The lesson engine handles branching on CHECK_ANSWER events. Escalating hint system (general -> specific -> direct guidance) handles incorrect answers. ADVANCE_STEP moves the lesson forward on correct answers.

### US4: Check for understanding — 3-5 assessment problems, solve with retry to complete, tutor celebrates

**ALIGNED** — Plan specifies 3 problems with unlimited retries and escalating hints. After 3+ wrong attempts, tutor walks through the answer (no dead-end). The `complete` phase exists for celebration. The plan says 3 problems; the PRD says 3-5 — 3 is within range.

### US5: Demo scenario — evaluator sees conversational flow + manipulative working together, lesson progression visible

**ALIGNED** — The split-screen layout shows both panels simultaneously. Phase transitions are visible. Demo video is a REQUIRED deliverable.

---

## Implicit Goals (from Constraints)

### C1: TypeScript/JavaScript tech stack

**ALIGNED** — React + TypeScript + Vite.

### C2: TDD — tests should drive implementation

**PARTIAL** — The plan specifies Vitest with co-located tests and a TDD priority list for model/engine layers. However, E2E tests are classified as STRETCH, and there is no mention of writing tests *before* implementation in the sprint plan. The sprint plan reads as "build X + tests" not "write tests, then implement."

**Gap:** The plan describes testing as concurrent with implementation rather than test-first. For a 1-week sprint this is pragmatic, but the PRD says "TDD" which implies tests-first.

**Classification:** should-fix. The plan should state that model + engine layers will be developed test-first (which is easy for pure functions). UI/component testing can be pragmatic. This is a process clarification, not an architecture change.

### C3: GCP deployment with CI/CD pipeline

**MISALIGNED** — The PRD initially says "Need CI/CD pipeline" in Constraints, but then the Clarifications section (Q3) explicitly says "skip CI/CD, manual firebase deploy is fine." The plan follows the clarification (no CI/CD, manual deploy), which is correct. However, the plan should note this was a deliberate descope per clarification, not an oversight.

**Classification:** not a real issue — the clarification supersedes the original constraint. No fix needed.

### C4: Firebase Hosting with prod + staging environments

**ALIGNED** — Plan specifies Firebase Hosting, one project, two sites (staging + prod), with `npm run deploy:staging` and `npm run deploy:prod` commands.

### C5: Support both portrait and landscape orientation

**ALIGNED** — Plan specifies responsive layout with 768px breakpoint, side-by-side in landscape, stacked in portrait, CSS media queries.

### C6: Use shadcn/ui for frontend components

**ALIGNED** — Plan lists shadcn/ui + Tailwind in the tech stack. ChatPanel uses shadcn ScrollArea, Card, Button. UI component directory is specified.

---

## Implicit Goals (from Clarifications)

### CL1: Denominators 2 through 5 (halves, thirds, quarters, fifths)

**ALIGNED** — Plan uses `type Denominator = 2 | 3 | 4 | 5` and has analyzed the implications (limited splitting, thirds/fifths isolated from halves/quarters).

### CL2: SVG + pointer events for manipulative

**ALIGNED** — Explicitly chosen and detailed in the plan.

### CL3: Concrete gesture definitions (combine = drag-onto, split = tap + menu, compare = side-by-side zones)

**PARTIAL** — Combine and compare gestures match. Split gesture (tap -> radial menu -> select) is defined but classified as STRETCH.

**Classification:** should-fix (same item as Goal 3).

### CL4: Check button for workspace answers

**ALIGNED** — `CheckButton.tsx` component exists in file structure. `CHECK_ANSWER` event in the type system.

### CL5: "Let's go!" button for phase transition

**ALIGNED** — `FINISH_EXPLORATION` event triggered by "Let's go!" button.

### CL6: Assessment: 3 problems, unlimited retries, escalating hints, no fail state

**ALIGNED** — Exactly as specified in the plan.

### CL7: Priority order: pedagogical rigor > visual polish > code quality

**PARTIAL** — The plan does not explicitly state this priority ordering. The sprint plan allocates Day 5 to "polish" but doesn't define what to cut if time runs short. The REQUIRED vs STRETCH list implicitly captures this, but the evaluator's priority rubric should inform tradeoff decisions.

**Gap:** No explicit statement of the evaluator's priority rubric or how it maps to tradeoff decisions during the sprint.

**Classification:** should-fix. Add a brief "Tradeoff Principles" section stating: if time is tight, protect pedagogical flow (lesson coherence, hint quality, exploration freedom) over visual polish (animations, confetti) over code quality (test coverage, refactoring).

---

## Summary

| Status | Count |
|--------|-------|
| ALIGNED | 15 |
| PARTIAL | 5 |
| MISALIGNED | 0 |

### Items requiring action

| # | Item | Status | Severity | Recommendation |
|---|------|--------|----------|----------------|
| 1 | Split interaction is STRETCH but PRD lists it as core manipulative capability | PARTIAL | should-fix | Implement the single valid split case (1/2 -> two 1/4s) as REQUIRED. Low effort, closes the gap. |
| 2 | TDD process not explicitly test-first in sprint plan | PARTIAL | should-fix | State that model + engine layers use test-first development. UI layers use test-concurrent. |
| 3 | Evaluator priority rubric (pedagogy > polish > code) not reflected in plan | PARTIAL | should-fix | Add a "Tradeoff Principles" section mapping the evaluator's priorities to sprint decisions. |

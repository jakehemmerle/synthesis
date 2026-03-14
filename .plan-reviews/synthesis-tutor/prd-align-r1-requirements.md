# PRD Alignment Review: Synthesis Tutor Design Doc

**Reviewed:** 2026-03-14
**PRD:** `.prd-reviews/synthesis-tutor/prd-draft.md`
**Plan:** `.designs/synthesis-tutor/design-doc.md`

---

## Problem Statement

- COVERED: "Replicate Synthesis Tutor experience as single-lesson prototype focused on fraction equivalence" — Executive Summary + entire design doc scope.
- COVERED: "Target audience is elementary-age students using iPads in a browser" — iPad Safari Essentials section, responsive layout section.
- COVERED: "1-week sprint challenge, functional demo not production system" — Sprint Plan (5 days), REQUIRED vs STRETCH classification.

## Goals

- COVERED: Goal 1 "Working single-lesson prototype teaching fraction equivalence through guided exploration + assessment" — Lesson phases (intro, exploration, guided_discovery, assessment, complete), assessment section with 3 problems.
- COVERED: Goal 2 "Conversational tutor interface with warm encouraging tone, scripted dialogue with branching" — ChatPanel component, lessonEngine state machine, lessonScript.ts for content, branching for correct/incorrect in REQUIRED list.
- COVERED: Goal 3 "Interactive fraction manipulative — see, combine, split, compare fraction blocks" — WorkspacePanel (SVG), FractionBlock component, Interaction Design table (drag, combine, split, compare via alignment zones).
- COVERED: Goal 4 "iPad-first browser experience with touch interactions" — iPad Safari Essentials checklist (7 items), pointer events, touch-action: none, responsive layout.
- PARTIAL: Goal 5 "Demonstrable in 1-2 minute video" — Listed in REQUIRED #11 and Sprint Plan Day 5, but no details on what the demo video should show, recording approach, or script outline. Missing: any guidance on demo video content/structure. **should-fix**

## Non-Goals

- COVERED: "No LLM integration" — State machine approach, scripted dialogue throughout.
- COVERED: "No curriculum system" — Single lesson only.
- COVERED: "No user accounts, auth, or persistence" — Executive Summary explicitly states "No backend, no auth, no persistence."
- COVERED: "No complex adaptive difficulty" — Simple correct/incorrect branching, escalating hints.
- COVERED: "No analytics or reporting dashboard" — Not mentioned; security section confirms "No analytics, no tracking."
- COVERED: "No native app, web only" — SPA deployed to Firebase Hosting.

## User Stories / Scenarios

- COVERED: Story 1 "Exploration phase — tutor greets, introduces workspace, student drags/combines/splits, tutor encourages" — 'exploration' phase in LessonPhase type, Block Tray + Work Area zones, FINISH_EXPLORATION event with "Let's go!" button.
- COVERED: Story 2 "Guided discovery — make 1/2 using different combinations, visual alignment" — 'guided_discovery' phase, Comparison Zone with "=" sign, CHECK_ANSWER event.
- COVERED: Story 3 "Structured questions — equivalence problems, correct advances, incorrect gets hints" — lessonEngine state transitions, branching, hint escalation (general -> specific -> direct guidance).
- COVERED: Story 4 "Check for understanding — 3-5 assessment problems, retry to complete, celebration" — Assessment section (3 problems, unlimited retries, escalating hints), 'complete' phase. Confetti celebration is STRETCH #2.
- PARTIAL: Story 4 specifies "3-5 assessment problems" but plan fixes at 3. This is fine for MVP but worth noting. **No action needed** — 3 is within range.

## Constraints

- COVERED: "Timeline: 1 week" — Sprint Plan, 5 days.
- COVERED: "Platform: iPad browser (Safari), touch-first" — iPad Safari Essentials, pointer events.
- COVERED: "Tech stack: TypeScript/JavaScript" — React + TypeScript.
- PARTIAL: "Deployment: GCP. Need CI/CD pipeline" — Firebase Hosting (GCP) is covered. CI/CD is explicitly descoped per PRD Clarification Q3 ("manual firebase deploy is fine"). Plan correctly reflects this. **No action needed** — PRD clarification overrides original constraint.
- COVERED: "Methodology: TDD" — TDD Priority section, co-located tests, Vitest.
- COVERED: "No backend required for MVP" — "Frontend-only SPA", no backend.

## Open Questions (as resolved in Clarifications)

- COVERED: Q1 "Denominator range: 2-5" — `type Denominator = 2 | 3 | 4 | 5`, Visual Design table shows all four block types.
- COVERED: Q2 "SVG + pointer events" — Key Design Decision #3.
- COVERED: Q3 "Skip CI/CD, manual deploy" — CI/CD row says "None (manual)."
- COVERED: Q4 "Firebase Hosting, two environments (prod + staging)" — Deployment section: "one project, two sites (staging + prod)", deploy scripts.
- COVERED: Q5 "Concrete gesture definitions (combine, split, compare)" — Interaction Design table maps all three gestures.
- COVERED: Q6 "Check button for workspace answers" — CheckButton.tsx component, CHECK_ANSWER event.
- COVERED: Q7 "Let's go! button for exploration -> guided discovery" — FINISH_EXPLORATION event, Phase transition row in Interaction Design.
- COVERED: Q8 "Assessment: 3 problems, unlimited retries, escalating hints, no fail state" — Assessment section matches exactly.
- COVERED: Q9 "Evaluator priorities: (1) pedagogical rigor, (2) visual polish, (3) code quality" — REQUIRED vs STRETCH classification prioritizes accordingly.
- COVERED: Q10 "Patrick Skinner is evaluator" — Not relevant to plan (no design impact).
- COVERED: Q11 "Support both portrait and landscape" — Responsive Layout section, 768px breakpoint, REQUIRED #8.
- COVERED: Q12 "iPad model TBD" — Not actionable yet; plan covers general iPad Safari compatibility.

## Additional Decisions from Clarifications

- COVERED: "REQUIRED vs STRETCH classification" — Explicit section in design doc.
- COVERED: "UI framework: shadcn/ui" — Tech Stack table, component file structure.
- COVERED: "Audio/TTS: not in scope" — Not mentioned in plan (correctly omitted).

---

## Gaps and Partial Coverage

### GAP: Warm/encouraging tutor tone — no content guidance
The PRD repeatedly emphasizes "warm, encouraging tone" and gives example dialogue ("Try putting two 1/4 blocks together -- what do you notice?", "Nice! You just showed that 2/4 = 1/2"). The plan has `lessonScript.ts` as a file but provides zero sample dialogue, tone guidelines, or example messages. The lesson script is the core pedagogical deliverable per evaluator priority #1 (pedagogical rigor).
**Suggested fix:** Add a section with sample tutor messages for each phase (intro greeting, exploration prompts, guided discovery confirmations, assessment questions, hint escalation examples, completion celebration). Even 2-3 examples per phase would anchor the tone.
**Classification: must-fix**

### GAP: Compare gesture mechanics underspecified
PRD Clarification Q5 defines Compare as "Side-by-side alignment zones -> visual equivalence." The plan mentions a Comparison Zone with two drop slots and "=" sign, but does not describe how visual equivalence feedback works. When a student places blocks in the two slots, what happens visually? Do blocks resize to show alignment? Is there a color/animation cue for match vs mismatch?
**Suggested fix:** Add a paragraph describing the visual feedback when blocks are placed in the comparison zone (e.g., blocks scale to same width, matching highlights green, non-matching shows gap).
**Classification: should-fix**

### GAP: Specific equivalence problems not defined
The plan says "3 assessment problems" and the lesson script is a file, but no actual problems are specified. Given the denominator 2-5 constraint and the insight that "thirds and fifths are isolated from halves and quarters," the viable equivalence problems are quite limited. The plan should enumerate them to confirm there are enough for a meaningful lesson.
**Suggested fix:** List the concrete equivalence problems for guided discovery and assessment phases (e.g., "Show 1/2 = 2/4", "Show 2/5 using 1/5 blocks", "Show 3/4 using 1/4 blocks"). This also validates the denominator range is sufficient.
**Classification: must-fix**

### PARTIAL: Demo video (Goal 5)
Listed as REQUIRED #11 and in Sprint Plan Day 5, but no details on recording tool, target length, what flow to demonstrate, or where the video will be hosted/delivered.
**Suggested fix:** Add a brief "Demo Video" subsection noting: target length (1-2 min), key flow to capture (full lesson from intro through assessment completion), and recording method (e.g., iPad screen recording or browser dev tools device emulation).
**Classification: should-fix**

### PARTIAL: Split interaction feasibility vs lesson design
The plan correctly identifies that splitting is limited (only 1/2 -> 2x 1/4 within denominator 2-5) and classifies tap-to-split as STRETCH. However, the PRD user stories mention "split" as a core exploration activity ("can drag, combine, and split them"). If split is deferred, the exploration phase loses one of its three core verbs. The plan should explicitly address how exploration stays engaging with only drag + combine.
**Suggested fix:** Add a note explaining that exploration will focus on combining blocks from the tray and comparing results, with split as a stretch enhancement. Alternatively, expand the split to allow 1/3 -> 3x (1/3 of 1/3) if denominator range is loosened to include display-only fractions.
**Classification: should-fix**

---

## Summary

| Status | Count |
|--------|-------|
| COVERED | 29 |
| PARTIAL | 3 |
| GAP | 3 |

**Must-fix (2):**
1. Add sample tutor dialogue / tone guidance for lessonScript.ts
2. Enumerate concrete equivalence problems for guided discovery + assessment

**Should-fix (4):**
1. Describe visual feedback mechanics for the comparison zone
2. Add demo video planning details
3. Address how exploration phase works without split interaction
4. Add brief demo video content/structure guidance (overlaps with #2)

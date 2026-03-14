# Tracer Bullet Gap Analysis: Synthesis Tutor

**Date:** 2026-03-14
**Comparing:** Original beads (syn-xqg, 39 beads) vs Tracer Bullet beads (syn-wvj, 20 beads)
**Source docs:** requirements.md, PRD (prd-draft.md), Design doc (design-doc.md)

---

## 1. Coverage Map: Original Bead → TB Bead(s)

| Original Bead | Title | TB Bead(s) | Notes |
|---|---|---|---|
| syn-rd7 | Project scaffolding + iPad essentials | syn-k5u | Absorbed into TB Day 1 scaffolding |
| syn-h94 | Firebase project setup (prod + staging) | syn-k5u | Absorbed into TB Day 1 scaffolding |
| syn-4o0 | iPad pointer event spike | syn-hke, syn-1uh | Replaced by real tracer bullet + iPad test |
| syn-7df | fraction.ts + tests | syn-vgg, syn-7s0 | Extract on Day 2 + comprehensive tests Day 4 |
| syn-j2c | workspace.ts + tests | syn-vgg (partial) | Zone checking extracted; hit detection partially covered |
| syn-3nk | README skeleton | syn-yjd | No separate skeleton; full README on Day 5 |
| syn-k1z | lessonEngine.ts + tests | syn-nu6, syn-knr | Minimal engine Day 2, full tests Day 4 |
| syn-0iw | lessonScript.ts (full lesson content) | syn-m60, syn-9vf | Content authored incrementally Days 2-3 |
| syn-6y7 | lessonScript.test.ts | syn-vzd, syn-knr | Script tests on Day 3 + Day 4 |
| syn-2aq | lessonContext.tsx + useLesson hook | syn-nu6 | Context created when wiring engine to UI |
| syn-t8m | LessonLayout.tsx (responsive) | syn-7un | Portrait layout on Day 3 |
| syn-qtq | ChatPanel + ChatMessage | syn-hke (partial) | Chat built in tracer bullet, refined later |
| syn-e2s | WorkspacePanel + FractionBlock + drag | syn-hke (partial) | Workspace built in tracer bullet |
| syn-pgs | ComparisonZone | syn-hke (partial) | Comparison zone built in tracer bullet |
| syn-8r8 | CheckButton | syn-hke (partial) | Check button built in tracer bullet |
| syn-tlp | Block combine on drop | syn-8pu | Combine interaction Day 2 |
| syn-0pq | Tap-to-split (1/2 only) | syn-mpv | Split on Day 3 |
| syn-iiw | iPad smoke test | syn-1uh, syn-dx5 | iPad tests on Days 1 and 3 |
| syn-dw6 | Component smoke tests | syn-vzd | Smoke tests on Day 3 |
| syn-dzd | Wire lesson engine to UI | syn-nu6 | Wired immediately on Day 2 |
| syn-unn | Guided discovery flow | syn-m60 | Guided problems 2-3 on Day 3 |
| syn-zsd | Assessment flow | syn-9vf | Assessment on Day 3 |
| syn-n82 | Integration test (lessonFlow.test.tsx) | syn-w5u | Integration test on Day 4 |
| syn-2my | iPad full test + staging deploy | syn-dx5, syn-462 | iPad test Day 3, deploy Day 4 |
| syn-3l6 | Prod deploy | syn-462 | Staging + prod deploy Day 4 |
| syn-np0 | Bug fixes + visual polish | syn-qas | Day 5 polish |
| syn-su5 | README | syn-yjd | Day 5 README |
| syn-04h | Demo video (1-2 min) | syn-6bo | Day 5 demo video |
| syn-6og | Final deploy | syn-2jy | Day 5 final deploy |

### STRETCH beads (unchanged, not part of TB rewrite):

| Original Bead | Title | In TB? |
|---|---|---|
| syn-ixc | Confetti celebration | No TB counterpart (expected: STRETCH stays as-is) |
| syn-fiy | Typing indicator | No TB counterpart (expected) |
| syn-g4m | Progress bar | No TB counterpart (expected) |
| syn-90h | Play Again button | No TB counterpart (expected) |
| syn-4h8 | Loading state | No TB counterpart (expected) |
| syn-dge | Error boundary | No TB counterpart (expected) |
| syn-8uq | Idle nudges | No TB counterpart (expected) |
| syn-c7o | Collapsible chat (portrait) | No TB counterpart (expected) |
| syn-wdg | E2E tests (Playwright) | No TB counterpart (expected) |
| syn-40v | Animated block merge/split | No TB counterpart (expected) |

All 10 STRETCH beads exist in the original set and were intentionally NOT recreated in the TB set. They remain as standalone beads under the original epic. **No gaps here** -- this is by design.

---

## 2. Feature Gaps: Missing from Tracer Bullet Beads

### Gap 1: workspace.ts as a dedicated module with tests

**What's missing:** The original plan had `syn-j2c` (workspace.ts + tests) as a dedicated bead covering block operations, zone checking, and hit detection as a pure logic module. The TB plan partially absorbs zone checking into `syn-vgg` (fraction model extraction), but **workspace.ts as its own tested module is not explicitly called out**.

**Original bead:** syn-j2c
**Source doc:** Design doc specifies `model/workspace.ts + .test.ts` as a separate file with "block operations, hit detection, zone checking."
**Required or Stretch:** REQUIRED (it's in the design doc file structure)
**Severity:** **Nice-to-have as a separate bead.** The functionality IS present -- zone checking is mentioned in syn-vgg, and hit detection is built into the tracer bullet (syn-hke). The gap is organizational, not functional. The workspace logic will exist; it just doesn't have a dedicated extraction/test bead. The syn-vgg description does mention "Also extract workspace zone checking logic" so this is partially covered.

### Gap 2: SVG coordinate conversion utility

**What's missing:** The original `syn-2aq` explicitly mentions "SVG coordinate conversion helper (getScreenCTM().inverse())" as a deliverable. The TB plan mentions this technique in syn-hke (the tracer bullet uses getScreenCTM()) but never has an explicit extraction step for this utility.

**Original bead:** syn-2aq (partial)
**Source doc:** Design doc Section "iPad Safari Essentials" item 6: "SVG coordinate conversion via getScreenCTM().inverse()"
**Required or Stretch:** REQUIRED
**Severity:** **Nice-to-have as a separate item.** The code WILL exist (it's built into the tracer bullet on Day 1). It just won't necessarily be extracted into a standalone helper. In practice this is a 3-line function (design doc even says "inline 3-line helper, not a separate module"), so not extracting it is fine.

### Gap 3: No explicit "Block Tray" bead

**What's missing:** The design doc specifies three workspace zones: Block Tray (top, replenishing source), Work Area (middle), and Comparison Zone (bottom). The TB plan mentions comparison zones and a work area, and syn-hke mentions "block tray containing 1/2 and 1/4 blocks," but there's no bead that explicitly addresses the **replenishing/infinite source** behavior of the block tray.

**Original beads:** This was implicit across syn-e2s (workspace) and syn-dzd (wiring).
**Source doc:** Design doc Section "Workspace Zones" -- Block Tray: "Infinite/replenishing source of blocks."
**Required or Stretch:** REQUIRED (core interaction -- students need to pull new blocks from somewhere)
**Severity:** **Low risk.** The tracer bullet (syn-hke) includes a "block tray" in its description. The replenishing behavior is an implementation detail that will naturally emerge when building the workspace. No separate bead needed, but the TB descriptions should make clear that the tray replenishes.

---

## 3. Source Document Requirements Check

### requirements.md Functional Requirements

| # | Requirement | TB Bead(s) | Covered? |
|---|---|---|---|
| 1 | Conversational chat interface with scripted tutor responses | syn-hke (partial), syn-nu6, syn-m60, syn-9vf | YES |
| 2 | Interactive digital workspace for fraction manipulation | syn-hke, syn-vgg | YES |
| 3 | Visual fraction blocks tool | syn-hke | YES |
| 4 | Ability to combine/split/manipulate fraction blocks | syn-8pu (combine), syn-mpv (split) | YES |
| 5 | Guided lesson flow with exploration and assessment phases | syn-nu6, syn-m60, syn-9vf | YES |
| 6 | Simple branching logic for correct/incorrect answers | syn-nu6, syn-8pu, syn-9vf | YES |

### requirements.md Deliverables

| Deliverable | TB Bead(s) | Covered? |
|---|---|---|
| Working prototype of fraction equivalence lesson | Entire TB set | YES |
| Web-based app, runnable in browser | syn-k5u (Vite SPA) | YES |
| 1-2 minute demo video | syn-6bo | YES |
| README with setup instructions | syn-yjd | YES |

### requirements.md Constraints

| Constraint | TB Bead(s) | Covered? |
|---|---|---|
| Must run on iPad in web browser | syn-1uh, syn-dx5, syn-462 | YES |
| No language/framework restrictions | syn-k5u (React+TS chosen) | YES |

### PRD Clarifications (prd-draft.md)

| Clarification | TB Bead(s) | Covered? |
|---|---|---|
| Q1: Denominators 2-5 | syn-vgg (Denominator type: 2\|3\|4\|5) | YES |
| Q2: SVG + pointer events | syn-hke (SVG workspace + pointer events) | YES |
| Q3: Skip CI/CD, manual firebase deploy | syn-k5u, syn-462 | YES |
| Q4: Firebase Hosting, prod + staging | syn-k5u (prod+staging in description) | YES |
| Q5: Gesture definitions (combine=drag, split=tap, compare=side-by-side) | syn-8pu (combine), syn-mpv (split), syn-hke (comparison zone) | YES |
| Q6: Check button for workspace answers | syn-hke (Check button) | YES |
| Q7: "Let's go!" button for phase transition | syn-nu6 (FINISH_EXPLORATION event), syn-8pu (Let's go in happy path) | YES |
| Q8: 3 problems, unlimited retries, escalating hints, no fail state | syn-9vf (3 assessment, escalating hints, no fail state) | YES |
| Q9: Evaluator priorities (pedagogy > polish > code) | syn-qas (mentions this priority order) | YES |
| Q10: Patrick Skinner is evaluator | N/A (informational) | N/A |
| Q11: Both portrait AND landscape | syn-7un (portrait layout) + syn-hke (landscape in tracer) | YES |
| Q12: iPad model TBD | syn-462 (mentions confirming target iPad model) | YES |
| shadcn/ui for frontend | syn-k5u (shadcn/ui in description) | YES |
| REQUIRED vs STRETCH classification | All TB beads labeled "required" | YES |

### Design Doc REQUIRED Items

| # | Design Doc REQUIRED Item | TB Bead(s) | Covered? |
|---|---|---|---|
| 1 | Conversational chat interface with scripted tutor responses | syn-hke, syn-nu6 | YES |
| 2 | Interactive fraction manipulative with visual blocks | syn-hke | YES |
| 3 | Drag-to-combine interaction | syn-8pu | YES |
| 4 | Tap-to-split (1/2 → two 1/4s) | syn-mpv | YES |
| 5 | Guided lesson flow: exploration → guided → assessment | syn-nu6, syn-m60, syn-9vf | YES |
| 6 | Simple branching for correct/incorrect | syn-nu6, syn-8pu | YES |
| 7 | 3 assessment problems with retry | syn-9vf | YES |
| 8 | Runs on iPad browser (Safari) | syn-1uh, syn-dx5 | YES |
| 9 | Both portrait and landscape orientation | syn-7un | YES |
| 10 | Deployed to Firebase Hosting (prod + staging) | syn-k5u, syn-462 | YES |
| 11 | README with setup instructions | syn-yjd | YES |
| 12 | 1-2 minute demo video | syn-6bo | YES |

### Design Doc TDD Items

| Test Target | TB Bead(s) | Covered? |
|---|---|---|
| fraction.test.ts | syn-vgg (Day 2 extract+test), syn-7s0 (Day 4 comprehensive) | YES |
| workspace.test.ts | syn-vgg (partial -- zone checking) | PARTIAL (see Gap 1) |
| lessonEngine.test.ts | syn-nu6 (Day 2 TDD reducer), syn-knr (Day 4 comprehensive) | YES |
| lessonScript.test.ts | syn-vzd (Day 3), syn-knr (Day 4) | YES |

### Design Doc Concrete Problems

| Problem | TB Bead(s) | Covered? |
|---|---|---|
| Guided 1: Show 2/4 = 1/2 | syn-8pu (first guided problem) | YES |
| Guided 2: Show 2/2 = 4/4 | syn-m60 | YES |
| Guided 3: Make 1 whole using fifths | syn-m60 | YES |
| Assessment 1: Make 1/2 using quarters | syn-9vf | YES |
| Assessment 2: Make 1 whole using thirds | syn-9vf | YES |
| Assessment 3: Show two ways to make 1/2 | syn-9vf | YES |

---

## 4. STRETCH Items Audit

All 10 STRETCH beads from the original plan remain as standalone beads:

| # | Bead | Title | Status |
|---|---|---|---|
| 1 | syn-ixc | Confetti celebration | OPEN -- unchanged |
| 2 | syn-fiy | Typing indicator | OPEN -- unchanged |
| 3 | syn-g4m | Progress bar | OPEN -- unchanged |
| 4 | syn-90h | Play Again button | OPEN -- unchanged |
| 5 | syn-4h8 | Loading state | OPEN -- unchanged |
| 6 | syn-dge | Error boundary | OPEN -- unchanged |
| 7 | syn-8uq | Idle nudges | OPEN -- unchanged |
| 8 | syn-c7o | Collapsible chat (portrait) | OPEN -- unchanged |
| 9 | syn-wdg | E2E tests (Playwright) | OPEN -- unchanged |
| 10 | syn-40v | Animated block merge/split | OPEN -- unchanged |

All 10 are present and unchanged. No gaps.

**Note:** These STRETCH beads are under epic syn-xqg, not syn-wvj. They have no dependency links to the TB beads. This is fine for now -- they can be picked up after all REQUIRED TB work is done. However, if the TB epic (syn-wvj) is the active tracking epic, someone should ensure these STRETCH beads are discoverable. Consider adding a note to the TB epic description pointing to the STRETCH beads, or re-parenting them under syn-wvj.

---

## 5. Summary

### Verdict: The tracer bullet plan has NO functional gaps.

Every REQUIRED feature from requirements.md, the PRD clarifications, and the design doc is traceable to at least one TB bead. The 10 STRETCH beads remain unchanged.

### Minor organizational observations (not blocking):

1. **workspace.ts tests** -- zone checking and hit detection are mentioned in syn-vgg but not given the same prominence as the original syn-j2c. Risk: these tests get skipped during extraction. Mitigation: the syn-vgg description already says "Also extract workspace zone checking logic" -- just make sure tests come with it.

2. **Block tray replenishing behavior** -- implicit in the tracer bullet but not explicitly called out. Will naturally emerge during implementation. No action needed.

3. **SVG coordinate helper** -- design doc says it's a 3-line inline helper anyway. No separate bead needed.

4. **STRETCH bead discoverability** -- the 10 STRETCH beads live under the old epic (syn-xqg), not the new TB epic (syn-wvj). Consider adding a cross-reference.

### Bead count comparison:
- Original REQUIRED beads: 29
- TB REQUIRED beads: 20 (9 fewer -- consolidation, not removal)
- Original STRETCH beads: 10
- TB STRETCH beads: 10 (unchanged)

### Closed TB beads:
- syn-7s0 (fraction.ts comprehensive tests) -- CLOSED
- syn-knr (lesson engine + script tests) -- CLOSED

These two were already completed, which means fraction model and lesson engine testing is done ahead of schedule.

---

**Conclusion:** The tracer bullet plan is ready to execute. No must-add gaps found. The 20 TB beads cover all REQUIRED functionality from all three source documents. The plan is tighter (20 vs 29 REQUIRED beads) because the tracer bullet approach consolidates isolated component beads into integrated slices -- which is the whole point.

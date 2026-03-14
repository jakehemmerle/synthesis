# Sequencing Review: Synthesis Tutor Design Doc

**Reviewer:** Jake
**Date:** 2026-03-14
**Scope:** Phase ordering, task dependencies, critical path, sprint day allocation

---

## Overall Assessment

The sprint plan follows a sound bottom-up sequence: pure logic (Days 1-2) then UI (Day 3) then integration (Day 4) then polish (Day 5). The layered architecture (model -> engine -> components) naturally dictates this order and the plan respects it. However, there are several sequencing issues worth addressing.

---

## Findings

### FINDING 1: Firebase project setup is deferred to Day 4 but should start Day 1

**Severity:** must-fix

Firebase project creation, CLI install, and `firebase.json` configuration are implied in Day 4 ("deploy staging") but not explicitly scheduled. Firebase project provisioning can take time (billing setup, site creation for staging + prod, domain configuration). If anything goes wrong, Day 4 loses hours.

**Suggested reorder:** Add "Firebase project + CLI setup" as a 15-minute task at the end of Day 1, right after scaffolding. Verify `firebase deploy` works with the bare Vite scaffold. This de-risks Day 4 entirely.

---

### FINDING 2: shadcn/ui init is Day 1 but shadcn components aren't used until Day 3

**Severity:** should-fix

Day 1 includes "Vite+React+shadcn running" but no shadcn components (Button, Card, ScrollArea) are needed until the ChatPanel on Day 3. Installing shadcn on Day 1 is not wrong, but it front-loads work that could block scaffolding if there are Tailwind config issues.

**Suggested reorder:** Keep shadcn init on Day 1 (it's fast and validates the Tailwind pipeline), but explicitly note that individual component installation (`npx shadcn-ui add button card scroll-area`) should happen at the start of Day 3 when they're actually needed. This avoids re-work if component choices change during Days 1-2.

---

### FINDING 3: Workspace model (Day 2) has no dependency on fraction model (Day 1) being complete, but the plan implies serial execution

**Severity:** should-fix

`workspace.ts` (block operations, hit detection, zone checking) and `fraction.ts` (equivalence, combine, split) are independent pure-logic modules. The workspace model uses `FractionBlock` types but doesn't call fraction math functions -- it handles positions, zones, and grouping. These could be developed in parallel.

**Suggested reorder:** If time pressure hits, workspace model work can begin on Day 1 afternoon while fraction tests are green. The plan doesn't need restructuring, but noting this parallelism opportunity gives flexibility.

---

### FINDING 4: lessonEngine (Day 2) depends on BOTH fraction model AND workspace model AND lessonScript

**Severity:** must-fix

The lesson engine state machine dispatches events like `WORKSPACE_UPDATED` and `CHECK_ANSWER`, which require:
- `fraction.ts` functions to evaluate equivalence (from Day 1)
- `workspace.ts` types for block state (also Day 2)
- `lessonScript.ts` for step definitions and hint content (also Day 2)

The plan lists all three as Day 2 deliverables with no sub-ordering. If someone starts with lessonEngine first on Day 2 morning, they'll be blocked because lessonScript (the data it consumes) doesn't exist yet.

**Suggested reorder:** Day 2 should have explicit sub-ordering:
1. `lessonScript.ts` + tests (lesson data, no deps)
2. `workspace.ts` + tests (block ops, no deps on engine)
3. `lessonEngine.ts` + tests (depends on 1 + 2 + fraction model from Day 1)

---

### FINDING 5: Drag interaction (Day 3) depends on workspace model (Day 2) but also needs SVG coordinate math not specified anywhere

**Severity:** should-fix

The design doc mentions `getScreenCTM().inverse()` for SVG coordinate conversion and `setPointerCapture` for drag. These are non-trivial iPad Safari behaviors. The `usePointerDrag.ts` hook is listed in the file structure but not explicitly scheduled. It's implied in Day 3's "blocks draggable on iPad" but this is the highest-risk single task in the sprint.

**Suggested reorder:** `usePointerDrag.ts` should be the FIRST task on Day 3, before ChatPanel. If drag doesn't work on iPad Safari, the entire manipulative is broken. ChatPanel is lower risk (standard DOM, no touch concerns). Sequence: usePointerDrag -> WorkspacePanel + FractionBlock -> ChatPanel.

---

### FINDING 6: iPad testing is only mentioned on Day 4, but touch behavior is built on Day 3

**Severity:** must-fix

Day 3 says "blocks draggable on iPad" but Day 4 says "test on iPad." If iPad testing only happens on Day 4, an entire day of UI work (Day 3) could be built on broken assumptions about Safari pointer events. Touch bugs discovered on Day 4 could cascade into Day 5.

**Suggested reorder:** iPad device testing must happen at the end of Day 3, not Day 4. Even 30 minutes of iPad smoke testing on Day 3 evening will catch `touch-action`, viewport, and pointer capture issues before Day 4 integration work begins.

---

### FINDING 7: "Combine working" (Day 3) requires lesson engine awareness but Day 3 only lists UI tasks

**Severity:** should-fix

"Combine working" on Day 3 could mean two things: (a) visually dragging blocks onto each other triggers a merge animation, or (b) the combine operation updates state through the reducer and the lesson engine responds. If (b), Day 3 needs the lessonContext provider wired up, which means Day 2's engine must be fully integrated with React context -- but `lessonContext.tsx` and `useLesson.ts` aren't scheduled on any specific day.

**Suggested reorder:** Clarify that Day 3's "combine working" means visual-only (drag + snap + animation). Full state integration (context provider, reducer dispatch) is Day 4's "lesson flow end-to-end." Add `lessonContext.tsx` + `useLesson.ts` as explicit Day 4 morning tasks.

---

### FINDING 8: Demo video (Day 5) depends on prod deploy (Day 5) which depends on iPad bug fixes (Day 5)

**Severity:** must-fix

Day 5 has three serial dependencies: fix iPad bugs -> deploy prod -> record demo. The design doc allocates 2 hours for video recording on "Day 5 afternoon." If iPad bugs are serious, they eat into deploy time, which eats into video time. There's no buffer.

**Suggested reorder:** Move prod deploy to Day 4 evening (immediately after staging verification). Day 5 then becomes: iPad bug fixes morning -> re-deploy prod if needed -> demo video afternoon. This gives a full day of buffer instead of cramming three serial tasks into one day. Alternatively, the demo video can be recorded against staging if prod deploy is delayed.

---

### FINDING 9: README is Day 5 but has no dependencies -- it can be written earlier

**Severity:** should-fix

README with setup instructions is a required deliverable scheduled for Day 5. It has no code dependencies and could be drafted on Day 1 (scaffolding instructions) and updated incrementally. Writing it on Day 5 competes with bug fixes and video recording.

**Suggested reorder:** Draft README skeleton on Day 1 after scaffolding. Update it on Day 4 after staging deploy with final setup/deploy instructions.

---

### FINDING 10: No explicit task for CSP headers in firebase.json

**Severity:** should-fix

The design doc specifies CSP headers in firebase.json under Security, but this isn't scheduled on any day. CSP headers can break a deployed app if they're too restrictive (blocking inline styles from Tailwind, for example). Discovering this on Day 4 during staging deploy wastes time.

**Suggested reorder:** Add CSP header configuration to Day 1's Firebase setup task (Finding 1). Test that the scaffold deploys and renders correctly with CSP headers active.

---

## Critical Path Analysis

The critical path through the sprint is:

```
Day 1: fraction.ts (tests + impl)
  -> Day 2: lessonScript.ts -> workspace.ts -> lessonEngine.ts
    -> Day 3: usePointerDrag -> WorkspacePanel -> ChatPanel
      -> Day 4: lessonContext + integration -> staging deploy -> iPad test
        -> Day 5: bug fixes -> prod deploy -> demo video
```

This is a strictly serial chain with no slack. The critical path length equals the sprint length (5 days), meaning any delay on any day pushes the final deliverable.

**Opportunities to shorten the critical path:**
1. `workspace.ts` can be parallelized with `fraction.ts` on Day 1 (Finding 3)
2. Firebase setup on Day 1 removes it from Day 4's critical path (Finding 1)
3. Prod deploy on Day 4 evening removes it from Day 5's critical path (Finding 8)
4. README drafted on Day 1 removes it from Day 5 (Finding 9)

**No circular dependencies detected.** The dependency graph is a clean DAG.

---

## Sprint Day Load Assessment

| Day | Current Load | Assessment |
|-----|-------------|------------|
| 1 | Scaffold + fraction model TDD | Light-moderate. Good. Room for Firebase setup + README draft. |
| 2 | Engine + script + workspace model | Heavy. Three modules with TDD. Feasible if sub-ordered per Finding 4. |
| 3 | Chat UI + workspace SVG + drag | Heavy. Drag is high-risk. Needs iPad smoke test (Finding 6). |
| 4 | End-to-end integration + assessment + staging deploy + iPad test | Overloaded. This is 4 distinct workstreams. Should offload prod deploy here (Finding 8). |
| 5 | Polish + prod deploy + demo video + README | Overloaded if bugs found. Manageable if prod deploy moved to Day 4 and README drafted earlier. |

**Days 4 and 5 are overloaded.** The suggested reorders in Findings 1, 8, and 9 redistribute work from Days 4-5 into Days 1-2 where there is capacity.

---

## Summary

| # | Finding | Severity |
|---|---------|----------|
| 1 | Firebase setup deferred to Day 4 | must-fix |
| 2 | shadcn component install timing | should-fix |
| 3 | Workspace + fraction model can parallelize | should-fix |
| 4 | Day 2 tasks need sub-ordering | must-fix |
| 5 | usePointerDrag should be first on Day 3 | should-fix |
| 6 | iPad testing must happen Day 3, not only Day 4 | must-fix |
| 7 | "Combine working" scope ambiguous across days | should-fix |
| 8 | Day 5 has three serial deps with no buffer | must-fix |
| 9 | README can be drafted earlier | should-fix |
| 10 | CSP headers not scheduled | should-fix |

**Must-fix count:** 4
**Should-fix count:** 6
**Circular dependencies:** None

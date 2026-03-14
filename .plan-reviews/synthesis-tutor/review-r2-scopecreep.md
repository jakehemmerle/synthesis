# Plan Review Round 2: Scope Creep

## Summary

The plan is generally well-scoped for a 1-week sprint. Most items tie directly to requirements. However, there are several areas where the plan adds work beyond what the PRD and requirements.md call for, or where simpler approaches would save time without sacrificing the deliverables.

---

## Findings

### SIMPLIFY: Workspace zones (3-zone layout: tray + work area + comparison zone) — over-engineered

**Severity: should-fix**

The design specifies three distinct workspace zones (block tray, work area, comparison zone with two drop slots and "=" sign). The requirements just say students need to "manipulate digital representations of fractions" and demonstrate equivalence. A simpler two-zone layout (tray + work area) where the check button evaluates whatever is in the work area would achieve the same pedagogical goal with less hit-detection logic, less layout work, and fewer touch-interaction edge cases.

Simpler approach: single work area with a tray. The "check answer" button evaluates blocks currently in play. Skip the formal comparison zone with drop slots.

---

### DEFER: Tap-to-split with radial menu — not needed for MVP

**Severity: should-fix**

The plan includes a radial menu for split interactions. The design itself acknowledges that only one split is viable (1/2 into two 1/4s). A radial menu is UI infrastructure for a single option. A simple "tap to split" that immediately splits 1/2 into two 1/4s (no menu) is sufficient. The plan even moved split to REQUIRED specifically because it's "trivial" — the radial menu makes it non-trivial.

Simpler approach: tap a 1/2 block, it splits into two 1/4 blocks. No menu. One animation.

---

### CUT: CSP headers in firebase.json — unnecessary for a demo prototype

**Severity: should-fix**

The Security section adds CSP headers to firebase.json. This is a static SPA with no backend, no auth, no data collection, no user input that gets stored. CSP headers protect against XSS and injection attacks that are not possible in this architecture. This is security theater for a 1-week demo app.

Suggested action: remove. Default Firebase Hosting headers are sufficient.

---

### CUT: `npm audit` — unnecessary ceremony

**Severity: should-fix**

Running `npm audit` once after setup is listed as a security task. For a 1-week prototype with no backend and no user data, this adds no value and risks sending the developer down a dependency-fixing rabbit hole on Day 1.

Suggested action: remove.

---

### DEFER: Staging + prod dual deployment — one environment is enough for a sprint

**Severity: should-fix**

The plan calls for two Firebase Hosting sites (staging + prod), deploy targets, and separate deploy commands. The PRD says "deploy to GCP." The requirements say "runnable in a standard browser." Nobody asked for staging. For a solo 1-week sprint, a single deployment target is sufficient. You can just deploy to the one site repeatedly.

Suggested action: defer staging to stretch. Deploy to a single Firebase Hosting site.

---

### SIMPLIFY: `workspace.ts` with hit detection — over-engineered for ~15 blocks

**Severity: should-fix**

The plan calls for a separate `workspace.ts` module with hit detection and zone checking as a pure-logic layer, TDD'd on Day 1. With a maximum of ~15 SVG blocks that are DOM nodes, hit detection is free via pointer events on SVG elements (`event.target`). Zone checking is a simple bounding-box check. This doesn't need its own module or a test suite on Day 1.

Simpler approach: inline hit detection via SVG pointer events. Zone checking (if zones are kept) is a 5-line utility function, not a module.

---

### SIMPLIFY: `lessonScript.test.ts` structural validation — over-engineered

**Severity: should-fix**

The plan includes a test file that validates the lesson script has no dead-end steps, all step IDs resolve, etc. This is tooling you build for a content management system with many authors and many lessons. This is one lesson with ~25 messages written by one person. You can verify correctness by reading the file. If a step ID is wrong, you'll find out in 5 seconds when you test the lesson flow.

Simpler approach: skip structural validation tests. The lesson engine integration tests will catch broken references.

---

### DEFER: Demo video plan detail — premature planning

**Severity: should-fix**

The plan includes a detailed demo video plan (recording method, duration targets, shot-by-shot breakdown, 2-hour time allocation). This is Day 5 work being planned in detail on Day 0. The actual content of the demo depends on what gets built. The plan should say "Record demo video (Day 5, ~1-2 hours)" and leave it at that.

Suggested action: collapse to a single line. Plan the shots on Day 5.

---

### SIMPLIFY: Core types — `groupId` on FractionBlock adds complexity

**Severity: should-fix**

The `FractionBlock` type includes a `groupId: string | null` field for tracking combined blocks. The "unit fractions only" model means 2/4 is represented as two separate 1/4 blocks. But if they're combined, are they one visual unit or two? The `groupId` concept introduces grouping state management (create group, dissolve group, move group, render group) that ripples through every layer. If combined blocks simply become a single block with a higher numerator (abandoning the "always unit fractions" rule for combined blocks), the model is far simpler.

Simpler approach: when two 1/4 blocks combine, replace them with one block representing 2/4 (rendered as a wider block). No grouping system needed.

---

### CUT: SVG coordinate conversion utility as separate Day 2 task

**Severity: should-fix**

`getScreenCTM().inverse()` is a 3-line helper function, not a task that warrants its own line item on Day 2. It'll be written naturally when implementing drag in `usePointerDrag.ts` on Day 3.

Suggested action: remove as a standalone task. It'll happen organically during drag implementation.

---

## Items Reviewed and Found Appropriate

- useReducer + Context (right-sized for single lesson)
- No CI/CD (correct for 1-week sprint)
- TDD on fraction model and lesson engine (these are the load-bearing logic)
- shadcn/ui (good tradeoff: clean components without building from scratch)
- SVG + pointer events (correct technical choice for iPad touch)
- iPad smoke test on Day 3 (good risk mitigation)
- 5-day sprint breakdown with exit gates (good structure)
- REQUIRED vs STRETCH classification (good discipline)

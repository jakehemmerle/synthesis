# Completeness Review — Round 1

Reviewed: `.designs/synthesis-tutor/design-doc.md`
Against: `requirements.md`, PRD alignment rounds 1-3

---

## Findings

### Infrastructure & Build

- FINDING: No task for Firebase project creation and configuration.
  Severity: must-fix
  Suggested addition: Add an explicit Day 1 task: "Create Firebase project, enable Hosting, configure two sites (staging/prod), generate `.firebaserc` and `firebase.json` with CSP headers." The plan references Firebase deploy commands and CSP headers but never says when or how the project is created.

- FINDING: No mention of environment variables or deploy credentials setup.
  Severity: should-fix
  Suggested addition: Add a task to Day 1 or Day 4: "Run `firebase login`, verify CI token or local auth, document any env vars needed for deploy scripts (`npm run deploy:staging`, `npm run deploy:prod`)."

- FINDING: Vite config for SPA routing is not mentioned.
  Severity: should-fix
  Suggested addition: Add to Day 1 scaffolding: "Configure Vite for SPA (single index.html fallback) and verify Firebase Hosting rewrites in `firebase.json` so direct-URL or refresh on iPad doesn't 404."

### Testing

- FINDING: No integration or component test tasks.
  Severity: should-fix
  Suggested addition: The plan has TDD for pure model/engine layers, which is good. Add at least one task for a smoke-level React component test (e.g., "LessonProvider renders, dispatching START_LESSON transitions to intro phase") to catch wiring bugs between the pure layer and React. Co-locate in Day 3 or Day 4.

- FINDING: No task for manual iPad test pass with a checklist.
  Severity: must-fix
  Suggested addition: Day 4 says "test on iPad" but doesn't specify what to verify. Add a concrete checklist task: "iPad Safari test pass: (1) drag works without page scroll, (2) portrait/landscape both render, (3) combine gesture works, (4) split gesture works, (5) full lesson flow completes, (6) no console errors. Record pass/fail for each."

### Documentation

- FINDING: README authoring is a single bullet on Day 5 with no scope.
  Severity: should-fix
  Suggested addition: Expand to: "Write README covering: (a) local dev setup (`npm install`, `npm run dev`), (b) how to deploy to staging/prod, (c) tech stack summary, (d) known limitations. PRD explicitly requires 'instructions on how to run the application and a brief overview of your technical approach.'"

### Error Handling

- FINDING: No error boundary or fallback UI task in REQUIRED scope.
  Severity: should-fix
  Suggested addition: Error boundary is listed as STRETCH item 11, but a white-screen crash during a live demo is catastrophic. Add a minimal task to Day 4 or Day 5: "Wrap App in React error boundary with a simple 'Something went wrong, please refresh' message." This is ~10 lines of code and high ROI.

- FINDING: No handling for drag-outside-viewport or pointer loss.
  Severity: should-fix
  Suggested addition: Add to Day 3 drag implementation: "Handle edge cases: pointercancel event (finger leaves screen), drag near viewport edge (clamp position), and pointerup outside SVG (commit or cancel gracefully)." These are common iPad gotchas.

### Implicit Dependencies

- FINDING: shadcn/ui initialization steps not called out.
  Severity: should-fix
  Suggested addition: Add to Day 1 scaffolding: "Run `npx shadcn-ui@latest init`, configure Tailwind, install needed components (Button, Card, ScrollArea). Verify shadcn components render before moving on." This is a multi-step process that can eat time if not planned.

- FINDING: SVG coordinate system dependency is mentioned (getScreenCTM) but no task covers implementing or testing it.
  Severity: must-fix
  Suggested addition: Add an explicit Day 3 task: "Implement SVG screen-to-local coordinate conversion using `getScreenCTM().inverse()`. Test on iPad Safari specifically -- Safari's CTM behavior differs from Chrome. This is a blocking dependency for all drag-and-drop."

### Task Granularity

- FINDING: Day 3 is overloaded — chat panel + workspace SVG + drag + combine, all in one day.
  Severity: must-fix
  Suggested addition: Break Day 3 into explicit subtasks with priority order: (1) SVG workspace rendering with static blocks, (2) pointer drag working on iPad, (3) chat panel with hardcoded messages, (4) combine gesture. If time runs short, chat panel can be minimal — workspace interaction is the demo centerpiece.

- FINDING: Day 2 "lesson data authored" is vague.
  Severity: must-fix
  Suggested addition: Expand to: "Author complete lessonScript.ts with all steps, tutor messages, hint escalation text, and assessment problem definitions for all 3 guided discovery + 3 assessment problems enumerated in the design doc." This is significant content work that needs to be scoped explicitly.

### Lesson Content Authoring

- FINDING: No task for writing the actual lesson script content (tutor dialogue, hints, transitions).
  Severity: must-fix
  Suggested addition: The design doc has sample dialogue and problem definitions, but there's no explicit task for translating these into the `lessonScript.ts` data structure. Add to Day 2: "Author full lesson script: intro greeting, exploration prompts, 3 guided discovery steps with hint escalation (gentle/specific/walkthrough for each), 3 assessment problems with success/failure responses, and completion message. Review script for tone consistency with 'warm older sibling' voice."

- FINDING: Hint escalation content is not specified for each problem.
  Severity: should-fix
  Suggested addition: The design doc shows 3 hint levels but only gives generic examples. Add to the lesson authoring task: "Write 3 levels of hints for each of the 6 problems (3 guided + 3 assessment) = 18 hint messages total. Include the walkthrough text for 3+ wrong attempts."

### Missing from Sprint Plan

- FINDING: No task for the "Play Again" / reset flow.
  Severity: should-fix
  Suggested addition: Play Again is listed as STRETCH item 9, but the RESET event is already in the core types. Clarify: is the lesson one-shot (refresh to restart) or does RESET work? If one-shot, remove RESET from the type definition to avoid confusion. If not, add a small task.

- FINDING: No task for the block tray (replenishing source of blocks).
  Severity: should-fix
  Suggested addition: The design describes a block tray with "infinite/replenishing source of blocks" but no task covers implementing this mechanic. Add to Day 3: "Implement block tray that spawns new blocks when dragged out (or has unlimited supply). Define which denominations are available per lesson phase."

- FINDING: No accessibility considerations.
  Severity: should-fix
  Suggested addition: At minimum for a children's ed-tech app: sufficient color contrast on block labels (check the pastel colors against white text), and aria-labels on interactive elements. Add a 30-minute task to Day 5 polish.

---

## Summary

| Severity | Count |
|----------|-------|
| must-fix | 6 |
| should-fix | 10 |

The plan's architecture and design decisions are strong. The gaps are mostly in operational tasks (Firebase setup, iPad testing checklist), task granularity (Day 2-3 are underspecified), and lesson content authoring (the actual script writing is the hardest creative work and has no explicit task). The must-fix items should be addressed before starting the sprint; the should-fix items can be folded in during daily planning.

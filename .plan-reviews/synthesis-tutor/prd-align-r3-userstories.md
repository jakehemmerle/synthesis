# PRD Alignment Round 3: User Stories / Scenarios

Tracing every user story and scenario from the PRD through the design-doc to verify end-to-end coverage.

---

## User Story 1: Exploration Phase

> Student opens the app on an iPad. The tutor greets them warmly and introduces the fraction workspace. The student sees fraction blocks (e.g., a whole block, half blocks, quarter blocks) and can drag, combine, and split them. The tutor encourages free exploration: "Try putting two 1/4 blocks together — what do you notice?"

### Step-by-step trace:

| Step | Plan coverage |
|------|---------------|
| Student opens app on iPad | iPad Safari Essentials checklist (viewport meta, touch-action, dvh, fixed body). Deployment to Firebase Hosting. COVERED. |
| Tutor greets warmly | LessonPhase `intro` → `exploration`. Sample dialogue includes greeting: "Hey there! Ready to play with some fractions?" COVERED. |
| Introduces the fraction workspace | Greeting message references blocks: "Check out those blocks up top — try dragging some into the work area!" COVERED. |
| Student sees fraction blocks (whole, halves, quarters) | Block Tray described as "infinite/replenishing source of blocks." Visual design table defines colors/widths for 1/2, 1/3, 1/4, 1/5. COVERED. |
| Can drag blocks | Drag interaction defined (pointerdown 100ms hold → pointermove → pointerup). usePointerDrag hook. COVERED. |
| Can combine blocks | Combine gesture: drop block on same-denomination block → merge. COVERED. |
| Can split blocks | Tap-to-split: tap block → radial menu → select split. Moved to REQUIRED in round 1 (1/2→1/4 only). COVERED. |
| Tutor encourages free exploration | Sample dialogue includes exploration prompts. COVERED. |

**COVERED:** User Story 1 → LessonPhase intro/exploration, Block Tray, drag/combine/split interactions, sample greeting dialogue, iPad Safari checklist, Firebase deploy.

### Edge case

- **PARTIAL:** PRD mentions "a whole block" alongside halves and quarters. The plan's Denominator type is `2 | 3 | 4 | 5` — there is no `1` (whole block). The plan describes making wholes by combining (e.g., "2/2 = 4/4" and "five 1/5 blocks"), but the Block Tray has no standalone "whole" block to drag. The PRD says "e.g." so this is illustrative, not prescriptive, and the plan's approach of demonstrating wholes via combination is pedagogically stronger. **No fix needed.**

---

## User Story 2: Guided Discovery

> The tutor asks the student to make 1/2 using different combinations of blocks. The student drags two 1/4 blocks onto the workspace and sees them visually align with a 1/2 block. The tutor confirms: "Nice! You just showed that 2/4 = 1/2."

### Step-by-step trace:

| Step | Plan coverage |
|------|---------------|
| Tutor asks student to make 1/2 using different combinations | LessonPhase `guided_discovery`. Guided discovery problem 1: "Show that 2/4 = 1/2." COVERED. |
| Student drags two 1/4 blocks onto workspace | Drag interaction + Work Area described. COVERED. |
| Blocks visually align with a 1/2 block | Comparison Zone: "Two drop slots with '=' sign for equivalence checking." Visual design: 1/2 = 140px, two 1/4s = 2×70px = 140px. COVERED. |
| Tutor confirms equivalence | Sample dialogue: "You got it! Two quarters make a half — that's fraction equivalence!" CHECK_ANSWER event → correct path → tutor message. COVERED. |

**COVERED:** User Story 2 → LessonPhase guided_discovery, guided discovery problem 1, Comparison Zone, CHECK_ANSWER event, correct-answer tutor dialogue.

---

## User Story 3: Structured Questions

> The tutor presents fraction equivalence problems: "Can you show me another way to make 1/2?" The student uses the manipulative to demonstrate. Correct answers advance the lesson; incorrect answers get gentle redirection with hints.

### Step-by-step trace:

| Step | Plan coverage |
|------|---------------|
| Tutor presents equivalence problems | Guided discovery problems 2 and 3 defined. Assessment problems 1-3 defined. COVERED. |
| "Can you show me another way to make 1/2?" | Assessment problem 3: "Show two different ways to make 1/2." COVERED. |
| Student uses manipulative to demonstrate | Workspace interactions (drag, combine, comparison zone, check button). COVERED. |
| Correct answers advance lesson | ADVANCE_STEP event in LessonEvent type. State machine transitions. COVERED. |
| Incorrect answers get gentle redirection with hints | Hint escalation: general → specific → direct guidance. Sample dialogue includes hint messages. Round 2 confirmed "2 hints + walkthrough." COVERED. |

**COVERED:** User Story 3 → Guided discovery + assessment problems, hint escalation system, ADVANCE_STEP event, correct/incorrect branching in lessonEngine.

---

## User Story 4: Check for Understanding

> The lesson concludes with 3-5 assessment problems. The student must solve them correctly (with retry) to complete the lesson. The tutor celebrates completion.

### Step-by-step trace:

| Step | Plan coverage |
|------|---------------|
| Lesson concludes with 3-5 assessment problems | 3 assessment problems defined (within PRD's 3-5 range). LessonPhase `assessment`. COVERED. |
| Student must solve correctly | CHECK_ANSWER event evaluates blocks in comparison zone. COVERED. |
| With retry | "Unlimited retries" specified. No fail state. COVERED. |
| Complete the lesson | LessonPhase `complete`. COVERED. |
| Tutor celebrates completion | Sample dialogue: "You're a fractions superstar! You just proved that different fractions can be equal. High five!" COVERED. |

**COVERED:** User Story 4 → LessonPhase assessment/complete, 3 assessment problems, unlimited retries, celebration dialogue.

### Edge case

- **PARTIAL:** PRD says "3-5 assessment problems." Plan commits to exactly 3. This is within range and acceptable for a 1-week sprint. The plan notes only limited viable equivalence problems exist with denominators 2-5. **No fix needed.**

---

## User Story 5: Demo Scenario

> An evaluator watches a 1-2 minute video or live demo showing the conversational flow and interactive manipulative working together. They can see the lesson progression and the quality of the student interaction.

### Step-by-step trace:

| Step | Plan coverage |
|------|---------------|
| 1-2 minute video | Demo Video Plan section: 60-90 seconds, QuickTime + iPad via USB. COVERED. |
| Or live demo | Firebase Hosting deployment (prod + staging). Evaluator can access live URL. COVERED. |
| Shows conversational flow | Demo captures: tutor greeting (5s), guided discovery (20s), assessment correct/incorrect (30s). COVERED. |
| Interactive manipulative working together | Demo captures: drag blocks, combine two 1/4s (15s). COVERED. |
| Lesson progression visible | Demo walks through all phases: launch → exploration → guided → assessment → completion. COVERED. |
| Quality of student interaction | Evaluator priorities documented: pedagogical rigor > visual polish > code quality. COVERED. |

**COVERED:** User Story 5 → Demo Video Plan (method, duration, content sequence), Firebase deployment for live access, evaluator priority order.

---

## Cross-Cutting Concerns

### Phase transitions

The PRD implies a linear flow: exploration → guided discovery → structured questions → assessment → completion. Tracing through the plan:

- `intro` → `exploration`: START_LESSON event. COVERED.
- `exploration` → `guided_discovery`: FINISH_EXPLORATION event via "Let's go!" button. COVERED.
- `guided_discovery` → `assessment`: Implicit after guided problems complete (ADVANCE_STEP). COVERED by state machine, though transition trigger is not explicitly named.
- `assessment` → `complete`: After all 3 assessment problems solved. COVERED.

**PARTIAL:** The transition from `guided_discovery` to `assessment` is not explicitly defined as a named event or explicit trigger in the plan. The LessonEvent type has ADVANCE_STEP which presumably handles this, but the plan does not describe what the user sees at this boundary (does the tutor announce "challenge time"?). The sample dialogue includes "Okay, challenge time!" which implies this is covered in the lesson script, but the state machine transition is implicit. **should-fix** — Add a note to lessonScript.ts responsibilities that it must include a transition message between guided discovery and assessment phases.

### PRD's "structured questions" vs plan's phases

The PRD has four phases (exploration, guided discovery, structured questions, assessment). The plan collapses "structured questions" into `guided_discovery` — the guided discovery problems ARE the structured questions. This is a reasonable simplification: the PRD's "structured questions" description is functionally identical to guided discovery with the Check button. **No fix needed.**

---

## Summary

| User Story | Verdict | Classification |
|-----------|---------|----------------|
| 1. Exploration phase | COVERED | — |
| 2. Guided discovery | COVERED | — |
| 3. Structured questions | COVERED | — |
| 4. Check for understanding | COVERED | — |
| 5. Demo scenario | COVERED | — |
| Cross-cutting: guided→assessment transition message | PARTIAL — happy path covered but the transition announcement from guided discovery to assessment is implicit in the plan, not explicitly assigned to a plan task | should-fix |

### Actionable item

- **should-fix:** The lessonScript.ts responsibilities (design-doc line ~79) should explicitly note that it must contain a transition/announcement message when moving from guided discovery to assessment (e.g., "Okay, challenge time!"). The sample dialogue already has this text, but it is not connected to a specific plan task or script step. This is low risk — the sample dialogue makes the intent clear and any implementer would naturally include it — but traceability is better if it is explicit.

## Conclusion

All 5 user stories are fully covered by plan tasks. One cross-cutting edge case (guided→assessment transition announcement) is a should-fix for traceability. No must-fix items. The plan provides strong end-to-end coverage of every PRD scenario.

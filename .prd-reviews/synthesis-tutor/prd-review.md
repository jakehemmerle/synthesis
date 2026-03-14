# PRD Review: Synthesis Tutor Clone — AI-Powered Fractions Lesson

## Executive Summary

The PRD captures the vision well and has strong Non-Goals. However, it lacks testable acceptance criteria, leaves load-bearing architectural decisions as open questions, and self-imposes constraints (CI/CD, TDD, GCP) beyond the original requirements that compete with the 1-week timeline. The interactive manipulative — the core differentiator — is underspecified in interaction design and is the highest schedule risk. The evaluator's success criteria are a complete blind spot. Overall readiness: **Medium-Low**. The PRD needs ~10 decisions resolved before implementation can start productively.

## Before You Build: Critical Questions

### Scope & Architecture

**Q1: What denominator range do we support?**
- Why this matters: Determines manipulative complexity, visual design, lesson script content, assessment problems, and fraction model. Everything depends on this.
- Found by: requirements, gaps, ambiguity, feasibility, scope (all 5 legs)
- Suggested answer: **Halves and quarters only** for MVP. Eighths as stretch. Powers-of-2 keep visual alignment clean and limit block types to 3.

**Q2: Canvas vs DOM vs SVG for the manipulative workspace?**
- Why this matters: Day 0 architectural decision. Affects testability, touch handling, animation approach, and development speed.
- Found by: feasibility, ambiguity
- Suggested answer: **SVG + pointer events**. SVG elements are DOM nodes (testable with Playwright), pointer events unify mouse/touch, no polyfills needed. Avoid HTML5 Drag-and-Drop API entirely — it doesn't work on touch devices.

**Q3: Is CI/CD pipeline actually required, or is manual deploy sufficient?**
- Why this matters: CI/CD setup (GitHub Actions + GCP auth + build config) easily consumes half a day. The original requirements never mention CI/CD — they ask for "a web-based app, runnable in a standard browser."
- Found by: scope, feasibility
- Suggested answer: **Skip CI/CD for the sprint.** Deploy manually via `firebase deploy` or use a free static host (Vercel/Netlify). CI/CD is gold-plating for a 1-week demo.

**Q4: Is GCP deployment a hard requirement, or would any static hosting work?**
- Why this matters: GCP project provisioning + Firebase Hosting setup takes time. Vercel/Netlify are zero-config for static SPAs.
- Found by: scope, feasibility
- Suggested answer: If GCP is required, use **Firebase Hosting** (fastest path). If not, **Vercel** for zero-config deploy.

### Interaction Design

**Q5: What do "combine," "split," and "compare" mean as concrete gestures?**
- Why this matters: These are the core interactions of the manipulative. Two engineers would build completely different UIs without specific gesture definitions.
- Found by: ambiguity, requirements, gaps
- Suggested answer: Define each verb:
  - **Combine**: Drag one block onto another → blocks merge with animation → fraction updates
  - **Split**: Tap a block → shows split options (into 2, into 4) → block divides
  - **Compare**: Place blocks side-by-side in alignment zones → visual alignment shows equivalence

**Q6: What is the student response mechanism for workspace-based questions?**
- Why this matters: Some questions are answered via chat buttons, some via workspace manipulation. The system needs to know when the student has "answered."
- Found by: ambiguity, gaps
- Suggested answer: Workspace answers use a **"Check" button** that the student taps when ready. Auto-detection is too complex for a 1-week sprint.

**Q7: What triggers the transition from exploration to guided discovery?**
- Why this matters: The lesson has an "exploration phase" but no defined exit condition.
- Found by: ambiguity
- Suggested answer: **Button-based** — tutor says "When you're ready, tap 'Let's go!'" Student controls pacing.

### Requirements & Acceptance

**Q8: What are the assessment pass/fail criteria?**
- Why this matters: The lesson's core success metric. "3-5 problems with retry" needs a concrete definition.
- Found by: requirements, ambiguity, gaps
- Suggested answer: **3 problems, must get each correct (unlimited retries with escalating hints)**. After 2 wrong attempts on a problem, tutor gives a stronger hint. No "fail" state — lesson doesn't end until completion.

**Q9: What does the evaluator judge the demo on?**
- Why this matters: Without knowing evaluation criteria, the team is optimizing blind. Visual polish vs. pedagogical rigor vs. code quality require very different time allocation.
- Found by: stakeholders
- Suggested answer: **Ask Patrick Skinner directly.** If no rubric exists, default priority: (1) working interaction between tutor + manipulative, (2) lesson teaches something demonstrably, (3) code is clean and tested.

**Q10: What is Patrick Skinner's role and what are his expectations?**
- Why this matters: Named as technical contact but completely absent from PRD. His criteria could reshape priorities.
- Found by: stakeholders
- Suggested answer: **Clarify before sprint starts.** Is he evaluating? Advising? Reviewing code?

### iPad-Specific

**Q11: Do we lock to landscape orientation?**
- Why this matters: The split-screen layout (chat left, workspace right) breaks in portrait.
- Found by: gaps, ambiguity, feasibility
- Suggested answer: **Yes, landscape only.** Add a "please rotate your device" overlay for portrait. Don't build a portrait layout.

**Q12: What iPad model and iPadOS version is the test device?**
- Why this matters: Pointer event support, Safari quirks, and rendering performance vary significantly across iPad generations.
- Found by: requirements, feasibility
- Suggested answer: **Get this from Patrick Skinner.** Affects whether pointer events work reliably.

## Important But Non-Blocking

- **TDD scope should be narrowed.** TDD the fraction model and lesson engine (pure logic, clear inputs/outputs). Skip E2E tests and visual interaction tests for the sprint. The original requirements don't mention TDD — it's self-imposed. (scope, feasibility)
- **Lesson script content needs to be written.** The PRD has zero actual dialogue. A rough script (even bullet points per step with branching conditions) should be drafted before UI work begins. (ambiguity)
- **"Smashing" from requirements was dropped without explanation.** The original requirements mention "smashing" fraction blocks. Either define it or explicitly de-scope it. (ambiguity)
- **Sprint Day 5 is overloaded.** Integration + polish + deploy + demo video is too much for one day. Demo video recording alone is 2-4 hours. Consider moving deploy to Day 4 evening. (scope, feasibility)
- **README is an explicit deliverable** in the original requirements but missing from PRD goals. (stakeholders)
- **No lesson restart mechanism.** After completing the lesson, how does the evaluator restart the demo without refreshing the browser? Add a "Play Again" button. (gaps)
- **Touch gesture conflicts with Safari.** Pinch-to-zoom and swipe-from-edge can interfere with manipulative. Must add `touch-action: manipulation` CSS and viewport meta tags. (gaps, feasibility)
- **Error boundary needed.** A white screen or frozen UI during demo is the worst outcome. Add a global error boundary with "Tap to restart." (gaps)
- **Audio/TTS should be moved to Non-Goals** for this sprint. Zero value for demo, significant complexity. (scope, feasibility)
- **Loading state.** Specify a simple loading indicator. Blank white screen on slow WiFi looks broken. (gaps)

## Observations and Suggestions

- The Non-Goals section is strong — explicitly scoping out LLM, accounts, analytics, and accessibility prevents common scope creep.
- Age range 7-11 is very broad developmentally. Consider targeting 8-9 (3rd grade) as the sweet spot for fraction equivalence.
- The tech stack (TypeScript + React) is a reasonable choice but the original requirements are framework-agnostic. Note this as a design decision, not a requirement.
- No pedagogy expert is identified to validate the math content. For a demo, this is acceptable if the developer understands fraction equivalence concepts.
- Consider a "lo-fi fallback" for the manipulative: tap-to-select + button-based combine/split. If drag-and-drop on iPad Safari proves too finicky, the lesson can still function.
- Define an explicit MVP cut-line: (1) Chat tutor walks through lesson, (2) Student can visually manipulate fraction blocks, (3) At least 2 equivalence exercises work end-to-end. Everything else is polish.
- The "fraction box" concept from the original requirements was silently dropped. Clarify whether this matters.

## Confidence Assessment

| Dimension | Score | Notes |
|-----------|-------|-------|
| Requirements completeness | Low-Medium | No acceptance criteria; open questions block test-writing |
| Technical feasibility | Medium-High | Architecture is sound; main risk is manipulative touch UX on iPad |
| Scope clarity | Medium | Good Non-Goals, but no MVP cut-line and self-imposed constraints add risk |
| Ambiguity level | Medium-Low | Core interactions undefined; dialogue script missing entirely |
| Stakeholder clarity | Medium-Low | Student actor adequate; evaluator criteria unknown |
| Overall readiness | **Medium-Low** | ~10 decisions needed before productive implementation can begin |

## Next Steps
- [ ] Human answers critical questions above (Q1-Q12)
- [ ] Update PRD with answers and resolved open questions
- [ ] Draft a rough lesson script (even bullet points)
- [ ] Confirm iPad test device specs
- [ ] Pour `design` convoy to generate implementation plan

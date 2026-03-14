# PRD: Synthesis Tutor Clone — AI-Powered Fractions Lesson

## Problem Statement

Synthesis Tutor has shown that combining conversational AI with interactive digital manipulatives creates deeply engaging math learning — kids explore rather than grind. We need to replicate this experience as a single-lesson prototype focused on **fraction equivalence** (e.g., 1/2 = 2/4). The target audience is elementary-age students using iPads in a browser.

**Why now:** This is a 1-week sprint challenge. The goal is a functional demo, not a production system. Speed and interaction quality matter more than breadth.

## Goals

1. **Working single-lesson prototype** that teaches fraction equivalence through guided exploration + assessment.
2. **Conversational tutor interface** with a warm, encouraging tone that guides students through the lesson flow (scripted dialogue with branching for correct/incorrect).
3. **Interactive fraction manipulative** — a visual workspace where students can see, combine, split, and compare fraction blocks to build conceptual understanding.
4. **iPad-first browser experience** — must work well on iPad Safari/Chrome with touch interactions.
5. **Demonstrable in a 1-2 minute video** — the flow should be clear and compelling enough to showcase in a short demo.

## Non-Goals

- **No LLM integration for the tutor.** Dialogue is scripted with branching logic. We're building a state machine, not a chatbot.
- **No curriculum system.** This is one lesson, not a lesson builder or multi-topic platform.
- **No user accounts, auth, or persistence.** No login, no saved progress, no student profiles.
- **No complex adaptive difficulty.** Simple branching (correct/incorrect paths) is sufficient.
- **No analytics or reporting dashboard.**
- **No accessibility compliance beyond basic usability.** Nice-to-have but not blocking for the sprint.
- **No native app.** Web only.

## User Stories / Scenarios

### Primary Actor: Elementary Student (ages 7-11)

1. **Exploration phase:** Student opens the app on an iPad. The tutor greets them warmly and introduces the fraction workspace. The student sees fraction blocks (e.g., a whole block, half blocks, quarter blocks) and can drag, combine, and split them. The tutor encourages free exploration: "Try putting two 1/4 blocks together — what do you notice?"

2. **Guided discovery:** The tutor asks the student to make 1/2 using different combinations of blocks. The student drags two 1/4 blocks onto the workspace and sees them visually align with a 1/2 block. The tutor confirms: "Nice! You just showed that 2/4 = 1/2."

3. **Structured questions:** The tutor presents fraction equivalence problems: "Can you show me another way to make 1/2?" The student uses the manipulative to demonstrate. Correct answers advance the lesson; incorrect answers get gentle redirection with hints.

4. **Check for understanding:** The lesson concludes with 3-5 assessment problems. The student must solve them correctly (with retry) to complete the lesson. The tutor celebrates completion.

### Secondary Actor: Demo Viewer (evaluator/stakeholder)

5. **Demo scenario:** An evaluator watches a 1-2 minute video or live demo showing the conversational flow and interactive manipulative working together. They can see the lesson progression and the quality of the student interaction.

## Constraints

- **Timeline:** 1 week. Everything ships by end of sprint.
- **Platform:** Must run on iPad browser (Safari). Touch-first interactions.
- **Tech stack:** TypeScript/JavaScript (per requirements). Framework choice is open.
- **Deployment:** GCP. Need CI/CD pipeline.
- **Methodology:** TDD — tests should drive the implementation.
- **Team:** Solo developer (AI-assisted).
- **No backend required for MVP** — lesson logic can run entirely client-side. A backend is only needed if we want persistence or server-side tutor logic (which we don't for this sprint).

## Open Questions

1. **Fraction representation:** What denominator range do we support? Just halves and quarters? Or also thirds, sixths, eighths? Broader range = more manipulative complexity.
2. **Touch interaction model:** Drag-and-drop on iPad Safari can be finicky. Do we use a canvas-based approach (HTML5 Canvas / WebGL) or DOM-based drag-and-drop? Canvas gives more control; DOM is simpler but has touch event quirks.
3. **Lesson script depth:** How many branching paths? A simple 2-path branch (correct/incorrect) per question, or deeper trees with multiple hint levels?
4. **Audio/voice:** Should the tutor "speak" (text-to-speech) or is text-only sufficient for the demo? Voice adds engagement but adds complexity.
5. **Fraction block physics:** Should blocks "snap" together when aligned? Should splitting be animated? How polished does the manipulative interaction need to feel?
6. **Assessment criteria:** What counts as "passing" the check-for-understanding? All correct on first try? Or allow retries?
7. **Visual design:** Any brand guidelines or style reference from Synthesis Tutor to match? Or is the visual design freeform?
8. **GCP deployment specifics:** Cloud Run? Firebase Hosting? App Engine? What's the preferred GCP service?

## Rough Approach

### Architecture
- **Frontend-only SPA** (single page application) deployed as static assets to GCP (likely Firebase Hosting or Cloud Run with nginx).
- **TypeScript + React** for the UI layer — component model maps well to the tutor chat + manipulative workspace split-screen layout.
- **State machine** for lesson flow — each lesson step is a state with transitions based on student actions. Libraries like XState or a simple reducer pattern.
- **Canvas or SVG** for the fraction manipulative workspace — needs smooth touch interactions for dragging, splitting, combining blocks.

### Key Components
1. **Chat Panel** — scrolling message list with tutor messages and student response options (buttons, not free-text input).
2. **Workspace Panel** — interactive fraction manipulative area. Split-screen layout (chat left, workspace right on iPad landscape).
3. **Lesson Engine** — state machine that coordinates tutor dialogue with workspace actions. Emits tutor messages, listens for student actions, advances the lesson.
4. **Fraction Model** — data model for fraction blocks (numerator, denominator, visual position, grouping). Handles equivalence checking, combination, splitting.

### Testing Strategy (TDD)
- Unit tests for fraction model (equivalence logic, splitting, combining).
- Unit tests for lesson engine state transitions.
- Integration tests for lesson flow (simulated student actions → expected tutor responses).
- E2E test for the full lesson happy path (Playwright or Cypress).

### CI/CD
- GitHub Actions: lint → test → build → deploy to GCP on push to main.

### Sprint Breakdown (rough)
- Day 1-2: Fraction model + lesson engine + tests
- Day 3-4: UI — chat panel + manipulative workspace with touch interactions
- Day 5: Integration, polish, deploy, record demo video

---

## Clarifications from Human Review

**Q1: Denominator range?**
A: Denominators 2 through 5 (halves, thirds, quarters, fifths). This means 4 block types with non-trivial visual alignment (thirds and fifths don't tile neatly with halves/quarters).

**Q2: SVG + pointer events for manipulative?**
A: Yes, SVG confirmed.

**Q3: Skip CI/CD?**
A: Yes, manual `firebase deploy` is fine. No CI/CD pipeline needed.

**Q4: GCP required?**
A: Firebase Hosting with firebase.app URLs. Cloud Run or serverless is fine. Need **two environments: prod and staging**.

**Q5: Concrete gesture definitions?**
A: Agreed.
- **Combine**: Drag block onto another → merge animation → fraction updates
- **Split**: Tap block → split menu (into 2, into N) → block divides
- **Compare**: Side-by-side alignment zones → visual equivalence

**Q6: "Check" button for workspace answers?**
A: Yes, check button confirmed.

**Q7: Button transition from exploration → guided discovery?**
A: Yes, "Let's go!" button confirmed.

**Q8: Assessment criteria?**
A: Not explicitly answered; defaulting to 3 problems, unlimited retries with escalating hints, no fail state.

**Q9: Evaluator priorities?**
A: Priority order: (1) pedagogical rigor, (2) visual polish, (3) code quality.

**Q10: Patrick Skinner's role?**
A: He is the evaluator.

**Q11: Orientation?**
A: Support **both portrait and landscape**. Vertical layout should work as well as horizontal.

**Q12: iPad model?**
A: Not specified yet. TBD.

**Additional decisions:**
- **Required vs Stretch**: Organize all work items with clear REQUIRED vs STRETCH classification based on requirements.md. Required work takes absolute priority.
- **UI framework**: Use **shadcn/ui** for clean frontend components.
- **Audio/TTS**: Not mentioned — remains non-goal for sprint.

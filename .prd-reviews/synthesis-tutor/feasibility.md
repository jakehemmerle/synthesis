# Technical Feasibility

## Summary

The PRD describes a frontend-only SPA teaching fraction equivalence through a chat panel + interactive manipulative workspace, deployed to GCP, built in one week with TDD. The core concept is achievable in a week, but only if the interactive manipulative is scoped aggressively. The hardest technical problem is building a touch-first drag-and-drop fraction workspace that feels good on iPad Safari — this is where the most time will be lost to unexpected issues, and the PRD leaves the key implementation decisions (Canvas vs DOM, snap behavior, animation) as open questions rather than resolving them.

The PRD correctly identifies that lesson logic, fraction model, and chat panel are straightforward. It underestimates the effort required for the manipulative workspace and overestimates how much TDD + CI/CD infrastructure can be absorbed into a 1-week solo sprint without cannibalizing feature development time.

## Findings

### Critical Gaps / Questions

- **Canvas vs DOM is still an open question (Open Question #2), but it's a Day 1 architectural decision that everything else depends on.** Canvas gives smooth touch and full rendering control but makes testing extremely difficult (no DOM nodes to query, no accessibility tree, no Playwright selectors). DOM/SVG is testable and simpler to build but iPad Safari drag-and-drop has well-documented quirks: `dragstart`/`dragover` events don't fire on touch, requiring `touchstart`/`touchmove`/`touchend` reimplementation or a library like `@use-gesture/react`. This decision needs to be made before any code is written. **Suggested resolution:** Use SVG + pointer events (not drag events). Pointer events unify mouse and touch, work on iPad Safari, and SVG elements are DOM nodes (testable). Avoid HTML5 Drag-and-Drop API entirely — it doesn't work on touch devices without polyfills.

- **The sprint breakdown allocates only 1 day for integration, polish, deploy, and demo video recording (Day 5).** GCP deployment setup (even Firebase Hosting) requires: project creation, CLI setup, build config, domain/URL setup, GitHub Actions secrets. Combined with CI/CD pipeline setup (GitHub Actions workflow file, test runner config, build step, deploy step), this is easily half a day for someone who hasn't done it before and 2-3 hours even for someone experienced. That leaves very little time for the inevitable integration bugs and polish. **Question:** Has the GCP project already been provisioned? Is there an existing CI/CD template to reuse?

- **TDD for the manipulative workspace is a significant overhead with unclear value.** The fraction model and lesson engine are perfect TDD targets — pure functions, clear inputs/outputs. But the manipulative UI (drag behavior, snap-to-grid, visual alignment, animation) is inherently visual and interactive. Writing tests for "block snaps to position when dragged within 20px" before implementing it is slow and the specs will change as you iterate on feel. Unit-testing canvas/SVG rendering requires mocking or snapshot testing, both of which are brittle. **Suggested approach:** TDD the model and engine layers. Use manual testing + a single Playwright E2E smoke test for the workspace.

- **The denominator range (Open Question #1) has direct impact on manipulative complexity.** Supporting halves and quarters means 2-3 block types with simple alignment. Adding thirds, sixths, and eighths means 6+ block types, non-trivial visual alignment (thirds don't tile neatly with halves), and more fraction model edge cases. The PRD should lock this down. **Recommendation for 1-week scope:** Halves and quarters only. Eighths as stretch goal.

### Important Considerations

- **iPad Safari touch responsiveness is a real risk.** Safari on iPad has a 300ms tap delay (fixable with `touch-action: manipulation` CSS), throttles `touchmove` events more aggressively than Chrome, and handles `pointer-events` differently in older iPadOS versions. If the target iPad runs iPadOS 15 or earlier, pointer event support may be incomplete. **Question:** What iPadOS version is on the testing iPad?

- **Animation smoothness on iPad.** CSS transitions and `requestAnimationFrame` perform well on modern iPads, but only if the render tree is simple. A Canvas approach sidesteps this (draws directly to GPU-composited layer). An SVG approach with many animated elements (e.g., 8+ fraction blocks moving simultaneously) could jank on older iPads. For the scope described (a few blocks at a time), this is manageable but worth profiling early.

- **State machine complexity is low for this scope.** A linear lesson with 2-path branching (correct/incorrect) at each step is ~10-15 states with simple transitions. XState is overkill; a simple reducer or even a flat array of step objects with `onCorrect`/`onIncorrect` handlers is sufficient. The PRD correctly identifies this and suggests both options. No risk here.

- **The "split" and "combine" interactions are harder than they sound.** "Drag two 1/4 blocks together to make 1/2" requires: detecting proximity of two blocks, triggering a merge animation, replacing two objects with one, updating the fraction model, and notifying the lesson engine. "Splitting" a block requires: a UI gesture (tap? long-press? button?), an animation showing one block becoming two, creating new objects. These micro-interactions are where the "feel" of the app lives, and they take disproportionate time to get right. **This is the most likely place for schedule overrun.**

- **No backend simplifies things enormously.** The PRD correctly calls out that everything runs client-side. This eliminates auth, API design, database, server deployment, and CORS issues. Good scoping decision.

### Observations

- The PRD's rough architecture (React + TypeScript + state machine + SVG/Canvas) is a reasonable default. React's component model maps naturally to chat panel + workspace, and TypeScript catches errors early in a fast sprint.

- Firebase Hosting is the fastest GCP deployment path for a static SPA — `firebase init` + `firebase deploy` can be done in under 30 minutes including GitHub Actions integration. Cloud Run is overkill for static assets and adds Docker complexity. The PRD should just pick Firebase Hosting and move on.

- The original requirements doc says "no restrictions on programming languages, frameworks, or tools" but the PRD constrains to TypeScript/JavaScript. This is fine — TypeScript is the right choice for a web-focused sprint — but noting that the PRD is more restrictive than the source requirements.

- Audio/TTS (Open Question #4) should be killed for the sprint. Browser TTS APIs (`speechSynthesis`) are inconsistent across iPad Safari versions and add zero value to a demo video (which can have voiceover added in post).

- The PRD doesn't mention viewport/orientation handling. The split-screen layout (chat left, workspace right) assumes landscape. On iPad portrait, this layout will be cramped. **Question:** Is the app landscape-only? If so, a simple `<meta>` viewport lock or a "please rotate" overlay is needed.

## Confidence Assessment

**Medium-High.** The PRD identifies most of the real technical risks and correctly scopes away backend complexity, auth, and LLM integration. The architecture is sound. The main feasibility concern is time allocation: the sprint plan is optimistic about how quickly the interactive manipulative can be built and tested, especially on iPad Safari. The open questions (Canvas vs DOM, denominator range, block physics) all need to be resolved on Day 0, not discovered mid-sprint. If those decisions are made upfront and the manipulative is scoped to basic drag-and-snap with halves/quarters only, this is buildable in a week. If scope creep hits the manipulative (thirds, animated splitting, snap physics), it won't be.

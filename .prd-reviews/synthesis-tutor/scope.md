# Scope Analysis

## Summary

The PRD does a reasonable job defining what is in scope for a 1-week sprint, and its Non-Goals section is better than average for a prototype. However, several items in the PRD quietly exceed the original requirements, the MVP is not crisply separated from polish work, and the phasing within the sprint lacks clear cut-lines if time runs short. The biggest scope risk is the manipulative workspace: drag-and-drop with snap/split/combine on iPad Safari is the kind of "looks simple, isn't" work that can consume the entire week on its own. Without an explicit fallback (e.g., tap-to-select instead of drag-and-drop), the project has no parachute.

The original requirements are deliberately loose ("no restrictions on languages, frameworks, or tools") yet the PRD self-imposes constraints (TypeScript + React, GCP CI/CD, TDD) that consume time. These are good engineering choices for a real product but they compete with the stated goal: a functional demo in one week.

## Findings

### Critical Gaps / Questions

- **No explicit MVP cut-line.** The PRD lists goals but doesn't distinguish "must ship" from "nice to have within the sprint." If Day 4 arrives and the manipulative works but assessment is missing, does the demo succeed or fail? A concrete "ship gate" list is needed: (1) tutor chat walks through lesson, (2) student can visually interact with fraction blocks, (3) at least one equivalence exercise works end-to-end. Everything else is polish.

- **CI/CD pipeline is gold-plating for a 1-week demo.** The original requirements say nothing about CI/CD. They ask for a web app runnable in a browser and a demo video. A GitHub Actions pipeline with lint/test/build/deploy is a real time cost (easily half a day with GCP auth, Docker, etc.). Deploying manually or via a single script is sufficient. The PRD should explicitly mark CI/CD as out-of-scope or "stretch."

- **GCP deployment vs. "runnable in a browser."** The original requirements say "a web-based app, runnable in a standard browser." They never mention GCP. The PRD promotes GCP deployment to a hard constraint. For a demo, `localhost` or a free static hosting service (Vercel, Netlify, GitHub Pages) would suffice. If GCP is truly required by the organization, that should be stated as a given constraint with a specific service chosen (the PRD lists it as an open question, which means it will cost decision time on Day 5).

- **Demo video is a deliverable, not development work, but needs scheduled time.** The original requirements explicitly list a 1-2 minute demo video as a deliverable. The PRD's sprint breakdown mentions "record demo video" on Day 5 alongside integration, polish, and deploy. Recording and editing a compelling demo video is 2-4 hours of work. It should be a first-class line item, not an afterthought tacked onto deploy day.

- **TDD as a constraint vs. reality of a 1-week prototype.** The original requirements say nothing about TDD. The PRD lists it as a constraint and allocates testing throughout the sprint. TDD is excellent practice, but for a throwaway 1-week prototype where the deliverable is a demo video, comprehensive test coverage competes directly with feature time. The PRD should distinguish "tests that protect us" (fraction equivalence logic) from "tests that slow us down" (E2E Playwright tests for a prototype). Suggest: unit tests for the fraction model only; skip E2E.

### Important Considerations

- **The manipulative interaction is the riskiest scope item.** Drag-and-drop on iPad Safari with combining, splitting, snapping, and animation is a deep well. The PRD correctly flags this in open questions but doesn't propose a fallback. Recommendation: define a "lo-fi manipulative" fallback (tap-to-select, button-based combine/split) that can deliver the lesson concept without polished drag-and-drop. If drag-and-drop works, great; if not, the demo still functions.

- **Denominator range is a scope lever that isn't pulled.** Open Question #1 asks about denominator range. This should be a scoping decision, not an open question. For MVP: halves and quarters only. Thirds, sixths, eighths are Phase 2. The fraction model can be designed to support arbitrary denominators, but the visual workspace and lesson script should only target 1/2 and 1/4 for the sprint.

- **Audio/TTS is Phase 2 in disguise.** Open Question #4 asks about voice. This is clearly a Phase 2 feature. The PRD should move it to Non-Goals for this sprint. Text-based tutor is the MVP.

- **"Fraction block physics" (Open Question #5) is a rabbit hole.** Snapping, animation quality, and splitting physics are infinite-depth polish work. The PRD should define "good enough": blocks snap to alignment zones, no physics simulation, minimal animation (CSS transitions only). Anything beyond that is stretch.

- **Visual design (Open Question #7) is unresolved.** With no style reference, a developer can spend significant time on CSS polish. Recommendation: use a component library (e.g., Radix, shadcn) for the chat panel, keep the workspace visually simple with solid-color blocks. Declare "visual design is functional, not branded" as an explicit scope statement.

### Observations

- **The PRD adds React + XState as presumptive tech choices.** The original requirements are framework-agnostic. React is a reasonable choice but it's not a requirement. For a solo developer on a 1-week sprint, a lighter framework (or vanilla JS with a canvas) might ship faster. This isn't a scope problem per se, but locking in React in the PRD without evaluation could slow the project.

- **No mention of landscape vs. portrait iPad layout.** The PRD describes a "split-screen layout (chat left, workspace right on iPad landscape)" but doesn't address portrait orientation. For a demo, locking to landscape and noting "portrait not supported" is fine, but it should be stated.

- **"3-5 assessment problems" in the check-for-understanding is specific enough to be a commitment.** If time runs short, 1-2 problems that work well are better than 5 that are buggy. The PRD should say "at least 2 assessment problems" for MVP.

- **Stakeholder post-demo requests are predictable.** The day after the demo, stakeholders will ask for: (a) more topics beyond fractions, (b) LLM-powered free-text conversation, (c) student progress tracking, (d) a polished visual design, (e) audio/voice. The PRD's Non-Goals section covers (b), (c), and (e) implicitly. It should also explicitly state that multi-topic expansion and visual design polish are out of scope to set expectations.

- **Natural phase seams exist at clear boundaries:** Phase 1 = scripted single lesson with basic manipulative (this sprint). Phase 2 = additional fraction lessons + polished manipulative + audio. Phase 3 = LLM-based tutor + curriculum system + persistence. The PRD doesn't articulate these phases, which means scope creep will happen organically during the sprint ("while we're in there, let's also support thirds").

## Confidence Assessment

**Medium.** The PRD has a solid Non-Goals section and correctly identifies this as a prototype sprint, which is better than many PRDs. However, the lack of an explicit MVP cut-line, the self-imposed constraints (CI/CD, TDD, GCP) that exceed the original requirements, and seven unresolved open questions create real risk that scope will expand during execution. The sprint breakdown is reasonable but has no slack — Day 5 carries integration + polish + deploy + demo video, which is a red flag for a 1-week timeline. If any single item (especially the manipulative) takes longer than planned, something will be cut ad hoc rather than by design.

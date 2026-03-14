# Ambiguity Analysis

## Summary

The PRD draft is reasonably clear on the high-level vision but contains significant ambiguity in the interaction design, lesson content, and acceptance criteria. Many of these stem from vague qualitative language ("warm, encouraging tone," "feels like exploration") and underspecified mechanics (what exactly does "split" mean? what does "combine" mean visually?). The open questions section acknowledges several of these gaps but does not resolve them, leaving key implementation decisions unspecified. Two engineers reading this PRD would likely build noticeably different products, particularly around the manipulative interactions, the lesson script content, and what "done" looks like for assessment.

The original requirements doc is actually more permissive than the PRD in some areas (e.g., "no restrictions on programming languages") while the PRD narrows to TypeScript/React without noting the divergence. There are also subtle contradictions between the two documents.

## Findings

### Critical Gaps / Questions

- **"Scripted dialogue with branching" is unspecified at the content level.** The PRD says dialogue is scripted but provides zero actual script content. How many tutor messages are there? What are the exact branching conditions? Without a lesson script (even a rough outline), two developers would write completely different lessons. *Suggested clarification: Include a sample dialogue tree or at minimum a numbered list of lesson steps with branching conditions.*

- **"Interactive fraction manipulative" interaction model is undefined.** The PRD mentions students can "drag, combine, split, and compare" fraction blocks, but never defines what these verbs mean mechanically. Does "combine" mean dragging two blocks on top of each other? Side by side? Into a target zone? Does "split" mean tapping a block and choosing a divisor? Long-pressing? What does "compare" look like — placing blocks on a number line, stacking them vertically, or something else? *Suggested clarification: Define each interaction verb with a concrete gesture and expected visual outcome.*

- **"Warm, encouraging tone" is subjective and unmeasurable.** This appears in both the requirements and the PRD. Two writers would produce very different tutor personalities. Is the tutor playful and uses slang ("Awesome sauce!")? Professional but kind ("Great work!")? Character-driven (does the tutor have a name, avatar, personality)? *Suggested clarification: Provide 3-5 example tutor messages covering greeting, encouragement, correction, and celebration to establish voice.*

- **Assessment pass/fail criteria are undefined.** The PRD says "3-5 assessment problems" and the student "must solve them correctly (with retry) to complete the lesson." Open Question #6 asks what "passing" means but provides no answer. Is it 3 out of 5? All correct eventually? Is there a retry limit? What happens if the student never passes — does the lesson loop forever? *Suggested clarification: Define the number of problems, passing threshold, retry policy, and failure state.*

- **Denominator range is unresolved and load-bearing.** Open Question #1 asks whether to support halves/quarters only or also thirds/sixths/eighths. This is not cosmetic — it determines the complexity of the visual system, the number of block types to render, the lesson script content, and the assessment problems. Supporting eighths means 8 thin blocks that must be distinguishable on an iPad screen. *Suggested clarification: Pick a denominator set. Recommend halves, quarters, and eighths as the minimum for meaningful equivalence exploration while keeping visual complexity manageable.*

- **Contradiction between requirements doc and PRD on language restrictions.** The original requirements state: "There are no restrictions on programming languages, frameworks, or tools." The PRD constrains to "TypeScript/JavaScript" and further narrows to "TypeScript + React" in the Rough Approach. This is a contradiction. If the requirements are the source of truth, the tech stack constraint should be removed or explicitly justified. *Suggested clarification: Confirm whether the PRD's tech stack is a decision or a suggestion.*

### Important Considerations

- **"Exploration phase" boundaries are vague.** The PRD describes a phase where the tutor "encourages free exploration" of fraction blocks. But how does the lesson know when exploration is over? Is it time-based (30 seconds)? Action-based (student has performed 3 interactions)? Button-based (student clicks "I'm ready")? The transition from exploration to guided discovery is undefined. *Suggested clarification: Define the trigger that advances the lesson from free exploration to guided discovery.*

- **"Should" vs "must" inconsistency.** The requirements doc uses "must" consistently for core features (chat interface, manipulative, lesson flow). The PRD mixes "should" and "must" without clear intent. For example, Goal #2 says the tutor interface should have a "warm, encouraging tone" — is this a hard requirement or aspirational? The Non-Goals section says "No accessibility compliance beyond basic usability" — what counts as "basic usability"? *Suggested clarification: Adopt a consistent RFC 2119 usage of must/should/may throughout.*

- **"Smashing" fraction blocks is mentioned only in the requirements, not the PRD.** The requirements say students should be able to perform "combining, splitting, or 'smashing' fraction blocks." The PRD drops "smashing" without explanation. Is this an intentional de-scope or an oversight? What does "smashing" even mean — is it different from combining? *Suggested clarification: Define or explicitly de-scope "smashing."*

- **Student response mechanism is ambiguous.** The PRD says the Chat Panel uses "buttons, not free-text input" for student responses. But during the manipulative interaction, how does the student "answer" a question? Do they perform an action in the workspace and the system auto-detects correctness? Or do they perform the action and then click a "Submit" button? Or does the tutor ask a multiple-choice question and the student clicks a text button? These are three very different UX patterns. *Suggested clarification: For each lesson step type, specify whether the student responds via chat buttons, workspace actions, or both.*

- **Split-screen layout assumes landscape orientation.** The PRD specifies "chat left, workspace right on iPad landscape." What happens in portrait mode? Is landscape enforced? Is portrait unsupported? The requirements doc says "must run on an iPad in a web browser" but says nothing about orientation. *Suggested clarification: Specify supported orientations and layout behavior in portrait mode.*

- **"No backend required for MVP" contradicts CI/CD requirement.** The PRD says the app is frontend-only but also requires a CI/CD pipeline deploying to GCP. This isn't a contradiction per se, but "CI/CD pipeline" could mean anything from a GitHub Action that runs tests to a full deployment infrastructure. The GCP deployment target is also unresolved (Open Question #8). *Suggested clarification: Define the minimum viable deployment — is a static file host (e.g., Firebase Hosting) sufficient?*

### Observations

- **"Fraction box" from requirements is not carried into the PRD.** The requirements mention a "fraction box or similar visual tool." The PRD uses "fraction workspace" and "fraction blocks" but never references the "box" concept. This may be fine, but if the requirements author had a specific mental model (e.g., a container that blocks are placed into), it's been lost.

- **Demo video is a deliverable but has no spec.** Both documents require a 1-2 minute demo video. The PRD does not specify what the video must show — is it a screen recording? A narrated walkthrough? Does it need to show the full lesson or just highlights? This is unlikely to cause implementation disagreement but could cause deliverable rejection.

- **TDD is stated as a constraint but the testing strategy is vague on coverage expectations.** "Tests should drive the implementation" is a methodology, not a specification. There is no minimum coverage target, no requirement for specific test types to pass before merge, and no clarity on whether E2E tests on an actual iPad are expected.

- **"Feels like exploration rather than homework"** appears in both documents as a guiding principle but has no measurable proxy. This is aspirational language that cannot be verified without user testing, which is out of scope for a 1-week sprint. It should be acknowledged as a subjective goal rather than a testable requirement.

- **Age range "7-11" spans a wide developmental gap.** A 7-year-old (2nd grade) and an 11-year-old (5th/6th grade) have very different reading levels, attention spans, and fraction knowledge. The tutor's language complexity, the manipulative's visual design, and the assessment difficulty would all vary significantly. The PRD does not pick a narrower target within this range.

## Confidence Assessment

**Medium-Low.** The PRD captures the vision well but leaves too many implementation-critical decisions open. The eight open questions are all load-bearing, and most of them need answers before a developer can start building (especially #1 denominator range, #2 touch model, #3 script depth, and #6 assessment criteria). The interaction design — which is the core differentiator of this product — is described in broad strokes rather than specific mechanics. A developer starting from this PRD would need to make dozens of judgment calls that could easily diverge from the stakeholder's intent.

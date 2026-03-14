# Requirements Completeness

## Summary

The PRD draft does a good job translating the original one-week challenge brief into a buildable plan, but it inherits the original document's most significant weakness: almost no success criteria, acceptance conditions, or measurable outcomes are defined. The document describes *what* to build at a feature level but rarely specifies *how we know it works* or *what counts as done* for any given feature. A QA engineer or test author would need to invent most acceptance thresholds themselves.

The open questions section is commendably honest about unresolved decisions, but several of those questions (denominator range, assessment pass criteria, touch interaction model) directly block the ability to write tests or verify completeness. Until they are answered, "done" is subjective.

## Findings

### Critical Gaps / Questions

- **No acceptance criteria for the manipulative interaction.** The PRD says students should "drag, combine, split, and compare fraction blocks," but never defines what a successful drag, combine, or split looks like. Can a block be dropped anywhere? Does combining require alignment within N pixels? What visual feedback confirms a successful combine vs. a failed one? *Without this, manipulative tests cannot be written.*

- **"Check for understanding" is undefined.** The PRD says the lesson concludes with "3-5 assessment problems" but Open Question #6 asks what "passing" means. This is the single most important success criterion for the lesson — the core deliverable is a lesson that teaches something — and it is explicitly unresolved. *What score constitutes completion? Are retries unlimited? Does the tutor ever give the answer? What happens if the student fails repeatedly?*

- **No definition of "fraction equivalence" scope.** Open Question #1 asks about denominator range but this is a blocking question, not an open one. The lesson content, the manipulative UI complexity, the number of test cases, and the number of assessment problems all depend on this answer. The PRD should either decide (e.g., "halves, quarters, and eighths only") or explicitly state a default with rationale.

- **No error states or failure modes defined.** What happens if a student drags a block off-screen? What if they try to combine blocks that do not form a valid equivalence? What if they tap the workspace during a tutor message? What if they try to split a block that cannot be split further? The PRD covers only the happy path. Every interactive manipulative needs at minimum: invalid action feedback, undo/reset, and edge-case handling for touch gestures.

- **No "reset" or "start over" requirement.** If a student gets confused or wants to try the lesson again, can they? The PRD says no persistence, but it also does not mention a restart mechanism. For a demo, this matters — the evaluator may want to see the lesson from the beginning without reloading the page.

- **Missing performance / responsiveness requirements.** The PRD targets iPad Safari but specifies no performance targets. Touch interactions on canvas/SVG can lag significantly on older iPads. There is no mention of target frame rate, touch response latency, or maximum load time. For a touch-first educational app, perceptible lag directly undermines the experience. Even rough targets ("manipulative responds to touch within 100ms," "page loads in under 3 seconds on iPad") would make this testable.

### Important Considerations

- **iPad model / Safari version not specified.** "Must run on iPad browser (Safari)" is not a testable constraint without knowing which iPad generation and iOS/Safari version. An iPad Air 2 (2014) vs. an iPad Pro M2 have vastly different rendering capabilities. The original requirements mention "an iPad will be provided for testing" — the PRD should note that the target device is TBD and flag this as a dependency.

- **Demo video is a deliverable but has no acceptance criteria.** The requirements list a "1-2 minute demo video" as a deliverable, and the PRD lists it as a goal. But there is no definition of what the video must show. Should it cover the full lesson flow? Just highlights? Does it need voiceover? Screen recording only? This is a deliverable that someone will evaluate, so its contents should be specified.

- **Tutor dialogue content is unspecified.** The PRD describes tone ("warm, encouraging") and structure (scripted with branching) but includes no actual dialogue script or even a sample exchange. The lesson engine state machine cannot be built without knowing the states and transitions, which are determined by the dialogue. Is the script itself a deliverable? Who writes it? When?

- **No mention of what "combining" and "splitting" mean mathematically.** The manipulative allows combining and splitting blocks, but the PRD does not define the rules. Can you combine 1/3 + 1/4? Or only like-denominator blocks? Can you split any block into any number of pieces, or only into specific subdivisions? These rules define the mathematical model and are prerequisite to writing fraction model unit tests.

- **CI/CD pipeline is listed as a constraint but has no acceptance criteria.** "Need CI/CD pipeline" and "GitHub Actions: lint, test, build, deploy" — but what constitutes a passing pipeline? Is deployment automated on every push to main? Is there a staging environment? What if the deploy fails?

- **No offline or network-failure handling.** The app is client-side only, but it is deployed to GCP. What happens if the student loses connectivity mid-lesson on an iPad? Does the app work offline once loaded? This is not mentioned.

### Observations

- The PRD's explicit non-goals are well-defined and helpful for scope control. Listing "no LLM," "no accounts," "no analytics" removes ambiguity.

- The testing strategy section names test categories (unit, integration, E2E) but does not define what "passing" looks like for any of them. For TDD to work, the test expectations need to be derivable from the requirements, and right now several key expectations are undefined.

- The sprint breakdown allocates time but does not identify any milestones or checkpoints. For a 1-week sprint, even a mid-week "manipulative renders and responds to touch" checkpoint would help define incremental "done."

- The original requirements document says "no restrictions on programming languages, frameworks, or tools," but the PRD constrains to TypeScript + React. This is a reasonable decision but should be explicitly called out as a design choice rather than a requirement, since it narrows the original brief.

## Confidence Assessment

**Low-Medium.** The PRD describes the feature surface well enough that a developer could start building, but a QA engineer could not write a meaningful test suite from it. The most important gaps are: (1) no measurable acceptance criteria for any feature, (2) unresolved open questions that block test authoring (denominator range, pass criteria, interaction model), and (3) no error/edge-case handling defined. The happy path is clear; everything else is left to the implementer's judgment.

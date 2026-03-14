# Missing Requirements

## Summary

The PRD draft covers the happy path well -- a student opens the app, explores fractions, answers questions, and completes the lesson. However, it is largely silent on what happens when things go wrong, when the student does something unexpected, or when the environment differs from the assumed iPad-in-landscape scenario. Several categories of requirements are entirely absent: error recovery, state handling on interruption, input edge cases, touch conflict resolution, and orientation/responsiveness. These gaps matter because the demo will be evaluated on an iPad where unexpected interactions are the norm (kids tap things they shouldn't, rotate the device, accidentally swipe away), and an unhandled edge case during a live demo is the most visible failure mode.

Additionally, the PRD never specifies what the student actually sees on first load (the zero state) or what happens if they complete the lesson and want to restart. These are the first and last things an evaluator will experience.

## Findings

### Critical Gaps / Questions

- **Empty/zero state on launch.** The PRD describes the tutor greeting the student but never specifies what the workspace looks like before any interaction. Are fraction blocks pre-populated or does the student pull them from a tray/palette? What if the workspace is empty -- is there an affordance to add blocks? A blank canvas with no guidance will confuse a 7-year-old. *Question: What is the initial state of the workspace at lesson start, and how does the student discover what they can interact with?*

- **Browser crash / tab close mid-lesson.** The PRD explicitly says "no persistence" but never addresses what happens if the browser crashes, the tab is accidentally closed, or Safari kills the tab due to memory pressure (common on iPads). Does the student restart from the beginning? Is there even a lightweight session-storage checkpoint? For a 1-week sprint this is likely acceptable, but it should be stated explicitly so the evaluator doesn't ask about it. *Question: Should we use sessionStorage to preserve lesson position across accidental tab closes, or is full restart acceptable?*

- **Touch gesture conflicts.** iPad Safari has system-level gestures: pinch-to-zoom, swipe-from-edge to go back, pull-down for notifications. The PRD mentions "touch-first" but never addresses how to prevent pinch-to-zoom from interfering with fraction block manipulation (e.g., pinching two blocks to combine them), or swipe-from-left-edge conflicting with drag interactions near the screen edge. These must be explicitly handled with viewport meta tags and touch-action CSS at minimum. *Question: Does the manipulative use any multi-touch gestures (pinch, two-finger rotate) that would conflict with Safari's built-in gestures?*

- **Unexpected student input / actions.** The PRD assumes students follow the guided path. What happens if a student: (a) drags a block off-screen, (b) tries to split a block that can't be split further (e.g., 1/16), (c) stacks 20 blocks on top of each other, (d) taps the chat area during a workspace interaction prompt, or (e) does nothing for 30+ seconds? None of these are addressed. *Question: What are the boundaries of the manipulative (min/max denominator, max blocks on screen), and what does the tutor say when a student is stuck or idle?*

- **Screen orientation handling.** The PRD assumes iPad landscape (chat left, workspace right). What happens when the student rotates to portrait? The split-screen layout will break or become unusable. The PRD should specify whether orientation is locked (via manifest/meta), whether a portrait layout exists (chat top, workspace bottom), or whether a "please rotate your device" message is shown. *Question: Do we lock to landscape, or do we support portrait with a stacked layout?*

- **Lesson completion and restart.** The PRD describes the lesson concluding with the tutor celebrating, but never says what happens next. Is there a "play again" button? Does the screen just sit there? Can the evaluator restart the demo without refreshing the browser? *Question: What is the end state of the app after lesson completion?*

### Important Considerations

- **Assessment retry behavior.** The PRD says students can retry assessment problems, but never specifies how many retries are allowed, whether the question changes on retry, or what happens if a student retries indefinitely. An infinite retry loop with no variation is a poor experience. *Suggestion: Specify max retries per question and whether hints escalate.*

- **Fraction denominator range.** This is listed as an open question in the PRD, but it is actually a blocking decision for implementation. The manipulative's visual design, snapping logic, and equivalence-checking all depend on knowing whether we support halves/quarters only or extend to thirds/sixths/eighths. This should be resolved before Day 1 work begins. *Suggestion: Lock to halves, quarters, and eighths for the sprint -- simple powers of 2 keep the visual alignment clean.*

- **Chat panel scrolling on iPad.** The PRD describes a "scrolling message list" but never specifies behavior when the conversation grows long. On iPad Safari, nested scrolling containers (a scrollable chat inside a scrollable page) are notoriously buggy. Does the chat auto-scroll to the latest message? Is the chat panel fixed-height or does it grow? *Suggestion: Specify that the chat panel is a fixed-height container with overflow-y scroll, and auto-scrolls to the bottom on new messages.*

- **Student response mechanism.** The PRD says students respond via "buttons, not free-text input" in the chat panel, but some interactions happen in the workspace (dragging blocks). How does the system know the student has "answered" a workspace-based question? Is there a "Submit" / "Check" button, or does the system auto-detect when blocks are in the right position? *Question: What is the submission mechanism for workspace-based answers?*

- **Loading state.** No mention of what the student sees while the app loads. On a slow school WiFi connection, a blank white screen for 3-5 seconds will look broken. *Suggestion: Specify a simple loading indicator or splash screen.*

- **Browser compatibility beyond Safari.** The requirements say "iPad in a web browser" and the PRD says "Safari." But the requirements doc does not restrict to Safari -- an iPad could run Chrome, Firefox, or Edge. The PRD should clarify whether Safari-only is acceptable or if Chrome on iPad is also a target. *Question: Is Safari the only target browser, or should Chrome on iPad also work?*

- **Audio / sound effects.** The PRD lists audio as an open question but does not address the simpler case of sound effects (click sounds on block placement, a celebration sound on completion). These are high-impact for engagement and low-cost. *Suggestion: Decide yes/no on sound effects separately from TTS.*

### Observations

- **No accessibility requirements.** The PRD explicitly calls this a non-goal, which is fine for a 1-week sprint, but a next engineer will want to know: are the fraction blocks keyboard-accessible? Is there alt-text on visual elements? Is the color scheme colorblind-safe? These should be noted as future considerations even if out of scope.

- **No offline behavior specified.** Since this is a static SPA, it could work offline after initial load if a service worker is added. The PRD is silent on this. For a demo, this probably doesn't matter, but if the demo venue has spotty WiFi, it matters a lot. *Suggestion: Note whether offline support is desired.*

- **Concurrent access is not relevant.** Since there is no backend, no persistence, and no shared state, concurrent access is a non-issue. This is one area the PRD is correct to omit.

- **No error messaging strategy.** If something goes wrong at the application level (JavaScript error, canvas fails to render), there is no specified fallback. A white screen or frozen UI during a demo is the worst outcome. *Suggestion: Add a global error boundary with a "Something went wrong, tap to restart" message.*

- **Demo video is a deliverable but not specified.** The requirements list a 1-2 minute demo video as a deliverable. The PRD mentions it in goals but provides no guidance on what the video should show, in what order, or what the "money shot" moment is. This affects how the UI is built (e.g., do we need to make the lesson skippable for demo recording purposes?). *Question: Should the app have a way to fast-forward through the lesson for demo recording?*

## Confidence Assessment

**Low-Medium.** The PRD covers the functional happy path at a reasonable level for a 1-week sprint, but the gaps around edge cases, error handling, and iPad-specific interaction concerns are significant. The most likely demo failures will come from unhandled touch conflicts, orientation changes, or the "what happens at the end" problem -- none of which are addressed. A next engineer picking this up would need to make several unguided decisions about manipulative boundaries, retry logic, and layout behavior.

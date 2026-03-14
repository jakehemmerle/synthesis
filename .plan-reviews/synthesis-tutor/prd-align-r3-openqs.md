# PRD Alignment Round 3: Open Questions

Checks every open question from the PRD (original Open Questions 1-8, plus Clarifications Q1-Q12 and additional decisions) against the design doc.

---

## Original Open Questions (1-8)

### 1. Fraction representation — denominator range?
**RESOLVED** — PRD clarification (Q1) specifies denominators 2-5. Plan reflects this throughout: `type Denominator = 2 | 3 | 4 | 5`, visual design table lists all four block types, concrete equivalence problems constrained to this range, and the "Critical insight" note acknowledges cross-group limitations.

### 2. Touch interaction model — Canvas vs DOM?
**RESOLVED** — PRD clarification (Q2) confirms SVG. Plan specifies SVG + Pointer Events consistently: architecture diagram, tech stack table, interaction design table, iPad Safari checklist (touch-action, setPointerCapture, getScreenCTM). No Canvas or DOM drag-and-drop anywhere.

### 3. Lesson script depth — branching complexity?
**RESOLVED** — Plan specifies simple 2-path branching (correct/incorrect) with escalating hints capped at 2 hints + walkthrough. This matches PRD non-goal "No complex adaptive difficulty" and constraint "Simple branching (correct/incorrect paths) is sufficient." Round 2 confirmed hint escalation is simple branching, not adaptive AI.

### 4. Audio/voice — TTS or text-only?
**RESOLVED** — PRD additional decisions section states "Audio/TTS: Not mentioned — remains non-goal for sprint." Plan has no audio/TTS anywhere. Text-only tutor confirmed.

### 5. Fraction block physics — snap, animation?
**RESOLVED** — PRD clarification (Q5) defines three gestures: combine (drag + merge animation), split (tap + split menu + block divides), compare (side-by-side alignment zones). Plan's interaction design table reflects all three. Snap behavior is in pointerup handling ("snap or return"). Animated block merging/splitting is listed as STRETCH item 7, which is appropriate — basic snap is REQUIRED, smooth animation is polish.

### 6. Assessment criteria — passing, retries?
**RESOLVED** — PRD clarification (Q8) defaults to "3 problems, unlimited retries with escalating hints, no fail state." Plan section "Assessment: No Fail State" matches exactly: "3 problems, unlimited retries, escalating hints (general → specific → direct guidance). After 3+ wrong attempts, tutor walks through the answer."

### 7. Visual design — brand guidelines?
**RESOLVED** — PRD has no brand guidelines or style reference (question was never answered in clarifications). Plan takes freeform approach with specific color palette (sky blue, mint green, lavender, golden yellow), dimensions (280px whole, 64px height, 8px border-radius), and shadcn/ui for UI components. This is a reasonable default given no constraints were provided.

### 8. GCP deployment specifics?
**RESOLVED** — PRD clarification (Q4) specifies Firebase Hosting with two environments (prod + staging). Plan matches: "Firebase Hosting, one project, two sites (staging + prod). Manual deploy via `npm run deploy:staging` / `npm run deploy:prod`." Tech stack table and CI/CD row also consistent.

---

## Clarifications Section (Q1-Q12 + Additional Decisions)

### Q1: Denominator range?
**RESOLVED** — Same as Open Question 1 above.

### Q2: SVG + pointer events?
**RESOLVED** — Same as Open Question 2 above.

### Q3: Skip CI/CD?
**RESOLVED** — Plan states "CI/CD: None (manual)" in tech stack table and "`npm run build && firebase deploy`" workflow. Matches PRD clarification.

### Q4: GCP / Firebase details?
**RESOLVED** — Same as Open Question 8 above.

### Q5: Concrete gesture definitions?
**RESOLVED** — Same as Open Question 5 above.

### Q6: "Check" button for workspace answers?
**RESOLVED** — Plan includes CheckButton.tsx in file structure, "Check my answer" button in interaction design table with phase visibility rules and enabled/disabled states (added in Round 2). Matches PRD clarification.

### Q7: Button transition from exploration to guided discovery?
**RESOLVED** — Plan includes `FINISH_EXPLORATION` event in LessonEvent type, "Let's go!" button described in interaction design table, and referenced in demo video plan. Matches PRD clarification.

### Q8: Assessment criteria?
**RESOLVED** — Same as Open Question 6 above.

### Q9: Evaluator priorities?
**RESOLVED** — Plan includes "Tradeoff Principles" section with exact priority order: (1) pedagogical rigor, (2) visual polish, (3) code quality. Added in Round 1.

### Q10: Patrick Skinner's role?
**DEFERRED-OK** — PRD states he is the evaluator. This is context, not an actionable design decision. The plan addresses evaluator priorities (Q9) and demo video plan. No specific plan task needed for this.

### Q11: Orientation — portrait and landscape?
**RESOLVED** — Plan's "Responsive Layout" section specifies both: "Landscape = side-by-side (chat 35%, workspace 65%). Portrait = stacked (chat 40%, workspace 60%)." REQUIRED item 9 lists "Both portrait and landscape orientation."

### Q12: iPad model?
**UNRESOLVED** — PRD says "Not specified yet. TBD." The plan does not mention which iPad model to target or test on, and there is no task to resolve this before testing on Day 4. This affects viewport dimensions, touch target sizing, and Safari version compatibility. **Suggested resolution:** Add a task on Day 3 or 4 to confirm the target iPad model with the evaluator before iPad testing begins. In the absence of a specific model, design for iPad Air / 10th-gen iPad (most common) and test on whatever device is available.

### Additional: REQUIRED vs STRETCH classification
**RESOLVED** — Plan has explicit "REQUIRED vs STRETCH Classification" section with 12 REQUIRED items and 11 STRETCH items. Round 1 moved tap-to-split from STRETCH to REQUIRED.

### Additional: shadcn/ui
**RESOLVED** — Plan specifies shadcn/ui in tech stack table, architecture diagram, and file structure (components/ui/ directory).

### Additional: Audio/TTS remains non-goal
**RESOLVED** — Same as Open Question 4 above.

---

## Summary

| Status | Count |
|--------|-------|
| RESOLVED | 18 |
| DEFERRED-OK | 1 (Q10: evaluator identity — contextual, no action needed) |
| UNRESOLVED | 1 (Q12: target iPad model) |

### Must-Fix

**Q12 — Target iPad model is TBD with no plan task to resolve it.** The plan should note this as a pre-testing decision point. Recommend adding a line to the Sprint Plan (Day 3 or Day 4) to confirm the target iPad model, or defaulting to iPad Air / 10th-gen iPad dimensions if no answer is forthcoming.

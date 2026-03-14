# PRD Alignment Round 2: Constraints

## Summary

Reviewed every constraint from PRD sections "Constraints" and "Clarifications from Human Review" against the design document. 16 constraints checked; 13 respected, 1 violated, 2 unaddressed.

---

## RESPECTED

1. **Timeline: 1 week** → Plan includes a 5-day sprint breakdown (Day 1-5 table at bottom of design doc) scoped to fit the constraint. REQUIRED vs STRETCH classification ensures scope control.

2. **Platform: iPad browser (Safari), touch-first** → Plan has a dedicated "iPad Safari Essentials (Day 1 Checklist)" with 7 specific mitigations (viewport meta, touch-action, dvh, setPointerCapture, etc.). Touch interactions are central to the design.

3. **Tech stack: TypeScript/JavaScript** → Plan specifies React + TypeScript throughout. Matches PRD constraint.

4. **No backend required for MVP** → Plan is explicitly "frontend-only SPA" with no server-side logic. Stated in executive summary and architecture overview.

5. **TDD methodology** → Plan has a "TDD Approach" section specifying test-first for model and engine layers. Round 1 strengthened this to "strict TDD, not concurrent testing."

6. **Solo developer (AI-assisted)** → Plan is scoped for one person. No team coordination, no role assignments. Sprint breakdown is single-track.

7. **Denominators 2 through 5** (Clarification Q1) → `type Denominator = 2 | 3 | 4 | 5` in Core Types. Visual design table covers all four denominations. Concrete equivalence problems reflect the limited cross-group relationships.

8. **SVG + pointer events for manipulative** (Clarification Q2) → Explicitly chosen in tech stack table and Key Design Decision #3. Pointer events unify mouse/touch.

9. **Manual deploy, no CI/CD** (Clarification Q3) → CI/CD row in tech stack table says "None (manual)". Deployment section specifies `npm run deploy:staging` / `npm run deploy:prod`.

10. **Firebase Hosting with prod + staging** (Clarification Q4) → Deployment section: "one project, two sites (staging + prod)." Manual deploy scripts for each.

11. **shadcn/ui for frontend components** (Clarification, Additional decisions) → Tech stack table lists "shadcn/ui + Tailwind" with specific components named (Button, Card, ScrollArea). File structure includes `components/ui/` directory.

12. **Both portrait and landscape orientation** (Clarification Q11) → Key Design Decision #4 describes responsive layout with a 768px breakpoint. Landscape = side-by-side, portrait = stacked. Listed as REQUIRED item #9.

13. **"Let's go!" button for phase transition** (Clarification Q7) → LessonEvent type includes `FINISH_EXPLORATION` with comment "Let's go! button." Interaction design table lists it.

---

## VIOLATED

14. **"Check" button for workspace answers** (Clarification Q6) — Plan partially violates this. The `CheckButton.tsx` component exists in the file structure and the interaction table lists it, but the "Check" button behavior is underspecified. The plan says "evaluate blocks in comparison zone" but does not define what happens when the comparison zone is empty, when blocks are placed but incomplete, or how the check button interacts with assessment vs. guided discovery phases. The PRD confirms a check button; the plan needs to specify its behavior per phase.

   **Classification: should-fix**
   Suggested fix: Add a paragraph under Interaction Design or Assessment clarifying: (a) check button is disabled/hidden until blocks are in the comparison zone, (b) in guided discovery the check validates the current challenge, (c) in assessment it validates the current problem and advances on correct.

---

## UNADDRESSED

15. **REQUIRED vs STRETCH classification based on requirements.md** (Clarification, Additional decisions) — The plan has a REQUIRED vs STRETCH section, but it was authored based on the PRD and design judgment, not explicitly traced to requirements.md line items. The PRD says to "organize all work items with clear REQUIRED vs STRETCH classification based on requirements.md." The plan's classification is reasonable but there is no explicit traceability showing which requirements.md items map to which REQUIRED/STRETCH items.

   **Classification: should-fix**
   Risk: An evaluator checking alignment could question whether the classification was rigorous or ad hoc. Adding a brief traceability note (e.g., "requirements.md items 1-6 map to REQUIRED items 1-7") would close this.

16. **No user accounts, auth, or persistence** (PRD Non-Goals) — The plan's executive summary says "No backend, no auth, no persistence" which respects the constraint. However, the plan does not explicitly address COPPA compliance beyond a one-line mention ("No analytics, no tracking, no data collection → COPPA-safe" in Security). Given the target audience is ages 7-11 and the PRD calls out elementary-age students, the plan should acknowledge that the absence of data collection is a deliberate COPPA decision, not just an MVP shortcut. If any stretch features (analytics, error reporting) are later added, they could inadvertently violate COPPA.

   **Classification: should-fix**
   Risk: Low for current scope (no data collection = no COPPA issue). But the plan should note this as a constraint to respect if scope expands. A single sentence would suffice.

---

## Verdict

No must-fix items. Three should-fix items, all low-effort additions (a paragraph, a traceability note, a sentence). The plan respects the PRD's constraints well overall, with strong coverage of technical constraints (iPad Safari, SVG, Firebase, orientation) and process constraints (TDD, manual deploy, 1-week timeline).

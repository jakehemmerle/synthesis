# Plan Self-Review Round 3: Testability + Coherence

## Fixes Applied

### Must-Fix (from coherence)
1. **Naming consistency** — renamed all `AlignmentZone` references to `ComparisonZone` throughout the doc.
2. **Model clarification** — updated "Unit Fractions Only" header to "Unit Fractions + Combined Blocks" and explained that numerator can be >1 after combine.
3. **CHECK_ANSWER event** — added `zoneBlocks` field so the reducer has the comparison zone state for evaluation.

### Must-Fix (from testability)
4. **Component smoke tests on Day 3** — added step 9: `lessonContext.test.tsx`, `ChatPanel.test.tsx`, `WorkspacePanel.test.tsx` using React Testing Library.
5. **Integration test on Day 4** — added step 8: `lessonFlow.test.tsx` simulating full lesson dispatch sequence.
6. **Tightened exit gates** — replaced vague "working" and "verified" with concrete assertions: `npm test` passes, specific behaviors verified on iPad, specific problems confirmed working.

### Should-Fix (adopted)
7. **Day 4 sub-tasks already enumerated** — integration wiring broken into explicit steps (wire engine, guided flow, assessment flow, iPad checklist).

### Should-Fix (not applied — acceptable for 1-week sprint)
- iPad manual test results as files — overhead not worth it for a solo sprint.
- CSS regression guards — visual testing adds complexity for no demo value.
- Firebase setup automated verification — manual `firebase deploy` check is sufficient.

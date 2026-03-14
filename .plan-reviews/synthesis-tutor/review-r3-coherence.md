# Plan Coherence Review (Round 3 — Final Pass)

## Internal Contradictions

- ISSUE: The PRD lists "3-5 assessment problems" (User Story 4), while the design doc commits to exactly 3. This is fine as a scoping decision, but the PRD was never updated to reflect the final count.
  Severity: should-fix
  Suggested fix: No change to design doc needed. Note the intentional narrowing in the PRD clarifications section or accept the delta as implicit.

- ISSUE: The PRD split gesture is defined as "Tap block -> split menu (into 2, into N) -> block divides" (Clarification Q5). The design doc correctly simplified this to an immediate split with no menu (since only 1/2->1/4 exists). However, the PRD clarification was never amended. If someone reads the PRD after the design doc, they will expect a menu.
  Severity: should-fix
  Suggested fix: Add a one-line note to the PRD clarifications section: "Split menu removed — only one valid split exists, so tap triggers it directly."

## Naming Consistency

- ISSUE: The design doc uses both "AlignmentZone" (file structure, component name) and "Comparison Zone" (Key Design Decisions section, Interaction Design table) to refer to the same UI element. The workspace zones section calls it "Comparison Zone" with drop slots; the file structure calls the component `AlignmentZone.tsx`.
  Severity: must-fix
  Suggested fix: Pick one name. "ComparisonZone" is more descriptive of what it does (comparing fractions for equivalence). Rename the component to `ComparisonZone.tsx` in the file structure, or rename the concept to "Alignment Zone" everywhere. Consistency matters more than which name wins.

- ISSUE: The term "Block Tray" appears once in the Workspace Zones section but is never referenced again — not in the file structure, not in the component list, not in the sprint tasks. It is unclear whether the tray is a distinct component or part of `WorkspacePanel`.
  Severity: should-fix
  Suggested fix: Add a brief note in the file structure or Day 3 tasks clarifying that the Block Tray is rendered as part of `WorkspacePanel.tsx` (not a separate component), or add it as a component if it warrants one.

## Architecture Coherence

- ISSUE: The `FractionBlock` type allows `numerator > 1` (e.g., 2/4 after combining), but the design says "Blocks are always 1/N" and "Compound fractions (e.g., 2/4) are groups of unit blocks." These two statements contradict. The combine operation replaces two 1/4 blocks with one 2/4 block (numerator=2), meaning blocks are NOT always 1/N after combining.
  Severity: must-fix
  Suggested fix: Clarify the wording in Key Design Decision #2. The rule is: "blocks START as 1/N (unit fractions). Combining merges them into a single block with numerator > 1." The type definition is correct; the prose description is misleading.

- ISSUE: The `LessonEvent` type includes `WORKSPACE_UPDATED` carrying the full blocks array, but the design says drag position is local (useRef) and only finalized drops dispatch to the reducer. It is unclear what triggers `WORKSPACE_UPDATED` — is it every drop? Every combine? The engine needs to know about block state to evaluate answers, but the event contract is vague.
  Severity: should-fix
  Suggested fix: Add a one-line comment or note: "`WORKSPACE_UPDATED` is dispatched after any drop that changes block state (move, combine, or split). It carries the full current block array. The engine uses this to evaluate comparison zone contents."

## Missing Glue / Integration Gaps

- ISSUE: The plan never describes how the lesson engine (state machine) connects to workspace evaluation. When the student presses "Check," the engine must read the blocks currently in the comparison zone and determine correctness. The design doc describes `CHECK_ANSWER` as an event type but does not specify how the reducer accesses comparison zone contents — does the reducer already have them via prior `WORKSPACE_UPDATED` events, or does `CHECK_ANSWER` carry a payload?
  Severity: must-fix
  Suggested fix: Either (a) specify that `CHECK_ANSWER` carries no payload and the reducer evaluates against the most recent block state (already in reducer state via `WORKSPACE_UPDATED`), or (b) give `CHECK_ANSWER` a payload with the comparison zone blocks. Option (a) is simpler and consistent with the existing design.

- ISSUE: The Day 4 task "Wire lesson engine to UI" is a single line item, but it is the most complex integration task in the entire sprint. It requires: (1) chat messages triggering workspace setup for each problem, (2) workspace actions flowing back to the engine, (3) hint escalation state tracking, (4) assessment scoring. This deserves sub-tasks.
  Severity: should-fix
  Suggested fix: Break Day 4 task 1 into sub-tasks: (a) Chat messages populate workspace with correct blocks for each problem, (b) CHECK_ANSWER evaluates comparison zone via engine, (c) Hint escalation counter increments on wrong answers, (d) Assessment problem advancement on correct answers.

## Completeness Delta

- ISSUE: No error handling strategy for the manipulative. What happens if the student drags a block outside the workspace bounds? What if they drop a block in no-man's-land (not in a zone)? The interaction design table covers happy paths but not edge cases.
  Severity: should-fix
  Suggested fix: Add a one-liner: "Blocks dropped outside any zone snap back to their previous position (or to the tray)."

- ISSUE: The design doc does not specify how "assessment problem 3" (show two different ways to make 1/2) determines correctness. The comparison zone has two slots — does the student fill both simultaneously? Does the engine check that both sides independently equal 1/2 AND that they use different denominations?
  Severity: should-fix
  Suggested fix: Clarify the check logic: "Both zones must each sum to 1/2, and the two zones must use different denominator blocks (e.g., one zone has a 1/2 block, the other has two 1/4 blocks)."

- ISSUE: The `lessonScript.ts` is listed in the file structure with a co-located test file, but the sprint plan says to write the engine tests first and the script content second on Day 2. The engine reducer depends on script data (step IDs, transitions). The ordering within Day 2 is ambiguous — round 1 review said "lessonScript before lessonEngine tests" but the current Day 2 listing has lessonEngine as task 1 and lessonScript as task 2.
  Severity: should-fix
  Suggested fix: Reorder Day 2 tasks: (1) lessonScript.ts — author content, (2) lessonScript.test.ts — structural validation, (3) lessonEngine.ts — TDD with real script data, (4) lessonContext.tsx.

## Overall Readability

The plan is well-structured and readable. A developer could pick it up and start building. The sprint breakdown with exit gates is strong. The file structure is clear. The types are concrete. The main gaps are around integration specifics (how engine evaluates answers, how workspace connects to reducer), which is typical for a design doc at this fidelity level.

After 5 prior review rounds, the plan is solid. The must-fix items above are clarification issues, not architectural problems. Nothing requires rethinking the approach.

## Summary

| Severity | Count |
|----------|-------|
| must-fix | 3 |
| should-fix | 7 |

Must-fix items are all about clarifying existing design intent, not introducing new concepts. The architecture is coherent and the plan is implementable as-is — these fixes reduce ambiguity for the developer.

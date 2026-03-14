# Stakeholder Analysis

## Summary

The PRD identifies two actors — the elementary student and the "demo viewer" — but the real stakeholder landscape is broader and carries unresolved tensions. Patrick Skinner is named as technical contact in the requirements but never appears in the PRD, leaving his evaluation criteria completely unspecified. The PRD also conflates the child's learning needs with the evaluator's assessment needs without acknowledging where those goals pull in opposite directions (engagement vs. demonstrable rigor). Several implicit stakeholders — parents/teachers who may observe, content experts who validate pedagogy, and any future developer who inherits the codebase — are entirely absent.

The most consequential gap is that the PRD never defines what "success" looks like from the evaluator's perspective. Without knowing who judges the demo and what they score on, the team is optimizing blind.

## Findings

### Critical Gaps / Questions

- **Patrick Skinner's role and expectations are undefined.** The requirements doc lists him as "Technical Contact" at superbuilders.school, but the PRD never mentions him. Is he the evaluator? A stakeholder who will watch the demo? A technical reviewer of the codebase? His criteria will shape what matters most — interaction polish, code quality, pedagogical correctness, or all three.
  - *Question: What is Patrick Skinner's role in evaluating this deliverable, and what are his specific assessment criteria?*

- **Demo evaluator criteria are unspecified.** The PRD lists "Demo Viewer (evaluator/stakeholder)" as a secondary actor but never defines what they are evaluating. A 1-2 minute demo could be judged on visual polish, pedagogical soundness, technical architecture, interaction design, or code quality. These require very different allocation of the one-week budget.
  - *Question: Is there a rubric or scoring criteria for the demo? What weight is given to interaction quality vs. technical implementation vs. pedagogical accuracy?*

- **Engagement vs. assessment accuracy tension is unacknowledged.** The student needs the experience to feel exploratory and playful (the PRD says "exploration rather than homework"). The evaluator needs to see structured lesson progression and correct math. These goals conflict in practice — heavy scaffolding makes the demo look rigorous but feels less exploratory to the child; free exploration looks magical but may not demonstrate learning. The PRD does not discuss how to balance these.
  - *Question: If time is short, should the team prioritize the "wow factor" of the manipulative interaction or the completeness of the lesson/assessment flow?*

- **No content/pedagogy validator identified.** Fraction equivalence is a well-studied topic with known misconceptions (e.g., children thinking 1/3 > 1/2 because 3 > 2). The PRD does not mention who validates that the lesson script, hints, and manipulative behavior are pedagogically sound. A scripted tutor with incorrect or misleading math feedback could undermine the demo.
  - *Question: Who reviews the lesson script and fraction model for pedagogical correctness? Is there a math education expert involved, or is the developer responsible for this?*

### Important Considerations

- **The child user cannot advocate for themselves in this process.** The PRD describes an age 7-11 user but all design decisions will be made by adults. Real usability testing with a child on an iPad would reveal interaction problems (touch target size, reading level of tutor text, attention span vs. lesson length) that no amount of adult review will catch. The requirements mention "an iPad will be provided for testing" — this implies at least some hands-on testing is expected, but with whom?
  - *Question: Will there be any testing with actual children during the sprint, or is the iPad testing developer-only?*

- **Codebase handoff is ambiguous.** The requirements say "All Roles" under Role, and the PRD specifies TDD and CI/CD. This implies the code is expected to be maintainable and potentially handed off. But the PRD also says "solo developer (AI-assisted)" and frames this as a sprint prototype. If someone else will inherit or extend this code, that changes decisions about documentation, test coverage, and architecture quality.
  - *Question: Is this a throwaway prototype, or will the codebase be reviewed, extended, or handed to another team?*

- **Parents/teachers as observers are not mentioned.** In a real Synthesis Tutor demo scenario, parents or teachers are often watching. If the demo video will be shown to non-technical stakeholders (e.g., school administrators, investors), the visual design and "feel" matter much more than if the audience is purely technical. The PRD's open question about visual design/brand guidelines hints at this uncertainty but does not resolve it.

- **The requirements doc and PRD disagree on language constraints.** The requirements doc says "There are no restrictions on programming languages, frameworks, or tools" while also listing "JavaScript, TypeScript" as required languages. The PRD resolves this by choosing TypeScript + React, but the original requirements are internally contradictory. This could matter if the evaluator has expectations about technology choices.

### Observations

- The PRD correctly scopes out LLM integration, accounts/auth, and analytics — these are appropriate non-goals for a 1-week sprint and prevent scope creep.

- The "Demo Viewer" actor in the PRD is thin — it describes what they see but not what they evaluate or care about. This actor needs the same depth of treatment as the student actor.

- The requirements doc explicitly calls out a README as a deliverable. The PRD mentions CI/CD but does not list the README or demo video as deliverables in its goals section. These are concrete artifacts the evaluator will expect.

- The PRD's open questions (denominator range, touch model, audio, etc.) are good but they are all product/technical questions. There are no open questions about stakeholder needs, evaluation criteria, or success metrics — which are arguably more important to resolve first.

## Confidence Assessment

**Medium-Low.** The student actor is reasonably well-defined, but the evaluator side is almost entirely unspecified. The PRD does not answer who judges success, by what criteria, or for what purpose. Patrick Skinner's expectations are a black box. Until the evaluation criteria are known, the team is making implicit bets about what matters — and a 1-week sprint has no room to course-correct if those bets are wrong.

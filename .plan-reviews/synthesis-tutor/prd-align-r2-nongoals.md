# PRD Alignment Round 2: Non-Goals Check

Review of design-doc.md against PRD non-goals. Verifying the plan does not include work that falls into non-goal territory.

## PRD Non-Goals (reference)

1. No LLM integration for the tutor — scripted dialogue, state machine only
2. No curriculum system — one lesson, not a lesson builder or multi-topic platform
3. No user accounts, auth, or persistence — no login, saved progress, student profiles
4. No complex adaptive difficulty — simple correct/incorrect branching sufficient
5. No analytics or reporting dashboard
6. No accessibility compliance beyond basic usability
7. No native app — web only

---

## Section-by-Section Classification

### Architecture Overview
- CLEAN: Architecture Overview — frontend-only SPA, no backend, no auth, no persistence. Explicitly called out.

### Key Design Decision 1: State Management (useReducer + Context)
- CLEAN: State Management — single reducer, no external state library, no persistence layer.

### Key Design Decision 2: Fraction Model (Unit Fractions Only)
- CLEAN: Fraction Model — pure math on unit fractions. No curriculum abstraction.

### Key Design Decision 3: SVG + Pointer Events
- CLEAN: SVG + Pointer Events — web-only rendering. No native code.

### Key Design Decision 4: Responsive Layout
- CLEAN: Responsive Layout — CSS media queries, web-only.

### Key Design Decision 5: Workspace Zones
- CLEAN: Workspace Zones — describes manipulative interaction areas, no scope creep.

### Key Design Decision 6: Assessment (No Fail State)
- BORDERLINE: Assessment — "3 problems, unlimited retries, escalating hints (general → specific → direct guidance). After 3+ wrong attempts, tutor walks through the answer." The escalating hint system with 3+ levels of graduated response approaches "complex adaptive difficulty." However, the PRD clarifies that "simple branching (correct/incorrect paths) is sufficient" — it doesn't prohibit hint escalation, just says it isn't required. The hints are static/scripted, not dynamically generated. Recommendation: keep as-is, but do not over-invest in hint authoring. Two hint levels (gentle + specific) plus a walkthrough is enough. Don't build a general-purpose hint escalation framework.

### Tech Stack Table
- CLEAN: Tech Stack — all web technologies, no native tooling, no analytics libraries, no auth services.

### File Structure
- CLEAN: File Structure — no files for auth, persistence, analytics, or multi-lesson management.

### Core Types
- CLEAN: Core Types — `LessonPhase` has fixed phases for one lesson. `LessonEvent` has a `RESET` event for "Play Again" but this is in-memory reset, not persistence.

### Interaction Design
- CLEAN: Interaction Design — describes gestures for a single lesson's manipulative.

### Visual Design
- CLEAN: Visual Design — block colors and dimensions. No theming system or design-token abstraction.

### iPad Safari Essentials
- CLEAN: iPad Safari Essentials — web-only Safari optimizations.

### Security (Minimal)
- CLEAN: Security — CSP headers, HTTPS, COPPA note. No auth system. The COPPA mention is a factual observation ("no data collection"), not a compliance work item.

### Performance
- CLEAN: Performance — notes about RAF gating and DOM manipulation. No analytics instrumentation.

### TDD Approach
- CLEAN: TDD Approach — tests for model, engine, workspace. No test infrastructure for multi-lesson scenarios.

### REQUIRED vs STRETCH Classification
- CLEAN: REQUIRED items 1-12 — all map directly to PRD goals.
- BORDERLINE: STRETCH item 4 "Idle/inactivity nudges from tutor" — could be read as adaptive behavior (non-goal #4: no complex adaptive difficulty). However, this is a simple timeout trigger with a canned message, not difficulty adaptation. Recommendation: keep as stretch but ensure implementation is a single static timer + message, not behavioral analysis.
- CLEAN: STRETCH items 1-3, 5-11 — UI polish items, none venture into non-goal territory.

### Tutor Voice & Sample Dialogue
- CLEAN: Tutor Voice — scripted dialogue samples. No LLM integration. No dynamic generation.

### Concrete Equivalence Problems
- CLEAN: Concrete Equivalence Problems — hand-authored problems for one lesson. No problem generation system, no curriculum builder.

### Demo Video Plan
- CLEAN: Demo Video Plan — recording plan for the demo deliverable.

### Sprint Plan
- CLEAN: Sprint Plan — five days, one lesson, no multi-lesson or platform work.

---

## Summary

| Classification | Count | Items |
|---------------|-------|-------|
| CLEAN | 20 | All major sections |
| SCOPE-CREEP | 0 | None |
| BORDERLINE | 2 | See below |

### BORDERLINE (should-fix)

1. **Assessment hint escalation** (Key Design Decision 6) — the 3-level hint escalation (general → specific → walkthrough) is richer than the PRD's "simple branching (correct/incorrect)" but remains scripted and static. Recommendation: keep, but cap at 2 hint levels + walkthrough. Do not build a reusable hint-escalation engine.

2. **STRETCH: Idle/inactivity nudges** (STRETCH item 4) — a timeout-based nudge is fine as stretch work. Recommendation: implement as a single `setTimeout` + canned message, not as a behavioral monitoring system.

### Verdict

The plan is well-scoped against the PRD's non-goals. No section introduces LLM integration, multi-lesson curriculum, user accounts, analytics, accessibility compliance work, or native app code. The two borderline items are minor and acceptable as long as implementation stays simple.

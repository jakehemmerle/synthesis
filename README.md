# Synthesis — Fraction Explorer

An interactive AI-powered math tutor that teaches fraction equivalence through conversational guidance and drag-and-drop manipulatives. Built as a 1-week prototype inspired by the Synthesis Tutor model. Read @requirements.md for the FULL requirements, as well as the beads/issues with `bd`

**Live:** https://synthesis-tutor-jh.web.app

## What It Does

A single self-contained lesson on fraction equivalence (e.g. 1/2 = 2/4). The tutor guides students through three phases:

1. **Exploration** — Free play with draggable fraction blocks (halves, thirds, quarters, fifths). Tap to split, drag to combine.
2. **Guided Discovery** — Scripted problems with escalating hints ("Make 1/2 using quarters", "Build a whole with fifths").
3. **Assessment** — Challenge problems with dual comparison zones to test understanding.

Designed for iPad in landscape or portrait orientation.

## Run Locally

```bash
cd app
npm install
npm run dev        # http://localhost:5173
```

## Build & Deploy

```bash
cd app
npm run build                # outputs to app/dist/
npx firebase deploy --only hosting
```

Firebase Hosting project: `synthesis-tutor-jh`.

## Test

```bash
cd app
npm test -- --run
```

## Technical Approach

| Layer | Tech | Purpose |
|-------|------|---------|
| UI | React 19 + TypeScript | Component rendering |
| Styling | Tailwind CSS 4 + shadcn/ui | Design system |
| Workspace | SVG with pointer events | Drag-and-drop fraction blocks |
| Lesson engine | `useReducer` state machine | Phase transitions, answer checking, hint escalation |
| Fraction model | Pure functions (`model/fraction.ts`) | Split, combine, validate — no floating point |
| Deploy | Firebase Hosting | Static SPA with CDN |
| Build | Vite 8 | Dev server + production bundling |

The app is a single-page React app. The lesson flow is driven by a reducer (`engine/lessonReducer.ts`) that manages phases, chat messages, and step progression. Fraction math uses integer numerator/denominator pairs to avoid floating-point issues. The SVG workspace handles touch/pointer events directly for iPad compatibility.

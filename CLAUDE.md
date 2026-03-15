# Synthesis Tutor

## Quality Gates

Before merging any code, run these checks from the `app/` directory:

```bash
cd app && npm install && npm run build
```

The build MUST pass (TypeScript compilation + Vite bundle). Reject any MR where the build fails.

When a test script exists (`npm test` is defined in package.json), also run:

```bash
npm test -- --run
```

Tests MUST pass. Reject any MR where tests fail.

## Project Structure

- `app/` — Vite + React + TypeScript SPA
- `app/src/` — Source code
- `app/dist/` — Build output (do not commit)
- `.designs/` — Design documents
- `.prd-reviews/` — PRD review artifacts
- `.plan-reviews/` — Plan review artifacts

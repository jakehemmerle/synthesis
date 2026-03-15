# Synthesis Tutor

## Before Committing

You MUST run these checks from the `app/` directory before committing code:

```bash
cd app && npm install && npm run build && npm test
```

All three must pass. Do not commit or submit an MR if the build or tests fail. Fix the issue first.

## Project Structure

- `app/` — Vite + React + TypeScript SPA
- `app/src/model/` — Pure fraction math and workspace logic (TDD)
- `app/src/engine/` — Lesson state machine and script content
- `app/src/components/` — React components including shadcn/ui
- `app/src/hooks/` — Custom hooks (drag, lesson state)

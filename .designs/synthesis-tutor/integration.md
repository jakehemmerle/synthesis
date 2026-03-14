# Integration Design

## Project Setup

### Scaffolding

```bash
# Create project
npm create vite@latest synthesis-tutor -- --template react-ts
cd synthesis-tutor

# Install core deps
npm install react react-dom
npm install -D typescript @types/react @types/react-dom

# shadcn/ui prerequisites
npm install tailwindcss @tailwindcss/vite
npx shadcn@latest init
# When prompted: style=default, color=neutral, css-variables=yes

# shadcn components (add as needed)
npx shadcn@latest add button card scroll-area
```

### Directory Structure

```
synthesis-tutor/
├── public/
│   └── favicon.svg
├── src/
│   ├── main.tsx                    # ReactDOM.createRoot entry
│   ├── App.tsx                     # Top-level layout, state provider
│   ├── components/
│   │   ├── ui/                     # shadcn/ui generated components
│   │   │   ├── button.tsx
│   │   │   ├── card.tsx
│   │   │   └── scroll-area.tsx
│   │   ├── ChatPanel.tsx           # Tutor conversation panel
│   │   ├── ChatMessage.tsx         # Single message bubble
│   │   ├── ResponseButtons.tsx     # Student response option buttons
│   │   ├── WorkspacePanel.tsx      # SVG manipulative container
│   │   ├── FractionBlock.tsx       # Single SVG fraction block
│   │   ├── AlignmentZone.tsx       # SVG comparison zone
│   │   ├── CheckButton.tsx         # "Check my answer" button
│   │   ├── LetsGoButton.tsx        # Exploration → guided transition
│   │   └── LessonLayout.tsx        # Responsive portrait/landscape wrapper
│   ├── engine/
│   │   ├── lessonEngine.ts         # State machine: step transitions
│   │   ├── lessonEngine.test.ts    # TDD: engine transitions
│   │   ├── lessonScript.ts         # Lesson data: steps, messages, branches
│   │   └── lessonScript.test.ts    # TDD: script structure validation
│   ├── model/
│   │   ├── fraction.ts             # Fraction value type, equivalence, arithmetic
│   │   ├── fraction.test.ts        # TDD: fraction logic
│   │   ├── workspace.ts            # Workspace state: blocks, positions, grouping
│   │   └── workspace.test.ts       # TDD: workspace operations
│   ├── hooks/
│   │   ├── useLesson.ts            # Hook connecting engine to React state
│   │   ├── useWorkspace.ts         # Hook for workspace block manipulation
│   │   └── usePointerDrag.ts       # Pointer event abstraction for touch/mouse
│   ├── types/
│   │   └── index.ts                # Shared types: LessonStep, Block, Message, etc.
│   └── lib/
│       └── utils.ts                # shadcn/ui utility (cn function)
├── tests/
│   └── e2e/                        # Playwright tests (if time permits)
│       └── lesson-flow.spec.ts
├── index.html
├── vite.config.ts
├── tsconfig.json
├── tsconfig.app.json
├── tailwind.config.ts
├── components.json                 # shadcn/ui config
├── firebase.json
├── .firebaserc
├── package.json
└── README.md
```

The key organizational principle: `model/` and `engine/` are pure TypeScript with zero React dependencies. This makes them trivially testable and is where TDD lives. `components/` is the React view layer. `hooks/` bridges the two.

## Component Integration

### shadcn/ui + React

shadcn/ui generates components into `src/components/ui/`. These are source-owned (not node_modules), so they can be customized freely. The integration is straightforward -- they're just React components with Tailwind classes.

Used for:
- `Button` -- response option buttons, "Check" button, "Let's go!" button
- `Card` -- chat message containers
- `ScrollArea` -- chat panel auto-scroll

Not used for the SVG workspace -- shadcn is DOM/Tailwind-based and doesn't apply to SVG elements.

### SVG Workspace + React

The workspace is a single `<svg>` element rendered by `WorkspacePanel.tsx`. Fraction blocks are React components that render SVG groups (`<g>`, `<rect>`, `<text>`).

```tsx
// WorkspacePanel.tsx -- simplified structure
function WorkspacePanel({ blocks, onBlockMove, onBlockDrop, onBlockTap }: Props) {
  return (
    <svg
      viewBox="0 0 800 600"
      className="w-full h-full touch-none"
      // touch-none prevents browser scroll/zoom on the SVG
    >
      <AlignmentZone y={400} width={800} />
      {blocks.map(block => (
        <FractionBlock
          key={block.id}
          block={block}
          onPointerDown={...}  // drag start
          onPointerMove={...}  // drag update
          onPointerUp={...}    // drop / combine check
          onTap={...}          // split menu
        />
      ))}
    </svg>
  );
}
```

The `touch-none` CSS class is critical -- without it, iPad Safari interprets drags as page scrolls. All interaction uses Pointer Events (not Touch Events or Mouse Events), which unify mouse and touch under one API.

### Responsive Layout: Portrait vs Landscape

`LessonLayout.tsx` uses a CSS media query or container query to switch between:
- **Landscape**: side-by-side (chat left 35%, workspace right 65%)
- **Portrait**: stacked (chat top ~40%, workspace bottom ~60%)

```tsx
// LessonLayout.tsx
function LessonLayout({ chat, workspace }: Props) {
  return (
    <div className="h-dvh w-full flex flex-col md:landscape:flex-row">
      <div className="h-[40%] md:landscape:h-full md:landscape:w-[35%] border-b md:landscape:border-b-0 md:landscape:border-r">
        {chat}
      </div>
      <div className="h-[60%] md:landscape:h-full md:landscape:w-[65%]">
        {workspace}
      </div>
    </div>
  );
}
```

Using `h-dvh` (dynamic viewport height) instead of `h-screen` handles the mobile Safari address bar correctly.

### Chat Panel + Workspace Communication (Shared State)

The chat panel and workspace panel do **not** communicate directly. They share state through a common parent using React context or prop drilling from `App.tsx`.

```
App.tsx
├── LessonProvider (context: lesson state + dispatch)
│   ├── LessonLayout
│   │   ├── ChatPanel        reads: messages, responseOptions
│   │   │                    dispatches: STUDENT_RESPONSE
│   │   └── WorkspacePanel   reads: blocks, activeChallenge
│   │                        dispatches: BLOCK_MOVE, BLOCK_COMBINE, BLOCK_SPLIT, CHECK_ANSWER
```

The `useLesson` hook wraps a `useReducer` that contains:
- Current lesson step (from the engine)
- Chat message history
- Workspace block state
- Whether a "check" is active

When the workspace dispatches `CHECK_ANSWER`, the reducer calls the lesson engine to evaluate the workspace state, then advances the lesson step and appends the appropriate tutor message. This keeps the flow unidirectional.

### Lesson Script Data + Lesson Engine

The lesson script is a static data structure (plain object, no class). The engine reads it.

```ts
// lessonScript.ts -- data shape
type LessonStep = {
  id: string;
  phase: 'exploration' | 'guided' | 'assessment';
  tutorMessages: string[];          // Messages to display on entering this step
  responseOptions?: string[];       // Button labels for student (chat-based responses)
  workspaceChallenge?: {
    prompt: string;                 // e.g., "Make 1/2 using quarter blocks"
    targetFraction: Fraction;       // What the workspace should show
    acceptedEquivalents: Fraction[]; // All valid answers
  };
  transitions: {
    onCorrect?: string;             // next step id
    onIncorrect?: string;           // next step id (hint path)
    onResponse?: Record<string, string>; // button label → next step id
    onContinue?: string;            // auto-advance after messages
  };
};
```

The engine is a pure function: `(currentStepId, event) => nextStepId`. It does not hold state itself -- it just computes transitions. The React hook holds the actual state.

## Firebase Setup

### Project Structure

Two Firebase projects (or one project with two hosting sites):

**Option A -- Two separate projects (simpler):**
- `synthesis-tutor-prod` -- production
- `synthesis-tutor-staging` -- staging

**Option B -- One project, two hosting sites (recommended):**
- Project: `synthesis-tutor`
- Sites: `synthesis-tutor-prod`, `synthesis-tutor-staging`

Option B is better because it avoids duplicating Firestore/Auth configs (even though we don't use them -- cleaner for a single billing account).

### firebase.json

```json
{
  "hosting": {
    "public": "dist",
    "ignore": ["firebase.json", "**/.*", "**/node_modules/**"],
    "rewrites": [
      {
        "source": "**",
        "destination": "/index.html"
      }
    ],
    "headers": [
      {
        "source": "**/*.@(js|css|svg)",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "public, max-age=31536000, immutable"
          }
        ]
      },
      {
        "source": "index.html",
        "headers": [
          {
            "key": "Cache-Control",
            "value": "no-cache"
          }
        ]
      }
    ]
  }
}
```

The SPA rewrite (`** → /index.html`) is essential since this is a single-page app. Cache headers are aggressive for hashed assets (Vite adds content hashes to JS/CSS filenames) and no-cache for the HTML entry point.

### .firebaserc

```json
{
  "projects": {
    "staging": "synthesis-tutor",
    "production": "synthesis-tutor"
  },
  "targets": {
    "synthesis-tutor": {
      "hosting": {
        "staging": ["synthesis-tutor-staging"],
        "production": ["synthesis-tutor-prod"]
      }
    }
  }
}
```

### Deploy Commands

```bash
# First time setup
npm install -g firebase-tools
firebase login
firebase use staging          # or: firebase use production

# Deploy to staging
npm run build
firebase deploy --only hosting:staging

# Deploy to production
npm run build
firebase deploy --only hosting:production
```

### Firebase Init

```bash
firebase init hosting
# Select existing project or create new
# Public directory: dist
# Single-page app: Yes
# Do not overwrite index.html
```

If using the two-site approach under one project, also run:
```bash
firebase hosting:sites:create synthesis-tutor-staging
firebase hosting:sites:create synthesis-tutor-prod
firebase target:apply hosting staging synthesis-tutor-staging
firebase target:apply hosting production synthesis-tutor-prod
```

## Testing Setup

### Vitest Configuration

```ts
// vite.config.ts
import { defineConfig } from 'vite';
import react from '@vitejs/plugin-react';
import tailwindcss from '@tailwindcss/vite';

export default defineConfig({
  plugins: [react(), tailwindcss()],
  test: {
    globals: true,
    environment: 'jsdom',
    include: ['src/**/*.test.ts', 'src/**/*.test.tsx'],
    coverage: {
      include: ['src/model/**', 'src/engine/**'],
    },
  },
});
```

Install:
```bash
npm install -D vitest @testing-library/react @testing-library/jest-dom jsdom
```

### Test File Conventions

Tests are co-located with source files (not in a separate `__tests__` directory):
- `src/model/fraction.ts` → `src/model/fraction.test.ts`
- `src/engine/lessonEngine.ts` → `src/engine/lessonEngine.test.ts`

TDD priority order:
1. `fraction.test.ts` -- equivalence checks, simplification, combine/split math
2. `workspace.test.ts` -- block placement, overlap detection, combination rules
3. `lessonEngine.test.ts` -- state transitions, branching on correct/incorrect
4. `lessonScript.test.ts` -- structural validation (all step IDs referenced exist, no dead ends)

### Running Tests

```bash
npm run test            # Watch mode during development
npm run test -- --run   # Single run (CI-style)
npm run coverage        # Coverage report for model/engine
```

### package.json Scripts

```json
{
  "scripts": {
    "dev": "vite",
    "build": "tsc -b && vite build",
    "preview": "vite preview",
    "test": "vitest",
    "coverage": "vitest run --coverage",
    "deploy:staging": "npm run build && firebase deploy --only hosting:staging",
    "deploy:prod": "npm run build && firebase deploy --only hosting:production"
  }
}
```

### Playwright (Stretch Goal)

If there's time for E2E:

```bash
npm install -D @playwright/test
npx playwright install webkit  # iPad Safari uses WebKit
```

```ts
// playwright.config.ts
export default defineConfig({
  testDir: './tests/e2e',
  use: {
    baseURL: 'http://localhost:5173',
  },
  projects: [
    {
      name: 'webkit',
      use: {
        ...devices['iPad Pro 11'],
      },
    },
  ],
  webServer: {
    command: 'npm run dev',
    port: 5173,
  },
});
```

E2E is a stretch goal. The TDD value is in the model and engine layers; UI testing on a 1-week sprint has poor ROI.

## Build & Deploy

### Build Pipeline

```
npm run build
  → tsc -b          (type-check, no emit -- Vite handles transpilation)
  → vite build       (bundle, tree-shake, hash assets → dist/)

firebase deploy --only hosting:staging
  → uploads dist/ to Firebase Hosting CDN
```

Vite output goes to `dist/` by default, which matches the `firebase.json` public directory.

### Build Verification

Before deploying, verify the build locally:
```bash
npm run build && npm run preview
# Opens http://localhost:4173 -- test in browser
```

### Deploy Workflow (Human Steps)

1. Run tests: `npm test -- --run`
2. Build: `npm run build`
3. Preview locally: `npm run preview` (quick sanity check)
4. Deploy staging: `firebase deploy --only hosting:staging`
5. Test on iPad via staging URL
6. Deploy prod: `firebase deploy --only hosting:production`

Or use the combined scripts: `npm run deploy:staging` / `npm run deploy:prod`.

## Development Workflow

### Local Dev Server

```bash
npm run dev
# Vite dev server at http://localhost:5173
# HMR enabled for all React components
```

Vite's HMR works with SVG-rendering React components the same as any other component. Changing a `FractionBlock.tsx` hot-reloads without losing workspace state (React Fast Refresh preserves state on component edits that don't change hooks).

### iPad Testing During Development

For testing on a physical iPad during development:

```bash
# Find your machine's local IP
ipconfig getifaddr en0    # macOS

# Vite already binds to localhost; expose to network:
npm run dev -- --host
# Now accessible at http://<your-ip>:5173 from iPad on same network
```

Alternatively, deploy to staging and test via the Firebase URL, which avoids network configuration issues.

### Touch Debugging

Chrome DevTools device emulation is useful for initial touch testing but does not replicate iPad Safari quirks. Key things to test on a real iPad:
- `touch-action: none` on the SVG canvas (prevents scroll/zoom)
- Pointer event coordinates with `clientX`/`clientY` vs SVG coordinate space (use `SVGSVGElement.getScreenCTM()` for conversion)
- 300ms tap delay (modern Safari handles this, but verify)
- Viewport meta tag: `<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">`

### Viewport Meta

Add to `index.html`:
```html
<meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, user-scalable=no">
```

This prevents pinch-to-zoom on the lesson page, which would interfere with the fraction manipulative interactions.

## Deliverables

### README

The README should cover:
1. **What it is** -- one-paragraph description
2. **How to run locally** -- `npm install && npm run dev`
3. **How to run tests** -- `npm test`
4. **How to deploy** -- `npm run deploy:staging` / `npm run deploy:prod`
5. **Technical approach** -- brief summary of architecture (state machine lesson engine, SVG manipulative, React + shadcn/ui)
6. **Live URL** -- link to the deployed staging/prod site

Keep it short. This is a 1-week prototype, not an open-source library.

### Demo Video

Approach for the 1-2 minute demo video:
- Record on the iPad itself (screen recording: swipe down from top-right, tap screen record) or use QuickTime on macOS with the iPad connected via USB (better quality, captures touch indicators).
- Walk through the full lesson flow: greeting → exploration → guided discovery → assessment → completion.
- No voiceover needed unless it adds clarity. The tutor dialogue should speak for itself.
- Target 60-90 seconds. Cut any dead time.

QuickTime approach (recommended for quality):
```
QuickTime Player → File → New Movie Recording → select iPad as camera source
```

This captures the iPad screen at full resolution with touch indicators visible.

## Key Trade-offs

| Decision | Chose | Over | Why |
|---|---|---|---|
| State management | `useReducer` + context | XState / Zustand | One lesson, simple branching. A full state machine library is overhead for ~15 states. If branching gets complex, XState can be swapped in since the engine is already a pure function. |
| Test co-location | Tests next to source | Separate `__tests__/` dir | Easier to find, easier to maintain, standard Vitest convention. |
| SVG in React | React components rendering SVG | Standalone SVG lib (D3, Konva) | Keeps everything in React's component model. No foreign object bridge. Pointer events work natively on SVG elements. |
| Firebase setup | Two sites, one project | Two projects | Single billing, simpler management. deploy targets handle staging vs prod. |
| E2E testing | Stretch goal | Required | 1-week sprint. TDD on model/engine gives the most confidence per hour. E2E on iPad-specific touch behavior has diminishing returns when you're testing on the real device anyway. |
| CSS approach | Tailwind (via shadcn) | CSS modules / styled-components | shadcn/ui requires Tailwind. Consistent with the component library choice. |
| Layout breakpoint | `md:landscape:` | JS-based detection | Pure CSS, no layout shift on orientation change, no JavaScript re-render. |

## Implementation Notes

- **Vite's `test` config lives in `vite.config.ts`**, not a separate `vitest.config.ts`. This avoids config duplication and ensures path aliases (if any) are shared between build and test.
- **shadcn/ui's `components.json`** points component generation to `src/components/ui/`. Run `npx shadcn@latest add <component>` to add new ones -- do not copy-paste from the shadcn docs.
- **SVG `viewBox` dimensions** should be chosen to give a reasonable coordinate system (e.g., `0 0 800 600`). The actual rendered size is controlled by the CSS on the `<svg>` element. This decouples layout math from screen dimensions.
- **Pointer event coordinate conversion**: when dragging SVG elements, convert screen coordinates to SVG coordinates using `svg.getScreenCTM().inverse()`. This handles any CSS scaling/transforms correctly.
- **The fraction model must be pure** -- no side effects, no DOM references. It should be importable and testable without React, without jsdom, without any environment shims. This is the core of TDD for this project.
- **`touch-action: none`** must be set on the SVG element (via Tailwind's `touch-none` class). Without this, iPad Safari will intercept pointer events for scrolling.
- **`h-dvh`** (Tailwind's dynamic viewport height) is preferred over `h-screen` for the root layout. On mobile Safari, `100vh` does not account for the collapsible address bar; `100dvh` does.
- **Firebase deploy requires `dist/`** to exist. The `deploy:*` scripts chain `npm run build` before `firebase deploy` to prevent deploying stale builds.

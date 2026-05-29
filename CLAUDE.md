# Money Splitter — Claude Context

A browser-only bill-splitting tool. No backend, no auth. Everything runs in React, persisted to `localStorage`.

## Design philosophy

**Minimal, dark, and modern.** The entire UI is built on a `#09090b` (zinc-950) background. Surfaces use `zinc-900` / `zinc-800`. Text hierarchy: `zinc-100` (primary) → `zinc-300` (secondary) → `zinc-500` (muted). Interactive elements use subtle hover states — no heavy shadows, no gradients, no color accents. The only "bright" element is the white `bg-zinc-100` primary action button. When in doubt: less is more.

## Dev commands

| Command | Purpose |
|---|---|
| `npm run dev` | Dev server at `http://localhost:5173` |
| `npm run build` | TypeScript check + Vite production build → `dist/` |
| `npm run preview` | Serve the `dist/` build at `http://localhost:4173` |
| `npm run lint` | ESLint check |
| `npm test` | Vitest in watch mode |
| `npm run test:run` | Vitest single run (CI) |

VS Code quick launch — two options:
- **Run & Debug** (`Cmd+Shift+D`): select `Dev Server + Chrome` compound — starts Vite and opens Chrome with full source-map debugging attached
- **Tasks** (`Cmd+Shift+P → Tasks: Run Task`): `Dev Server` + `Open Dev in Safari` if you prefer Safari; `Preview Build` for a production preview

## Stack

- React 19, TypeScript 6, Vite 8
- Tailwind CSS v4 (via `@tailwindcss/vite` — no `tailwind.config.js` needed)
- `dom-to-image-more` for PNG export
- `uuid` for all IDs
- `clsx` + `tailwind-merge` for conditional class merging

## File layout

```
src/
├── App.tsx                     # Root — switches Dashboard ↔ SplitView based on activeProject
├── main.tsx                    # React entry point
├── types.ts                    # Shared interfaces (Friend, Item, Receipt, Project)
├── index.css                   # Global styles + Tailwind import
├── store/
│   └── ProjectContext.tsx      # React Context, all mutations, localStorage sync
└── components/
    ├── Dashboard.tsx            # Project list; create / import JSON / export JSON
    ├── SplitView.tsx            # Active project shell + PNG/JSON export trigger
    ├── BreakdownTable.tsx       # Main editable split table with per-item cost assignment + tax
    ├── ExportView.tsx           # Always-rendered off-screen PNG target (inline styles only)
    └── ValidationTable.tsx     # Per-receipt expected-vs-calculated diff panel
utils/
    └── calculations.ts          # Pure functions: calculateReceiptTotals, calculateGrandTotals
test/
    └── setup.ts                 # @testing-library/jest-dom matchers
```

## Data model

```ts
Project
  ├── id: string           // uuid
  ├── name: string
  ├── date: string         // ISO timestamp of creation
  ├── tags?: string[]
  ├── friends: Friend[]    // { id, name }
  └── receipts: Receipt[]
        ├── id, name
        ├── expectedTotal: number   // printed total on physical receipt
        ├── taxPercentage: number   // applied on top of each person's subtotal
        └── items: Item[]
              ├── id, name
              └── splits: Record<friendId, amount>  // how much each friend owes for this item
```

`localStorage` keys: `moneySplitter_projects` (JSON array), `moneySplitter_activeProjectId` (string).

## State management

All state lives in `ProjectContext`. The single mutation entry point is `updateProject(project: Project)` — pass the full updated project object. It calls `setProjects` which triggers a `useEffect` that writes to `localStorage`.

Other context methods: `createProject(name)`, `deleteProject(id)`, `importProject(project)`, `setActiveProject(id | null)`.

## Export flows

**JSON export** — available in two places:
- **Dashboard** — hover a project card → download icon → `<project-name>.json`
- **SplitView** — "Export JSON" button in header, or automatically alongside PNG when "Split Project!" is clicked

**PNG export flow**

`ExportView` (`src/components/ExportView.tsx`) is always rendered off-screen at `left: -9999px`. It uses only inline styles (CSS classes are not reliably captured by `dom-to-image-more`). `SplitView` holds `exportRef` pointing to it and calls `domtoimage.toBlob()` — no state toggling, no timing hacks. "Split Project!" downloads both PNG and JSON.

## Key patterns

- **Conditional classes**: use `clsx(...)` or `twMerge(clsx(...))` — never string concatenation.
- **IDs**: always `uuidv4()` from the `uuid` package.
- **No backend**: never introduce server-side code, fetch calls to external APIs, or environment variables. This is intentional — the app is designed to be statically hosted.
- **Inline styles in ExportView**: `ExportView` must use only inline styles — CSS utility classes are not reliably captured by `dom-to-image-more`. Never add Tailwind classes there.
- **Calculations are pure**: `calculateReceiptTotals` and `calculateGrandTotals` live in `src/utils/calculations.ts`. Both `BreakdownTable` and `ExportView` import from there — do not duplicate the logic.

## Things to watch out for

- `dom-to-image-more` has no TypeScript types — `@ts-ignore` is intentional on its import and usage.
- Tailwind v4 uses a CSS-first config (no JS config file). Add custom tokens directly in `index.css` with `@theme`.
- `createProject` pre-seeds two friends (one named "Hazriq"). This is intentional default state.

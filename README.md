# Money Splitter — Free Bill Splitting App for Groups

> Split restaurant bills, trip expenses, and shared costs by item — no sign-up, no server, no spreadsheet chaos.

A minimal, privacy-first bill splitter that runs entirely in your browser. Perfect for dinners, road trips, holidays, and any group outing where you need to know exactly who owes what.

[![React](https://img.shields.io/badge/React-19-61DAFB?logo=react&logoColor=white)](https://react.dev)
[![TypeScript](https://img.shields.io/badge/TypeScript-6-3178C6?logo=typescript&logoColor=white)](https://www.typescriptlang.org)
[![Tailwind CSS](https://img.shields.io/badge/Tailwind_CSS-v4-06B6D4?logo=tailwindcss&logoColor=white)](https://tailwindcss.com)
[![Vite](https://img.shields.io/badge/Vite-8-646CFF?logo=vite&logoColor=white)](https://vitejs.dev)
[![License: MIT](https://img.shields.io/badge/License-MIT-green.svg)](LICENSE)

---

## Features

- **Item-by-item splitting** — assign each line item to one person, split it evenly, or use any custom split across friends
- **Tax support** — set a tax percentage per receipt; it's applied proportionally on top of each person's subtotal
- **Live validation** — enter the printed total from a physical receipt and the app flags any discrepancy in real time
- **PNG export** — generates a clean, shareable summary image ready to paste into a group chat
- **JSON import / export** — save a project as JSON, share it, or reload it later
- **Fully offline** — no accounts, no backend, no data leaving your device; everything persists to `localStorage`
- **Multi-receipt projects** — group multiple receipts under one project (e.g. all spending across a weekend trip)

---

## Demo

> Add a screenshot or GIF here — e.g. `![Money Splitter screenshot](docs/screenshot.png)`

---

## Quickstart

```bash
# Install dependencies
npm install

# Start dev server (http://localhost:5173)
npm run dev
```

Create a project → add friends → add receipts → assign item costs → click **Split Project!** to export a PNG.

```bash
# Production build
npm run build

# Preview the production build
npm run preview
```

No environment variables or backend setup needed.

---

## Tech stack

| Layer           | Choice                |
| --------------- | --------------------- |
| Framework       | React 19              |
| Language        | TypeScript 6          |
| Build tool      | Vite 8                |
| Styling         | Tailwind CSS v4       |
| Icons           | lucide-react          |
| Class utilities | clsx + tailwind-merge |
| PNG export      | dom-to-image-more     |
| ID generation   | uuid                  |

---

## Code structure

```
src/
├── App.tsx                  # Root — switches between Dashboard and SplitView
├── types.ts                 # Shared interfaces: Friend, Item, Receipt, Project
├── store/
│   └── ProjectContext.tsx   # React Context + localStorage persistence
└── components/
    ├── Dashboard.tsx         # Project list, create / import / export JSON
    ├── SplitView.tsx         # Active project editor shell + PNG export trigger
    ├── BreakdownTable.tsx    # Editable split table with per-item cost assignment + tax
    ├── ValidationTable.tsx   # Per-receipt expected vs. calculated diff panel
    └── ExportView.tsx        # Off-screen PNG-optimised render (inline styles only)
```

### Data model

```ts
Project
  ├── id, name, date, tags[]
  ├── friends: Friend[]          // { id, name }
  └── receipts: Receipt[]
        ├── id, name, expectedTotal, taxPercentage
        └── items: Item[]        // { id, name, splits: { friendId → amount } }
```

State lives in `ProjectContext`. All mutations go through `updateProject`, which writes to `localStorage` on every change.

### Export flow

`ExportView` is always rendered off-screen (`left: -9999px`). When the user clicks **Split Project!**, `SplitView` calls `domtoimage.toPng()` on the hidden ref and triggers a browser download. Inline styles are used throughout `ExportView` because CSS utility classes are not reliably captured by `dom-to-image-more`.

---

## Contributing

Issues and PRs are welcome. Please keep changes minimal and consistent with the existing dark, no-frills design language.

---

Made with &lt;3 in KL by [@Hazriq](https://github.com/hazriqpedia)

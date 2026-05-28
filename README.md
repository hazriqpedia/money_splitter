# Money Splitter

A minimal, no-login bill-splitting tool for groups. Designed for trips, dinners, and any shared expense where you need to know exactly who owes what — without the spreadsheet chaos.

Everything runs in the browser. No accounts, no servers, no data leaving your machine.

---

## What it does

**Projects** are the top-level container — one per trip, event, or outing. Each project holds a list of friends and one or more receipts.

**Receipts** are broken down item by item. You assign each item's cost across friends however you like (split evenly, one person pays, or any custom split). Tax is applied as a percentage on top of each person's subtotal.

**Validation** runs live on the side — enter the total printed on your physical receipt and the app flags any discrepancy so you catch data-entry mistakes before settling up.

**Export** generates a clean PNG summary of the entire split, ready to share in a group chat.

**Persistence** is local — projects are saved to `localStorage` and survive page refreshes. You can also export any project as a JSON file and re-import it later or share it with someone else.

---

## Quickstart

```bash
# Install dependencies
npm install

# Start dev server
npm run dev
```

Open `http://localhost:5173`. Create a project, add friends, add receipts, fill in amounts. Hit **Split Project!** to export a PNG.

```bash
# Production build
npm run build

# Preview the build
npm run preview
```

No environment variables or backend setup required.

---

## Tech stack

| Layer | Choice |
|---|---|
| Framework | React 19 |
| Language | TypeScript 6 |
| Build tool | Vite 8 |
| Styling | Tailwind CSS v4 |
| Icons | lucide-react |
| Class utilities | clsx + tailwind-merge |
| PNG export | dom-to-image-more |
| ID generation | uuid |

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
    ├── BreakdownTable.tsx    # Main editable split table with tax calculation
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

State lives in `ProjectContext`. All mutations go through `updateProject`, which writes to `localStorage` on every change via a `useEffect`.

### Export flow

`ExportView` is always rendered off-screen (absolute, `left: -9999px`). When the user clicks **Split Project!**, `SplitView` calls `domtoimage.toPng()` on the hidden ref and triggers a browser download. Inline styles are used throughout `ExportView` because CSS classes are not reliably captured by `dom-to-image-more`.

---

Made with &lt;3 in KL by @Hazriq

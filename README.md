# Kanban Tracker

A lightweight board execution app: import a board designed in Kanban
Designer, then run real work on it — move cards between columns, set due
dates and assignees, add/toggle/remove checklist items, see WIP limits and
overdue dates. No setup, no account, no board design (that's Kanban
Designer's job). Client-side only: no backend — state lives in
`localStorage`.

This app has no formal `GOAL.md` yet — see the repo's "Goal needed" issue
(#1) and `GOALS.md` in the `agile-toolkit/.github` meta-repo. Direction for
this first slice came directly from the user in conversation (quoted in
#1): a separate, lightweight execution surface for teams who just want to
run a board someone else designed, as distinct from Kanban Designer (which
designs boards) and domain-specific trackers like Improvement Board or
Change Planner (which keep their own models). A human should still
formalize that into `GOAL.md` — issue #1 carries a proposal.

Part of the [Agile Tools](https://github.com/bthos) suite.

## Stack
React 18 · TypeScript · Vite · Tailwind CSS · react-i18next (EN/ES/BE/RU)

## Dev commands
```bash
npm install     # install dependencies
npm run dev     # start Vite dev server
npm run build   # tsc typecheck + production build
npm run preview # preview the production build locally
npm test        # vitest run
```

## Deploy
GitHub Pages via GitHub Actions on push to `main`.

## localStorage keys

| Key | Shape | Purpose |
|-----|-------|---------|
| `kanban-tracker-boards` | `TrackerBoard[]` | All imported boards, persisted locally. |
| `kanban-tracker:lastSession` | `{ boardName, columnCount, cardCount, boardCount, lastColumnName, lastColumnCount, updatedAt }` | Summary written on every board change — read by the suite Dashboard's "last session" card. |
| `theme` | `"light" \| "dark"` | Shared, suite-wide theme preference (unprefixed key by convention). |
| `agile-toolkit:facilitatorMode` (`sessionStorage`) | `'1' \| '0'` | Facilitator (projector) mode toggle, shared across suite apps in the same tab. |
| `kanban-designer-boards` (read-only) | `KanbanBoard[]` (Kanban Designer's own storage shape) | Read by the "From Kanban Designer" import picker when present on the same origin. Owned and written by Kanban Designer, not Tracker — Tracker never writes this key. |

## Tech notes

- **Board interchange** (`src/boardImport.ts`) — consumes the canonical
  `{schema, version, board}` envelope documented in `BOARD_SCHEMA.md`
  (`agile-toolkit/.github` meta-repo), with a fallback to a bare board
  object for producers that predate the schema. Two import paths, both
  going through the same `unwrapBoardImport()`: a "From Kanban Designer"
  picker reading Designer's `kanban-designer-boards` localStorage key
  directly (read-only; see `## localStorage keys`), and a
  `#board=<base64>` share link / one-shot `?prefill=<json>` query param
  for cross-origin handoff. JSON file upload and paste import were
  removed — the Designer picker replaces them as the primary path, and
  the two apps sharing a GitHub Pages origin in production made
  copy/paste unnecessary for the common case. One consequence worth
  stating: a board exported from Kanban Designer as a downloaded `.json`
  file (e.g. shared over email/Slack, opened in a different browser) can
  no longer be imported — only same-origin or a share link work now. The
  Designer picker itself only works when both apps share an origin (the
  production deploy, `agile-toolkit.github.io/kanban-designer/` +
  `.../kanban-tracker/`) — it's silently absent in local dev (different
  Vite ports = different origins) and on a self-hosted fork on a
  different domain; the share link is the only remaining path in those
  cases. This app is consume-only — it never produces a board export,
  since it doesn't design boards, and never writes to Designer's storage.
- **Tracking model** (`src/tracker.ts`) — pure functions operating on a
  `TrackerBoard`: `moveCard` (stamps `enteredColumnAt` so the card-aging
  badge resets), `updateCardFields` (due date/assignee, `undefined` clears
  a field), `toggleChecklistItem`, `addChecklistItem`, `removeChecklistItem`,
  `daysInColumn`, `isOverdue`, `checklistProgress`, `wipStatus`. All
  unit-tested independent of React.
- **Card movement UI** — a "Move from X to…" `<select>` per card rather
  than pointer drag-and-drop. Deliberate for v1: fully keyboard-accessible,
  no drag-collision tuning to get subtly wrong, and consistent with this
  app's "lightweight" positioning. Worth revisiting if users ask for
  drag-and-drop specifically.
- **No board design** — no add/remove column, no WIP-limit editing, no
  card creation. An imported board's structure is fixed; only its cards
  move and their tracking fields (due date, assignee, checklist) are
  edited — a pencil icon on each card opens an inline due-date/assignee
  editor, and the checklist section supports adding and removing items,
  not just toggling existing ones. Redesigning a board's structure means
  going back to Kanban Designer and re-importing.
- **State** — `useState` in `App.tsx`, persisted to `kanban-tracker-boards`
  on every change (`src/storage.ts`). Multi-board, like Kanban Designer's
  own board list.
- **Shared components** (`AppHeader.tsx`, `ThemeToggle.tsx`,
  `LanguagePicker.tsx`, `ErrorBoundary.tsx`, `FacilitatorToggle.tsx`,
  `useFacilitatorMode.ts`, `icons.tsx`) — copied verbatim from
  `agile-toolkit.github.io/design-system/components/`, per suite convention.
- **`data-accent="teal"`** — set on the app root in `App.tsx`; already
  assigned in the Dashboard's per-app accent table (`agile-toolkit.github.io`
  CLAUDE.md), alongside Sprint Metrics. `tailwind.config.js`'s `brand-*`
  colors are still Tailwind's stock `slate` placeholder though — teal isn't
  wired into the local Tailwind scale yet, only into `data-accent` (which
  drives the shared design-system CSS variables, not `brand-*`).

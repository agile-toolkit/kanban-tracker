# Kanban Tracker

A lightweight board execution app: import a board designed in Kanban
Designer, then run real work on it — no setup, no account. Client-side
only: no backend — state lives in `localStorage` and the URL.

This app has no `GOAL.md` yet — see the repo's open "Goal needed" issue and
`GOALS.md` in the `agile-toolkit/.github` meta-repo. Until a human supplies
one, this repo is scaffold only; see `ROADMAP.md`'s `## Provisional` section
for what's safe to build regardless of the eventual goal.

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

None yet — this app has no features beyond the scaffold placeholder.

## Tech notes

- **Board interchange** — intended to consume boards designed in Kanban
  Designer via the canonical `{schema, version, board}` envelope documented
  in `BOARD_SCHEMA.md` (`agile-toolkit/.github` meta-repo). Not implemented
  yet — this app has no `GOAL.md`, so no execution features have been built.
- **Placeholder brand scale** — `tailwind.config.js`'s `brand-*` colors are
  Tailwind's stock `slate`, used only so the scaffold's shared `.btn-primary`
  etc. classes render something. No `data-accent` has been assigned in the
  suite's per-app accent table yet (`agile-toolkit.github.io`'s CLAUDE.md) —
  pending a human decision alongside the goal.

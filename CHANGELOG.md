# Changelog

All notable changes to Kanban Tracker are documented here.

## Unreleased

## 0.2.0 — MVP: import and run a board (2026-09-04)

- **feat**: import a board via file upload, paste, a `#board=` share link,
  or a `?prefill=` handoff — all through the canonical `BOARD_SCHEMA.md`
  envelope (`src/boardImport.ts`), with a fallback to bare board objects
  for producers that predate it.
- **feat**: run the board — move cards between columns (`src/tracker.ts`),
  toggle checklist items, see WIP-limit warnings and overdue due-date
  highlighting, card-aging badges. Multi-board list with delete.
- **feat**: full EN/ES/BE/RU translation, dark mode, Facilitator Mode,
  shared `AppHeader`/`ErrorBoundary` copied from the design system.
- **context**: built directly on direction the user gave in conversation
  (quoted in issue #1), not from a formal `GOAL.md` — see that issue for
  a proposed goal a human should still bless. Deliberately no board design
  (add/remove column, WIP-limit editing) — that's Kanban Designer's job.

## 0.1.0 — Scaffold (2026-09-04)

- **chore**: initial scaffold — Vite + React 18 + TypeScript + Tailwind CSS,
  react-i18next with empty EN/ES/BE/RU locale stubs, GitHub Pages deploy
  workflow, design-system `tokens.css` copied in. Placeholder home screen
  only; no features, since this app has no `GOAL.md` yet.

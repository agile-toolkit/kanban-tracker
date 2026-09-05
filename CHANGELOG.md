# Changelog

All notable changes to Kanban Tracker are documented here.

## Unreleased

## 0.3.0 — Full card tracking CRUD (2026-09-05)

- **feat**: inline due-date/assignee editing — a pencil icon on each card
  opens a `date` input and a free-text assignee input, saved via the new
  `updateCardFields()` (`src/tracker.ts`); `undefined` clears a field.
- **feat**: checklist add/remove — the checklist section is now always
  visible (not gated behind having existing items), with an "Add an
  item…" input (Enter or a `+` button) calling `addChecklistItem()`, and a
  hover-revealed remove button per item calling `removeChecklistItem()`.
  Toggling existing items is unchanged.
- **context**: closes the gap between what Tracker could do and what Kanban
  Designer's Track mode offered, ahead of Track mode being removed from
  Designer entirely — Tracker is now the suite's one execution surface.

## 0.2.2 — Import boards directly from Kanban Designer (2026-09-04)

- **feat**: "From Kanban Designer" picker (`src/designerImport.ts`) reads
  Designer's own `kanban-designer-boards` localStorage key directly on the
  shared-origin production deploy and lists its boards for one-click
  import through the existing `unwrapBoardImport()` normalization —
  read-only, never writes to Designer's storage.
- **removed**: JSON file-upload and paste-JSON import
  (`ImportPanel.tsx`'s upload button/textarea, `boardImport.ts`'s
  `parseBoardFile()`) — decided at UAT as no longer needed now that the
  Designer picker covers the common same-browser case. A board exported
  as a standalone `.json` file (e.g. emailed) no longer has an import
  path; the `#board=` share link and `?prefill=` handoff param are
  unaffected and still work.
- **feat**: new empty state in `ImportPanel` ("No boards yet — design one
  in Kanban Designer") when no Designer boards are found (absent key,
  empty array, different origin, or local dev where Tracker/Designer run
  on different Vite ports) — replaces the old always-present upload/paste
  UI as the panel's only other state.

## 0.2.1 — Fix: apply the assigned accent (2026-09-04)

- **fix**: set `data-accent="teal"` on the app root — the Dashboard's own
  per-app accent table already assigned this app teal (alongside Sprint
  Metrics), but it was never applied since there was no real UI to carry it
  until v0.2.0 shipped. Missed in that release; caught immediately after
  while wiring up the Dashboard card.

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

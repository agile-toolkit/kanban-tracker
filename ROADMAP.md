# Kanban Tracker — Roadmap

No formal `GOAL.md` yet — see the open "Goal needed" issue (#1), which
carries a proposed goal drafted from direction the user gave directly in
conversation. This file records what shipped on that direction; a human
should still formalize `GOAL.md` before the next epic starts from scratch.

## Current epic
None — idle after the MVP below shipped in one pass.

## Recently shipped
**MVP: import and run a board** (2026-09-04) — see `## Shipped`. First real
feature slice, built directly on the user's own stated direction (quoted in
issue #1) rather than an epic-issue breakdown, since no `GOAL.md` exists yet
to derive epics from. Import a board (file, paste, or a `#board=`/`?prefill=`
link) via the canonical `BOARD_SCHEMA.md` envelope, then track it: move
cards between columns, check off checklist items, see WIP-limit and overdue
warnings, card-aging badges. No board design — that stays Kanban Designer's
job.

## Next (not yet epic'd — needs GOAL.md first)

Candidates surfaced while building the MVP, deliberately not built without
a goal to justify them:
- Drag-and-drop card movement (current v1 uses a "Move to" select instead —
  see README `## Tech notes` for why).
- Swim lanes and sub-columns (the type model already carries them from
  `BOARD_SCHEMA.md`, but the tracker view doesn't render them yet — no
  sample board in testing has used either).
- A "Send to Kanban Tracker" link from Kanban Designer, now that this app
  can receive one via `?prefill=`.
- Team Identity assignee picker (Kanban Designer's Track mode has this;
  worth matching if assignee becomes a heavily-used field here).

## Polish backlog
No small un-filed items queued.

## Shipped
- ~~MVP: import a board (file/paste/`#board=`/`?prefill=`) and run it —
  move cards between columns, checklist toggling, WIP-limit and overdue
  warnings, card-aging badges, multi-board list, EN/ES/BE/RU~~
- ~~Scaffold — Vite + React 18 + TypeScript + Tailwind CSS + react-i18next
  (EN/ES/BE/RU stubs), GitHub Pages deploy workflow, design-system tokens~~

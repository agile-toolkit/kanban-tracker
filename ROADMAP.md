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
- Team Identity assignee picker (Kanban Designer's Track mode has this;
  worth matching if assignee becomes a heavily-used field here).

## Polish backlog
No small un-filed items queued.

## Shipped
- ~~localStorage board picker: "From Kanban Designer" import reading
  Designer's `kanban-designer-boards` key directly on shared-origin
  deploys; JSON file/paste import removed, `#board=`/`?prefill=` link
  import kept~~ (2026-09-04) — superseded the earlier "Send to Kanban
  Tracker" link candidate (was listed above): a Designer-initiated link
  would need a round-trip through Designer's UI (open Designer, click
  send, land back in Tracker); since both apps already share a GitHub
  Pages origin in production, Tracker can just read Designer's stored
  boards directly with one click, no link or Designer-side change
  required. JSON file/paste import was removed in the same pass, not kept
  as a fallback — a Designer board shared outside the browser (e.g. an
  emailed export) no longer has an import path; the `#board=`/`?prefill=`
  link path is the one exception that stays, for cross-origin/self-hosted
  cases where the localStorage read doesn't apply.
- ~~MVP: import a board (file/paste/`#board=`/`?prefill=`) and run it —
  move cards between columns, checklist toggling, WIP-limit and overdue
  warnings, card-aging badges, multi-board list, EN/ES/BE/RU~~
- ~~Scaffold — Vite + React 18 + TypeScript + Tailwind CSS + react-i18next
  (EN/ES/BE/RU stubs), GitHub Pages deploy workflow, design-system tokens~~

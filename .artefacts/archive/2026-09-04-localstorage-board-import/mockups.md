# localstorage-board-import — Mockups

Interactive mockup (real Tailwind, both themes): **https://claude.ai/code/artifact/f848f9b0-5785-4157-9f4c-43480235bf7c**

Built against the app's own design tokens (`src/tokens.css`, `.card`/
`btn-secondary` from `src/index.css`, `KanbanIcon`'s current slate
placeholder color) rather than a fresh palette, so it should read as
"this app, slightly changed" rather than a new visual system.

**Revision note (2026-09-04):** the first pass of this mockup kept
file/paste JSON import as a collapsible fallback. The user confirmed at
UAT — "Import from JSON not required" — that it should be removed
entirely, not demoted. The mockup, spec, and ux-design.md were all updated
to match; the artifact link above is the current (second) revision.

## States implemented

1. **Designer boards present** — the picker list, full stop. No upload
   button, no paste textarea, no toggle — that UI no longer exists.
2. **No Designer boards** — a new empty state (AC8): icon, "No boards
   yet", one line pointing at Kanban Designer, and the "Open Kanban
   Designer" link/button as the only action. Styled after `BoardHome`'s
   existing zero-boards pattern rather than a new empty-state style.

Not separately mocked (covered by the states matrix in `ux-design.md`,
no new visual needed): loading (N/A — synchronous read), error (no error
state remains in this panel — nothing left for a user to type wrong),
success (board appears in "Your boards" above the panel, unchanged
pattern), retry (same row, clickable again).

## ASCII fallback (same layout, for the record without opening the link)

```
┌─ Import a board ─────────────┐   ┌─ Import a board ─────────────┐
│ From Kanban Designer         │   │                               │
│ [▦ Sprint 14 Board  4·12·2h→]│   │            ▦                  │
│ [▦ Onboarding Flow  3·7·3d →]│   │        No boards yet          │
│                               │   │  Design one in Kanban Designer│
└───────────────────────────────┘   │  [ Open Kanban Designer ]    │
                                     └───────────────────────────────┘
```

## ACs covered by these mockups

AC1 (list with name/columns/cards/updated), AC3+AC8 (empty state,
state 2), AC4 (upload/paste UI confirmed removed), AC7 (mockup copy is
EN; real i18n keys are a Cmok build task). AC2/AC5/AC6 are import-behavior,
not visual — nothing to mock.

## Consequence flagged, not hidden

With file/paste gone, a Kanban Designer board downloaded as a `.json`
file and shared outside the browser (email, Slack, a different device
with no localStorage overlap) has **no way into Tracker** anymore. Only
same-origin (this picker) or a share link (`#board=`/`?prefill=`, kept —
not read as "JSON import" since there's no file/textarea involved) still
work. Called out in the mockup itself so it's an accepted tradeoff, not a
silently dropped capability.

## Still open for the user

1. Should the picker also read Designer's legacy singular
   `kanban-designer-board` key, or is the current plural key (which
   Designer itself migrates into on load) always sufficient? Leaning
   "plural is enough" unless told otherwise — this is the only remaining
   open question before Laznik.

---

**UAT: file/paste-removal decision applied. Review the updated mockup
above — approve to proceed to Laznik (architecture + tests), or flag
anything else that should change first.**

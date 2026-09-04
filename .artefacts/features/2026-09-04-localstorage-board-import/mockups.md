# localstorage-board-import — Mockups

Interactive mockup (real Tailwind, both themes, State 2's disclosure
actually opens/closes): **https://claude.ai/code/artifact/f848f9b0-5785-4157-9f4c-43480235bf7c**

Built against the app's own design tokens (`src/tokens.css`, `.card`/
`btn-primary`/`btn-secondary` from `src/index.css`, `KanbanIcon`'s current
slate placeholder color) rather than a fresh palette, so it should read as
"this app, slightly changed" rather than a new visual system.

## States implemented

1. **Default** — Designer boards present, picker list expanded, file/paste
   collapsed under "Other ways to import" (closed).
2. **Disclosure open** — same panel, "Other ways to import" expanded via a
   real `<details>/<summary>` (not a static screenshot of the open state —
   click it in the artifact).
3. **No Designer boards** — today's `ImportPanel` unchanged, byte-for-byte,
   for side-by-side comparison with the two states above.

Not separately mocked (covered by the states matrix in `ux-design.md`,
no new visual needed): loading (N/A — synchronous read), error (existing
red `import.error` text, unchanged), success (board appears in "Your
boards" above the panel, unchanged pattern), retry (same row, clickable
again).

## ASCII fallback (same layout, for the record without opening the link)

```
┌─ Import a board ─────────────────────────────┐
│ From Kanban Designer                          │
│  [▦ Sprint 14 Board       4 col · 12 cd · 2h→]│
│  [▦ Onboarding Flow       3 col · 7 cd · 3d  →]│
│ ▸ Other ways to import                        │
│ 🔗 Design a board first? Open Kanban Designer │
└────────────────────────────────────────────────┘
```

## ACs covered by these mockups

AC1 (list with name/columns/cards/updated), AC3 (clean absent state, state
3), AC4 (file/paste still present and functional, state 2), AC7 (mockup
copy is EN; real i18n keys are a Cmok build task, not a mockup concern).
AC2/AC5/AC6 are import-behavior, not visual — nothing to mock.

## Open for the user at UAT

Both carried over from the spec/UX, unresolved by design alone:

1. **Keep JSON file/paste as a permanent fallback (as mocked), or remove
   it once this ships?** Recommendation on record (spec, deferred
   decision): keep it — cross-device import (Designer on one machine,
   Tracker on another) has no other path today.
2. Should Tracker also read Designer's legacy singular
   `kanban-designer-board` key, or is the plural key (which Designer
   itself migrates into on load) always sufficient? Leaning "plural is
   enough" but flagging since it's a real edge case, not just a naming
   detail.

---

**UAT: Review the mockup at the link above (and/or the ASCII fallback).
Approve to proceed to Laznik (architecture + tests). If either open
question above should go a different way than the recommendation, say so
now — it changes what Laznik specs tests against.**

# localstorage-board-import — Spec

## Summary

Kanban Tracker and Kanban Designer deploy as GitHub Pages project sites
under the same origin (`agile-toolkit.github.io/kanban-designer/` and
`.../kanban-tracker/`), so in production they already share one
`localStorage`. Today Tracker ignores that and asks the user to hand it a
board via JSON file upload, paste, or a link — even when Designer's boards
are sitting right there in the same browser. This feature adds a "Pick a
board from Kanban Designer" flow that reads Designer's `kanban-designer-boards`
key directly and lets the user import with one click, no copy/paste.

**Decided at UAT (2026-09-04): the manual JSON file-upload and paste-JSON
UI is removed, not kept as a fallback.** The Designer picker becomes
Tracker's only *UI-driven* import path. Link-based import (`#board=` share
link, `?prefill=` handoff param) stays — those aren't "JSON import" from a
user's point of view (no file, no textarea, nothing to copy/paste by
hand); they're the mechanism a "no shared origin" scenario (cross-device,
a self-hosted fork) would need to keep working at all, and removing them
isn't what was asked. See Open Questions if that reading needs correcting.

## Acceptance Criteria

- [ ] AC1 — When `kanban-designer-boards` is present in `localStorage`
      and non-empty, the import screen shows a "From Kanban Designer" list:
      each Designer board's name, column count, and card count, most
      recently updated first.
- [ ] AC2 — Picking a board from that list imports it through the existing
      `unwrapBoardImport()` normalization (bare `KanbanBoard` shape — this
      is exactly what Designer's stored array already is) and adds it to
      Tracker's board list, same as any other import path today. It does
      not affect Designer's own copy or storage.
- [ ] AC3 — When `kanban-designer-boards` is absent or an empty array
      (nothing designed yet, different browser/device, local dev, a
      self-hosted fork not sharing the origin), the picker section is
      hidden or shows an empty/explanatory state — never an error.
- [ ] AC4 — The JSON file-upload button and paste-JSON textarea are
      removed from `ImportPanel`. The `#board=` and `?prefill=` link
      imports keep working unchanged (they're not user-facing "JSON
      import" — no file, no textarea).
- [ ] AC5 — Re-importing the same Designer board (picked twice, or once
      via picker and once via a stale share link) creates a second
      independent `TrackerBoard` — consistent with today's behavior for
      re-importing the same JSON twice. No dedup/merge in this slice.
- [ ] AC6 — Reading `kanban-designer-boards` never writes to it. Tracker
      remains consume-only with respect to Designer's data.
- [ ] AC7 — i18n: new picker UI copy ships in all four locales (EN/ES/BE/RU),
      matching the rest of the app.
- [ ] AC8 — When `kanban-designer-boards` is absent/empty (AC3) **and**
      the file/paste UI is gone, `ImportPanel` shows a clear explanatory
      empty state ("Design a board in Kanban Designer, then come back to
      track it here" or similar) with the link out to Kanban Designer —
      not a blank panel with nothing to do. This is a new, real state that
      didn't exist before (previously the panel always had file/paste to
      fall back to).

## Open Questions

- [x] ~~Keep JSON file/paste import, or remove it now that the picker
      exists?~~ **Resolved at UAT (2026-09-04): remove it.** User
      confirmed: "Import from JSON not required." Link-based import
      (`#board=`, `?prefill=`) is kept — not read as covered by that
      answer, since it's not a manual-JSON experience. Flagging this
      reading explicitly in case it needs correcting.
- [ ] Should the picker also read `kanban-designer-board` (singular,
      `LEGACY_KEY` in Designer's `App.tsx`), or is that Designer's own
      migration concern that always resolves into `kanban-designer-boards`
      before a user could see it? (Designer migrates it into the plural
      key on its own load — current read: Tracker only ever needs to read
      the plural key. Flagging in case that migration assumption is wrong.)
- [ ] Multiple Designer boards with the same name — show a disambiguator
      (e.g. last-updated date) in the picker list, or is name-only enough
      for v1?
- [ ] Should the picker auto-open (e.g. as the default import tab) when
      Designer boards are present, or stay a secondary option alongside
      the existing import methods even then? Affects Lojma's states
      matrix.

## Deferred Decisions

- **JSON file/paste import: removed.** Decided at UAT — see Open
  Questions. Consequence worth stating plainly since it's a real
  capability loss, not just a UI simplification: a board exported from
  Kanban Designer as a downloaded `.json` file (Designer's own
  `exportJSON`, e.g. shared by email/Slack rather than opened in the same
  browser) can no longer be brought into Tracker at all — no UI path
  accepts it. Only same-origin (localStorage picker) or a share link
  (`#board=`/`?prefill=`) get a board in. **Cmok: remove the upload
  button, the paste textarea, and their handlers (`handleFile`/
  `tryImport`) from `ImportPanel.tsx`. Once that's gone,
  `parseBoardFile()` in `boardImport.ts` has no remaining caller in app
  code — remove it too (and its direct unit tests) rather than leave it
  dead; `parseBoardFromHash`/`parsePrefillBoard` stay, they're the link
  paths and still call `unwrapBoardImport` directly.**
- **No live sync.** Import stays a one-time copy into `kanban-tracker-boards`,
  same as today — not a live view into Designer's data. Revisit only if a
  future request specifically asks for two-way or live-updating boards;
  out of scope here and consistent with Tracker's existing "no board
  design, re-import to pick up structure changes" model (README `## Tech
  notes`).
- **No dedup against previously-imported Designer boards.** Re-picking a
  board the user already imported just creates another `TrackerBoard`,
  same as re-uploading the same JSON file twice today. Revisit only if
  users report accidental duplicate imports as an actual problem.

## Architecture & Test Implications

- **New read, no new write.** Add a `loadDesignerBoards()` (or similarly
  named) helper reading `localStorage.getItem('kanban-designer-boards')`,
  guarded with the same try/catch + shape-check pattern already used in
  `src/storage.ts`'s `loadBoards()` (wrong shape or parse failure → `[]`,
  never throw). The constant `'kanban-designer-boards'` is owned by
  Designer's `App.tsx` (`BOARDS_KEY`) — it isn't exported from a shared
  module today, so Tracker will need to hardcode/duplicate that string
  with a comment noting the coupling (same pattern already used for the
  `#board=` link format and `theme`/`agile-toolkit:facilitatorMode` keys
  shared by convention across the suite, per Tracker's README
  `## localStorage keys` table).
- **Reuses `unwrapBoardImport()` unchanged.** Designer's stored boards are
  a bare `KanbanBoard[]` (confirmed: `kanban-designer/src/App.tsx`
  `saveBoards()` writes `JSON.stringify(boards)` with no envelope) — this
  is exactly the "bare shape" `unwrapBoardImport()` already normalizes, so
  each entry can be passed through as-is. No new parsing logic needed,
  only a new UI source.
  - Track-mode fields (`dueDate`, `assignee`, `enteredColumnAt`,
    `checklist`) come through if the Designer board carries them — same
    as today's JSON import; nothing new to test there beyond an existing
    fixture case.
- **`id` collisions.** `unwrapBoardImport()` keeps the source board's `id`
  when present rather than always minting a fresh one. Since Designer and
  Tracker boards are stored under different keys, an id collision between
  a Designer board and an unrelated Tracker board is cosmetically odd but
  not a data-corruption risk — worth one test case confirming two
  `TrackerBoard`s with the same `id` (e.g. picked twice) don't clobber
  each other in `kanban-tracker-boards` (list, not keyed by id).
- **New tests needed:**
  - `loadDesignerBoards()` unit tests: absent key → `[]`; empty array →
    `[]`; malformed JSON → `[]` (no throw); well-formed array → parsed
    boards with expected summary fields (name/columns/cards count) for
    the picker list.
  - Picker → import integration test: selecting a Designer board produces
    a `TrackerBoard` via the same path as file import (can assert against
    `unwrapBoardImport` output directly, avoiding duplicate test setup).
  - No change to existing `boardImport.ts` tests; they should keep passing
    unmodified.
- **No new dependency on Designer's app.** This only reads a documented
  (in Designer's own README/App.tsx) `localStorage` key at Designer's
  known shape; it does not import any Designer source code or require
  Designer to be modified. Cross-app coupling is data-shape only, same
  contract already formalized as the "bare board" fallback in
  `agile-toolkit/.github`'s `BOARD_SCHEMA.md`.
- **Same-origin dependency is silent in dev.** Locally, Tracker and
  Designer run on different Vite dev ports (different origins), so
  `kanban-designer-boards` will never be visible during local dev even
  with both apps running — the empty state (AC3/AC8) is exactly what a
  developer will see locally, which is by design, not a bug to chase.
  Worth a one-line comment in the code so this isn't mistaken for broken
  local dev. Same caveat applies more sharply now than in the original
  draft: with file/paste gone, a local dev environment has **no working
  UI import path at all** except manually driving a `#board=`/`?prefill=`
  URL — worth a dev-only note (e.g. in the empty state or a code comment)
  so this doesn't read as a regression during development.

## Documentation Implications

- **Tracker README `## localStorage keys` table** — add a row (or a note
  under `## Tech notes`) documenting that Tracker *reads* Designer's
  `kanban-designer-boards` key (read-only, cross-app, relies on shared
  GitHub Pages origin) in addition to its own keys.
- **Tracker README `## Tech notes` → Board interchange section** — rewrite:
  three import paths become two — the new Designer-picker (localStorage,
  same-origin) and the existing link-based imports (`#board=`,
  `?prefill=`) — and explicitly note that file/paste JSON import was
  **removed** (not just superseded), since a Designer board exported and
  shared outside the browser (e.g. emailed `.json`) now has no way in.
  Note the same-origin dependency too (won't work across different
  deploys/origins, e.g. a self-hosted fork on a different domain, or local
  dev).
- **`agile-toolkit/.github` `BOARD_SCHEMA.md` "Adopters" section** — update
  the stale "Kanban Tracker: ... Not yet implemented" line to describe the
  localStorage path (not JSON import — that's gone). Out of this repo's
  scope to edit directly from here, but flag for Zlydni/Veles to raise or
  PR into that meta-repo once this ships.
- **ROADMAP.md** — this feature supersedes the "Next" candidate "A 'Send
  to Kanban Tracker' link from Kanban Designer" (link-push approach); note
  in the shipped-entry that the localStorage-picker approach was chosen
  instead of a Designer-initiated link, and why (no round-trip through
  Designer's UI needed — Tracker can just look).

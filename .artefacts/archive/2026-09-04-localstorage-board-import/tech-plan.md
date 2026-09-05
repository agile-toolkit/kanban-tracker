# localstorage-board-import — Tech Plan

## Architecture

New module: **`src/designerImport.ts`** — the only new file. Everything
else is a deletion/simplification of existing code, not new surface area.

```ts
// src/designerImport.ts
export interface DesignerBoardEntry {
  id: string
  name: string
  columns: { cards: unknown[] }[]   // only shape needed to compute counts
  updatedAt?: number
}

const DESIGNER_BOARDS_KEY = 'kanban-designer-boards'  // owned by Kanban
// Designer's App.tsx (BOARDS_KEY there); not exported from a shared
// module today, so this string is duplicated by convention — same
// pattern already used for the #board= link format and the
// theme/agile-toolkit:facilitatorMode keys (see README `## localStorage
// keys`). If Designer ever renames this key, both apps need updating by
// hand; worth a comment pointing at the coupling, not worth a shared
// package for one string.

export function loadDesignerBoards(): DesignerBoardEntry[] {
  try {
    const raw = localStorage.getItem(DESIGNER_BOARDS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    if (!Array.isArray(parsed)) return []
    return parsed
      .filter((b): b is DesignerBoardEntry =>
        b !== null && typeof b === 'object' && Array.isArray((b as DesignerBoardEntry).columns))
      .sort((a, b) => (b.updatedAt ?? 0) - (a.updatedAt ?? 0))
  } catch {
    return []
  }
}
```

Deliberately mirrors `src/storage.ts`'s `loadBoards()` guard pattern
exactly (try/catch, `Array.isArray` shape check, empty array on anything
malformed, never throw) — same defensive posture, new key.

**No new `import` call site.** The picker's click handler passes the
already-in-memory `DesignerBoardEntry` straight into the existing
`unwrapBoardImport()` (`boardImport.ts`) — no second localStorage read by
id, no new normalization path. `unwrapBoardImport()` already accepts a
bare board-shaped object (`Array.isArray(c.columns)` is its only hard
requirement), which is exactly what `DesignerBoardEntry` is. This is why
no `DesignerBoardSummary`-vs-`raw` split is needed: one shape serves both
display (column/card counts computed inline, same one-liner `BoardHome.tsx`
already uses for Tracker's own board list) and import.

```
ImportPanel.tsx
  ├─ loadDesignerBoards() ──► list rendered (if length > 0)
  │                             row onClick → unwrapBoardImport(entry) → onImport(board)
  └─ (else) ──► empty state, "Open Kanban Designer" link only
```

## Changes to existing files (Cmok's build step)

- **`src/components/ImportPanel.tsx`** — remove `fileInputRef`,
  `pasteText` state, `handleFile`, `tryImport`, the upload `<label>`, the
  paste `<textarea>`/button, and the `error` state (no more error state —
  see ux-design.md's states matrix, there's nothing left for a user to
  get wrong in this panel). Add: `loadDesignerBoards()` call (can be
  computed at render time — it's synchronous and cheap; no `useEffect`
  needed unless the list should react to a same-tab Designer write, which
  is out of scope per spec's "no live sync" deferred decision — a
  page load/remount is when it re-reads, same freshness model as
  `BoardHome`'s own board list), the row list, and the new empty state.
- **`src/boardImport.ts`** — remove `parseBoardFile()`. Grep confirms its
  only callers are `ImportPanel.tsx`'s `handleFile`/`tryImport` (both
  removed above) and its own tests in `boardImport.test.ts`. Keep
  `parseBoardFromHash`/`parsePrefillBoard` and `unwrapBoardImport`/
  `BOARD_SCHEMA` unchanged — still used by link-based import.
- **`src/boardImport.test.ts`** — remove the `describe('parseBoardFile', ...)`
  block and its import from the top-of-file destructure, in the **same
  commit** that removes `parseBoardFile()` from source (keep source and
  test deletions atomic — don't leave orphaned tests referencing a
  deleted export, and don't delete the tests first in a separate commit
  either). All other existing tests in this file are untouched.

## i18n

Checked `src/i18n/en.json`'s `import` section against the new design:

- **Remove** (no longer rendered): `import.uploadButton`,
  `import.pasteLabel`, `import.pastePlaceholder`, `import.pasteButton`,
  `import.error`.
- **Keep unchanged**: `import.designHint`, `import.designLink` — already
  exactly the copy the new empty state needs ("Don't have a board yet?" /
  "Design one in Kanban Designer"), no new strings required for that
  state.
- **Update**: `import.title` ("Import a board") stays; `import.explainer`
  currently reads "Paste or upload a board exported from Kanban Designer
  (JSON), or open a Kanban Tracker share link — either works." — this is
  now inaccurate (no more paste/upload) and needs new copy, e.g. "Pick a
  board designed in Kanban Designer." (matches the mockup's copy from
  Cmok's mockups.md).
- **Add** (new): one key for the Designer-board row's accessible
  label/summary line — e.g. `import.designerBoardMeta` with an i18next
  interpolation for columns/cards/updated (mirroring `home.boardMeta`'s
  existing `{ columns, cards }` interpolation pattern in `BoardHome.tsx` —
  reuse that exact key/pattern rather than inventing a new one if the
  wording can match; add a relative-time formatter for "updated Xh/d ago"
  if one doesn't already exist in this repo — check `src/` for a
  `formatRelativeTime`-style helper before writing a new one), plus
  `import.designerBoardsHeading` ("From Kanban Designer") if the section
  keeps a visible heading (mockup shows one), and empty-state heading/body
  — e.g. `import.emptyHeading` ("No boards yet") /
  `import.emptySubtitle` ("Design one in Kanban Designer, then come back
  here to track it.") — check these don't collide with `home.emptyHeading`/
  `home.emptySubtitle` (`BoardHome`'s own zero-Tracker-boards state,
  different screen/condition) before reusing vs. adding new keys; reuse
  the `home.*` keys directly if the copy is identical, to avoid
  duplicate strings drifting apart later — otherwise add
  `import.emptyHeading`/`import.emptySubtitle` as distinct keys.

`locales.test.ts` only checks **top-level section parity** (`import`,
`board`, etc. exist in all 4 locale files), not nested-key parity — so it
won't catch a missing nested key by itself. Cmok must still add the
matching nested keys to `es.json`/`be.json`/`ru.json`, not just `en.json`,
for the feature to actually work in all four locales (spec AC7).

## UX states covered (from ux-design.md)

| State | Covered by |
|---|---|
| Designer boards present | `designerImport.test.ts` (data), manual/Cmok visual check against mockup |
| Empty (absent/malformed key) | `designerImport.test.ts` (`loadDesignerBoards()` → `[]`) |
| Loading | N/A — synchronous read, no test needed (documented in ux-design.md) |
| Error | N/A — no error state remains in this panel (file/paste removed); `loadDesignerBoards()` itself never throws (tested) |
| Success (import) | Integration test below |
| Retry (re-pick same board) | Integration test below (two `unwrapBoardImport()` calls on the same entry produce independent `TrackerBoard`s — already true of `unwrapBoardImport`, just needs a test asserting it for this call site too) |

Accessibility assertions (from ux-design.md's checklist) are Cmok's to
satisfy structurally (real `<button>` rows, accessible names, natural
focus order) — not something `vitest`/jsdom unit tests in this repo
currently assert against (no existing a11y-assertion test pattern found
in this repo to extend); flagging as a **known gap**, not silently
dropped: manual verification against the mockup's checklist is the
coverage for this slice, consistent with how this repo has tested
accessibility so far (i.e. not at all, via automated tests).

## Test files

- **New: `src/designerImport.test.ts`** — written below as `it.todo(...)`
  placeholders naming every case, **not** importing the not-yet-created
  `./designerImport` module. This keeps `npm test` green right now (Bahnik's
  test gate here is reviewing whether the *planned* coverage is sound,
  not requiring implementation to exist yet — there is no code to test
  yet, per Laznik's own guardrail against implementing). Cmok converts
  each `.todo` to a real `it` with a real import as part of the build,
  and must not remove or weaken any of the named cases without a reason
  noted in their handoff.
- **Modified (by Cmok, not here): `src/boardImport.test.ts`** — see above,
  removed in the same commit as `parseBoardFile()`.

Known gap, stated plainly: because the new tests are `.todo` rather than
real assertions, this Laznik pass has **zero executable coverage** of the
new behavior yet — that's expected for a pre-implementation architecture
pass, not a shortfall to wave past. Bahnik's test gate here should judge
whether the *planned* cases below are the right ones, not whether they
pass (they can't yet). The real coverage bar is the **second** Bahnik
gate, after Cmok's build, where these must all be real and green.

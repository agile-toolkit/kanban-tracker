# localstorage-board-import — Doc Plan (prep only, not yet applied)

Status: Cmok mockups done, paused for User UAT. No app code exists yet.
This file holds ready-to-paste draft diffs for `README.md` and
`ROADMAP.md` so the post-build Veles pass can apply them with minimal
editing rather than re-deriving them from the spec. **Do not apply these
to README.md/ROADMAP.md until the feature actually ships** (real code
merged + Bahnik code QA pass) — documenting unshipped behavior as current
would be inaccurate.

Source: spec.md `## Documentation Implications` (lines 146-166).

---

## 1. README.md — `## localStorage keys` table

Add a new row (Tracker's own keys stay as-is; this is a read of another
app's key, so phrase it as read-only/cross-app to match the spec's
framing):

```markdown
| `kanban-designer-boards` (read-only) | `KanbanBoard[]` (Kanban Designer's own storage shape) | Read by the "From Kanban Designer" import picker when present on the same origin. Owned and written by Kanban Designer, not Tracker — Tracker never writes this key. |
```

Placement: after the existing `agile-toolkit:facilitatorMode` row (keeps
Tracker's own keys together, cross-app read last).

---

## 2. README.md — `## Tech notes` → Board interchange paragraph

Current first bullet (line 46-54) ends with:

> Three import paths, all going through the same `unwrapBoardImport()`: a
> pasted/uploaded JSON file, a `#board=<base64>` share link (same format
> Kanban Designer uses for its own links), and a one-shot
> `?prefill=<json>` query param for a future cross-app handoff link. This
> app is consume-only — it never produces a board export, since it
> doesn't design boards.

Draft replacement (four sources instead of three, plus the new
same-origin caveat):

```markdown
- **Board interchange** (`src/boardImport.ts`) — consumes the canonical
  `{schema, version, board}` envelope documented in `BOARD_SCHEMA.md`
  (`agile-toolkit/.github` meta-repo), with a fallback to a bare board
  object for producers that predate the schema. Four import paths, all
  going through the same `unwrapBoardImport()`: a "From Kanban Designer"
  picker reading Designer's `kanban-designer-boards` localStorage key
  directly (read-only; see `## localStorage keys`), a pasted/uploaded
  JSON file, a `#board=<base64>` share link (same format Kanban Designer
  uses for its own links), and a one-shot `?prefill=<json>` query param
  for a future cross-app handoff link. The Designer picker only works
  when both apps share an origin (e.g. the production GitHub Pages
  deploy, `agile-toolkit.github.io/kanban-designer/` +
  `.../kanban-tracker/`) — it's silently absent in local dev (different
  Vite ports = different origins) and on a self-hosted fork on a
  different domain; file/paste and link import remain the fallback for
  those cases. This app is consume-only — it never produces a board
  export, since it doesn't design boards, and never writes to Designer's
  storage.
```

---

## 3. ROADMAP.md — shipped-entry note

In `## Next`, remove (once shipped) the candidate:

```markdown
- A "Send to Kanban Tracker" link from Kanban Designer, now that this app
  can receive one via `?prefill=`.
```

Add to `## Shipped` (or a new entry under `## Recently shipped`, matching
the existing MVP entry's style):

```markdown
- ~~localStorage board picker: "From Kanban Designer" import reading
  Designer's `kanban-designer-boards` key directly on shared-origin
  deploys, alongside existing file/paste/`#board=`/`?prefill=` import~~
```

And a short explanatory note (next to or below the shipped line, matching
how the MVP entry explains itself):

```markdown
This superseded the earlier "Send to Kanban Tracker" link candidate
(above) — a Designer-initiated link would need a round-trip through
Designer's UI (open Designer, click send, land back in Tracker); since
both apps already share a GitHub Pages origin in production, Tracker can
just read Designer's stored boards directly with one click, no link or
Designer-side change required. The `?prefill=` link path stays for
cross-origin/self-hosted cases where the localStorage read doesn't apply.
```

---

## Not included here (out of this repo's scope)

- `agile-toolkit/.github` `BOARD_SCHEMA.md` "Adopters" section stale line
  — flagged in spec.md, needs a PR into that separate meta-repo once this
  ships. Not drafted here since it's a different repo's file.

## When to apply

After Cmok's real build + Bahnik's code QA pass (the pipeline's second
Cmok → Veles step), re-open this file, confirm the diffs still match what
was actually built (row/paragraph wording may need small edits if
implementation details shifted at UAT — e.g. if file/paste import is
fully removed rather than kept as fallback, or if the legacy singular-key
question resolved differently), then apply directly to README.md and
ROADMAP.md.

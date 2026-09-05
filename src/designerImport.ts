/**
 * Reads Kanban Designer's own board list directly from `localStorage`.
 * In production, Tracker and Designer deploy as sibling GitHub Pages
 * project sites under the same origin
 * (`agile-toolkit.github.io/kanban-designer/` + `.../kanban-tracker/`), so
 * they already share one `localStorage` — this lets the "From Kanban
 * Designer" picker in `ImportPanel.tsx` list Designer's boards without any
 * file/paste round-trip.
 *
 * Read-only: this module never calls `localStorage.setItem` on Designer's
 * key. Tracker remains consume-only with respect to Designer's data.
 */

/**
 * Shape of a board as Kanban Designer stores it
 * (`kanban-designer/src/App.tsx`'s `saveBoards()` writes
 * `JSON.stringify(boards)` with no envelope — a bare `KanbanBoard[]`).
 * Only the fields this picker needs (to render a row and to compute
 * column/card counts) are typed here, not Designer's full board shape —
 * the entry is passed through to `unwrapBoardImport()` as-is for the
 * actual import, which only cares that `columns` is an array.
 */
export interface DesignerBoardEntry {
  id: string
  name: string
  columns: { cards: unknown[] }[]
  updatedAt?: number
}

// Owned by Kanban Designer's App.tsx (`BOARDS_KEY` there); not exported
// from a shared module today, so this string is duplicated by convention —
// same pattern already used for the `#board=` link format and the
// `theme`/`agile-toolkit:facilitatorMode` keys shared across the suite
// (see README `## localStorage keys`). If Designer ever renames this key,
// both apps need updating by hand.
const DESIGNER_BOARDS_KEY = 'kanban-designer-boards'

/**
 * Guarded the same way `storage.ts`'s `loadBoards()` guards Tracker's own
 * key: a key of the wrong shape, or missing/malformed JSON, falls back to
 * `[]` rather than throwing. Individual array entries without a `columns`
 * array are filtered out rather than surfaced as broken rows — there's no
 * error state left in this panel for a user to see (see ux-design.md's
 * states matrix).
 *
 * Sorted by `updatedAt` descending (most recently updated first); an
 * entry with no `updatedAt` sorts as oldest, last in the list, rather than
 * crashing the comparator.
 *
 * Dev note: Tracker and Designer run on different Vite dev server ports
 * locally, which are different origins — so this always returns `[]`
 * during local dev even with both apps running. That's expected (the
 * empty state, AC3/AC8), not a bug to chase; only the shared-origin
 * production deploy (or a `#board=`/`?prefill=` link) can move a board
 * into Tracker locally.
 */
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

const MINUTE = 60 * 1000
const HOUR = 60 * MINUTE
const DAY = 24 * HOUR

/**
 * Small "updated 2 hours ago" formatter for a picker row's meta line.
 * Checked the rest of `src/` first — no existing relative-time helper to
 * reuse (`tracker.ts`'s `daysInColumn` computes a day count, not a
 * formatted string). Built on the native `Intl.RelativeTimeFormat` rather
 * than a hand-rolled unit table or a new npm dependency — it's already
 * available in every target browser/Node version this repo supports, and
 * it localizes correctly for all four locales (verified: en/es/be/ru all
 * resolve real `Intl.RelativeTimeFormat` data) without needing a fourth
 * set of hand-translated unit strings.
 */
export function formatRelativeTime(timestamp: number | undefined, locale: string = 'en', now: number = Date.now()): string {
  if (timestamp === undefined) return ''
  const rtf = new Intl.RelativeTimeFormat(locale, { numeric: 'auto' })
  const diff = timestamp - now
  const abs = Math.abs(diff)
  if (abs < HOUR) return rtf.format(Math.round(diff / MINUTE), 'minute')
  if (abs < DAY) return rtf.format(Math.round(diff / HOUR), 'hour')
  return rtf.format(Math.round(diff / DAY), 'day')
}

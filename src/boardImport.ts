import type { TrackerBoard } from './types'

/**
 * Reads the canonical board interchange format — full spec in
 * `BOARD_SCHEMA.md`, `agile-toolkit/.github` meta-repo; reference producer
 * is `kanban-designer/src/utils/boardExport.ts`. This app is consume-only:
 * it never designs a board, only imports one to run.
 */
export const BOARD_SCHEMA = 'agile-toolkit.kanban-board'

/**
 * Accepts the versioned `{schema, version, board}` envelope, or a bare
 * board object (every producer today — Improvement Board's `?prefill=`
 * sender predates the schema, and so does a hand-exported Kanban Designer
 * JSON file from before the envelope shipped). Normalizes into a
 * `TrackerBoard`: fills sensible defaults for anything missing, and always
 * stamps a fresh `updatedAt` since this is an import, not a save.
 */
export function unwrapBoardImport(data: unknown): TrackerBoard | null {
  if (!data || typeof data !== 'object') return null
  const obj = data as Record<string, unknown>
  const candidate = (obj.schema === BOARD_SCHEMA && obj.board && typeof obj.board === 'object')
    ? obj.board
    : obj
  const c = candidate as Partial<TrackerBoard>
  if (!Array.isArray(c.columns)) return null
  return {
    id: c.id ?? crypto.randomUUID(),
    name: c.name ?? 'Imported board',
    columns: c.columns,
    swimLanes: c.swimLanes ?? [],
    showWipWarnings: c.showWipWarnings ?? true,
    updatedAt: Date.now(),
  }
}

/** One-shot handoff from another suite app, e.g. a future "Open in Kanban Tracker" link. */
export function parsePrefillBoard(search: string): TrackerBoard | null {
  const raw = new URLSearchParams(search).get('prefill')
  if (!raw) return null
  try {
    return unwrapBoardImport(JSON.parse(raw))
  } catch {
    return null
  }
}

const HASH_PREFIX = 'board='

/** Same `#board=<base64>` share-link format Kanban Designer uses for its own links. */
export function parseBoardFromHash(hash: string): TrackerBoard | null {
  const h = hash.startsWith('#') ? hash.slice(1) : hash
  if (!h.startsWith(HASH_PREFIX)) return null
  try {
    return unwrapBoardImport(JSON.parse(decodeURIComponent(atob(h.slice(HASH_PREFIX.length)))))
  } catch {
    return null
  }
}

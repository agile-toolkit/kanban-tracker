import type { TrackerBoard } from './types'

export const BOARDS_KEY = 'kanban-tracker-boards'
export const CURRENT_KEY = 'kanban-tracker-current-id'
export const LAST_SESSION_KEY = 'kanban-tracker:lastSession'

function isTrackerBoardArray(value: unknown): value is TrackerBoard[] {
  return Array.isArray(value) && value.every(b => b !== null && typeof b === 'object' && typeof (b as TrackerBoard).id === 'string')
}

/** Guarded the same way every other suite app parses its own persisted list: a key of the wrong shape falls back to empty rather than throwing at first property access. */
export function loadBoards(): TrackerBoard[] {
  try {
    const raw = localStorage.getItem(BOARDS_KEY)
    if (!raw) return []
    const parsed: unknown = JSON.parse(raw)
    return isTrackerBoardArray(parsed) ? parsed : []
  } catch {
    return []
  }
}

export function saveBoards(boards: TrackerBoard[]) {
  localStorage.setItem(BOARDS_KEY, JSON.stringify(boards))
}

/** Written on every board change — the Dashboard's app card reads this for a live "last session" preview. */
export function writeLastSession(board: TrackerBoard, allBoards: TrackerBoard[]) {
  const cardCount = board.columns.reduce((sum, col) => sum + col.cards.length, 0)
  const doneLikeColumn = board.columns[board.columns.length - 1]
  localStorage.setItem(LAST_SESSION_KEY, JSON.stringify({
    boardName: board.name,
    columnCount: board.columns.length,
    cardCount,
    boardCount: allBoards.length,
    lastColumnName: doneLikeColumn?.name ?? '',
    lastColumnCount: doneLikeColumn?.cards.length ?? 0,
    updatedAt: new Date().toISOString(),
  }))
}

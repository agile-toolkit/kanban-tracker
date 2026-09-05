import type { TrackerBoard, TrackerColumn, TrackerCard } from './types'

function mapColumns(columns: TrackerColumn[], fn: (col: TrackerColumn) => TrackerColumn): TrackerColumn[] {
  return columns.map(fn)
}

/** Moves a card to another column, stamping `enteredColumnAt` so the aging badge resets. Top-level columns only — sub-columns aren't a tracking concept here. */
export function moveCard(board: TrackerBoard, cardId: string, fromColumnId: string, toColumnId: string): TrackerBoard {
  if (fromColumnId === toColumnId) return board
  const fromCol = board.columns.find(c => c.id === fromColumnId)
  const card = fromCol?.cards.find(c => c.id === cardId)
  if (!card) return board

  const movedCard: TrackerCard = { ...card, enteredColumnAt: new Date().toISOString() }
  return {
    ...board,
    columns: mapColumns(board.columns, col => {
      if (col.id === fromColumnId) return { ...col, cards: col.cards.filter(c => c.id !== cardId) }
      if (col.id === toColumnId) return { ...col, cards: [...col.cards, movedCard] }
      return col
    }),
    updatedAt: Date.now(),
  }
}

/** Applies `fn` to one card, leaving every other card/column untouched. Shared by every per-card mutator below. */
function mapCard(board: TrackerBoard, columnId: string, cardId: string, fn: (card: TrackerCard) => TrackerCard): TrackerBoard {
  return {
    ...board,
    columns: mapColumns(board.columns, col => {
      if (col.id !== columnId) return col
      return { ...col, cards: col.cards.map(card => card.id === cardId ? fn(card) : card) }
    }),
    updatedAt: Date.now(),
  }
}

export function toggleChecklistItem(board: TrackerBoard, columnId: string, cardId: string, itemId: string): TrackerBoard {
  return mapCard(board, columnId, cardId, card => card.checklist ? {
    ...card,
    checklist: card.checklist.map(item => item.id === itemId ? { ...item, done: !item.done } : item),
  } : card)
}

/** Sets or clears a card's due date and/or assignee. Pass `undefined` to clear a field; omit a key to leave it unchanged. */
export function updateCardFields(
  board: TrackerBoard, columnId: string, cardId: string,
  patch: Partial<Pick<TrackerCard, 'dueDate' | 'assignee'>>,
): TrackerBoard {
  return mapCard(board, columnId, cardId, card => ({ ...card, ...patch }))
}

export function addChecklistItem(board: TrackerBoard, columnId: string, cardId: string, text: string): TrackerBoard {
  const trimmed = text.trim()
  if (!trimmed) return board
  return mapCard(board, columnId, cardId, card => ({
    ...card,
    checklist: [...(card.checklist ?? []), { id: crypto.randomUUID(), text: trimmed, done: false }],
  }))
}

export function removeChecklistItem(board: TrackerBoard, columnId: string, cardId: string, itemId: string): TrackerBoard {
  return mapCard(board, columnId, cardId, card => ({
    ...card,
    checklist: card.checklist?.filter(item => item.id !== itemId),
  }))
}

/** Whole days since the card entered its current column. */
export function daysInColumn(card: TrackerCard, now: number = Date.now()): number {
  if (!card.enteredColumnAt) return 0
  const entered = new Date(card.enteredColumnAt).getTime()
  if (Number.isNaN(entered)) return 0
  return Math.max(0, Math.floor((now - entered) / (24 * 60 * 60 * 1000)))
}

export function isOverdue(card: TrackerCard, now: number = Date.now()): boolean {
  if (!card.dueDate) return false
  const due = new Date(card.dueDate).getTime()
  return !Number.isNaN(due) && due < now
}

export function checklistProgress(card: TrackerCard): { done: number; total: number } | null {
  if (!card.checklist || card.checklist.length === 0) return null
  return { done: card.checklist.filter(i => i.done).length, total: card.checklist.length }
}

export type WipStatus = 'ok' | 'over'

export function wipStatus(column: TrackerColumn): WipStatus {
  if (column.wipLimit == null) return 'ok'
  return column.cards.length > column.wipLimit ? 'over' : 'ok'
}

import { describe, it, expect } from 'vitest'
import type { TrackerBoard, TrackerCard } from './types'
import {
  moveCard, toggleChecklistItem, daysInColumn, isOverdue, checklistProgress, wipStatus,
  updateCardFields, addChecklistItem, removeChecklistItem,
} from './tracker'

function makeCard(overrides: Partial<TrackerCard> = {}): TrackerCard {
  return { id: 'c1', title: 'Card 1', ...overrides }
}

function makeBoard(): TrackerBoard {
  return {
    id: 'b1',
    name: 'Board',
    swimLanes: [],
    showWipWarnings: true,
    columns: [
      { id: 'todo', name: 'To do', wipLimit: null, cards: [makeCard()] },
      { id: 'doing', name: 'Doing', wipLimit: 2, cards: [] },
    ],
  }
}

describe('moveCard', () => {
  it('moves a card from one column to another', () => {
    const board = makeBoard()
    const result = moveCard(board, 'c1', 'todo', 'doing')
    expect(result.columns[0].cards).toHaveLength(0)
    expect(result.columns[1].cards).toHaveLength(1)
    expect(result.columns[1].cards[0].id).toBe('c1')
  })

  it('stamps enteredColumnAt on the moved card', () => {
    const board = makeBoard()
    const result = moveCard(board, 'c1', 'todo', 'doing')
    expect(result.columns[1].cards[0].enteredColumnAt).toBeDefined()
  })

  it('is a no-op when moving to the same column', () => {
    const board = makeBoard()
    const result = moveCard(board, 'c1', 'todo', 'todo')
    expect(result).toBe(board)
  })

  it('is a no-op when the card is not found', () => {
    const board = makeBoard()
    const result = moveCard(board, 'missing', 'todo', 'doing')
    expect(result).toBe(board)
  })

  it('does not mutate the input board', () => {
    const board = makeBoard()
    moveCard(board, 'c1', 'todo', 'doing')
    expect(board.columns[0].cards).toHaveLength(1)
  })
})

describe('toggleChecklistItem', () => {
  it('flips a checklist item done state', () => {
    const board = makeBoard()
    board.columns[0].cards[0].checklist = [{ id: 'i1', text: 'Step', done: false }]
    const result = toggleChecklistItem(board, 'todo', 'c1', 'i1')
    expect(result.columns[0].cards[0].checklist![0].done).toBe(true)
    const result2 = toggleChecklistItem(result, 'todo', 'c1', 'i1')
    expect(result2.columns[0].cards[0].checklist![0].done).toBe(false)
  })
})

describe('updateCardFields', () => {
  it('sets a due date', () => {
    const board = makeBoard()
    const result = updateCardFields(board, 'todo', 'c1', { dueDate: '2030-01-01' })
    expect(result.columns[0].cards[0].dueDate).toBe('2030-01-01')
  })

  it('sets an assignee without touching due date', () => {
    const board = makeBoard()
    board.columns[0].cards[0].dueDate = '2030-01-01'
    const result = updateCardFields(board, 'todo', 'c1', { assignee: 'Alex' })
    expect(result.columns[0].cards[0].assignee).toBe('Alex')
    expect(result.columns[0].cards[0].dueDate).toBe('2030-01-01')
  })

  it('clears a field when set to undefined', () => {
    const board = makeBoard()
    board.columns[0].cards[0].dueDate = '2030-01-01'
    const result = updateCardFields(board, 'todo', 'c1', { dueDate: undefined })
    expect(result.columns[0].cards[0].dueDate).toBeUndefined()
  })

  it('does not mutate the input board', () => {
    const board = makeBoard()
    updateCardFields(board, 'todo', 'c1', { assignee: 'Alex' })
    expect(board.columns[0].cards[0].assignee).toBeUndefined()
  })
})

describe('addChecklistItem', () => {
  it('appends a new item with a generated id', () => {
    const board = makeBoard()
    const result = addChecklistItem(board, 'todo', 'c1', 'Write tests')
    expect(result.columns[0].cards[0].checklist).toHaveLength(1)
    expect(result.columns[0].cards[0].checklist![0]).toMatchObject({ text: 'Write tests', done: false })
    expect(typeof result.columns[0].cards[0].checklist![0].id).toBe('string')
  })

  it('appends onto an existing checklist', () => {
    const board = makeBoard()
    board.columns[0].cards[0].checklist = [{ id: 'i1', text: 'First', done: true }]
    const result = addChecklistItem(board, 'todo', 'c1', 'Second')
    expect(result.columns[0].cards[0].checklist).toHaveLength(2)
  })

  it('trims whitespace and ignores empty text', () => {
    const board = makeBoard()
    const result = addChecklistItem(board, 'todo', 'c1', '   ')
    expect(result).toBe(board)
    const result2 = addChecklistItem(board, 'todo', 'c1', '  Trimmed  ')
    expect(result2.columns[0].cards[0].checklist![0].text).toBe('Trimmed')
  })
})

describe('removeChecklistItem', () => {
  it('removes the matching item', () => {
    const board = makeBoard()
    board.columns[0].cards[0].checklist = [
      { id: 'i1', text: 'Keep', done: false },
      { id: 'i2', text: 'Remove', done: false },
    ]
    const result = removeChecklistItem(board, 'todo', 'c1', 'i2')
    expect(result.columns[0].cards[0].checklist).toEqual([{ id: 'i1', text: 'Keep', done: false }])
  })

  it('is a no-op when there is no checklist', () => {
    const board = makeBoard()
    const result = removeChecklistItem(board, 'todo', 'c1', 'missing')
    expect(result.columns[0].cards[0].checklist).toBeUndefined()
  })
})

describe('daysInColumn', () => {
  it('returns 0 when enteredColumnAt is absent', () => {
    expect(daysInColumn(makeCard())).toBe(0)
  })

  it('computes whole days elapsed', () => {
    const threeDaysAgo = new Date(Date.now() - 3 * 24 * 60 * 60 * 1000 - 1000).toISOString()
    expect(daysInColumn(makeCard({ enteredColumnAt: threeDaysAgo }))).toBe(3)
  })
})

describe('isOverdue', () => {
  it('is false with no due date', () => {
    expect(isOverdue(makeCard())).toBe(false)
  })

  it('is true for a past due date', () => {
    expect(isOverdue(makeCard({ dueDate: '2020-01-01' }))).toBe(true)
  })

  it('is false for a future due date', () => {
    expect(isOverdue(makeCard({ dueDate: '2099-01-01' }))).toBe(false)
  })
})

describe('checklistProgress', () => {
  it('returns null with no checklist', () => {
    expect(checklistProgress(makeCard())).toBeNull()
  })

  it('counts done vs total', () => {
    const card = makeCard({ checklist: [{ id: '1', text: 'a', done: true }, { id: '2', text: 'b', done: false }] })
    expect(checklistProgress(card)).toEqual({ done: 1, total: 2 })
  })
})

describe('wipStatus', () => {
  it('is ok with no limit', () => {
    expect(wipStatus({ id: 'x', name: 'X', wipLimit: null, cards: [makeCard(), makeCard()] })).toBe('ok')
  })

  it('is ok at or under the limit', () => {
    expect(wipStatus({ id: 'x', name: 'X', wipLimit: 2, cards: [makeCard(), makeCard()] })).toBe('ok')
  })

  it('is over when exceeding the limit', () => {
    expect(wipStatus({ id: 'x', name: 'X', wipLimit: 1, cards: [makeCard(), makeCard()] })).toBe('over')
  })
})

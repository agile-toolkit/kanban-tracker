import { describe, it, expect } from 'vitest'
import type { TrackerBoard, TrackerCard } from './types'
import { moveCard, toggleChecklistItem, daysInColumn, isOverdue, checklistProgress, wipStatus } from './tracker'

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

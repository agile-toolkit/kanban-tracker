import { describe, it, expect, beforeEach } from 'vitest'
import { loadDesignerBoards } from './designerImport'
import { unwrapBoardImport } from './boardImport'

const DESIGNER_BOARDS_KEY = 'kanban-designer-boards'

const designerBoard = (overrides: Record<string, unknown> = {}) => ({
  id: 'd1',
  name: 'Sprint 14 Board',
  columns: [{ id: 'todo', name: 'To do', wipLimit: null, cards: [{ id: 'c1' }, { id: 'c2' }] }],
  swimLanes: [],
  showWipWarnings: true,
  updatedAt: Date.now(),
  ...overrides,
})

beforeEach(() => {
  localStorage.clear()
})

describe('loadDesignerBoards', () => {
  it('returns [] when kanban-designer-boards is absent from localStorage', () => {
    expect(loadDesignerBoards()).toEqual([])
  })

  it('returns [] when kanban-designer-boards is an empty array', () => {
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([]))
    expect(loadDesignerBoards()).toEqual([])
  })

  it('returns [] and does not throw when kanban-designer-boards is malformed JSON', () => {
    localStorage.setItem(DESIGNER_BOARDS_KEY, '{not valid json')
    expect(() => loadDesignerBoards()).not.toThrow()
    expect(loadDesignerBoards()).toEqual([])
  })

  it('returns [] and does not throw when kanban-designer-boards is valid JSON but not an array (e.g. an object)', () => {
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify({ id: 'not-an-array' }))
    expect(() => loadDesignerBoards()).not.toThrow()
    expect(loadDesignerBoards()).toEqual([])
  })

  it('filters out entries with no columns array rather than throwing', () => {
    const bad = { id: 'bad', name: 'No columns here' }
    const good = designerBoard({ id: 'good' })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([bad, good, null, 'nope', 42]))
    const result = loadDesignerBoards()
    expect(result).toHaveLength(1)
    expect(result[0].id).toBe('good')
  })

  it('returns well-formed entries with id, name, columns, updatedAt preserved', () => {
    const board = designerBoard({ id: 'd42', name: 'Onboarding Flow', updatedAt: 12345 })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([board]))
    const [entry] = loadDesignerBoards()
    expect(entry.id).toBe('d42')
    expect(entry.name).toBe('Onboarding Flow')
    expect(entry.columns).toEqual(board.columns)
    expect(entry.updatedAt).toBe(12345)
  })

  it('sorts entries by updatedAt descending (most recently updated first)', () => {
    const oldest = designerBoard({ id: 'oldest', updatedAt: 1000 })
    const newest = designerBoard({ id: 'newest', updatedAt: 3000 })
    const middle = designerBoard({ id: 'middle', updatedAt: 2000 })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([oldest, newest, middle]))
    const result = loadDesignerBoards()
    expect(result.map(b => b.id)).toEqual(['newest', 'middle', 'oldest'])
  })

  it('treats a missing updatedAt as oldest (sorts last), not as a crash', () => {
    const noDate = designerBoard({ id: 'no-date', updatedAt: undefined })
    delete (noDate as Record<string, unknown>).updatedAt
    const dated = designerBoard({ id: 'dated', updatedAt: 500 })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([noDate, dated]))
    expect(() => loadDesignerBoards()).not.toThrow()
    const result = loadDesignerBoards()
    expect(result.map(b => b.id)).toEqual(['dated', 'no-date'])
  })
})

describe('Designer board picker → import (integration)', () => {
  it('picking a Designer board entry produces a TrackerBoard via unwrapBoardImport, same normalization as file/link import', () => {
    const board = designerBoard({ id: 'pick-me', name: 'Sprint 14 Board' })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([board]))
    const [entry] = loadDesignerBoards()
    const imported = unwrapBoardImport(entry)
    expect(imported).not.toBeNull()
    expect(imported!.id).toBe('pick-me')
    expect(imported!.name).toBe('Sprint 14 Board')
    expect(imported!.columns).toEqual(board.columns)
  })

  it('picking the same Designer board twice produces two independent TrackerBoard entries (no dedup, per spec AC5)', () => {
    const board = designerBoard({ id: 'repeat' })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([board]))
    const [entry] = loadDesignerBoards()
    const first = unwrapBoardImport(entry)
    const second = unwrapBoardImport(entry)
    expect(first).not.toBeNull()
    expect(second).not.toBeNull()
    expect(first).not.toBe(second)
    expect(first!.id).toBe('repeat')
    expect(second!.id).toBe('repeat')
    // Two separate objects, each independently importable into
    // Tracker's board list (which is an array, not keyed by id) — no
    // dedup guard blocks importing the same entry twice.
    expect(first).not.toBe(second)
  })

  it('a Designer board carrying Track-mode fields (dueDate/assignee/checklist/enteredColumnAt) preserves them through import, same as today\'s other import paths', () => {
    const board = designerBoard({
      id: 'track-mode',
      columns: [{
        id: 'todo',
        name: 'To do',
        wipLimit: null,
        cards: [{
          id: 'c1',
          title: 'Ship the feature',
          dueDate: '2026-09-10',
          assignee: 'Alex',
          enteredColumnAt: '2026-09-01T00:00:00.000Z',
          checklist: [{ id: 'ck1', text: 'Write tests', done: false }],
        }],
      }],
    })
    localStorage.setItem(DESIGNER_BOARDS_KEY, JSON.stringify([board]))
    const [entry] = loadDesignerBoards()
    const imported = unwrapBoardImport(entry)
    expect(imported).not.toBeNull()
    const card = imported!.columns[0].cards[0] as unknown as Record<string, unknown>
    expect(card.dueDate).toBe('2026-09-10')
    expect(card.assignee).toBe('Alex')
    expect(card.enteredColumnAt).toBe('2026-09-01T00:00:00.000Z')
    expect(card.checklist).toEqual([{ id: 'ck1', text: 'Write tests', done: false }])
  })
})

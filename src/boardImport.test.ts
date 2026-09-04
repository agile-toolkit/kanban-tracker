import { describe, it, expect } from 'vitest'
import { unwrapBoardImport, parsePrefillBoard, parseBoardFromHash, BOARD_SCHEMA } from './boardImport'

const rawBoard = {
  id: 'b1',
  name: 'My Board',
  columns: [{ id: 'todo', name: 'To do', wipLimit: null, cards: [] }],
  swimLanes: [],
  showWipWarnings: false,
}

describe('unwrapBoardImport', () => {
  it('accepts the versioned envelope', () => {
    const result = unwrapBoardImport({ schema: BOARD_SCHEMA, version: 1, board: rawBoard })
    expect(result?.id).toBe('b1')
    expect(result?.columns).toEqual(rawBoard.columns)
  })

  it('accepts a bare board object (every producer today)', () => {
    const result = unwrapBoardImport(rawBoard)
    expect(result?.name).toBe('My Board')
  })

  it('fills in defaults for a minimal payload', () => {
    const result = unwrapBoardImport({ columns: [] })
    expect(result).not.toBeNull()
    expect(result!.name).toBe('Imported board')
    expect(result!.swimLanes).toEqual([])
    expect(result!.showWipWarnings).toBe(true)
    expect(typeof result!.id).toBe('string')
  })

  it('returns null for non board-shaped input', () => {
    expect(unwrapBoardImport(null)).toBeNull()
    expect(unwrapBoardImport('nope')).toBeNull()
    expect(unwrapBoardImport({ foo: 'bar' })).toBeNull()
  })

  it('stamps a fresh updatedAt', () => {
    const before = Date.now()
    const result = unwrapBoardImport(rawBoard)
    expect(result!.updatedAt).toBeGreaterThanOrEqual(before)
  })
})

describe('parsePrefillBoard', () => {
  it('returns null when prefill is absent', () => {
    expect(parsePrefillBoard('')).toBeNull()
  })

  it('parses a bare board from ?prefill=', () => {
    const search = `?prefill=${encodeURIComponent(JSON.stringify(rawBoard))}`
    expect(parsePrefillBoard(search)?.id).toBe('b1')
  })

  it('returns null on malformed JSON', () => {
    expect(parsePrefillBoard('?prefill=not-json')).toBeNull()
  })
})

describe('parseBoardFromHash', () => {
  it('returns null without the board= prefix', () => {
    expect(parseBoardFromHash('#somethingelse')).toBeNull()
  })

  it('parses a base64-encoded board', () => {
    const encoded = btoa(encodeURIComponent(JSON.stringify(rawBoard)))
    expect(parseBoardFromHash(`#board=${encoded}`)?.id).toBe('b1')
  })
})

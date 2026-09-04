import { describe, it, expect } from 'vitest'
import en from './en.json'
import es from './es.json'
import be from './be.json'
import ru from './ru.json'

describe('locale files', () => {
  const locales = { en, es, be, ru }

  it('are all valid JSON objects', () => {
    for (const [name, dict] of Object.entries(locales)) {
      expect(typeof dict, name).toBe('object')
    }
  })

  it('have matching key sets across locales', () => {
    const enKeys = Object.keys(en).sort()
    for (const [name, dict] of Object.entries(locales)) {
      expect(Object.keys(dict).sort(), name).toEqual(enKeys)
    }
  })
})

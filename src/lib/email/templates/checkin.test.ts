import { describe, it, expect } from 'vitest'
import { checkInEmail } from './checkin'

describe('checkInEmail', () => {
  it('returns an HTML string containing the user name', () => {
    const html = checkInEmail('Sam', 'http://localhost:3000/checkin/abc123')
    expect(typeof html).toBe('string')
    expect(html).toContain('Sam')
  })

  it('returns an HTML string containing the check-in URL', () => {
    const url = 'http://localhost:3000/checkin/tok-xyz'
    const html = checkInEmail('Sam', url)
    expect(html).toContain(url)
  })

  it('returns a string with HTML structure', () => {
    const html = checkInEmail('Morgan', 'http://localhost:3000/checkin/tok')
    expect(html).toMatch(/<html/i)
  })
})

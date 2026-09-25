import { describe, it, expect } from 'vitest'
import { welcomeEmail } from './welcome'

describe('welcomeEmail', () => {
  it('returns an HTML string containing the user name', () => {
    const html = welcomeEmail('Alex')
    expect(typeof html).toBe('string')
    expect(html).toContain('Alex')
  })

  it('returns a string with HTML structure', () => {
    const html = welcomeEmail('Jordan')
    expect(html).toMatch(/<html/i)
    expect(html).toContain('Jordan')
  })
})

describe('welcomeEmail escaping', () => {
  it('escapes the name', () => {
    expect(welcomeEmail('<i>Sam</i>')).toContain('&lt;i&gt;Sam&lt;/i&gt;')
  })
})

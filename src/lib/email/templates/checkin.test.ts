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

describe('checkInEmail morning extras', () => {
  it('includes the morning prompt when given', () => {
    const html = checkInEmail('Sam', 'http://x/checkin/t', {
      prompt: 'What would make today kind?',
      manageUrl: 'http://x/',
    })
    expect(html).toContain('What would make today kind?')
    expect(html).toContain('href="http://x/"')
  })

  it('escapes names and prompts so they cannot inject HTML', () => {
    const html = checkInEmail('<b>Sam</b>', 'http://x/checkin/t', { prompt: '<script>x</script>' })
    expect(html).not.toContain('<b>Sam</b>')
    expect(html).not.toContain('<script>')
    expect(html).toContain('&lt;b&gt;Sam&lt;/b&gt;')
  })
})

import { describe, expect, it } from 'vitest'
import { isValidTimeZone, localTime } from './localTime'

describe('localTime', () => {
  it('uses the zone, including British Summer Time', () => {
    expect(localTime(new Date('2026-09-25T06:30:00Z'), 'Europe/London')).toEqual({
      day: '2026-09-25',
      hour: 7,
    })
  })

  it('rolls the calendar day with the zone, not UTC', () => {
    expect(localTime(new Date('2026-09-25T22:30:00Z'), 'Asia/Tokyo')).toEqual({
      day: '2026-09-26',
      hour: 7,
    })
  })

  it('falls back to London for an unknown zone', () => {
    expect(localTime(new Date('2026-01-10T07:30:00Z'), 'Nowhere/Land').hour).toBe(7)
  })
})

describe('isValidTimeZone', () => {
  it('accepts IANA zones and rejects anything else', () => {
    expect(isValidTimeZone('Europe/London')).toBe(true)
    expect(isValidTimeZone('Nowhere/Land')).toBe(false)
    expect(isValidTimeZone('')).toBe(false)
  })
})

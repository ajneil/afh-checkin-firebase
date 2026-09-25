import { describe, expect, it } from 'vitest'
import { authErrorMessage } from './authErrorMessage'

describe('authErrorMessage', () => {
  it('is silent when the person closes the Google popup', () => {
    expect(authErrorMessage({ code: 'auth/popup-closed-by-user' })).toBeNull()
    expect(authErrorMessage({ code: 'auth/cancelled-popup-request' })).toBeNull()
  })
  it.each([
    ['auth/invalid-email', /valid email/i],
    ['auth/popup-blocked', /pop-up/i],
    ['auth/unauthorized-domain', /isn.t set up for this site/i],
    ['auth/operation-not-allowed', /isn.t switched on/i],
    ['auth/invalid-action-code', /expired or has already been used/i],
    ['auth/expired-action-code', /expired or has already been used/i],
    ['auth/network-request-failed', /connection/i],
    ['auth/account-exists-with-different-credential', /other sign-in option/i],
  ])('explains %s', (code, message) => {
    expect(authErrorMessage({ code })).toMatch(message)
  })
  it('falls back to a generic message', () => {
    expect(authErrorMessage(new Error('boom'))).toMatch(/try again/i)
  })
})

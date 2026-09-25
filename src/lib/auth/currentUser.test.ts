import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeFirestore } from '@/test/fakeFirestore'

let fake: ReturnType<typeof fakeFirestore>
const verifySessionCookie = vi.fn()
vi.mock('@/lib/db/firestore', () => ({
  usersCollection: () => fake.db.collection('users'),
  adminAuth: () => ({ verifySessionCookie }),
}))
let cookie: string | undefined
vi.mock('next/headers', () => ({
  cookies: async () => ({ get: () => (cookie ? { value: cookie } : undefined) }),
}))

const { getCurrentUser } = await import('./currentUser')

describe('getCurrentUser', () => {
  beforeEach(async () => {
    fake = fakeFirestore()
    cookie = 'session'
    verifySessionCookie.mockResolvedValue({ email: 'Alex@example.com' })
    await fake.db.doc('users/alex@example.com').create({
      name: 'Alex',
      email: 'alex@example.com',
      timeZone: 'Europe/London',
      morningEmails: true,
    })
  })

  it('returns the signed-in account', async () => {
    expect(await getCurrentUser()).toEqual({
      name: 'Alex',
      email: 'alex@example.com',
      timeZone: 'Europe/London',
      morningEmails: true,
    })
    expect(verifySessionCookie).toHaveBeenCalledWith('session', true)
  })

  it('is null without a cookie', async () => {
    cookie = undefined
    expect(await getCurrentUser()).toBeNull()
  })

  it('is null for an expired or revoked session', async () => {
    verifySessionCookie.mockRejectedValue(new Error('revoked'))
    expect(await getCurrentUser()).toBeNull()
  })

  it('is null when the account no longer exists', async () => {
    fake.store.clear()
    expect(await getCurrentUser()).toBeNull()
  })
})

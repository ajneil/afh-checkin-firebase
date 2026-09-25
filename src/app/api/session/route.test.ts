import { beforeEach, describe, expect, it, vi } from 'vitest'
import { fakeFirestore } from '@/test/fakeFirestore'

let fake: ReturnType<typeof fakeFirestore>
const verifyIdToken = vi.fn()
const createSessionCookie = vi.fn(async () => 'session-cookie')
vi.mock('@/lib/db/firestore', () => ({
  usersCollection: () => fake.db.collection('users'),
  adminAuth: () => ({ verifyIdToken, createSessionCookie }),
}))

const cookieJar = { set: vi.fn(), delete: vi.fn() }
vi.mock('next/headers', () => ({ cookies: async () => cookieJar }))

const sendEmail = vi.fn(async () => {})
vi.mock('@/lib/email/mailer', () => ({ sendEmail }))

const { POST, DELETE } = await import('./route')

const now = () => Math.floor(Date.now() / 1000)
const claims = (over: Record<string, unknown> = {}) => ({
  uid: 'uid-1',
  email: 'Alex@Example.com',
  email_verified: true,
  name: 'Alex Google',
  auth_time: now(),
  ...over,
})
const post = (body: unknown) =>
  POST(
    new Request('http://localhost/api/session', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify(body),
    }) as never
  )

describe('POST /api/session', () => {
  beforeEach(() => {
    fake = fakeFirestore()
    vi.clearAllMocks()
    verifyIdToken.mockResolvedValue(claims())
  })

  it('creates the account on first sign-in, keyed by lowercase email', async () => {
    const res = await post({ idToken: 't', name: 'Alex', timeZone: 'Europe/London' })
    expect(res.status).toBe(200)
    expect(await res.json()).toEqual({ success: true, isNew: true })
    expect(fake.store.get('users/alex@example.com')).toMatchObject({
      name: 'Alex',
      email: 'alex@example.com',
      uid: 'uid-1',
      timeZone: 'Europe/London',
      morningEmails: true,
    })
  })

  it('uses the Google display name when no name is typed', async () => {
    await post({ idToken: 't', timeZone: 'Europe/London' })
    expect(fake.store.get('users/alex@example.com')).toMatchObject({ name: 'Alex Google' })
  })

  it('sends a welcome email only for new accounts', async () => {
    await post({ idToken: 't', name: 'Alex', timeZone: 'Europe/London' })
    await post({ idToken: 't', name: 'Alex', timeZone: 'Europe/London' })
    expect(sendEmail).toHaveBeenCalledOnce()
    expect(sendEmail).toHaveBeenCalledWith('alex@example.com', expect.any(String), expect.stringContaining('Alex'))
  })

  it('keeps existing accounts (from the old sign-up) and links them on sign-in', async () => {
    await fake.db.doc('users/alex@example.com').create({ name: 'Original', email: 'alex@example.com' })
    const res = await post({ idToken: 't', name: 'New', timeZone: 'Asia/Tokyo' })
    expect(await res.json()).toEqual({ success: true, isNew: false })
    expect(fake.store.get('users/alex@example.com')).toMatchObject({
      name: 'Original',
      uid: 'uid-1',
      timeZone: 'Asia/Tokyo',
      morningEmails: true,
    })
  })

  it('keeps an existing morning email preference', async () => {
    await fake.db.doc('users/alex@example.com').create({ name: 'A', email: 'alex@example.com', morningEmails: false })
    await post({ idToken: 't', timeZone: 'Europe/London' })
    expect(fake.store.get('users/alex@example.com')).toMatchObject({ morningEmails: false })
  })

  it('sets an httpOnly session cookie', async () => {
    await post({ idToken: 't', timeZone: 'Europe/London' })
    expect(cookieJar.set).toHaveBeenCalledWith(
      '__session',
      'session-cookie',
      expect.objectContaining({ httpOnly: true, sameSite: 'lax', path: '/' })
    )
  })

  it('rejects an invalid token without touching the database', async () => {
    verifyIdToken.mockRejectedValue(new Error('bad token'))
    const res = await post({ idToken: 'forged', timeZone: 'Europe/London' })
    expect(res.status).toBe(401)
    expect(fake.store.size).toBe(0)
  })

  it('rejects unverified email addresses', async () => {
    verifyIdToken.mockResolvedValue(claims({ email_verified: false }))
    expect((await post({ idToken: 't' })).status).toBe(401)
  })

  it('rejects stale sign-ins so old tokens cannot mint sessions', async () => {
    verifyIdToken.mockResolvedValue(claims({ auth_time: now() - 10 * 60 }))
    expect((await post({ idToken: 't' })).status).toBe(401)
  })

  it('ignores an invalid time zone', async () => {
    await post({ idToken: 't', timeZone: 'Mars/Olympus' })
    expect(fake.store.get('users/alex@example.com')).toMatchObject({ timeZone: 'Europe/London' })
  })

  it('still signs in when the welcome email fails', async () => {
    sendEmail.mockRejectedValueOnce(new Error('SMTP down'))
    expect((await post({ idToken: 't' })).status).toBe(200)
  })

  it('returns 400 without an ID token', async () => {
    expect((await post({})).status).toBe(400)
  })
})

describe('DELETE /api/session', () => {
  it('clears the session cookie', async () => {
    await DELETE()
    expect(cookieJar.delete).toHaveBeenCalledWith('__session')
  })
})
